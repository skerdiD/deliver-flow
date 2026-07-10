import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const serviceSource = readFileSync(
  join(process.cwd(), "src/features/notifications/notification-service.ts"),
  "utf8",
);

describe("notification recipient resolution", () => {
  it("resolves client recipients from active project assignments only", () => {
    expect(serviceSource).toContain(
      "eq(projectAssignments.projectId, projectId)",
    );
    expect(serviceSource).toContain(
      "eq(projectAssignments.workspaceId, workspaceId)",
    );
    expect(serviceSource).toContain('eq(clients.status, "active")');
    expect(serviceSource).toContain("isNull(clients.archivedAt)");
    expect(serviceSource).toContain("isNull(clients.deletedAt)");
  });

  it("resolves owner recipients inside the current workspace only", () => {
    expect(serviceSource).toContain("eq(profiles.workspaceId, workspaceId)");
    expect(serviceSource).toContain('eq(profiles.role, "owner")');
  });
});
