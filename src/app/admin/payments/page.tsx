import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminPaymentsPageData } from "@/features/admin/operations/admin-operations-data";
import { AdminPaymentsPage } from "@/features/admin/operations/admin-payments-page";

export const metadata: Metadata = {
  title: "Payments",
};

export default async function AdminPaymentsRoute() {
  const data = await getAdminPaymentsPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title="Follow invoice status"
        description="See paid work, open balances, and overdue invoices without leaving the Owner workspace."
      />

      <AdminPaymentsPage data={data} />
    </div>
  );
}
