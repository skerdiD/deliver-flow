import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ApprovalActionsCard } from "@/features/client/portal/approval-actions-card";
import { ClientProjectOverview } from "@/features/client/portal/client-project-overview";
import { ClientTasksCard } from "@/features/client/portal/client-tasks-card";
import { ClientTimelineCard } from "@/features/client/portal/client-timeline-card";
import { ClientUpdatesCard } from "@/features/client/portal/client-updates-card";
import { FeedbackForm } from "@/features/client/portal/feedback-form";
import { getClientPortalProjectById } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getClientPortalProjectById(id);

  if (!project) {
    notFound();
  }

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
          <ApprovalActionsCard
            projectId={project.id}
            approvals={project.approvals}
          />
        </div>
      </div>

      <FeedbackForm projectId={project.id} feedback={project.feedback} />
    </div>
  );
}
