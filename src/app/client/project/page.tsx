import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ApprovalActionsCard } from "@/features/client/portal/approval-actions-card";
import { ClientProjectOverview } from "@/features/client/portal/client-project-overview";
import { ClientTasksCard } from "@/features/client/portal/client-tasks-card";
import { ClientTimelineCard } from "@/features/client/portal/client-timeline-card";
import { ClientUpdatesCard } from "@/features/client/portal/client-updates-card";
import { FeedbackForm } from "@/features/client/portal/feedback-form";
import { getClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ClientProjectPage() {
  const project = await getClientPortalProject();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description="See what is done, what is active, what comes next, and what needs your review."
      />

      <ClientProjectOverview project={project} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          <ClientTimelineCard milestones={project.milestones} />
          <ClientTasksCard tasks={project.tasks} />
          <ClientUpdatesCard updates={project.updates} />
        </div>

        <div className="space-y-6">
          <ApprovalActionsCard approval={project.approval} />
        </div>
      </div>

      <FeedbackForm feedback={project.feedback} />
    </div>
  );
}