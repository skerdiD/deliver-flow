import { CheckCircle2, CircleDot, ListTodo } from "lucide-react";

import { StackedCell } from "@/components/shared/record-cell";
import { ClientTaskStatusBadge } from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalTask } from "@/features/client/portal/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ClientTasksCardProps = {
  tasks: ClientPortalTask[];
};

export function ClientTasksCard({ tasks }: ClientTasksCardProps) {
  const completed = tasks.filter((task) => task.status === "completed");
  const pending = tasks.filter((task) => task.status !== "completed");
  const nextTask = pending[0];
  const remainingPending = pending.slice(1);

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Work plan</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Active work, completed tasks, and what is coming next.
            </p>
          </div>

          <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="text-sm font-semibold text-slate-950">
              {completed.length}/{tasks.length}
            </p>
            <p className="text-xs text-slate-500">done</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {tasks.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            Project tasks will appear here after the work plan is added.
          </p>
        ) : null}

        {nextTask ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-blue-700 shadow-sm">
                <CircleDot className="size-5" />
              </div>

              <StackedCell className="gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-words font-semibold text-slate-950">
                    {nextTask.title}
                  </p>
                  <ClientTaskStatusBadge status={nextTask.status} />
                </div>
                <p className="break-words text-sm leading-6 text-slate-600">
                  {nextTask.description}
                </p>
              </StackedCell>
            </div>
          </div>
        ) : null}

        {remainingPending.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <ListTodo className="size-4 text-slate-500" />
              Coming next
            </div>

            <div className="space-y-2">
              {remainingPending.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        ) : null}

        {completed.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Recently completed
            </div>

            <div className="space-y-2">
              {completed.slice(0, 3).map((task) => (
                <TaskRow key={task.id} task={task} completed />
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
  completed = false,
}: {
  task: ClientPortalTask;
  completed?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {completed ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <CircleDot className="size-4 text-slate-400" />
          )}
        </div>

        <StackedCell className="gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words text-sm font-semibold text-slate-950">
              {task.title}
            </p>
            {!completed ? <ClientTaskStatusBadge status={task.status} /> : null}
          </div>
          <p className="break-words text-sm leading-6 text-slate-600">
            {task.description}
          </p>
        </StackedCell>
      </div>
    </div>
  );
}
