import "server-only";

import {
  CheckCircle2,
  CreditCard,
  FolderKanban,
  MessageSquare,
  PlusCircle,
  Send,
  Upload,
  Users,
} from "lucide-react";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  ne,
  sum,
} from "drizzle-orm";

import { db } from "@/db";
import {
  approvals,
  clients,
  feedback,
  milestones,
  payments,
  projectAssignments,
  projectUpdates,
  projects,
} from "@/db/schema";
import type {
  ActivityType,
  AdminDashboardData,
  DashboardActivity,
  DashboardApproval,
  DashboardFeedback,
  DashboardMetric,
  DashboardPayment,
  DashboardProject,
  DashboardProjectUpdate,
  DashboardQuickAction,
  PaymentStatus,
  ProjectStatus,
} from "@/features/admin/dashboard/types";
import { formatCurrencyFromCents } from "@/lib/format";
import { requireRole } from "@/lib/supabase/auth";

type ProjectSummaryRow = {
  id: string;
  name: string;
  status: string;
  progress: number;
  deadline: string | null;
  updatedAt: Date | string;
};

const activeProjectStatuses = [
  "active",
  "in_progress",
  "waiting_feedback",
] as const;

const completedMilestoneStatuses = ["approved", "completed"] as const;
const outstandingPaymentStatuses = ["unpaid", "partial", "overdue"] as const;

const adminDashboardQuickActions: DashboardQuickAction[] = [
  {
    title: "Create project",
    description: "Start a new delivery workspace for a client.",
    href: "/admin/projects/new",
    icon: PlusCircle,
  },
  {
    title: "Add client",
    description: "Save client details and prepare account access.",
    href: "/admin/clients/new",
    icon: Users,
  },
  {
    title: "Review files",
    description: "Open projects and check the latest uploaded files.",
    href: "/admin/projects",
    icon: Upload,
  },
  {
    title: "Send update",
    description: "Post a clear progress note to the right project.",
    href: "/admin/projects",
    icon: Send,
  },
];

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function getSafeProjectStatus(status: string): ProjectStatus {
  if (
    status === "active" ||
    status === "in_progress" ||
    status === "waiting_feedback" ||
    status === "completed"
  ) {
    return status;
  }

  return "active";
}

function getDerivedProjectPaymentStatus(
  projectPayments: Array<{ status: PaymentStatus }>,
): PaymentStatus {
  const activePayments = projectPayments.filter(
    (payment) => payment.status !== "void",
  );

  if (activePayments.some((payment) => payment.status === "overdue")) {
    return "overdue";
  }

  if (activePayments.some((payment) => payment.status === "partial")) {
    return "partial";
  }

  if (activePayments.some((payment) => payment.status === "unpaid")) {
    return "unpaid";
  }

  if (activePayments.some((payment) => payment.status === "paid")) {
    return "paid";
  }

  return "unpaid";
}

function buildActivityItem(input: {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
}): DashboardActivity {
  return input;
}

async function getProjectSupportMaps(projectIds: string[]) {
  if (projectIds.length === 0) {
    return {
      clientByProjectId: new Map<string, string>(),
      currentMilestoneByProjectId: new Map<string, string>(),
      paymentInfoByProjectId: new Map<
        string,
        { status: PaymentStatus; amountCents: number }
      >(),
    };
  }

  const [assignmentRows, milestoneRows, paymentRows] = await Promise.all([
    db
      .select({
        projectId: projectAssignments.projectId,
        companyName: clients.companyName,
      })
      .from(projectAssignments)
      .innerJoin(clients, eq(projectAssignments.clientId, clients.id))
      .where(
        and(
          inArray(projectAssignments.projectId, projectIds),
          isNull(clients.deletedAt),
        ),
      )
      .orderBy(desc(projectAssignments.assignedAt)),
    db
      .select({
        projectId: milestones.projectId,
        title: milestones.title,
        status: milestones.status,
        position: milestones.position,
        createdAt: milestones.createdAt,
      })
      .from(milestones)
      .where(inArray(milestones.projectId, projectIds))
      .orderBy(asc(milestones.position), asc(milestones.createdAt)),
    db
      .select({
        projectId: payments.projectId,
        amountCents: payments.amountCents,
        status: payments.status,
      })
      .from(payments)
      .where(
        and(
          inArray(payments.projectId, projectIds),
          isNull(payments.deletedAt),
        ),
      ),
  ]);

  const clientByProjectId = new Map<string, string>();
  for (const row of assignmentRows) {
    if (!clientByProjectId.has(row.projectId)) {
      clientByProjectId.set(row.projectId, row.companyName);
    }
  }

  const milestonesByProjectId = new Map<
    string,
    Array<{
      title: string;
      status: string;
      position: number;
      createdAt: Date | string;
    }>
  >();

  for (const row of milestoneRows) {
    const items = milestonesByProjectId.get(row.projectId) ?? [];
    items.push(row);
    milestonesByProjectId.set(row.projectId, items);
  }

  const currentMilestoneByProjectId = new Map<string, string>();
  for (const projectId of projectIds) {
    const items = milestonesByProjectId.get(projectId) ?? [];
    const currentMilestone =
      items.find(
        (item) => item.status !== "approved" && item.status !== "completed",
      )?.title ??
      items.at(-1)?.title ??
      "No milestone has been added yet.";

    currentMilestoneByProjectId.set(projectId, currentMilestone);
  }

  const paymentInfoByProjectId = new Map<
    string,
    { status: PaymentStatus; amountCents: number }
  >();
  const paymentsByProjectId = new Map<
    string,
    Array<{ amountCents: number; status: PaymentStatus }>
  >();

  for (const row of paymentRows) {
    const items = paymentsByProjectId.get(row.projectId) ?? [];
    items.push({
      amountCents: row.amountCents,
      status: row.status,
    });
    paymentsByProjectId.set(row.projectId, items);
  }

  for (const projectId of projectIds) {
    const items = paymentsByProjectId.get(projectId) ?? [];
    const openAmountCents = items
      .filter((item) => item.status !== "paid" && item.status !== "void")
      .reduce((total, item) => total + item.amountCents, 0);
    const paidAmountCents = items
      .filter((item) => item.status === "paid")
      .reduce((total, item) => total + item.amountCents, 0);

    paymentInfoByProjectId.set(projectId, {
      status: getDerivedProjectPaymentStatus(items),
      amountCents: openAmountCents > 0 ? openAmountCents : paidAmountCents,
    });
  }

  return {
    clientByProjectId,
    currentMilestoneByProjectId,
    paymentInfoByProjectId,
  };
}

async function getProjectCards(
  rows: ProjectSummaryRow[],
): Promise<DashboardProject[]> {
  const projectIds = rows.map((row) => row.id);
  const {
    clientByProjectId,
    currentMilestoneByProjectId,
    paymentInfoByProjectId,
  } = await getProjectSupportMaps(projectIds);

  return rows.map((row) => {
    const paymentInfo = paymentInfoByProjectId.get(row.id) ?? {
      status: "unpaid",
      amountCents: 0,
    };

    return {
      id: row.id,
      name: row.name,
      client: clientByProjectId.get(row.id) ?? "Unassigned client",
      status: getSafeProjectStatus(row.status),
      progress: row.progress,
      deadline: row.deadline,
      currentMilestone:
        currentMilestoneByProjectId.get(row.id) ??
        "No milestone has been added yet.",
      paymentStatus: paymentInfo.status,
      paymentAmountCents: paymentInfo.amountCents,
    };
  });
}

function getMetrics(input: {
  activeProjectsCount: number;
  pendingFeedbackCount: number;
  completedMilestonesCount: number;
  outstandingPaymentCents: number;
}): DashboardMetric[] {
  return [
    {
      title: "Active projects",
      value: String(input.activeProjectsCount),
      description: "Projects that are currently moving",
      icon: FolderKanban,
    },
    {
      title: "Feedback waiting for review",
      value: String(input.pendingFeedbackCount),
      description: "Open client notes that still need attention",
      icon: MessageSquare,
    },
    {
      title: "Completed milestones",
      value: String(input.completedMilestonesCount),
      description: "Milestones already approved or marked complete",
      icon: CheckCircle2,
    },
    {
      title: "Payments still open",
      value: formatCurrencyFromCents(input.outstandingPaymentCents),
      description: "Unpaid, partial, or overdue payments",
      icon: CreditCard,
    },
  ];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await requireRole("admin");

  const [
    [activeProjectsResult],
    [pendingFeedbackResult],
    [completedMilestonesResult],
    [outstandingPaymentsResult],
    recentProjectRows,
    progressProjectRows,
    recentFeedbackRows,
    recentApprovalRows,
    recentUpdateRows,
    paymentSummaryRows,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(projects)
      .where(
        and(
          inArray(projects.status, activeProjectStatuses),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      ),
    db
      .select({ value: count() })
      .from(feedback)
      .innerJoin(projects, eq(feedback.projectId, projects.id))
      .innerJoin(clients, eq(feedback.clientId, clients.id))
      .where(
        and(
          eq(feedback.status, "open"),
          isNull(feedback.archivedAt),
          isNull(feedback.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
          isNull(clients.deletedAt),
        ),
      ),
    db
      .select({ value: count() })
      .from(milestones)
      .innerJoin(projects, eq(milestones.projectId, projects.id))
      .where(
        and(
          inArray(milestones.status, completedMilestoneStatuses),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      ),
    db
      .select({ value: sum(payments.amountCents) })
      .from(payments)
      .innerJoin(projects, eq(payments.projectId, projects.id))
      .where(
        and(
          inArray(payments.status, outstandingPaymentStatuses),
          isNull(payments.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      ),
    db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        progress: projects.progress,
        deadline: projects.deadline,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(
        and(
          ne(projects.status, "draft"),
          ne(projects.status, "archived"),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(desc(projects.updatedAt))
      .limit(5),
    db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        progress: projects.progress,
        deadline: projects.deadline,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(
        and(
          inArray(projects.status, activeProjectStatuses),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(asc(projects.deadline), desc(projects.updatedAt))
      .limit(4),
    db
      .select({
        id: feedback.id,
        client: clients.companyName,
        project: projects.name,
        message: feedback.message,
        status: feedback.status,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .innerJoin(clients, eq(feedback.clientId, clients.id))
      .innerJoin(projects, eq(feedback.projectId, projects.id))
      .where(
        and(
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
          isNull(clients.deletedAt),
          isNull(feedback.archivedAt),
          isNull(feedback.deletedAt),
        ),
      )
      .orderBy(desc(feedback.createdAt))
      .limit(4),
    db
      .select({
        id: approvals.id,
        projectId: approvals.projectId,
        project: projects.name,
        title: approvals.title,
        status: approvals.status,
        requestedAt: approvals.requestedAt,
        respondedAt: approvals.respondedAt,
      })
      .from(approvals)
      .innerJoin(projects, eq(approvals.projectId, projects.id))
      .where(
        and(
          isNull(approvals.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(desc(approvals.requestedAt))
      .limit(4),
    db
      .select({
        id: projectUpdates.id,
        projectId: projectUpdates.projectId,
        project: projects.name,
        title: projectUpdates.title,
        body: projectUpdates.body,
        createdAt: projectUpdates.createdAt,
      })
      .from(projectUpdates)
      .innerJoin(projects, eq(projectUpdates.projectId, projects.id))
      .where(and(isNull(projects.archivedAt), isNull(projects.deletedAt)))
      .orderBy(desc(projectUpdates.createdAt))
      .limit(4),
    db
      .select({
        id: payments.id,
        projectId: payments.projectId,
        project: projects.name,
        amountCents: payments.amountCents,
        status: payments.status,
        dueDate: payments.dueDate,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(projects, eq(payments.projectId, projects.id))
      .where(
        and(
          isNull(payments.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(asc(payments.dueDate), desc(payments.createdAt))
      .limit(6),
  ]);

  const recentProjects = await getProjectCards(recentProjectRows);
  const projectProgress = await getProjectCards(progressProjectRows);
  const supportProjectIds = Array.from(
    new Set([
      ...recentApprovalRows.map((row) => row.projectId),
      ...recentUpdateRows.map((row) => row.projectId),
      ...paymentSummaryRows.map((row) => row.projectId),
    ]),
  );
  const { clientByProjectId } = await getProjectSupportMaps(supportProjectIds);

  const recentFeedback: DashboardFeedback[] = recentFeedbackRows.map((row) => ({
    id: row.id,
    client: row.client,
    project: row.project,
    message: row.message,
    status: row.status,
    createdAt: toIsoString(row.createdAt),
  }));

  const recentApprovals: DashboardApproval[] = recentApprovalRows.map((row) => ({
    id: row.id,
    project: row.project,
    client: clientByProjectId.get(row.projectId) ?? "Unassigned client",
    title: row.title,
    status: row.status,
    requestedAt: toIsoString(row.requestedAt),
    respondedAt: row.respondedAt ? toIsoString(row.respondedAt) : null,
  }));

  const recentUpdates: DashboardProjectUpdate[] = recentUpdateRows.map((row) => ({
    id: row.id,
    project: row.project,
    client: clientByProjectId.get(row.projectId) ?? "Unassigned client",
    title: row.title,
    body: row.body,
    createdAt: toIsoString(row.createdAt),
  }));

  const paymentSummary: DashboardPayment[] = paymentSummaryRows
    .sort((left, right) => {
      const leftWeight = left.status === "paid" ? 1 : 0;
      const rightWeight = right.status === "paid" ? 1 : 0;

      if (leftWeight !== rightWeight) {
        return leftWeight - rightWeight;
      }

      const leftDate = left.dueDate
        ? new Date(left.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const rightDate = right.dueDate
        ? new Date(right.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;

      return leftDate - rightDate;
    })
    .map((row) => ({
      id: row.id,
      project: row.project,
      client: clientByProjectId.get(row.projectId) ?? "Unassigned client",
      amountCents: row.amountCents,
      status: row.status,
      dueDate: row.dueDate,
    }));

  const activity: DashboardActivity[] = [
    ...recentApprovals.map((item) =>
      buildActivityItem({
        id: `approval-${item.id}`,
        type: "approval",
        title:
          item.status === "pending"
            ? `${item.project} is waiting for approval`
            : item.status === "approved"
              ? `${item.client} approved ${item.title}`
              : `${item.client} requested changes on ${item.title}`,
        description:
          item.status === "pending"
            ? `Waiting on ${item.client} to review the latest delivery step.`
            : `Approval status is now ${item.status.replace("_", " ")}.`,
        createdAt: item.respondedAt ?? item.requestedAt,
      }),
    ),
    ...recentFeedback.map((item) =>
      buildActivityItem({
        id: `feedback-${item.id}`,
        type: "feedback",
        title: `New feedback from ${item.client}`,
        description: truncateText(item.message, 110),
        createdAt: item.createdAt,
      }),
    ),
    ...recentUpdates.map((item) =>
      buildActivityItem({
        id: `update-${item.id}`,
        type: "project",
        title: item.title,
        description: `${item.project}: ${truncateText(item.body, 100)}`,
        createdAt: item.createdAt,
      }),
    ),
    ...paymentSummary
      .filter((item) => item.status !== "paid")
      .slice(0, 2)
      .map((item) =>
        buildActivityItem({
          id: `payment-${item.id}`,
          type: "payment",
          title: `${item.project} has a payment still open`,
          description: `${item.client} still has ${formatCurrencyFromCents(item.amountCents)} marked as ${item.status}.`,
          createdAt: item.dueDate ?? new Date().toISOString(),
        }),
      ),
  ]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, 6);

  const metrics = getMetrics({
    activeProjectsCount: Number(activeProjectsResult?.value ?? 0),
    pendingFeedbackCount: Number(pendingFeedbackResult?.value ?? 0),
    completedMilestonesCount: Number(completedMilestonesResult?.value ?? 0),
    outstandingPaymentCents: Number(outstandingPaymentsResult?.value ?? 0),
  });

  return {
    metrics,
    recentProjects,
    projectProgress,
    recentFeedback,
    recentApprovals,
    recentUpdates,
    paymentSummary,
    activity,
    quickActions: adminDashboardQuickActions,
  };
}
