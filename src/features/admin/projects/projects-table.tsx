"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { PaymentStatusBadge } from "@/features/admin/projects/payment-status-badge";
import { ProjectStatusBadge } from "@/features/admin/projects/project-status-badge";
import type {
  AdminProject,
  AdminProjectStatus,
} from "@/features/admin/projects/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ProjectsTableProps = {
  projects: AdminProject[];
};

type StatusFilter = AdminProjectStatus | "all";

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(query) ||
        project.client.company.toLowerCase().includes(query) ||
        project.client.name.toLowerCase().includes(query);

      const matchesStatus = status === "all" || project.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Projects</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Manage delivery progress, milestones, tasks, updates, and approvals.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting_feedback">Waiting feedback</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Try changing the search or status filter. New projects will appear here after you create them."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950">
                          {project.name}
                        </p>
                        <p className="mt-1 max-w-[320px] truncate text-xs text-slate-500">
                          {project.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-slate-900">
                        {project.client.company}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {project.client.name}
                      </p>
                    </TableCell>

                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
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

                    <TableCell>
                      <div className="space-y-1">
                        <PaymentStatusBadge status={project.paymentStatus} />
                        <p className="text-xs text-slate-500">
                          {formatCurrencyFromCents(project.paidCents)} paid
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-right text-slate-600">
                      {formatShortDate(project.deadline)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" className="h-9 px-3" asChild>
                          <Link href={`/admin/projects/${project.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" className="h-9 px-3" asChild>
                          <Link href={`/admin/projects/${project.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
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
