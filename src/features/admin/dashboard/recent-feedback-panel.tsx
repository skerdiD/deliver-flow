import { MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DashboardFeedback,
  FeedbackStatus,
} from "@/features/admin/dashboard/types";
import { formatShortDate } from "@/lib/format";

type RecentFeedbackPanelProps = {
  feedback: DashboardFeedback[];
};

function getFeedbackStatusLabel(status: FeedbackStatus) {
  const labels: Record<FeedbackStatus, string> = {
    open: "Open",
    reviewed: "Reviewed",
    resolved: "Resolved",
  };

  return labels[status];
}

function getFeedbackStatusTone(status: FeedbackStatus) {
  const tones: Record<FeedbackStatus, "blue" | "green" | "yellow"> = {
    open: "yellow",
    reviewed: "blue",
    resolved: "green",
  };

  return tones[status];
}

export function RecentFeedbackPanel({ feedback }: RecentFeedbackPanelProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Recent feedback</CardTitle>
        <p className="text-sm text-slate-500">
          Client notes that may need a decision or reply.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {feedback.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No feedback waiting right now"
            description="New client notes will appear here after they are submitted."
          />
        ) : (
          feedback.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <MessageSquare className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {item.client}
                    </p>
                    <p className="text-xs text-slate-500">{item.project}</p>
                  </div>
                </div>

                <StatusBadge
                  label={getFeedbackStatusLabel(item.status)}
                  tone={getFeedbackStatusTone(item.status)}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">
                {item.message}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                {formatShortDate(item.createdAt)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
