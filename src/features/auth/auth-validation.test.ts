import { describe, expect, it } from "vitest";

import { loginSchema } from "@/features/auth/auth-validation";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({
        email: "admin@example.com",
        password: "correct-horse-battery-staple",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email and empty password values", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toContain(
      "Enter a valid email address.",
    );
    expect(result.error?.flatten().fieldErrors.password).toContain(
      "Password is required.",
    );
  });
});
