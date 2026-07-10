import "server-only";

import * as Sentry from "@sentry/nextjs";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { projectFileCleanupJobs, projectFiles, workspaces } from "@/db/schema";
import {
  getProjectFileSecurityConfig,
  type ProjectFileSecurityConfig,
} from "@/features/projects/file-security.server";
import { isManagedProjectFileStoragePath } from "@/features/projects/file-security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CleanupReason =
  | "delete_failed"
  | "infected_file"
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

export async function applyProjectFileScanResult(input: {
  fileId: string;
  reason?: string | null;
  status: "clean" | "failed" | "infected";
}) {
  const [file] = await db
    .update(projectFiles)
    .set({
      scanCompletedAt: new Date(),
      scanFailureReason: input.reason?.trim() || null,
      scanStatus: input.status,
      updatedAt: new Date(),
    })
    .where(eq(projectFiles.id, input.fileId))
    .returning({
      bucketName: projectFiles.bucketName,
      id: projectFiles.id,
      projectId: projectFiles.projectId,
      storagePath: projectFiles.storagePath,
      workspaceId: projectFiles.workspaceId,
    });

  if (!file) {
    return {
      cleanupQueued: false,
      found: false,
    };
  }

  if (input.status !== "infected") {
    return {
      cleanupQueued: false,
      found: true,
    };
  }

  const cleanupOutcome = await removeProjectFileStorageObject({
    bucketName: file.bucketName,
    fileId: file.id,
    projectId: file.projectId,
    reason: "infected_file",
    storagePath: file.storagePath,
    workspaceId: file.workspaceId,
  });

  return {
    cleanupQueued: cleanupOutcome.cleanupQueued,
    found: true,
  };
}

export async function runInitialProjectFileScan(input: {
  fileId: string;
  projectId: string;
  workspaceId: string;
}) {
  const config = getProjectFileSecurityConfig();

  if (config.scanMode !== "development-noop") {
    return {
      mode: config.scanMode,
      status: "pending" as const,
    };
  }

  await applyProjectFileScanResult({
    fileId: input.fileId,
    status: "clean",
  });

  return {
    mode: config.scanMode,
    status: "clean" as const,
  };
}

export function getProjectFileSecuritySummary(
  config: ProjectFileSecurityConfig = getProjectFileSecurityConfig(),
) {
  return {
    maxFilesPerUpload: config.maxFilesPerUpload,
    maxUploadBytes: config.maxUploadBytes,
    scanMode: config.scanMode,
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
