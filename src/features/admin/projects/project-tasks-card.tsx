"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  addTaskAction,
  markTaskCompleteAction,
} from "@/features/admin/projects/actions";
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/features/admin/projects/project-validation";
import type { AdminProjectTask } from "@/features/admin/projects/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatShortDate } from "@/lib/format";

type ProjectTasksCardProps = {
  projectId: string;
  tasks: AdminProjectTask[];
};

export function ProjectTasksCard({ projectId, tasks }: ProjectTasksCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  function onSubmit(values: TaskFormValues) {
    startTransition(async () => {
      const result = await addTaskAction(projectId, values);

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      form.reset();
      router.refresh();
    });
  }

  function handleMarkComplete(taskId: string) {
    startTransition(async () => {
      await markTaskCompleteAction(projectId, taskId);
      router.refresh();
    });
  }

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <p className="text-sm text-slate-500">
          Break the project into clear work items the client can understand.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{task.title}</p>
                    <StatusBadge
                      label={
                        task.status === "completed"
                          ? "Completed"
                          : task.status === "in_progress"
                            ? "In progress"
                            : "To do"
                      }
                      tone={
                        task.status === "completed"
                          ? "green"
                          : task.status === "in_progress"
                            ? "blue"
                            : "slate"
                      }
                    />
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {task.description}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Due {formatShortDate(task.dueDate)}
                  </p>
                </div>

                {task.status !== "completed" ? (
                  <Button
                    variant="outline"
                    className="shrink-0"
                    disabled={isPending}
                    onClick={() => handleMarkComplete(task.id)}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Mark complete
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="size-4 text-blue-600" />
            <p className="font-semibold text-slate-950">Add task</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root?.message ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {form.formState.errors.root.message}
                </div>
              ) : null}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Connect project files table"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-24"
                          placeholder="Explain what needs to be done."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add task"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
