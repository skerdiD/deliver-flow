import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  createNotifications: vi.fn(),
  from: vi.fn(),
  getRecipients: vi.fn(),
  limit: vi.fn(),
  select: vi.fn(),
  where: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@sentry/nextjs", () => ({
  captureException: mocks.captureException,
}));
vi.mock("@/db", () => ({
  db: { select: mocks.select },
}));
vi.mock("@/features/notifications/notification-service", () => ({
  createNotificationsForRecipients: mocks.createNotifications,
  getAssignedClientRecipientProfileIds: mocks.getRecipients,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { notifyProjectFileAvailable } from "@/features/projects/project-files.server";

const file = {
  id: "70000000-0000-4000-8000-000000000001",
  fileName: "deliverable.pdf",
  isVisibleToClient: true,
  projectId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  uploadedBy: "10000000-0000-4000-8000-000000000001",
  workspaceId: "00000000-0000-4000-8000-000000000001",
};

describe("project file availability notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.select.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ where: mocks.where });
    mocks.where.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockResolvedValue([file]);
    mocks.getRecipients.mockResolvedValue([
      "20000000-0000-4000-8000-000000000001",
    ]);
    mocks.createNotifications.mockResolvedValue(undefined);
  });

  it("notifies assigned clients when a visible validated file is available", async () => {
    await notifyProjectFileAvailable({
      fileId: file.id,
      workspaceId: file.workspaceId,
    });

    expect(mocks.getRecipients).toHaveBeenCalledWith(
      file.projectId,
      file.workspaceId,
    );
    expect(mocks.createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: file.id,
        projectId: file.projectId,
        workspaceId: file.workspaceId,
      }),
    );
  });

  it("does not notify clients about internal-only files", async () => {
    mocks.limit.mockResolvedValue([{ ...file, isVisibleToClient: false }]);

    await notifyProjectFileAvailable({
      fileId: file.id,
      workspaceId: file.workspaceId,
    });

    expect(mocks.createNotifications).not.toHaveBeenCalled();
  });

  it("captures notification failures without rolling back a valid upload", async () => {
    const error = new Error("notification unavailable");
    mocks.createNotifications.mockRejectedValue(error);

    await expect(
      notifyProjectFileAvailable({
        fileId: file.id,
        workspaceId: file.workspaceId,
      }),
    ).resolves.toBeUndefined();
    expect(mocks.captureException).toHaveBeenCalledWith(
      error,
      expect.any(Object),
    );
  });
});
