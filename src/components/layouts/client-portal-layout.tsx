import { AppTopbar } from "@/components/layouts/app-topbar";
import { ClientSidebar } from "@/components/layouts/client-sidebar";
import type { ClientProjectSwitcherProject } from "@/features/client/portal/portal-data";
import type { NotificationCenterState } from "@/features/notifications/types";
import type { Profile } from "@/types/database";

type ClientPortalLayoutProps = {
  profile: Profile;
  projects: ClientProjectSwitcherProject[];
  notificationCenterState: NotificationCenterState;
  notificationsHref: string;
  children: React.ReactNode;
};

export function ClientPortalLayout({
  profile,
  projects,
  notificationCenterState,
  notificationsHref,
  children,
}: ClientPortalLayoutProps) {
  return (
    <div className="fixed inset-0 h-dvh overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full min-h-0">
        <ClientSidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppTopbar
            title="Client Portal"
            description="Track projects, files, feedback, approvals, and payments."
            userName={profile.full_name}
            userRoleLabel="Client"
            clientProjects={projects}
            defaultClientProjectId={projects[0]?.id ?? null}
            mobileNavigationType="client"
            notificationCenterState={notificationCenterState}
            notificationsHref={notificationsHref}
          />

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
