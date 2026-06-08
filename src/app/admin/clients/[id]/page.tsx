import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ClientDetailCard } from "@/features/admin/clients/client-detail-card";
import { ClientProjectsTable } from "@/features/admin/clients/client-projects-table";
import { getAdminClientById } from "@/features/admin/clients/clients-data";

export const metadata: Metadata = {
  title: "Client Profile",
};

type ClientProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientProfilePage({
  params,
}: ClientProfilePageProps) {
  const { id } = await params;
  const client = await getAdminClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Button variant="outline" asChild>
          <Link href="/admin/clients">
            <ArrowLeft className="mr-2 size-4" />
            Back to clients
          </Link>
        </Button>

        <Button asChild>
          <Link href={`/admin/clients/${client.id}/edit`}>
            <Pencil className="mr-2 size-4" />
            Edit Client
          </Link>
        </Button>
      </div>

      <ClientDetailCard client={client} />

      <ClientProjectsTable projects={client.projects} />
    </div>
  );
}