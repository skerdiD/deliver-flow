import type { Metadata } from "next";
import { MessageSquareMore } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { FeedbackForm } from "@/features/client/portal/feedback-form";
import {
  getClientPortalProjectFeedbackById,
  getSelectedClientProject,
  type ClientProjectSearchParams,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function ClientFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<ClientProjectSearchParams>;
}) {
  const selection = await getSelectedClientProject(searchParams);
  const projectId = selection.selectedProjectId;

  if (selection.didFallback && projectId) {
    redirect(`/client/feedback?projectId=${encodeURIComponent(projectId)}`);
  }

  if (projectId) {
    const project = await getClientPortalProjectFeedbackById(projectId);

    if (!project) {
      notFound();
    }

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Feedback"
          title={`${project.name} feedback`}
          description="Send feedback so your freelancer knows what to adjust."
        />

        <FeedbackForm projectId={project.id} feedback={project.feedback} />
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

      <EmptyState
        icon={MessageSquareMore}
        title="No active projects yet"
        description="You can send feedback after a project is added to your portal."
      />
    </div>
  );
}
