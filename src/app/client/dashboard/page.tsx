import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ClientDashboardProjectCard } from "@/features/client/portal/client-dashboard-project-card";
import { getClientPortalState } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Client Dashboard",
};

export default async function ClientDashboardPage() {
  const { profile, project } = await getClientPortalState();

  const title = profile.full_name
    ? `Welcome back, ${profile.full_name}`
    : "Welcome back";

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Client portal"
          title={title}
          description="Check project progress, latest updates, files, approvals, and payment status in one place."
        />

        <EmptyState
          icon={FolderOpen}
          title="No project has been assigned yet."
          description="Your latest project updates will appear here after a project is connected to your portal."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client portal"
        title={title}
        description="Check project progress, latest updates, files, approvals, and payment status in one place."
      />

      <ClientDashboardProjectCard project={project} />
    </div>
  );
}
