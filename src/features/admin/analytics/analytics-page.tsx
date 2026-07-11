import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsMetrics } from "@/features/admin/analytics/analytics-metrics";
import { AnalyticsRangeFilter } from "@/features/admin/analytics/analytics-range-filter";
import { ClientActivityTable } from "@/features/admin/analytics/client-activity-table";
import { DeliveryActivityChart } from "@/features/admin/analytics/delivery-activity-chart";
import { PaymentStatusBreakdown } from "@/features/admin/analytics/payment-status-breakdown";
import { ProjectHealthTable } from "@/features/admin/analytics/project-health-table";
import { RevenueOverviewChart } from "@/features/admin/analytics/revenue-overview-chart";
import type { AnalyticsPageData } from "@/features/admin/analytics/types";

export function AnalyticsPage({ data }: { data: AnalyticsPageData }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Owner workspace"
        title="Analytics"
        description="Understand revenue, approvals, client activity, and project health over time."
      >
        <AnalyticsRangeFilter value={data.range} />
      </PageHeader>
      <AnalyticsMetrics metrics={data.metrics} />
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
        <RevenueOverviewChart data={data.revenueByCurrency} />
        <PaymentStatusBreakdown data={data.paymentStatusByCurrency} />
      </section>
      <DeliveryActivityChart data={data.deliveryBuckets} />
      <ProjectHealthTable projects={data.projectHealth} />
      <ClientActivityTable clients={data.clientActivity} />
    </div>
  );
}
