import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AppTopbar } from "@/components/layouts/app-topbar";
import type { AdminQuickActionProject } from "@/components/layouts/admin-quick-actions";
import { DemoWorkspaceBanner } from "@/components/layouts/demo-workspace-banner";
import type { NotificationCenterState } from "@/features/notifications/types";
import type { Profile } from "@/types/database";

type AdminDashboardLayoutProps = {
  profile: Profile;
  quickActionProjects: AdminQuickActionProject[];
  notificationCenterState: NotificationCenterState;
  notificationsHref: string;
  isDemoWorkspace?: boolean;
  children: React.ReactNode;
};

export function AdminDashboardLayout({
  profile,
  quickActionProjects,
  notificationCenterState,
  notificationsHref,
  isDemoWorkspace = false,
  children,
}: AdminDashboardLayoutProps) {
  return (
    <div className="h-dvh min-h-dvh overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full min-h-0">
        <AdminSidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppTopbar
            title="Owner Dashboard"
            description="Manage delivery, clients, approvals, and payments."
            userName={profile.full_name}
            userRoleLabel={getRoleLabel(profile.role)}
            quickActionProjects={quickActionProjects}
            mobileNavigationType="admin"
            notificationCenterState={notificationCenterState}
            notificationsHref={notificationsHref}
          />

          {isDemoWorkspace ? <DemoWorkspaceBanner /> : null}

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-none px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-8 xl:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function getRoleLabel(role: Profile["role"]) {
  return role === "owner" ? "Owner" : "Client";
}
