import { describe, expect, it } from "vitest";

import {
  acceptInviteSchema,
  acceptSignedInInviteSchema,
} from "@/features/invitations/validation";
import { inviteClientSchema } from "@/features/admin/clients/invite-validation";

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

  it("accepts signed-in invite submissions with only a token", () => {
    expect(
      acceptSignedInInviteSchema.safeParse({
        token: "a".repeat(32),
      }).success,
    ).toBe(true);

    expect(
      acceptSignedInInviteSchema.safeParse({
        token: "short",
      }).success,
    ).toBe(false);
  });

  it("validates admin client invite fields and normalizes email", () => {
    const result = inviteClientSchema.safeParse({
      email: "  CLIENT@Example.COM ",
      name: "Sarah Johnson",
      company: "Nova Agency",
      expiresInDays: "7",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("client@example.com");
    expect(result.data?.expiresInDays).toBe(7);
  });

  it("rejects empty invite names, invalid emails, and unsafe expiry windows", () => {
    const result = inviteClientSchema.safeParse({
      email: "not-an-email",
      name: "",
      company: "",
      expiresInDays: 60,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toContain(
      "Enter a valid email.",
    );
    expect(result.error?.flatten().fieldErrors.name).toContain(
      "Client name is required.",
    );
    expect(result.error?.flatten().fieldErrors.expiresInDays).toContain(
      "Invite cannot last more than 30 days.",
    );
  });
});
