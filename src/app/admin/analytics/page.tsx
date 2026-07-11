import type { Metadata } from "next";

import { getAnalyticsRange } from "@/features/admin/analytics/analytics-calculations";
import { getAnalyticsPageData } from "@/features/admin/analytics/analytics-data";
import { AnalyticsPage } from "@/features/admin/analytics/analytics-page";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: requestedRange } = await searchParams;
  const range = getAnalyticsRange(requestedRange);
  const data = await getAnalyticsPageData(range);
  return <AnalyticsPage data={data} />;
}
