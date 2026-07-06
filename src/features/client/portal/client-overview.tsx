import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { ProgressCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClientPaymentStatusBadge,
  ClientProjectStatusBadge,
} from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalProject } from "@/features/client/portal/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientOverviewProps = {
  projects: ClientPortalProject[];
};

type AttentionItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  projectName: string;
  reason: string;
  badgeLabel: string;
  badgeTone: "blue" | "green" | "yellow" | "red" | "purple" | "slate";
  href: string;
  actionLabel: string;
  priority: number;
};

export function ClientOverview({ projects }: ClientOverviewProps) {
  const attentionItems = buildAttentionItems(projects);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <SectionHeader
          title="Needs your attention"
          description="Approvals, payments, files, or replies that may need your review."
        />

        {attentionItems.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {attentionItems.map((item) => (
              <AttentionRow key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">All clear</p>
                <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                  No approvals, overdue payments, new files, or feedback replies
                  need attention right now.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Your projects"
          description="Track progress and open the project workspace when you need more detail."
        />

        <div className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => (
            <OverviewProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 break-words text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const Icon = item.icon;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
              <Icon className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="break-words font-semibold text-slate-950">
                  {item.title}
                </p>
                <StatusBadge label={item.badgeLabel} tone={item.badgeTone} />
              </div>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {item.projectName}
              </p>
              <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                {item.reason}
              </p>
            </div>
          </div>

          <Button asChild variant="outline" className="shrink-0 sm:w-auto">
            <Link href={item.href} prefetch>
              {item.actionLabel}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewProjectCard({ project }: { project: ClientPortalProject }) {
  const completedMilestones = project.milestones.filter(
    (milestone) =>
      milestone.status === "approved" || milestone.status === "completed",
  ).length;
  const latestUpdate = project.updates[0];
  const pendingApproval = project.approvals.find(
    (approval) => approval.status === "pending",
  );
  const attentionPayment = project.payments.find((payment) =>
    ["overdue", "unpaid", "partial"].includes(payment.status),
  );
  const hasFiles = project.files.length > 0;
  const projectQuery = `projectId=${encodeURIComponent(project.id)}`;
  const projectHref = `/client/project?${projectQuery}`;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <ClientProjectStatusBadge status={project.status} />
                <ClientPaymentStatusBadge status={project.paymentStatus} />
              </div>

              <h3 className="mt-3 break-words text-lg font-semibold text-slate-950">
                {project.name}
              </h3>
              <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-slate-600">
                {project.description}
              </p>
            </div>

            <Button asChild className="shrink-0 sm:w-auto">
              <Link href={projectHref} prefetch>
                <ExternalLink className="mr-2 size-4" />
                Open project
              </Link>
            </Button>
          </div>

          <ProgressCell
            value={project.progress}
            label="Progress"
            className="max-w-none"
            labelClassName="text-sm font-medium text-slate-700"
            valueClassName="font-semibold text-slate-950"
          />

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <ProjectMeta label="Current milestone" value={project.currentMilestone} />
            <ProjectMeta
              label="Milestones completed"
              value={
                project.milestones.length > 0
                  ? `${completedMilestones} of ${project.milestones.length}`
                  : "No milestones yet"
              }
            />
            <ProjectMeta
              label="Deadline"
              value={
                project.deadline
                  ? formatShortDate(project.deadline)
                  : "Not scheduled"
              }
            />
            <ProjectMeta
              label="Files"
              value={
                project.files.length === 1
                  ? "1 file"
                  : `${project.files.length} files`
              }
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs font-medium text-slate-500">
              Latest update
            </p>
            <p className="mt-1 line-clamp-2 break-words text-sm leading-6 text-slate-700">
              {latestUpdate
                ? latestUpdate.body
                : "No updates have been shared yet."}
            </p>
          </div>

          {pendingApproval || attentionPayment || hasFiles ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {pendingApproval ? (
                <ContextAction
                  href={`/client/approvals?${projectQuery}`}
                  label="Review milestone"
                />
              ) : null}
              {attentionPayment ? (
                <ContextAction
                  href={`/client/payments?${projectQuery}`}
                  label="View payment"
                />
              ) : null}
              {!pendingApproval && !attentionPayment && hasFiles ? (
                <ContextAction
                  href={`/client/files?${projectQuery}`}
                  label="Open files"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function ContextAction({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="outline" className="h-9 px-3 sm:w-auto">
      <Link href={href} prefetch>
        {label}
      </Link>
    </Button>
  );
}

function buildAttentionItems(projects: ClientPortalProject[]) {
  const items: AttentionItem[] = [];

  for (const project of projects) {
    const projectQuery = `projectId=${encodeURIComponent(project.id)}`;

    for (const approval of project.approvals) {
      if (approval.status !== "pending") {
        continue;
      }

      items.push({
        id: `approval-${approval.id}`,
        icon: BadgeCheck,
        title: "Milestone ready for review",
        projectName: project.name,
        reason:
          approval.milestoneName ??
          approval.description,
        badgeLabel: "Review needed",
        badgeTone: "blue",
        href: `/client/approvals?${projectQuery}`,
        actionLabel: "Review milestone",
        priority: 10,
      });
    }

    const payment = project.payments.find((item) =>
      ["overdue", "unpaid", "partial"].includes(item.status),
    );

    if (payment) {
      items.push({
        id: `payment-${payment.id}`,
        icon: CreditCard,
        title:
          payment.status === "overdue"
            ? "Payment overdue"
            : "Payment needs review",
        projectName: project.name,
        reason: `${formatCurrencyFromCents(payment.amountCents)} was due ${formatShortDate(payment.dueDate)}.`,
        badgeLabel:
          payment.status === "partial"
            ? "Partial"
            : payment.status === "overdue"
              ? "Overdue"
              : "Unpaid",
        badgeTone: payment.status === "overdue" ? "red" : "yellow",
        href: `/client/payments?${projectQuery}`,
        actionLabel: "View payment",
        priority: payment.status === "overdue" ? 20 : 30,
      });
    }

    const repliedFeedback = project.feedback.find((item) =>
      Boolean(item.adminResponse?.trim()),
    );

    if (repliedFeedback) {
      items.push({
        id: `feedback-${repliedFeedback.id}`,
        icon: MessageSquare,
        title: "Feedback reply available",
        projectName: project.name,
        reason: "There is an admin response ready for you to review.",
        badgeLabel: "Reply added",
        badgeTone: "purple",
        href: `/client/feedback?${projectQuery}`,
        actionLabel: "Open feedback",
        priority: 40,
      });
    }

    if (project.files.length > 0) {
      items.push({
        id: `files-${project.id}`,
        icon: FileText,
        title: "New files available",
        projectName: project.name,
        reason:
          project.files.length === 1
            ? "1 file is ready to download."
            : `${project.files.length} files are ready to download.`,
        badgeLabel: "Files",
        badgeTone: "slate",
        href: `/client/files?${projectQuery}`,
        actionLabel: "Open files",
        priority: 50,
      });
    }
  }

  return items
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 8);
}
