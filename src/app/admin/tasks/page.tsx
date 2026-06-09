import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminTasksPageData } from "@/features/admin/operations/admin-operations-data";
import { AdminTasksPage } from "@/features/admin/operations/admin-tasks-page";

export const metadata: Metadata = {
  title: "Tasks",
};

export default async function AdminTasksRoute() {
  const data = await getAdminTasksPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title="Track project work"
        description="See every task across projects, spot blockers quickly, and keep due dates in view."
      />

      <AdminTasksPage data={data} />
    </div>
  );
}
