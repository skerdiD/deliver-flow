"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { sendClientFeedbackAction } from "@/features/client/portal/actions";
import {
  clientFeedbackSchema,
  type ClientFeedbackValues,
} from "@/features/client/portal/portal-validation";
import type { ClientPortalFeedback } from "@/features/client/portal/types";
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
import { Textarea } from "@/components/ui/textarea";
import { formatShortDate } from "@/lib/format";

type FeedbackFormProps = {
  feedback: ClientPortalFeedback[];
};

export function FeedbackForm({ feedback }: FeedbackFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClientFeedbackValues>({
    resolver: zodResolver(clientFeedbackSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(values: ClientFeedbackValues) {
    startTransition(async () => {
      const result = await sendClientFeedbackAction(values);

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      form.reset();
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Send feedback</CardTitle>
          <p className="text-sm text-slate-500">
            Share notes tied to this project instead of losing them in messages.
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

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your message</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-44"
                        placeholder="Write what looks good, what feels unclear, or what should be changed."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Send Feedback
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Previous feedback</CardTitle>
          <p className="text-sm text-slate-500">
            Notes you already sent for this project.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {feedback.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              Your feedback history will appear here after you send a note.
            </p>
          ) : (
            feedback.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge
                    label={
                      item.status === "open"
                        ? "Open"
                        : item.status === "reviewed"
                          ? "Reviewed"
                          : "Resolved"
                    }
                    tone={
                      item.status === "open"
                        ? "yellow"
                        : item.status === "reviewed"
                          ? "blue"
                          : "green"
                    }
                  />
                  <span className="text-xs text-slate-500">
                    {formatShortDate(item.createdAt)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.message}
                </p>

                {item.adminResponse ? (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Freelancer response
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.adminResponse}
                    </p>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
