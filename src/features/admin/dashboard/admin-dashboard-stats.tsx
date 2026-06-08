import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/features/admin/dashboard/types";

type AdminDashboardStatsProps = {
  metrics: DashboardMetric[];
};

export function AdminDashboardStats({ metrics }: AdminDashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.title} className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {metric.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {metric.value}
                  </p>
                </div>

                <div className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="size-5" />
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}