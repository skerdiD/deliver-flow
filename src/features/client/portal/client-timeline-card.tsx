import { Flag } from "lucide-react";

import { StackedCell } from "@/components/shared/record-cell";
import { ClientMilestoneStatusBadge } from "@/features/client/portal/client-project-status-badge";
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
        <CardTitle>Delivery timeline</CardTitle>
        <p className="text-sm text-slate-500">
          Milestones, review points, and planned delivery steps.
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
                    <p className="break-words text-sm font-semibold text-slate-950">
                      {milestone.title}
                    </p>
                    <ClientMilestoneStatusBadge status={milestone.status} />
                  </div>

                  <StackedCell className="mt-2 gap-1.5">
                    <p className="break-words text-sm leading-6 text-slate-600">
                      {milestone.description}
                    </p>

                    <p className="text-xs text-slate-500">
                      Due {formatShortDate(milestone.dueDate)}
                    </p>
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
