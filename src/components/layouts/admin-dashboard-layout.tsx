import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AppTopbar } from "@/components/layouts/app-topbar";
import { MobileSidebar } from "@/components/layouts/mobile-sidebar";
import type { Profile } from "@/types/database";

type AdminDashboardLayoutProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function AdminDashboardLayout({
  profile,
  children,
}: AdminDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          <MobileSidebar type="admin" />

          <AppTopbar
            title="Admin Dashboard"
            description="Manage delivery, clients, approvals, and payments."
            userName={profile.full_name}
            userRoleLabel="Admin"
          />

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}