import { and, eq, isNull, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { db } from "@/db";
import {
  clients,
  projectAssignments,
  projectFiles,
  projects,
} from "@/db/schema";
import { getFileDownloadAccessDecision } from "@/app/api/client/files/[fileId]/download/access-policy";
import { recordClientViewEvent } from "@/features/projects/activity";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/supabase/auth";

const SIGNED_URL_EXPIRES_IN_SECONDS = 60;
const fileDownloadParamsSchema = z.object({
  fileId: z.string().uuid(),
});
const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: noStoreHeaders,
    },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const profile = await getCurrentProfile();

  if (!profile) {
    const decision = getFileDownloadAccessDecision({
      isAuthenticated: false,
      fileIdIsValid: false,
      fileIsAuthorized: false,
    });

    if (decision.type === "deny") {
      return jsonError(decision.message, decision.status);
    }

    return jsonError("Authentication required.", 401);
  }

  const roleDecision = getFileDownloadAccessDecision({
    isAuthenticated: true,
    role: profile.role,
    fileIdIsValid: true,
    fileIsAuthorized: true,
  });

  if (roleDecision.type === "deny") {
    return jsonError(roleDecision.message, roleDecision.status);
  }

  const { fileId } = await params;
  const parsed = fileDownloadParamsSchema.safeParse({ fileId });

  if (!parsed.success) {
    const fileIdDecision = getFileDownloadAccessDecision({
      isAuthenticated: true,
      role: profile.role,
      fileIdIsValid: false,
      fileIsAuthorized: true,
    });

    if (fileIdDecision.type === "deny") {
      return jsonError(fileIdDecision.message, fileIdDecision.status);
    }

    return jsonError("File not found.", 404);
  }

  const [file] = await db
    .select({
      id: projectFiles.id,
      projectId: projectFiles.projectId,
      clientId: clients.id,
      fileName: projectFiles.fileName,
      bucketName: projectFiles.bucketName,
      storagePath: projectFiles.storagePath,
    })
    .from(projectFiles)
    .innerJoin(projects, eq(projectFiles.projectId, projects.id))
    .innerJoin(
      projectAssignments,
      eq(projectAssignments.projectId, projects.id),
    )
    .innerJoin(clients, eq(projectAssignments.clientId, clients.id))
    .where(
      and(
        eq(projectFiles.id, parsed.data.fileId),
        eq(projectFiles.isVisibleToClient, true),
        isNull(projectFiles.deletedAt),
        ne(projects.status, "archived"),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
        eq(clients.profileId, profile.id),
        eq(clients.status, "active"),
        isNull(clients.archivedAt),
        isNull(clients.deletedAt),
      ),
    )
    .limit(1);

  if (!file) {
    const fileDecision = getFileDownloadAccessDecision({
      isAuthenticated: true,
      role: profile.role,
      fileIdIsValid: true,
      fileIsAuthorized: false,
    });

    if (fileDecision.type === "deny") {
      return jsonError(fileDecision.message, fileDecision.status);
    }
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(file.bucketName)
    .createSignedUrl(file.storagePath, SIGNED_URL_EXPIRES_IN_SECONDS, {
      download: file.fileName,
    });

  if (error || !data?.signedUrl) {
    Sentry.captureException(error ?? new Error("Signed URL missing"), {
      tags: {
        feature: "client-file-download",
        operation: "create-signed-url",
      },
      extra: {
        bucketName: file.bucketName,
        fileType: file.fileName.split(".").pop() ?? "unknown",
      },
    });

    return jsonError("File download is temporarily unavailable.", 502);
  }

  await recordClientViewEvent({
    projectId: file.projectId,
    clientId: file.clientId,
    userId: profile.id,
    actorName: profile.full_name?.trim() || profile.email,
    targetType: "file",
    targetId: file.id,
    message: `Client viewed deliverable: ${file.fileName}.`,
    metadata: {
      fileName: file.fileName,
    },
  });

  return NextResponse.redirect(data.signedUrl, {
    status: 302,
    headers: noStoreHeaders,
  });
}
