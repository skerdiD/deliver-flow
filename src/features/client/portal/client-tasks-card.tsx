import { CheckCircle2 } from "lucide-react";

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

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <p className="text-sm text-slate-500">
          Finished work and remaining items are separated for clarity.
        </p>
      </CardHeader>

      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-950">Completed</p>

          <div className="space-y-3">
            {completed.length === 0 ? (
              <p className="text-sm leading-6 text-slate-600">
                Completed work will appear here as tasks are finished.
              </p>
            ) : (
              completed.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                    <StackedCell className="gap-2">
                      <p className="break-words font-medium text-slate-950">
                        {task.title}
                      </p>
                      <p className="break-words text-sm leading-6 text-slate-600">
                        {task.description}
                      </p>
                    </StackedCell>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-950">
            Pending / active
          </p>

          <div className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-sm leading-6 text-slate-600">
                No open tasks right now.
              </p>
            ) : (
              pending.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-words font-medium text-slate-950">
                      {task.title}
                    </p>
                    <ClientTaskStatusBadge status={task.status} />
                  </div>
                  <StackedCell className="mt-2">
                    <p className="break-words text-sm leading-6 text-slate-600">
                      {task.description}
                    </p>
                  </StackedCell>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
