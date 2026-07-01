import { BadgeCheck } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordActions,
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import { BadgeWithMeta, StackedCell } from "@/components/shared/record-cell";
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
import { ApprovalRecordActions } from "@/features/admin/operations/record-actions";
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
            <>
              <MobileRecordList>
                {data.approvals.map((approval) => {
                  const statusMeta = getApprovalStatusMeta(approval.status);

                  return (
                    <MobileRecordCard key={approval.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words font-medium text-slate-950">
                            {approval.title}
                          </p>
                          <p className="mt-1 break-words text-sm text-slate-500">
                            {approval.milestoneTitle ??
                              "General approval request"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Requested{" "}
                            {formatDateTimeLabel(approval.requestedAt)}
                          </p>
                        </div>
                        <StatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <MobileRecordMeta label="Project">
                          <Link
                            href={`${routes.admin.projects}/${approval.projectId}`}
                            className="break-words font-medium text-slate-950 hover:text-blue-700"
                          >
                            {approval.projectName}
                          </Link>
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Client">
                          <span className="break-words">
                            {approval.clientName}
                          </span>
                        </MobileRecordMeta>
                        <MobileRecordMeta label="Responded">
                          {formatDateTimeLabel(approval.respondedAt, "Waiting")}
                        </MobileRecordMeta>
                        <MobileRecordMeta
                          label="Response note"
                          className="sm:col-span-2"
                        >
                          <span className="break-words">
                            {approval.responseNote ?? "No response note added."}
                          </span>
                        </MobileRecordMeta>
                      </div>

                      <MobileRecordActions className="justify-end">
                        <ApprovalRecordActions approvalId={approval.id} />
                      </MobileRecordActions>
                    </MobileRecordCard>
                  );
                })}
              </MobileRecordList>

              <div className="hidden lg:block">
                <Table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[33%]" />
                    <col className="w-[23%]" />
                    <col className="w-[15%]" />
                    <col className="w-[21%]" />
                    <col className="w-[8%]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>Project / Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response note</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.approvals.map((approval) => {
                      const statusMeta = getApprovalStatusMeta(approval.status);

                      return (
                        <TableRow key={approval.id}>
                          <TableCell className="whitespace-normal">
                            <StackedCell>
                              <p className="line-clamp-1 break-words font-medium text-slate-950">
                                {approval.title}
                              </p>
                              <p className="line-clamp-1 break-words text-sm text-slate-500">
                                {approval.milestoneTitle ??
                                  "General approval request"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Requested{" "}
                                {formatDateTimeLabel(approval.requestedAt)}
                              </p>
                            </StackedCell>
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <StackedCell>
                              <Link
                                href={`${routes.admin.projects}/${approval.projectId}`}
                                className="line-clamp-1 break-words font-medium text-slate-950 hover:text-blue-700"
                              >
                                {approval.projectName}
                              </Link>
                              <p className="line-clamp-1 break-words text-xs text-slate-500">
                                {approval.clientName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Responded{" "}
                                {formatDateTimeLabel(
                                  approval.respondedAt,
                                  "waiting",
                                )}
                              </p>
                            </StackedCell>
                          </TableCell>
                          <TableCell>
                            <BadgeWithMeta
                              badge={
                                <StatusBadge
                                  label={statusMeta.label}
                                  tone={statusMeta.tone}
                                />
                              }
                            />
                          </TableCell>
                          <TableCell className="whitespace-normal text-sm text-slate-500">
                            <p className="line-clamp-2 break-words">
                              {approval.responseNote ??
                                "No response note added."}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <ApprovalRecordActions approvalId={approval.id} />
                            </div>
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
