import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminMilestonesPageData } from "@/features/admin/operations/admin-operations-data";
import { AdminMilestonesPage } from "@/features/admin/operations/admin-milestones-page";

export const metadata: Metadata = {
  title: "Milestones",
};

export default async function AdminMilestonesRoute() {
  const data = await getAdminMilestonesPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Milestones"
        title="Manage delivery roadmap"
        description="Track each client-facing milestone, review state, and recent responses without exposing internal task noise."
      />

      <AdminMilestonesPage data={data} />
    </div>
  );
}
