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

      <div className="grid items-start gap-6 2xl:grid-cols-2">
        <ClientTasksCard tasks={project.tasks} />
        <ClientTimelineCard milestones={project.milestones} />
      </div>

      <ClientUpdatesCard updates={project.updates} />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <ClientFilesPreviewCard projectId={project.id} files={project.files} />

        <ClientApprovalPreviewCard
          projectId={project.id}
          approvals={project.approvals}
        />

        <ClientActivityCard activity={project.activity} />
      </div>
    </div>
  );
}
