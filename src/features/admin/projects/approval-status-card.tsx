import { CheckCircle2 } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminProjectApproval } from "@/features/admin/projects/types";
import { formatShortDate } from "@/lib/format";

type ApprovalStatusCardProps = {
  approval: AdminProjectApproval;
};

export function ApprovalStatusCard({ approval }: ApprovalStatusCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Approval status</CardTitle>
        <p className="text-sm text-slate-500">
          Track whether the client approved the latest delivery step.
        </p>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
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
                        : "blue"
                  }
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {approval.note}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Requested {formatShortDate(approval.requestedAt)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}