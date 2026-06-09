import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminSettingsData } from "@/features/admin/operations/admin-operations-data";
import { AdminSettingsPage } from "@/features/admin/operations/admin-settings-page";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsRoute() {
  const data = await getAdminSettingsData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Admin workspace settings"
        description="Profile details, practical workspace defaults, and delivery preferences in one simple place."
      />

      <AdminSettingsPage data={data} />
    </div>
  );
}
