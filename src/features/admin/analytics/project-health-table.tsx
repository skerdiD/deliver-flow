import Link from "next/link";

import { BadgeWithMeta, ProgressCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectStatusBadge } from "@/features/admin/projects/project-status-badge";
import type { AnalyticsPageData } from "@/features/admin/analytics/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

const healthTone = {
  at_risk: "red",
  needs_attention: "yellow",
  on_track: "green",
  completed: "slate",
} as const;
const healthLabel = {
  at_risk: "At risk",
  needs_attention: "Needs attention",
  on_track: "On track",
  completed: "Completed",
} as const;
function amounts(
  values: AnalyticsPageData["projectHealth"][number]["openInvoices"],
) {
  return values.length
    ? values
        .map((value) =>
          formatCurrencyFromCents(value.amountCents, value.currency),
        )
        .join(" · ")
    : "—";
}

export function ProjectHealthTable({
  projects,
}: {
  projects: AnalyticsPageData["projectHealth"];
}) {
  return (
    <section aria-labelledby="project-health-heading">
      <div className="mb-4">
        <h2
          id="project-health-heading"
          className="text-base font-semibold text-slate-950"
        >
          Project health
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Current active projects, with risk based on deadline, overdue
          invoices, blocked tasks, feedback, and approvals.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {projects.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No active projects are available. Create a project to start tracking
            delivery health.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="hidden xl:table-cell">Progress</TableHead>
                <TableHead className="hidden lg:table-cell">Signals</TableHead>
                <TableHead className="hidden 2xl:table-cell">
                  Open invoice value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="min-w-44">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-semibold text-slate-950 hover:underline"
                      >
                        {project.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {project.clientName} ·{" "}
                        {project.deadline
                          ? `Due ${formatShortDate(project.deadline)}`
                          : "No deadline"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <BadgeWithMeta
                      badge={
                        <StatusBadge
                          label={healthLabel[project.health]}
                          tone={healthTone[project.health]}
                        />
                      }
                      meta={<ProjectStatusBadge status={project.status} />}
                    />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <ProgressCell value={project.progress} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <p className="text-sm text-slate-700">
                      {project.openFeedbackCount} feedback ·{" "}
                      {project.pendingApprovalCount} approvals
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.blockedTaskCount} blocked tasks
                    </p>
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell text-sm font-medium text-slate-700">
                    {amounts(project.openInvoices)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
