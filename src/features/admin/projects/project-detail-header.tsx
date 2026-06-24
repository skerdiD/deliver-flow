import { CalendarDays, ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/features/admin/projects/payment-status-badge";
import { ProjectStatusBadge } from "@/features/admin/projects/project-status-badge";
import type { AdminProject } from "@/features/admin/projects/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ProjectDetailHeaderProps = {
  project: AdminProject;
};

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.description}
      >
        <Button variant="outline" asChild>
          <Link href={`/admin/projects/${project.id}/edit`}>Edit project</Link>
        </Button>
      </PageHeader>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <ProjectStatusBadge status={project.status} />
                <PaymentStatusBadge status={project.paymentStatus} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500">Client</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {project.client.company}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.client.name}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CalendarDays className="size-4" />
                    Deadline
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatShortDate(project.deadline)}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500">Budget</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatCurrencyFromCents(project.budgetCents)}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500">Paid</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatCurrencyFromCents(project.paidCents)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:min-w-64 sm:w-auto">
              {project.liveDemoUrl ? (
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 size-4" />
                    View demo
                  </a>
                </Button>
              ) : null}

              {project.repositoryUrl ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GitBranch className="mr-2 size-4" />
                    View repository
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
