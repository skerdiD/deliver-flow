import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApprovalStatusCard } from "@/features/admin/projects/approval-status-card";
import { ProjectDeliveryOverview } from "@/features/admin/projects/project-delivery-overview";
import { ProjectDetailHeader } from "@/features/admin/projects/project-detail-header";
import { ProjectFeedbackPreview } from "@/features/admin/projects/project-feedback-preview";
import { ProjectFilesCard } from "@/features/admin/projects/project-files-card";
import { ProjectMilestonesCard } from "@/features/admin/projects/project-milestones-card";
import { ProjectPaymentsCard } from "@/features/admin/projects/project-payments-card";
import { ProjectProgressControl } from "@/features/admin/projects/project-progress-control";
import { ProjectTasksCard } from "@/features/admin/projects/project-tasks-card";
import { ProjectUpdatesCard } from "@/features/admin/projects/project-updates-card";
import { getAdminProjectById } from "@/features/admin/projects/projects-data";

export const metadata: Metadata = {
  title: "Project Detail",
};

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  const approvals = project.approvals ?? [project.approval].filter(Boolean);

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="w-full sm:w-auto">
        <Link href="/admin/projects">
          <ArrowLeft className="mr-2 size-4" />
          Back to projects
        </Link>
      </Button>

      <ProjectDetailHeader project={project} />

      <ProjectDeliveryOverview project={project} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          <ProjectMilestonesCard
            projectId={project.id}
            milestones={project.milestones}
          />

          <ProjectTasksCard projectId={project.id} tasks={project.tasks} />

          <ProjectUpdatesCard
            projectId={project.id}
            updates={project.updates}
          />

          <ProjectFilesCard files={project.files ?? []} />

          <ProjectFeedbackPreview feedback={project.feedback} />
        </div>

        <div className="space-y-6">
          <ProjectProgressControl
            projectId={project.id}
            progress={project.progress}
            status={project.status}
          />

          <ApprovalStatusCard approvals={approvals} />

          <ProjectPaymentsCard payments={project.payments ?? []} />
        </div>
      </div>
    </div>
  );
}
