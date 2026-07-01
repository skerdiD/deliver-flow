"use client";

import { Archive, Loader2, MoreHorizontal, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MobileRecordActions,
  MobileRecordCard,
  MobileRecordList,
  MobileRecordMeta,
} from "@/components/shared/mobile-record";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  archiveClientAction,
  deleteClientAction,
  type ClientActionResult,
} from "@/features/admin/clients/actions";
import { ClientStatusBadge } from "@/features/admin/clients/client-status-badge";
import type {
  AdminClient,
  AdminClientStatus,
} from "@/features/admin/clients/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientsTableProps = {
  clients: AdminClient[];
};

type StatusFilter = AdminClientStatus | "current";

type ClientRowActionsProps = {
  client: AdminClient;
};

function ClientRowActions({ client }: ClientRowActionsProps) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [result, setResult] = useState<ClientActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<ClientActionResult>) {
    setResult(null);

    startTransition(async () => {
      const actionResult = await action();
      setResult(actionResult);

      if (!actionResult.success) {
        return;
      }

      setArchiveOpen(false);
      setDeleteOpen(false);
      setDeleteConfirmation("");
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Client actions"
            className="border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-100"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="left"
          align="start"
          sideOffset={10}
          className="w-56 p-2"
        >
          <DropdownMenuItem
            className="h-11 gap-3 px-3 text-[15px]"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setArchiveOpen(true);
            }}
          >
            <Archive className="size-4" />
            Archive client
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            variant="destructive"
            className="h-11 gap-3 px-3 text-[15px]"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            Delete client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive client?</DialogTitle>
            <DialogDescription>
              This hides {client.company ?? client.name} from current client
              lists while keeping their projects and history intact.
            </DialogDescription>
          </DialogHeader>
          {result?.success === false ? (
            <p className="text-sm text-red-600">{result.message}</p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={isPending}
              onClick={() => runAction(() => archiveClientAction(client.id))}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                "Archive client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete client?</DialogTitle>
            <DialogDescription>
              This will hide this record and preserve history. Type DELETE to
              confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
          {result?.success === false ? (
            <p className="text-sm text-red-600">{result.message}</p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending || deleteConfirmation !== "DELETE"}
              onClick={() => runAction(() => deleteClientAction(client.id))}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("current");

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query);

      const matchesStatus =
        status === "current" ? !client.archivedAt : client.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, status]);

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <CardTitle>Clients</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Manage client accounts, project access, and delivery history.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_160px] lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredClients.length === 0 ? (
          <EmptyState
            title="No clients found"
            description="Try changing the search or status filter. New clients will appear here after you add them."
          />
        ) : (
          <>
            <MobileRecordList>
              {filteredClients.map((client) => (
                <MobileRecordCard key={client.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-slate-950">
                        {client.name}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {client.email}
                      </p>
                    </div>
                    <ClientStatusBadge status={client.status} />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MobileRecordMeta label="Company">
                      <span className="break-words">
                        {client.company ?? "Independent client"}
                      </span>
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Active projects">
                      {client.activeProjects}
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Total paid">
                      <span className="font-medium text-slate-950">
                        {formatCurrencyFromCents(client.totalPaidCents)}
                      </span>
                    </MobileRecordMeta>
                    <MobileRecordMeta label="Created">
                      {formatShortDate(client.createdAt)}
                    </MobileRecordMeta>
                    <MobileRecordMeta
                      label="Latest activity"
                      className="sm:col-span-2"
                    >
                      <span className="break-words">
                        {client.latestActivity}
                      </span>
                    </MobileRecordMeta>
                  </div>

                  <MobileRecordActions>
                    <Button
                      variant="outline"
                      className="h-10 w-full px-4 hover:border-slate-400 hover:bg-slate-100 sm:w-auto"
                      asChild
                    >
                      <Link href={`/admin/clients/${client.id}`}>View</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 w-full px-4 hover:border-slate-400 hover:bg-slate-100 sm:w-auto"
                      asChild
                    >
                      <Link href={`/admin/clients/${client.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <div className="self-start sm:ml-auto">
                      <ClientRowActions client={client} />
                    </div>
                  </MobileRecordActions>
                </MobileRecordCard>
              ))}
            </MobileRecordList>

            <div className="hidden overflow-hidden rounded-lg border border-slate-200 lg:block">
              <Table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[11%]" />
                  <col className="w-[22%]" />
                  <col className="w-[19%]" />
                </colgroup>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Total paid</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="whitespace-normal">
                        <div className="min-w-0">
                          <p className="line-clamp-1 break-words font-medium text-slate-950">
                            {client.name}
                          </p>
                          <p className="mt-1 line-clamp-1 break-all text-xs text-slate-500">
                            {client.email}
                          </p>
                          <p className="mt-1 line-clamp-1 break-words text-xs text-slate-500">
                            {client.company ?? "Independent client"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <ClientStatusBadge status={client.status} />
                      </TableCell>

                      <TableCell className="text-slate-600">
                        {client.activeProjects}
                      </TableCell>

                      <TableCell className="font-medium text-slate-950">
                        {formatCurrencyFromCents(client.totalPaidCents)}
                      </TableCell>

                      <TableCell className="whitespace-normal text-slate-600">
                        <p className="line-clamp-2 break-words">
                          {client.latestActivity}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Created {formatShortDate(client.createdAt)}
                        </p>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            className="h-9 px-3 hover:border-slate-400 hover:bg-slate-100"
                            asChild
                          >
                            <Link href={`/admin/clients/${client.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 px-3 hover:border-slate-400 hover:bg-slate-100"
                            asChild
                          >
                            <Link href={`/admin/clients/${client.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                          <ClientRowActions client={client} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
