import "server-only";

import * as Sentry from "@sentry/nextjs";
import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { projectFileCleanupJobs, projectFiles, workspaces } from "@/db/schema";
import { getClientFileNotificationUrl } from "@/features/notifications/notification-links";
import {
  createNotificationsForRecipients,
  getAssignedClientRecipientProfileIds,
} from "@/features/notifications/notification-service";
import {
  getProjectFileSecurityConfig,
  type ProjectFileSecurityConfig,
} from "@/features/projects/file-security.server";
import { isManagedProjectFileStoragePath } from "@/features/projects/file-security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CleanupReason =
  | "delete_failed"
  | "project_deleted"
  | "replacement_old_object"
  | "upload_db_failed";

export type ProjectFileCleanupOutcome = {
  cleanupQueued: boolean;
  deleted: boolean;
};

function getProjectFileSecurityContext() {
  return {
    config: getProjectFileSecurityConfig(),
    supabase: createSupabaseAdminClient(),
  };
}

export async function reserveWorkspaceStorageBytes(input: {
  additionalBytes: number;
  workspaceId: string;
}) {
  if (input.additionalBytes <= 0) {
    return {
      allowed: true,
      quotaBytes: null,
      usedBytes: null,
    };
  }

  const [workspace] = await db
    .update(workspaces)
    .set({
      storageUsedBytes: sql`${workspaces.storageUsedBytes} + ${input.additionalBytes}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workspaces.id, input.workspaceId),
        sql`${workspaces.storageUsedBytes} + ${input.additionalBytes} <= ${workspaces.storageQuotaBytes}`,
      ),
    )
    .returning({
      quotaBytes: workspaces.storageQuotaBytes,
      usedBytes: workspaces.storageUsedBytes,
    });

  return workspace
    ? {
        allowed: true,
        quotaBytes: workspace.quotaBytes,
        usedBytes: workspace.usedBytes,
      }
    : { allowed: false, quotaBytes: null, usedBytes: null };
}

export async function releaseWorkspaceStorageBytes(input: {
  releasedBytes: number;
  workspaceId: string;
}) {
  if (input.releasedBytes <= 0) {
    return;
  }

  await db
    .update(workspaces)
    .set({
      storageUsedBytes: sql`greatest(${workspaces.storageUsedBytes} - ${input.releasedBytes}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, input.workspaceId));
}

export async function queueProjectFileCleanupJob(input: {
  bucketName: string;
  fileId?: string | null;
  lastError?: string | null;
  projectId?: string | null;
  reason: CleanupReason;
  storagePath: string;
  workspaceId: string;
}) {
  await db.insert(projectFileCleanupJobs).values({
    bucketName: input.bucketName,
    fileId: input.fileId ?? null,
    lastError: input.lastError ?? null,
    projectId: input.projectId ?? null,
    reason: input.reason,
    storagePath: input.storagePath,
    workspaceId: input.workspaceId,
  });
}

export async function removeProjectFileStorageObject(input: {
  bucketName: string;
  fileId?: string | null;
  projectId?: string | null;
  reason: CleanupReason;
  storagePath: string;
  workspaceId: string;
}): Promise<ProjectFileCleanupOutcome> {
  const { supabase } = getProjectFileSecurityContext();
  const { error } = await supabase.storage
    .from(input.bucketName)
    .remove([input.storagePath]);

  if (!error) {
    return {
      cleanupQueued: false,
      deleted: true,
    };
  }

  await queueProjectFileCleanupJob({
    bucketName: input.bucketName,
    fileId: input.fileId,
    lastError: error.message,
    projectId: input.projectId,
    reason: input.reason,
    storagePath: input.storagePath,
    workspaceId: input.workspaceId,
  });

  Sentry.captureException(error, {
    tags: {
      feature: "project-files",
      operation: "remove-storage-object",
    },
    extra: {
      bucketName: input.bucketName,
      fileId: input.fileId ?? null,
      projectId: input.projectId ?? null,
      reason: input.reason,
      storagePath: input.storagePath,
      workspaceId: input.workspaceId,
    },
  });

  return {
    cleanupQueued: true,
    deleted: false,
  };
}

export async function notifyProjectFileAvailable(input: {
  fileId: string;
  workspaceId: string;
}) {
  const [file] = await db
    .select({
      id: projectFiles.id,
      fileName: projectFiles.fileName,
      isVisibleToClient: projectFiles.isVisibleToClient,
      projectId: projectFiles.projectId,
      uploadedBy: projectFiles.uploadedBy,
      workspaceId: projectFiles.workspaceId,
    })
    .from(projectFiles)
    .where(
      and(
        eq(projectFiles.id, input.fileId),
        eq(projectFiles.workspaceId, input.workspaceId),
        isNull(projectFiles.deletedAt),
      ),
    )
    .limit(1);

  if (!file?.isVisibleToClient) {
    return;
  }

  try {
    const recipientProfileIds = await getAssignedClientRecipientProfileIds(
      file.projectId,
      file.workspaceId,
    );

    await createNotificationsForRecipients({
      workspaceId: file.workspaceId,
      recipientProfileIds,
      actorProfileId: file.uploadedBy ?? null,
      projectId: file.projectId,
      type: "project_file_uploaded",
      title: "New project file available",
      message: `A new file is ready: ${file.fileName}.`,
      entityType: "project_file",
      entityId: file.id,
      actionUrl: getClientFileNotificationUrl(file.projectId),
      dedupeKey: `project_file_uploaded:${file.id}`,
      skipActorRecipient: true,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: "notifications",
        operation: "project-file-uploaded",
      },
      extra: {
        fileId: file.id,
        projectId: file.projectId,
        workspaceId: file.workspaceId,
      },
    });
  }
}

export function getProjectFileSecuritySummary(
  config: ProjectFileSecurityConfig = getProjectFileSecurityConfig(),
) {
  return {
    maxFilesPerUpload: config.maxFilesPerUpload,
    maxUploadBytes: config.maxUploadBytes,
    signedUrlExpiresInSeconds: config.signedUrlExpiresInSeconds,
    workspaceQuotaBytes: config.workspaceQuotaBytes,
  };
}

export function isProjectFileRecordConsistent(input: {
  projectId: string;
  storagePath: string;
  workspaceId: string;
}) {
  return isManagedProjectFileStoragePath(input);
}
