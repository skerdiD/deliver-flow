import { describe, expect, it } from "vitest";

import { acceptInviteSchema } from "@/features/invitations/validation";

describe("invite validation schemas", () => {
  it("accepts URL-safe invite tokens", () => {
    expect(
      acceptInviteSchema.safeParse({
        token: "a".repeat(32),
        password: "Strongpass1",
        confirmPassword: "Strongpass1",
      }).success,
    ).toBe(true);
  });

  it("rejects short or unsafe invite tokens", () => {
    expect(
      acceptInviteSchema.safeParse({
        token: "short",
        password: "Strongpass1",
        confirmPassword: "Strongpass1",
      }).success,
    ).toBe(false);
    expect(
      acceptInviteSchema.safeParse({
        token: `${"a".repeat(31)}/`,
        password: "Strongpass1",
        confirmPassword: "Strongpass1",
      }).success,
    ).toBe(false);
  });

  it("rejects weak or mismatched passwords", () => {
    expect(
      acceptInviteSchema.safeParse({
        token: "a".repeat(32),
        password: "weak",
        confirmPassword: "weak",
      }).success,
    ).toBe(false);

    expect(
      acceptInviteSchema.safeParse({
        token: "a".repeat(32),
        password: "Strongpass1",
        confirmPassword: "Strongpass2",
      }).success,
    ).toBe(false);
  });
});
