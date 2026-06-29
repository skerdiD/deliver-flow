"use client";

import { CheckCircle2, ListTodo, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import { markAdminTaskCompleteAction } from "@/features/admin/operations/actions";
import { TaskRecordActions } from "@/features/admin/operations/record-actions";
import {
  formatDateLabel,
  getFileVisibilityMeta,
  getTaskPriorityMeta,
  getTaskStatusMeta,
  type AdminTasksPageData,
} from "@/features/admin/operations/types";

type AdminTasksPageProps = {
  data: AdminTasksPageData;
};

export function AdminTasksPage({ data }: AdminTasksPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const projectOptions = useMemo(
    () =>
      Array.from(
        new Map(
          data.tasks.map((task) => [task.projectId, task.projectName] as const),
        ).entries(),
      ).sort((left, right) => left[1].localeCompare(right[1])),
    [data.tasks],
  );

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return data.tasks.filter((task) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.projectName.toLowerCase().includes(normalizedSearch) ||
        task.clientName.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const matchesProject =
        projectFilter === "all" || task.projectId === projectFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesProject
      );
    });
  }, [data.tasks, priorityFilter, projectFilter, search, statusFilter]);

  function handleMarkComplete(taskId: string, projectId: string) {
    startTransition(async () => {
      await markAdminTaskCompleteAction({ taskId, projectId });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="All tasks"
          value={String(data.summary.total)}
          description="Work items across every active delivery."
        />
        <SummaryCard
          label="Due soon"
          value={String(data.summary.dueSoon)}
          description="Tasks due within the next 7 days."
        />
        <SummaryCard
          label="Blocked"
          value={String(data.summary.blocked)}
          description="Items that need a decision before moving."
        />
        <SummaryCard
          label="Completed"
          value={String(data.summary.completed)}
          description="Tasks already wrapped up."
        />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Task filters</CardTitle>
            <p className="text-sm text-slate-500">
              Narrow the list by status, priority, or project when you need a
              quick pass.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.7fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search task, project, or client"
                className="pl-9"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="All statuses"
              options={[
                { value: "all", label: "All statuses" },
                { value: "todo", label: "To do" },
                { value: "in_progress", label: "In progress" },
                { value: "blocked", label: "Blocked" },
                { value: "completed", label: "Completed" },
              ]}
            />

            <FilterSelect
              value={priorityFilter}
              onValueChange={setPriorityFilter}
              placeholder="All priorities"
              options={[
                { value: "all", label: "All priorities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />

            <FilterSelect
              value={projectFilter}
              onValueChange={setProjectFilter}
              placeholder="All projects"
              options={[
                { value: "all", label: "All projects" },
                ...projectOptions.map(([projectId, projectName]) => ({
                  value: projectId,
                  label: projectName,
                })),
              ]}
            />
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Tasks across projects</CardTitle>
          <p className="text-sm text-slate-500">
            Keep delivery work visible without digging into each project one by
            one.
          </p>
        </CardHeader>

        <CardContent>
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No tasks match these filters."
              description="Try another status or project filter, or add new tasks from a project detail page."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const statusMeta = getTaskStatusMeta(task.status);
                  const priorityMeta = getTaskPriorityMeta(task.priority);
                  const visibilityMeta = getFileVisibilityMeta(
                    task.isVisibleToClient,
                  );

                  return (
                    <TableRow key={task.id}>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-950">
                            {task.title}
                          </p>
                          {task.description ? (
                            <p className="text-sm text-slate-500">
                              {task.description}
                            </p>
                          ) : null}
                          {task.milestoneTitle ? (
                            <p className="text-xs text-slate-500">
                              Milestone: {task.milestoneTitle}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${routes.admin.projects}/${task.projectId}`}
                          className="font-medium text-slate-950 hover:text-blue-700"
                        >
                          {task.projectName}
                        </Link>
                      </TableCell>
                      <TableCell>{task.clientName}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={priorityMeta.label}
                          tone={priorityMeta.tone}
                        />
                      </TableCell>
                      <TableCell>{formatDateLabel(task.dueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={visibilityMeta.label}
                          tone={visibilityMeta.tone}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {task.status === "completed" ? (
                          <span className="text-sm text-slate-500">Done</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon-sm"
                            disabled={isPending}
                            onClick={() =>
                              handleMarkComplete(task.id, task.projectId)
                            }
                            aria-label={`Mark ${task.title} complete`}
                          >
                            <CheckCircle2 className="size-4" />
                          </Button>
                        )}
                        <TaskRecordActions
                          taskId={task.id}
                          projectId={task.projectId}
                          title={task.title}
                          description={task.description}
                          dueDate={task.dueDate}
                          status={task.status}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard(props: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-slate-500">{props.label}</p>
        <p className="text-2xl font-semibold leading-8 text-slate-950">
          {props.value}
        </p>
        <p className="text-sm text-slate-500">{props.description}</p>
      </CardContent>
    </Card>
  );
}

function FilterSelect(props: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select value={props.value} onValueChange={props.onValueChange}>
      <SelectTrigger className="h-10 w-full rounded-md">
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
