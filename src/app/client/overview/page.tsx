import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ClientOverview } from "@/features/client/portal/client-overview";
import {
  getClientPortalDashboardState,
  type ClientProjectSearchParams,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Overview",
};

function readProjectIdSearchParam(searchParams: ClientProjectSearchParams) {
  const projectIdParam = searchParams.projectId;

  if (Array.isArray(projectIdParam)) {
    return projectIdParam[0] ?? null;
  }

  return projectIdParam ?? null;
}

export default async function ClientOverviewPage({
  searchParams,
}: {
  searchParams: Promise<ClientProjectSearchParams>;
}) {
  const [{ projects }, resolvedSearchParams] = await Promise.all([
    getClientPortalDashboardState(),
    searchParams,
  ]);
  const requestedProjectId = readProjectIdSearchParam(resolvedSearchParams);
  const selectedProject = requestedProjectId
    ? projects.find((project) => project.id === requestedProjectId)
    : null;

  if (requestedProjectId && !selectedProject) {
    redirect("/client/overview");
  }

  const visibleProjects = selectedProject ? [selectedProject] : projects;
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Client portal"
          title="Overview"
          description="Check progress, approvals, files, payments, and updates across your active projects."
        />

        <EmptyState
          icon={FolderOpen}
          title="No active projects yet"
          description="Your project updates will appear here after an active project is connected to your portal."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client portal"
        title="Overview"
        description="Check progress, approvals, files, payments, and updates across your active projects."
      />

      <ClientOverview projects={visibleProjects} />
    </div>
  );
}
