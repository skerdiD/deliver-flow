import type { Metadata } from "next";
import { redirect } from "next/navigation";

import type { ClientProjectSearchParams } from "@/features/client/portal/portal-data";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function ClientDashboardRedirectPage({
  searchParams,
}: {
  searchParams: Promise<ClientProjectSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();
  const projectIdParam = resolvedSearchParams.projectId;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (projectId) {
    params.set("projectId", projectId);
  }

  const query = params.toString();

  redirect(query ? `/client/overview?${query}` : "/client/overview");
}
