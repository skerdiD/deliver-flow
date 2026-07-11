import { describe, expect, it } from "vitest";

import {
  calculateApprovalRate,
  calculateAverageApprovalResponseHours,
  createAnalyticsBuckets,
  deriveProjectHealth,
  getAnalyticsPeriod,
  getAnalyticsRange,
  getOpenInvoiceAmounts,
  groupCurrencyAmounts,
  isInAnalyticsPeriod,
} from "@/features/admin/analytics/analytics-calculations";

describe("analytics calculations", () => {
  const now = new Date("2026-07-11T12:00:00.000Z");

  it("validates ranges and defaults safely", () => {
    expect(getAnalyticsRange("90d")).toBe("90d");
    expect(getAnalyticsRange("invalid")).toBe("6m");
    expect(getAnalyticsRange(undefined)).toBe("6m");
  });

  it("creates continuous daily and monthly buckets", () => {
    expect(createAnalyticsBuckets("30d", now)).toHaveLength(30);
    expect(
      createAnalyticsBuckets("6m", now).map((bucket) => bucket.key),
    ).toEqual([
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
    ]);
  });

  it("uses an inclusive start and exclusive end boundary", () => {
    const { start, end } = getAnalyticsPeriod("30d", now);
    expect(isInAnalyticsPeriod(start, start, end)).toBe(true);
    expect(isInAnalyticsPeriod(end, start, end)).toBe(false);
    expect(isInAnalyticsPeriod(null, start, end)).toBe(false);
  });

  it("calculates approval outcomes and response time without zero-data claims", () => {
    expect(calculateApprovalRate([])).toBeNull();
    expect(
      calculateApprovalRate([
        { status: "approved" },
        { status: "changes_requested" },
      ]),
    ).toBe(0.5);
    expect(calculateAverageApprovalResponseHours([])).toBeNull();
    expect(
      calculateAverageApprovalResponseHours([
        { requestedAt: now, respondedAt: new Date(now.getTime() + 7_200_000) },
      ]),
    ).toBe(2);
  });

  it("keeps currency totals separate", () => {
    expect(
      groupCurrencyAmounts([
        { currency: "USD", amountCents: 100 },
        { currency: "EUR", amountCents: 200 },
        { currency: "USD", amountCents: 50 },
      ]),
    ).toEqual([
      { currency: "EUR", amountCents: 200 },
      { currency: "USD", amountCents: 150 },
    ]);
  });

  it("uses the full partial invoice value without claiming a paid balance", () => {
    expect(
      getOpenInvoiceAmounts([
        { currency: "USD", amountCents: 12_000, status: "partial" },
        { currency: "USD", amountCents: 5_000, status: "paid" },
      ]),
    ).toEqual([{ currency: "USD", amountCents: 12_000 }]);
  });

  it("derives project health deterministically", () => {
    expect(
      deriveProjectHealth({
        status: "completed",
        deadline: null,
        hasOverduePayment: false,
        blockedTaskCount: 1,
        openFeedbackCount: 1,
        pendingApprovalCount: 1,
        today: now,
      }),
    ).toBe("completed");
    expect(
      deriveProjectHealth({
        status: "active",
        deadline: "2026-07-10",
        hasOverduePayment: false,
        blockedTaskCount: 0,
        openFeedbackCount: 0,
        pendingApprovalCount: 0,
        today: now,
      }),
    ).toBe("at_risk");
    expect(
      deriveProjectHealth({
        status: "active",
        deadline: null,
        hasOverduePayment: false,
        blockedTaskCount: 0,
        openFeedbackCount: 1,
        pendingApprovalCount: 0,
        today: now,
      }),
    ).toBe("needs_attention");
    expect(
      deriveProjectHealth({
        status: "active",
        deadline: null,
        hasOverduePayment: false,
        blockedTaskCount: 0,
        openFeedbackCount: 0,
        pendingApprovalCount: 0,
        today: now,
      }),
    ).toBe("on_track");
  });
});
