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
  lte,
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
  tasks,
} from "@/db/schema";
import type {
  ActivityType,
  AdminDashboardData,
  DashboardAttentionItem,
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
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";
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
const dueSoonWindowMs = 1000 * 60 * 60 * 24 * 7;

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

type ScoredAttentionItem = DashboardAttentionItem & {
  priority: number;
  sortDate?: string | null;
};

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

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
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
  const dueSoonDate = formatDateOnly(new Date(Date.now() + dueSoonWindowMs));

  const [
    [activeProjectsResult],
    [pendingFeedbackResult],
    [completedMilestonesResult],
    [outstandingPaymentsResult],
    progressProjectRows,
    recentFeedbackRows,
    recentApprovalRows,
    recentUpdateRows,
    paymentSummaryRows,
    attentionPaymentRows,
    blockedTaskRows,
    pendingApprovalRows,
    openFeedbackRows,
    highPriorityTaskRows,
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
          inArray(payments.status, outstandingPaymentStatuses),
          isNull(payments.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(asc(payments.dueDate), desc(payments.createdAt))
      .limit(6),
    db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        project: projects.name,
        title: tasks.title,
        dueDate: tasks.dueDate,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        and(
          eq(tasks.status, "blocked"),
          isNull(tasks.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(asc(tasks.dueDate), desc(tasks.updatedAt))
      .limit(4),
    db
      .select({
        id: approvals.id,
        projectId: approvals.projectId,
        project: projects.name,
        title: approvals.title,
        requestedAt: approvals.requestedAt,
      })
      .from(approvals)
      .innerJoin(projects, eq(approvals.projectId, projects.id))
      .where(
        and(
          eq(approvals.status, "pending"),
          isNull(approvals.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(asc(approvals.requestedAt))
      .limit(4),
    db
      .select({
        id: feedback.id,
        projectId: feedback.projectId,
        project: projects.name,
        client: clients.companyName,
        message: feedback.message,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .innerJoin(clients, eq(feedback.clientId, clients.id))
      .innerJoin(projects, eq(feedback.projectId, projects.id))
      .where(
        and(
          eq(feedback.status, "open"),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
          isNull(clients.deletedAt),
          isNull(feedback.archivedAt),
          isNull(feedback.deletedAt),
        ),
      )
      .orderBy(asc(feedback.createdAt))
      .limit(4),
    db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        project: projects.name,
        title: tasks.title,
        dueDate: tasks.dueDate,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        and(
          eq(tasks.priority, "high"),
          ne(tasks.status, "completed"),
          lte(tasks.dueDate, dueSoonDate),
          isNull(tasks.deletedAt),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(asc(tasks.dueDate), desc(tasks.updatedAt))
      .limit(4),
  ]);

  const projectProgress = await getProjectCards(progressProjectRows);
  const supportProjectIds = Array.from(
    new Set([
      ...recentApprovalRows.map((row) => row.projectId),
      ...recentUpdateRows.map((row) => row.projectId),
      ...paymentSummaryRows.map((row) => row.projectId),
      ...attentionPaymentRows.map((row) => row.projectId),
      ...blockedTaskRows.map((row) => row.projectId),
      ...pendingApprovalRows.map((row) => row.projectId),
      ...openFeedbackRows.map((row) => row.projectId),
      ...highPriorityTaskRows.map((row) => row.projectId),
      ...projectProgress
        .filter(
          (project) =>
            project.progress === 0 ||
            project.currentMilestone === "No milestone has been added yet.",
        )
        .map((project) => project.id),
    ]),
  );
  const { clientByProjectId } = await getProjectSupportMaps(supportProjectIds);

  const attentionItems: DashboardAttentionItem[] = (
    [
      ...attentionPaymentRows.map((row) => ({
        id: `payment-${row.id}`,
        kind: "payment" as const,
        title:
          row.status === "overdue" ? "Payment overdue" : "Payment still open",
        context: `${row.project} · ${clientByProjectId.get(row.projectId) ?? "Unassigned client"}`,
        reason: `${formatCurrencyFromCents(row.amountCents)} was due ${row.dueDate ? formatShortDate(row.dueDate) : "soon"}`,
        badgeLabel:
          row.status === "overdue"
            ? "Overdue"
            : row.status === "partial"
              ? "Partial"
              : "Unpaid",
        badgeTone:
          row.status === "overdue"
            ? ("red" as const)
            : row.status === "partial"
              ? ("blue" as const)
              : ("yellow" as const),
        href: "/admin/payments",
        actionLabel: "View payment",
        priority: row.status === "overdue" ? 1 : 6,
        sortDate: row.dueDate,
      })),
      ...blockedTaskRows.map((row) => ({
        id: `task-blocked-${row.id}`,
        kind: "blocked_task" as const,
        title: "Blocked task",
        context: `${row.title} · ${row.project}`,
        reason:
          "This task is blocked and needs a decision before delivery can move.",
        badgeLabel: "Blocked",
        badgeTone: "red" as const,
        href: "/admin/tasks",
        actionLabel: "View task",
        priority: 2,
        sortDate: row.dueDate,
      })),
      ...pendingApprovalRows.map((row) => ({
        id: `approval-${row.id}`,
        kind: "approval" as const,
        title: "Approval waiting",
        context: `${row.title} · ${row.project}`,
        reason: "Client approval is still pending.",
        badgeLabel: "Pending",
        badgeTone: "purple" as const,
        href: "/admin/approvals",
        actionLabel: "View approval",
        priority: 3,
        sortDate: toIsoString(row.requestedAt),
      })),
      ...openFeedbackRows.map((row) => ({
        id: `feedback-${row.id}`,
        kind: "feedback" as const,
        title: "Feedback needs reply",
        context: `${row.project} · ${row.client}`,
        reason: "Client left feedback that has not been resolved yet.",
        badgeLabel: "Open",
        badgeTone: "yellow" as const,
        href: "/admin/feedback",
        actionLabel: "Review",
        priority: 4,
        sortDate: toIsoString(row.createdAt),
      })),
      ...highPriorityTaskRows.map((row) => ({
        id: `task-high-${row.id}`,
        kind: "high_priority_task" as const,
        title: "High priority task due soon",
        context: `${row.title} · ${row.project}`,
        reason: row.dueDate
          ? `Due ${formatShortDate(row.dueDate)}`
          : "High priority task needs a due date.",
        badgeLabel: "High",
        badgeTone: "red" as const,
        href: "/admin/tasks",
        actionLabel: "View task",
        priority: 5,
        sortDate: row.dueDate,
      })),
      ...projectProgress
        .filter(
          (project) =>
            project.progress === 0 ||
            project.currentMilestone === "No milestone has been added yet.",
        )
        .map((project) => ({
          id: `project-setup-${project.id}`,
          kind: "project_setup" as const,
          title: "Project needs setup",
          context: `${project.name} · ${clientByProjectId.get(project.id) ?? project.client}`,
          reason:
            project.progress === 0
              ? "Progress is still at 0%."
              : "No milestone has been added yet.",
          badgeLabel: "Setup",
          badgeTone: "slate" as const,
          href: `/admin/projects/${project.id}`,
          actionLabel: "View project",
          priority: 7,
          sortDate: project.deadline,
        })),
    ] satisfies ScoredAttentionItem[]
  )
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      const leftDate = left.sortDate
        ? new Date(left.sortDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const rightDate = right.sortDate
        ? new Date(right.sortDate).getTime()
        : Number.MAX_SAFE_INTEGER;

      return leftDate - rightDate;
    })
    .slice(0, 7)
    .map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      context: item.context,
      reason: item.reason,
      badgeLabel: item.badgeLabel,
      badgeTone: item.badgeTone,
      href: item.href,
      actionLabel: item.actionLabel,
    }));

  const recentFeedback: DashboardFeedback[] = recentFeedbackRows.map((row) => ({
    id: row.id,
    client: row.client,
    project: row.project,
    message: row.message,
    status: row.status,
    createdAt: toIsoString(row.createdAt),
  }));

  const recentApprovals: DashboardApproval[] = recentApprovalRows.map(
    (row) => ({
      id: row.id,
      project: row.project,
      client: clientByProjectId.get(row.projectId) ?? "Unassigned client",
      title: row.title,
      status: row.status,
      requestedAt: toIsoString(row.requestedAt),
      respondedAt: row.respondedAt ? toIsoString(row.respondedAt) : null,
    }),
  );

  const recentUpdates: DashboardProjectUpdate[] = recentUpdateRows.map(
    (row) => ({
      id: row.id,
      project: row.project,
      client: clientByProjectId.get(row.projectId) ?? "Unassigned client",
      title: row.title,
      body: row.body,
      createdAt: toIsoString(row.createdAt),
    }),
  );

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
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
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
    attentionItems,
    projectProgress,
    recentFeedback,
    recentApprovals,
    recentUpdates,
    paymentSummary,
    activity,
    quickActions: adminDashboardQuickActions,
  };
}
