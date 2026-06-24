"use client";

import { MessageSquare, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
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
import { updateAdminFeedbackStatusAction } from "@/features/admin/operations/actions";
import {
  formatDateTimeLabel,
  getFeedbackStatusMeta,
  type AdminFeedbackPageData,
} from "@/features/admin/operations/types";

type AdminFeedbackPageProps = {
  data: AdminFeedbackPageData;
};

export function AdminFeedbackPage({ data }: AdminFeedbackPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredFeedback = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return data.feedback.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.clientName.toLowerCase().includes(normalizedSearch) ||
        item.projectName.toLowerCase().includes(normalizedSearch) ||
        item.message.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data.feedback, search, statusFilter]);

  function updateStatus(feedbackId: string, status: "reviewed" | "resolved") {
    startTransition(async () => {
      await updateAdminFeedbackStatusAction({ feedbackId, status });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Unread"
          value={String(data.summary.unread)}
          description="Fresh feedback that still needs a first pass."
        />
        <SummaryCard
          label="Reviewed"
          value={String(data.summary.reviewed)}
          description="Notes you have looked at but not fully closed."
        />
        <SummaryCard
          label="Resolved"
          value={String(data.summary.resolved)}
          description="Feedback already handled and ready to archive mentally."
        />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Feedback filters</CardTitle>
            <p className="text-sm text-slate-500">
              Keep the review queue focused when several clients are active at
              once.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search client, project, or message"
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full rounded-md">
                <SelectValue placeholder="All feedback" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All feedback</SelectItem>
                <SelectItem value="open">Unread</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Client feedback</CardTitle>
          <p className="text-sm text-slate-500">
            Client replies land here so you can review them quickly and keep the
            next revision clear.
          </p>
        </CardHeader>

        <CardContent>
          {filteredFeedback.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No feedback matches these filters."
              description="Client notes will appear here once someone replies through the portal."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => {
                  const statusMeta = getFeedbackStatusMeta(item.status);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-950">
                        {item.clientName}
                      </TableCell>
                      <TableCell>{item.projectName}</TableCell>
                      <TableCell className="max-w-xl whitespace-normal">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-700">
                            {item.message}
                          </p>
                          {item.adminResponse ? (
                            <p className="text-xs text-slate-500">
                              Response saved: {item.adminResponse}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateTimeLabel(item.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.status === "open" ? (
                            <Button
                              variant="outline"
                              disabled={isPending}
                              onClick={() => updateStatus(item.id, "reviewed")}
                            >
                              Mark reviewed
                            </Button>
                          ) : null}

                          {item.status !== "resolved" ? (
                            <Button
                              variant="outline"
                              disabled={isPending}
                              onClick={() => updateStatus(item.id, "resolved")}
                            >
                              Resolve
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
