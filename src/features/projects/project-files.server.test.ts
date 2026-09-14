import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  createNotifications: vi.fn(),
  getRecipients: vi.fn(),
  insert: vi.fn(),
  remove: vi.fn(),
  returning: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  where: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@sentry/nextjs", () => ({
  captureException: mocks.captureException,
}));
vi.mock("@/db", () => ({
  db: {
    insert: mocks.insert,
    update: mocks.update,
  },
}));
vi.mock("@/features/notifications/notification-service", () => ({
  createNotificationsForRecipients: mocks.createNotifications,
  getAssignedClientRecipientProfileIds: mocks.getRecipients,
}));
vi.mock("@/features/projects/file-security.server", () => ({
  getProjectFileSecurityConfig: () => ({
    maxFilesPerUpload: 1,
    maxUploadBytes: 1024,
    scanMode: "quarantine",
    signedUrlExpiresInSeconds: 120,
    workspaceQuotaBytes: 4096,
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      from: () => ({ remove: mocks.remove }),
    },
  }),
}));

import { applyProjectFileScanResult } from "@/features/projects/project-files.server";

const file = {
  bucketName: "project-files",
  id: "70000000-0000-4000-8000-000000000001",
  fileName: "deliverable.pdf",
  isVisibleToClient: true,
  projectId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  storagePath:
    "workspaces/00000000-0000-4000-8000-000000000001/projects/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/object/file.pdf",
  uploadedBy: "10000000-0000-4000-8000-000000000001",
  workspaceId: "00000000-0000-4000-8000-000000000001",
};
const checksumSha256 = "a".repeat(64);

describe("project file scan-state application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockReturnValue({ set: mocks.set });
    mocks.set.mockReturnValue({ where: mocks.where });
    mocks.where.mockReturnValue({ returning: mocks.returning });
    mocks.returning.mockResolvedValue([file]);
    mocks.getRecipients.mockResolvedValue([
      "20000000-0000-4000-8000-000000000001",
    ]);
    mocks.createNotifications.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue({ error: null });
  });

  it("publishes a notification only after a pending file is marked clean", async () => {
    const result = await applyProjectFileScanResult({
      checksumSha256,
      fileId: file.id,
      status: "clean",
    });

    expect(result).toEqual({ cleanupQueued: false, found: true });
    expect(mocks.createNotifications).toHaveBeenCalledOnce();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("keeps failed scans unavailable without deleting the evidence object", async () => {
    const result = await applyProjectFileScanResult({
      checksumSha256,
      fileId: file.id,
      reason: "scanner unavailable",
      status: "failed",
    });

    expect(result).toEqual({ cleanupQueued: false, found: true });
    expect(mocks.createNotifications).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("removes an infected storage object and never notifies clients", async () => {
    const result = await applyProjectFileScanResult({
      checksumSha256,
      fileId: file.id,
      reason: "malware signature",
      status: "infected",
    });

    expect(result).toEqual({ cleanupQueued: false, found: true });
    expect(mocks.remove).toHaveBeenCalledWith([file.storagePath]);
    expect(mocks.createNotifications).not.toHaveBeenCalled();
  });

  it("rejects stale, replayed, or checksum-mismatched scan results", async () => {
    mocks.returning.mockResolvedValue([]);

    const result = await applyProjectFileScanResult({
      checksumSha256,
      fileId: file.id,
      status: "clean",
    });

    expect(result).toEqual({ cleanupQueued: false, found: false });
    expect(mocks.createNotifications).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});
