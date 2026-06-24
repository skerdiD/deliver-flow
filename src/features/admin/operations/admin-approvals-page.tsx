import { BadgeCheck } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  formatDateTimeLabel,
  getApprovalStatusMeta,
  type AdminApprovalsPageData,
} from "@/features/admin/operations/types";

type AdminApprovalsPageProps = {
  data: AdminApprovalsPageData;
};

export function AdminApprovalsPage({ data }: AdminApprovalsPageProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Pending"
          value={String(data.summary.pending)}
          description="Approval requests still waiting on a client response."
        />
        <SummaryCard
          label="Approved"
          value={String(data.summary.approved)}
          description="Requests that already got a green light."
        />
        <SummaryCard
          label="Changes requested"
          value={String(data.summary.changesRequested)}
          description="Approvals that came back with revisions."
        />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Approval requests</CardTitle>
          <p className="text-sm text-slate-500">
            Pending approvals stay at the top of the queue so you can follow up
            before delivery stalls.
          </p>
        </CardHeader>

        <CardContent>
          {data.approvals.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="No approval requests yet."
              description="When a milestone is sent for review, it will appear here with the client response."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response note</TableHead>
                  <TableHead>Responded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.approvals.map((approval) => {
                  const statusMeta = getApprovalStatusMeta(approval.status);

                  return (
                    <TableRow key={approval.id}>
                      <TableCell className="max-w-sm whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-950">
                            {approval.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {approval.milestoneTitle ??
                              "General approval request"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Requested{" "}
                            {formatDateTimeLabel(approval.requestedAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${routes.admin.projects}/${approval.projectId}`}
                          className="font-medium text-slate-950 hover:text-blue-700"
                        >
                          {approval.projectName}
                        </Link>
                      </TableCell>
                      <TableCell>{approval.clientName}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </TableCell>
                      <TableCell className="max-w-sm whitespace-normal text-sm text-slate-500">
                        {approval.responseNote ?? "No response note added."}
                      </TableCell>
                      <TableCell>
                        {formatDateTimeLabel(approval.respondedAt, "Waiting")}
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
