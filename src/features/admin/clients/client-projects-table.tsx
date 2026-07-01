import { FolderKanban } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AdminClientProject,
  AdminClientProjectStatus,
} from "@/features/admin/clients/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientProjectsTableProps = {
  projects: AdminClientProject[];
};

function getProjectStatusLabel(status: AdminClientProjectStatus) {
  const labels: Record<AdminClientProjectStatus, string> = {
    active: "Active",
    in_progress: "In progress",
    waiting_feedback: "Waiting feedback",
    completed: "Completed",
  };

  return labels[status];
}

function getProjectStatusTone(status: AdminClientProjectStatus) {
  const tones: Record<
    AdminClientProjectStatus,
    "blue" | "green" | "yellow" | "slate"
  > = {
    active: "blue",
    in_progress: "blue",
    waiting_feedback: "yellow",
    completed: "green",
  };

  return tones[status];
}

export function ClientProjectsTable({ projects }: ClientProjectsTableProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Assigned projects</CardTitle>
        <p className="text-sm text-slate-500">
          Projects this client can track in their portal.
        </p>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects assigned yet"
            description="Assign a project to this client when delivery work starts."
          />
        ) : (
          <>
            <MobileRecordList>
              {projects.map((project) => (
                <MobileRecordCard key={project.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-slate-950">
                        {project.name}
                      </p>
                      <p className="mt-1 break-words text-xs text-slate-500">
                        {project.nextMilestone}
                      </p>
                    </div>
                    <StatusBadge
                      label={getProjectStatusLabel(project.status)}
                      tone={getProjectStatusTone(project.status)}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MobileRecordMeta label="Progress">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-medium text-slate-700">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Deadline">
                      {formatShortDate(project.deadline)}
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Budget">
                      {formatCurrencyFromCents(project.budgetCents)}
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Paid">
                      {formatCurrencyFromCents(project.paidCents)}
                    </MobileRecordMeta>
                  </div>
                </MobileRecordCard>
              ))}
            </MobileRecordList>

            <div className="hidden overflow-hidden rounded-lg border border-slate-200 lg:block">
              <Table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[14%]" />
                  <col className="w-[20%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget / Paid</TableHead>
                    <TableHead className="text-right">Deadline</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="whitespace-normal">
                        <div className="min-w-0">
                          <p className="line-clamp-1 break-words font-medium text-slate-950">
                            {project.name}
                          </p>
                          <p className="mt-1 line-clamp-1 break-words text-xs text-slate-500">
                            {project.nextMilestone}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          label={getProjectStatusLabel(project.status)}
                          tone={getProjectStatusTone(project.status)}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium text-slate-700">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-normal font-medium text-slate-950">
                        <p>{formatCurrencyFromCents(project.budgetCents)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatCurrencyFromCents(project.paidCents)} paid
                        </p>
                      </TableCell>

                      <TableCell className="text-right text-slate-600">
                        {formatShortDate(project.deadline)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
