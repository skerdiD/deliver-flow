import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  milestones,
  payments,
  projectAssignments,
  projects,
} from "@/db/schema";
import { requireAdminWorkspace } from "@/lib/supabase/auth";
import type {
  AdminClient,
  AdminClientProject,
  AdminClientProjectStatus,
  AdminClientStatus,
} from "@/features/admin/clients/types";

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapClientStatus(
  status: "active" | "inactive" | "archived",
): AdminClientStatus {
  if (status === "inactive") {
    return "paused";
  }

  return status;
}

function mapClientStatusForDb(status: AdminClientStatus) {
  if (status === "paused") {
    return "inactive";
  }

  return status;
}

function mapProjectStatus(status: string): AdminClientProjectStatus {
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

async function getClientProjects(
  clientId: string,
  workspaceId: string,
): Promise<AdminClientProject[]> {
  const projectRows = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      progress: projects.progress,
      deadline: projects.deadline,
    })
    .from(projectAssignments)
    .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
    .where(
      and(
        eq(projectAssignments.clientId, clientId),
        eq(projectAssignments.workspaceId, workspaceId),
        eq(projects.workspaceId, workspaceId),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(desc(projectAssignments.assignedAt));

  if (projectRows.length === 0) {
    return [];
  }

  const projectIds = projectRows.map((project) => project.id);

  const [paymentRows, milestoneRows] = await Promise.all([
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
          eq(payments.workspaceId, workspaceId),
        ),
      ),
    db
      .select({
        projectId: milestones.projectId,
        title: milestones.title,
        position: milestones.position,
        createdAt: milestones.createdAt,
      })
      .from(milestones)
      .where(
        and(
          inArray(milestones.projectId, projectIds),
          eq(milestones.workspaceId, workspaceId),
        ),
      )
      .orderBy(milestones.position, milestones.createdAt),
  ]);

  return projectRows.map((project) => {
    const projectPayments = paymentRows.filter(
      (payment) => payment.projectId === project.id,
    );
    const nextMilestone = milestoneRows.find(
      (milestone) => milestone.projectId === project.id,
    );

    return {
      id: project.id,
      name: project.name,
      status: mapProjectStatus(project.status),
      progress: project.progress,
      budgetCents: projectPayments.reduce(
        (sum, payment) => sum + payment.amountCents,
        0,
      ),
      paidCents: projectPayments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amountCents, 0),
      nextMilestone: nextMilestone?.title ?? "No milestone added yet",
      deadline: project.deadline ?? "",
    };
  });
}

async function mapClient(row: {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: "active" | "inactive" | "archived";
  createdAt: Date | string;
  archivedAt: Date | string | null;
  workspaceId: string;
}): Promise<AdminClient> {
  const clientProjects = await getClientProjects(row.id, row.workspaceId);
  const totalPaidCents = clientProjects.reduce(
    (sum, project) => sum + project.paidCents,
    0,
  );

  return {
    id: row.id,
    name: row.contactName,
    company: row.companyName,
    email: row.email,
    status: mapClientStatus(row.status),
    activeProjects: clientProjects.filter(
      (project) => project.status !== "completed",
    ).length,
    totalPaidCents,
    latestActivity:
      clientProjects.length > 0
        ? `${clientProjects.length} project${clientProjects.length === 1 ? "" : "s"} assigned`
        : "Client profile ready",
    createdAt: toIsoString(row.createdAt),
    archivedAt: row.archivedAt ? toIsoString(row.archivedAt) : null,
    projects: clientProjects,
  };
}

export async function getAdminClients() {
  const { workspaceId } = await requireAdminWorkspace();

  const rows = await db
    .select({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
      workspaceId: clients.workspaceId,
    })
    .from(clients)
    .where(and(eq(clients.workspaceId, workspaceId), isNull(clients.deletedAt)))
    .orderBy(desc(clients.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const clientIds = rows.map((client) => client.id);

  const projectRows = await db
    .select({
      clientId: projectAssignments.clientId,
      projectId: projects.id,
      name: projects.name,
      status: projects.status,
      progress: projects.progress,
      deadline: projects.deadline,
      assignedAt: projectAssignments.assignedAt,
    })
    .from(projectAssignments)
    .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
    .where(
      and(
        inArray(projectAssignments.clientId, clientIds),
        eq(projectAssignments.workspaceId, workspaceId),
        eq(projects.workspaceId, workspaceId),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(desc(projectAssignments.assignedAt));

  const projectIds = projectRows.map((project) => project.projectId);

  const [paymentRows, milestoneRows] =
    projectIds.length > 0
      ? await Promise.all([
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
                eq(payments.workspaceId, workspaceId),
                isNull(payments.deletedAt),
              ),
            ),
          db
            .select({
              projectId: milestones.projectId,
              title: milestones.title,
              position: milestones.position,
              createdAt: milestones.createdAt,
            })
            .from(milestones)
            .where(
              and(
                inArray(milestones.projectId, projectIds),
                eq(milestones.workspaceId, workspaceId),
              ),
            )
            .orderBy(milestones.position, milestones.createdAt),
        ])
      : [[], []];

  const paymentsByProjectId = new Map<string, typeof paymentRows>();
  for (const payment of paymentRows) {
    const projectPayments = paymentsByProjectId.get(payment.projectId) ?? [];
    projectPayments.push(payment);
    paymentsByProjectId.set(payment.projectId, projectPayments);
  }

  const firstMilestoneByProjectId = new Map<string, string>();
  for (const milestone of milestoneRows) {
    if (!firstMilestoneByProjectId.has(milestone.projectId)) {
      firstMilestoneByProjectId.set(milestone.projectId, milestone.title);
    }
  }

  const projectsByClientId = new Map<string, AdminClientProject[]>();
  for (const project of projectRows) {
    const projectPayments = paymentsByProjectId.get(project.projectId) ?? [];
    const clientProjects = projectsByClientId.get(project.clientId) ?? [];
    clientProjects.push({
      id: project.projectId,
      name: project.name,
      status: mapProjectStatus(project.status),
      progress: project.progress,
      budgetCents: projectPayments.reduce(
        (sum, payment) => sum + payment.amountCents,
        0,
      ),
      paidCents: projectPayments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amountCents, 0),
      nextMilestone:
        firstMilestoneByProjectId.get(project.projectId) ??
        "No milestone added yet",
      deadline: project.deadline ?? "",
    });
    projectsByClientId.set(project.clientId, clientProjects);
  }

  return rows.map((row) => {
    const clientProjects = projectsByClientId.get(row.id) ?? [];
    const totalPaidCents = clientProjects.reduce(
      (sum, project) => sum + project.paidCents,
      0,
    );

    return {
      id: row.id,
      name: row.contactName,
      company: row.companyName,
      email: row.email,
      status: mapClientStatus(row.status),
      activeProjects: clientProjects.filter(
        (project) => project.status !== "completed",
      ).length,
      totalPaidCents,
      latestActivity:
        clientProjects.length > 0
          ? `${clientProjects.length} project${clientProjects.length === 1 ? "" : "s"} assigned`
          : "Client profile ready",
      createdAt: toIsoString(row.createdAt),
      archivedAt: row.archivedAt ? toIsoString(row.archivedAt) : null,
      projects: clientProjects,
    };
  });
}

export async function getAdminClientById(id: string) {
  const { workspaceId } = await requireAdminWorkspace();

  const [row] = await db
    .select({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
      workspaceId: clients.workspaceId,
    })
    .from(clients)
    .where(
      and(
        eq(clients.id, id),
        eq(clients.workspaceId, workspaceId),
        isNull(clients.deletedAt),
      ),
    )
    .limit(1);

  return row ? mapClient(row) : null;
}

export async function createAdminClient(input: {
  name: string;
  email: string;
  company?: string;
  status: AdminClientStatus;
}): Promise<AdminClient> {
  const { profile, workspaceId } = await requireAdminWorkspace();

  const [client] = await db
    .insert(clients)
    .values({
      workspaceId,
      contactName: input.name,
      email: normalizeEmail(input.email),
      companyName: input.company?.trim() || "Independent client",
      status: mapClientStatusForDb(input.status),
      createdBy: profile.id,
      archivedAt: input.status === "archived" ? new Date() : null,
      deletedAt: null,
    })
    .returning({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
      workspaceId: clients.workspaceId,
    });

  return mapClient(client);
}

export async function updateAdminClient(
  id: string,
  input: {
    name: string;
    email: string;
    company?: string;
    status: AdminClientStatus;
  },
): Promise<AdminClient | null> {
  const { workspaceId } = await requireAdminWorkspace();

  const [client] = await db
    .update(clients)
    .set({
      contactName: input.name,
      email: normalizeEmail(input.email),
      companyName: input.company?.trim() || "Independent client",
      status: mapClientStatusForDb(input.status),
      archivedAt: input.status === "archived" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(clients.id, id),
        eq(clients.workspaceId, workspaceId),
        isNull(clients.deletedAt),
      ),
    )
    .returning({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
      workspaceId: clients.workspaceId,
    });

  return client ? mapClient(client) : null;
}

export async function archiveAdminClient(
  id: string,
): Promise<AdminClient | null> {
  const { workspaceId } = await requireAdminWorkspace();
  const archivedAt = new Date();
  const [client] = await db
    .update(clients)
    .set({
      status: "archived",
      archivedAt,
      updatedAt: archivedAt,
    })
    .where(
      and(
        eq(clients.id, id),
        eq(clients.workspaceId, workspaceId),
        isNull(clients.deletedAt),
      ),
    )
    .returning({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
      workspaceId: clients.workspaceId,
    });

  return client ? mapClient(client) : null;
}

export async function deleteAdminClient(
  id: string,
): Promise<AdminClient | null> {
  const { workspaceId } = await requireAdminWorkspace();
  const deletedAt = new Date();
  const [client] = await db
    .update(clients)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(
      and(
        eq(clients.id, id),
        eq(clients.workspaceId, workspaceId),
        isNull(clients.deletedAt),
      ),
    )
    .returning({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
      workspaceId: clients.workspaceId,
    });

  return client ? mapClient(client) : null;
}
