import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FolderKanban,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

import { ActionCard } from "@/components/shared/action-card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressCard } from "@/components/shared/progress-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Manage project delivery from one place"
        description="Track what’s done, what’s next, and what needs approval. Keep clients updated without scattered messages."
      >
        <Button className="gap-2">
          <Plus className="size-4" />
          New project
        </Button>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active clients"
          value="12"
          description="Across current projects"
          icon={Users}
        />
        <MetricCard
          title="Active projects"
          value="8"
          description="4 due this month"
          icon={FolderKanban}
        />
        <MetricCard
          title="Pending approvals"
          value="5"
          description="Waiting for client review"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Open payments"
          value="$4.6k"
          description="Due across milestones"
          icon={CreditCard}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <ProgressCard
            title="Client Portal Build"
            description="Auth, role access, project overview, files, approvals, and payment tracking."
            progress={62}
            statusLabel="In progress"
            statusTone="blue"
            icon={FolderKanban}
          />

          <ProgressCard
            title="Agency Website Redesign"
            description="Final content changes are ready. Client approval is the next step."
            progress={90}
            statusLabel="Waiting feedback"
            statusTone="yellow"
            icon={Clock3}
          />
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Sarah approved the homepage milestone",
                time: "12 min ago",
                tone: "green" as const,
                label: "Approved",
              },
              {
                title: "RetailCo left feedback on payment section",
                time: "1 hour ago",
                tone: "blue" as const,
                label: "Feedback",
              },
              {
                title: "New invoice file added",
                time: "Yesterday",
                tone: "slate" as const,
                label: "File",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge label={item.label} tone={item.tone} />
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-700">
                  {item.title}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard
          href={routes.admin.clients}
          icon={Users}
          title="Manage clients"
          description="Create client records, connect accounts, and keep contact details organized."
          actionLabel="Open clients"
        />
        <ActionCard
          href={routes.admin.projects}
          icon={FolderKanban}
          title="Review projects"
          description="Update progress, milestones, tasks, files, and delivery notes."
          actionLabel="Open projects"
        />
        <ActionCard
          href={routes.admin.feedback}
          icon={MessageSquare}
          title="Handle feedback"
          description="Review client notes and keep decisions connected to the right project."
          actionLabel="Open feedback"
        />
      </section>
    </div>
  );
}