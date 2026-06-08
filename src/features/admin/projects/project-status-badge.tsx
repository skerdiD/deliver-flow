import { StatusBadge } from "@/components/shared/status-badge";
import type { AdminProjectStatus } from "@/features/admin/projects/types";

type ProjectStatusBadgeProps = {
  status: AdminProjectStatus;
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const labels: Record<AdminProjectStatus, string> = {
    active: "Active",
    in_progress: "In progress",
    waiting_feedback: "Waiting feedback",
    completed: "Completed",
    archived: "Archived",
  };

  const tones: Record<
    AdminProjectStatus,
    "blue" | "green" | "yellow" | "slate"
  > = {
    active: "blue",
    in_progress: "blue",
    waiting_feedback: "yellow",
    completed: "green",
    archived: "slate",
  };

  return <StatusBadge label={labels[status]} tone={tones[status]} />;
}