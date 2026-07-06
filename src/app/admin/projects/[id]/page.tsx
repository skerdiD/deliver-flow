import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApprovalStatusCard } from "@/features/admin/projects/approval-status-card";
import { ProjectDetailHeader } from "@/features/admin/projects/project-detail-header";
import { ProjectActivityTimeline } from "@/features/admin/projects/project-activity-timeline";
import { ProjectFeedbackPreview } from "@/features/admin/projects/project-feedback-preview";
import { ProjectFilesCard } from "@/features/admin/projects/project-files-card";
import { ProjectMilestonesCard } from "@/features/admin/projects/project-milestones-card";
import { ProjectPaymentsCard } from "@/features/admin/projects/project-payments-card";
import { ProjectProgressControl } from "@/features/admin/projects/project-progress-control";
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

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <div className="min-w-0 space-y-6 xl:col-span-7">
          <ProjectMilestonesCard
            projectId={project.id}
            milestones={project.milestones}
          />

          <ProjectUpdatesCard
            projectId={project.id}
            updates={project.updates}
          />

          <ProjectPaymentsCard
            projectId={project.id}
            payments={project.payments ?? []}
          />

          <ProjectFilesCard projectId={project.id} files={project.files ?? []} />
        </div>

        <div className="min-w-0 space-y-6 xl:col-span-5">
          <ProjectProgressControl
            projectId={project.id}
            progress={project.progress}
            status={project.status}
          />

          <ApprovalStatusCard
            projectId={project.id}
            milestones={project.milestones}
            approvals={approvals}
          />

          <ProjectFeedbackPreview feedback={project.feedback} />

          <ProjectActivityTimeline activity={project.activity} />
        </div>
      </div>
    </div>
  );
}
