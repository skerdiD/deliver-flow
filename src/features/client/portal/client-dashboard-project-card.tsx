import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

import {
  ClientPaymentStatusBadge,
  ClientProjectStatusBadge,
} from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalProject } from "@/features/client/portal/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <ClientProjectStatusBadge status={project.status} />
              <ClientPaymentStatusBadge status={project.paymentStatus} />
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              {project.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {project.description}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Project progress
                </span>
                <span className="font-semibold text-slate-950">
                  {project.progress}%
                </span>
              </div>
              <Progress value={project.progress} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-500">
                  Current milestone
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {project.currentMilestone}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-500">
                  Completed tasks
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {completedTasks} of {project.tasks.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-500">Deadline</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {project.deadline
                    ? formatShortDate(project.deadline)
                    : "Not scheduled yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-w-64 flex-col gap-3">
            {project.liveDemoUrl ? (
              <Button asChild>
                <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  View Live Demo
                </a>
              </Button>
            ) : null}

            <Button asChild variant="outline">
              <Link href="/client/feedback">
                <MessageSquare className="mr-2 size-4" />
                Send Feedback
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/client/project">
                <CheckCircle2 className="mr-2 size-4" />
                Approve Milestone
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-slate-950">
              Latest update from freelancer
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {latestUpdate
                ? latestUpdate.body
                : "Your latest project updates will appear here."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-950">
                Payment status
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {formatCurrencyFromCents(project.paidAmountCents)} paid from{" "}
              {formatCurrencyFromCents(project.totalAmountCents)}.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-950">Next steps</p>
            <ul className="mt-3 space-y-2">
              {nextTasks.length > 0 ? (
                nextTasks.slice(0, 3).map((task) => (
                  <li key={task.id} className="text-sm text-slate-600">
                    - {task.title}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-600">
                  No open tasks right now.
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-950">
                Files and documents
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {project.files.length > 0
                ? `${project.files.length} files are available for this project.`
                : "Files will appear here after they are uploaded to the project."}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/client/files">Open files</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
