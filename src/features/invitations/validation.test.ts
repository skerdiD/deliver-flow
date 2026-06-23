import { describe, expect, it } from "vitest";

import { acceptInviteSchema } from "@/features/invitations/validation";

describe("invite validation schemas", () => {
  it("accepts URL-safe invite tokens", () => {
    expect(
      acceptInviteSchema.safeParse({
        token: "a".repeat(32),
      }).success,
    ).toBe(true);
  });

  it("rejects short or unsafe invite tokens", () => {
    expect(acceptInviteSchema.safeParse({ token: "short" }).success).toBe(
      false,
    );
    expect(
      acceptInviteSchema.safeParse({
        token: `${"a".repeat(31)}/`,
      }).success,
    ).toBe(false);
  });
});
