import { and, eq, isNull, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { projectFiles, projects } from "@/db/schema";
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

  if (!profile || profile.role !== "admin") {
    return jsonError("Admin access required.", 403);
  }

  const workspaceId = profile.workspace_id;

  const { fileId } = await params;
  const parsed = fileDownloadParamsSchema.safeParse({ fileId });

  if (!parsed.success) {
    return jsonError("File not found.", 404);
  }

  const [file] = await db
    .select({
      fileName: projectFiles.fileName,
      bucketName: projectFiles.bucketName,
      storagePath: projectFiles.storagePath,
    })
    .from(projectFiles)
    .innerJoin(projects, eq(projectFiles.projectId, projects.id))
    .where(
      and(
        eq(projectFiles.id, parsed.data.fileId),
        eq(projectFiles.workspaceId, workspaceId),
        eq(projects.workspaceId, workspaceId),
        isNull(projectFiles.deletedAt),
        ne(projects.status, "archived"),
        isNull(projects.archivedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!file) {
    return jsonError("File not found.", 404);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(file.bucketName)
    .createSignedUrl(file.storagePath, SIGNED_URL_EXPIRES_IN_SECONDS, {
      download: file.fileName,
    });

  if (error || !data?.signedUrl) {
    return jsonError("File download is temporarily unavailable.", 502);
  }

  return NextResponse.redirect(data.signedUrl, {
    status: 302,
    headers: noStoreHeaders,
  });
}
