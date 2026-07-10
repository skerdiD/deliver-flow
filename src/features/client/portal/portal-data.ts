import "server-only";

import { and, asc, desc, eq, inArray, isNull, ne } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import {
  approvals,
  clients,
  feedback,
  milestones,
  payments,
  projectActivity,
  projectAssignments,
  projectFiles,
  projects,
  projectUpdates,
  tasks,
} from "@/db/schema";
import type {
  ClientApprovalStatus,
  ClientPaymentStatus,
  ClientPortalApproval,
  ClientPortalActivity,
  ClientPortalFeedback,
  ClientPortalFile,
  ClientPortalPayment,
  ClientPortalProject,
  ClientPortalTask,
  ClientPortalUpdate,
} from "@/features/client/portal/types";
import { clientProjectIdSchema } from "@/features/client/portal/portal-validation";
import {
  recordClientViewEvent,
  type ProjectViewTargetType,
} from "@/features/projects/activity";
import { requireRole } from "@/lib/supabase/auth";
import type { Profile, ProjectStatus } from "@/types/database";

type ClientPortalAssignment = {
  workspaceId: string;
  clientId: string;
  clientName: string;
  companyName: string;
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  projectStatus: ProjectStatus;
  progress: number;
  liveDemoUrl: string | null;
  repositoryUrl: string | null;
  deadline: string | null;
};

export type ClientPortalState = {
  profile: Profile;
  projects: ClientPortalProject[];
};

export type ClientProjectSwitcherProject = {
  id: string;
  name: string;
  status: ClientPortalProject["status"];
  deadline: string | null;
  paymentStatus: ClientPaymentStatus;
};

export type ClientProjectSearchParams = {
  [key: string]: string | string[] | undefined;
};

export type ClientProjectSelection = {
  projects: ClientProjectSwitcherProject[];
  requestedProjectId: string | null;
  selectedProjectId: string | null;
  didFallback: boolean;
};

type ClientPortalAccess = {
  profile: Profile;
};

const fileCategoryLabels: Record<string, string> = {
  brief: "Brief",
  design: "Design",
  document: "Document",
  invoice: "Invoice",
  deliverable: "Deliverable",
  other: "Other",
};

function mapProjectStatus(
  status: ProjectStatus,
): ClientPortalProject["status"] {
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

function derivePaymentStatus(
  projectPayments: Array<{ status: ClientPaymentStatus }>,
): ClientPaymentStatus {
  if (projectPayments.length === 0) {
    return "unpaid";
  }

  const activePayments = projectPayments.filter(
    (payment) => payment.status !== "void",
  );

  if (activePayments.length === 0) {
    return "unpaid";
  }

  if (activePayments.some((payment) => payment.status === "overdue")) {
    return "overdue";
  }

  if (activePayments.every((payment) => payment.status === "paid")) {
    return "paid";
  }

  if (activePayments.some((payment) => payment.status === "partial")) {
    return "partial";
  }

  if (
    activePayments.some((payment) => payment.status === "paid") &&
    activePayments.some((payment) => payment.status === "unpaid")
  ) {
    return "partial";
  }

  return "unpaid";
}

function formatFileSize(sizeInBytes: number | null): string {
  if (!sizeInBytes || sizeInBytes <= 0) {
    return "Unknown";
  }

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  const sizeInKilobytes = sizeInBytes / 1024;

  if (sizeInKilobytes < 1024) {
    return `${Math.round(sizeInKilobytes)} KB`;
  }

  const sizeInMegabytes = sizeInKilobytes / 1024;

  if (sizeInMegabytes < 10) {
    return `${sizeInMegabytes.toFixed(1)} MB`;
  }

  return `${Math.round(sizeInMegabytes)} MB`;
}

function inferPortalFileType(
  fileName: string,
  fileType: string | null,
): ClientPortalFile["type"] {
  const normalizedName = fileName.toLowerCase();
  const normalizedType = fileType?.toLowerCase() ?? "";

  if (
    normalizedType.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg)$/.test(normalizedName)
  ) {
    return "image";
  }

  if (normalizedType.includes("pdf") || normalizedName.endsWith(".pdf")) {
    return "pdf";
  }

  if (normalizedType.includes("word") || /\.(doc|docx)$/.test(normalizedName)) {
    return "docx";
  }

  return "other";
}

function mapTaskStatus(
  status: "todo" | "in_progress" | "blocked" | "completed",
): ClientPortalTask["status"] {
  return status;
}

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function getProfileDisplayName(profile: Profile) {
  return profile.full_name?.trim() || profile.email;
}

function mapApprovalRowToPortalApproval(row: {
  id: string;
  title: string;
  description: string | null;
  status: ClientApprovalStatus;
  projectName: string;
  milestoneName: string | null;
  responseNote: string | null;
  requestedAt: Date | string;
  respondedAt: Date | string | null;
}): ClientPortalApproval {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "Review this work and share your decision.",
    status: row.status,
    projectName: row.projectName,
    milestoneName: row.milestoneName,
    responseNote: row.responseNote ?? undefined,
    requestedAt: toIsoString(row.requestedAt),
    respondedAt: row.respondedAt ? toIsoString(row.respondedAt) : null,
  };
}

function sortClientPortalApprovals(
  approvalsList: ClientPortalApproval[],
): ClientPortalApproval[] {
  return approvalsList.sort((left, right) => {
    if (left.status === "pending" && right.status !== "pending") {
      return -1;
    }

    if (left.status !== "pending" && right.status === "pending") {
      return 1;
    }

    return (
      new Date(right.requestedAt).getTime() -
      new Date(left.requestedAt).getTime()
    );
  });
}

function getLatestApprovalByMilestoneId(
  approvalsList: Array<{
    milestoneId: string | null;
    status: ClientApprovalStatus;
    responseNote: string | null;
    requestedAt: Date | string;
    respondedAt: Date | string | null;
  }>,
) {
  const latestApprovalByMilestoneId = new Map<
    string,
    {
      approvalStatus: ClientApprovalStatus;
      responseNote: string | null;
      requestedAt: string;
      respondedAt: string | null;
    }
  >();

  for (const approval of approvalsList) {
    if (
      !approval.milestoneId ||
      latestApprovalByMilestoneId.has(approval.milestoneId)
    ) {
      continue;
    }

    latestApprovalByMilestoneId.set(approval.milestoneId, {
      approvalStatus: approval.status,
      responseNote: approval.responseNote,
      requestedAt: toIsoString(approval.requestedAt),
      respondedAt: approval.respondedAt
        ? toIsoString(approval.respondedAt)
        : null,
    });
  }

  return latestApprovalByMilestoneId;
}

function attachApprovalStateToMilestones(
  milestonesList: ClientPortalProject["milestones"],
  latestApprovalByMilestoneId: ReturnType<
    typeof getLatestApprovalByMilestoneId
  >,
): ClientPortalProject["milestones"] {
  return milestonesList.map((milestone) => {
    const latestApproval = latestApprovalByMilestoneId.get(milestone.id);

    return {
      ...milestone,
      approvalStatus: latestApproval?.approvalStatus ?? null,
      responseNote: latestApproval?.responseNote ?? null,
      requestedAt: latestApproval?.requestedAt ?? null,
      respondedAt: latestApproval?.respondedAt ?? null,
    };
  });
}

const getClientPortalAccess = cache(async (): Promise<ClientPortalAccess> => {
  const profile = await requireRole("client");

  return {
    profile,
  };
});

async function getClientPortalAssignments(
  profileId: string,
  workspaceId: string,
): Promise<ClientPortalAssignment[]> {
  return db
    .select({
      clientId: clients.id,
      workspaceId: clients.workspaceId,
      clientName: clients.contactName,
      companyName: clients.companyName,
      projectId: projects.id,
      projectName: projects.name,
      projectDescription: projects.description,
      projectStatus: projects.status,
      progress: projects.progress,
      liveDemoUrl: projects.liveDemoUrl,
      repositoryUrl: projects.repositoryUrl,
      deadline: projects.deadline,
    })
    .from(clients)
    .innerJoin(projectAssignments, eq(projectAssignments.clientId, clients.id))
    .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
    .where(
      and(
        eq(clients.profileId, profileId),
        eq(clients.workspaceId, workspaceId),
        eq(projects.workspaceId, workspaceId),
        eq(projectAssignments.workspaceId, workspaceId),
        eq(clients.workspaceId, projects.workspaceId),
        ne(projects.status, "archived"),
        isNull(clients.archivedAt),
        isNull(clients.deletedAt),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(desc(projectAssignments.assignedAt));
}

function readProjectIdSearchParam(
  searchParams: ClientProjectSearchParams,
): string | null {
  const projectIdParam = searchParams.projectId;

  if (Array.isArray(projectIdParam)) {
    return projectIdParam[0] ?? null;
  }

  return projectIdParam ?? null;
}

function mapAssignmentToSwitcherProject(
  assignment: ClientPortalAssignment,
  paymentStatus: ClientPaymentStatus,
): ClientProjectSwitcherProject {
  return {
    id: assignment.projectId,
    name: assignment.projectName,
    status: mapProjectStatus(assignment.projectStatus),
    deadline: assignment.deadline,
    paymentStatus,
  };
}

export const getClientAssignedProjects = cache(
  async (): Promise<ClientProjectSwitcherProject[]> => {
    const access = await getClientPortalAccess();
    const assignments = await getClientPortalAssignments(
      access.profile.id,
      access.profile.workspace_id,
    );

    if (assignments.length === 0) {
      return [];
    }

    const projectIds = assignments.map((assignment) => assignment.projectId);
    const workspaceIds = Array.from(
      new Set(assignments.map((assignment) => assignment.workspaceId)),
    );
    const projectPayments = await db
      .select({
        projectId: payments.projectId,
        status: payments.status,
      })
      .from(payments)
      .where(
        and(
          inArray(payments.projectId, projectIds),
          inArray(payments.workspaceId, workspaceIds),
          isNull(payments.deletedAt),
          isNull(payments.voidedAt),
        ),
      );

    const paymentsByProjectId = new Map<
      string,
      Array<{ status: ClientPaymentStatus }>
    >();

    for (const payment of projectPayments) {
      const items = paymentsByProjectId.get(payment.projectId) ?? [];
      items.push({ status: payment.status });
      paymentsByProjectId.set(payment.projectId, items);
    }

    return assignments.map((assignment) =>
      mapAssignmentToSwitcherProject(
        assignment,
        derivePaymentStatus(
          paymentsByProjectId.get(assignment.projectId) ?? [],
        ),
      ),
    );
  },
);

export async function getSelectedClientProject(
  searchParamsInput:
    | ClientProjectSearchParams
    | Promise<ClientProjectSearchParams>
    | undefined,
): Promise<ClientProjectSelection> {
  const searchParams = searchParamsInput ? await searchParamsInput : {};
  const requestedProjectId = readProjectIdSearchParam(searchParams);
  const projectsList = await getClientAssignedProjects();
  const selectedProjectId =
    projectsList.find((project) => project.id === requestedProjectId)?.id ??
    projectsList[0]?.id ??
    null;

  return {
    projects: projectsList,
    requestedProjectId,
    selectedProjectId,
    didFallback: Boolean(
      requestedProjectId &&
      selectedProjectId &&
      requestedProjectId !== selectedProjectId,
    ),
  };
}

export async function requireClientProjectAccess(
  projectId: string,
): Promise<boolean> {
  const access = await getClientPortalAccess();
  const assignment = await getClientPortalAssignmentById(
    access.profile.id,
    access.profile.workspace_id,
    projectId,
  );

  return Boolean(assignment);
}

async function getClientPortalAssignmentById(
  profileId: string,
  workspaceId: string,
  projectId: string,
): Promise<ClientPortalAssignment | null> {
  const parsedProjectId = clientProjectIdSchema.safeParse(projectId);

  if (!parsedProjectId.success) {
    return null;
  }

  const [assignment] = await db
    .select({
      clientId: clients.id,
      workspaceId: clients.workspaceId,
      clientName: clients.contactName,
      companyName: clients.companyName,
      projectId: projects.id,
      projectName: projects.name,
      projectDescription: projects.description,
      projectStatus: projects.status,
      progress: projects.progress,
      liveDemoUrl: projects.liveDemoUrl,
      repositoryUrl: projects.repositoryUrl,
      deadline: projects.deadline,
    })
    .from(clients)
    .innerJoin(projectAssignments, eq(projectAssignments.clientId, clients.id))
    .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
    .where(
      and(
        eq(clients.profileId, profileId),
        eq(clients.workspaceId, workspaceId),
        eq(projects.workspaceId, workspaceId),
        eq(projectAssignments.workspaceId, workspaceId),
        eq(projects.id, parsedProjectId.data),
        eq(clients.workspaceId, projects.workspaceId),
        ne(projects.status, "archived"),
        isNull(clients.archivedAt),
        isNull(clients.deletedAt),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  return assignment ?? null;
}

async function buildClientPortalProject(
  assignment: ClientPortalAssignment,
): Promise<ClientPortalProject> {
  const [
    projectMilestones,
    projectTasks,
    projectUpdatesList,
    projectPayments,
    projectFilesList,
    projectFeedback,
    projectApprovals,
    projectActivityRows,
  ] = await Promise.all([
    db
      .select({
        id: milestones.id,
        title: milestones.title,
        description: milestones.description,
        status: milestones.status,
        dueDate: milestones.dueDate,
      })
      .from(milestones)
      .where(
        and(
          eq(milestones.projectId, assignment.projectId),
          eq(milestones.workspaceId, assignment.workspaceId),
          eq(milestones.isVisibleToClient, true),
        ),
      )
      .orderBy(asc(milestones.position), asc(milestones.createdAt)),
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, assignment.projectId),
          eq(tasks.workspaceId, assignment.workspaceId),
          eq(tasks.isVisibleToClient, true),
          isNull(tasks.deletedAt),
        ),
      )
      .orderBy(asc(tasks.position), asc(tasks.createdAt)),
    db
      .select({
        id: projectUpdates.id,
        title: projectUpdates.title,
        body: projectUpdates.body,
        createdAt: projectUpdates.createdAt,
      })
      .from(projectUpdates)
      .where(
        and(
          eq(projectUpdates.projectId, assignment.projectId),
          eq(projectUpdates.workspaceId, assignment.workspaceId),
          eq(projectUpdates.isVisibleToClient, true),
        ),
      )
      .orderBy(desc(projectUpdates.createdAt)),
    db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        status: payments.status,
        dueDate: payments.dueDate,
        paidAt: payments.paidAt,
        notes: payments.notes,
      })
      .from(payments)
      .where(
        and(
          eq(payments.projectId, assignment.projectId),
          eq(payments.workspaceId, assignment.workspaceId),
          isNull(payments.deletedAt),
          isNull(payments.voidedAt),
        ),
      )
      .orderBy(asc(payments.dueDate), asc(payments.createdAt)),
    db
      .select({
        id: projectFiles.id,
        fileName: projectFiles.fileName,
        fileType: projectFiles.fileType,
        fileSize: projectFiles.fileSize,
        category: projectFiles.category,
        createdAt: projectFiles.createdAt,
      })
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, assignment.projectId),
          eq(projectFiles.workspaceId, assignment.workspaceId),
          eq(projectFiles.isVisibleToClient, true),
          eq(projectFiles.scanStatus, "clean"),
          isNull(projectFiles.deletedAt),
        ),
      )
      .orderBy(desc(projectFiles.createdAt)),
    db
      .select({
        id: feedback.id,
        message: feedback.message,
        status: feedback.status,
        adminResponse: feedback.adminResponse,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .where(
        and(
          eq(feedback.projectId, assignment.projectId),
          eq(feedback.workspaceId, assignment.workspaceId),
          eq(feedback.clientId, assignment.clientId),
          eq(feedback.isVisibleToClient, true),
          isNull(feedback.archivedAt),
          isNull(feedback.deletedAt),
        ),
      )
      .orderBy(desc(feedback.createdAt)),
    db
      .select({
        id: approvals.id,
        milestoneId: approvals.milestoneId,
        title: approvals.title,
        description: approvals.description,
        status: approvals.status,
        projectName: projects.name,
        milestoneName: milestones.title,
        responseNote: approvals.responseNote,
        requestedAt: approvals.requestedAt,
        respondedAt: approvals.respondedAt,
      })
      .from(approvals)
      .innerJoin(projects, eq(approvals.projectId, projects.id))
      .leftJoin(milestones, eq(approvals.milestoneId, milestones.id))
      .where(
        and(
          eq(approvals.projectId, assignment.projectId),
          eq(approvals.workspaceId, assignment.workspaceId),
          isNull(approvals.deletedAt),
        ),
      )
      .orderBy(desc(approvals.requestedAt)),
    db
      .select({
        id: projectActivity.id,
        actorName: projectActivity.actorName,
        actorRole: projectActivity.actorRole,
        message: projectActivity.message,
        createdAt: projectActivity.createdAt,
      })
      .from(projectActivity)
      .where(
        and(
          eq(projectActivity.projectId, assignment.projectId),
          eq(projectActivity.workspaceId, assignment.workspaceId),
          inArray(projectActivity.type, [
            "project_created",
            "project_update_added",
            "approval_requested",
            "approval_approved",
            "changes_requested",
            "milestone_completed",
            "file_uploaded",
            "payment_created",
            "payment_status_updated",
          ]),
        ),
      )
      .orderBy(desc(projectActivity.createdAt))
      .limit(12),
  ]);

  const latestApprovalByMilestoneId =
    getLatestApprovalByMilestoneId(projectApprovals);

  const mappedMilestones = attachApprovalStateToMilestones(
    projectMilestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description:
        milestone.description ?? "No milestone details have been added yet.",
      status: milestone.status,
      dueDate:
        milestone.dueDate ?? assignment.deadline ?? new Date().toISOString(),
    })),
    latestApprovalByMilestoneId,
  );

  const mappedTasks = projectTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "No task details have been added yet.",
    status: mapTaskStatus(task.status),
  }));

  const mappedUpdates: ClientPortalUpdate[] = projectUpdatesList.map(
    (update) => ({
      id: update.id,
      title: update.title,
      body: update.body,
      createdAt: toIsoString(update.createdAt),
    }),
  );

  const mappedPayments: ClientPortalPayment[] = projectPayments.map(
    (payment) => ({
      id: payment.id,
      label: payment.notes?.trim() ? payment.notes.trim() : "Project payment",
      amountCents: payment.amountCents,
      status: payment.status,
      dueDate:
        payment.dueDate ?? assignment.deadline ?? new Date().toISOString(),
      paidAt: payment.paidAt ? toIsoString(payment.paidAt) : undefined,
    }),
  );

  const mappedFiles: ClientPortalFile[] = projectFilesList.map((file) => ({
    id: file.id,
    name: file.fileName,
    type: inferPortalFileType(file.fileName, file.fileType),
    size: formatFileSize(file.fileSize),
    category: fileCategoryLabels[file.category] ?? "Other",
    uploadedAt: toIsoString(file.createdAt),
  }));

  const mappedFeedback: ClientPortalFeedback[] = projectFeedback.map(
    (item) => ({
      id: item.id,
      message: item.message,
      status: item.status,
      createdAt: toIsoString(item.createdAt),
      adminResponse: item.adminResponse,
    }),
  );

  const mappedApprovals = sortClientPortalApprovals(
    projectApprovals.map(mapApprovalRowToPortalApproval),
  );

  const mappedActivity: ClientPortalActivity[] = projectActivityRows.map(
    (activity) => ({
      id: activity.id,
      actorName: activity.actorName,
      actorRole: activity.actorRole,
      message: activity.message,
      createdAt: toIsoString(activity.createdAt),
    }),
  );

  const totalAmountCents = mappedPayments.reduce(
    (sum, payment) => sum + payment.amountCents,
    0,
  );

  const paidAmountCents = mappedPayments.reduce((sum, payment) => {
    if (payment.status !== "paid") {
      return sum;
    }

    return sum + payment.amountCents;
  }, 0);

  const currentMilestone =
    mappedMilestones.find(
      (milestone) =>
        milestone.status !== "completed" && milestone.status !== "approved",
    )?.title ??
    mappedMilestones.at(-1)?.title ??
    "No milestone has been added yet.";

  return {
    id: assignment.projectId,
    name: assignment.projectName,
    clientName: assignment.clientName,
    companyName: assignment.companyName,
    description:
      assignment.projectDescription ??
      "Project details will be added as the work moves forward.",
    status: mapProjectStatus(assignment.projectStatus),
    progress: assignment.progress,
    currentMilestone,
    deadline: assignment.deadline,
    liveDemoUrl: assignment.liveDemoUrl,
    repositoryUrl: assignment.repositoryUrl ?? undefined,
    totalAmountCents,
    paidAmountCents,
    paymentStatus: derivePaymentStatus(mappedPayments),
    milestones: mappedMilestones,
    tasks: mappedTasks,
    updates: mappedUpdates,
    files: mappedFiles,
    payments: mappedPayments,
    feedback: mappedFeedback,
    approvals: mappedApprovals,
    approval: mappedApprovals[0] ?? null,
    activity: mappedActivity,
  };
}

function buildClientPortalProjectShell(
  assignment: ClientPortalAssignment,
  overrides: Partial<ClientPortalProject> = {},
): ClientPortalProject {
  return {
    id: assignment.projectId,
    name: assignment.projectName,
    clientName: assignment.clientName,
    companyName: assignment.companyName,
    description:
      assignment.projectDescription ??
      "Project details will be added as the work moves forward.",
    status: mapProjectStatus(assignment.projectStatus),
    progress: assignment.progress,
    currentMilestone: "No milestone has been added yet.",
    deadline: assignment.deadline,
    liveDemoUrl: assignment.liveDemoUrl,
    repositoryUrl: assignment.repositoryUrl ?? undefined,
    totalAmountCents: 0,
    paidAmountCents: 0,
    paymentStatus: "unpaid",
    milestones: [],
    tasks: [],
    updates: [],
    files: [],
    payments: [],
    feedback: [],
    approvals: [],
    approval: null,
    activity: [],
    ...overrides,
  };
}

async function buildClientPortalDashboardProjects(
  assignments: ClientPortalAssignment[],
): Promise<ClientPortalProject[]> {
  if (assignments.length === 0) {
    return [];
  }

  const projectIds = assignments.map((assignment) => assignment.projectId);
  const clientIds = assignments.map((assignment) => assignment.clientId);
  const workspaceIds = Array.from(
    new Set(assignments.map((assignment) => assignment.workspaceId)),
  );
  const assignmentByProjectId = new Map(
    assignments.map((assignment) => [assignment.projectId, assignment]),
  );
  const [
    projectMilestones,
    projectTasks,
    projectUpdatesList,
    projectPayments,
    projectFilesList,
    projectFeedback,
    projectApprovals,
  ] = await Promise.all([
    db
      .select({
        id: milestones.id,
        projectId: milestones.projectId,
        title: milestones.title,
        description: milestones.description,
        status: milestones.status,
        dueDate: milestones.dueDate,
      })
      .from(milestones)
      .where(
        and(
          inArray(milestones.projectId, projectIds),
          inArray(milestones.workspaceId, workspaceIds),
          eq(milestones.isVisibleToClient, true),
        ),
      )
      .orderBy(asc(milestones.position), asc(milestones.createdAt)),
    db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
      })
      .from(tasks)
      .where(
        and(
          inArray(tasks.projectId, projectIds),
          inArray(tasks.workspaceId, workspaceIds),
          eq(tasks.isVisibleToClient, true),
          isNull(tasks.deletedAt),
        ),
      )
      .orderBy(asc(tasks.position), asc(tasks.createdAt)),
    db
      .select({
        id: projectUpdates.id,
        projectId: projectUpdates.projectId,
        title: projectUpdates.title,
        body: projectUpdates.body,
        createdAt: projectUpdates.createdAt,
      })
      .from(projectUpdates)
      .where(
        and(
          inArray(projectUpdates.projectId, projectIds),
          inArray(projectUpdates.workspaceId, workspaceIds),
          eq(projectUpdates.isVisibleToClient, true),
        ),
      )
      .orderBy(desc(projectUpdates.createdAt)),
    db
      .select({
        id: payments.id,
        projectId: payments.projectId,
        amountCents: payments.amountCents,
        status: payments.status,
        dueDate: payments.dueDate,
        paidAt: payments.paidAt,
        notes: payments.notes,
      })
      .from(payments)
      .where(
        and(
          inArray(payments.projectId, projectIds),
          inArray(payments.workspaceId, workspaceIds),
          isNull(payments.deletedAt),
          isNull(payments.voidedAt),
        ),
      )
      .orderBy(asc(payments.dueDate), asc(payments.createdAt)),
    db
      .select({
        id: projectFiles.id,
        projectId: projectFiles.projectId,
        fileName: projectFiles.fileName,
        fileType: projectFiles.fileType,
        fileSize: projectFiles.fileSize,
        category: projectFiles.category,
        createdAt: projectFiles.createdAt,
      })
      .from(projectFiles)
      .where(
        and(
          inArray(projectFiles.projectId, projectIds),
          inArray(projectFiles.workspaceId, workspaceIds),
          eq(projectFiles.isVisibleToClient, true),
          isNull(projectFiles.deletedAt),
        ),
      )
      .orderBy(desc(projectFiles.createdAt)),
    db
      .select({
        id: feedback.id,
        projectId: feedback.projectId,
        clientId: feedback.clientId,
        message: feedback.message,
        status: feedback.status,
        adminResponse: feedback.adminResponse,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .where(
        and(
          inArray(feedback.projectId, projectIds),
          inArray(feedback.workspaceId, workspaceIds),
          inArray(feedback.clientId, clientIds),
          eq(feedback.isVisibleToClient, true),
          isNull(feedback.archivedAt),
          isNull(feedback.deletedAt),
        ),
      )
      .orderBy(desc(feedback.createdAt)),
    db
      .select({
        id: approvals.id,
        projectId: approvals.projectId,
        milestoneId: approvals.milestoneId,
        title: approvals.title,
        description: approvals.description,
        status: approvals.status,
        milestoneName: milestones.title,
        responseNote: approvals.responseNote,
        requestedAt: approvals.requestedAt,
        respondedAt: approvals.respondedAt,
      })
      .from(approvals)
      .leftJoin(milestones, eq(approvals.milestoneId, milestones.id))
      .where(
        and(
          inArray(approvals.projectId, projectIds),
          inArray(approvals.workspaceId, workspaceIds),
          isNull(approvals.deletedAt),
        ),
      )
      .orderBy(desc(approvals.requestedAt)),
  ]);

  const latestApprovalByMilestoneId =
    getLatestApprovalByMilestoneId(projectApprovals);
  const milestonesByProjectId = new Map<
    string,
    ClientPortalProject["milestones"]
  >();
  for (const milestone of projectMilestones) {
    const assignment = assignmentByProjectId.get(milestone.projectId);
    const items = milestonesByProjectId.get(milestone.projectId) ?? [];
    const latestApproval = latestApprovalByMilestoneId.get(milestone.id);

    items.push({
      id: milestone.id,
      title: milestone.title,
      description:
        milestone.description ?? "No milestone details have been added yet.",
      status: milestone.status,
      dueDate:
        milestone.dueDate ?? assignment?.deadline ?? new Date().toISOString(),
      approvalStatus: latestApproval?.approvalStatus ?? null,
      responseNote: latestApproval?.responseNote ?? null,
      requestedAt: latestApproval?.requestedAt ?? null,
      respondedAt: latestApproval?.respondedAt ?? null,
    });
    milestonesByProjectId.set(milestone.projectId, items);
  }

  const tasksByProjectId = new Map<string, ClientPortalProject["tasks"]>();
  for (const task of projectTasks) {
    const items = tasksByProjectId.get(task.projectId) ?? [];

    items.push({
      id: task.id,
      title: task.title,
      description: task.description ?? "No task details have been added yet.",
      status: mapTaskStatus(task.status),
    });
    tasksByProjectId.set(task.projectId, items);
  }

  const updatesByProjectId = new Map<string, ClientPortalProject["updates"]>();
  for (const update of projectUpdatesList) {
    const items = updatesByProjectId.get(update.projectId) ?? [];

    items.push({
      id: update.id,
      title: update.title,
      body: update.body,
      createdAt: toIsoString(update.createdAt),
    });
    updatesByProjectId.set(update.projectId, items);
  }

  const paymentsByProjectId = new Map<
    string,
    ClientPortalProject["payments"]
  >();
  for (const payment of projectPayments) {
    const assignment = assignmentByProjectId.get(payment.projectId);
    const items = paymentsByProjectId.get(payment.projectId) ?? [];

    items.push({
      id: payment.id,
      label: payment.notes?.trim() ? payment.notes.trim() : "Project payment",
      amountCents: payment.amountCents,
      status: payment.status,
      dueDate:
        payment.dueDate ?? assignment?.deadline ?? new Date().toISOString(),
      paidAt: payment.paidAt ? toIsoString(payment.paidAt) : undefined,
    });
    paymentsByProjectId.set(payment.projectId, items);
  }

  const filesByProjectId = new Map<string, ClientPortalProject["files"]>();
  for (const file of projectFilesList) {
    const items = filesByProjectId.get(file.projectId) ?? [];

    items.push({
      id: file.id,
      name: file.fileName,
      type: inferPortalFileType(file.fileName, file.fileType),
      size: formatFileSize(file.fileSize),
      category: fileCategoryLabels[file.category] ?? "Other",
      uploadedAt: toIsoString(file.createdAt),
    });
    filesByProjectId.set(file.projectId, items);
  }

  const feedbackByProjectId = new Map<
    string,
    ClientPortalProject["feedback"]
  >();
  for (const item of projectFeedback) {
    const assignment = assignmentByProjectId.get(item.projectId);

    if (!assignment || assignment.clientId !== item.clientId) {
      continue;
    }

    const items = feedbackByProjectId.get(item.projectId) ?? [];

    items.push({
      id: item.id,
      message: item.message,
      status: item.status,
      createdAt: toIsoString(item.createdAt),
      adminResponse: item.adminResponse,
    });
    feedbackByProjectId.set(item.projectId, items);
  }

  const approvalsByProjectId = new Map<
    string,
    ClientPortalProject["approvals"]
  >();
  for (const approval of projectApprovals) {
    const assignment = assignmentByProjectId.get(approval.projectId);

    if (!assignment) {
      continue;
    }

    const items = approvalsByProjectId.get(approval.projectId) ?? [];
    items.push(
      mapApprovalRowToPortalApproval({
        ...approval,
        projectName: assignment.projectName,
      }),
    );
    approvalsByProjectId.set(approval.projectId, items);
  }

  return assignments.map((assignment) => {
    const mappedMilestones =
      milestonesByProjectId.get(assignment.projectId) ?? [];
    const mappedPayments = paymentsByProjectId.get(assignment.projectId) ?? [];
    const paidAmountCents = mappedPayments.reduce((sum, payment) => {
      if (payment.status !== "paid") {
        return sum;
      }

      return sum + payment.amountCents;
    }, 0);
    const totalAmountCents = mappedPayments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0,
    );
    const currentMilestone =
      mappedMilestones.find(
        (milestone) =>
          milestone.status !== "completed" && milestone.status !== "approved",
      )?.title ??
      mappedMilestones.at(-1)?.title ??
      "No milestone has been added yet.";
    const mappedApprovals =
      approvalsByProjectId.get(assignment.projectId) ?? [];

    return buildClientPortalProjectShell(assignment, {
      currentMilestone,
      totalAmountCents,
      paidAmountCents,
      paymentStatus: derivePaymentStatus(mappedPayments),
      milestones: mappedMilestones,
      tasks: tasksByProjectId.get(assignment.projectId) ?? [],
      updates: updatesByProjectId.get(assignment.projectId) ?? [],
      files: filesByProjectId.get(assignment.projectId) ?? [],
      payments: mappedPayments,
      feedback: feedbackByProjectId.get(assignment.projectId) ?? [],
      approvals: mappedApprovals,
      approval: mappedApprovals[0] ?? null,
    });
  });
}

export const getClientPortalDashboardState = cache(
  async (): Promise<ClientPortalState> => {
    const access = await getClientPortalAccess();
    const assignments = await getClientPortalAssignments(
      access.profile.id,
      access.profile.workspace_id,
    );
    const projectsList = await buildClientPortalDashboardProjects(assignments);

    return {
      profile: access.profile,
      projects: projectsList,
    };
  },
);

export const getClientPortalState = cache(
  async (): Promise<ClientPortalState> => {
    const access = await getClientPortalAccess();
    const assignments = await getClientPortalAssignments(
      access.profile.id,
      access.profile.workspace_id,
    );

    const projectsList = await Promise.all(
      assignments.map((assignment) => buildClientPortalProject(assignment)),
    );
    return {
      profile: access.profile,
      projects: projectsList,
    };
  },
);

export async function getClientPortalProjects() {
  const state = await getClientPortalState();

  return state.projects;
}

export async function getLatestClientPortalProject() {
  const projectsList = await getClientPortalProjects();

  return projectsList[0] ?? null;
}

export async function getLatestClientPortalProjectId() {
  const access = await getClientPortalAccess();
  const [assignment] = await db
    .select({ projectId: projects.id })
    .from(clients)
    .innerJoin(projectAssignments, eq(projectAssignments.clientId, clients.id))
    .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
    .where(
      and(
        eq(clients.profileId, access.profile.id),
        eq(clients.workspaceId, access.profile.workspace_id),
        eq(projects.workspaceId, access.profile.workspace_id),
        eq(projectAssignments.workspaceId, access.profile.workspace_id),
        ne(projects.status, "archived"),
        isNull(clients.archivedAt),
        isNull(clients.deletedAt),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(desc(projectAssignments.assignedAt))
    .limit(1);

  return assignment?.projectId ?? null;
}

export const getClientPortalProjectById = cache(
  async (projectId: string): Promise<ClientPortalProject | null> => {
    const access = await getClientPortalAccess();
    const assignment = await getClientPortalAssignmentById(
      access.profile.id,
      access.profile.workspace_id,
      projectId,
    );

    if (!assignment) {
      return null;
    }

    return buildClientPortalProject(assignment);
  },
);

export const getClientPortalProjectFilesById = cache(
  async (projectId: string): Promise<ClientPortalProject | null> => {
    const access = await getClientPortalAccess();
    const assignment = await getClientPortalAssignmentById(
      access.profile.id,
      access.profile.workspace_id,
      projectId,
    );

    if (!assignment) {
      return null;
    }

    const projectFilesList = await db
      .select({
        id: projectFiles.id,
        fileName: projectFiles.fileName,
        fileType: projectFiles.fileType,
        fileSize: projectFiles.fileSize,
        category: projectFiles.category,
        createdAt: projectFiles.createdAt,
      })
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, assignment.projectId),
          eq(projectFiles.workspaceId, assignment.workspaceId),
          eq(projectFiles.isVisibleToClient, true),
          isNull(projectFiles.deletedAt),
        ),
      )
      .orderBy(desc(projectFiles.createdAt));

    return buildClientPortalProjectShell(assignment, {
      files: projectFilesList.map((file) => ({
        id: file.id,
        name: file.fileName,
        type: inferPortalFileType(file.fileName, file.fileType),
        size: formatFileSize(file.fileSize),
        category: fileCategoryLabels[file.category] ?? "Other",
        uploadedAt: toIsoString(file.createdAt),
      })),
    });
  },
);

export const getClientPortalProjectFeedbackById = cache(
  async (projectId: string): Promise<ClientPortalProject | null> => {
    const access = await getClientPortalAccess();
    const assignment = await getClientPortalAssignmentById(
      access.profile.id,
      access.profile.workspace_id,
      projectId,
    );

    if (!assignment) {
      return null;
    }

    const projectFeedback = await db
      .select({
        id: feedback.id,
        message: feedback.message,
        status: feedback.status,
        adminResponse: feedback.adminResponse,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .where(
        and(
          eq(feedback.projectId, assignment.projectId),
          eq(feedback.workspaceId, assignment.workspaceId),
          eq(feedback.clientId, assignment.clientId),
          eq(feedback.isVisibleToClient, true),
          isNull(feedback.archivedAt),
          isNull(feedback.deletedAt),
        ),
      )
      .orderBy(desc(feedback.createdAt));

    return buildClientPortalProjectShell(assignment, {
      feedback: projectFeedback.map((item) => ({
        id: item.id,
        message: item.message,
        status: item.status,
        createdAt: toIsoString(item.createdAt),
        adminResponse: item.adminResponse,
      })),
    });
  },
);

export const getClientPortalProjectApprovalsById = cache(
  async (projectId: string): Promise<ClientPortalProject | null> => {
    const access = await getClientPortalAccess();
    const assignment = await getClientPortalAssignmentById(
      access.profile.id,
      access.profile.workspace_id,
      projectId,
    );

    if (!assignment) {
      return null;
    }

    const projectApprovals = await db
      .select({
        id: approvals.id,
        title: approvals.title,
        description: approvals.description,
        status: approvals.status,
        milestoneName: milestones.title,
        responseNote: approvals.responseNote,
        requestedAt: approvals.requestedAt,
        respondedAt: approvals.respondedAt,
      })
      .from(approvals)
      .leftJoin(milestones, eq(approvals.milestoneId, milestones.id))
      .where(
        and(
          eq(approvals.projectId, assignment.projectId),
          eq(approvals.workspaceId, assignment.workspaceId),
          isNull(approvals.deletedAt),
        ),
      )
      .orderBy(desc(approvals.requestedAt));

    const mappedApprovals = sortClientPortalApprovals(
      projectApprovals.map((approval) =>
        mapApprovalRowToPortalApproval({
          ...approval,
          projectName: assignment.projectName,
        }),
      ),
    );

    return buildClientPortalProjectShell(assignment, {
      approvals: mappedApprovals,
      approval: mappedApprovals[0] ?? null,
    });
  },
);

export const getClientPortalProjectPaymentsById = cache(
  async (projectId: string): Promise<ClientPortalProject | null> => {
    const access = await getClientPortalAccess();
    const assignment = await getClientPortalAssignmentById(
      access.profile.id,
      access.profile.workspace_id,
      projectId,
    );

    if (!assignment) {
      return null;
    }

    const projectPayments = await db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        status: payments.status,
        dueDate: payments.dueDate,
        paidAt: payments.paidAt,
        notes: payments.notes,
      })
      .from(payments)
      .where(
        and(
          eq(payments.projectId, assignment.projectId),
          eq(payments.workspaceId, assignment.workspaceId),
          isNull(payments.deletedAt),
          isNull(payments.voidedAt),
        ),
      )
      .orderBy(asc(payments.dueDate), asc(payments.createdAt));

    const mappedPayments: ClientPortalPayment[] = projectPayments.map(
      (payment) => ({
        id: payment.id,
        label: payment.notes?.trim() ? payment.notes.trim() : "Project payment",
        amountCents: payment.amountCents,
        status: payment.status,
        dueDate:
          payment.dueDate ?? assignment.deadline ?? new Date().toISOString(),
        paidAt: payment.paidAt ? toIsoString(payment.paidAt) : undefined,
      }),
    );

    const totalAmountCents = mappedPayments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0,
    );
    const paidAmountCents = mappedPayments.reduce((sum, payment) => {
      if (payment.status !== "paid") {
        return sum;
      }

      return sum + payment.amountCents;
    }, 0);

    return buildClientPortalProjectShell(assignment, {
      payments: mappedPayments,
      totalAmountCents,
      paidAmountCents,
      paymentStatus: derivePaymentStatus(mappedPayments),
    });
  },
);

export async function getClientPortalProject() {
  return getLatestClientPortalProject();
}

export async function addClientFeedback(projectId: string, message: string) {
  const access = await getClientPortalAccess();
  const assignment = await getClientPortalAssignmentById(
    access.profile.id,
    access.profile.workspace_id,
    projectId,
  );

  if (!assignment) {
    throw new Error("No project assignment found for this client.");
  }

  const [createdFeedback] = await db
    .insert(feedback)
    .values({
      workspaceId: assignment.workspaceId,
      projectId: assignment.projectId,
      clientId: assignment.clientId,
      createdBy: access.profile.id,
      message,
      status: "open",
      isVisibleToClient: true,
    })
    .returning({
      id: feedback.id,
      message: feedback.message,
      status: feedback.status,
      createdAt: feedback.createdAt,
      adminResponse: feedback.adminResponse,
    });

  return {
    id: createdFeedback.id,
    message: createdFeedback.message,
    status: createdFeedback.status,
    createdAt: toIsoString(createdFeedback.createdAt),
    adminResponse: createdFeedback.adminResponse,
  } satisfies ClientPortalFeedback;
}

export async function respondToClientApproval(input: {
  projectId: string;
  approvalId: string;
  status: Extract<ClientApprovalStatus, "approved" | "changes_requested">;
  responseNote?: string;
}) {
  const access = await getClientPortalAccess();
  const assignment = await getClientPortalAssignmentById(
    access.profile.id,
    access.profile.workspace_id,
    input.projectId,
  );

  if (!assignment) {
    return null;
  }

  const [pendingApproval] = await db
    .select({
      id: approvals.id,
      milestoneId: approvals.milestoneId,
      milestoneName: milestones.title,
    })
    .from(approvals)
    .leftJoin(milestones, eq(approvals.milestoneId, milestones.id))
    .where(
      and(
        eq(approvals.id, input.approvalId),
        eq(approvals.projectId, assignment.projectId),
        eq(approvals.workspaceId, assignment.workspaceId),
        eq(approvals.status, "pending"),
        isNull(approvals.deletedAt),
      ),
    )
    .limit(1);

  if (!pendingApproval) {
    return null;
  }

  const updatedApproval = await db.transaction(async (tx) => {
    const [approval] = await tx
      .update(approvals)
      .set({
        status: input.status,
        responseNote: input.responseNote ?? null,
        respondedBy: access.profile.id,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(approvals.id, pendingApproval.id),
          eq(approvals.projectId, assignment.projectId),
          eq(approvals.workspaceId, assignment.workspaceId),
          eq(approvals.status, "pending"),
          isNull(approvals.deletedAt),
        ),
      )
      .returning({
        id: approvals.id,
        title: approvals.title,
        description: approvals.description,
        status: approvals.status,
        responseNote: approvals.responseNote,
        requestedAt: approvals.requestedAt,
        respondedAt: approvals.respondedAt,
      });

    if (!approval) {
      return null;
    }

    if (input.status === "approved" && pendingApproval.milestoneId) {
      await tx
        .update(milestones)
        .set({
          status: "approved",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(milestones.id, pendingApproval.milestoneId),
            eq(milestones.projectId, assignment.projectId),
            eq(milestones.workspaceId, assignment.workspaceId),
          ),
        );
    }

    return {
      ...approval,
      projectName: assignment.projectName,
      milestoneName: pendingApproval.milestoneName,
    };
  });

  if (!updatedApproval) {
    return null;
  }

  return {
    ...mapApprovalRowToPortalApproval(updatedApproval),
    respondedBy: access.profile.id,
    respondedByName: getProfileDisplayName(access.profile),
  };
}

type ClientViewTargetInput = {
  targetType: ProjectViewTargetType;
  targetId: string;
  message?: string;
  logActivity?: boolean;
  metadata?: Record<string, string | number | boolean | null>;
};

async function recordClientProjectTargets(
  projectId: string,
  targets: ClientViewTargetInput[],
) {
  if (targets.length === 0) {
    return;
  }

  const access = await getClientPortalAccess();
  const assignment = await getClientPortalAssignmentById(
    access.profile.id,
    access.profile.workspace_id,
    projectId,
  );

  if (!assignment) {
    return;
  }

  const actorName = getProfileDisplayName(access.profile);

  await Promise.all(
    targets.map((target) =>
      recordClientViewEvent({
        workspaceId: assignment.workspaceId,
        projectId: assignment.projectId,
        clientId: assignment.clientId,
        userId: access.profile.id,
        actorName,
        targetType: target.targetType,
        targetId: target.targetId,
        message: target.message,
        metadata: target.metadata,
        logActivity: target.logActivity,
      }),
    ),
  );
}

export async function recordClientProjectDetailViews(
  project: ClientPortalProject,
) {
  await recordClientProjectTargets(project.id, [
    {
      targetType: "project",
      targetId: project.id,
      message: "Client viewed the project.",
      logActivity: true,
    },
    ...project.updates.map((update) => ({
      targetType: "update" as const,
      targetId: update.id,
      logActivity: false,
      metadata: {
        updateTitle: update.title,
      },
    })),
    ...project.approvals.map((approval) => ({
      targetType: "approval" as const,
      targetId: approval.id,
      message: `Client viewed approval request: ${approval.title}.`,
      logActivity: true,
      metadata: {
        approvalTitle: approval.title,
      },
    })),
  ]);
}

export async function recordClientProjectFileViews(
  project: Pick<ClientPortalProject, "id" | "files">,
) {
  await recordClientProjectTargets(
    project.id,
    project.files.map((file) => ({
      targetType: "file" as const,
      targetId: file.id,
      logActivity: false,
      metadata: {
        fileName: file.name,
      },
    })),
  );
}

export async function recordClientProjectPaymentViews(
  project: Pick<ClientPortalProject, "id" | "payments">,
) {
  await recordClientProjectTargets(
    project.id,
    project.payments.map((payment) => ({
      targetType: "payment" as const,
      targetId: payment.id,
      logActivity: false,
      metadata: {
        paymentLabel: payment.label,
      },
    })),
  );
}
