"use client";

import { Archive, Loader2, MoreHorizontal, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  BadgeMetaField,
  ProgressField,
  RecordField,
  RecordHeader,
  RecordList,
  RecordRow,
  RowActions,
} from "@/components/shared/record-list";
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

      <CardContent className="p-0">
        {filteredProjects.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState
              title="No projects found"
              description="Try changing the search or status filter. New projects will appear here after you create them."
            />
          </div>
        ) : (
          <RecordList>
            <RecordHeader
              columns={[
                "Project / Client",
                "Status",
                "Progress",
                "Payment",
                "Deadline",
                "Actions",
              ]}
              className="xl:grid-cols-[minmax(220px,2fr)_minmax(86px,0.65fr)_minmax(110px,0.8fr)_minmax(104px,0.75fr)_minmax(76px,0.45fr)_170px] xl:gap-3"
            />
            {filteredProjects.map((project) => (
              <RecordRow
                key={project.id}
                className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(220px,2fr)_minmax(86px,0.65fr)_minmax(110px,0.8fr)_minmax(104px,0.75fr)_minmax(76px,0.45fr)_170px] xl:items-center xl:gap-3"
              >
                <RecordField
                  label="Project"
                  className="sm:col-span-2 lg:col-span-1"
                  labelClassName="xl:hidden"
                  valueClassName="space-y-1.5"
                >
                  <p className="line-clamp-1 break-words font-medium text-slate-950">
                    {project.name}
                  </p>
                  <p className="line-clamp-2 break-words text-sm leading-5 text-slate-500">
                    {project.description}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-700">
                    {project.client.company} - {project.client.name}
                  </p>
                </RecordField>

                <BadgeMetaField
                  label="Status"
                  labelClassName="xl:hidden"
                  badge={<ProjectStatusBadge status={project.status} />}
                />

                <ProgressField
                  value={project.progress}
                  labelClassName="xl:hidden"
                />

                <BadgeMetaField
                  label="Payment"
                  labelClassName="xl:hidden"
                  badge={
                    <PaymentStatusBadge status={project.paymentStatus} />
                  }
                  meta={`${formatCurrencyFromCents(project.paidCents)} paid`}
                />

                <RecordField label="Deadline" labelClassName="xl:hidden">
                  <span className="whitespace-nowrap font-medium text-slate-950">
                    {formatShortDate(project.deadline)}
                  </span>
                </RecordField>

                <RowActions
                  labelClassName="xl:hidden"
                  className="xl:justify-self-end"
                >
                  <Button
                    variant="outline"
                    className="h-10 px-3 hover:border-slate-400 hover:bg-slate-100"
                    asChild
                  >
                    <Link href={`/admin/projects/${project.id}`}>View</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-3 hover:border-slate-400 hover:bg-slate-100"
                    asChild
                  >
                    <Link href={`/admin/projects/${project.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <ProjectRowActions project={project} />
                </RowActions>
              </RecordRow>
            ))}
          </RecordList>
        )}
      </CardContent>
    </Card>
  );
}
