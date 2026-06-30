"use client";

import { Copy, Loader2, MailPlus } from "lucide-react";
import { useState, useTransition } from "react";

import {
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  inviteClientAction,
  type InviteClientActionResult,
} from "@/features/admin/clients/invite-actions";
import type { AdminClientInvite } from "@/features/admin/clients/invite-data";
import { formatShortDate } from "@/lib/format";

type ClientInvitePanelProps = {
  invites: AdminClientInvite[];
};

type InviteFormState = {
  email: string;
  name: string;
  company: string;
  expiresInDays: string;
};

const initialState: InviteFormState = {
  email: "",
  name: "",
  company: "",
  expiresInDays: "7",
};

export function ClientInvitePanel({ invites }: ClientInvitePanelProps) {
  const [formState, setFormState] = useState(initialState);
  const [result, setResult] = useState<InviteClientActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof InviteFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submitInvite() {
    startTransition(async () => {
      const actionResult = await inviteClientAction({
        ...formState,
        expiresInDays: Number(formState.expiresInDays),
      });

      setResult(actionResult);

      if (actionResult.success) {
        setFormState(initialState);
      }
    });
  }

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle>Invite client access</CardTitle>
        <p className="text-sm text-slate-500">
          Send a secure invite so the client can set their password and access
          their portal.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_140px_auto]">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="client@example.com"
              disabled={isPending}
            />
            {result?.fieldErrors?.email ? (
              <p className="text-sm text-red-600">{result.fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-name">Client name</Label>
            <Input
              id="invite-name"
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Sarah Johnson"
              disabled={isPending}
            />
            {result?.fieldErrors?.name ? (
              <p className="text-sm text-red-600">{result.fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-company">Company</Label>
            <Input
              id="invite-company"
              value={formState.company}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Nova Agency"
              disabled={isPending}
            />
            {result?.fieldErrors?.company ? (
              <p className="text-sm text-red-600">
                {result.fieldErrors.company}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Expires</Label>
            <Select
              value={formState.expiresInDays}
              onValueChange={(value) => updateField("expiresInDays", value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
            {result?.fieldErrors?.expiresInDays ? (
              <p className="text-sm text-red-600">
                {result.fieldErrors.expiresInDays}
              </p>
            ) : null}
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              className="h-10 w-full"
              disabled={isPending}
              onClick={submitInvite}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MailPlus className="size-4" />
              )}
              Invite
            </Button>
          </div>
        </div>

        {result ? (
          <div
            className={
              result.success
                ? "rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
                : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            }
          >
            <p className="font-medium">{result.message}</p>
            {result.invite ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input readOnly value={result.invite.inviteLink} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigator.clipboard.writeText(result.invite!.inviteLink)
                  }
                >
                  <Copy className="size-4" />
                  Copy
                </Button>
              </div>
            ) : null}
            {result.invite?.emailDeliveryError ? (
              <p className="mt-2 text-xs text-blue-800">
                {result.invite.emailDeliveryError}
              </p>
            ) : null}
          </div>
        ) : null}

        {invites.length === 0 ? (
          <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500 lg:hidden">
            No client invites yet.
          </p>
        ) : (
          <MobileRecordList>
            {invites.map((invite) => (
              <MobileRecordCard key={invite.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-all font-medium text-slate-950">
                      {invite.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {formatShortDate(invite.createdAt)}
                    </p>
                  </div>
                  <InviteStatusBadge status={invite.status} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MobileRecordMeta label="Client">
                    <span className="break-words">{invite.clientName}</span>
                  </MobileRecordMeta>
                  <MobileRecordMeta label="Company">
                    <span className="break-words">{invite.companyName}</span>
                  </MobileRecordMeta>
                  <MobileRecordMeta label="Expires" className="sm:col-span-2">
                    {invite.acceptedAt
                      ? `Accepted ${formatShortDate(invite.acceptedAt)}`
                      : formatShortDate(invite.expiresAt)}
                  </MobileRecordMeta>
                </div>
              </MobileRecordCard>
            ))}
          </MobileRecordList>
        )}

        <div className="hidden overflow-hidden rounded-lg border border-slate-200 lg:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Invite</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-slate-500">
                    No client invites yet.
                  </TableCell>
                </TableRow>
              ) : (
                invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950">
                          {invite.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Created {formatShortDate(invite.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-slate-950">{invite.clientName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {invite.companyName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <InviteStatusBadge status={invite.status} />
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {invite.acceptedAt
                        ? `Accepted ${formatShortDate(invite.acceptedAt)}`
                        : formatShortDate(invite.expiresAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function InviteStatusBadge(props: { status: AdminClientInvite["status"] }) {
  if (props.status === "accepted") {
    return (
      <Badge className="border-green-200 bg-green-50 text-green-700">
        Active
      </Badge>
    );
  }

  if (props.status === "expired") {
    return (
      <Badge className="border-slate-200 bg-slate-100 text-slate-600">
        Expired
      </Badge>
    );
  }

  return (
    <Badge className="border-blue-200 bg-blue-50 text-blue-700">Invited</Badge>
  );
}
