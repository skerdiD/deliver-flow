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
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>Delivery activity</CardTitle>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
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
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    borderColor: "hsl(var(--border))",
                    backgroundColor: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
                <Legend
                  wrapperStyle={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                    paddingTop: 12,
                  }}
                />
                <Bar
                  dataKey="feedbackSubmitted"
                  name="Feedback submitted"
                  fill="hsl(var(--chart-2))"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="feedbackResolved"
                  name="Feedback resolved"
                  fill="hsl(var(--chart-3))"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="approvalRequests"
                  name="Approval requests"
                  fill="hsl(var(--chart-4))"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="approvalResponses"
                  name="Approval responses"
                  fill="hsl(var(--chart-1))"
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
