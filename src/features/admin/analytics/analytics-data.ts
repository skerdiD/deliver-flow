import "server-only";

import { and, eq, gte, isNull, lt, ne, or } from "drizzle-orm";

import { db } from "@/db";
import {
  approvals,
  clients,
  feedback,
  payments,
  projectAssignments,
  projectViewEvents,
  projects,
  tasks,
} from "@/db/schema";
import {
  calculateApprovalRate,
  calculateAverageApprovalResponseHours,
  createAnalyticsBuckets,
  deriveProjectHealth,
  getAnalyticsBucketKey,
  getAnalyticsPeriod,
  getOpenInvoiceAmounts,
  groupCurrencyAmounts,
  isInAnalyticsPeriod,
} from "@/features/admin/analytics/analytics-calculations";
import type {
  AnalyticsPageData,
  AnalyticsRange,
} from "@/features/admin/analytics/types";
import { requireAdminWorkspace } from "@/lib/supabase/auth";

function asDate(value: Date | string | null) {
  return value ? new Date(value) : null;
}

function isSupportedProjectStatus(
  status: string,
): status is AnalyticsPageData["projectHealth"][number]["status"] {
  return ["active", "in_progress", "waiting_feedback", "completed"].includes(
    status,
  );
}

export async function getAnalyticsPageData(
  range: AnalyticsRange,
): Promise<AnalyticsPageData> {
  const { workspaceId } = await requireAdminWorkspace();
  const { start, end } = getAnalyticsPeriod(range);
  const buckets = createAnalyticsBuckets(range);
  const [
    paymentRows,
    timelinePaymentRows,
    approvalRows,
    feedbackRows,
    projectRows,
    assignmentRows,
    taskRows,
    viewRows,
  ] = await Promise.all([
    db
      .select({
        id: payments.id,
        projectId: payments.projectId,
        amountCents: payments.amountCents,
        currency: payments.currency,
        status: payments.status,
        dueDate: payments.dueDate,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(
        and(
          eq(payments.workspaceId, workspaceId),
          isNull(payments.deletedAt),
          isNull(payments.voidedAt),
          ne(payments.status, "void"),
        ),
      ),
    db
      .select({
        amountCents: payments.amountCents,
        currency: payments.currency,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(
        and(
          eq(payments.workspaceId, workspaceId),
          isNull(payments.deletedAt),
          isNull(payments.voidedAt),
          ne(payments.status, "void"),
          or(
            and(gte(payments.createdAt, start), lt(payments.createdAt, end)),
            and(gte(payments.paidAt, start), lt(payments.paidAt, end)),
          ),
        ),
      ),
    db
      .select({
        id: approvals.id,
        projectId: approvals.projectId,
        status: approvals.status,
        requestedAt: approvals.requestedAt,
        respondedAt: approvals.respondedAt,
      })
      .from(approvals)
      .where(
        and(
          eq(approvals.workspaceId, workspaceId),
          isNull(approvals.deletedAt),
          isNull(approvals.cancelledAt),
        ),
      ),
    db
      .select({
        id: feedback.id,
        projectId: feedback.projectId,
        clientId: feedback.clientId,
        status: feedback.status,
        createdAt: feedback.createdAt,
        resolvedAt: feedback.resolvedAt,
      })
      .from(feedback)
      .where(
        and(
          eq(feedback.workspaceId, workspaceId),
          isNull(feedback.deletedAt),
          isNull(feedback.archivedAt),
        ),
      ),
    db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        progress: projects.progress,
        deadline: projects.deadline,
      })
      .from(projects)
      .where(
        and(
          eq(projects.workspaceId, workspaceId),
          isNull(projects.archivedAt),
          isNull(projects.deletedAt),
        ),
      ),
    db
      .select({
        projectId: projectAssignments.projectId,
        clientId: clients.id,
        clientName: clients.companyName,
      })
      .from(projectAssignments)
      .innerJoin(clients, eq(projectAssignments.clientId, clients.id))
      .where(
        and(
          eq(projectAssignments.workspaceId, workspaceId),
          eq(clients.workspaceId, workspaceId),
          isNull(clients.deletedAt),
        ),
      ),
    db
      .select({ projectId: tasks.projectId, status: tasks.status })
      .from(tasks)
      .where(and(eq(tasks.workspaceId, workspaceId), isNull(tasks.deletedAt))),
    db
      .select({
        projectId: projectViewEvents.projectId,
        clientId: projectViewEvents.clientId,
        viewedAt: projectViewEvents.viewedAt,
      })
      .from(projectViewEvents)
      .where(
        and(
          eq(projectViewEvents.workspaceId, workspaceId),
          gte(projectViewEvents.viewedAt, start),
          lt(projectViewEvents.viewedAt, end),
        ),
      ),
  ]);

  const feedbackByProject = new Map<string, number>();
  const feedbackByClient = new Map<string, number>();
  const deliveryByBucket = new Map(
    buckets.map((bucket) => [
      bucket.key,
      {
        feedbackSubmitted: 0,
        feedbackResolved: 0,
        approvalRequests: 0,
        approvalResponses: 0,
      },
    ]),
  );

  for (const item of feedbackRows) {
    if (item.status !== "resolved") {
      feedbackByProject.set(
        item.projectId,
        (feedbackByProject.get(item.projectId) ?? 0) + 1,
      );
    }
    const createdAt = asDate(item.createdAt);
    if (isInAnalyticsPeriod(createdAt, start, end) && createdAt) {
      feedbackByClient.set(
        item.clientId,
        (feedbackByClient.get(item.clientId) ?? 0) + 1,
      );
      const delivery = deliveryByBucket.get(
        getAnalyticsBucketKey(createdAt, range),
      );
      if (delivery) delivery.feedbackSubmitted += 1;
    }
    const resolvedAt = asDate(item.resolvedAt);
    if (isInAnalyticsPeriod(resolvedAt, start, end) && resolvedAt) {
      const delivery = deliveryByBucket.get(
        getAnalyticsBucketKey(resolvedAt, range),
      );
      if (delivery) delivery.feedbackResolved += 1;
    }
  }

  const approvalsByProject = new Map<string, number>();
  const approvalResponsesByProject = new Map<string, number>();
  const respondedApprovals: Array<{
    status: "approved" | "changes_requested";
    requestedAt: Date;
    respondedAt: Date | null;
  }> = [];
  for (const item of approvalRows) {
    if (item.status === "pending") {
      approvalsByProject.set(
        item.projectId,
        (approvalsByProject.get(item.projectId) ?? 0) + 1,
      );
    }
    const requestedAt = asDate(item.requestedAt);
    if (isInAnalyticsPeriod(requestedAt, start, end) && requestedAt) {
      const delivery = deliveryByBucket.get(
        getAnalyticsBucketKey(requestedAt, range),
      );
      if (delivery) delivery.approvalRequests += 1;
    }
    const respondedAt = asDate(item.respondedAt);
    if (
      respondedAt &&
      isInAnalyticsPeriod(respondedAt, start, end) &&
      (item.status === "approved" || item.status === "changes_requested") &&
      requestedAt
    ) {
      respondedApprovals.push({
        status: item.status,
        requestedAt,
        respondedAt,
      });
      approvalResponsesByProject.set(
        item.projectId,
        (approvalResponsesByProject.get(item.projectId) ?? 0) + 1,
      );
      const delivery = deliveryByBucket.get(
        getAnalyticsBucketKey(respondedAt, range),
      );
      if (delivery) delivery.approvalResponses += 1;
    }
  }

  const paidRevenue = groupCurrencyAmounts(
    paymentRows
      .filter(
        (payment) =>
          payment.status === "paid" &&
          isInAnalyticsPeriod(asDate(payment.paidAt), start, end),
      )
      .map((payment) => ({
        currency: payment.currency,
        amountCents: payment.amountCents,
      })),
  );
  const openInvoiceValue = getOpenInvoiceAmounts(paymentRows);

  const revenueMaps = new Map<
    string,
    Map<string, { invoicedCents: number; paidCents: number }>
  >();
  for (const item of timelinePaymentRows) {
    const currencyBuckets = revenueMaps.get(item.currency) ?? new Map();
    revenueMaps.set(item.currency, currencyBuckets);
    const createdAt = asDate(item.createdAt);
    if (createdAt && isInAnalyticsPeriod(createdAt, start, end)) {
      const key = getAnalyticsBucketKey(createdAt, range);
      const bucket = currencyBuckets.get(key) ?? {
        invoicedCents: 0,
        paidCents: 0,
      };
      bucket.invoicedCents += item.amountCents;
      currencyBuckets.set(key, bucket);
    }
    const paidAt = asDate(item.paidAt);
    if (
      item.status === "paid" &&
      paidAt &&
      isInAnalyticsPeriod(paidAt, start, end)
    ) {
      const key = getAnalyticsBucketKey(paidAt, range);
      const bucket = currencyBuckets.get(key) ?? {
        invoicedCents: 0,
        paidCents: 0,
      };
      bucket.paidCents += item.amountCents;
      currencyBuckets.set(key, bucket);
    }
  }

  const paymentStatusByCurrency = [
    ...new Set(paymentRows.map((item) => item.currency)),
  ]
    .sort()
    .map((currency) => ({
      currency,
      statuses: (["paid", "unpaid", "partial", "overdue"] as const).map(
        (status) => {
          const matching = paymentRows.filter(
            (item) => item.currency === currency && item.status === status,
          );
          return {
            status,
            invoiceCount: matching.length,
            amountCents: matching.reduce(
              (total, item) => total + item.amountCents,
              0,
            ),
          };
        },
      ),
    }));

  const activeProjectIds = new Set(
    projectRows
      .filter((project) => project.status !== "completed")
      .map((project) => project.id),
  );
  const clientsByProject = new Map<
    string,
    Array<{ id: string; name: string }>
  >();
  const activeProjectIdsByClient = new Map<string, Set<string>>();
  for (const assignment of assignmentRows) {
    const assigned = clientsByProject.get(assignment.projectId) ?? [];
    assigned.push({ id: assignment.clientId, name: assignment.clientName });
    clientsByProject.set(assignment.projectId, assigned);
    const projectIds =
      activeProjectIdsByClient.get(assignment.clientId) ?? new Set<string>();
    if (activeProjectIds.has(assignment.projectId)) {
      projectIds.add(assignment.projectId);
    }
    activeProjectIdsByClient.set(assignment.clientId, projectIds);
  }
  const blockedByProject = new Map<string, number>();
  for (const task of taskRows) {
    if (task.status === "blocked")
      blockedByProject.set(
        task.projectId,
        (blockedByProject.get(task.projectId) ?? 0) + 1,
      );
  }
  const paymentsByProject = new Map<string, typeof paymentRows>();
  for (const payment of paymentRows) {
    const values = paymentsByProject.get(payment.projectId) ?? [];
    values.push(payment);
    paymentsByProject.set(payment.projectId, values);
  }
  const projectHealth = projectRows.flatMap((project) => {
    const status = project.status === "draft" ? "active" : project.status;
    if (!isSupportedProjectStatus(status)) {
      return [];
    }

    const projectPayments = paymentsByProject.get(project.id) ?? [];
    const assignedClients = clientsByProject.get(project.id) ?? [];
    const openInvoices = getOpenInvoiceAmounts(projectPayments);
    return [
      {
        id: project.id,
        name: project.name,
        clientName:
          assignedClients.map((client) => client.name).join(", ") ||
          "Unassigned client",
        status,
        progress: project.progress,
        deadline: project.deadline,
        openFeedbackCount: feedbackByProject.get(project.id) ?? 0,
        pendingApprovalCount: approvalsByProject.get(project.id) ?? 0,
        blockedTaskCount: blockedByProject.get(project.id) ?? 0,
        openInvoices,
        health: deriveProjectHealth({
          status,
          deadline: project.deadline,
          hasOverduePayment: projectPayments.some(
            (payment) => payment.status === "overdue",
          ),
          blockedTaskCount: blockedByProject.get(project.id) ?? 0,
          openFeedbackCount: feedbackByProject.get(project.id) ?? 0,
          pendingApprovalCount: approvalsByProject.get(project.id) ?? 0,
        }),
      },
    ];
  });

  const viewCountsByClient = new Map<string, number>();
  for (const view of viewRows)
    viewCountsByClient.set(
      view.clientId,
      (viewCountsByClient.get(view.clientId) ?? 0) + 1,
    );
  const clientInfo = new Map<
    string,
    { name: string; projectIds: Set<string> }
  >();
  for (const assignment of assignmentRows) {
    const entry = clientInfo.get(assignment.clientId) ?? {
      name: assignment.clientName,
      projectIds: new Set<string>(),
    };
    if (activeProjectIds.has(assignment.projectId)) {
      entry.projectIds.add(assignment.projectId);
    }
    clientInfo.set(assignment.clientId, entry);
  }
  const clientActivity = [...clientInfo.entries()].map(([id, client]) => {
    const responseCount = [...client.projectIds].reduce(
      (total, projectId) =>
        total + (approvalResponsesByProject.get(projectId) ?? 0),
      0,
    );
    const openInvoices = getOpenInvoiceAmounts(
      [...client.projectIds].flatMap(
        (projectId) => paymentsByProject.get(projectId) ?? [],
      ),
    );
    return {
      id,
      name: client.name,
      activeProjectCount: activeProjectIdsByClient.get(id)?.size ?? 0,
      feedbackSubmitted: feedbackByClient.get(id) ?? 0,
      approvalResponses: responseCount,
      recordedViews: viewCountsByClient.get(id) ?? 0,
      openInvoices,
    };
  });

  return {
    range,
    metrics: {
      paidRevenue,
      openInvoiceValue,
      approvalRate: calculateApprovalRate(respondedApprovals),
      averageApprovalResponseHours:
        calculateAverageApprovalResponseHours(respondedApprovals),
    },
    revenueByCurrency: [...revenueMaps.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([currency, totals]) => ({
        currency,
        buckets: buckets.map((bucket) => ({
          ...bucket,
          ...(totals.get(bucket.key) ?? { invoicedCents: 0, paidCents: 0 }),
        })),
      })),
    deliveryBuckets: buckets.map((bucket) => ({
      ...bucket,
      ...(deliveryByBucket.get(bucket.key) ?? {
        feedbackSubmitted: 0,
        feedbackResolved: 0,
        approvalRequests: 0,
        approvalResponses: 0,
      }),
    })),
    paymentStatusByCurrency,
    projectHealth,
    clientActivity,
  };
}
