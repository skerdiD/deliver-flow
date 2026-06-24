import {
  CalendarDays,
  ExternalLink,
  GitBranch,
  WalletCards,
} from "lucide-react";

import {
  ClientPaymentStatusBadge,
  ClientProjectStatusBadge,
} from "@/features/client/portal/client-project-status-badge";
import type { ClientPortalProject } from "@/features/client/portal/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientProjectOverviewProps = {
  project: ClientPortalProject;
};

export function ClientProjectOverview({ project }: ClientProjectOverviewProps) {
  const remainingCents = project.totalAmountCents - project.paidAmountCents;

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <ClientProjectStatusBadge status={project.status} />
              <ClientPaymentStatusBadge status={project.paymentStatus} />
            </div>

            <h1 className="mt-4 text-2xl font-semibold leading-8 text-slate-950">
              {project.name}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {project.description}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Overall progress
                </span>
                <span className="font-semibold text-slate-950">
                  {project.progress}%
                </span>
              </div>
              <Progress value={project.progress} />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:min-w-64 xl:w-auto">
            {project.liveDemoUrl ? (
              <Button asChild className="w-full xl:w-auto">
                <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  View Live Demo
                </a>
              </Button>
            ) : null}

            {project.repositoryUrl ? (
              <Button asChild variant="outline" className="w-full xl:w-auto">
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

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500">
              Current milestone
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {project.currentMilestone}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <CalendarDays className="size-4" />
              Deadline
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {project.deadline
                ? formatShortDate(project.deadline)
                : "Not scheduled yet"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <WalletCards className="size-4" />
              Paid
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formatCurrencyFromCents(project.paidAmountCents)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500">Remaining</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formatCurrencyFromCents(remainingCents)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
