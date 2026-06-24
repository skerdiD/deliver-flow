import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminFilesPageData } from "@/features/admin/operations/admin-operations-data";
import { AdminFilesPage } from "@/features/admin/operations/admin-files-page";

export const metadata: Metadata = {
  title: "Files",
};

export default async function AdminFilesRoute() {
  const data = await getAdminFilesPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files"
        title="Review project files"
        description="Keep project files organized and check what clients can see."
      />

      <AdminFilesPage data={data} />
    </div>
  );
}
