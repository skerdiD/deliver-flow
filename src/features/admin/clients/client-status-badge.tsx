import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminClientStatus } from "@/features/admin/clients/types";

type ClientStatusBadgeProps = {
  status: AdminClientStatus;
};

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const labels: Record<AdminClientStatus, string> = {
    active: "Active",
    paused: "Paused",
    archived: "Archived",
  };

  const tones: Record<AdminClientStatus, "green" | "yellow" | "slate"> = {
    active: "green",
    paused: "yellow",
    archived: "slate",
  };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}