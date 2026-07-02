"use client";

import { Archive, Loader2, MoreHorizontal, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  BadgeMetaField,
  RecordField,
  RecordHeader,
  RecordList,
  RecordRow,
  RowActions,
} from "@/components/shared/record-list";
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

      <CardContent className="p-0">
        {filteredClients.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState
              title="No clients found"
              description="Try changing the search or status filter. New clients will appear here after you add them."
            />
          </div>
        ) : (
          <RecordList>
            <RecordHeader
              columns={[
                "Client",
                "Status",
                "Projects",
                "Total paid",
                "Activity",
                "Actions",
              ]}
              className="xl:grid-cols-[minmax(220px,2fr)_minmax(82px,0.6fr)_minmax(82px,0.55fr)_minmax(96px,0.65fr)_minmax(124px,1fr)_170px] xl:gap-3"
            />
            {filteredClients.map((client) => (
              <RecordRow
                key={client.id}
                className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(220px,2fr)_minmax(82px,0.6fr)_minmax(82px,0.55fr)_minmax(96px,0.65fr)_minmax(124px,1fr)_170px] xl:items-center xl:gap-3"
              >
                <RecordField
                  label="Client"
                  className="sm:col-span-2 lg:col-span-1"
                  labelClassName="xl:hidden"
                  valueClassName="space-y-1.5"
                >
                  <p className="line-clamp-1 break-words font-medium text-slate-950">
                    {client.name}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {client.email}
                  </p>
                  <p className="line-clamp-1 break-words text-sm text-slate-500">
                    {client.company ?? "Independent client"}
                  </p>
                </RecordField>

                <BadgeMetaField
                  label="Status"
                  labelClassName="xl:hidden"
                  badge={<ClientStatusBadge status={client.status} />}
                />

                <RecordField label="Projects" labelClassName="xl:hidden">
                  <span className="whitespace-nowrap font-medium text-slate-950">
                    {client.activeProjects}{" "}
                    {client.activeProjects === 1 ? "project" : "projects"}
                  </span>
                </RecordField>

                <RecordField label="Total paid" labelClassName="xl:hidden">
                  <span className="whitespace-nowrap font-medium text-slate-950">
                    {formatCurrencyFromCents(client.totalPaidCents)}
                  </span>
                </RecordField>

                <RecordField
                  label="Activity"
                  labelClassName="xl:hidden"
                  valueClassName="space-y-1"
                >
                  <p className="line-clamp-2 break-words text-slate-700">
                    {client.latestActivity}
                  </p>
                  <p className="text-xs text-slate-500">
                    {client.activeProjects}{" "}
                    {client.activeProjects === 1 ? "project" : "projects"}{" "}
                    assigned
                  </p>
                  <p className="text-xs text-slate-500">
                    Created {formatShortDate(client.createdAt)}
                  </p>
                </RecordField>

                <RowActions
                  labelClassName="xl:hidden"
                  className="xl:justify-self-end"
                >
                  <Button
                    variant="outline"
                    className="h-10 px-3 hover:border-slate-400 hover:bg-slate-100"
                    asChild
                  >
                    <Link href={`/admin/clients/${client.id}`}>View</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-3 hover:border-slate-400 hover:bg-slate-100"
                    asChild
                  >
                    <Link href={`/admin/clients/${client.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <ClientRowActions client={client} />
                </RowActions>
              </RecordRow>
            ))}
          </RecordList>
        )}
      </CardContent>
    </Card>
  );
}
