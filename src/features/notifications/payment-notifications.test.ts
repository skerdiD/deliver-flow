import { vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({
  db: {},
}));
vi.mock("@/features/notifications/notification-service", () => ({
  createNotificationsForRecipients: vi.fn(),
}));

import { describe, expect, it } from "vitest";

import {
  buildPaymentNotificationDedupeKey,
  createPaymentNotificationsFromCandidates,
  getPaymentNotificationKind,
} from "@/features/notifications/payment-notifications";

describe("payment notification helpers", () => {
  it("marks due-soon and overdue payments from due dates", () => {
    const today = new Date("2026-07-10T09:00:00.000Z");

    expect(
      getPaymentNotificationKind({
        dueDate: "2026-07-12",
        dueWindowDays: 3,
        today,
      }),
    ).toBe("payment_due");
    expect(
      getPaymentNotificationKind({
        dueDate: "2026-07-09",
        dueWindowDays: 3,
        today,
      }),
    ).toBe("payment_overdue");
    expect(
      getPaymentNotificationKind({
        dueDate: "2026-07-20",
        dueWindowDays: 3,
        today,
      }),
    ).toBeNull();
  });

  it("builds deterministic dedupe keys for due and overdue retries", () => {
    expect(
      buildPaymentNotificationDedupeKey({
        kind: "payment_due",
        paymentId: "payment-1",
        dueDate: "2026-07-12",
      }),
    ).toBe("payment_due:payment-1:2026-07-12");
    expect(
      buildPaymentNotificationDedupeKey({
        kind: "payment_overdue",
        paymentId: "payment-1",
        dueDate: "2026-07-12",
      }),
    ).toBe("payment_overdue:payment-1:2026-07-12");
  });

  it("plans stable notification delivery for the same payment candidate", async () => {
    const delivered: string[] = [];
    const createNotifications = async (input: {
      dedupeKey?: string | null;
    }) => {
      delivered.push(input.dedupeKey ?? "");
      return {
        insertedCount: 1,
      };
    };
    const candidate = {
      amountCents: 125000,
      currency: "USD",
      dueDate: "2026-07-12",
      paymentId: "payment-1",
      projectId: "project-1",
      projectName: "Launch site",
      recipientProfileIds: ["profile-1"],
      workspaceId: "workspace-1",
    };

    await createPaymentNotificationsFromCandidates([candidate], {
      createNotifications: createNotifications as never,
      dueWindowDays: 3,
      today: new Date("2026-07-10T09:00:00.000Z"),
    });
    await createPaymentNotificationsFromCandidates([candidate], {
      createNotifications: createNotifications as never,
      dueWindowDays: 3,
      today: new Date("2026-07-10T09:00:00.000Z"),
    });

    expect(delivered).toEqual([
      "payment_due:payment-1:2026-07-12",
      "payment_due:payment-1:2026-07-12",
    ]);
  });
});
