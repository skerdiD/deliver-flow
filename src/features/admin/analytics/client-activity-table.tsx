import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalyticsPageData } from "@/features/admin/analytics/types";
import { formatCurrencyFromCents } from "@/lib/format";

function amounts(
  values: AnalyticsPageData["clientActivity"][number]["openInvoices"],
) {
  return values.length
    ? values
        .map((value) =>
          formatCurrencyFromCents(value.amountCents, value.currency),
        )
        .join(" · ")
    : "—";
}

export function ClientActivityTable({
  clients,
}: {
  clients: AnalyticsPageData["clientActivity"];
}) {
  return (
    <section aria-labelledby="client-activity-heading">
      <div className="mb-4">
        <h2
          id="client-activity-heading"
          className="text-base font-semibold text-slate-950"
        >
          Client activity
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Recorded engagement in the selected period. Views are deduplicated
          content-view events, not session traffic.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {clients.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No assigned clients are available for this workspace.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Active projects</TableHead>
                <TableHead className="hidden sm:table-cell">Feedback</TableHead>
                <TableHead className="hidden md:table-cell">
                  Approval responses
                </TableHead>
                <TableHead>Recorded views</TableHead>
                <TableHead className="hidden xl:table-cell">
                  Open invoice value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-semibold text-slate-950">
                    {client.name}
                  </TableCell>
                  <TableCell>{client.activeProjectCount}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {client.feedbackSubmitted}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.approvalResponses}
                  </TableCell>
                  <TableCell>{client.recordedViews}</TableCell>
                  <TableCell className="hidden xl:table-cell text-sm font-medium text-slate-700">
                    {amounts(client.openInvoices)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
