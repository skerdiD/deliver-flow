import { LogoutButton } from "@/components/auth/logout-button";
import { ClientProjectControls } from "@/components/layouts/client-project-controls";
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
}: AppTopbarProps) {
  const showQuickActions = Boolean(quickActionProjects);
  const showClientProjectControls = Boolean(clientProjects);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-16 flex-wrap items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {mobileNavigationType ? (
            <MobileSidebar type={mobileNavigationType} />
          ) : null}

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-950 sm:text-base">
              {title}
            </h1>
            {description ? (
              <p className="hidden max-w-xl truncate text-sm text-slate-500 sm:block">
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

          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-slate-900">
              {userName ?? "DeliverFlow user"}
            </p>
            <p className="text-xs text-slate-500">{userRoleLabel}</p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
