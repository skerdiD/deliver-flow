import { CheckCircle2, Clock3, FileText, MessageSquare } from "lucide-react";

import { StackedCell } from "@/components/shared/record-cell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientPortalActivity } from "@/features/client/portal/types";
import { formatRelativeTime } from "@/lib/format";

type ClientActivityCardProps = {
  activity: ClientPortalActivity[];
};

function getActivityIcon(activity: ClientPortalActivity) {
  if (activity.message.toLowerCase().includes("file")) {
    return FileText;
  }

  if (
    activity.message.toLowerCase().includes("approval") ||
    activity.message.toLowerCase().includes("milestone")
  ) {
    return CheckCircle2;
  }

  if (activity.message.toLowerCase().includes("update")) {
    return MessageSquare;
  }

  return Clock3;
}

export function ClientActivityCard({ activity }: ClientActivityCardProps) {
  const visibleActivity = activity.slice(0, 5);

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <p className="text-sm text-slate-500">
          Latest changes across updates, files, approvals, and payments.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {activity.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            Activity will appear here when updates, approvals, files, and
            payments move forward.
          </p>
        ) : (
          visibleActivity.map((item) => {
            const Icon = getActivityIcon(item);

            return (
              <div key={item.id} className="flex gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="size-4" />
                </div>

                <StackedCell>
                  <p className="text-sm font-medium text-slate-950">
                    {item.message}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </StackedCell>
              </div>
            );
          })
        )}

        {activity.length > visibleActivity.length ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Showing the latest {visibleActivity.length} of {activity.length}{" "}
            activity items.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
