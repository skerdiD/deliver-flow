import { MessageSquare } from "lucide-react";

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
                <div>
                  <p className="font-semibold text-slate-950">
                    {item.clientName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatShortDate(item.createdAt)}
                  </p>
                </div>

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
                <FeedbackRecordActions feedbackId={item.id} />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {item.message}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
