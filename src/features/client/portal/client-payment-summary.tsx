import { CreditCard } from "lucide-react";

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
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Total amount</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {formatCurrencyFromCents(project.totalAmountCents)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Paid amount</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {formatCurrencyFromCents(project.paidAmountCents)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Remaining amount
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {formatCurrencyFromCents(remainingCents)}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <p className="text-sm text-slate-500">
            Simple payment tracking for this project.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {project.payments.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              Payment details will appear here when a schedule is added.
            </p>
          ) : (
            project.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <CreditCard className="size-4" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-950">
                      {payment.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Due {formatShortDate(payment.dueDate)}
                      {payment.paidAt
                        ? ` / Paid ${formatShortDate(payment.paidAt)}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:text-right">
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
