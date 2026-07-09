import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ClientInvitePanel } from "@/features/admin/clients/client-invite-panel";
import { ClientsTable } from "@/features/admin/clients/clients-table";
import { getAdminClients } from "@/features/admin/clients/clients-data";
import { getAdminClientInvites } from "@/features/admin/clients/invite-data";

export const metadata: Metadata = {
  title: "Clients",
};

export default async function AdminClientsPage() {
  const [clients, invites] = await Promise.all([
    getAdminClients(),
    getAdminClientInvites(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clients"
        title="Manage client accounts"
        description="Keep client details, project access, payments, and latest activity organized in one place."
      >
        <Button asChild>
          <Link href="/owner/clients/new">
            <Plus className="mr-2 size-4" />
            Add Client
          </Link>
        </Button>
      </PageHeader>

      <ClientInvitePanel invites={invites} />

      <ClientsTable clients={clients} />
    </div>
  );
}
