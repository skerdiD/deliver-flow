import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  milestones,
  payments,
  projectAssignments,
  projects,
} from "@/db/schema";
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

function mapClientStatus(status: "active" | "inactive" | "archived") {
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

async function getClientProjects(clientId: string): Promise<AdminClientProject[]> {
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
      .where(inArray(payments.projectId, projectIds)),
    db
      .select({
        projectId: milestones.projectId,
        title: milestones.title,
        position: milestones.position,
        createdAt: milestones.createdAt,
      })
      .from(milestones)
      .where(inArray(milestones.projectId, projectIds))
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
}): Promise<AdminClient> {
  const clientProjects = await getClientProjects(row.id);
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
  const rows = await db
    .select({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
    })
    .from(clients)
    .where(isNull(clients.deletedAt))
    .orderBy(desc(clients.createdAt));

  return Promise.all(rows.map(mapClient));
}

export async function getAdminClientById(id: string) {
  const [row] = await db
    .select({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
    })
    .from(clients)
    .where(and(eq(clients.id, id), isNull(clients.deletedAt)))
    .limit(1);

  return row ? mapClient(row) : null;
}

export async function createAdminClient(input: {
  name: string;
  email: string;
  company?: string;
  status: AdminClientStatus;
}): Promise<AdminClient> {
  const [client] = await db
    .insert(clients)
    .values({
      contactName: input.name,
      email: normalizeEmail(input.email),
      companyName: input.company?.trim() || "Independent client",
      status: mapClientStatusForDb(input.status),
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
    .where(and(eq(clients.id, id), isNull(clients.deletedAt)))
    .returning({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
    });

  return client ? mapClient(client) : null;
}

export async function archiveAdminClient(id: string): Promise<AdminClient | null> {
  const archivedAt = new Date();
  const [client] = await db
    .update(clients)
    .set({
      status: "archived",
      archivedAt,
      updatedAt: archivedAt,
    })
    .where(and(eq(clients.id, id), isNull(clients.deletedAt)))
    .returning({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
    });

  return client ? mapClient(client) : null;
}

export async function deleteAdminClient(id: string): Promise<AdminClient | null> {
  const deletedAt = new Date();
  const [client] = await db
    .update(clients)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(and(eq(clients.id, id), isNull(clients.deletedAt)))
    .returning({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      status: clients.status,
      createdAt: clients.createdAt,
      archivedAt: clients.archivedAt,
    });

  return client ? mapClient(client) : null;
}
