import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getLatestClientPortalProjectId } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Files",
};

export default async function ClientFilesPage() {
  const projectId = await getLatestClientPortalProjectId();

  if (projectId) {
    redirect(`/client/files/${projectId}`);
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
