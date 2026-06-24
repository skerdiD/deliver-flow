import { Files } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminProjectFile } from "@/features/admin/projects/types";
import { formatShortDate } from "@/lib/format";

type ProjectFilesCardProps = {
  files: AdminProjectFile[];
};

export function ProjectFilesCard({ files }: ProjectFilesCardProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <p className="text-sm text-slate-500">
          Files connected to this project and what the client can see.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {files.length === 0 ? (
          <EmptyState
            icon={Files}
            title="No files connected yet"
            description="Files will show here after they are added to the project."
          />
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">
                    {file.fileName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {file.fileType ?? "Unknown type"} -{" "}
                    {formatFileSize(file.fileSize)}
                  </p>
                  <p className="mt-2 break-all text-xs text-slate-500">
                    {file.bucketName}/{file.storagePath}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge
                    label={
                      file.isVisibleToClient
                        ? "Visible to client"
                        : "Internal only"
                    }
                    tone={file.isVisibleToClient ? "blue" : "slate"}
                  />
                  <span className="text-xs text-slate-500">
                    {formatShortDate(file.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function formatFileSize(sizeBytes: number | null) {
  if (!sizeBytes || sizeBytes <= 0) {
    return "Unknown size";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const sizeKb = sizeBytes / 1024;

  if (sizeKb < 1024) {
    return `${Math.round(sizeKb)} KB`;
  }

  return `${(sizeKb / 1024).toFixed(1)} MB`;
}
