import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ClientProjectDetailView } from "@/features/client/portal/client-project-detail-view";
import {
  getClientPortalProjectById,
  getSelectedClientProject,
  recordClientProjectDetailViews,
  type ClientProjectSearchParams,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ClientProjectPage({
  searchParams,
}: {
  searchParams: Promise<ClientProjectSearchParams>;
}) {
  const selection = await getSelectedClientProject(searchParams);
  const projectId = selection.selectedProjectId;

  if (selection.didFallback && projectId) {
    redirect(`/client/project?projectId=${encodeURIComponent(projectId)}`);
  }

  if (projectId) {
    const project = await getClientPortalProjectById(projectId);

    if (!project) {
      notFound();
    }

    after(() => {
      void recordClientProjectDetailViews(project).catch((error: unknown) => {
        console.error("Failed to record client project views", error);
      });
    });

    return <ClientProjectDetailView project={project} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title="Project overview"
        description="See the roadmap, review milestones, and track files, payments, and updates in one place."
      />

      <EmptyState
        icon={FolderOpen}
        title="No active projects yet"
        description="You will see project updates here once a project is added to your portal."
      />
    </div>
  );
}
