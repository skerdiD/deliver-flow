import { MessageCircle } from "lucide-react";

import { StackedCell } from "@/components/shared/record-cell";
import type { ClientPortalUpdate } from "@/features/client/portal/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate } from "@/lib/format";

type ClientUpdatesCardProps = {
  updates: ClientPortalUpdate[];
};

export function ClientUpdatesCard({ updates }: ClientUpdatesCardProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Update history</CardTitle>
        <p className="text-sm text-slate-500">
          Recent progress notes from the freelancer.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            Your latest project updates will appear here.
          </p>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <MessageCircle className="size-4" />
                </div>

                <StackedCell className="gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-slate-950">
                      {update.title}
                    </p>
                    <span className="text-xs text-slate-500">
                      {formatShortDate(update.createdAt)}
                    </span>
                  </div>

                  <p className="break-words text-sm leading-6 text-slate-600">
                    {update.body}
                  </p>
                </StackedCell>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
