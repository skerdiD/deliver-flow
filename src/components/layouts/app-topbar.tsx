import { Bell, Search } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AppTopbarProps = {
  title: string;
  description?: string;
  userName?: string | null;
  userRoleLabel: string;
};

export function AppTopbar({
  title,
  description,
  userName,
  userRoleLabel,
}: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-950">
            {title}
          </h1>
          {description ? (
            <p className="hidden text-sm text-slate-500 sm:block">
              {description}
            </p>
          ) : null}
        </div>

        <div className="hidden w-full max-w-sm items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 xl:flex">
          <Search className="size-4 text-slate-400" />
          <Input
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            placeholder="Search projects, clients, files..."
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="icon" className="hidden sm:inline-flex">
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>

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
