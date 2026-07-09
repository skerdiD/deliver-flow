import { AdminDashboardLayout } from "@/components/layouts/admin-dashboard-layout";
import { getAdminQuickActionProjects } from "@/features/admin/projects/projects-data";
import { requireOwnerRole } from "@/lib/supabase/auth";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const profile = await requireOwnerRole();
  const quickActionProjects = await getAdminQuickActionProjects();

  return (
    <AdminDashboardLayout
      profile={profile}
      quickActionProjects={quickActionProjects}
    >
      {children}
    </AdminDashboardLayout>
  );
}
