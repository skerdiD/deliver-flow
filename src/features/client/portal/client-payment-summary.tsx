import { CreditCard } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { ClientPaymentStatusBadge } from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalProject } from "@/features/client/portal/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientPaymentSummaryProps = {
  project: ClientPortalProject;
};

export function ClientPaymentSummary({ project }: ClientPaymentSummaryProps) {
  const remainingCents = project.totalAmountCents - project.paidAmountCents;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total amount"
          value={formatCurrencyFromCents(project.totalAmountCents)}
        />
        <MetricCard
          title="Paid amount"
          value={formatCurrencyFromCents(project.paidAmountCents)}
        />
        <MetricCard
          title="Remaining amount"
          value={formatCurrencyFromCents(remainingCents)}
        />
      </section>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <p className="text-sm text-slate-500">
            Manual payment tracking for this project.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {project.payments.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              No payment records have been added yet.
            </p>
          ) : (
            project.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <CreditCard className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-950">
                      {payment.label}
                    </p>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      Due {formatShortDate(payment.dueDate)}
                      {payment.paidAt
                        ? ` / Paid ${formatShortDate(payment.paidAt)}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:text-right">
                  <p className="font-semibold text-slate-950">
                    {formatCurrencyFromCents(payment.amountCents)}
                  </p>
                  <ClientPaymentStatusBadge status={payment.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
