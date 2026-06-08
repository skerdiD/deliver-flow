import {
  CheckCircle2,
  CreditCard,
  FileText,
  FolderKanban,
  MessageSquare,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ActivityType,
  DashboardActivity,
} from "@/features/admin/dashboard/types";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ActivityTimelineProps = {
  activities: DashboardActivity[];
};

function getActivityIcon(type: ActivityType) {
  const icons = {
    project: FolderKanban,
    feedback: MessageSquare,
    payment: CreditCard,
    approval: CheckCircle2,
    file: FileText,
  };

  return icons[type];
}

function getActivityIconClass(type: ActivityType) {
  const classes: Record<ActivityType, string> = {
    project: "bg-blue-50 text-blue-600",
    feedback: "bg-purple-50 text-purple-600",
    payment: "bg-emerald-50 text-emerald-600",
    approval: "bg-amber-50 text-amber-600",
    file: "bg-slate-100 text-slate-600",
  };

  return classes[type];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Activity timeline</CardTitle>
        <p className="text-sm text-slate-500">
          Recent changes across projects, files, payments, and approvals.
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="relative flex gap-4">
                {!isLast ? (
                  <div className="absolute left-5 top-11 h-full w-px bg-slate-200" />
                ) : null}

                <div
                  className={cn(
                    "relative z-10 grid size-10 shrink-0 place-items-center rounded-2xl",
                    getActivityIconClass(activity.type),
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold text-slate-950">
                      {activity.title}
                    </p>
                    <span className="text-xs text-slate-500">
                      {formatShortDate(activity.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {activity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}