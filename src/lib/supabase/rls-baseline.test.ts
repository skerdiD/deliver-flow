import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const baseline = readFileSync(
  join(process.cwd(), "supabase/migrations/0007_current_security_baseline.sql"),
  "utf8",
);
const hardening = readFileSync(
  join(process.cwd(), "supabase/migrations/0008_rls_file_access_cleanup.sql"),
  "utf8",
);
const schema = readFileSync(join(process.cwd(), "src/db/schema.ts"), "utf8");
const fileStateCleanup = readFileSync(
  join(process.cwd(), "drizzle/0012_majestic_mentallo.sql"),
  "utf8",
);

describe("current Supabase RLS baseline", () => {
  it("enables RLS for every public application table in the Drizzle schema", () => {
    const tableNames = [...schema.matchAll(/pgTable\(\s*["']([^"']+)/g)].map(
      (match) => match[1],
    );

    expect(tableNames).toHaveLength(18);
    for (const tableName of tableNames) {
      expect(baseline).toContain(
        `alter table public.${tableName} enable row level security;`,
      );
    }
  });

  it("uses the current owner/client role model", () => {
    expect(baseline).toContain("and role = 'owner'");
    expect(baseline).not.toContain("and role = 'admin'");
  });

  it("keeps feedback private to the assigned client identity", () => {
    expect(baseline).toContain('"Clients can read assigned feedback"');
    expect(baseline).toContain("client_id = public.current_client_id()");
    expect(baseline).toContain(
      "public.is_client_assigned_to_project(project_id)",
    );
    expect(baseline).toContain("and status = 'open'");
    expect(baseline).toContain("and admin_response is null");
    expect(baseline).toContain("and resolved_at is null");
  });

  it("exposes visible assigned file metadata without browser writes", () => {
    expect(hardening).toContain(
      'create policy "Clients can read assigned visible project files"',
    );
    expect(hardening).not.toContain("scan_status = 'clean'");
    expect(baseline).toContain(
      "revoke insert, update, delete on public.project_files from authenticated",
    );
  });

  it("validates owner-supplied relationships within the workspace", () => {
    expect(hardening).toContain("public.is_project_in_workspace");
    expect(hardening).toContain("public.is_project_assignment_consistent");
    expect(hardening).toContain("public.is_milestone_in_project");
    expect(hardening).toContain("public.is_profile_in_workspace");
  });

  it("keeps anonymous users outside every application table", () => {
    expect(hardening).toMatch(/revoke all on table[\s\S]+from public, anon;/);
  });

  it("keeps storage objects behind server-issued signed URLs", () => {
    expect(baseline).toContain(
      'drop policy if exists "Clients can read assigned project file objects" on storage.objects',
    );
    expect(baseline).not.toMatch(/create policy[^;]*on storage\.objects/i);
  });

  it("keeps removed file-state functionality out of the current application", () => {
    const currentSources = [
      schema,
      readFileSync(join(process.cwd(), ".env.example"), "utf8"),
      readFileSync(join(process.cwd(), "README.md"), "utf8"),
      readFileSync(join(process.cwd(), "docs/security.md"), "utf8"),
    ].join("\n");

    expect(currentSources).not.toMatch(
      /PROJECT_FILE_SCAN|projectFileScanStatus|scan_status|file-scans/i,
    );
    expect(
      existsSync(
        join(
          process.cwd(),
          "src/app/api/internal/file-scans/[fileId]/route.ts",
        ),
      ),
    ).toBe(false);
  });

  it("preserves file rows and objects while preventing legacy blocked files from resurfacing", () => {
    expect(fileStateCleanup).toContain("WHERE \"scan_status\" = 'infected'");
    expect(fileStateCleanup).toContain(
      'ALTER TABLE "project_files" DROP COLUMN "scan_status"',
    );
    expect(fileStateCleanup).not.toMatch(
      /delete\s+from\s+"?project_files"?|storage\.objects/i,
    );
  });
});
