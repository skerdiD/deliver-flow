import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
  DashboardProject,
  PaymentStatus,
  ProjectStatus,
} from "@/features/admin/dashboard/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type RecentProjectsTableProps = {
  projects: DashboardProject[];
};

function getProjectStatusLabel(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    active: "Active",
    in_progress: "In progress",
    waiting_feedback: "Waiting feedback",
    completed: "Completed",
  };

  return labels[status];
}

function getProjectStatusTone(status: ProjectStatus) {
  const tones: Record<ProjectStatus, "blue" | "green" | "yellow" | "slate"> = {
    active: "blue",
    in_progress: "blue",
    waiting_feedback: "yellow",
    completed: "green",
  };

  return tones[status];
}

function getPaymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    paid: "Paid",
    unpaid: "Unpaid",
    partial: "Partial",
    overdue: "Overdue",
    void: "Void",
  };

  return labels[status];
}

function getPaymentStatusTone(status: PaymentStatus) {
  const tones: Record<
    PaymentStatus,
    "blue" | "green" | "yellow" | "red" | "slate"
  > = {
    paid: "green",
    unpaid: "yellow",
    partial: "blue",
    overdue: "red",
    void: "slate",
  };

  return tones[status];
}

export function RecentProjectsTable({ projects }: RecentProjectsTableProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Recent projects</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Current delivery work across active clients.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin/projects">
            View all
            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Projects will appear here after you create them."
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
                        className="break-words font-medium text-slate-950 hover:text-blue-700"
                      >
                        {project.name}
                      </Link>
                      <p className="mt-1 break-words text-xs text-slate-500">
                        {project.currentMilestone}
                      </p>
                    </div>
                    <StatusBadge
                      label={getProjectStatusLabel(project.status)}
                      tone={getProjectStatusTone(project.status)}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MobileRecordMeta label="Client">
                      <span className="break-words">{project.client}</span>
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Due">
                      {project.deadline
                        ? formatShortDate(project.deadline)
                        : "Not scheduled"}
                    </MobileRecordMeta>
                    <MobileRecordMeta
                      label="Progress"
                      className="sm:col-span-2"
                    >
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
                    <MobileRecordMeta label="Payment">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={getPaymentStatusLabel(project.paymentStatus)}
                          tone={getPaymentStatusTone(project.paymentStatus)}
                        />
                        <span className="text-xs text-slate-500">
                          {formatCurrencyFromCents(project.paymentAmountCents)}
                        </span>
                      </div>
                    </MobileRecordMeta>
                  </div>
                </MobileRecordCard>
              ))}
            </MobileRecordList>

            <div className="hidden overflow-hidden rounded-lg border border-slate-200 lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">
                            {project.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {project.currentMilestone}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-slate-600">
                        {project.client}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          label={getProjectStatusLabel(project.status)}
                          tone={getProjectStatusTone(project.status)}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="min-w-28">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium text-slate-700">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge
                            label={getPaymentStatusLabel(project.paymentStatus)}
                            tone={getPaymentStatusTone(project.paymentStatus)}
                          />
                          <p className="text-xs text-slate-500">
                            {formatCurrencyFromCents(
                              project.paymentAmountCents,
                            )}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-right text-slate-600">
                        {project.deadline
                          ? formatShortDate(project.deadline)
                          : "Not scheduled"}
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
