"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateProjectProgressAction } from "@/features/admin/projects/actions";
import { ProjectStatusBadge } from "@/features/admin/projects/project-status-badge";
import {
  progressFormSchema,
  type ProgressFormValues,
} from "@/features/admin/projects/project-validation";
import type { AdminProjectStatus } from "@/features/admin/projects/types";
import { Button } from "@/components/ui/button";
import { FormStatus } from "@/components/shared/form-status";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

type ProjectProgressControlProps = {
  projectId: string;
  progress: number;
  status: AdminProjectStatus;
};

type ProjectProgressInputValues = z.input<typeof progressFormSchema>;

export function ProjectProgressControl({
  projectId,
  progress,
  status,
}: ProjectProgressControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState("");
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);

  const form = useForm<ProjectProgressInputValues, unknown, ProgressFormValues>(
    {
      resolver: zodResolver(progressFormSchema),
      defaultValues: {
        progress,
        status,
      } as ProjectProgressInputValues,
    },
  );

  function onSubmit(values: ProgressFormValues) {
    startTransition(async () => {
      setStatusMessage("");
      const result = await updateProjectProgressAction(projectId, values);

      if (!result.success) {
        setStatusIsSuccess(false);
        setStatusMessage(result.message);
        form.setError("root", { message: result.message });
        return;
      }

      setStatusIsSuccess(true);
      setStatusMessage(result.message);
      router.refresh();
    });
  }

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Project status</CardTitle>
        <p className="text-sm text-slate-500">
          Keep progress clear without digging through the full project record.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                Current progress
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {progress}%
              </p>
            </div>
            <ProjectStatusBadge status={status} />
          </div>
          <Progress value={progress} className="mt-4" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormStatus
              message={statusMessage || form.formState.errors.root?.message}
              success={statusIsSuccess && !form.formState.errors.root?.message}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={
                          typeof field.value === "number" ? field.value : ""
                        }
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="waiting_feedback">
                          Waiting feedback
                        </SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving status...
                </>
              ) : (
                "Save status"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
