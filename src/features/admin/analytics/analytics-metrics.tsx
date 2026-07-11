import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  ReceiptText,
} from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import type { CurrencyAmount } from "@/features/admin/analytics/types";
import { formatCurrencyFromCents } from "@/lib/format";

function formatCurrencyAmounts(amounts: CurrencyAmount[]) {
  if (amounts.length === 0) return "—";
  return amounts
    .map((item) => formatCurrencyFromCents(item.amountCents, item.currency))
    .join(" · ");
}

function formatDuration(hours: number | null) {
  if (hours === null) return "—";
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${(hours / 24).toFixed(hours >= 72 ? 0 : 1)}d`;
}

export function AnalyticsMetrics({
  metrics,
}: {
  metrics: {
    paidRevenue: CurrencyAmount[];
    openInvoiceValue: CurrencyAmount[];
    approvalRate: number | null;
    averageApprovalResponseHours: number | null;
  };
}) {
  return (
    <section aria-labelledby="analytics-metrics-heading">
      <div className="mb-4">
        <h2
          id="analytics-metrics-heading"
          className="text-base font-semibold text-slate-950"
        >
          Performance metrics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A focused view of cash flow and client decision speed in the selected
          period.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          title="Paid revenue"
          value={formatCurrencyAmounts(metrics.paidRevenue)}
          description="Fully paid invoices by paid date."
          icon={CircleDollarSign}
        />
        <MetricCard
          title="Open invoice value"
          value={formatCurrencyAmounts(metrics.openInvoiceValue)}
          description="Full invoice values for unpaid, partial, and overdue invoices."
          icon={ReceiptText}
        />
        <MetricCard
          title="Approval rate"
          value={
            metrics.approvalRate === null
              ? "—"
              : `${Math.round(metrics.approvalRate * 100)}%`
          }
          description="Approved responses out of all client decisions."
          icon={BadgeCheck}
        />
        <MetricCard
          title="Avg. approval response"
          value={formatDuration(metrics.averageApprovalResponseHours)}
          description="Time from request to a recorded client decision."
          icon={Clock3}
        />
      </div>
    </section>
  );
}
