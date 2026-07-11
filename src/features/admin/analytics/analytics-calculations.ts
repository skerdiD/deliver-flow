import {
  addDays,
  addMonths,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

import {
  analyticsRanges,
  type AnalyticsBucket,
  type AnalyticsRange,
  type CurrencyAmount,
} from "@/features/admin/analytics/types";

export function getAnalyticsRange(value: string | undefined): AnalyticsRange {
  return analyticsRanges.includes(value as AnalyticsRange)
    ? (value as AnalyticsRange)
    : "6m";
}

/** Date ranges are start-inclusive and end-exclusive in UTC-safe Date values. */
export function getAnalyticsPeriod(range: AnalyticsRange, now = new Date()) {
  const end =
    range === "30d" || range === "90d"
      ? startOfDay(addDays(now, 1))
      : startOfMonth(addMonths(now, 1));
  const start =
    range === "30d"
      ? subDays(end, 30)
      : range === "90d"
        ? subDays(end, 90)
        : range === "6m"
          ? subMonths(end, 6)
          : subMonths(end, 12);

  return { start, end };
}

export function createAnalyticsBuckets(
  range: AnalyticsRange,
  now = new Date(),
): AnalyticsBucket[] {
  const { start, end } = getAnalyticsPeriod(range, now);
  const daily = range === "30d" || range === "90d";
  const buckets: AnalyticsBucket[] = [];

  for (
    let cursor = start;
    cursor < end;
    cursor = daily ? addDays(cursor, 1) : addMonths(cursor, 1)
  ) {
    buckets.push({
      key: daily ? format(cursor, "yyyy-MM-dd") : format(cursor, "yyyy-MM"),
      label: daily ? format(cursor, "MMM d") : format(cursor, "MMM"),
      start: cursor.toISOString(),
    });
  }

  return buckets;
}

export function getAnalyticsBucketKey(date: Date, range: AnalyticsRange) {
  return format(
    date,
    range === "30d" || range === "90d" ? "yyyy-MM-dd" : "yyyy-MM",
  );
}

export function isInAnalyticsPeriod(date: Date | null, start: Date, end: Date) {
  return Boolean(date && date >= start && date < end);
}

export function calculateApprovalRate(
  approvals: Array<{ status: "approved" | "changes_requested" }>,
) {
  if (approvals.length === 0) return null;
  return (
    approvals.filter((approval) => approval.status === "approved").length /
    approvals.length
  );
}

export function calculateAverageApprovalResponseHours(
  approvals: Array<{ requestedAt: Date; respondedAt: Date | null }>,
) {
  const durations = approvals
    .filter((approval): approval is { requestedAt: Date; respondedAt: Date } =>
      Boolean(approval.respondedAt),
    )
    .map(
      (approval) =>
        approval.respondedAt.getTime() - approval.requestedAt.getTime(),
    )
    .filter((duration) => duration >= 0);
  if (durations.length === 0) return null;
  return (
    durations.reduce((total, duration) => total + duration, 0) /
    durations.length /
    3_600_000
  );
}

export function groupCurrencyAmounts(
  records: Array<{ currency: string; amountCents: number }>,
): CurrencyAmount[] {
  const totals = new Map<string, number>();
  for (const record of records) {
    totals.set(
      record.currency,
      (totals.get(record.currency) ?? 0) + record.amountCents,
    );
  }
  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, amountCents]) => ({ currency, amountCents }));
}

export function getOpenInvoiceAmounts(
  records: Array<{
    currency: string;
    amountCents: number;
    status: "unpaid" | "partial" | "overdue" | "paid" | "void";
  }>,
) {
  return groupCurrencyAmounts(
    records
      .filter((record) =>
        ["unpaid", "partial", "overdue"].includes(record.status),
      )
      .map((record) => ({
        currency: record.currency,
        amountCents: record.amountCents,
      })),
  );
}

export function deriveProjectHealth(input: {
  status: string;
  deadline: string | null;
  hasOverduePayment: boolean;
  blockedTaskCount: number;
  openFeedbackCount: number;
  pendingApprovalCount: number;
  today?: Date;
}) {
  if (input.status === "completed") return "completed" as const;
  const today = startOfDay(input.today ?? new Date());
  const deadline = input.deadline
    ? new Date(`${input.deadline}T00:00:00`)
    : null;
  if (
    (deadline && deadline < today) ||
    input.hasOverduePayment ||
    input.blockedTaskCount > 0
  )
    return "at_risk" as const;
  if (input.openFeedbackCount > 0 || input.pendingApprovalCount > 0)
    return "needs_attention" as const;
  return "on_track" as const;
}
