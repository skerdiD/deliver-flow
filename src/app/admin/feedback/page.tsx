import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getAdminFeedbackPageData } from "@/features/admin/operations/admin-operations-data";
import { AdminFeedbackPage } from "@/features/admin/operations/admin-feedback-page";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function AdminFeedbackRoute() {
  const data = await getAdminFeedbackPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="Review client notes"
        description="Read fresh client feedback, keep the review queue tidy, and close the loop on requested changes."
      />

      <AdminFeedbackPage data={data} />
    </div>
  );
}
