import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminPaymentStatus } from "@/features/admin/projects/types";

type PaymentStatusBadgeProps = {
  status: AdminPaymentStatus;
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const labels: Record<AdminPaymentStatus, string> = {
    paid: "Paid",
    unpaid: "Unpaid",
    partial: "Partial",
    overdue: "Overdue",
  };

  const tones: Record<
    AdminPaymentStatus,
    "blue" | "green" | "yellow" | "red"
  > = {
    paid: "green",
    unpaid: "yellow",
    partial: "blue",
    overdue: "red",
  };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}