import { CreditCard } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminPaymentStatus,
  AdminProjectPayment,
} from "@/features/admin/projects/types";
import {
  formatCurrencyFromCents,
  formatShortDate,
} from "@/lib/format";

type ProjectPaymentsCardProps = {
  payments: AdminProjectPayment[];
};

export function ProjectPaymentsCard({ payments }: ProjectPaymentsCardProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <p className="text-sm text-slate-500">
          Manual payment tracking for this project. No checkout is connected.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment records yet"
            description="Payment records will show here after they are added."
          />
        ) : (
          payments.map((payment) => {
            const statusMeta = getPaymentStatusMeta(payment.status);

            return (
              <div
                key={payment.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {formatCurrencyFromCents(
                        payment.amountCents,
                        payment.currency,
                      )}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Due {formatNullableDate(payment.dueDate)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {payment.notes ?? "No note added."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <StatusBadge
                      label={statusMeta.label}
                      tone={statusMeta.tone}
                    />
                    <span className="text-xs text-slate-500">
                      Paid {formatNullableDate(payment.paidAt, "not yet")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function getPaymentStatusMeta(status: AdminPaymentStatus): {
  label: string;
  tone: "blue" | "green" | "yellow" | "red";
} {
  if (status === "paid") {
    return { label: "Paid", tone: "green" };
  }

  if (status === "partial") {
    return { label: "Partial", tone: "blue" };
  }

  if (status === "overdue") {
    return { label: "Overdue", tone: "red" };
  }

  return { label: "Unpaid", tone: "yellow" };
}

function formatNullableDate(value: string | null, fallback = "No date set") {
  return value ? formatShortDate(value) : fallback;
}
