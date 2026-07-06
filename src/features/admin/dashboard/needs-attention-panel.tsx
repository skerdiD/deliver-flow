import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Flag,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import type {
  AttentionKind,
  DashboardAttentionItem,
} from "@/features/admin/dashboard/types";

type NeedsAttentionPanelProps = {
  items: DashboardAttentionItem[];
};

const iconByKind: Record<AttentionKind, LucideIcon> = {
  payment: CreditCard,
  milestone_review: Flag,
  changes_requested: BadgeCheck,
  feedback: MessageSquare,
  project_setup: CheckCircle2,
};

export function NeedsAttentionPanel({ items }: NeedsAttentionPanelProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
        <p className="text-sm text-slate-500">
          Important client delivery items that may need a decision, reply, or
          follow-up.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center sm:min-h-64 sm:px-8">
            <div className="mb-4 grid size-11 place-items-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-950">
              All clear
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              No urgent milestone reviews, feedback, or payments need attention
              right now.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href={routes.admin.projects}>View projects</Link>
            </Button>
          </div>
        ) : (
          items.map((item) => {
            const Icon = iconByKind[item.kind];

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <StatusBadge
                        label={item.badgeLabel}
                        tone={item.badgeTone}
                      />
                    </div>
                    <p className="mt-1 line-clamp-1 break-words text-sm font-medium text-slate-700">
                      {item.context}
                    </p>
                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-slate-500">
                      {item.reason}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full shrink-0 px-3 sm:w-auto"
                >
                  <Link href={item.href}>{item.actionLabel}</Link>
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
