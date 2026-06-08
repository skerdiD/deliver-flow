import {
  CheckCircle2,
  CreditCard,
  FileText,
  FolderKanban,
  MessageSquare,
} from "lucide-react";
import type { Metadata } from "next";

import { ActionCard } from "@/components/shared/action-card";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressCard } from "@/components/shared/progress-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Client Dashboard",
};

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client portal"
        title="Your project progress, clearly organized"
        description="Check updates, files, approvals, and payments without searching through old messages."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Project progress"
          value="68%"
          description="Current delivery status"
          icon={FolderKanban}
        />
        <MetricCard
          title="Tasks completed"
          value="14"
          description="6 tasks left"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Payment status"
          value="$900"
          description="Next milestone payment"
          icon={CreditCard}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProgressCard
            title="SaaS Dashboard MVP"
            description="The main dashboard screens are ready. Backend integration and final review are currently in progress."
            progress={68}
            statusLabel="In progress"
            statusTone="blue"
            icon={FolderKanban}
          />
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Needs your attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <StatusBadge label="Approval needed" tone="yellow" />
              <p className="mt-3 text-sm font-medium text-amber-950">
                Frontend milestone review
              </p>
              <p className="mt-2 text-sm leading-5 text-amber-800">
                Please check the latest demo and approve it or request changes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <StatusBadge label="Latest update" tone="blue" />
              <p className="mt-3 text-sm leading-5 text-slate-700">
                Dashboard layout is complete. The next step is connecting live
                project data.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard
          href={routes.client.project}
          icon={FolderKanban}
          title="View project"
          description="See what is done, what is active, and what comes next."
          actionLabel="Open project"
        />
        <ActionCard
          href={routes.client.files}
          icon={FileText}
          title="Project files"
          description="Find briefs, designs, invoices, and delivery files in one place."
          actionLabel="Open files"
        />
        <ActionCard
          href={routes.client.feedback}
          icon={MessageSquare}
          title="Send feedback"
          description="Leave notes tied to the project instead of losing them in messages."
          actionLabel="Open feedback"
        />
      </section>
    </div>
  );
}