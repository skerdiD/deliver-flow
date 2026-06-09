import { Flag } from "lucide-react";

import { ClientMilestoneStatusBadge } from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalMilestone } from "@/features/client/portal/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate } from "@/lib/format";

type ClientTimelineCardProps = {
  milestones: ClientPortalMilestone[];
};

export function ClientTimelineCard({ milestones }: ClientTimelineCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Progress timeline</CardTitle>
        <p className="text-sm text-slate-500">
          Clear delivery steps, current status, and what comes next.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1;

          return (
            <div key={milestone.id} className="relative flex gap-4">
              {!isLast ? (
                <div className="absolute left-5 top-11 h-full w-px bg-slate-200" />
              ) : null}

              <div className="relative z-10 grid size-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Flag className="size-4" />
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-950">
                    {milestone.title}
                  </p>
                  <ClientMilestoneStatusBadge status={milestone.status} />
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {milestone.description}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  Due {formatShortDate(milestone.dueDate)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}