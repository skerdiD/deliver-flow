import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getNotificationCronSecret: vi.fn(),
  scanAndCreatePaymentNotifications: vi.fn(),
}));

vi.mock("@/features/notifications/payment-notifications", () => ({
  getNotificationCronSecret: mocks.getNotificationCronSecret,
  scanAndCreatePaymentNotifications: mocks.scanAndCreatePaymentNotifications,
}));

import { GET, POST } from "@/app/api/internal/notifications/payments/route";

describe("payment notification cron route", () => {
  beforeEach(() => {
    mocks.getNotificationCronSecret.mockReset();
    mocks.scanAndCreatePaymentNotifications.mockReset();
  });

  it("rejects requests without the configured cron secret", async () => {
    mocks.getNotificationCronSecret.mockReturnValue("cron-secret");

    const response = await GET(
      new Request("http://localhost/api/internal/notifications/payments", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(404);
    expect(mocks.scanAndCreatePaymentNotifications).not.toHaveBeenCalled();
  });

  it("runs the payment notification scan for authorized cron requests", async () => {
    mocks.getNotificationCronSecret.mockReturnValue("cron-secret");
    mocks.scanAndCreatePaymentNotifications.mockResolvedValue({
      candidateCount: 2,
      dueNotificationsCreated: 1,
      overdueNotificationsCreated: 1,
    });

    const response = await POST(
      new Request("http://localhost/api/internal/notifications/payments", {
        headers: {
          authorization: "Bearer cron-secret",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.scanAndCreatePaymentNotifications).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({
      candidateCount: 2,
      dueNotificationsCreated: 1,
      overdueNotificationsCreated: 1,
    });
  });
});
