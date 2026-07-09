"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageSquareMore, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { sendClientFeedbackAction } from "@/features/client/portal/actions";
import {
  clientFeedbackSchema,
  type ClientFeedbackValues,
} from "@/features/client/portal/portal-validation";
import type { ClientPortalFeedback } from "@/features/client/portal/types";
import { EmptyState } from "@/components/shared/empty-state";
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
import { Textarea } from "@/components/ui/textarea";
import { formatShortDate } from "@/lib/format";

type FeedbackFormProps = {
  projectId: string;
  feedback: ClientPortalFeedback[];
};

function getFeedbackStatusLabel(status: ClientPortalFeedback["status"]) {
  if (status === "open") {
    return "Open";
  }

  if (status === "reviewed") {
    return "Reviewed";
  }

  return "Resolved";
}

function getFeedbackStatusTone(status: ClientPortalFeedback["status"]) {
  if (status === "open") {
    return "yellow" as const;
  }

  if (status === "reviewed") {
    return "blue" as const;
  }

  return "green" as const;
}

export function FeedbackForm({ projectId, feedback }: FeedbackFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState("");
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);

  const form = useForm<ClientFeedbackValues>({
    resolver: zodResolver(clientFeedbackSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(values: ClientFeedbackValues) {
    startTransition(async () => {
      setStatusMessage("");
      const result = await sendClientFeedbackAction(projectId, values);

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

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(380px,0.8fr)]">
      <Card className="h-auto self-start rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Send feedback</CardTitle>
          <p className="text-sm text-slate-500">
            Send project notes in one place so nothing gets lost.
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormStatus
                message={statusMessage || form.formState.errors.root?.message}
                success={statusIsSuccess && !form.formState.errors.root?.message}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your message</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[200px] resize-y"
                        placeholder="Write what looks good, what feels unclear, or what should be changed."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending feedback...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Send feedback
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="self-start rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Previous feedback</CardTitle>
          <p className="text-sm text-slate-500">
            Notes you have already sent for this project.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {feedback.length === 0 ? (
            <EmptyState
              icon={MessageSquareMore}
              title="No feedback yet"
              description="Your feedback history will appear here after you send your first note for this project."
            />
          ) : (
            <div className="max-h-[460px] space-y-4 overflow-y-auto pr-2 md:max-h-[560px]">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <StatusBadge
                      label={getFeedbackStatusLabel(item.status)}
                      tone={getFeedbackStatusTone(item.status)}
                    />
                    <span className="shrink-0 text-right text-xs font-medium text-slate-500">
                      {formatShortDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 break-words text-sm leading-6 text-slate-700">
                    {item.message}
                  </p>

                  <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      Reply from your freelancer
                    </p>
                    {item.adminResponse ? (
                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                        {item.adminResponse}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        No owner response yet.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
