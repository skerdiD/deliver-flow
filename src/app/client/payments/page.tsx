import type { Metadata } from "next";
import { WalletCards } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getLatestClientPortalProjectId } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Payments",
};

export default async function ClientPaymentsPage() {
  const projectId = await getLatestClientPortalProjectId();

  if (projectId) {
    redirect(`/client/payments/${projectId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title="Project payment status"
        description="See what has been paid, what remains, and which milestone payment is next."
      />

      <EmptyState
        icon={WalletCards}
        title="No active projects yet"
        description="Payment details will show here after a project and payment schedule are added."
      />
    </div>
  );
}
