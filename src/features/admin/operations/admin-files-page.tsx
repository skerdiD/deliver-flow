import { Files } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordActions,
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import { BadgeWithMeta, StackedCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import { FileRecordActions } from "@/features/admin/operations/record-actions";
import {
  formatDateTimeLabel,
  formatFileSize,
  getFileCategoryLabel,
  getFileScanStatusMeta,
  getFileVisibilityMeta,
  type AdminFilesPageData,
} from "@/features/admin/operations/types";

type AdminFilesPageProps = {
  data: AdminFilesPageData;
};

export function AdminFilesPage({ data }: AdminFilesPageProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="All files"
          value={String(data.summary.totalFiles)}
          description="Files saved across client workspaces."
        />
        <SummaryCard
          label="Available"
          value={String(data.summary.totalFiles - data.summary.pendingScan)}
          description="Files that are not waiting on scan review."
        />
        <SummaryCard
          label="Pending scan"
          value={String(data.summary.pendingScan)}
          description="Files held back until they become available."
        />
        <SummaryCard
          label="Storage usage"
          value={`${data.summary.usagePercent}%`}
          description={`${formatFileSize(data.summary.workspaceUsedBytes)} of ${formatFileSize(data.summary.workspaceQuotaBytes)} used.`}
        />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Project files</CardTitle>
          <p className="text-sm text-slate-500">
            Review uploaded files, check client visibility, and keep delivery
            assets organized.
          </p>
        </CardHeader>

        <CardContent>
          {data.files.length === 0 ? (
            <EmptyState
              icon={Files}
              title="No files uploaded yet."
              description="Project files will show up here once uploads start."
            />
          ) : (
            <>
              <MobileRecordList>
                {data.files.map((file) => {
                  const visibilityMeta = getFileVisibilityMeta(
                    file.isVisibleToClient,
                  );
                  const scanMeta = getFileScanStatusMeta(file.scanStatus);

                  return (
                    <MobileRecordCard key={file.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words font-medium text-slate-950">
                            {file.fileName}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            {getFileCategoryLabel(file.category)} -{" "}
                            {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                        <StatusBadge
                          label={visibilityMeta.label}
                          tone={visibilityMeta.tone}
                        />
                        <StatusBadge
                          label={scanMeta.label}
                          tone={scanMeta.tone}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <MobileRecordMeta label="Project">
                          <Link
                            href={`${routes.admin.projects}/${file.projectId}`}
                            className="break-words font-medium text-slate-950 hover:text-blue-700"
                          >
                            {file.projectName}
                          </Link>
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Client">
                          <span className="break-words">{file.clientName}</span>
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Type">
                          {file.fileType ?? "Unknown type"}
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Uploader">
                          {file.uploadedByName ?? "Unknown uploader"}
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Uploaded">
                          {formatDateTimeLabel(file.createdAt)}
                        </MobileRecordMeta>
                        <MobileRecordMeta
                          label="Original name"
                          className="sm:col-span-2"
                        >
                          <span className="break-all">
                            {file.originalFileName}
                          </span>
                        </MobileRecordMeta>
                      </div>

                      <MobileRecordActions className="justify-end">
                        <FileRecordActions
                          fileId={file.id}
                          fileName={file.fileName}
                        />
                      </MobileRecordActions>
                    </MobileRecordCard>
                  );
                })}
              </MobileRecordList>

              <div className="hidden lg:block">
                <Table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[36%]" />
                    <col className="w-[25%]" />
                    <col className="w-[14%]" />
                    <col className="w-[17%]" />
                    <col className="w-[8%]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Project / Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.files.map((file) => {
                      const visibilityMeta = getFileVisibilityMeta(
                        file.isVisibleToClient,
                      );
                      const scanMeta = getFileScanStatusMeta(file.scanStatus);

                      return (
                        <TableRow key={file.id}>
                          <TableCell className="whitespace-normal">
                            <StackedCell>
                              <p className="line-clamp-1 break-words font-medium text-slate-950">
                                {file.fileName}
                              </p>
                              <p className="line-clamp-1 text-xs text-slate-500">
                                {getFileCategoryLabel(file.category)} -{" "}
                                {formatFileSize(file.fileSize)}
                              </p>
                              <p className="line-clamp-1 break-all text-xs text-slate-500">
                                Original: {file.originalFileName}
                              </p>
                            </StackedCell>
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <StackedCell>
                              <Link
                                href={`${routes.admin.projects}/${file.projectId}`}
                                className="line-clamp-1 break-words font-medium text-slate-950 hover:text-blue-700"
                              >
                                {file.projectName}
                              </Link>
                              <p className="line-clamp-1 break-words text-xs text-slate-500">
                                {file.clientName}
                              </p>
                            </StackedCell>
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <BadgeWithMeta
                              badge={
                                <StatusBadge
                                  label={visibilityMeta.label}
                                  tone={visibilityMeta.tone}
                                />
                              }
                              meta={`${scanMeta.label} - ${file.fileType ?? "Unknown type"}`}
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDateTimeLabel(file.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <FileRecordActions
                                fileId={file.id}
                                fileName={file.fileName}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard(props: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-slate-500">{props.label}</p>
        <p className="text-2xl font-semibold leading-8 text-slate-950">
          {props.value}
        </p>
        <p className="text-sm text-slate-500">{props.description}</p>
      </CardContent>
    </Card>
  );
}
