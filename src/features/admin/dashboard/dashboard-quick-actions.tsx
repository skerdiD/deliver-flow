import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardQuickAction } from "@/features/admin/dashboard/types";

type DashboardQuickActionsProps = {
  actions: DashboardQuickAction[];
};

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <p className="text-sm text-slate-500">
          Common actions you will use while managing delivery work.
        </p>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <div
              key={action.title}
              className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon className="size-5" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                {action.title}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                {action.description}
              </p>

              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href={action.href}>Open</Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}