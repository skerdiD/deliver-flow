import { FolderKanban } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import {
  BadgeWithMeta,
  ProgressCell,
  StackedCell,
} from "@/components/shared/record-cell";
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
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="inline-flex max-w-full rounded-sm font-medium text-slate-950 outline-none transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-950/20 focus-visible:ring-offset-2"
                      >
                        <span className="break-words">{project.name}</span>
                      </Link>
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
                      <ProgressCell
                        value={project.progress}
                        className="max-w-none"
                      />
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
                        <StackedCell>
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="inline-flex max-w-full rounded-sm font-medium text-slate-950 outline-none transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-950/20 focus-visible:ring-offset-2"
                          >
                            <span className="line-clamp-1 break-words">
                              {project.name}
                            </span>
                          </Link>
                          <p className="line-clamp-1 break-words text-xs text-slate-500">
                            {project.nextMilestone}
                          </p>
                        </StackedCell>
                      </TableCell>

                      <TableCell>
                        <BadgeWithMeta
                          badge={
                            <StatusBadge
                              label={getProjectStatusLabel(project.status)}
                              tone={getProjectStatusTone(project.status)}
                            />
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <ProgressCell value={project.progress} />
                      </TableCell>

                      <TableCell className="whitespace-normal">
                        <StackedCell>
                          <p className="font-medium text-slate-950">
                            {formatCurrencyFromCents(project.budgetCents)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatCurrencyFromCents(project.paidCents)} paid
                          </p>
                        </StackedCell>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-right text-slate-600">
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
