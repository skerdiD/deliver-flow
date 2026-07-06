import { CheckCircle2, Clock3, MessageSquare, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCell } from "@/components/shared/record-cell";
import type { AdminProject } from "@/features/admin/projects/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ProjectDeliveryOverviewProps = {
  project: AdminProject;
};

export function ProjectDeliveryOverview({
  project,
}: ProjectDeliveryOverviewProps) {
  const approvals = project.approvals ?? [project.approval].filter(Boolean);
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "pending",
  ).length;
  const activeMilestones = project.milestones.filter(
    (milestone) =>
      milestone.status !== "approved" && milestone.status !== "completed",
  ).length;
  const outstandingFeedback = project.feedback.filter(
    (item) => item.status === "open",
  ).length;
  const latestUpdate = project.updates[0];

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Delivery overview</CardTitle>
        <p className="text-sm text-slate-500">
          The key signals for this project in one place.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <ProgressCell
          value={project.progress}
          className="max-w-none"
          labelClassName="text-sm font-medium text-slate-700"
          valueClassName="font-semibold text-slate-950"
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewMetric
            icon={Clock3}
            label="Started"
            value={formatShortDate(project.createdAt)}
          />
          <OverviewMetric
            icon={Clock3}
            label="Due"
            value={formatShortDate(project.deadline)}
          />
          <OverviewMetric
            icon={ShieldCheck}
            label="Pending approvals"
            value={String(pendingApprovals)}
          />
          <OverviewMetric
            icon={CheckCircle2}
            label="Active milestones"
            value={String(activeMilestones)}
          />
          <OverviewMetric
            icon={MessageSquare}
            label="Open feedback"
            value={String(outstandingFeedback)}
          />
          <OverviewMetric
            label="Budget"
            value={formatCurrencyFromCents(project.budgetCents)}
          />
          <OverviewMetric
            label="Paid"
            value={formatCurrencyFromCents(project.paidCents)}
          />
          <OverviewMetric
            label="Client"
            value={project.client.company}
            detail={project.client.name}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Latest update
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {latestUpdate?.title ?? "No updates yet"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {latestUpdate?.body ??
              "Post a project update when there is progress to share with the client."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon?: typeof Clock3;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {Icon ? <Icon className="size-4" /> : null}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
