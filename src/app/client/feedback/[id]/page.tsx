import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { FeedbackForm } from "@/features/client/portal/feedback-form";
import { getClientPortalProjectById } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function ClientProjectFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getClientPortalProjectById(id);

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
