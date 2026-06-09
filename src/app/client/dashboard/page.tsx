import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ClientDashboardProjectCard } from "@/features/client/portal/client-dashboard-project-card";
import { getClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Client Dashboard",
};

export default async function ClientDashboardPage() {
  const project = await getClientPortalProject();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client portal"
        title={`Welcome back, ${project.clientName}`}
        description="Check project progress, latest updates, files, approvals, and payment status in one place."
      />

      <ClientDashboardProjectCard project={project} />
    </div>
  );
}