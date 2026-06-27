"use client";

import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
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
};

export function DashboardSidebar({
  homeHref,
  subtitle,
  navigation,
  expandedWidthClass = "w-72",
  footerTitle,
  footerDescription,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "dashboard-sidebar-shell h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-200",
        isCollapsed ? "w-20" : expandedWidthClass,
      )}
    >
      <div
        className={cn(
          "relative flex h-16 shrink-0 items-center border-b border-slate-200",
          isCollapsed ? "justify-center px-3" : "px-6",
        )}
      >
        <Link
          href={homeHref}
          aria-label="DeliverFlow workspace"
          className={cn("min-w-0", isCollapsed && "flex justify-center")}
        >
          <BrandLogo subtitle={subtitle} showText={!isCollapsed} />
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950",
            isCollapsed && "right-2",
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        <nav
          className={cn("space-y-1 px-3 py-5", isCollapsed && "px-2")}
          aria-label={subtitle}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.title}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "group flex min-h-10 items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/20 focus-visible:ring-offset-2",
                  isCollapsed
                    ? "justify-center px-2 py-2.5"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
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
          })}
        </nav>

        {!isCollapsed ? (
          <div className="mx-4 mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {footerTitle}
            </p>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              {footerDescription}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
