import { FolderKanban } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ProgressCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/admin/dashboard/types";

type ProjectProgressOverviewProps = {
  projects: DashboardProject[];
};

function getProjectStatusLabel(status: ProjectStatus) {
  const labels: Record<ProjectStatus, string> = {
    active: "Active",
    in_progress: "In progress",
    waiting_feedback: "Waiting feedback",
    completed: "Completed",
  };

  return labels[status];
}

function getProjectStatusTone(status: ProjectStatus) {
  const tones: Record<ProjectStatus, "blue" | "green" | "yellow" | "slate"> = {
    active: "blue",
    in_progress: "blue",
    waiting_feedback: "yellow",
    completed: "green",
  };

  return tones[status];
}

export function ProjectProgressOverview({
  projects,
}: ProjectProgressOverviewProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Project progress</CardTitle>
        <p className="text-sm text-slate-500">
          Track completed work, next steps, and anything waiting for approval.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No active projects yet"
            description="Project progress will appear here after delivery work starts."
          />
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <FolderKanban className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">
                      {project.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.client}
                    </p>
                  </div>
                </div>

                <StatusBadge
                  label={getProjectStatusLabel(project.status)}
                  tone={getProjectStatusTone(project.status)}
                />
              </div>

              <ProgressCell
                value={project.progress}
                label={project.currentMilestone}
                className="mt-5 max-w-none"
                labelClassName="line-clamp-1 break-words text-sm text-slate-500"
                valueClassName="font-semibold text-slate-950"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
