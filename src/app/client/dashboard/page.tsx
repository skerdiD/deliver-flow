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
  const { profile, projects } = await getClientPortalState();

  const title = profile.full_name
    ? `Welcome back, ${profile.full_name}`
    : "Welcome back";

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Client portal"
          title={title}
          description="Check project progress, latest updates, files, approvals, and payment status in one place."
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
        title={title}
        description="Check progress, latest updates, files, approvals, and payment status across every active project."
      />

      <div className="grid gap-6 2xl:grid-cols-2">
        {projects.map((project) => (
          <ClientDashboardProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
