"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateProjectProgressAction } from "@/features/admin/projects/actions";
import {
  progressFormSchema,
  type ProgressFormValues,
} from "@/features/admin/projects/project-validation";
import type { AdminProjectStatus } from "@/features/admin/projects/types";
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

  const form = useForm<
    ProjectProgressInputValues,
    unknown,
    ProgressFormValues
  >({
    resolver: zodResolver(progressFormSchema),
    defaultValues: {
      progress,
      status,
    } as ProjectProgressInputValues,
  });

  function onSubmit(values: ProgressFormValues) {
    startTransition(async () => {
      const result = await updateProjectProgressAction(projectId, values);

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      router.refresh();
    });
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Update project status</CardTitle>
        <p className="text-sm text-slate-500">
          Keep the client-facing status honest and easy to understand.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root?.message ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {form.formState.errors.root.message}
              </div>
            ) : null}

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
                  Saving...
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
