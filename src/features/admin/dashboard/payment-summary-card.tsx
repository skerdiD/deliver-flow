import { CreditCard } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DashboardPayment,
  PaymentStatus,
} from "@/features/admin/dashboard/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type PaymentSummaryCardProps = {
  payments: DashboardPayment[];
};

function getPaymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    paid: "Paid",
    unpaid: "Unpaid",
    partial: "Partial",
    overdue: "Overdue",
  };

  return labels[status];
}

function getPaymentStatusTone(status: PaymentStatus) {
  const tones: Record<
    PaymentStatus,
    "blue" | "green" | "yellow" | "red" | "slate"
  > = {
    paid: "green",
    unpaid: "yellow",
    partial: "blue",
    overdue: "red",
  };

  return tones[status];
}

export function PaymentSummaryCard({ payments }: PaymentSummaryCardProps) {
  const outstandingCents = payments
    .filter((payment) => payment.status !== "paid")
    .reduce((total, payment) => total + payment.amountCents, 0);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Payment summary</CardTitle>
        <p className="text-sm text-slate-500">
          Small, clear payment tracking for active client work.
        </p>
      </CardHeader>

      <CardContent>
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-white text-blue-600">
              <CreditCard className="size-4" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Outstanding amount</p>
              <p className="text-2xl font-semibold text-blue-950">
                {formatCurrencyFromCents(outstandingCents)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Payment records will show up here once a project schedule is added."
            />
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">
                    {payment.project}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {payment.client}
                    {payment.dueDate
                      ? ` / due ${formatShortDate(payment.dueDate)}`
                      : " / no due date set"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-950">
                    {formatCurrencyFromCents(payment.amountCents)}
                  </p>
                  <div className="mt-1">
                    <StatusBadge
                      label={getPaymentStatusLabel(payment.status)}
                      tone={getPaymentStatusTone(payment.status)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
