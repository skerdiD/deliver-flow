import { NextResponse } from "next/server";
import { z } from "zod";

import { getProjectFileScannerWebhookSecret } from "@/features/projects/file-security.server";
import { applyProjectFileScanResult } from "@/features/projects/project-files.server";

const requestBodySchema = z.object({
  reason: z.string().trim().max(1000).optional(),
  status: z.enum(["clean", "failed", "infected"]),
});

const paramsSchema = z.object({
  fileId: z.string().uuid(),
});

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

function hasValidScannerSecret(request: Request) {
  const secret = getProjectFileScannerWebhookSecret();

  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  if (!hasValidScannerSecret(request)) {
    return jsonError("Not found.", 404);
  }

  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return jsonError("File not found.", 404);
  }

  const parsedBody = requestBodySchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return jsonError("Scan result is invalid.", 400);
  }

  const result = await applyProjectFileScanResult({
    fileId: parsedParams.data.fileId,
    reason: parsedBody.data.reason,
    status: parsedBody.data.status,
  });

  if (!result.found) {
    return jsonError("File not found.", 404);
  }

  return NextResponse.json(
    {
      cleanupQueued: result.cleanupQueued,
      success: true,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
