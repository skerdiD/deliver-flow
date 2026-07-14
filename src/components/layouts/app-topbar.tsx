import { LogoutButton } from "@/components/auth/logout-button";
import { ClientProjectControls } from "@/components/layouts/client-project-controls";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationCenter } from "@/features/notifications/notification-center";
import type { NotificationCenterState } from "@/features/notifications/types";
import {
  AdminQuickActions,
  type AdminQuickActionProject,
} from "@/components/layouts/admin-quick-actions";
import { MobileSidebar } from "@/components/layouts/mobile-sidebar";
import type { ClientProjectSwitcherProject } from "@/features/client/portal/portal-data";

type AppTopbarProps = {
  title: string;
  description?: string;
  userName?: string | null;
  userRoleLabel: string;
  quickActionProjects?: AdminQuickActionProject[];
  clientProjects?: ClientProjectSwitcherProject[];
  defaultClientProjectId?: string | null;
  mobileNavigationType?: "admin" | "client";
  notificationCenterState?: NotificationCenterState;
  notificationsHref?: string;
};

export function AppTopbar({
  title,
  description,
  userName,
  userRoleLabel,
  quickActionProjects,
  clientProjects,
  defaultClientProjectId = null,
  mobileNavigationType,
  notificationCenterState,
  notificationsHref,
}: AppTopbarProps) {
  const showQuickActions = Boolean(quickActionProjects);
  const showClientProjectControls = Boolean(clientProjects);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border/80 bg-card/90 backdrop-blur-xl">
      <div className="flex min-h-16 flex-wrap items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {mobileNavigationType ? (
            <MobileSidebar type={mobileNavigationType} />
          ) : null}

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {title}
            </h1>
            {description ? (
              <p className="hidden max-w-xl truncate text-sm text-muted-foreground sm:block">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {showClientProjectControls ? (
          <div className="order-3 flex w-full min-w-0 items-center lg:order-none lg:w-auto">
            <ClientProjectControls
              projects={clientProjects ?? []}
              defaultProjectId={defaultClientProjectId}
            />
          </div>
        ) : null}

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          {showQuickActions ? (
            <AdminQuickActions projects={quickActionProjects ?? []} />
          ) : null}

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />

            {notificationCenterState && notificationsHref ? (
              <NotificationCenter
                initialState={notificationCenterState}
                notificationsHref={notificationsHref}
              />
            ) : null}
          </div>

          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-foreground">
              {userName ?? "DeliverFlow user"}
            </p>
            <p className="text-xs text-muted-foreground">{userRoleLabel}</p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
