import { Building2, Mail, WalletCards } from "lucide-react";

import { ClientStatusBadge } from "@/features/admin/clients/client-status-badge";
import type { AdminClient } from "@/features/admin/clients/types";
import { formatCurrencyFromCents, formatShortDate } from "@/lib/format";

type ClientDetailCardProps = {
  client: AdminClient;
};

export function ClientDetailCard({ client }: ClientDetailCardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Client profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {client.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {client.company ?? "Independent client"}
            </p>
          </div>

          <ClientStatusBadge status={client.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Building2 className="size-4" />
              Company
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {client.company ?? "Not added"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Mail className="size-4" />
              Email
            </div>
            <p className="mt-2 break-all font-semibold text-slate-950">
              {client.email}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <WalletCards className="size-4" />
              Total paid
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {formatCurrencyFromCents(client.totalPaidCents)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Latest activity</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {client.latestActivity}
        </p>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-500">Added</p>
          <p className="mt-2 font-semibold text-slate-950">
            {formatShortDate(client.createdAt)}
          </p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-500">Active projects</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {client.activeProjects}
          </p>
        </div>
      </div>
    </div>
  );
}