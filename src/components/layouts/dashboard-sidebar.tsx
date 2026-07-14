"use client";

import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

type DashboardSidebarProps = {
  homeHref: string;
  subtitle: string;
  navigation: readonly NavigationItem[];
  expandedWidthClass?: string;
  footerTitle: string;
  footerDescription: string;
  preserveProjectId?: boolean;
};

function withProjectId(href: string, projectId: string | null) {
  if (!projectId || !href.startsWith("/client/")) {
    return href;
  }

  const params = new URLSearchParams({ projectId });

  return `${href}?${params.toString()}`;
}

export function DashboardSidebar({
  homeHref,
  subtitle,
  navigation,
  expandedWidthClass = "w-72",
  footerTitle,
  footerDescription,
  preserveProjectId = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = preserveProjectId ? searchParams.get("projectId") : null;
  const resolvedHomeHref = withProjectId(homeHref, projectId);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "dashboard-sidebar-shell h-dvh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-24" : expandedWidthClass,
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border",
            isCollapsed ? "justify-between px-3" : "px-5",
          )}
        >
          <Link
            href={resolvedHomeHref}
            prefetch={preserveProjectId ? true : undefined}
            aria-label="DeliverFlow workspace"
            className={cn(
              "min-w-0 flex-1 transition-all duration-200",
              isCollapsed && "flex-none",
            )}
          >
            <BrandLogo
              subtitle={subtitle}
              showText={!isCollapsed}
              iconClassName={isCollapsed ? "size-9" : undefined}
            />
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="size-8 shrink-0 rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:text-foreground"
            onClick={() => setIsCollapsed((current) => !current)}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <nav
            className={cn(
              "flex-1 py-4",
              isCollapsed
                ? "flex flex-col items-center gap-1.5 px-0"
                : "space-y-1 px-3",
            )}
            aria-label={subtitle}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const href = withProjectId(item.href, projectId);
              const link = (
                <Link
                  key={item.href}
                  href={href}
                  prefetch={preserveProjectId ? true : undefined}
                  aria-label={item.title}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    isCollapsed
                      ? "size-12 justify-center rounded-2xl"
                      : "min-h-10 gap-3 rounded-xl px-3 py-2.5",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors duration-200",
                      isCollapsed ? "size-5" : "size-4",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-slate-400 group-hover:text-foreground",
                    )}
                  />

                  {isCollapsed ? (
                    <span className="sr-only">
                      {item.title}
                      {isActive ? " current page" : ""}
                    </span>
                  ) : (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              );

              if (!isCollapsed) {
                return link;
              }

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <div
            className={cn(
              "border-t border-sidebar-border",
              isCollapsed ? "hidden" : "px-4 py-4",
            )}
          >
            <div className="rounded-lg border border-sidebar-border bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">
                {footerTitle}
              </p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {footerDescription}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
