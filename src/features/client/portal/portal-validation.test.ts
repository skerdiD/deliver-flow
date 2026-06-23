import { describe, expect, it } from "vitest";

import {
  clientApprovalActionSchema,
  clientFeedbackSchema,
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
});
