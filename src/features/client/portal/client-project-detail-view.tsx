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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <ClientTasksCard tasks={project.tasks} />
        </div>

        <div className="min-w-0 xl:col-span-5">
          <ClientTimelineCard milestones={project.milestones} />
        </div>

        <div className="min-w-0 xl:col-span-7">
          <ClientUpdatesCard updates={project.updates} />
        </div>

        <div className="min-w-0 xl:col-span-5">
          <ClientActivityCard activity={project.activity} />
        </div>

        <div className="min-w-0 xl:col-span-6">
          <ClientFilesPreviewCard projectId={project.id} files={project.files} />
        </div>

        <div className="min-w-0 xl:col-span-6">
          <ClientApprovalPreviewCard
            projectId={project.id}
            approvals={project.approvals}
          />
        </div>
      </div>
    </div>
  );
}
