import { describe, expect, it } from "vitest";

import { summarizePaymentAmountsByCurrency } from "@/features/admin/operations/types";

describe("payment currency totals", () => {
  it("keeps paid and outstanding amounts separate by currency", () => {
    expect(
      summarizePaymentAmountsByCurrency([
        { amountCents: 12_500, currency: "USD", status: "paid" },
        { amountCents: 8_000, currency: "EUR", status: "paid" },
        { amountCents: 2_500, currency: "usd", status: "unpaid" },
        { amountCents: 500, currency: "EUR", status: "void" },
      ]),
    ).toEqual([
      {
        currency: "EUR",
        totalPaidCents: 8_000,
        outstandingCents: 0,
      },
      {
        currency: "USD",
        totalPaidCents: 12_500,
        outstandingCents: 2_500,
      },
    ]);
  });
});
