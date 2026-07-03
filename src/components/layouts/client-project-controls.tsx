"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Files,
  FolderKanban,
  MessageSquare,
  MoreHorizontal,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClientPaymentStatusBadge,
  ClientProjectStatusBadge,
} from "@/features/client/portal/client-project-status-badge";
import type { ClientProjectSwitcherProject } from "@/features/client/portal/portal-data";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ClientProjectControlsProps = {
  projects: ClientProjectSwitcherProject[];
  defaultProjectId: string | null;
};

type OptimisticProjectSelection = {
  projectId: string | null;
  pathname: string;
  currentProjectId: string | null;
};

const projectAwareRoutes = [
  "/client/overview",
  "/client/dashboard",
  "/client/project",
  "/client/files",
  "/client/feedback",
  "/client/payments",
  "/client/approvals",
] as const;

const quickActions = [
  {
    label: "View project",
    href: "/client/project",
    icon: FolderKanban,
  },
  {
    label: "View files",
    href: "/client/files",
    icon: Files,
  },
  {
    label: "Send feedback",
    href: "/client/feedback",
    icon: MessageSquare,
  },
  {
    label: "Review approvals",
    href: "/client/approvals",
    icon: BadgeCheck,
  },
  {
    label: "View payments",
    href: "/client/payments",
    icon: WalletCards,
  },
] as const;

function normalizeClientPath(pathname: string) {
  const matchedRoute = projectAwareRoutes.find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return matchedRoute ?? pathname;
}

function buildProjectHref(pathname: string, search: string, projectId: string) {
  const params = new URLSearchParams(search);
  params.set("projectId", projectId);

  return `${normalizeClientPath(pathname)}?${params.toString()}`;
}

function buildAllProjectsHref(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  params.delete("projectId");
  const query = params.toString();
  const path = normalizeClientPath(pathname);

  return query ? `${path}?${query}` : path;
}

function buildSectionHref(href: string, projectId: string) {
  const params = new URLSearchParams({ projectId });

  return `${href}?${params.toString()}`;
}

export function ClientProjectControls({
  projects,
  defaultProjectId,
}: ClientProjectControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const isOverviewRoute =
    pathname === "/client/overview" || pathname === "/client/dashboard";
  const requestedProjectId = searchParams.get("projectId");
  const currentProjectId = isOverviewRoute
    ? requestedProjectId
    : requestedProjectId ?? defaultProjectId;
  const [optimisticSelection, setOptimisticSelection] =
    useState<OptimisticProjectSelection | null>(null);
  const displayProjectId =
    optimisticSelection?.pathname === pathname &&
    optimisticSelection.currentProjectId === currentProjectId
      ? optimisticSelection.projectId
      : currentProjectId;
  const selectedProject =
    displayProjectId
      ? projects.find((project) => project.id === displayProjectId) ?? null
      : null;
  const selectedProjectId = selectedProject?.id ?? null;
  const projectHrefs = useMemo(
    () => {
      const hrefs = projects.map((project) =>
        buildProjectHref(pathname, search, project.id),
      );

      return isOverviewRoute
        ? [buildAllProjectsHref(pathname, search), ...hrefs]
        : hrefs;
    },
    [isOverviewRoute, pathname, projects, search],
  );
  const quickActionHrefs = useMemo(
    () =>
      selectedProjectId
        ? quickActions.map((action) =>
            buildSectionHref(action.href, selectedProjectId),
          )
        : [],
    [selectedProjectId],
  );
  const prefetchHrefs = useCallback(
    (hrefs: string[]) => {
      for (const href of hrefs) {
        router.prefetch(href);
      }
    },
    [router],
  );

  if (projects.length === 0) {
    return (
      <div className="flex min-w-0 items-center">
        <Button
          type="button"
          variant="outline"
          disabled
          className="h-10 max-w-full justify-start gap-2 border-slate-200 bg-white/80 px-3 text-slate-500"
        >
          <BriefcaseBusiness className="size-4 shrink-0" />
          <span className="truncate">No active projects</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            prefetchHrefs(projectHrefs);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-0 flex-1 justify-start gap-2 border-slate-200 bg-white/80 px-3 text-slate-700 hover:bg-slate-50 hover:text-slate-950 sm:w-[min(22rem,34vw)] sm:flex-none"
          >
            <BriefcaseBusiness className="size-4 shrink-0 text-slate-500" />
            <span className="hidden shrink-0 text-slate-500 sm:inline">
              {isOverviewRoute ? "Filter:" : "Project:"}
            </span>
            <span className="min-w-0 flex-1 truncate text-left font-semibold">
              {selectedProject?.name ?? "All projects"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 max-w-[92vw] p-2">
          <DropdownMenuLabel className="px-2 py-1.5">
            {isOverviewRoute ? "Filter by project" : "Project switcher"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isOverviewRoute ? (
            <DropdownMenuItem asChild className="items-start gap-3 px-2.5 py-3">
              <Link
                href={buildAllProjectsHref(pathname, search)}
                prefetch
                onClick={() =>
                  setOptimisticSelection({
                    projectId: null,
                    pathname,
                    currentProjectId,
                  })
                }
                onMouseEnter={() =>
                  router.prefetch(buildAllProjectsHref(pathname, search))
                }
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                  {!selectedProjectId ? (
                    <Check className="size-4 text-slate-950" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-950">
                    All projects
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Show every active project assigned to you.
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ) : null}
          {projects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            const href = buildProjectHref(pathname, search, project.id);

            return (
              <DropdownMenuItem
                key={project.id}
                asChild
                className="items-start gap-3 px-2.5 py-3"
              >
                <Link
                  href={href}
                  prefetch
                  onClick={() =>
                    setOptimisticSelection({
                      projectId: project.id,
                      pathname,
                      currentProjectId,
                    })
                  }
                  onMouseEnter={() => router.prefetch(href)}
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                    {isSelected ? (
                      <Check className="size-4 text-slate-950" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-950">
                      {project.name}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <ClientProjectStatusBadge status={project.status} />
                      <ClientPaymentStatusBadge status={project.paymentStatus} />
                    </span>
                    {project.deadline ? (
                      <span className="mt-2 block text-xs text-slate-500">
                        Deadline {formatShortDate(project.deadline)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedProjectId ? (
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) {
              prefetchHrefs(quickActionHrefs);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-label="Open quick actions"
              className={cn(
                "h-10 shrink-0 gap-2 border-slate-200 bg-white/80 px-3 text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                "max-sm:w-10 max-sm:px-0",
              )}
            >
              <MoreHorizontal className="size-4" />
              <span className="hidden sm:inline">Quick actions</span>
              <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-2">
            <DropdownMenuLabel className="px-2 py-1.5">
              Quick actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickActions.map((action) => {
              const Icon = action.icon;
              const href = buildSectionHref(action.href, selectedProjectId);

              return (
                <DropdownMenuItem
                  key={action.href}
                  asChild
                  className="gap-3 px-2.5 py-2.5"
                >
                  <Link
                    href={href}
                    prefetch
                    onMouseEnter={() => router.prefetch(href)}
                  >
                    <Icon className="size-4 text-slate-500" />
                    <span>{action.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
