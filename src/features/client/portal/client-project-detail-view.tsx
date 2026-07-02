import { PageHeader } from "@/components/shared/page-header";
import { ApprovalActionsCard } from "@/features/client/portal/approval-actions-card";
import { ClientActivityCard } from "@/features/client/portal/client-activity-card";
import { ClientProjectOverview } from "@/features/client/portal/client-project-overview";
import { ClientTasksCard } from "@/features/client/portal/client-tasks-card";
import { ClientTimelineCard } from "@/features/client/portal/client-timeline-card";
import { ClientUpdatesCard } from "@/features/client/portal/client-updates-card";
import { FeedbackForm } from "@/features/client/portal/feedback-form";
import type { ClientPortalProject } from "@/features/client/portal/types";

type ClientProjectDetailViewProps = {
  project: ClientPortalProject;
};

export function ClientProjectDetailView({
  project,
}: ClientProjectDetailViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description="A clear view of progress, active work, approvals, and recent project notes."
      />

      <ClientProjectOverview project={project} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="min-w-0 space-y-6">
          <ClientTimelineCard milestones={project.milestones} />
          <ClientUpdatesCard updates={project.updates} />
        </div>

        <div className="min-w-0 space-y-6">
          <ClientTasksCard tasks={project.tasks} />

          <ApprovalActionsCard
            projectId={project.id}
            approvals={project.approvals}
          />

          <ClientActivityCard activity={project.activity} />
        </div>
      </div>

      <FeedbackForm projectId={project.id} feedback={project.feedback} />
    </div>
  );
}
