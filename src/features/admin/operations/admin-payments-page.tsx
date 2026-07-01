import { CreditCard } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordActions,
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
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
            <>
              <MobileRecordList>
                {data.payments.map((payment) => {
                  const statusMeta = getPaymentStatusMeta(payment.status);

                  return (
                    <MobileRecordCard key={payment.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words font-medium text-slate-950">
                            {payment.clientName}
                          </p>
                          <Link
                            href={`${routes.admin.projects}/${payment.projectId}`}
                            className="mt-1 block break-words text-sm font-medium text-slate-700 hover:text-blue-700"
                          >
                            {payment.projectName}
                          </Link>
                        </div>
                        <StatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <MobileRecordMeta label="Amount">
                          <span className="font-medium text-slate-950">
                            {formatPaymentAmount(
                              payment.amountCents,
                              payment.currency,
                            )}
                          </span>
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Due date">
                          {formatDateLabel(payment.dueDate)}
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Paid date">
                          {formatDateTimeLabel(payment.paidAt, "Not paid yet")}
                        </MobileRecordMeta>
                        <MobileRecordMeta
                          label="Notes"
                          className="sm:col-span-2"
                        >
                          <span className="break-words">
                            {payment.notes ?? "No note added."}
                          </span>
                        </MobileRecordMeta>
                      </div>

                      <MobileRecordActions className="justify-end">
                        <PaymentRecordActions
                          paymentId={payment.id}
                          projectId={payment.projectId}
                          status={payment.status}
                        />
                      </MobileRecordActions>
                    </MobileRecordCard>
                  );
                })}
              </MobileRecordList>

              <div className="hidden lg:block">
                <Table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[31%]" />
                    <col className="w-[13%]" />
                    <col className="w-[12%]" />
                    <col className="w-[19%]" />
                    <col className="w-[18%]" />
                    <col className="w-[7%]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client / Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payments.map((payment) => {
                      const statusMeta = getPaymentStatusMeta(payment.status);

                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="whitespace-normal">
                            <p className="line-clamp-1 break-words font-medium text-slate-950">
                              {payment.clientName}
                            </p>
                            <Link
                              href={`${routes.admin.projects}/${payment.projectId}`}
                              className="mt-1 line-clamp-1 break-words text-sm font-medium text-slate-600 hover:text-blue-700"
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
                          <TableCell className="whitespace-normal text-sm">
                            <p>Due {formatDateLabel(payment.dueDate)}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Paid{" "}
                              {formatDateTimeLabel(payment.paidAt, "not yet")}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-normal text-sm text-slate-500">
                            <p className="line-clamp-2 break-words">
                              {payment.notes ?? "No note added."}
                            </p>
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
              </div>
            </>
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
