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
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <AdminSidebar />

        <div className="min-w-0 flex-1 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
          <MobileSidebar type="admin" />

          <AppTopbar
            title="Admin Dashboard"
            description="Manage delivery, clients, approvals, and payments."
            userName={profile.full_name}
            userRoleLabel="Admin"
          />

          <main className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
