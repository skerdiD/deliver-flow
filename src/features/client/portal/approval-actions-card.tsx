"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock3, Loader2, RotateCcw } from "lucide-react";
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
  projectId: string;
  approvals: ClientPortalApproval[];
};

export function ApprovalActionsCard({
  projectId,
  approvals,
}: ApprovalActionsCardProps) {
  const pendingCount = approvals.filter(
    (approval) => approval.status === "pending",
  ).length;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Milestone reviews</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Review each milestone, approve it, or ask for changes with a
              clear note.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <Clock3 className="size-4 text-slate-500" />
            {pendingCount} pending
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {approvals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center">
            <p className="font-semibold text-slate-950">
              No approvals requested yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
              You will see milestone reviews here when work is ready for your
              sign-off.
            </p>
          </div>
        ) : (
          approvals.map((approval) => (
            <ApprovalRequestItem
              key={approval.id}
              projectId={projectId}
              approval={approval}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ApprovalRequestItem({
  projectId,
  approval,
}: {
  projectId: string;
  approval: ClientPortalApproval;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isWaitingForResponse = approval.status === "pending";
  const form = useForm<ClientApprovalResponseValues>({
    resolver: zodResolver(clientApprovalResponseSchema),
    defaultValues: {
      responseNote: approval.responseNote ?? "",
    },
  });

  function handleApprove(values: ClientApprovalResponseValues) {
    startTransition(async () => {
      const result = await approveMilestoneAction(
        projectId,
        approval.id,
        values,
      );

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      router.refresh();
    });
  }

  function handleRequestChanges(values: ClientApprovalResponseValues) {
    startTransition(async () => {
      const result = await requestChangesAction(
        projectId,
        approval.id,
        values,
      );

      if (!result.success) {
        form.setError("root", { message: result.message });
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ClientApprovalStatusBadge status={approval.status} />
            {approval.milestoneName ? (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {approval.milestoneName}
              </span>
            ) : null}
          </div>

          <p className="mt-3 font-semibold text-slate-950">
            {approval.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {approval.description}
          </p>
        </div>

        <div className="text-left text-xs leading-5 text-slate-500 sm:min-w-32 sm:text-right">
          <p>Requested {formatShortDate(approval.requestedAt)}</p>
          {approval.respondedAt ? (
            <p>Responded {formatShortDate(approval.respondedAt)}</p>
          ) : null}
        </div>
      </div>

      {!isWaitingForResponse ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Your response
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {approval.responseNote ?? "No note was added."}
          </p>
        </div>
      ) : (
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
                  <FormLabel>Response note</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-28"
                      placeholder="Add a short note. This is required if you request changes."
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
                disabled={isPending}
                onClick={form.handleSubmit(handleApprove)}
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
                Approve
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
      )}
    </div>
  );
}
