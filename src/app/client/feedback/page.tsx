import type { Metadata } from "next";
import { MessageSquareMore } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { FeedbackForm } from "@/features/client/portal/feedback-form";
import { getClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function ClientFeedbackPage() {
  const project = await getClientPortalProject();

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Feedback"
          title="Send project feedback"
          description="Send feedback so your freelancer knows what to adjust."
        />

        <EmptyState
          icon={MessageSquareMore}
          title="No project has been assigned yet."
          description="Once a project is assigned, you can send feedback so your freelancer knows what to adjust."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="Send project feedback"
        description="Send feedback so your freelancer knows what to adjust."
      />

      <FeedbackForm feedback={project.feedback} />
    </div>
  );
}
