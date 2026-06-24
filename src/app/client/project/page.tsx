import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getLatestClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ClientProjectPage() {
  const project = await getLatestClientPortalProject();

  if (project) {
    redirect(`/client/project/${project.id}`);
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
        description="Your project updates will appear here once your freelancer connects an active project to this portal."
      />
    </div>
  );
}
