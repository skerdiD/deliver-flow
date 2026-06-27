import { and, asc, desc, eq, inArray } from "drizzle-orm";

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
  AdminApprovalStatus,
  AdminMilestoneStatus,
  AdminPaymentStatus,
  AdminProject,
  AdminProjectApproval,
  AdminProjectClient,
  AdminProjectFeedback,
  AdminProjectFile,
  AdminProjectMilestone,
  AdminProjectPayment,
  AdminProjectStatus,
  AdminProjectTask,
  AdminProjectUpdate,
  AdminTaskStatus,
} from "@/features/admin/projects/types";

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function normalizeProjectStatus(status: string): AdminProjectStatus {
  if (
    status === "active" ||
    status === "in_progress" ||
    status === "waiting_feedback" ||
    status === "completed" ||
    status === "archived"
  ) {
    return status;
  }

  return "active";
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `project-${Date.now()}`;
}

function derivePaymentStatus(projectPayments: AdminProjectPayment[]) {
  if (projectPayments.length === 0) {
    return "unpaid";
  }

  if (projectPayments.some((payment) => payment.status === "overdue")) {
    return "overdue";
  }

  if (projectPayments.every((payment) => payment.status === "paid")) {
    return "paid";
  }

  if (
    projectPayments.some((payment) => payment.status === "partial") ||
    (projectPayments.some((payment) => payment.status === "paid") &&
      projectPayments.some((payment) => payment.status === "unpaid"))
  ) {
    return "partial";
  }

  return "unpaid";
}

function mapApproval(row: {
  id: string;
  title: string;
  description: string | null;
  status: AdminApprovalStatus;
  milestoneTitle: string | null;
  responseNote: string | null;
  requestedAt: Date | string;
  respondedAt: Date | string | null;
}): AdminProjectApproval {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    note: row.description ?? "Review this work and share your decision.",
    milestoneTitle: row.milestoneTitle,
    responseNote: row.responseNote,
    requestedAt: toIsoString(row.requestedAt),
    respondedAt: row.respondedAt ? toIsoString(row.respondedAt) : null,
  };
}

async function getProjectClient(projectId: string): Promise<AdminProjectClient | null> {
  const [assignment] = await db
    .select({
      id: clients.id,
      name: clients.contactName,
      company: clients.companyName,
      email: clients.email,
    })
    .from(projectAssignments)
    .innerJoin(clients, eq(projectAssignments.clientId, clients.id))
    .where(eq(projectAssignments.projectId, projectId))
    .orderBy(desc(projectAssignments.assignedAt))
    .limit(1);

  return assignment ?? null;
}

async function getProjectParts(projectId: string) {
  const [
    projectMilestones,
    projectTasks,
    updates,
    files,
    projectPayments,
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
        position: milestones.position,
      })
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(asc(milestones.position), asc(milestones.createdAt)),
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        isVisibleToClient: tasks.isVisibleToClient,
      })
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(asc(tasks.position), asc(tasks.createdAt)),
    db
      .select({
        id: projectUpdates.id,
        title: projectUpdates.title,
        body: projectUpdates.body,
        createdAt: projectUpdates.createdAt,
        isVisibleToClient: projectUpdates.isVisibleToClient,
      })
      .from(projectUpdates)
      .where(eq(projectUpdates.projectId, projectId))
      .orderBy(desc(projectUpdates.createdAt)),
    db
      .select({
        id: projectFiles.id,
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
      .where(eq(projectFiles.projectId, projectId))
      .orderBy(desc(projectFiles.createdAt)),
    db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        currency: payments.currency,
        status: payments.status,
        dueDate: payments.dueDate,
        paidAt: payments.paidAt,
        notes: payments.notes,
      })
      .from(payments)
      .where(eq(payments.projectId, projectId))
      .orderBy(asc(payments.dueDate), asc(payments.createdAt)),
    db
      .select({
        id: feedback.id,
        clientName: clients.contactName,
        message: feedback.message,
        status: feedback.status,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .innerJoin(clients, eq(feedback.clientId, clients.id))
      .where(eq(feedback.projectId, projectId))
      .orderBy(desc(feedback.createdAt)),
    db
      .select({
        id: approvals.id,
        title: approvals.title,
        description: approvals.description,
        status: approvals.status,
        milestoneTitle: milestones.title,
        responseNote: approvals.responseNote,
        requestedAt: approvals.requestedAt,
        respondedAt: approvals.respondedAt,
      })
      .from(approvals)
      .leftJoin(milestones, eq(approvals.milestoneId, milestones.id))
      .where(eq(approvals.projectId, projectId))
      .orderBy(desc(approvals.requestedAt)),
  ]);

  const mappedPayments: AdminProjectPayment[] = projectPayments.map((payment) => ({
    id: payment.id,
    amountCents: payment.amountCents,
    currency: payment.currency,
    status: payment.status,
    dueDate: payment.dueDate,
    paidAt: payment.paidAt ? toIsoString(payment.paidAt) : null,
    notes: payment.notes,
  }));

  const mappedApprovals = projectApprovals.map(mapApproval);

  return {
    milestones: projectMilestones.map(
      (milestone): AdminProjectMilestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description ?? "No milestone details added.",
        status: milestone.status as AdminMilestoneStatus,
        dueDate: milestone.dueDate ?? "",
        position: milestone.position,
        approvalStatus:
          mappedApprovals.find(
            (approval) => approval.milestoneTitle === milestone.title,
          )?.status ?? null,
      }),
    ),
    tasks: projectTasks.map(
      (task): AdminProjectTask => ({
        id: task.id,
        title: task.title,
        description: task.description ?? "No task details added.",
        status: task.status as AdminTaskStatus,
        dueDate: task.dueDate ?? "",
        priority: task.priority,
        isVisibleToClient: task.isVisibleToClient,
      }),
    ),
    updates: updates.map(
      (update): AdminProjectUpdate => ({
        id: update.id,
        title: update.title,
        body: update.body,
        createdAt: toIsoString(update.createdAt),
        isVisibleToClient: update.isVisibleToClient,
      }),
    ),
    files: files.map(
      (file): AdminProjectFile => ({
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        category: file.category,
        bucketName: file.bucketName,
        storagePath: file.storagePath,
        isVisibleToClient: file.isVisibleToClient,
        createdAt: toIsoString(file.createdAt),
      }),
    ),
    payments: mappedPayments,
    feedback: projectFeedback.map(
      (item): AdminProjectFeedback => ({
        id: item.id,
        clientName: item.clientName,
        message: item.message,
        status: item.status,
        createdAt: toIsoString(item.createdAt),
      }),
    ),
    approvals: mappedApprovals,
  };
}

async function mapProject(row: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  deadline: string | null;
  liveDemoUrl: string | null;
  repositoryUrl: string | null;
  createdAt: Date | string;
}): Promise<AdminProject | null> {
  const client = await getProjectClient(row.id);

  if (!client) {
    return null;
  }

  const parts = await getProjectParts(row.id);
  const budgetCents = parts.payments.reduce(
    (sum, payment) => sum + payment.amountCents,
    0,
  );
  const paidCents = parts.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amountCents, 0);

  const defaultApproval: AdminProjectApproval = {
    id: `approval-empty-${row.id}`,
    title: "No approval requested",
    status: "pending",
    note: "No approval requested yet.",
    requestedAt: toIsoString(row.createdAt),
  };

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "No project description added.",
    client,
    status: normalizeProjectStatus(row.status),
    progress: row.progress,
    deadline: row.deadline ?? "",
    liveDemoUrl: row.liveDemoUrl ?? "",
    repositoryUrl: row.repositoryUrl ?? "",
    paymentStatus: derivePaymentStatus(parts.payments),
    budgetCents,
    paidCents,
    milestones: parts.milestones,
    tasks: parts.tasks,
    updates: parts.updates,
    files: parts.files,
    payments: parts.payments,
    feedback: parts.feedback,
    approvals: parts.approvals,
    approval: parts.approvals[0] ?? defaultApproval,
    createdAt: toIsoString(row.createdAt),
  };
}

export async function getAdminProjects() {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      progress: projects.progress,
      deadline: projects.deadline,
      liveDemoUrl: projects.liveDemoUrl,
      repositoryUrl: projects.repositoryUrl,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .orderBy(desc(projects.createdAt));

  const mapped = await Promise.all(rows.map(mapProject));

  return mapped.filter((project): project is AdminProject => Boolean(project));
}

export async function getAdminProjectById(id: string) {
  const [row] = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      progress: projects.progress,
      deadline: projects.deadline,
      liveDemoUrl: projects.liveDemoUrl,
      repositoryUrl: projects.repositoryUrl,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return row ? mapProject(row) : null;
}

export async function getProjectClientOptions() {
  const rows = await db
    .select({
      id: clients.id,
      name: clients.contactName,
      company: clients.companyName,
      email: clients.email,
    })
    .from(clients)
    .where(inArray(clients.status, ["active", "inactive"]))
    .orderBy(asc(clients.companyName), asc(clients.contactName));

  return rows satisfies AdminProjectClient[];
}

async function replaceProjectPaymentSummary(
  projectId: string,
  input: {
    paymentStatus: AdminPaymentStatus;
    budgetDollars: number;
    paidDollars: number;
    deadline: string;
  },
) {
  const budgetCents = Math.round(input.budgetDollars * 100);
  const paidCents = Math.round(input.paidDollars * 100);

  await db.delete(payments).where(eq(payments.projectId, projectId));

  if (budgetCents <= 0) {
    return;
  }

  if (input.paymentStatus === "partial" && paidCents > 0 && paidCents < budgetCents) {
    await db.insert(payments).values([
      {
        projectId,
        amountCents: paidCents,
        status: "paid",
        dueDate: input.deadline,
        paidAt: new Date(),
        notes: "Paid portion",
      },
      {
        projectId,
        amountCents: budgetCents - paidCents,
        status: "unpaid",
        dueDate: input.deadline,
        notes: "Remaining balance",
      },
    ]);
    return;
  }

  await db.insert(payments).values({
    projectId,
    amountCents: budgetCents,
    status: input.paymentStatus,
    dueDate: input.deadline,
    paidAt: input.paymentStatus === "paid" ? new Date() : null,
    notes: "Project payment",
  });
}

export async function createAdminProject(input: {
  name: string;
  clientId: string;
  description: string;
  status: AdminProjectStatus;
  progress: number;
  deadline: string;
  liveDemoUrl?: string;
  repositoryUrl?: string;
  paymentStatus: AdminPaymentStatus;
  budgetDollars: number;
  paidDollars: number;
}): Promise<AdminProject> {
  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, input.clientId))
    .limit(1);

  if (!client) {
    throw new Error("Client not found.");
  }

  const created = await db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        name: input.name,
        slug: `${slugify(input.name)}-${Date.now()}`,
        description: input.description,
        status: input.status,
        progress: input.progress,
        deadline: input.deadline,
        liveDemoUrl: input.liveDemoUrl?.trim() || null,
        repositoryUrl: input.repositoryUrl?.trim() || null,
      })
      .returning({ id: projects.id });

    await tx.insert(projectAssignments).values({
      projectId: project.id,
      clientId: input.clientId,
    });

    await tx.insert(projectUpdates).values({
      projectId: project.id,
      title: "Project created",
      body: "The project workspace is ready. Add milestones, files, approvals, and payments as delivery moves forward.",
      updateType: "general",
      isVisibleToClient: true,
    });

    return project;
  });

  await replaceProjectPaymentSummary(created.id, input);

  const project = await getAdminProjectById(created.id);

  if (!project) {
    throw new Error("Project could not be loaded.");
  }

  return project;
}

export async function updateAdminProject(
  id: string,
  input: {
    name: string;
    clientId: string;
    description: string;
    status: AdminProjectStatus;
    progress: number;
    deadline: string;
    liveDemoUrl?: string;
    repositoryUrl?: string;
    paymentStatus: AdminPaymentStatus;
    budgetDollars: number;
    paidDollars: number;
  },
): Promise<AdminProject | null> {
  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, input.clientId))
    .limit(1);

  if (!client) {
    throw new Error("Client not found.");
  }

  const [updatedProject] = await db
    .update(projects)
    .set({
      name: input.name,
      description: input.description,
      status: input.status,
      progress: input.progress,
      deadline: input.deadline,
      liveDemoUrl: input.liveDemoUrl?.trim() || null,
      repositoryUrl: input.repositoryUrl?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });

  if (!updatedProject) {
    return null;
  }

  await db.transaction(async (tx) => {
    await tx.delete(projectAssignments).where(eq(projectAssignments.projectId, id));
    await tx.insert(projectAssignments).values({
      projectId: id,
      clientId: input.clientId,
    });
  });

  await replaceProjectPaymentSummary(id, input);

  return getAdminProjectById(id);
}

export async function updateProjectProgress(
  id: string,
  input: {
    progress: number;
    status: AdminProjectStatus;
  },
): Promise<AdminProject | null> {
  const [updatedProject] = await db
    .update(projects)
    .set({
      progress: input.progress,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });

  return updatedProject ? getAdminProjectById(id) : null;
}

export async function addProjectTask(
  projectId: string,
  input: {
    title: string;
    description: string;
    dueDate: string;
  },
): Promise<AdminProject | null> {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return null;
  }

  await db.insert(tasks).values({
    projectId,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    status: "todo",
    isVisibleToClient: true,
  });

  return getAdminProjectById(projectId);
}

export async function markProjectTaskComplete(projectId: string, taskId: string) {
  await db
    .update(tasks)
    .set({
      status: "completed",
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));
}

export async function addProjectMilestone(
  projectId: string,
  input: {
    title: string;
    description: string;
    dueDate: string;
  },
): Promise<AdminProject | null> {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return null;
  }

  await db.insert(milestones).values({
    projectId,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    status: "not_started",
    isVisibleToClient: true,
  });

  return getAdminProjectById(projectId);
}

export async function markProjectMilestoneComplete(
  projectId: string,
  milestoneId: string,
) {
  await db
    .update(milestones)
    .set({
      status: "completed",
      updatedAt: new Date(),
    })
    .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)));
}

export async function addProjectUpdate(
  projectId: string,
  input: {
    title: string;
    body: string;
  },
): Promise<AdminProject | null> {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return null;
  }

  await db.insert(projectUpdates).values({
    projectId,
    title: input.title,
    body: input.body,
    updateType: "general",
    isVisibleToClient: true,
  });

  return getAdminProjectById(projectId);
}
