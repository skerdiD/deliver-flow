import { describe, expect, it } from "vitest";

import {
  clientFormSchema,
  clientRouteIdSchema,
} from "@/features/admin/clients/client-validation";

describe("client validation schemas", () => {
  it("accepts a valid client form payload", () => {
    expect(
      clientFormSchema.safeParse({
        name: "Jane Client",
        email: "jane@example.com",
        company: "Example Co",
        status: "active",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid emails and unsupported statuses", () => {
    const result = clientFormSchema.safeParse({
      name: "Jane Client",
      email: "jane",
      company: "",
      status: "inactive",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toContain(
      "Enter a valid email.",
    );
    expect(result.error?.flatten().fieldErrors.status?.length).toBeGreaterThan(
      0,
    );
  });

  it("validates route ids defensively", () => {
    expect(clientRouteIdSchema.safeParse("client_123").success).toBe(true);
    expect(clientRouteIdSchema.safeParse("../client").success).toBe(false);
  });
});
