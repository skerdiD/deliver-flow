import { ClientPortalLayout } from "@/components/layouts/client-portal-layout";
import { getClientAssignedProjects } from "@/features/client/portal/portal-data";
import { requireRole } from "@/lib/supabase/auth";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default async function ClientLayout({ children }: ClientLayoutProps) {
  const [profile, projects] = await Promise.all([
    requireRole("client"),
    getClientAssignedProjects(),
  ]);

  return (
    <ClientPortalLayout profile={profile} projects={projects}>
      {children}
    </ClientPortalLayout>
  );
}
