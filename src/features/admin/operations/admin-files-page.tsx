import { Files } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordActions,
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
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
          label="Visible to clients"
          value={String(data.summary.visibleToClients)}
          description="Files that appear in the client portal."
        />
        <SummaryCard
          label="Internal only"
          value={String(data.summary.internalOnly)}
          description="Files kept on the admin side only."
        />
        <SummaryCard
          label="Stored size"
          value={formatFileSize(data.summary.totalSizeBytes)}
          description="Total file size tracked in metadata."
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
              title="No files have been uploaded yet."
              description="Project files from the database will show up here once uploads start."
            />
          ) : (
            <>
              <MobileRecordList>
                {data.files.map((file) => {
                  const visibilityMeta = getFileVisibilityMeta(
                    file.isVisibleToClient,
                  );

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
                        <MobileRecordMeta label="Uploaded">
                          {formatDateTimeLabel(file.createdAt)}
                        </MobileRecordMeta>
                        <MobileRecordMeta
                          label="Storage"
                          className="sm:col-span-2"
                        >
                          <span className="break-all">
                            {file.bucketName}/{file.storagePath}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.files.map((file) => {
                      const visibilityMeta = getFileVisibilityMeta(
                        file.isVisibleToClient,
                      );

                      return (
                        <TableRow key={file.id}>
                          <TableCell className="max-w-sm whitespace-normal">
                            <div className="space-y-1">
                              <p className="font-medium text-slate-950">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {getFileCategoryLabel(file.category)} -{" "}
                                {formatFileSize(file.fileSize)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {file.bucketName}/{file.storagePath}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`${routes.admin.projects}/${file.projectId}`}
                              className="font-medium text-slate-950 hover:text-blue-700"
                            >
                              {file.projectName}
                            </Link>
                          </TableCell>
                          <TableCell>{file.clientName}</TableCell>
                          <TableCell>
                            {file.fileType ?? "Unknown type"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              label={visibilityMeta.label}
                              tone={visibilityMeta.tone}
                            />
                          </TableCell>
                          <TableCell>
                            {formatDateTimeLabel(file.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <FileRecordActions
                              fileId={file.id}
                              fileName={file.fileName}
                            />
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
