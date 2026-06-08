import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout";
import { requireRole } from "@/lib/supabase/auth";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const profile = await requireRole("admin");

  return (
    <AdminDashboardLayout profile={profile}>{children}</AdminDashboardLayout>
  );
}