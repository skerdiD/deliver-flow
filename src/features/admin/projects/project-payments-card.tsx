"use client";

import { CreditCard, Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
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
  const [isPending, startTransition] = useTransition();

  function addPayment() {
    startTransition(async () => {
      const result = await addProjectPaymentAction(projectId, {
        amountDollars: Number(amountDollars),
        status,
        dueDate,
        notes,
      });

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
      const result = await updateProjectPaymentStatusAction({
        projectId,
        paymentId,
        status: nextStatus,
      });

      setResultMessage(result.message);
    });
  }

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <p className="text-sm text-slate-500">
          Manual payment tracking for this project. No checkout is connected.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[120px_150px_160px]">
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
                  className="bg-white"
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
                  <SelectTrigger className="bg-white">
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
                  className="bg-white"
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
                className="min-h-20 bg-white"
                disabled={isPending}
              />
            </div>

            {resultMessage ? (
              <p className="text-sm text-slate-600">{resultMessage}</p>
            ) : null}

            <div className="flex justify-end">
              <Button type="button" onClick={addPayment} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add payment
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
                    <p className="mt-2 text-xs text-slate-500">
                      {payment.viewedAt
                        ? `Viewed ${formatRelativeTime(payment.viewedAt)}`
                        : "Not viewed yet"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <StatusBadge
                      label={statusMeta.label}
                      tone={statusMeta.tone}
                    />
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
                      <SelectTrigger className="h-8 w-32 bg-white text-xs">
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
                    <span className="text-xs text-slate-500">
                      Paid {formatNullableDate(payment.paidAt, "not yet")}
                    </span>
                    <PaymentRecordActions
                      paymentId={payment.id}
                      projectId={projectId}
                      status={payment.status}
                    />
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
