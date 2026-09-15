import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getProjectFileSecurityConfig } from "@/features/projects/file-security.server";

describe("project file security configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses secure bounded defaults", () => {
    vi.stubEnv("PROJECT_FILE_MAX_UPLOAD_BYTES", "");
    vi.stubEnv("PROJECT_FILE_SIGNED_URL_TTL_SECONDS", "");
    vi.stubEnv("PROJECT_FILE_WORKSPACE_QUOTA_BYTES", "");

    expect(getProjectFileSecurityConfig()).toEqual({
      maxFilesPerUpload: 1,
      maxUploadBytes: 25 * 1024 * 1024,
      signedUrlExpiresInSeconds: 120,
      workspaceQuotaBytes: 1024 * 1024 * 1024,
    });
  });

  it("rejects signed URL lifetimes outside the allowed range", () => {
    vi.stubEnv("PROJECT_FILE_SIGNED_URL_TTL_SECONDS", "301");

    expect(() => getProjectFileSecurityConfig()).toThrow(
      "PROJECT_FILE_SIGNED_URL_TTL_SECONDS must be at most 300",
    );
  });
});
