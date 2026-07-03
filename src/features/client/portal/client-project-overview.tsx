import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  GitBranch,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import {
  ClientPaymentStatusBadge,
  ClientProjectStatusBadge,
} from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalProject } from "@/features/client/portal/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressCell } from "@/components/shared/record-cell";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientProjectOverviewProps = {
  project: ClientPortalProject;
};

export function ClientProjectOverview({ project }: ClientProjectOverviewProps) {
  const remainingCents = project.totalAmountCents - project.paidAmountCents;
  const completedTasks = project.tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const pendingApprovals = project.approvals.filter(
    (approval) => approval.status === "pending",
  ).length;
  const projectQuery = `projectId=${encodeURIComponent(project.id)}`;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ClientProjectStatusBadge status={project.status} />
              <ClientPaymentStatusBadge status={project.paymentStatus} />
            </div>

            <p className="mt-4 max-w-4xl break-words text-sm leading-6 text-slate-600">
              {project.description}
            </p>

            <ProgressCell
              value={project.progress}
              label="Overall progress"
              className="mt-6 max-w-none"
              labelClassName="text-sm font-medium text-slate-700"
              valueClassName="font-semibold text-slate-950"
            />
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-950">
              Project actions
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Open the dedicated workspace areas when you need to review,
              download, or respond.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/client/files?${projectQuery}`} prefetch>
                  <FileText className="mr-2 size-4" />
                  Files
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start">
                <Link href={`/client/feedback?${projectQuery}`} prefetch>
                  <MessageSquare className="mr-2 size-4" />
                  Feedback
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start">
                <Link href={`/client/approvals?${projectQuery}`} prefetch>
                  <ShieldCheck className="mr-2 size-4" />
                  Approvals
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start">
                <Link href={`/client/payments?${projectQuery}`} prefetch>
                  <WalletCards className="mr-2 size-4" />
                  Payments
                </Link>
              </Button>
            </div>

            {project.liveDemoUrl ? (
              <Button asChild className="mt-3 w-full justify-start">
                <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  View Live Demo
                </a>
              </Button>
            ) : null}

            {project.repositoryUrl ? (
              <Button asChild variant="outline" className="mt-3 w-full justify-start">
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitBranch className="mr-2 size-4" />
                  View repository
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <ProjectInsight
            icon={ListChecks}
            label="Current focus"
            value={project.currentMilestone}
          />
          <ProjectInsight
            icon={CalendarDays}
            label="Deadline"
            value={
              project.deadline
                ? formatShortDate(project.deadline)
                : "Not scheduled"
            }
          />
          <ProjectInsight
            icon={CheckCircle2}
            label="Tasks done"
            value={`${completedTasks} of ${project.tasks.length}`}
          />
          <ProjectInsight
            icon={ShieldCheck}
            label="Approvals"
            value={
              pendingApprovals > 0
                ? `${pendingApprovals} waiting`
                : "Nothing pending"
            }
          />
          <ProjectInsight
            icon={WalletCards}
            label="Remaining"
            value={formatCurrencyFromCents(remainingCents)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectInsight({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
