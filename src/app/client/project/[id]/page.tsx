import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { ClientProjectDetailView } from "@/features/client/portal/client-project-detail-view";
import {
  getClientPortalProjectById,
  recordClientProjectDetailViews,
} from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getClientPortalProjectById(id);

  if (!project) {
    notFound();
  }

  after(() => {
    void recordClientProjectDetailViews(project).catch((error: unknown) => {
      console.error("Failed to record client project views", error);
    });
  });

  return <ClientProjectDetailView project={project} />;
}
