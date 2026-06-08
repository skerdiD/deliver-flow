import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { updateClientAction } from "@/features/admin/clients/actions";
import { ClientForm } from "@/features/admin/clients/client-form";
import { getAdminClientById } from "@/features/admin/clients/clients-data";

export const metadata: Metadata = {
  title: "Edit Client",
};

type EditClientPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getAdminClientById(id);

  if (!client) {
    notFound();
  }

  const submitAction = updateClientAction.bind(null, client.id);

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href={`/admin/clients/${client.id}`}>
          <ArrowLeft className="mr-2 size-4" />
          Back to profile
        </Link>
      </Button>

      <PageHeader
        eyebrow="Edit client"
        title={`Update ${client.name}`}
        description="Change the client details used across the admin workspace."
      />

      <ClientForm
        mode="edit"
        submitAction={submitAction}
        defaultValues={{
          name: client.name,
          email: client.email,
          company: client.company ?? "",
          status: client.status,
        }}
      />
    </div>
  );
}