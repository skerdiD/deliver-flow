"use client";

import { Files, Loader2, Upload } from "lucide-react";
import { useActionState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
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
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
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
                <Label>Category</Label>
                <Select name="category" defaultValue="deliverable">
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

            {uploadState.message ? (
              <p
                className={
                  uploadState.success
                    ? "text-sm text-green-700"
                    : "text-sm text-red-600"
                }
              >
                {uploadState.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload file
              </Button>
            </div>
          </div>
        </form>

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
                  <p className="mt-2 text-xs text-slate-500">
                    {file.viewedAt
                      ? `Viewed ${formatRelativeTime(file.viewedAt)}`
                      : "Not viewed yet"}
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
                  <FileRecordActions fileId={file.id} fileName={file.fileName} />
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
