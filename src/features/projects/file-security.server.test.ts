import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getProjectFileSecurityConfig } from "@/features/projects/file-security.server";

describe("project file scan configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults production to quarantine", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PROJECT_FILE_SCAN_MODE", "");

    expect(getProjectFileSecurityConfig().scanMode).toBe("quarantine");
  });

  it("rejects the development no-op scanner in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PROJECT_FILE_SCAN_MODE", "development-noop");

    expect(() => getProjectFileSecurityConfig()).toThrow(
      "PROJECT_FILE_SCAN_MODE=development-noop is not allowed in production.",
    );
  });

  it("allows the no-op scanner during local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PROJECT_FILE_SCAN_MODE", "development-noop");

    expect(getProjectFileSecurityConfig().scanMode).toBe("development-noop");
  });
});
