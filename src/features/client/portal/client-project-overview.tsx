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
  const completedMilestones = project.milestones.filter(
    (milestone) =>
      milestone.status === "approved" || milestone.status === "completed",
  ).length;
  const pendingApprovals = project.approvals.filter(
    (approval) => approval.status === "pending",
  ).length;
  const hasChangesRequested = project.approvals.some(
    (approval) => approval.status === "changes_requested",
  );
  const hasApprovedReview = project.approvals.some(
    (approval) => approval.status === "approved",
  );
  const milestoneProgressLabel =
    project.milestones.length > 0
      ? `${completedMilestones} of ${project.milestones.length} complete`
      : "No milestones yet";
  const projectQuery = `projectId=${encodeURIComponent(project.id)}`;
  const filesHref = `/client/files?${projectQuery}`;
  const feedbackHref = `/client/feedback?${projectQuery}`;
  const approvalsHref = `/client/approvals?${projectQuery}`;
  const paymentsHref = `/client/payments?${projectQuery}`;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
      <Card className="h-full rounded-lg border-slate-200 shadow-sm">
        <CardContent className="flex h-full flex-col p-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ClientProjectStatusBadge status={project.status} />
              <ClientPaymentStatusBadge status={project.paymentStatus} />
            </div>

            <p className="mt-5 max-w-4xl break-words text-sm leading-7 text-slate-600">
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
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
              label="Milestones"
              value={milestoneProgressLabel}
            />
            <ProjectInsight
              icon={ShieldCheck}
              label="Review state"
              value={
                pendingApprovals > 0
                  ? `${pendingApprovals} waiting`
                  : hasChangesRequested
                    ? "Changes requested"
                    : hasApprovedReview
                      ? "Approved"
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

      <Card className="h-full rounded-lg border-slate-200 shadow-sm">
        <CardContent className="flex h-full flex-col p-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
              Project actions
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Quick links for this project.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open the roadmap, files, approvals, payments, or the latest live
              build whenever you need it.
            </p>

            {project.liveDemoUrl ? (
              <Button asChild size="lg" className="mt-5 w-full justify-start">
                <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  View Live Demo
                </a>
              </Button>
            ) : null}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-14 justify-start rounded-lg px-4 text-left"
              >
                <Link href={filesHref} prefetch>
                  <FileText className="mr-2 size-4" />
                  Files
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-14 justify-start rounded-lg px-4 text-left"
              >
                <Link href={feedbackHref} prefetch>
                  <MessageSquare className="mr-2 size-4" />
                  Feedback
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-14 justify-start rounded-lg px-4 text-left"
              >
                <Link href={approvalsHref} prefetch>
                  <ShieldCheck className="mr-2 size-4" />
                  Approvals
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-14 justify-start rounded-lg px-4 text-left"
              >
                <Link href={paymentsHref} prefetch>
                  <WalletCards className="mr-2 size-4" />
                  Payments
                </Link>
              </Button>
            </div>

            {project.repositoryUrl ? (
              <Button
                asChild
                variant="outline"
                className="mt-3 w-full justify-start rounded-lg border-dashed text-sm text-slate-700"
              >
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitBranch className="size-4" />
                  View repository
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
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
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 break-words text-base font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
