import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminTeamSettingsData } from "@/features/admin/operations/admin-operations-data";
import { TeamSettingsPage } from "@/features/admin/settings/team-settings-page";

export const metadata: Metadata = {
  title: "Team settings",
};

export default async function AdminTeamSettingsRoute() {
  const data = await getAdminTeamSettingsData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Team settings"
        description="Review members who can access this workspace."
      />

      <TeamSettingsPage data={data} />
    </div>
  );
}
