import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminWorkspaceSettingsData } from "@/features/admin/operations/admin-operations-data";
import { WorkspaceSettingsPage } from "@/features/admin/settings/workspace-settings-page";

export const metadata: Metadata = {
  title: "Workspace settings",
};

export default async function AdminWorkspaceSettingsRoute() {
  const data = await getAdminWorkspaceSettingsData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Manage the core details for this DeliverFlow workspace."
      />

      <WorkspaceSettingsPage data={data} />
    </div>
  );
}
