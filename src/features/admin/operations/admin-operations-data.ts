import "server-only";

import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  approvals,
  clients,
  feedback,
  milestones,
  payments,
  projectAssignments,
  projectFiles,
  projects,
  tasks,
} from "@/db/schema";
import { requireRole } from "@/lib/supabase/auth";
import type {
  AdminApprovalRecord,
  AdminApprovalsPageData,
  AdminFeedbackPageData,
  AdminFeedbackRecord,
  AdminFileRecord,
  AdminFilesPageData,
  AdminMilestoneRecord,
  AdminMilestonesPageData,
  AdminPaymentsPageData,
  AdminPaymentRecord,
  AdminSettingsData,
  AdminTaskRecord,
  AdminTasksPageData,
} from "@/features/admin/operations/types";

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

async function getProjectClientMap(projectIds: string[]) {
  const projectClientMap = new Map<
    string,
    { clientName: string; clientEmail: string | null }
  >();

  if (projectIds.length === 0) {
    return projectClientMap;
  }

  const assignmentRows = await db
    .select({
      projectId: projectAssignments.projectId,
      clientName: clients.companyName,
      clientEmail: clients.email,
    })
    .from(projectAssignments)
    .innerJoin(clients, eq(projectAssignments.clientId, clients.id))
    .where(
      and(
        inArray(projectAssignments.projectId, projectIds),
        isNull(clients.deletedAt),
      ),
    )
    .orderBy(desc(projectAssignments.assignedAt));

  for (const row of assignmentRows) {
    if (!projectClientMap.has(row.projectId)) {
      projectClientMap.set(row.projectId, {
        clientName: row.clientName,
        clientEmail: row.clientEmail,
      });
    }
  }

  return projectClientMap;
}

export async function getAdminMilestonesPageData(): Promise<AdminMilestonesPageData> {
  await requireRole("admin");

  const milestoneRows = await db
    .select({
      id: milestones.id,
      projectId: milestones.projectId,
      projectName: projects.name,
      title: milestones.title,
      description: milestones.description,
      status: milestones.status,
      dueDate: milestones.dueDate,
      position: milestones.position,
      createdAt: milestones.createdAt,
    })
    .from(milestones)
    .innerJoin(projects, eq(milestones.projectId, projects.id))
    .where(and(isNull(projects.archivedAt), isNull(projects.deletedAt)))
    .orderBy(asc(milestones.dueDate), asc(milestones.position), desc(milestones.createdAt));

  const projectClientMap = await getProjectClientMap(
    Array.from(new Set(milestoneRows.map((row) => row.projectId))),
  );

  const milestoneIds = milestoneRows.map((row) => row.id);
  const approvalRows =
    milestoneIds.length === 0
      ? []
      : await db
          .select({
            milestoneId: approvals.milestoneId,
            status: approvals.status,
            responseNote: approvals.responseNote,
            requestedAt: approvals.requestedAt,
            respondedAt: approvals.respondedAt,
          })
          .from(approvals)
          .where(
            and(
              inArray(approvals.milestoneId, milestoneIds),
              isNull(approvals.deletedAt),
            ),
          )
          .orderBy(desc(approvals.requestedAt));

  const latestApprovalByMilestoneId = new Map<
    string,
    {
      status: AdminMilestoneRecord["approvalStatus"];
      responseNote: string | null;
      requestedAt: string | null;
      respondedAt: string | null;
    }
  >();

  for (const row of approvalRows) {
    if (!row.milestoneId || latestApprovalByMilestoneId.has(row.milestoneId)) {
      continue;
    }

    latestApprovalByMilestoneId.set(row.milestoneId, {
      status: row.status,
      responseNote: row.responseNote,
      requestedAt: toIsoString(row.requestedAt),
      respondedAt: row.respondedAt ? toIsoString(row.respondedAt) : null,
    });
  }

  const normalizedMilestones: AdminMilestoneRecord[] = milestoneRows.map((row) => {
    const latestApproval = latestApprovalByMilestoneId.get(row.id);

    return {
      id: row.id,
      projectId: row.projectId,
      projectName: row.projectName,
      clientName:
        projectClientMap.get(row.projectId)?.clientName ?? "Unassigned client",
      clientEmail: projectClientMap.get(row.projectId)?.clientEmail ?? null,
      title: row.title,
      description: row.description,
      status: row.status,
      dueDate: row.dueDate,
      position: row.position,
      approvalStatus: latestApproval?.status ?? null,
      responseNote: latestApproval?.responseNote ?? null,
      requestedAt: latestApproval?.requestedAt ?? null,
      respondedAt: latestApproval?.respondedAt ?? null,
    };
  });

  return {
    milestones: normalizedMilestones,
    summary: {
      total: normalizedMilestones.length,
      readyForReview: normalizedMilestones.filter(
        (milestone) =>
          milestone.status === "waiting_approval" ||
          milestone.approvalStatus === "pending",
      ).length,
      approved: normalizedMilestones.filter(
        (milestone) =>
          milestone.status === "approved" || milestone.status === "completed",
      ).length,
      changesRequested: normalizedMilestones.filter(
        (milestone) => milestone.approvalStatus === "changes_requested",
      ).length,
    },
  };
}

export async function getAdminTasksPageData(): Promise<AdminTasksPageData> {
  await requireRole("admin");

  const taskRows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      projectName: projects.name,
      title: tasks.title,
      description: tasks.description,
      milestoneTitle: milestones.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      isVisibleToClient: tasks.isVisibleToClient,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(milestones, eq(tasks.milestoneId, milestones.id))
    .where(
      and(
        isNull(tasks.deletedAt),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(asc(tasks.dueDate), desc(tasks.updatedAt));

  const projectClientMap = await getProjectClientMap(
    Array.from(new Set(taskRows.map((row) => row.projectId))),
  );

  const normalizedTasks: AdminTaskRecord[] = taskRows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    projectName: row.projectName,
    clientName: projectClientMap.get(row.projectId)?.clientName ?? "Unassigned client",
    clientEmail: projectClientMap.get(row.projectId)?.clientEmail ?? null,
    title: row.title,
    description: row.description,
    milestoneTitle: row.milestoneTitle,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate,
    isVisibleToClient: row.isVisibleToClient,
    updatedAt: toIsoString(row.updatedAt),
  }));

  const now = new Date();
  const dueSoonCutoff = new Date(now);
  dueSoonCutoff.setDate(dueSoonCutoff.getDate() + 7);

  return {
    tasks: normalizedTasks,
    summary: {
      total: normalizedTasks.length,
      completed: normalizedTasks.filter((task) => task.status === "completed")
        .length,
      blocked: normalizedTasks.filter((task) => task.status === "blocked").length,
      dueSoon: normalizedTasks.filter((task) => {
        if (!task.dueDate || task.status === "completed") {
          return false;
        }

        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= dueSoonCutoff;
      }).length,
    },
  };
}

export async function getAdminFeedbackPageData(): Promise<AdminFeedbackPageData> {
  await requireRole("admin");

  const feedbackRows = await db
    .select({
      id: feedback.id,
      projectId: feedback.projectId,
      projectName: projects.name,
      clientName: clients.companyName,
      clientEmail: clients.email,
      message: feedback.message,
      status: feedback.status,
      adminResponse: feedback.adminResponse,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    })
    .from(feedback)
    .innerJoin(projects, eq(feedback.projectId, projects.id))
    .innerJoin(clients, eq(feedback.clientId, clients.id))
    .where(
      and(
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
        isNull(clients.deletedAt),
        isNull(feedback.archivedAt),
        isNull(feedback.deletedAt),
      ),
    )
    .orderBy(desc(feedback.createdAt));

  const normalizedFeedback: AdminFeedbackRecord[] = feedbackRows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    projectName: row.projectName,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    message: row.message,
    status: row.status,
    adminResponse: row.adminResponse,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  }));

  return {
    feedback: normalizedFeedback,
    summary: {
      unread: normalizedFeedback.filter((item) => item.status === "open").length,
      reviewed: normalizedFeedback.filter((item) => item.status === "reviewed")
        .length,
      resolved: normalizedFeedback.filter((item) => item.status === "resolved")
        .length,
    },
  };
}

export async function getAdminPaymentsPageData(): Promise<AdminPaymentsPageData> {
  await requireRole("admin");

  const paymentRows = await db
    .select({
      id: payments.id,
      projectId: payments.projectId,
      projectName: projects.name,
      amountCents: payments.amountCents,
      currency: payments.currency,
      status: payments.status,
      dueDate: payments.dueDate,
      paidAt: payments.paidAt,
      voidedAt: payments.voidedAt,
      voidReason: payments.voidReason,
      notes: payments.notes,
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
    .orderBy(asc(payments.dueDate), desc(payments.createdAt));

  const projectClientMap = await getProjectClientMap(
    Array.from(new Set(paymentRows.map((row) => row.projectId))),
  );

  const normalizedPayments: AdminPaymentRecord[] = paymentRows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    projectName: row.projectName,
    clientName: projectClientMap.get(row.projectId)?.clientName ?? "Unassigned client",
    clientEmail: projectClientMap.get(row.projectId)?.clientEmail ?? null,
    amountCents: row.amountCents,
    currency: row.currency,
    status: row.status,
    dueDate: row.dueDate,
    paidAt: row.paidAt ? toIsoString(row.paidAt) : null,
    voidedAt: row.voidedAt ? toIsoString(row.voidedAt) : null,
    voidReason: row.voidReason,
    notes: row.notes,
  }));

  return {
    payments: normalizedPayments,
    summary: {
      totalPaidCents: normalizedPayments
        .filter((payment) => payment.status === "paid")
        .reduce((total, payment) => total + payment.amountCents, 0),
      outstandingCents: normalizedPayments
        .filter((payment) => payment.status !== "paid" && payment.status !== "void")
        .reduce((total, payment) => total + payment.amountCents, 0),
      overdueCount: normalizedPayments.filter((payment) => payment.status === "overdue")
        .length,
      pendingCount: normalizedPayments.filter((payment) =>
        payment.status === "unpaid" || payment.status === "partial"
      ).length,
    },
  };
}

export async function getAdminFilesPageData(): Promise<AdminFilesPageData> {
  await requireRole("admin");

  const fileRows = await db
    .select({
      id: projectFiles.id,
      projectId: projectFiles.projectId,
      projectName: projects.name,
      fileName: projectFiles.fileName,
      fileType: projectFiles.fileType,
      fileSize: projectFiles.fileSize,
      category: projectFiles.category,
      bucketName: projectFiles.bucketName,
      storagePath: projectFiles.storagePath,
      isVisibleToClient: projectFiles.isVisibleToClient,
      createdAt: projectFiles.createdAt,
    })
    .from(projectFiles)
    .innerJoin(projects, eq(projectFiles.projectId, projects.id))
    .where(
      and(
        isNull(projectFiles.deletedAt),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(desc(projectFiles.createdAt));

  const projectClientMap = await getProjectClientMap(
    Array.from(new Set(fileRows.map((row) => row.projectId))),
  );

  const normalizedFiles: AdminFileRecord[] = fileRows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    projectName: row.projectName,
    clientName: projectClientMap.get(row.projectId)?.clientName ?? "Unassigned client",
    clientEmail: projectClientMap.get(row.projectId)?.clientEmail ?? null,
    fileName: row.fileName,
    fileType: row.fileType,
    fileSize: row.fileSize,
    category: row.category,
    bucketName: row.bucketName,
    storagePath: row.storagePath,
    isVisibleToClient: row.isVisibleToClient,
    createdAt: toIsoString(row.createdAt),
  }));

  return {
    files: normalizedFiles,
    summary: {
      totalFiles: normalizedFiles.length,
      visibleToClients: normalizedFiles.filter((file) => file.isVisibleToClient)
        .length,
      internalOnly: normalizedFiles.filter((file) => !file.isVisibleToClient)
        .length,
      totalSizeBytes: normalizedFiles.reduce(
        (total, file) => total + (file.fileSize ?? 0),
        0,
      ),
    },
  };
}

export async function getAdminApprovalsPageData(): Promise<AdminApprovalsPageData> {
  await requireRole("admin");

  const approvalRows = await db
    .select({
      id: approvals.id,
      projectId: approvals.projectId,
      projectName: projects.name,
      title: approvals.title,
      description: approvals.description,
      milestoneTitle: milestones.title,
      status: approvals.status,
      responseNote: approvals.responseNote,
      requestedAt: approvals.requestedAt,
      respondedAt: approvals.respondedAt,
    })
    .from(approvals)
    .innerJoin(projects, eq(approvals.projectId, projects.id))
    .leftJoin(milestones, eq(approvals.milestoneId, milestones.id))
    .where(
      and(
        isNull(approvals.deletedAt),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(desc(approvals.requestedAt));

  const projectClientMap = await getProjectClientMap(
    Array.from(new Set(approvalRows.map((row) => row.projectId))),
  );

  const normalizedApprovals: AdminApprovalRecord[] = approvalRows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    projectName: row.projectName,
    clientName: projectClientMap.get(row.projectId)?.clientName ?? "Unassigned client",
    clientEmail: projectClientMap.get(row.projectId)?.clientEmail ?? null,
    title: row.title,
    description: row.description,
    milestoneTitle: row.milestoneTitle,
    status: row.status,
    responseNote: row.responseNote,
    requestedAt: toIsoString(row.requestedAt),
    respondedAt: row.respondedAt ? toIsoString(row.respondedAt) : null,
  }));

  return {
    approvals: normalizedApprovals,
    summary: {
      pending: normalizedApprovals.filter((item) => item.status === "pending").length,
      approved: normalizedApprovals.filter((item) => item.status === "approved")
        .length,
      changesRequested: normalizedApprovals.filter(
        (item) => item.status === "changes_requested",
      ).length,
    },
  };
}

export async function getAdminSettingsData(): Promise<AdminSettingsData> {
  const profile = await requireRole("admin");

  return {
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    createdAt: profile.created_at,
  };
}
