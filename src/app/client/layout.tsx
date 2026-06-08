import { ClientPortalLayout } from "@/components/layouts/client-portal-layout";
import { requireRole } from "@/lib/supabase/auth";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default async function ClientLayout({ children }: ClientLayoutProps) {
  const profile = await requireRole("client");

  return <ClientPortalLayout profile={profile}>{children}</ClientPortalLayout>;
}