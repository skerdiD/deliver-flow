import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ClientFilesGrid } from "@/features/client/portal/client-files-grid";
import { getClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Files",
};

export default async function ClientFilesPage() {
  const project = await getClientPortalProject();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files"
        title="Project files and documents"
        description="Find proposals, designs, briefs, invoices, and delivery files without searching through old messages."
      />

      <ClientFilesGrid files={project.files} />
    </div>
  );
}