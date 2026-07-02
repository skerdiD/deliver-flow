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
          "dashboard-sidebar-shell h-dvh shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-20" : expandedWidthClass,
        )}
      >
        <div
          className={cn(
            "relative flex h-16 shrink-0 items-center border-b border-slate-200",
            isCollapsed ? "justify-center px-3" : "px-5 pr-12",
          )}
        >
          <Link
            href={resolvedHomeHref}
            aria-label="DeliverFlow workspace"
            className={cn(
              "min-w-0 transition-all duration-200",
              isCollapsed && "flex justify-center",
            )}
          >
            <BrandLogo
              subtitle={subtitle}
              showText={!isCollapsed}
              iconClassName={isCollapsed ? "size-10" : undefined}
            />
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "absolute top-1/2 z-20 size-8 -translate-y-1/2 rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
              isCollapsed ? "right-2" : "right-3",
            )}
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
              isCollapsed ? "flex flex-col items-center gap-1.5 px-0" : "space-y-1 px-3",
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
                  aria-label={item.title}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/20 focus-visible:ring-offset-2",
                    isCollapsed
                      ? "size-12 justify-center rounded-2xl"
                      : "min-h-10 gap-3 rounded-xl px-3 py-2.5",
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors duration-200",
                      isCollapsed ? "size-5" : "size-4",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-700",
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
              "border-t border-slate-200",
              isCollapsed ? "hidden" : "px-4 py-4",
            )}
          >
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {footerTitle}
              </p>
              <p className="mt-2 text-sm leading-5 text-slate-600">
                {footerDescription}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
