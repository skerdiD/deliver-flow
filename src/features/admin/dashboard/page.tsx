import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  adminDashboardActivity,
  adminDashboardFeedback,
  adminDashboardPayments,
  adminDashboardProjects,
  adminDashboardQuickActions,
  getAdminDashboardMetrics,
} from "@/features/admin/dashboard/admin-dashboard-data";
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

export default function AdminDashboardPage() {
  const metrics = getAdminDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-600">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Delivery overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Track what’s done, what’s next, and what needs approval. Keep client
            work clear without messy back-and-forth messages.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Send update</Button>
          <Button>New project</Button>
        </div>
      </div>

      <AdminDashboardStats metrics={metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.9fr)]">
        <RecentProjectsTable projects={adminDashboardProjects} />
        <RecentFeedbackPanel feedback={adminDashboardFeedback} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectProgressOverview projects={adminDashboardProjects} />
        <PaymentSummaryCard payments={adminDashboardPayments} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.4fr)]">
        <ActivityTimeline activities={adminDashboardActivity} />
        <DashboardQuickActions actions={adminDashboardQuickActions} />
      </div>
    </div>
  );
}