import { FolderKanban } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AdminClientProject,
  AdminClientProjectStatus,
} from "@/features/admin/clients/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientProjectsTableProps = {
  projects: AdminClientProject[];
};

function getProjectStatusLabel(status: AdminClientProjectStatus) {
  const labels: Record<AdminClientProjectStatus, string> = {
    active: "Active",
    in_progress: "In progress",
    waiting_feedback: "Waiting feedback",
    completed: "Completed",
  };

  return labels[status];
}

function getProjectStatusTone(status: AdminClientProjectStatus) {
  const tones: Record<
    AdminClientProjectStatus,
    "blue" | "green" | "yellow" | "slate"
  > = {
    active: "blue",
    in_progress: "blue",
    waiting_feedback: "yellow",
    completed: "green",
  };

  return tones[status];
}

export function ClientProjectsTable({ projects }: ClientProjectsTableProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Assigned projects</CardTitle>
        <p className="text-sm text-slate-500">
          Projects this client can track in their portal.
        </p>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects assigned yet"
            description="Assign a project to this client when delivery work starts."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead className="text-right">Deadline</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950">
                          {project.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {project.nextMilestone}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        label={getProjectStatusLabel(project.status)}
                        tone={getProjectStatusTone(project.status)}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="min-w-32">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-medium text-slate-700">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-slate-950">
                      {formatCurrencyFromCents(project.budgetCents)}
                    </TableCell>

                    <TableCell className="font-medium text-slate-950">
                      {formatCurrencyFromCents(project.paidCents)}
                    </TableCell>

                    <TableCell className="text-right text-slate-600">
                      {formatShortDate(project.deadline)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}