import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const baseline = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/0007_current_security_baseline.sql",
  ),
  "utf8",
);
const schema = readFileSync(
  join(process.cwd(), "src/db/schema.ts"),
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

  it("only exposes clean file metadata and revokes browser writes", () => {
    expect(baseline).toContain("scan_status = 'clean'");
    expect(baseline).toContain(
      "revoke insert, update, delete on public.project_files from authenticated",
    );
  });

  it("keeps storage objects behind server-issued signed URLs", () => {
    expect(baseline).toContain(
      'drop policy if exists "Clients can read assigned project file objects" on storage.objects',
    );
    expect(baseline).not.toMatch(
      /create policy[^;]*on storage\.objects/i,
    );
  });
});
