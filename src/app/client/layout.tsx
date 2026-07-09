import { ClientPortalLayout } from "@/components/layouts/client-portal-layout";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { getClientAssignedProjects } from "@/features/client/portal/portal-data";
import { isDemoWorkspaceSlug } from "@/lib/demo";
import { requireRole } from "@/lib/supabase/auth";
import { eq } from "drizzle-orm";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default async function ClientLayout({ children }: ClientLayoutProps) {
  const profile = await requireRole("client");
  const [projects, workspace] = await Promise.all([
    getClientAssignedProjects(),
    db
      .select({ slug: workspaces.slug })
      .from(workspaces)
      .where(eq(workspaces.id, profile.workspace_id))
      .limit(1),
  ]);

  return (
    <ClientPortalLayout
      profile={profile}
      projects={projects}
      isDemoWorkspace={isDemoWorkspaceSlug(workspace[0]?.slug)}
    >
      {children}
    </ClientPortalLayout>
  );
}
