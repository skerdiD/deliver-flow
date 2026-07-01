"use client";

import { Files, Loader2, Upload } from "lucide-react";
import { useActionState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { FormStatus } from "@/components/shared/form-status";
import { BadgeWithMeta, StackedCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadProjectFileAction } from "@/features/admin/projects/actions";
import { FileRecordActions } from "@/features/admin/operations/record-actions";
import type { AdminProjectFile } from "@/features/admin/projects/types";
import { formatRelativeTime, formatShortDate } from "@/lib/format";

type ProjectFilesCardProps = {
  projectId: string;
  files: AdminProjectFile[];
};

const initialUploadState = {
  success: false,
  message: "",
};

export function ProjectFilesCard({ projectId, files }: ProjectFilesCardProps) {
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadProjectFileAction,
    initialUploadState,
  );

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <p className="text-sm text-slate-500">
          Files connected to this project and what the client can see.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <form
          action={uploadAction}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <input type="hidden" name="projectId" value={projectId} />

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)_160px]">
              <div className="space-y-2">
                <Label htmlFor="project-file-upload">Deliverable file</Label>
                <Input
                  id="project-file-upload"
                  name="file"
                  type="file"
                  className="bg-white"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-file-label">Display name</Label>
                <Input
                  id="project-file-label"
                  name="label"
                  type="text"
                  placeholder="Final handoff"
                  className="bg-white"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  name="category"
                  defaultValue="deliverable"
                  disabled={isUploading}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deliverable">Deliverable</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="isVisibleToClient"
                defaultChecked
                className="size-4 rounded border-slate-300"
              />
              Visible to client
            </label>

            <FormStatus
              message={uploadState.message}
              success={uploadState.success}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Upload file
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {files.length === 0 ? (
          <EmptyState
            icon={Files}
            title="No files uploaded yet."
            description="Files will show here after they are uploaded to the project."
          />
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <StackedCell className="gap-2">
                  <p className="font-semibold text-slate-950">
                    {file.fileName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {file.fileType ?? "Unknown type"} -{" "}
                    {formatFileSize(file.fileSize)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {file.viewedAt
                      ? `Viewed ${formatRelativeTime(file.viewedAt)}`
                      : "Not viewed yet"}
                  </p>
                </StackedCell>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <BadgeWithMeta
                    className="sm:items-end"
                    badge={
                      <StatusBadge
                        label={
                          file.isVisibleToClient
                            ? "Visible to client"
                            : "Internal only"
                        }
                        tone={file.isVisibleToClient ? "blue" : "slate"}
                      />
                    }
                    meta={formatShortDate(file.createdAt)}
                  />
                  <FileRecordActions
                    fileId={file.id}
                    fileName={file.fileName}
                  />
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
