import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const portalDataSource = readFileSync(
  join(process.cwd(), "src/features/client/portal/portal-data.ts"),
  "utf8",
);

describe("client portal data access boundaries", () => {
  it("scopes feedback reads to the assigned project and client", () => {
    expect(portalDataSource).toContain(
      "eq(feedback.projectId, assignment.projectId)",
    );
    expect(portalDataSource).toContain(
      "eq(feedback.clientId, assignment.clientId)",
    );
    expect(portalDataSource).toContain(
      "eq(feedback.isVisibleToClient, true)",
    );
  });

  it("creates feedback with the client id from the verified assignment", () => {
    expect(portalDataSource).toContain(
      "const assignment = await getClientPortalAssignmentById",
    );
    expect(portalDataSource).toContain("clientId: assignment.clientId");
    expect(portalDataSource).toContain("projectId: assignment.projectId");
  });
});
