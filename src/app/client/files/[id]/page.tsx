import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { PageHeader } from "@/components/shared/page-header";
import { ClientFilesGrid } from "@/features/client/portal/client-files-grid";
import {
  getClientPortalProjectFilesById,
  recordClientProjectFileViews,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Files",
};

export default async function ClientProjectFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getClientPortalProjectFilesById(id);

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
