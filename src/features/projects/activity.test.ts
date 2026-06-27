import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({
  db: {},
}));

import {
  logProjectActivity,
  recordClientViewEvent,
  shouldLogViewActivity,
  VIEW_ACTIVITY_COOLDOWN_MS,
} from "@/features/projects/activity";

describe("project activity helpers", () => {
  it("decides when client view activity should be logged", () => {
    const now = new Date("2026-06-27T12:00:00.000Z");

    expect(shouldLogViewActivity(null, now)).toBe(true);
    expect(
      shouldLogViewActivity(
        new Date(now.getTime() - VIEW_ACTIVITY_COOLDOWN_MS + 1),
        now,
      ),
    ).toBe(false);
    expect(
      shouldLogViewActivity(
        new Date(now.getTime() - VIEW_ACTIVITY_COOLDOWN_MS),
        now,
      ),
    ).toBe(true);
  });

  it("inserts project activity with normalized optional fields", async () => {
    const createdAt = new Date("2026-06-27T12:00:00.000Z");
    const returning = vi.fn().mockResolvedValue([{ id: "activity-id", createdAt }]);
    const values = vi.fn(() => ({ returning }));
    const insert = vi.fn(() => ({ values }));

    const activity = await logProjectActivity(
      {
        projectId: "11111111-1111-4111-8111-111111111111",
        actorRole: "system",
        actorName: "  ",
        type: "project_created",
        message: "Project created.",
      },
      { insert } as never,
    );

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: null,
        actorName: null,
        actorRole: "system",
        message: "Project created.",
        metadata: null,
        type: "project_created",
      }),
    );
    expect(activity).toEqual({ id: "activity-id", createdAt });
  });

  it("upserts latest client views and logs first important views", async () => {
    const limit = vi.fn().mockResolvedValue([]);
    const where = vi.fn(() => ({ limit }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    const eventOnConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
    const eventValues = vi.fn(() => ({
      onConflictDoUpdate: eventOnConflictDoUpdate,
    }));
    const activityReturning = vi
      .fn()
      .mockResolvedValue([{ id: "activity-id", createdAt: new Date() }]);
    const activityValues = vi.fn(() => ({ returning: activityReturning }));
    const insert = vi
      .fn()
      .mockReturnValueOnce({ values: eventValues })
      .mockReturnValueOnce({ values: activityValues });

    const result = await recordClientViewEvent(
      {
        projectId: "11111111-1111-4111-8111-111111111111",
        clientId: "22222222-2222-4222-8222-222222222222",
        userId: "33333333-3333-4333-8333-333333333333",
        actorName: "Sam Client",
        targetType: "project",
      },
      { select, insert } as never,
    );

    expect(result.loggedActivity).toBe(true);
    expect(eventValues).toHaveBeenCalledWith(
      expect.objectContaining({
        targetId: "11111111-1111-4111-8111-111111111111",
        targetType: "project",
      }),
    );
    expect(eventOnConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.objectContaining({
          userId: "33333333-3333-4333-8333-333333333333",
        }),
      }),
    );
    expect(activityValues).toHaveBeenCalledWith(
      expect.objectContaining({
        actorName: "Sam Client",
        actorRole: "client",
        type: "client_viewed_project",
      }),
    );
  });
});
