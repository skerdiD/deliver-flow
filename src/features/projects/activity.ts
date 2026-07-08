import "server-only";

import { and, eq } from "drizzle-orm";

import { db, type Db } from "@/db";
import { projectActivity, projectViewEvents, projects } from "@/db/schema";

export type ProjectActivityActorRole = "admin" | "client" | "system";

export type ProjectViewTargetType =
  | "project"
  | "update"
  | "file"
  | "approval"
  | "payment";

export type ProjectActivityMetadata = Record<
  string,
  string | number | boolean | null
>;

type LogProjectActivityInput = {
  workspaceId?: string;
  projectId: string;
  actorId?: string | null;
  actorName?: string | null;
  actorRole: ProjectActivityActorRole;
  type: string;
  message: string;
  metadata?: ProjectActivityMetadata | null;
};

type RecordClientViewInput = {
  workspaceId?: string;
  projectId: string;
  clientId: string;
  userId: string;
  actorName?: string | null;
  targetType: ProjectViewTargetType;
  targetId?: string | null;
  message?: string;
  metadata?: ProjectActivityMetadata | null;
  logActivity?: boolean;
};

export const VIEW_ACTIVITY_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export function shouldLogViewActivity(
  previousViewedAt: Date | string | null | undefined,
  nextViewedAt: Date,
) {
  if (!previousViewedAt) {
    return true;
  }

  return (
    nextViewedAt.getTime() - new Date(previousViewedAt).getTime() >=
    VIEW_ACTIVITY_COOLDOWN_MS
  );
}

export function getDefaultViewActivityMessage(targetType: ProjectViewTargetType) {
  const labels: Record<ProjectViewTargetType, string> = {
    project: "Client viewed the project",
    update: "Client viewed a project update",
    file: "Client viewed a deliverable",
    approval: "Client viewed an approval request",
    payment: "Client viewed payment details",
  };

  return labels[targetType];
}

async function getProjectWorkspaceId(
  projectId: string,
  database: Pick<Db, "select"> = db,
) {
  const [project] = await database
    .select({ workspaceId: projects.workspaceId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project?.workspaceId ?? null;
}

function normalizeTargetId(input: Pick<RecordClientViewInput, "projectId" | "targetId">) {
  return input.targetId ?? input.projectId;
}

export async function logProjectActivity(
  input: LogProjectActivityInput,
  database: Pick<Db, "select" | "insert"> = db,
) {
  const workspaceId =
    input.workspaceId ?? (await getProjectWorkspaceId(input.projectId, database));

  if (!workspaceId) {
    throw new Error("Project workspace could not be found.");
  }

  const [activity] = await database
    .insert(projectActivity)
    .values({
      workspaceId,
      projectId: input.projectId,
      actorId: input.actorId ?? null,
      actorName: input.actorName?.trim() || null,
      actorRole: input.actorRole,
      type: input.type,
      message: input.message,
      metadata: input.metadata ?? null,
    })
    .returning({
      id: projectActivity.id,
      createdAt: projectActivity.createdAt,
    });

  return activity;
}

export async function recordClientViewEvent(
  input: RecordClientViewInput,
  database: Pick<Db, "select" | "insert"> = db,
) {
  const targetId = normalizeTargetId(input);
  const viewedAt = new Date();
  const workspaceId =
    input.workspaceId ?? (await getProjectWorkspaceId(input.projectId, database));

  if (!workspaceId) {
    throw new Error("Project workspace could not be found.");
  }

  const [existingView] = await database
    .select({ viewedAt: projectViewEvents.viewedAt })
    .from(projectViewEvents)
    .where(
      and(
        eq(projectViewEvents.projectId, input.projectId),
        eq(projectViewEvents.clientId, input.clientId),
        eq(projectViewEvents.targetType, input.targetType),
        eq(projectViewEvents.targetId, targetId),
      ),
    )
    .limit(1);

  await database
    .insert(projectViewEvents)
    .values({
      workspaceId,
      projectId: input.projectId,
      clientId: input.clientId,
      userId: input.userId,
      targetType: input.targetType,
      targetId,
      viewedAt,
    })
    .onConflictDoUpdate({
      target: [
        projectViewEvents.projectId,
        projectViewEvents.clientId,
        projectViewEvents.targetType,
        projectViewEvents.targetId,
      ],
      set: {
        userId: input.userId,
        viewedAt,
      },
    });

  const loggedActivity =
    input.logActivity !== false &&
    shouldLogViewActivity(existingView?.viewedAt, viewedAt);

  if (loggedActivity) {
    await logProjectActivity(
      {
        projectId: input.projectId,
        workspaceId,
        actorId: input.userId,
        actorName: input.actorName,
        actorRole: "client",
        type: `client_viewed_${input.targetType}`,
        message:
          input.message ?? getDefaultViewActivityMessage(input.targetType),
        metadata: {
          ...(input.metadata ?? {}),
          targetType: input.targetType,
          targetId,
        },
      },
      database,
    );
  }

  return {
    viewedAt,
    loggedActivity,
  };
}
