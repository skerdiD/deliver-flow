import "server-only";

import { and, asc, desc, eq, ne } from "drizzle-orm";
import { cache } from "react";

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
  projectUpdates,
  tasks,
} from "@/db/schema";
import type {
  ClientApprovalStatus,
  ClientPaymentStatus,
  ClientPortalApproval,
  ClientPortalFeedback,
  ClientPortalFile,
  ClientPortalPayment,
  ClientPortalProject,
  ClientPortalTask,
  ClientPortalUpdate,
} from "@/features/client/portal/types";
import { clientProjectIdSchema } from "@/features/client/portal/portal-validation";
import { requireRole } from "@/lib/supabase/auth";
import type { Profile, ProjectStatus } from "@/types/database";

type ClientPortalAssignment = {
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

function mapProjectStatus(status: ProjectStatus): ClientPortalProject["status"] {
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

  if (projectPayments.some((payment) => payment.status === "overdue")) {
    return "overdue";
  }

  if (projectPayments.every((payment) => payment.status === "paid")) {
    return "paid";
  }

  if (projectPayments.some((payment) => payment.status === "partial")) {
    return "partial";
  }

  if (
    projectPayments.some((payment) => payment.status === "paid") &&
    projectPayments.some((payment) => payment.status === "unpaid")
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

  if (
    normalizedType.includes("word") ||
    /\.(doc|docx)$/.test(normalizedName)
  ) {
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
    description:
      row.description ?? "Review this work and share your decision.",
    status: row.status,
    projectName: row.projectName,
    milestoneName: row.milestoneName,
    responseNote: row.responseNote ?? undefined,
    requestedAt: toIsoString(row.requestedAt),
    respondedAt: row.respondedAt ? toIsoString(row.respondedAt) : null,
  };
}

async function getClientPortalAccess(): Promise<ClientPortalAccess> {
  const profile = await requireRole("client");

  return {
    profile,
  };
}

async function getClientPortalAssignments(
  profileId: string,
): Promise<ClientPortalAssignment[]> {
  return db
    .select({
      clientId: clients.id,
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
        ne(projects.status, "archived"),
      ),
    )
    .orderBy(desc(projectAssignments.assignedAt));
}

async function getClientPortalAssignmentById(
  profileId: string,
  projectId: string,
): Promise<ClientPortalAssignment | null> {
  const parsedProjectId = clientProjectIdSchema.safeParse(projectId);

  if (!parsedProjectId.success) {
    return null;
  }

  const [assignment] = await db
    .select({
      clientId: clients.id,
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
        eq(projects.id, parsedProjectId.data),
        ne(projects.status, "archived"),
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
          eq(tasks.isVisibleToClient, true),
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
      .where(eq(payments.projectId, assignment.projectId))
      .orderBy(asc(payments.dueDate), asc(payments.createdAt)),
    db
      .select({
        id: projectFiles.id,
        fileName: projectFiles.fileName,
        fileType: projectFiles.fileType,
        fileSize: projectFiles.fileSize,
        category: projectFiles.category,
        bucketName: projectFiles.bucketName,
        storagePath: projectFiles.storagePath,
        createdAt: projectFiles.createdAt,
      })
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, assignment.projectId),
          eq(projectFiles.isVisibleToClient, true),
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
          eq(feedback.clientId, assignment.clientId),
          eq(feedback.isVisibleToClient, true),
        ),
      )
      .orderBy(desc(feedback.createdAt)),
    db
      .select({
        id: approvals.id,
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
      .where(eq(approvals.projectId, assignment.projectId))
      .orderBy(desc(approvals.requestedAt)),
  ]);

  const mappedMilestones = projectMilestones.map((milestone) => ({
    id: milestone.id,
    title: milestone.title,
    description:
      milestone.description ?? "No milestone details have been added yet.",
    status: milestone.status,
    dueDate:
      milestone.dueDate ?? assignment.deadline ?? new Date().toISOString(),
  }));

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
    bucketName: file.bucketName,
    storagePath: file.storagePath,
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

  const mappedApprovals = projectApprovals
    .map(mapApprovalRowToPortalApproval)
    .sort((left, right) => {
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
  };
}

export const getClientPortalState = cache(
  async (): Promise<ClientPortalState> => {
    const access = await getClientPortalAccess();
    const assignments = await getClientPortalAssignments(access.profile.id);

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

export const getClientPortalProjectById = cache(
  async (projectId: string): Promise<ClientPortalProject | null> => {
    const access = await getClientPortalAccess();
    const assignment = await getClientPortalAssignmentById(
      access.profile.id,
      projectId,
    );

    if (!assignment) {
      return null;
    }

    return buildClientPortalProject(assignment);
  },
);

export async function getClientPortalProject() {
  return getLatestClientPortalProject();
}

export async function addClientFeedback(projectId: string, message: string) {
  const access = await getClientPortalAccess();
  const assignment = await getClientPortalAssignmentById(
    access.profile.id,
    projectId,
  );

  if (!assignment) {
    throw new Error("No project assignment found for this client.");
  }

  const [createdFeedback] = await db
    .insert(feedback)
    .values({
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
        eq(approvals.status, "pending"),
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
          eq(approvals.status, "pending"),
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

  return mapApprovalRowToPortalApproval(updatedApproval);
}
