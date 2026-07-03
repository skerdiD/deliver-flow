import { BadgeCheck, FileText, FolderOpen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientApprovalStatusBadge } from "@/features/client/portal/client-project-status-badge";
import type {
  ClientPortalApproval,
  ClientPortalFile,
} from "@/features/client/portal/types";
import { formatShortDate } from "@/lib/format";

type ClientFilesPreviewCardProps = {
  projectId: string;
  files: ClientPortalFile[];
};

type ClientApprovalPreviewCardProps = {
  projectId: string;
  approvals: ClientPortalApproval[];
};

export function ClientFilesPreviewCard({
  projectId,
  files,
}: ClientFilesPreviewCardProps) {
  const visibleFiles = files.slice(0, 3);
  const href = `/client/files?projectId=${encodeURIComponent(projectId)}`;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Files preview</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Latest files shared for this project.
            </p>
          </div>

          <Button asChild variant="outline" className="h-9 shrink-0 px-3 sm:w-auto">
            <Link href={href} prefetch>
              View all
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {visibleFiles.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            Files will appear here when they are ready for you.
          </p>
        ) : (
          visibleFiles.map((file) => (
            <div
              key={file.id}
              className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-950">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {file.category} - {formatShortDate(file.uploadedAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function ClientApprovalPreviewCard({
  projectId,
  approvals,
}: ClientApprovalPreviewCardProps) {
  const pendingApproval = approvals.find(
    (approval) => approval.status === "pending",
  );
  const latestApproval = pendingApproval ?? approvals[0] ?? null;
  const href = `/client/approvals?projectId=${encodeURIComponent(projectId)}`;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Approval preview</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Review requests and recent approval decisions.
            </p>
          </div>

          <Button asChild variant="outline" className="h-9 shrink-0 px-3 sm:w-auto">
            <Link href={href} prefetch>
              View all
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!latestApproval ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center">
            <div className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
              <FolderOpen className="size-5" />
            </div>
            <p className="font-semibold text-slate-950">
              No approvals requested yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
              Approval requests will appear here when work is ready for review.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <BadgeCheck className="size-4 text-slate-500" />
                  <ClientApprovalStatusBadge status={latestApproval.status} />
                </div>
                <p className="mt-3 break-words font-semibold text-slate-950">
                  {latestApproval.title}
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                  {latestApproval.description}
                </p>
              </div>
              <p className="shrink-0 text-xs text-slate-500">
                Requested {formatShortDate(latestApproval.requestedAt)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
