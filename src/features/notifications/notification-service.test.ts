import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({
  db: {},
}));

const mocks = vi.hoisted(() => ({
  requireCurrentProfile: vi.fn(),
}));

vi.mock("@/lib/supabase/auth", () => ({
  requireCurrentProfile: mocks.requireCurrentProfile,
}));

import {
  countUnreadNotificationsForCurrentUser,
  listNotificationsForCurrentUser,
  markAllNotificationsAsReadForCurrentUser,
  markNotificationAsReadForCurrentUser,
} from "@/features/notifications/notification-service";

describe("notification service", () => {
  beforeEach(() => {
    mocks.requireCurrentProfile.mockReset();
    mocks.requireCurrentProfile.mockResolvedValue({
      id: "profile-1",
      workspace_id: "workspace-1",
    });
  });

  it("maps notification rows for the current user", async () => {
    const limit = vi.fn().mockResolvedValue([
      {
        actionUrl: "/client/project?projectId=project-1",
        actorEmail: "owner@example.com",
        actorFullName: "Owner User",
        createdAt: new Date("2026-07-10T09:00:00.000Z"),
        entityId: "update-1",
        entityType: "project_update",
        id: "notification-1",
        message: "A new update was posted.",
        projectId: "project-1",
        projectName: "Launch site",
        readAt: null,
        title: "New project update",
        type: "project_update_created",
      },
    ]);
    const orderBy = vi.fn(() => ({ limit }));
    const where = vi.fn(() => ({ orderBy }));
    const leftJoinProjects = vi.fn(() => ({
      leftJoin: vi.fn(() => ({ where })),
    }));
    const from = vi.fn(() => ({
      leftJoin: leftJoinProjects,
    }));
    const select = vi.fn(() => ({ from }));

    const rows = await listNotificationsForCurrentUser({ limit: 8 }, {
      select,
    } as never);

    expect(rows).toEqual([
      expect.objectContaining({
        actorName: "Owner User",
        id: "notification-1",
        projectName: "Launch site",
        readAt: null,
        type: "project_update_created",
      }),
    ]);
  });

  it("counts unread notifications for the authenticated profile", async () => {
    const where = vi.fn().mockResolvedValue([{ value: 4 }]);
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));

    await expect(
      countUnreadNotificationsForCurrentUser({ select } as never),
    ).resolves.toBe(4);
  });

  it("marks one notification as read for the current recipient only", async () => {
    const returning = vi.fn().mockResolvedValue([
      {
        actionUrl: "/client/approvals?projectId=project-1",
        id: "notification-1",
        readAt: new Date("2026-07-10T09:00:00.000Z"),
      },
    ]);
    const where = vi.fn(() => ({ returning }));
    const set = vi.fn(() => ({ where }));
    const update = vi.fn(() => ({ set }));

    await expect(
      markNotificationAsReadForCurrentUser("notification-1", {
        update,
      } as never),
    ).resolves.toEqual({
      actionUrl: "/client/approvals?projectId=project-1",
      updated: true,
    });
  });

  it("marks all unread notifications as read for the current recipient", async () => {
    const returning = vi
      .fn()
      .mockResolvedValue([{ id: "notification-1" }, { id: "notification-2" }]);
    const where = vi.fn(() => ({ returning }));
    const set = vi.fn(() => ({ where }));
    const update = vi.fn(() => ({ set }));

    await expect(
      markAllNotificationsAsReadForCurrentUser({ update } as never),
    ).resolves.toEqual({
      updatedCount: 2,
    });
  });
});
