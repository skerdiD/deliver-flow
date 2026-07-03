import { PageHeader } from "@/components/shared/page-header";
import { ClientActivityCard } from "@/features/client/portal/client-activity-card";
import {
  ClientApprovalPreviewCard,
  ClientFilesPreviewCard,
} from "@/features/client/portal/client-project-previews";
import { ClientProjectOverview } from "@/features/client/portal/client-project-overview";
import { ClientTasksCard } from "@/features/client/portal/client-tasks-card";
import { ClientTimelineCard } from "@/features/client/portal/client-timeline-card";
import { ClientUpdatesCard } from "@/features/client/portal/client-updates-card";
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

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="min-w-0 space-y-6">
          <ClientTasksCard tasks={project.tasks} />
          <ClientUpdatesCard updates={project.updates} />
        </div>

        <div className="min-w-0 space-y-6">
          <ClientTimelineCard milestones={project.milestones} />
          <ClientFilesPreviewCard projectId={project.id} files={project.files} />
          <ClientApprovalPreviewCard
            projectId={project.id}
            approvals={project.approvals}
          />
          <ClientActivityCard activity={project.activity} />
        </div>
      </div>
    </div>
  );
}
