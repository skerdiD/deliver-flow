import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { PageHeader } from "@/components/shared/page-header";
import { ClientPaymentSummary } from "@/features/client/portal/client-payment-summary";
import {
  getClientPortalProjectPaymentsById,
  recordClientProjectPaymentViews,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Payments",
};

export default async function ClientProjectPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getClientPortalProjectPaymentsById(id);

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
