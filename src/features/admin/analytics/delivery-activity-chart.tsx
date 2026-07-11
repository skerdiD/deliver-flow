"use client";

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
import { EmptyChart } from "@/features/admin/analytics/revenue-overview-chart";

export function DeliveryActivityChart({
  data,
}: {
  data: AnalyticsPageData["deliveryBuckets"];
}) {
  const hasActivity = data.some(
    (item) =>
      item.feedbackSubmitted ||
      item.feedbackResolved ||
      item.approvalRequests ||
      item.approvalResponses,
  );
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Delivery activity</CardTitle>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Client feedback and approval milestones by their recorded timestamps.
        </p>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <EmptyChart message="No feedback or approval activity was recorded in this period." />
        ) : (
          <div
            className="h-72 min-w-0"
            role="img"
            aria-label="Delivery activity chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
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
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar
                  dataKey="feedbackSubmitted"
                  name="Feedback submitted"
                  fill="#475569"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="feedbackResolved"
                  name="Feedback resolved"
                  fill="#16a34a"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="approvalRequests"
                  name="Approval requests"
                  fill="#d97706"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="approvalResponses"
                  name="Approval responses"
                  fill="#2563eb"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
