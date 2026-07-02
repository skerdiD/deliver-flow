import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ApprovalActionsCard } from "@/features/client/portal/approval-actions-card";
import {
  getClientPortalProjectById,
  getSelectedClientProject,
  type ClientProjectSearchParams,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Approvals",
};

export default async function ClientApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<ClientProjectSearchParams>;
}) {
  const selection = await getSelectedClientProject(searchParams);
  const projectId = selection.selectedProjectId;

  if (selection.didFallback && projectId) {
    redirect(`/client/approvals?projectId=${encodeURIComponent(projectId)}`);
  }

  if (projectId) {
    const project = await getClientPortalProjectById(projectId);

    if (!project) {
      notFound();
    }

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Approvals"
          title={`${project.name} approvals`}
          description="Review work that needs your sign-off, approve it, or ask for changes."
        />

        <ApprovalActionsCard
          projectId={project.id}
          approvals={project.approvals}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals"
        title="Project approvals"
        description="Review work that needs your sign-off, approve it, or ask for changes."
      />

      <EmptyState
        icon={BadgeCheck}
        title="No active projects yet"
        description="Approval requests will show here after a project is added to your portal."
      />
    </div>
  );
}
