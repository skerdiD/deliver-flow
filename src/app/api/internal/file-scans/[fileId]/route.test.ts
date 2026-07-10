import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  applyProjectFileScanResult: vi.fn(),
  getProjectFileScannerWebhookSecret: vi.fn(),
}));

vi.mock("@/features/projects/file-security.server", () => ({
  getProjectFileScannerWebhookSecret: mocks.getProjectFileScannerWebhookSecret,
}));

vi.mock("@/features/projects/project-files.server", () => ({
  applyProjectFileScanResult: mocks.applyProjectFileScanResult,
}));

import { POST } from "@/app/api/internal/file-scans/[fileId]/route";

describe("internal project file scan webhook", () => {
  beforeEach(() => {
    mocks.getProjectFileScannerWebhookSecret.mockReset();
    mocks.applyProjectFileScanResult.mockReset();
  });

  it("rejects requests without the configured scanner secret", async () => {
    mocks.getProjectFileScannerWebhookSecret.mockReturnValue("scanner-secret");

    const response = await POST(
      new Request("http://localhost/api/internal/file-scans/file-id", {
        body: JSON.stringify({ status: "clean" }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
      {
        params: Promise.resolve({
          fileId: "70000000-0000-4000-8000-000000000001",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(mocks.applyProjectFileScanResult).not.toHaveBeenCalled();
  });

  it("updates file scan status when the scanner secret matches", async () => {
    mocks.getProjectFileScannerWebhookSecret.mockReturnValue("scanner-secret");
    mocks.applyProjectFileScanResult.mockResolvedValue({
      cleanupQueued: false,
      found: true,
    });

    const response = await POST(
      new Request("http://localhost/api/internal/file-scans/file-id", {
        body: JSON.stringify({ status: "infected", reason: "EICAR test" }),
        headers: {
          authorization: "Bearer scanner-secret",
          "content-type": "application/json",
        },
        method: "POST",
      }),
      {
        params: Promise.resolve({
          fileId: "70000000-0000-4000-8000-000000000001",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(mocks.applyProjectFileScanResult).toHaveBeenCalledWith({
      fileId: "70000000-0000-4000-8000-000000000001",
      reason: "EICAR test",
      status: "infected",
    });
  });
});
