import { Files } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
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

      <Card className="rounded-2xl border-slate-200 shadow-sm">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Uploaded</TableHead>
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
                            {getFileCategoryLabel(file.category)} ·{" "}
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
                      <TableCell>{file.fileType ?? "Unknown type"}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={visibilityMeta.label}
                          tone={visibilityMeta.tone}
                        />
                      </TableCell>
                      <TableCell>{formatDateTimeLabel(file.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-slate-500">{props.label}</p>
        <p className="text-3xl font-semibold tracking-tight text-slate-950">
          {props.value}
        </p>
        <p className="text-sm text-slate-500">{props.description}</p>
      </CardContent>
    </Card>
  );
}
