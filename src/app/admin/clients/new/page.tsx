import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { createClientAction } from "@/features/admin/clients/actions";
import { ClientForm } from "@/features/admin/clients/client-form";

export const metadata: Metadata = {
  title: "Add Client",
};

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New client"
        title="Add a client"
        description="Create the client record first, then assign projects when the work starts."
      />

      <ClientForm mode="create" submitAction={createClientAction} />
    </div>
  );
}
