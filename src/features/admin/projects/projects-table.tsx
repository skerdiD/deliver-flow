"use client";

import { Archive, Loader2, MoreHorizontal, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordActions,
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import {
  BadgeWithMeta,
  ProgressCell,
  StackedCell,
} from "@/components/shared/record-cell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  archiveProjectAction,
  deleteProjectAction,
  type ProjectActionResult,
} from "@/features/admin/projects/actions";
import { PaymentStatusBadge } from "@/features/admin/projects/payment-status-badge";
import { ProjectStatusBadge } from "@/features/admin/projects/project-status-badge";
import type {
  AdminProject,
  AdminProjectStatus,
} from "@/features/admin/projects/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ProjectsTableProps = {
  projects: AdminProject[];
};

type StatusFilter = AdminProjectStatus | "current";

type ProjectRowActionsProps = {
  project: AdminProject;
};

function ProjectRowActions({ project }: ProjectRowActionsProps) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [result, setResult] = useState<ProjectActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<ProjectActionResult>) {
    setResult(null);

    startTransition(async () => {
      const actionResult = await action();
      setResult(actionResult);

      if (!actionResult.success) {
        return;
      }

      setArchiveOpen(false);
      setDeleteOpen(false);
      setDeleteConfirmation("");
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Project actions"
            className="border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-100"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="left"
          align="start"
          sideOffset={10}
          className="w-56 p-2"
        >
          <DropdownMenuItem
            className="h-11 gap-3 px-3 text-[15px]"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setArchiveOpen(true);
            }}
          >
            <Archive className="size-4" />
            Archive project
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            variant="destructive"
            className="h-11 gap-3 px-3 text-[15px]"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive project?</DialogTitle>
            <DialogDescription>
              This hides {project.name} from current project lists while keeping
              every task, file, payment, approval, and note intact.
            </DialogDescription>
          </DialogHeader>
          {result?.success === false ? (
            <p className="text-sm text-red-600">{result.message}</p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={isPending}
              onClick={() => runAction(() => archiveProjectAction(project.id))}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                "Archive project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This will hide this record and preserve history. Type DELETE to
              confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
          {result?.success === false ? (
            <p className="text-sm text-red-600">{result.message}</p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending || deleteConfirmation !== "DELETE"}
              onClick={() => runAction(() => deleteProjectAction(project.id))}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("current");

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(query) ||
        project.client.company.toLowerCase().includes(query) ||
        project.client.name.toLowerCase().includes(query);

      const matchesStatus =
        status === "current" ? !project.archivedAt : project.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <CardTitle>Projects</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Manage delivery progress, milestones, tasks, updates, and approvals.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_190px] lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting_feedback">Waiting feedback</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Try changing the search or status filter. New projects will appear here after you create them."
          />
        ) : (
          <>
            <MobileRecordList className="lg:block xl:hidden">
              {filteredProjects.map((project) => (
                <MobileRecordCard key={project.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-slate-950">
                        {project.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <ProjectStatusBadge status={project.status} />
                      <PaymentStatusBadge status={project.paymentStatus} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MobileRecordMeta label="Client">
                      <span className="break-words font-medium text-slate-950">
                        {project.client.company}
                      </span>
                      <p className="mt-1 break-words text-xs text-slate-500">
                        {project.client.name}
                      </p>
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Deadline">
                      {formatShortDate(project.deadline)}
                    </MobileRecordMeta>
                    <MobileRecordMeta
                      label="Progress"
                      className="sm:col-span-2"
                    >
                      <ProgressCell
                        value={project.progress}
                        className="max-w-none"
                      />
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Paid">
                      <span className="font-medium text-slate-950">
                        {formatCurrencyFromCents(project.paidCents)}
                      </span>
                    </MobileRecordMeta>
                  </div>

                  <MobileRecordActions>
                    <Button
                      variant="outline"
                      className="h-10 w-full px-4 hover:border-slate-400 hover:bg-slate-100 sm:w-auto"
                      asChild
                    >
                      <Link href={`/admin/projects/${project.id}`}>View</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 w-full px-4 hover:border-slate-400 hover:bg-slate-100 sm:w-auto"
                      asChild
                    >
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <div className="self-start sm:ml-auto">
                      <ProjectRowActions project={project} />
                    </div>
                  </MobileRecordActions>
                </MobileRecordCard>
              ))}
            </MobileRecordList>

            <div className="hidden overflow-hidden rounded-lg border border-slate-200 xl:block">
              <div className="grid grid-cols-[minmax(0,2.2fr)_150px_minmax(0,0.85fr)_minmax(0,0.8fr)_96px_auto] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                <div>Project / Client</div>
                <div>Status</div>
                <div>Progress</div>
                <div>Payment</div>
                <div className="text-right">Deadline</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="grid grid-cols-[minmax(0,2.2fr)_150px_minmax(0,0.85fr)_minmax(0,0.8fr)_96px_auto] items-center gap-4 px-5 py-4"
                  >
                    <StackedCell>
                      <p className="line-clamp-1 break-words font-medium text-slate-950">
                        {project.name}
                      </p>
                      <p className="line-clamp-2 break-words text-sm leading-5 text-slate-500">
                        {project.description}
                      </p>
                      <p className="line-clamp-1 break-words text-xs font-medium text-slate-700">
                        {project.client.company} - {project.client.name}
                      </p>
                    </StackedCell>

                    <BadgeWithMeta
                      badge={<ProjectStatusBadge status={project.status} />}
                    />

                    <ProgressCell value={project.progress} />

                    <BadgeWithMeta
                      badge={
                        <PaymentStatusBadge status={project.paymentStatus} />
                      }
                      meta={`${formatCurrencyFromCents(project.paidCents)} paid`}
                    />

                    <div className="whitespace-nowrap text-right text-slate-600">
                      {formatShortDate(project.deadline)}
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        className="h-9 px-3 hover:border-slate-400 hover:bg-slate-100"
                        asChild
                      >
                        <Link href={`/admin/projects/${project.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 px-3 hover:border-slate-400 hover:bg-slate-100"
                        asChild
                      >
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <ProjectRowActions project={project} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
