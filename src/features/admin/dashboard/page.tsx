import { ArrowUpRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getAdminDashboardData } from "@/features/admin/dashboard/admin-dashboard-data";
import { ActivityTimeline } from "@/features/admin/dashboard/activity-timeline";
import { AdminDashboardStats } from "@/features/admin/dashboard/admin-dashboard-stats";
import { DashboardQuickActions } from "@/features/admin/dashboard/dashboard-quick-actions";
import { PaymentSummaryCard } from "@/features/admin/dashboard/payment-summary-card";
import { ProjectProgressOverview } from "@/features/admin/dashboard/project-progress-overview";
import { RecentFeedbackPanel } from "@/features/admin/dashboard/recent-feedback-panel";
import { RecentProjectsTable } from "@/features/admin/dashboard/recent-projects-table";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Delivery overview"
        description="Projects that need attention, feedback waiting for review, and payments still open."
      >
        <Button asChild variant="outline">
          <Link href={routes.admin.projects}>
            Review projects
            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button asChild className="gap-2">
          <Link href="/admin/projects/new">
            <Plus className="size-4" />
            New project
          </Link>
        </Button>
      </PageHeader>

      <AdminDashboardStats metrics={dashboard.metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.9fr)]">
        <RecentProjectsTable projects={dashboard.recentProjects} />
        <RecentFeedbackPanel feedback={dashboard.recentFeedback} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectProgressOverview projects={dashboard.projectProgress} />
        <PaymentSummaryCard payments={dashboard.paymentSummary} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.4fr)]">
        <ActivityTimeline activities={dashboard.activity} />
        <DashboardQuickActions actions={dashboard.quickActions} />
      </div>
    </div>
  );
}
