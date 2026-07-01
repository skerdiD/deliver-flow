import { MessageSquare } from "lucide-react";

import { BadgeWithMeta, StackedCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackRecordActions } from "@/features/admin/operations/record-actions";
import type { AdminProjectFeedback } from "@/features/admin/projects/types";
import { formatShortDate } from "@/lib/format";

type ProjectFeedbackPreviewProps = {
  feedback: AdminProjectFeedback[];
};

export function ProjectFeedbackPreview({
  feedback,
}: ProjectFeedbackPreviewProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Feedback preview</CardTitle>
        <p className="text-sm text-slate-500">
          Recent client notes connected to this project.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {feedback.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <MessageSquare className="mx-auto size-6 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-950">
              No feedback yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Client feedback will appear here after they send notes.
            </p>
          </div>
        ) : (
          feedback.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <StackedCell>
                  <p className="font-semibold text-slate-950">
                    {item.clientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatShortDate(item.createdAt)}
                  </p>
                </StackedCell>

                <div className="flex shrink-0 items-center gap-2">
                  <BadgeWithMeta
                    badge={
                      <StatusBadge
                        label={
                          item.status === "open"
                            ? "Open"
                            : item.status === "reviewed"
                              ? "Reviewed"
                              : "Resolved"
                        }
                        tone={
                          item.status === "open"
                            ? "yellow"
                            : item.status === "reviewed"
                              ? "blue"
                              : "green"
                        }
                      />
                    }
                  />
                  <FeedbackRecordActions
                    feedbackId={item.id}
                    adminResponse={item.adminResponse}
                  />
                </div>
              </div>

              <p className="mt-4 break-words text-sm leading-6 text-slate-600">
                {item.message}
              </p>
              {item.adminResponse ? (
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Response saved
                  </p>
                  <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                    {item.adminResponse}
                  </p>
                </div>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
