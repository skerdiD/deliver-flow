import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardQuickAction } from "@/features/admin/dashboard/types";

type DashboardQuickActionsProps = {
  actions: DashboardQuickAction[];
};

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <p className="text-sm text-slate-500">
          Common actions you will use while managing delivery work.
        </p>
      </CardHeader>

      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 transition group-hover:bg-white group-hover:text-blue-700">
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">
                    {action.title}
                  </h3>
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-slate-400 transition group-hover:text-blue-700" />
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
