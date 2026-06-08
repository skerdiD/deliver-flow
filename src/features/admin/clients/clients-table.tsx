"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
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
import { ClientStatusBadge } from "@/features/admin/clients/client-status-badge";
import type {
  AdminClient,
  AdminClientStatus,
} from "@/features/admin/clients/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientsTableProps = {
  clients: AdminClient[];
};

type StatusFilter = AdminClientStatus | "all";

export function ClientsTable({ clients }: ClientsTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query);

      const matchesStatus = status === "all" || client.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, status]);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Clients</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Manage client accounts, project access, and delivery history.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9 sm:w-72"
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
              <SelectItem value="all">All statuses</SelectItem>
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
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active projects</TableHead>
                  <TableHead>Total paid</TableHead>
                  <TableHead>Latest activity</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950">
                          {client.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {client.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {client.company ?? "Independent client"}
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

                    <TableCell className="max-w-[240px] truncate text-slate-600">
                      {client.latestActivity}
                    </TableCell>

                    <TableCell className="text-right text-slate-600">
                      {formatShortDate(client.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="h-9 px-3" asChild>
                          <Link href={`/admin/clients/${client.id}`}>
                            View Profile
                          </Link>
                        </Button>
                        <Button variant="outline" className="h-9 px-3" asChild>
                          <Link href={`/admin/clients/${client.id}/edit`}>
                            Edit Client
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