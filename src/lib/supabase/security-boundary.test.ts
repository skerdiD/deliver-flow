import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { getClientModuleFiles } from "@/lib/supabase/security-test-utils";

const workspaceRoot = process.cwd();

describe("Supabase security boundaries", () => {
  it("does not import service-role helpers from client modules", () => {
    const violations = getClientModuleFiles(join(workspaceRoot, "src"))
      .map((filePath) => ({
        filePath,
        source: readFileSync(filePath, "utf8"),
      }))
      .filter(
        ({ source }) =>
          source.includes("@/lib/supabase/admin") ||
          source.includes("createSupabaseAdminClient") ||
          source.includes("SUPABASE_SERVICE_ROLE_KEY"),
      )
      .map(({ filePath }) => relative(workspaceRoot, filePath));

    expect(violations).toEqual([]);
  });

  it("keeps admin file downloads scoped to active project files", () => {
    const source = readFileSync(
      join(
        workspaceRoot,
        "src/app/api/admin/files/[fileId]/download/route.ts",
      ),
      "utf8",
    );

    expect(source).toContain(
      ".innerJoin(projects, eq(projectFiles.projectId, projects.id))",
    );
    expect(source).toContain('ne(projects.status, "archived")');
    expect(source).toContain("isNull(projects.archivedAt)");
    expect(source).toContain("isNull(projects.deletedAt)");
  });

  it("guards admin direct project mutations and uploads", () => {
    const source = readFileSync(
      join(workspaceRoot, "src/features/admin/projects/actions.ts"),
      "utf8",
    );

    expect(source).toContain("async function getMutableProject");
    expect(source).toContain('ne(projects.status, "archived")');
    expect(source).toContain("isNull(projects.archivedAt)");
    expect(source).toContain("MAX_PROJECT_FILE_SIZE_BYTES");
    expect(source).toContain("sanitizeProjectFileName(label)");
  });

  it("requires a configured invite origin in production", () => {
    const source = readFileSync(
      join(workspaceRoot, "src/lib/app-url.ts"),
      "utf8",
    );

    expect(source).toContain(
      "process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL",
    );
    expect(source).toContain('process.env.NODE_ENV === "production"');
    expect(source).toContain("Missing NEXT_PUBLIC_SITE_URL");
  });
});
