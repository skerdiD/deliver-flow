import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ClientSettingsPage } from "@/features/client/portal/client-settings-page";
import { requireRole } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function ClientSettingsRoute() {
  const profile = await requireRole("client");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Client portal settings"
        description="Basic account details for your client portal."
      />

      <ClientSettingsPage
        fullName={profile.full_name}
        email={profile.email}
        createdAt={profile.created_at}
      />
    </div>
  );
}
