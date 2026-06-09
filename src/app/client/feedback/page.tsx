import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { FeedbackForm } from "@/features/client/portal/feedback-form";
import { getClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function ClientFeedbackPage() {
  const project = await getClientPortalProject();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="Send project feedback"
        description="Share what looks good, what needs changes, or what feels unclear. Your notes stay connected to the project."
      />

      <FeedbackForm feedback={project.feedback} />
    </div>
  );
}