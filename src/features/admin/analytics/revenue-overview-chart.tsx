"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsPageData } from "@/features/admin/analytics/types";
import { formatCurrencyFromCents } from "@/lib/format";

export function RevenueOverviewChart({
  data,
}: {
  data: AnalyticsPageData["revenueByCurrency"];
}) {
  const [currency, setCurrency] = useState(data[0]?.currency ?? "");
  const series = data.find((item) => item.currency === currency) ?? data[0];
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Revenue overview</CardTitle>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Invoice creation and fully paid revenue over the selected period.
          </p>
        </div>
        {data.length > 1 ? (
          <select
            aria-label="Revenue chart currency"
            value={series?.currency ?? ""}
            onChange={(event) => setCurrency(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-slate-950/20"
          >
            <option value="">Select currency</option>
            {data.map((item) => (
              <option key={item.currency} value={item.currency}>
                {item.currency}
              </option>
            ))}
          </select>
        ) : null}
      </CardHeader>
      <CardContent>
        {!series ? (
          <EmptyChart message="No non-void financial records are available for this period." />
        ) : (
          <div
            className="h-72 min-w-0"
            role="img"
            aria-label={`Invoiced and paid revenue chart in ${series.currency}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series.buckets}
                margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value: number) =>
                    formatCurrencyFromCents(value, series.currency)
                  }
                  width={74}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) =>
                    formatCurrencyFromCents(Number(value), series.currency)
                  }
                  contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar
                  dataKey="invoicedCents"
                  name="Invoiced"
                  fill="#334155"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="paidCents"
                  name="Paid"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-72 place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm leading-6 text-slate-500">
      {message}
    </div>
  );
}
