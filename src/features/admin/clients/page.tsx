import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ClientsTable } from "@/features/admin/clients/clients-table";
import { getAdminClients } from "@/features/admin/clients/clients-data";

export const metadata: Metadata = {
  title: "Clients",
};

export default async function AdminClientsPage() {
  const clients = await getAdminClients();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clients"
        title="Manage client accounts"
        description="Keep client details, project access, payments, and latest activity organized in one place."
      >
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus className="mr-2 size-4" />
            Add Client
          </Link>
        </Button>
      </PageHeader>

      <ClientsTable clients={clients} />
    </div>
  );
}