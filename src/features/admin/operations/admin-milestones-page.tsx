"use client";

import { Flag, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordActions,
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import { BadgeWithMeta, StackedCell } from "@/components/shared/record-cell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import {
  formatDateLabel,
  formatDateTimeLabel,
  getMilestoneApprovalMeta,
  getMilestoneStatusMeta,
  type AdminMilestonesPageData,
} from "@/features/admin/operations/types";

type AdminMilestonesPageProps = {
  data: AdminMilestonesPageData;
};

export function AdminMilestonesPage({ data }: AdminMilestonesPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const projectOptions = useMemo(
    () =>
      Array.from(
        new Map(
          data.milestones.map((milestone) => [
            milestone.projectId,
            milestone.projectName,
          ] as const),
        ).entries(),
      ).sort((left, right) => left[1].localeCompare(right[1])),
    [data.milestones],
  );

  const filteredMilestones = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return data.milestones.filter((milestone) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        milestone.title.toLowerCase().includes(normalizedSearch) ||
        milestone.projectName.toLowerCase().includes(normalizedSearch) ||
        milestone.clientName.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || milestone.status === statusFilter;
      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "none"
          ? !milestone.approvalStatus
          : milestone.approvalStatus === approvalFilter);
      const matchesProject =
        projectFilter === "all" || milestone.projectId === projectFilter;

      return (
        matchesSearch && matchesStatus && matchesApproval && matchesProject
      );
    });
  }, [
    approvalFilter,
    data.milestones,
    projectFilter,
    search,
    statusFilter,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="All milestones"
          value={String(data.summary.total)}
          description="Client-facing delivery phases across active projects."
        />
        <SummaryCard
          label="Ready for review"
          value={String(data.summary.readyForReview)}
          description="Milestones waiting on sign-off or a client response."
        />
        <SummaryCard
          label="Approved"
          value={String(data.summary.approved)}
          description="Milestones already approved or marked complete."
        />
        <SummaryCard
          label="Changes requested"
          value={String(data.summary.changesRequested)}
          description="Reviews that came back with revision notes."
        />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Milestone filters</CardTitle>
            <p className="text-sm text-slate-500">
              Narrow the roadmap by project, delivery stage, or review state
              when you need a quick pass.
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search milestone, project, or client"
                className="pl-9"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="All stages"
              options={[
                { value: "all", label: "All stages" },
                { value: "not_started", label: "Not started" },
                { value: "in_progress", label: "In progress" },
                { value: "waiting_approval", label: "Ready for review" },
                { value: "approved", label: "Approved" },
                { value: "completed", label: "Completed" },
              ]}
            />

            <FilterSelect
              value={approvalFilter}
              onValueChange={setApprovalFilter}
              placeholder="All review states"
              options={[
                { value: "all", label: "All review states" },
                { value: "pending", label: "Pending review" },
                { value: "approved", label: "Approved" },
                { value: "changes_requested", label: "Changes requested" },
                { value: "cancelled", label: "Cancelled" },
                { value: "none", label: "No approval yet" },
              ]}
            />

            <FilterSelect
              value={projectFilter}
              onValueChange={setProjectFilter}
              placeholder="All projects"
              options={[
                { value: "all", label: "All projects" },
                ...projectOptions.map(([projectId, projectName]) => ({
                  value: projectId,
                  label: projectName,
                })),
              ]}
            />
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Milestones across projects</CardTitle>
          <p className="text-sm text-slate-500">
            Open a project to adjust the roadmap, request approval, or answer a
            client response in context.
          </p>
        </CardHeader>

        <CardContent>
          {filteredMilestones.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="No milestones match these filters."
              description="Add milestones from a project workspace to build the delivery roadmap."
            />
          ) : (
            <>
              <MobileRecordList>
                {filteredMilestones.map((milestone) => {
                  const statusMeta = getMilestoneStatusMeta(milestone.status);
                  const approvalMeta = getMilestoneApprovalMeta(
                    milestone.approvalStatus,
                  );

                  return (
                    <MobileRecordCard key={milestone.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-words font-medium text-slate-950">
                              {milestone.title}
                            </p>
                            {milestone.position ? (
                              <StatusBadge
                                label={`Step ${milestone.position}`}
                                tone="slate"
                              />
                            ) : null}
                          </div>

                          {milestone.description ? (
                            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                              {milestone.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <StatusBadge
                            label={statusMeta.label}
                            tone={statusMeta.tone}
                          />
                          {approvalMeta ? (
                            <StatusBadge
                              label={approvalMeta.label}
                              tone={approvalMeta.tone}
                            />
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <MobileRecordMeta label="Project">
                          <Link
                            href={`${routes.admin.projects}/${milestone.projectId}`}
                            className="break-words font-medium text-slate-950 hover:text-blue-700"
                          >
                            {milestone.projectName}
                          </Link>
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Client">
                          <span className="break-words">
                            {milestone.clientName}
                          </span>
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Due date">
                          {formatDateLabel(milestone.dueDate)}
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Last review">
                          {formatDateTimeLabel(
                            milestone.respondedAt ?? milestone.requestedAt,
                            "No review yet",
                          )}
                        </MobileRecordMeta>
                        <MobileRecordMeta
                          label="Client note"
                          className="sm:col-span-2"
                        >
                          <span className="break-words">
                            {milestone.responseNote ?? "No client note yet."}
                          </span>
                        </MobileRecordMeta>
                      </div>

                      <MobileRecordActions className="justify-end">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                          <Link href={`${routes.admin.projects}/${milestone.projectId}`}>
                            Open project
                          </Link>
                        </Button>
                      </MobileRecordActions>
                    </MobileRecordCard>
                  );
                })}
              </MobileRecordList>

              <div className="hidden lg:block">
                <Table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[33%]" />
                    <col className="w-[22%]" />
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                    <col className="w-[14%]" />
                    <col className="w-[6%]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Project / Client</TableHead>
                      <TableHead>Review state</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead>Client note</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMilestones.map((milestone) => {
                      const statusMeta = getMilestoneStatusMeta(milestone.status);
                      const approvalMeta = getMilestoneApprovalMeta(
                        milestone.approvalStatus,
                      );

                      return (
                        <TableRow key={milestone.id}>
                          <TableCell className="whitespace-normal">
                            <StackedCell>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="line-clamp-1 break-words font-medium text-slate-950">
                                  {milestone.title}
                                </p>
                                {milestone.position ? (
                                  <StatusBadge
                                    label={`Step ${milestone.position}`}
                                    tone="slate"
                                  />
                                ) : null}
                              </div>
                              <p className="line-clamp-2 break-words text-sm text-slate-500">
                                {milestone.description ?? "No milestone note added."}
                              </p>
                            </StackedCell>
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <StackedCell>
                              <Link
                                href={`${routes.admin.projects}/${milestone.projectId}`}
                                className="line-clamp-1 break-words font-medium text-slate-950 hover:text-blue-700"
                              >
                                {milestone.projectName}
                              </Link>
                              <p className="line-clamp-1 break-words text-xs text-slate-500">
                                {milestone.clientName}
                              </p>
                            </StackedCell>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <BadgeWithMeta
                                badge={
                                  <StatusBadge
                                    label={statusMeta.label}
                                    tone={statusMeta.tone}
                                  />
                                }
                              />
                              {approvalMeta ? (
                                <BadgeWithMeta
                                  badge={
                                    <StatusBadge
                                      label={approvalMeta.label}
                                      tone={approvalMeta.tone}
                                    />
                                  }
                                  meta={formatDateTimeLabel(
                                    milestone.respondedAt ??
                                      milestone.requestedAt,
                                    "No review yet",
                                  )}
                                />
                              ) : (
                                <p className="text-xs text-slate-500">
                                  No review yet
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {formatDateLabel(milestone.dueDate)}
                          </TableCell>
                          <TableCell className="whitespace-normal text-sm text-slate-500">
                            <p className="line-clamp-2 break-words">
                              {milestone.responseNote ?? "No client note yet."}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" className="h-9 px-3">
                              <Link href={`${routes.admin.projects}/${milestone.projectId}`}>
                                Open
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard(props: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-slate-500">{props.label}</p>
        <p className="text-2xl font-semibold leading-8 text-slate-950">
          {props.value}
        </p>
        <p className="text-sm text-slate-500">{props.description}</p>
      </CardContent>
    </Card>
  );
}

function FilterSelect(props: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select value={props.value} onValueChange={props.onValueChange}>
      <SelectTrigger className="h-10 w-full rounded-md">
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
