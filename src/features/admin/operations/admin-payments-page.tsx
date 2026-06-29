import { CreditCard } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import { PaymentRecordActions } from "@/features/admin/operations/record-actions";
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatPaymentAmount,
  getPaymentStatusMeta,
  type AdminPaymentsPageData,
} from "@/features/admin/operations/types";

type AdminPaymentsPageProps = {
  data: AdminPaymentsPageData;
};

export function AdminPaymentsPage({ data }: AdminPaymentsPageProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total paid"
          value={formatPaymentAmount(data.summary.totalPaidCents, "USD")}
          description="Payments already received."
        />
        <SummaryCard
          label="Still open"
          value={formatPaymentAmount(data.summary.outstandingCents, "USD")}
          description="Amounts that still need attention."
        />
        <SummaryCard
          label="Pending payments"
          value={String(data.summary.pendingCount)}
          description="Payments waiting for a normal next step."
        />
        <SummaryCard
          label="Overdue"
          value={String(data.summary.overdueCount)}
          description="Payments that need follow-up today."
        />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <p className="text-sm text-slate-500">
            Track what has been paid and what still needs follow-up.
          </p>
        </CardHeader>

        <CardContent>
          {data.payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments have been added yet"
              description="Payment records will show here with status and due dates."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Paid date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((payment) => {
                  const statusMeta = getPaymentStatusMeta(payment.status);

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-slate-950">
                        {payment.clientName}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${routes.admin.projects}/${payment.projectId}`}
                          className="font-medium text-slate-950 hover:text-blue-700"
                        >
                          {payment.projectName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatPaymentAmount(
                          payment.amountCents,
                          payment.currency,
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </TableCell>
                      <TableCell>{formatDateLabel(payment.dueDate)}</TableCell>
                      <TableCell>
                        {formatDateTimeLabel(payment.paidAt, "Not paid yet")}
                      </TableCell>
                      <TableCell className="max-w-sm whitespace-normal text-sm text-slate-500">
                        {payment.notes ?? "No note added."}
                      </TableCell>
                      <TableCell className="text-right">
                        <PaymentRecordActions
                          paymentId={payment.id}
                          projectId={payment.projectId}
                          status={payment.status}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard(props: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-slate-500">{props.label}</p>
        <p className="text-2xl font-semibold leading-8 text-slate-950">
          {props.value}
        </p>
        <p className="text-sm text-slate-500">{props.description}</p>
      </CardContent>
    </Card>
  );
}
