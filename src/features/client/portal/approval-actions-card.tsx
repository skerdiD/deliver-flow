"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  approveMilestoneAction,
  requestChangesAction,
} from "@/features/client/portal/actions";
import { ClientApprovalStatusBadge } from "@/features/client/portal/client-project-status-badge";
import {
  clientApprovalResponseSchema,
  type ClientApprovalResponseValues,
} from "@/features/client/portal/portal-validation";
import type { ClientPortalApproval } from "@/features/client/portal/types";
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

type ApprovalActionsCardProps = {
  approval: ClientPortalApproval | null;
};

export function ApprovalActionsCard({ approval }: ApprovalActionsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ClientApprovalResponseValues>({
    resolver: zodResolver(clientApprovalResponseSchema),
    defaultValues: {
      responseNote: approval?.responseNote ?? "",
    },
  });

  if (!approval) {
    return (
      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Approval request</CardTitle>
          <p className="text-sm text-slate-500">
            No approval request is waiting right now.
          </p>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            The next approval step will show up here when your freelancer sends
            it for review.
          </p>
        </CardContent>
      </Card>
    );
  }

  function handleApprove(values: ClientApprovalResponseValues) {
    startTransition(async () => {
      const result = await approveMilestoneAction(values);

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      router.refresh();
    });
  }

  function handleRequestChanges(values: ClientApprovalResponseValues) {
    startTransition(async () => {
      const result = await requestChangesAction(values);

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      router.refresh();
    });
  }

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Approval request</CardTitle>
        <p className="text-sm text-slate-500">
          Review this step and choose whether it is ready or needs changes.
        </p>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">{approval.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {approval.description}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Requested {formatShortDate(approval.requestedAt)}
              </p>
            </div>

            <ClientApprovalStatusBadge status={approval.status} />
          </div>
        </div>

        <Form {...form}>
          <form className="mt-5 space-y-4">
            {form.formState.errors.root?.message ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {form.formState.errors.root.message}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="responseNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optional note</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-28"
                      placeholder="Add a short note before approving or requesting changes."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={isPending || approval.status === "approved"}
                onClick={form.handleSubmit(handleApprove)}
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
                Approve Milestone
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={form.handleSubmit(handleRequestChanges)}
              >
                <RotateCcw className="mr-2 size-4" />
                Request changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
