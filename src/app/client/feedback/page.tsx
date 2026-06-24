import type { Metadata } from "next";
import { MessageSquareMore } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getLatestClientPortalProject } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function ClientFeedbackPage() {
  const project = await getLatestClientPortalProject();

  if (project) {
    redirect(`/client/feedback/${project.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="Send project feedback"
        description="Send feedback so your freelancer knows what to adjust."
      />

      <EmptyState
        icon={MessageSquareMore}
        title="No active projects yet"
        description="You can send feedback after a project is added to your portal."
      />
    </div>
  );
}
