"use client";

import { CreditCard, Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { FormStatus } from "@/components/shared/form-status";
import { BadgeWithMeta, StackedCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  addProjectPaymentAction,
  updateProjectPaymentStatusAction,
} from "@/features/admin/projects/actions";
import { PaymentRecordActions } from "@/features/admin/operations/record-actions";
import type {
  AdminPaymentStatus,
  AdminProjectPayment,
} from "@/features/admin/projects/types";
import {
  formatCurrencyFromCents,
  formatRelativeTime,
  formatShortDate,
} from "@/lib/format";

type ProjectPaymentsCardProps = {
  projectId: string;
  payments: AdminProjectPayment[];
};

export function ProjectPaymentsCard({
  projectId,
  payments,
}: ProjectPaymentsCardProps) {
  const [amountDollars, setAmountDollars] = useState("");
  const [status, setStatus] = useState<AdminPaymentStatus>("unpaid");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultIsSuccess, setResultIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function addPayment() {
    startTransition(async () => {
      setResultMessage("");
      const result = await addProjectPaymentAction(projectId, {
        amountDollars: Number(amountDollars),
        status,
        dueDate,
        notes,
      });

      setResultIsSuccess(result.success);
      setResultMessage(result.message);

      if (result.success) {
        setAmountDollars("");
        setStatus("unpaid");
        setDueDate("");
        setNotes("");
      }
    });
  }

  function updatePaymentStatus(
    paymentId: string,
    nextStatus: AdminPaymentStatus,
  ) {
    startTransition(async () => {
      setResultMessage("");
      const result = await updateProjectPaymentStatusAction({
        projectId,
        paymentId,
        status: nextStatus,
      });

      setResultIsSuccess(result.success);
      setResultMessage(result.message);
    });
  }

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <p className="text-sm text-slate-500">
          Track manual invoices and follow-up in one place.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="grid gap-3">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountDollars}
                  onChange={(event) => setAmountDollars(event.target.value)}
                  placeholder="1200"
                  className="w-full bg-white"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as AdminPaymentStatus)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-due-date">Due date</Label>
                <Input
                  id="payment-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full bg-white"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Final delivery invoice"
                className="min-h-24 bg-white"
                disabled={isPending}
              />
            </div>

            <FormStatus message={resultMessage} success={resultIsSuccess} />

            <div className="flex justify-end">
              <Button type="button" onClick={addPayment} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving payment...
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Add payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

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
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <StackedCell className="min-w-0 flex-1 gap-2">
                    <p className="font-semibold text-slate-950">
                      {formatCurrencyFromCents(
                        payment.amountCents,
                        payment.currency,
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      Due {formatNullableDate(payment.dueDate)}
                    </p>
                    <p className="text-sm leading-6 text-slate-600">
                      {payment.notes ?? "No note added."}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.viewedAt
                        ? `Viewed ${formatRelativeTime(payment.viewedAt)}`
                        : "Not viewed yet"}
                    </p>
                  </StackedCell>

                  <div className="flex min-w-0 shrink-0 flex-col items-start gap-2 lg:items-end">
                    <BadgeWithMeta
                      className="lg:items-end"
                      badge={
                        <StatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      }
                      meta={`Paid ${formatNullableDate(payment.paidAt, "not yet")}`}
                    />
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      <Select
                        defaultValue={payment.status}
                        onValueChange={(value) =>
                          updatePaymentStatus(
                            payment.id,
                            value as AdminPaymentStatus,
                          )
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-9 w-full bg-white text-xs sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="void">Void</SelectItem>
                        </SelectContent>
                      </Select>
                      <PaymentRecordActions
                        paymentId={payment.id}
                        projectId={projectId}
                        status={payment.status}
                      />
                    </div>
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
  tone: "blue" | "green" | "yellow" | "red" | "slate";
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

  if (status === "void") {
    return { label: "Void", tone: "slate" };
  }

  return { label: "Unpaid", tone: "yellow" };
}

function formatNullableDate(value: string | null, fallback = "No date set") {
  return value ? formatShortDate(value) : fallback;
}
