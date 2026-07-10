import "server-only";

import { and, eq, inArray, isNotNull, isNull, ne } from "drizzle-orm";

import { db } from "@/db";
import { clients, payments, projectAssignments, projects } from "@/db/schema";
import { getClientPaymentNotificationUrl } from "@/features/notifications/notification-links";
import { createNotificationsForRecipients } from "@/features/notifications/notification-service";
import { formatCurrencyFromCents } from "@/lib/format";

const DEFAULT_DUE_WINDOW_DAYS = 3;

type PaymentNotificationKind = "payment_due" | "payment_overdue";

type PaymentNotificationCandidate = {
  paymentId: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  recipientProfileIds: string[];
};

function normalizeDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateOnlyDifferenceInDays(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00.000Z`);
  const to = new Date(`${toDate}T00:00:00.000Z`);

  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDueDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function readPositiveIntegerEnv(
  key: string,
  fallback: number,
  options?: {
    max?: number;
    min?: number;
  },
) {
  const rawValue = process.env[key];

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${key} must be a positive integer.`);
  }

  if (options?.min && parsed < options.min) {
    throw new Error(
      `Environment variable ${key} must be at least ${options.min}.`,
    );
  }

  if (options?.max && parsed > options.max) {
    throw new Error(
      `Environment variable ${key} must be at most ${options.max}.`,
    );
  }

  return parsed;
}

export function getPaymentNotificationDueWindowDays() {
  return readPositiveIntegerEnv(
    "NOTIFICATION_PAYMENT_DUE_WINDOW_DAYS",
    DEFAULT_DUE_WINDOW_DAYS,
    {
      min: 1,
      max: 30,
    },
  );
}

export function getNotificationCronSecret() {
  const configuredValue =
    process.env.NOTIFICATIONS_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();

  return configuredValue && configuredValue.length > 0 ? configuredValue : null;
}

export function getPaymentNotificationKind(input: {
  dueDate: string;
  dueWindowDays: number;
  today: Date;
}): PaymentNotificationKind | null {
  const todayDate = normalizeDateOnly(input.today);
  const daysUntilDue = getDateOnlyDifferenceInDays(todayDate, input.dueDate);

  if (daysUntilDue < 0) {
    return "payment_overdue";
  }

  if (daysUntilDue <= input.dueWindowDays) {
    return "payment_due";
  }

  return null;
}

export function buildPaymentNotificationDedupeKey(input: {
  kind: PaymentNotificationKind;
  paymentId: string;
  dueDate: string;
}) {
  return `${input.kind}:${input.paymentId}:${input.dueDate}`;
}

function buildPaymentNotificationContent(
  candidate: PaymentNotificationCandidate,
  kind: PaymentNotificationKind,
) {
  const amountLabel = formatCurrencyFromCents(
    candidate.amountCents,
    candidate.currency,
  );
  const dueDateLabel = formatDueDateLabel(candidate.dueDate);

  if (kind === "payment_overdue") {
    return {
      title: `Payment overdue for ${candidate.projectName}`,
      message: `${amountLabel} is overdue since ${dueDateLabel}.`,
    };
  }

  return {
    title: `Payment due soon for ${candidate.projectName}`,
    message: `${amountLabel} is due on ${dueDateLabel}.`,
  };
}

export async function createPaymentNotificationsFromCandidates(
  candidates: PaymentNotificationCandidate[],
  options?: {
    createNotifications?: typeof createNotificationsForRecipients;
    dueWindowDays?: number;
    today?: Date;
  },
) {
  const createNotifications =
    options?.createNotifications ?? createNotificationsForRecipients;
  const dueWindowDays =
    options?.dueWindowDays ?? getPaymentNotificationDueWindowDays();
  const today = options?.today ?? new Date();

  let dueNotificationsCreated = 0;
  let overdueNotificationsCreated = 0;

  for (const candidate of candidates) {
    const kind = getPaymentNotificationKind({
      dueDate: candidate.dueDate,
      dueWindowDays,
      today,
    });

    if (!kind || candidate.recipientProfileIds.length === 0) {
      continue;
    }

    const content = buildPaymentNotificationContent(candidate, kind);
    const result = await createNotifications({
      workspaceId: candidate.workspaceId,
      recipientProfileIds: candidate.recipientProfileIds,
      actorProfileId: null,
      projectId: candidate.projectId,
      type: kind,
      title: content.title,
      message: content.message,
      entityType: "payment",
      entityId: candidate.paymentId,
      actionUrl: getClientPaymentNotificationUrl(candidate.projectId),
      dedupeKey: buildPaymentNotificationDedupeKey({
        kind,
        paymentId: candidate.paymentId,
        dueDate: candidate.dueDate,
      }),
      skipActorRecipient: false,
    });

    if (kind === "payment_due") {
      dueNotificationsCreated += result.insertedCount;
      continue;
    }

    overdueNotificationsCreated += result.insertedCount;
  }

  return {
    dueNotificationsCreated,
    overdueNotificationsCreated,
  };
}

async function getPaymentNotificationCandidates() {
  const rows = await db
    .select({
      paymentId: payments.id,
      workspaceId: payments.workspaceId,
      projectId: payments.projectId,
      projectName: projects.name,
      amountCents: payments.amountCents,
      currency: payments.currency,
      dueDate: payments.dueDate,
      recipientProfileId: clients.profileId,
    })
    .from(payments)
    .innerJoin(projects, eq(payments.projectId, projects.id))
    .innerJoin(
      projectAssignments,
      eq(projectAssignments.projectId, payments.projectId),
    )
    .innerJoin(clients, eq(projectAssignments.clientId, clients.id))
    .where(
      and(
        inArray(payments.status, ["unpaid", "partial", "overdue"]),
        isNotNull(payments.dueDate),
        isNull(payments.deletedAt),
        eq(projects.workspaceId, payments.workspaceId),
        ne(projects.status, "archived"),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
        eq(projectAssignments.workspaceId, payments.workspaceId),
        eq(clients.workspaceId, payments.workspaceId),
        isNotNull(clients.profileId),
        eq(clients.status, "active"),
        isNull(clients.archivedAt),
        isNull(clients.deletedAt),
      ),
    );

  const candidateMap = new Map<string, PaymentNotificationCandidate>();

  for (const row of rows) {
    if (!row.dueDate || !row.recipientProfileId) {
      continue;
    }

    const existing = candidateMap.get(row.paymentId);

    if (existing) {
      if (!existing.recipientProfileIds.includes(row.recipientProfileId)) {
        existing.recipientProfileIds.push(row.recipientProfileId);
      }
      continue;
    }

    candidateMap.set(row.paymentId, {
      paymentId: row.paymentId,
      workspaceId: row.workspaceId,
      projectId: row.projectId,
      projectName: row.projectName,
      amountCents: row.amountCents,
      currency: row.currency,
      dueDate: row.dueDate,
      recipientProfileIds: [row.recipientProfileId],
    });
  }

  return Array.from(candidateMap.values());
}

export async function scanAndCreatePaymentNotifications(options?: {
  dueWindowDays?: number;
  today?: Date;
}) {
  const candidates = await getPaymentNotificationCandidates();
  const created = await createPaymentNotificationsFromCandidates(
    candidates,
    options,
  );

  return {
    candidateCount: candidates.length,
    ...created,
  };
}
