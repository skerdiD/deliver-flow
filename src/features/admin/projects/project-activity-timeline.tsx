import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  MessageSquare,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminProjectActivity } from "@/features/admin/projects/types";
import { formatRelativeTime, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProjectActivityTimelineProps = {
  activity: AdminProjectActivity[];
};

function getActivityIcon(type: string) {
  if (type.includes("approval") || type.includes("milestone")) {
    return CheckCircle2;
  }

  if (type.includes("payment")) {
    return CreditCard;
  }

  if (type.includes("file")) {
    return FileText;
  }

  if (type.includes("viewed")) {
    return Eye;
  }

  if (type.includes("update") || type.includes("changes")) {
    return MessageSquare;
  }

  return Clock3;
}

function getActivityIconClass(type: string) {
  if (type.includes("payment")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (type.includes("approval") || type.includes("milestone")) {
    return "bg-amber-50 text-amber-700";
  }

  if (type.includes("viewed")) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function formatActor(activity: AdminProjectActivity) {
  if (activity.actorName) {
    return `${activity.actorName} (${getActorRoleLabel(activity.actorRole)})`;
  }

  return getActorRoleLabel(activity.actorRole);
}

function getActorRoleLabel(role: "owner" | "client" | "system") {
  if (role === "owner") {
    return "Owner";
  }

  if (role === "client") {
    return "Client";
  }

  return "System";
}

export function ProjectActivityTimeline({
  activity,
}: ProjectActivityTimelineProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Activity timeline</CardTitle>
        <p className="text-sm text-slate-500">
          Key project events, approvals, files, payments, and client views.
        </p>
      </CardHeader>

      <CardContent>
        {activity.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="No project activity yet"
            description="Important delivery events will appear here as the project moves forward."
          />
        ) : (
          <div className="space-y-5">
            {activity.map((item, index) => {
              const Icon = getActivityIcon(item.type);
              const isLast = index === activity.length - 1;

              return (
                <div key={item.id} className="relative flex gap-4">
                  {!isLast ? (
                    <div className="absolute left-5 top-11 h-full w-px bg-slate-200" />
                  ) : null}

                  <div
                    className={cn(
                      "relative z-10 grid size-10 shrink-0 place-items-center rounded-lg",
                      getActivityIconClass(item.type),
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-semibold text-slate-950">
                        {item.message}
                      </p>
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatActor(item)} - {formatShortDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
