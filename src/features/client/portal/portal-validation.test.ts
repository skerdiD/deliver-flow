import { describe, expect, it } from "vitest";

import {
  clientApprovalActionSchema,
  clientApprovalChangeRequestSchema,
  clientApprovalIdSchema,
  clientFeedbackSchema,
  clientProjectIdSchema,
} from "@/features/client/portal/portal-validation";

describe("client portal validation schemas", () => {
  it("accepts useful feedback and approval actions", () => {
    expect(
      clientFeedbackSchema.safeParse({
        message: "The milestone looks good from our side.",
      }).success,
    ).toBe(true);

    expect(
      clientApprovalActionSchema.safeParse({
        status: "approved",
        responseNote: "Approved for launch.",
      }).success,
    ).toBe(true);
  });

  it("rejects short feedback and unsupported approval statuses", () => {
    expect(clientFeedbackSchema.safeParse({ message: "ok" }).success).toBe(
      false,
    );

    expect(
      clientApprovalActionSchema.safeParse({
        status: "pending",
        responseNote: "",
      }).success,
    ).toBe(false);
  });

  it("requires a note for change requests", () => {
    expect(
      clientApprovalChangeRequestSchema.safeParse({
        status: "changes_requested",
        responseNote: "Please tighten the mobile spacing.",
      }).success,
    ).toBe(true);

    expect(
      clientApprovalChangeRequestSchema.safeParse({
        status: "changes_requested",
        responseNote: "",
      }).success,
    ).toBe(false);
  });

  it("validates client route and action ids as UUIDs", () => {
    const id = "00000000-0000-4000-8000-000000000000";

    expect(clientProjectIdSchema.safeParse(id).success).toBe(true);
    expect(clientApprovalIdSchema.safeParse(id).success).toBe(true);
    expect(clientProjectIdSchema.safeParse("../other-project").success).toBe(
      false,
    );
    expect(clientApprovalIdSchema.safeParse("approval_123").success).toBe(
      false,
    );
  });
});
