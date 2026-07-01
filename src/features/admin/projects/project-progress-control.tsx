"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateProjectProgressAction } from "@/features/admin/projects/actions";
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
        <CardTitle>Update project status</CardTitle>
        <p className="text-sm text-slate-500">
          Keep progress and status clear for you and the client.
        </p>
      </CardHeader>

      <CardContent>
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
