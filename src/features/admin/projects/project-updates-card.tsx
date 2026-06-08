"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { addUpdateAction } from "@/features/admin/projects/actions";
import {
  updateFormSchema,
  type UpdateFormValues,
} from "@/features/admin/projects/project-validation";
import type { AdminProjectUpdate } from "@/features/admin/projects/types";
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

type ProjectUpdatesCardProps = {
  projectId: string;
  updates: AdminProjectUpdate[];
};

export function ProjectUpdatesCard({
  projectId,
  updates,
}: ProjectUpdatesCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  function onSubmit(values: UpdateFormValues) {
    startTransition(async () => {
      const result = await addUpdateAction(projectId, values);

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      form.reset();
      router.refresh();
    });
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Project updates</CardTitle>
        <p className="text-sm text-slate-500">
          Write clear progress notes the client can understand later.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-dashed border-slate-300 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Send className="size-4 text-blue-600" />
            <p className="font-semibold text-slate-950">Add project update</p>
          </div>

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
                    <FormLabel>Update title</FormLabel>
                    <FormControl>
                      <Input placeholder="Backend integration started" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Update message</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-28"
                        placeholder="Share what changed, what is done, and what comes next."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add project update"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="space-y-4">
          {updates.map((update) => (
            <div
              key={update.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-950">{update.title}</p>
                <p className="text-xs text-slate-500">
                  {formatShortDate(update.createdAt)}
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {update.body}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}