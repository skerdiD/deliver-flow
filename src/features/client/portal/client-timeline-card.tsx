import { Flag } from "lucide-react";

import { StackedCell } from "@/components/shared/record-cell";
import {
  ClientApprovalStatusBadge,
  ClientMilestoneStatusBadge,
} from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalMilestone } from "@/features/client/portal/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate } from "@/lib/format";

type ClientTimelineCardProps = {
  milestones: ClientPortalMilestone[];
};

export function ClientTimelineCard({ milestones }: ClientTimelineCardProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Project roadmap</CardTitle>
        <p className="text-sm text-slate-500">
          Follow each delivery phase, see what is ready for review, and track
          the latest client response.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {milestones.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            Milestones will appear here after the project plan is added.
          </p>
        ) : (
          milestones.map((milestone, index) => {
            const isLast = index === milestones.length - 1;

            return (
              <div key={milestone.id} className="relative flex gap-3">
                {!isLast ? (
                  <div className="absolute left-4 top-10 h-full w-px bg-slate-200" />
                ) : null}

                <div className="relative z-10 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <Flag className="size-4" />
                </div>

                <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="break-words text-sm font-semibold text-slate-950">
                        {milestone.title}
                      </p>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Step {index + 1}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <ClientMilestoneStatusBadge status={milestone.status} />
                      {milestone.approvalStatus ? (
                        <ClientApprovalStatusBadge
                          status={milestone.approvalStatus}
                        />
                      ) : null}
                    </div>
                  </div>

                  <StackedCell className="mt-2 gap-1.5">
                    <p className="break-words text-sm leading-6 text-slate-600">
                      {milestone.description}
                    </p>

                    <p className="text-xs text-slate-500">
                      Due {formatShortDate(milestone.dueDate)}
                    </p>

                    {milestone.approvalStatus === "pending" ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs leading-5 text-amber-900">
                        This milestone is ready for your review in the approvals
                        section.
                      </div>
                    ) : null}

                    {milestone.responseNote ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs leading-5 text-slate-600">
                        <span className="font-medium text-slate-700">
                          Latest response:
                        </span>{" "}
                        {milestone.responseNote}
                      </div>
                    ) : null}
                  </StackedCell>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
