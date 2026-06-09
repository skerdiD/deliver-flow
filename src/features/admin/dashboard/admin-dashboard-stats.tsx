import { MetricCard } from "@/components/shared/metric-card";
import type { DashboardMetric } from "@/features/admin/dashboard/types";

type AdminDashboardStatsProps = {
  metrics: DashboardMetric[];
};

export function AdminDashboardStats({ metrics }: AdminDashboardStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
        />
      ))}
    </section>
  );
}
