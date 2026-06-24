import { CheckCircle2 } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminProjectApproval } from "@/features/admin/projects/types";
import { formatShortDate } from "@/lib/format";

type ApprovalStatusCardProps = {
  approvals: AdminProjectApproval[];
};

export function ApprovalStatusCard({ approvals }: ApprovalStatusCardProps) {
  const pendingCount = approvals.filter(
    (approval) => approval.status === "pending",
  ).length;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Approvals</CardTitle>
            <p className="text-sm text-slate-500">
              Track client sign-off requests, responses, and related
              milestones.
            </p>
          </div>

          <StatusBadge
            label={`${pendingCount} pending`}
            tone={pendingCount > 0 ? "purple" : "slate"}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {approvals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <CheckCircle2 className="mx-auto size-6 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-950">
              No approvals requested yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Approval requests will appear here when work is sent to the
              client for review.
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-slate-950">{approval.title}</p>

            <StatusBadge
              label={
                approval.status === "approved"
                  ? "Approved"
                  : approval.status === "changes_requested"
                    ? "Changes requested"
                    : "Pending"
              }
              tone={
                approval.status === "approved"
                  ? "green"
                  : approval.status === "changes_requested"
                    ? "yellow"
                    : "purple"
              }
            />
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

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>Requested {formatShortDate(approval.requestedAt)}</span>
            {approval.respondedAt ? (
              <span>Responded {formatShortDate(approval.respondedAt)}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
