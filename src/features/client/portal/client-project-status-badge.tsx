import { StatusBadge } from "@/components/shared/status-badge";
import type {
  ClientApprovalStatus,
  ClientMilestoneStatus,
  ClientPaymentStatus,
  ClientProjectStatus,
  ClientTaskStatus,
} from "@/features/client/portal/types";

export function ClientProjectStatusBadge({
  status,
}: {
  status: ClientProjectStatus;
}) {
  const labels: Record<ClientProjectStatus, string> = {
    active: "Active",
    in_progress: "In progress",
    waiting_feedback: "Waiting feedback",
    completed: "Completed",
  };

  const tones: Record<ClientProjectStatus, "blue" | "green" | "yellow"> = {
    active: "blue",
    in_progress: "blue",
    waiting_feedback: "yellow",
    completed: "green",
  };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}

export function ClientMilestoneStatusBadge({
  status,
}: {
  status: ClientMilestoneStatus;
}) {
  const labels: Record<ClientMilestoneStatus, string> = {
    not_started: "Not started",
    in_progress: "In progress",
    waiting_approval: "Ready for review",
    approved: "Approved",
    completed: "Completed",
  };

  const tones: Record<
    ClientMilestoneStatus,
    "blue" | "green" | "yellow" | "slate"
  > = {
    not_started: "slate",
    in_progress: "blue",
    waiting_approval: "yellow",
    approved: "green",
    completed: "green",
  };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}

export function ClientTaskStatusBadge({
  status,
}: {
  status: ClientTaskStatus;
}) {
  const labels: Record<ClientTaskStatus, string> = {
    todo: "To do",
    in_progress: "In progress",
    blocked: "Blocked",
    completed: "Completed",
  };

  const tones: Record<ClientTaskStatus, "blue" | "green" | "slate" | "yellow"> =
    {
      todo: "slate",
      in_progress: "blue",
      blocked: "yellow",
      completed: "green",
    };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}

export function ClientPaymentStatusBadge({
  status,
}: {
  status: ClientPaymentStatus;
}) {
  const labels: Record<ClientPaymentStatus, string> = {
    paid: "Paid",
    partial: "Partial",
    unpaid: "Unpaid",
    overdue: "Overdue",
    void: "Void",
  };

  const tones: Record<
    ClientPaymentStatus,
    "blue" | "green" | "yellow" | "red" | "slate"
  > = {
    paid: "green",
    partial: "blue",
    unpaid: "yellow",
    overdue: "red",
    void: "slate",
  };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}

export function ClientApprovalStatusBadge({
  status,
}: {
  status: ClientApprovalStatus;
}) {
  const labels: Record<ClientApprovalStatus, string> = {
    pending: "Approval needed",
    approved: "Approved",
    changes_requested: "Changes requested",
    cancelled: "Cancelled",
  };

  const tones: Record<
    ClientApprovalStatus,
    "blue" | "green" | "yellow" | "slate"
  > = {
    pending: "blue",
    approved: "green",
    changes_requested: "yellow",
    cancelled: "slate",
  };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}
