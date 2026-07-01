"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { FormStatus } from "@/components/shared/form-status";
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
  const [statusMessage, setStatusMessage] = useState("");
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);

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
      setStatusMessage("");
      const result = await addMilestoneAction(projectId, values);

      if (!result.success) {
        setStatusIsSuccess(false);
        setStatusMessage(result.message);
        form.setError("root", { message: result.message });
        return;
      }

      setStatusIsSuccess(true);
      setStatusMessage(result.message);
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
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
        <p className="text-sm text-slate-500">
          Keep delivery steps clear, reviewable, and easy to approve.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          {milestones.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <Flag className="mx-auto size-6 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-950">
                No milestones yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add the first delivery step so progress is easier to manage.
              </p>
            </div>
          ) : null}

          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <Flag className="size-4" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">
                        {milestone.title}
                      </p>
                      <StatusBadge
                        label={`Step ${milestone.position ?? index + 1}`}
                        tone="slate"
                      />
                      <StatusBadge
                        label={
                          milestone.status === "completed"
                            ? "Completed"
                            : milestone.status === "approved"
                              ? "Approved"
                            : milestone.status === "waiting_approval"
                              ? "Waiting approval"
                              : milestone.status === "in_progress"
                                ? "In progress"
                                : "Not started"
                        }
                        tone={
                          milestone.status === "completed"
                            ? "green"
                            : milestone.status === "approved"
                              ? "green"
                            : milestone.status === "waiting_approval"
                              ? "yellow"
                              : milestone.status === "in_progress"
                                ? "blue"
                                : "slate"
                        }
                      />
                      {milestone.approvalStatus ? (
                        <StatusBadge
                          label={`Approval: ${getApprovalLabel(
                            milestone.approvalStatus,
                          )}`}
                          tone={getApprovalTone(milestone.approvalStatus)}
                        />
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {milestone.description}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Due {formatShortDate(milestone.dueDate)}
                    </p>
                  </div>
                </div>

                {milestone.status !== "completed" &&
                milestone.status !== "approved" ? (
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

        <div className="rounded-lg border border-dashed border-slate-300 p-4">
          <p className="mb-4 font-semibold text-slate-950">Add milestone</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormStatus
                message={statusMessage || form.formState.errors.root?.message}
                success={statusIsSuccess && !form.formState.errors.root?.message}
              />

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
                    Adding milestone...
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

function getApprovalLabel(
  status: NonNullable<AdminProjectMilestone["approvalStatus"]>,
) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "changes_requested") {
    return "Changes requested";
  }

  return "Pending";
}

function getApprovalTone(
  status: NonNullable<AdminProjectMilestone["approvalStatus"]>,
): "green" | "yellow" | "purple" {
  if (status === "approved") {
    return "green";
  }

  if (status === "changes_requested") {
    return "yellow";
  }

  return "purple";
}
