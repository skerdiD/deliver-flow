import type { Metadata } from "next";
import { WalletCards } from "lucide-react";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ClientPaymentSummary } from "@/features/client/portal/client-payment-summary";
import {
  getClientPortalProjectPaymentsById,
  getLatestClientPortalProjectId,
  recordClientProjectPaymentViews,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Payments",
};

export default async function ClientPaymentsPage() {
  const projectId = await getLatestClientPortalProjectId();

  if (projectId) {
    const project = await getClientPortalProjectPaymentsById(projectId);

    if (!project) {
      notFound();
    }

    after(() => {
      void recordClientProjectPaymentViews(project).catch((error: unknown) => {
        console.error("Failed to record client payment views", error);
      });
    });

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Payments"
          title={`${project.name} payments`}
          description="See what has been paid, what remains, and which milestone payment is next."
        />

        <ClientPaymentSummary project={project} />
      </div>
    );
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
