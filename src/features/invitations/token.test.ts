import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createInviteToken, hashInviteToken } from "@/features/invitations/token";

describe("invite tokens", () => {
  it("creates long URL-safe tokens", () => {
    const token = createInviteToken();

    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(token).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it("hashes tokens deterministically without storing the raw token", () => {
    const token = "invite_token_123";
    const hash = hashInviteToken(token);

    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashInviteToken(token));
    expect(hash).not.toContain(token);
    expect(hashInviteToken("other_token")).not.toBe(hash);
  });
});
