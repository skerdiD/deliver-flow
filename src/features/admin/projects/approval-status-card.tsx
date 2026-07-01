"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requestProjectApprovalAction } from "@/features/admin/projects/actions";
import { ApprovalRecordActions } from "@/features/admin/operations/record-actions";
import { FormStatus } from "@/components/shared/form-status";
import { BadgeWithMeta, StackedCell } from "@/components/shared/record-cell";
import type {
  AdminProjectApproval,
  AdminProjectMilestone,
} from "@/features/admin/projects/types";
import { formatRelativeTime, formatShortDate } from "@/lib/format";

type ApprovalStatusCardProps = {
  projectId: string;
  milestones: AdminProjectMilestone[];
  approvals: AdminProjectApproval[];
};

export function ApprovalStatusCard({
  projectId,
  milestones,
  approvals,
}: ApprovalStatusCardProps) {
  const pendingCount = approvals.filter(
    (approval) => approval.status === "pending",
  ).length;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestoneId, setMilestoneId] = useState("none");
  const [resultMessage, setResultMessage] = useState("");
  const [resultIsSuccess, setResultIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submitApprovalRequest() {
    startTransition(async () => {
      setResultMessage("");
      const result = await requestProjectApprovalAction(projectId, {
        title,
        description,
        milestoneId: milestoneId === "none" ? undefined : milestoneId,
      });

      setResultIsSuccess(result.success);
      setResultMessage(result.message);

      if (result.success) {
        setTitle("");
        setDescription("");
        setMilestoneId("none");
      }
    });
  }

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Approvals</CardTitle>
            <p className="text-sm text-slate-500">
              Track review requests, client replies, and related milestones.
            </p>
          </div>

          <StatusBadge
            label={`${pendingCount} pending`}
            tone={pendingCount > 0 ? "purple" : "slate"}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="approval-title">Approval title</Label>
                <Input
                  id="approval-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Final deliverable review"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label>Milestone</Label>
                <Select
                  value={milestoneId}
                  onValueChange={setMilestoneId}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General approval</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval-description">Request note</Label>
              <Textarea
                id="approval-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ask the client to review the final deliverable and approve or request changes."
                className="min-h-24 bg-white"
                disabled={isPending}
              />
            </div>

            <FormStatus message={resultMessage} success={resultIsSuccess} />

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={submitApprovalRequest}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Requesting approval...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Request approval
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {approvals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <CheckCircle2 className="mx-auto size-6 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-950">
              No approvals requested yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Review requests will show here when work is sent to the client.
            </p>
          </div>
        ) : (
          approvals.map((approval) => (
            <ApprovalRow key={approval.id} approval={approval} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ApprovalRow({ approval }: { approval: AdminProjectApproval }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <CheckCircle2 className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="break-words font-semibold text-slate-950">
              {approval.title}
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <BadgeWithMeta
                badge={
                  <StatusBadge
                    label={
                      approval.status === "approved"
                        ? "Approved"
                        : approval.status === "changes_requested"
                          ? "Changes requested"
                          : approval.status === "cancelled"
                            ? "Cancelled"
                            : "Pending"
                    }
                    tone={
                      approval.status === "approved"
                        ? "green"
                        : approval.status === "changes_requested"
                          ? "yellow"
                          : approval.status === "cancelled"
                            ? "slate"
                            : "purple"
                    }
                  />
                }
              />
              <ApprovalRecordActions approvalId={approval.id} />
            </div>
          </div>

          {approval.milestoneTitle ? (
            <p className="mt-2 text-xs font-medium text-slate-500">
              Milestone: {approval.milestoneTitle}
            </p>
          ) : null}

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {approval.note}
          </p>

          {approval.responseNote ? (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Client response
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {approval.responseNote}
              </p>
            </div>
          ) : null}

          <StackedCell className="mt-3 flex-row flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>Requested {formatShortDate(approval.requestedAt)}</span>
            {approval.respondedAt ? (
              <span>Responded {formatShortDate(approval.respondedAt)}</span>
            ) : null}
            <span>
              {approval.viewedAt
                ? `Viewed ${formatRelativeTime(approval.viewedAt)}`
                : "Not viewed yet"}
            </span>
          </StackedCell>
        </div>
      </div>
    </div>
  );
}
