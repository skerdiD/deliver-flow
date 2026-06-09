import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminApprovalsPageData } from "@/features/admin/operations/admin-operations-data";
import { AdminApprovalsPage } from "@/features/admin/operations/admin-approvals-page";

export const metadata: Metadata = {
  title: "Approvals",
};

export default async function AdminApprovalsRoute() {
  const data = await getAdminApprovalsPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals"
        title="Watch client decisions"
        description="Pending approvals, approved milestones, and requested changes all live here in one clear queue."
      />

      <AdminApprovalsPage data={data} />
    </div>
  );
}
