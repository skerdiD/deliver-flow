import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsPageData } from "@/features/admin/analytics/types";
import { formatCurrencyFromCents } from "@/lib/format";

const labels = {
  paid: "Paid",
  unpaid: "Unpaid",
  partial: "Partial",
  overdue: "Overdue",
} as const;

export function PaymentStatusBreakdown({
  data,
}: {
  data: AnalyticsPageData["paymentStatusByCurrency"];
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Payment status</CardTitle>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Current invoice snapshot. Partial invoices show their full value, not
          the amount collected.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No active invoices are available in this workspace.
          </p>
        ) : (
          data.map((group) => (
            <div key={group.currency}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                {group.currency}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {group.statuses.map((item) => (
                  <div
                    key={item.status}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                  >
                    <p className="text-xs font-medium text-slate-500">
                      {labels[item.status]} · {item.invoiceCount}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatCurrencyFromCents(
                        item.amountCents,
                        group.currency,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
