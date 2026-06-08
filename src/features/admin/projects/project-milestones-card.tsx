"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  addMilestoneAction,
  markMilestoneCompleteAction,
} from "@/features/admin/projects/actions";
import {
  milestoneFormSchema,
  type MilestoneFormValues,
} from "@/features/admin/projects/project-validation";
import type { AdminProjectMilestone } from "@/features/admin/projects/types";
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

type ProjectMilestonesCardProps = {
  projectId: string;
  milestones: AdminProjectMilestone[];
};

export function ProjectMilestonesCard({
  projectId,
  milestones,
}: ProjectMilestonesCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  function onSubmit(values: MilestoneFormValues) {
    startTransition(async () => {
      const result = await addMilestoneAction(projectId, values);

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      form.reset();
      router.refresh();
    });
  }

  function handleComplete(milestoneId: string) {
    startTransition(async () => {
      await markMilestoneCompleteAction(projectId, milestoneId);
      router.refresh();
    });
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
        <p className="text-sm text-slate-500">
          Keep delivery steps clear, reviewable, and easy to approve.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Flag className="size-4" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">
                        {milestone.title}
                      </p>
                      <StatusBadge
                        label={
                          milestone.status === "completed"
                            ? "Completed"
                            : milestone.status === "waiting_approval"
                              ? "Waiting approval"
                              : milestone.status === "in_progress"
                                ? "In progress"
                                : "Not started"
                        }
                        tone={
                          milestone.status === "completed"
                            ? "green"
                            : milestone.status === "waiting_approval"
                              ? "yellow"
                              : milestone.status === "in_progress"
                                ? "blue"
                                : "slate"
                        }
                      />
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {milestone.description}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Due {formatShortDate(milestone.dueDate)}
                    </p>
                  </div>
                </div>

                {milestone.status !== "completed" ? (
                  <Button
                    variant="outline"
                    className="shrink-0"
                    disabled={isPending}
                    onClick={() => handleComplete(milestone.id)}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Mark complete
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 p-4">
          <p className="mb-4 font-semibold text-slate-950">Add milestone</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root?.message ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {form.formState.errors.root.message}
                </div>
              ) : null}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone title</FormLabel>
                    <FormControl>
                      <Input placeholder="Backend API integration" {...field} />
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
                          placeholder="Explain what this milestone includes."
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
                  "Add milestone"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}