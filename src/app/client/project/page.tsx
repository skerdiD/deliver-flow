import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getLatestClientPortalProjectId } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ClientProjectPage() {
  const projectId = await getLatestClientPortalProjectId();

  if (projectId) {
    redirect(`/client/project/${projectId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title="Project overview"
        description="See what is done, what is active, what comes next, and what needs your review."
      />

      <EmptyState
        icon={FolderOpen}
        title="No active projects yet"
        description="You will see project updates here once a project is added to your portal."
      />
    </div>
  );
}
