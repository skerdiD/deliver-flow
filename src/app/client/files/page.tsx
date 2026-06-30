import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ClientFilesGrid } from "@/features/client/portal/client-files-grid";
import {
  getClientPortalProjectFilesById,
  getLatestClientPortalProjectId,
  recordClientProjectFileViews,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Files",
};

export default async function ClientFilesPage() {
  const projectId = await getLatestClientPortalProjectId();

  if (projectId) {
    const project = await getClientPortalProjectFilesById(projectId);

    if (!project) {
      notFound();
    }

    after(() => {
      void recordClientProjectFileViews(project).catch((error: unknown) => {
        console.error("Failed to record client file views", error);
      });
    });

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Files"
          title={`${project.name} files`}
          description="Find proposals, designs, briefs, invoices, and delivery files without searching through old messages."
        />

        <ClientFilesGrid files={project.files} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files"
        title="Project files and documents"
        description="Find proposals, designs, briefs, invoices, and delivery files without searching through old messages."
      />

      <EmptyState
        icon={FolderOpen}
        title="No active projects yet"
        description="Files will show here after a project is added to your portal."
      />
    </div>
  );
}
