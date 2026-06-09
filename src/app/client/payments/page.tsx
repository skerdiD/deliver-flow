import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ClientPaymentSummary } from "@/features/client/portal/client-payment-summary";
import { getClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Payments",
};

export default async function ClientPaymentsPage() {
  const project = await getClientPortalProject();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title="Project payment status"
        description="See what has been paid, what remains, and which milestone payment is next."
      />

      <ClientPaymentSummary project={project} />
    </div>
  );
}