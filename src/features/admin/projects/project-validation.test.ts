import { describe, expect, it } from "vitest";

import {
  progressFormSchema,
  projectFormSchema,
} from "@/features/admin/projects/project-validation";

const validProjectInput = {
  name: "Client portal launch",
  clientId: "client_123",
  description: "Build and ship a private delivery portal.",
  status: "in_progress",
  progress: 40,
  deadline: "2026-12-31",
  liveDemoUrl: "https://example.com",
  repositoryUrl: "",
  paymentStatus: "partial",
  budgetDollars: 5000,
  paidDollars: 2500,
};

describe("project validation schemas", () => {
  it("accepts a valid project form payload", () => {
    expect(projectFormSchema.safeParse(validProjectInput).success).toBe(true);
  });

  it("rejects invalid progress and overpaid projects", () => {
    const result = projectFormSchema.safeParse({
      ...validProjectInput,
      progress: 101,
      paidDollars: 6000,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.progress).toContain(
      "Progress cannot be above 100.",
    );
    expect(result.error?.flatten().fieldErrors.paidDollars).toContain(
      "Paid amount cannot exceed the project budget.",
    );
  });

  it("coerces progress control values and rejects unsupported statuses", () => {
    expect(
      progressFormSchema.parse({ progress: "75", status: "active" }),
    ).toEqual({
      progress: 75,
      status: "active",
    });

    expect(
      progressFormSchema.safeParse({ progress: "50", status: "draft" })
        .success,
    ).toBe(false);
  });
});
