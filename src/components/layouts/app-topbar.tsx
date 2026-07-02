import { Search } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  AdminQuickActions,
  type AdminQuickActionProject,
} from "@/components/layouts/admin-quick-actions";
import { MobileSidebar } from "@/components/layouts/mobile-sidebar";
import { Input } from "@/components/ui/input";

type AppTopbarProps = {
  title: string;
  description?: string;
  userName?: string | null;
  userRoleLabel: string;
  quickActionProjects?: AdminQuickActionProject[];
  mobileNavigationType?: "admin" | "client";
};

export function AppTopbar({
  title,
  description,
  userName,
  userRoleLabel,
  quickActionProjects,
  mobileNavigationType,
}: AppTopbarProps) {
  const showQuickActions = Boolean(quickActionProjects);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
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

        <div className="hidden h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 shadow-inner xl:flex">
          <Search className="size-4 text-slate-400" />
          <Input
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            placeholder="Search projects, clients, files..."
          />
        </div>

        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
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
