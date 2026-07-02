import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  MessageSquare,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import {
  ClientPaymentStatusBadge,
  ClientProjectStatusBadge,
} from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalProject } from "@/features/client/portal/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressCell } from "@/components/shared/record-cell";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientDashboardProjectCardProps = {
  project: ClientPortalProject;
};

export function ClientDashboardProjectCard({
  project,
}: ClientDashboardProjectCardProps) {
  const completedTasks = project.tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const nextTasks = project.tasks.filter((task) => task.status !== "completed");
  const latestUpdate = project.updates[0];
  const pendingApprovals = project.approvals.filter(
    (approval) => approval.status === "pending",
  );
  const latestApproval = project.approval;
  const projectQuery = `projectId=${encodeURIComponent(project.id)}`;
  const projectHref = `/client/project?${projectQuery}`;
  const filesHref = `/client/files?${projectQuery}`;
  const feedbackHref = `/client/feedback?${projectQuery}`;
  const approvalsHref = `/client/approvals?${projectQuery}`;
  const paymentsHref = `/client/payments?${projectQuery}`;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <ClientProjectStatusBadge status={project.status} />
              <ClientPaymentStatusBadge status={project.paymentStatus} />
            </div>

            <h2 className="mt-4 break-words text-2xl font-semibold leading-8 text-slate-950">
              <Link
                href={projectHref}
                prefetch
                className="rounded-sm outline-none transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-950/20 focus-visible:ring-offset-2"
              >
                {project.name}
              </Link>
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {project.description}
            </p>

            <ProgressCell
              value={project.progress}
              label="Project progress"
              className="mt-5 max-w-none"
              labelClassName="text-sm font-medium text-slate-700"
              valueClassName="font-semibold text-slate-950"
            />

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-500">
                  Current milestone
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950">
                  {project.currentMilestone}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-500">
                  Completed tasks
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {completedTasks} of {project.tasks.length}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-500">Deadline</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {project.deadline
                    ? formatShortDate(project.deadline)
                    : "Not scheduled yet"}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-xs font-medium text-slate-500">
                Approval status
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {pendingApprovals.length > 0
                  ? `${pendingApprovals.length} pending review${
                      pendingApprovals.length === 1 ? "" : "s"
                    }`
                  : latestApproval
                    ? `Latest: ${latestApproval.title}`
                    : "No approvals requested yet"}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:min-w-64 sm:w-auto">
            {project.liveDemoUrl ? (
              <Button asChild className="w-full sm:w-auto">
                <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  View Live Demo
                </a>
              </Button>
            ) : null}

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={feedbackHref} prefetch>
                <MessageSquare className="mr-2 size-4" />
                Send Feedback
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={approvalsHref} prefetch>
                <CheckCircle2 className="mr-2 size-4" />
                Review Approvals
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={paymentsHref} prefetch>
                <WalletCards className="mr-2 size-4" />
                View Payments
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-slate-950">
              Latest update from freelancer
            </p>
            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {latestUpdate
                ? latestUpdate.body
                : "No updates have been shared yet."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-950">
                  Payment status
                </p>
              </div>
              <ClientPaymentStatusBadge status={project.paymentStatus} />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {formatCurrencyFromCents(project.paidAmountCents)} paid from{" "}
              {formatCurrencyFromCents(project.totalAmountCents)}.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-950">Next steps</p>
            <ul className="mt-3 space-y-2">
              {nextTasks.length > 0 ? (
                nextTasks.slice(0, 3).map((task) => (
                  <li
                    key={task.id}
                    className="break-words text-sm text-slate-600"
                  >
                    {task.title}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-600">
                  No open tasks right now.
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-950">
                Files and documents
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {project.files.length > 0
                ? `${project.files.length} files are available for this project.`
                : "No files have been shared for this project yet."}
            </p>
            <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
              <Link href={filesHref} prefetch>
                Open files
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
