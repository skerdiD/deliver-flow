import "server-only";

import { and, count, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db, type Db } from "@/db";
import {
  clients,
  notifications,
  profiles,
  projectAssignments,
  projects,
} from "@/db/schema";
import type {
  NotificationCenterState,
  NotificationEntityType,
  NotificationListItem,
  NotificationType,
} from "@/features/notifications/types";
import { requireCurrentProfile } from "@/lib/supabase/auth";

type NotificationDatabase = Pick<Db, "insert" | "select" | "update">;

export type CreateNotificationInput = {
  workspaceId: string;
  recipientProfileId: string;
  actorProfileId?: string | null;
  projectId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: NotificationEntityType | null;
  entityId?: string | null;
  actionUrl?: string | null;
  dedupeKey?: string | null;
};

export type CreateNotificationsForRecipientsInput = Omit<
  CreateNotificationInput,
  "dedupeKey" | "recipientProfileId"
> & {
  dedupeKey?: string | null;
  recipientProfileIds: string[];
  skipActorRecipient?: boolean;
};

function toIsoString(value: Date | string | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function uniqueIds(ids: Array<string | null | undefined>) {
  return Array.from(
    new Set(ids.filter((value): value is string => Boolean(value))),
  );
}

function buildRecipientScopedDedupeKey(
  baseKey: string | null | undefined,
  recipientProfileId: string,
) {
  if (!baseKey) {
    return null;
  }

  return `${baseKey}:${recipientProfileId}`;
}

async function verifyProjectWorkspace(
  projectId: string,
  workspaceId: string,
  database: NotificationDatabase,
) {
  const [project] = await database
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspaceId, workspaceId),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  return Boolean(project);
}

async function getVerifiedRecipientProfileIds(
  workspaceId: string,
  recipientProfileIds: string[],
  database: NotificationDatabase,
) {
  const ids = uniqueIds(recipientProfileIds);

  if (ids.length === 0) {
    return [];
  }

  const rows = await database
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      and(eq(profiles.workspaceId, workspaceId), inArray(profiles.id, ids)),
    );

  return rows.map((row) => row.id);
}

async function verifyActorProfile(
  actorProfileId: string,
  workspaceId: string,
  database: NotificationDatabase,
) {
  const [actor] = await database
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      and(
        eq(profiles.id, actorProfileId),
        eq(profiles.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  return Boolean(actor);
}

function mapNotificationRow(row: {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  projectId: string | null;
  projectName: string | null;
  actorEmail: string | null;
  actorFullName: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
}): NotificationListItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    actionUrl: row.actionUrl,
    entityType: row.entityType,
    entityId: row.entityId,
    projectId: row.projectId,
    projectName: row.projectName,
    actorName: row.actorFullName?.trim() || row.actorEmail || null,
    readAt: toIsoString(row.readAt),
    createdAt: toIsoString(row.createdAt) ?? new Date().toISOString(),
  };
}

export async function createNotification(
  input: CreateNotificationInput,
  database: NotificationDatabase = db,
) {
  const verifiedRecipients = await getVerifiedRecipientProfileIds(
    input.workspaceId,
    [input.recipientProfileId],
    database,
  );

  if (verifiedRecipients.length === 0) {
    return {
      inserted: false,
    };
  }

  if (input.actorProfileId) {
    const actorExists = await verifyActorProfile(
      input.actorProfileId,
      input.workspaceId,
      database,
    );

    if (!actorExists) {
      throw new Error("Notification actor is not in the workspace.");
    }
  }

  if (input.projectId) {
    const projectExists = await verifyProjectWorkspace(
      input.projectId,
      input.workspaceId,
      database,
    );

    if (!projectExists) {
      throw new Error("Notification project is not in the workspace.");
    }
  }

  const insertQuery = database.insert(notifications).values({
    workspaceId: input.workspaceId,
    recipientProfileId: input.recipientProfileId,
    actorProfileId: input.actorProfileId ?? null,
    projectId: input.projectId ?? null,
    type: input.type,
    title: input.title,
    message: input.message,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    actionUrl: input.actionUrl ?? null,
    dedupeKey: input.dedupeKey ?? null,
  });

  const rows = input.dedupeKey
    ? await insertQuery
        .onConflictDoNothing({
          target: notifications.dedupeKey,
        })
        .returning({ id: notifications.id })
    : await insertQuery.returning({ id: notifications.id });

  return {
    inserted: rows.length > 0,
  };
}

export async function createNotificationsForRecipients(
  input: CreateNotificationsForRecipientsInput,
  database: NotificationDatabase = db,
) {
  const verifiedRecipients = await getVerifiedRecipientProfileIds(
    input.workspaceId,
    input.recipientProfileIds,
    database,
  );
  const recipientProfileIds = verifiedRecipients.filter(
    (recipientProfileId) =>
      !input.skipActorRecipient || recipientProfileId !== input.actorProfileId,
  );

  if (recipientProfileIds.length === 0) {
    return {
      insertedCount: 0,
    };
  }

  if (input.actorProfileId) {
    const actorExists = await verifyActorProfile(
      input.actorProfileId,
      input.workspaceId,
      database,
    );

    if (!actorExists) {
      throw new Error("Notification actor is not in the workspace.");
    }
  }

  if (input.projectId) {
    const projectExists = await verifyProjectWorkspace(
      input.projectId,
      input.workspaceId,
      database,
    );

    if (!projectExists) {
      throw new Error("Notification project is not in the workspace.");
    }
  }

  const values = recipientProfileIds.map((recipientProfileId) => ({
    workspaceId: input.workspaceId,
    recipientProfileId,
    actorProfileId: input.actorProfileId ?? null,
    projectId: input.projectId ?? null,
    type: input.type,
    title: input.title,
    message: input.message,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    actionUrl: input.actionUrl ?? null,
    dedupeKey: buildRecipientScopedDedupeKey(
      input.dedupeKey,
      recipientProfileId,
    ),
  }));

  const insertQuery = database.insert(notifications).values(values);
  const rows = input.dedupeKey
    ? await insertQuery
        .onConflictDoNothing({
          target: notifications.dedupeKey,
        })
        .returning({ id: notifications.id })
    : await insertQuery.returning({ id: notifications.id });

  return {
    insertedCount: rows.length,
  };
}

export async function getAssignedClientRecipientProfileIds(
  projectId: string,
  workspaceId: string,
  database: Pick<Db, "select"> = db,
) {
  const rows = await database
    .select({
      profileId: clients.profileId,
    })
    .from(projectAssignments)
    .innerJoin(clients, eq(projectAssignments.clientId, clients.id))
    .where(
      and(
        eq(projectAssignments.projectId, projectId),
        eq(projectAssignments.workspaceId, workspaceId),
        eq(clients.workspaceId, workspaceId),
        isNotNull(clients.profileId),
        eq(clients.status, "active"),
        isNull(clients.archivedAt),
        isNull(clients.deletedAt),
      ),
    );

  return uniqueIds(rows.map((row) => row.profileId));
}

export async function getWorkspaceOwnerRecipientProfileIds(
  workspaceId: string,
  database: Pick<Db, "select"> = db,
) {
  const rows = await database
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      and(eq(profiles.workspaceId, workspaceId), eq(profiles.role, "owner")),
    );

  return rows.map((row) => row.id);
}

export async function listNotificationsForCurrentUser(
  options?: {
    limit?: number;
  },
  database: NotificationDatabase = db,
) {
  const profile = await requireCurrentProfile();
  const actorProfiles = alias(profiles, "notification_actor_profiles");
  const limit = options?.limit ?? 25;

  const rows = await database
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      actionUrl: notifications.actionUrl,
      entityType: notifications.entityType,
      entityId: notifications.entityId,
      projectId: notifications.projectId,
      projectName: projects.name,
      actorEmail: actorProfiles.email,
      actorFullName: actorProfiles.fullName,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .leftJoin(projects, eq(notifications.projectId, projects.id))
    .leftJoin(actorProfiles, eq(notifications.actorProfileId, actorProfiles.id))
    .where(
      and(
        eq(notifications.recipientProfileId, profile.id),
        eq(notifications.workspaceId, profile.workspace_id),
      ),
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return rows.map(mapNotificationRow);
}

export async function countUnreadNotificationsForCurrentUser(
  database: NotificationDatabase = db,
) {
  const profile = await requireCurrentProfile();
  const [row] = await database
    .select({
      value: count(),
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientProfileId, profile.id),
        eq(notifications.workspaceId, profile.workspace_id),
        isNull(notifications.readAt),
      ),
    );

  return row?.value ?? 0;
}

export async function getNotificationCenterState(
  options?: {
    limit?: number;
  },
  database: NotificationDatabase = db,
): Promise<NotificationCenterState> {
  const [notificationRows, unreadCount] = await Promise.all([
    listNotificationsForCurrentUser(options, database),
    countUnreadNotificationsForCurrentUser(database),
  ]);

  return {
    notifications: notificationRows,
    unreadCount,
  };
}

export async function markNotificationAsReadForCurrentUser(
  notificationId: string,
  database: NotificationDatabase = db,
) {
  const profile = await requireCurrentProfile();
  const readAt = new Date();
  const [row] = await database
    .update(notifications)
    .set({
      readAt,
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientProfileId, profile.id),
        eq(notifications.workspaceId, profile.workspace_id),
        isNull(notifications.readAt),
      ),
    )
    .returning({
      actionUrl: notifications.actionUrl,
      id: notifications.id,
      readAt: notifications.readAt,
    });

  return {
    actionUrl: row?.actionUrl ?? null,
    updated: Boolean(row),
  };
}

export async function markAllNotificationsAsReadForCurrentUser(
  database: NotificationDatabase = db,
) {
  const profile = await requireCurrentProfile();
  const readAt = new Date();
  const rows = await database
    .update(notifications)
    .set({
      readAt,
    })
    .where(
      and(
        eq(notifications.recipientProfileId, profile.id),
        eq(notifications.workspaceId, profile.workspace_id),
        isNull(notifications.readAt),
      ),
    )
    .returning({ id: notifications.id });

  return {
    updatedCount: rows.length,
  };
}
