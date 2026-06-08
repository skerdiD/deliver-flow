import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApprovalStatusCard } from "@/features/admin/projects/approval-status-card";
import { ProjectDetailHeader } from "@/features/admin/projects/project-detail-header";
import { ProjectFeedbackPreview } from "@/features/admin/projects/project-feedback-preview";
import { ProjectMilestonesCard } from "@/features/admin/projects/project-milestones-card";
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

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/admin/projects">
          <ArrowLeft className="mr-2 size-4" />
          Back to projects
        </Link>
      </Button>

      <ProjectDetailHeader project={project} />

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
        </div>

        <div className="space-y-6">
          <ProjectProgressControl
            projectId={project.id}
            progress={project.progress}
            status={project.status}
          />

          <ApprovalStatusCard approval={project.approval} />

          <ProjectFeedbackPreview feedback={project.feedback} />
        </div>
      </div>
    </div>
  );
}