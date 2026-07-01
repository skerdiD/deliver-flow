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
});
