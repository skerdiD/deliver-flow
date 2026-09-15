import { config } from "dotenv";

config({ path: ".env.local" });

import postgres from "postgres";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing DIRECT_URL or DATABASE_URL for read-only RLS verification.",
  );
}

const expectedPolicies: Record<string, string[]> = {
  workspaces: ["Workspace members can read workspace"],
  profiles: ["Admins can manage profiles", "Users can read own profile"],
  clients: ["Admins can manage clients", "Clients can read own client record"],
  projects: [
    "Admins can manage projects",
    "Clients can read assigned projects",
  ],
  project_assignments: [
    "Admins can manage project assignments",
    "Clients can read own project assignments",
  ],
  milestones: [
    "Admins can manage milestones",
    "Clients can read assigned visible milestones",
  ],
  tasks: ["Admins can manage tasks", "Clients can read assigned visible tasks"],
  project_updates: [
    "Admins can manage project updates",
    "Clients can read assigned visible project updates",
  ],
  feedback: [
    "Admins can manage feedback",
    "Clients can read assigned feedback",
    "Clients can create feedback for assigned projects",
  ],
  approvals: [
    "Admins can manage approvals",
    "Clients can read assigned approvals",
  ],
  payments: [
    "Admins can manage payments",
    "Clients can read assigned payments",
  ],
  project_files: [
    "Admins can manage project files",
    "Clients can read assigned visible project files",
  ],
  client_invitations: ["Admins can manage client invitations"],
  project_activity: [
    "Admins can manage project activity",
    "Clients can read assigned project activity",
  ],
  project_view_events: [
    "Admins can read project view events",
    "Clients can read own project view events",
  ],
  admin_notes: ["Admins can manage admin notes"],
  project_file_cleanup_jobs: [],
  notifications: [
    "Admins can read notifications",
    "Users can read own notifications",
    "Users can update own notification read state",
  ],
};

const expectedFunctions = [
  "handle_new_user",
  "current_workspace_id",
  "is_admin",
  "is_workspace_admin",
  "current_client_id",
  "is_client_assigned_to_project",
  "respond_to_approval",
  "is_profile_in_workspace",
  "is_project_in_workspace",
  "is_client_in_workspace",
  "is_milestone_in_project",
  "is_project_assignment_consistent",
];

const serverOnlyFunctions = new Set(["handle_new_user"]);

const expectedPolicyCommands: Record<string, string> = {
  "Workspace members can read workspace": "SELECT",
  "Admins can manage profiles": "ALL",
  "Users can read own profile": "SELECT",
  "Admins can manage clients": "ALL",
  "Clients can read own client record": "SELECT",
  "Admins can manage projects": "ALL",
  "Clients can read assigned projects": "SELECT",
  "Admins can manage project assignments": "ALL",
  "Clients can read own project assignments": "SELECT",
  "Admins can manage milestones": "ALL",
  "Clients can read assigned visible milestones": "SELECT",
  "Admins can manage tasks": "ALL",
  "Clients can read assigned visible tasks": "SELECT",
  "Admins can manage project updates": "ALL",
  "Clients can read assigned visible project updates": "SELECT",
  "Admins can manage feedback": "ALL",
  "Clients can read assigned feedback": "SELECT",
  "Clients can create feedback for assigned projects": "INSERT",
  "Admins can manage approvals": "ALL",
  "Clients can read assigned approvals": "SELECT",
  "Admins can manage payments": "ALL",
  "Clients can read assigned payments": "SELECT",
  "Admins can manage project files": "SELECT",
  "Clients can read assigned visible project files": "SELECT",
  "Admins can manage client invitations": "ALL",
  "Admins can manage project activity": "ALL",
  "Clients can read assigned project activity": "SELECT",
  "Admins can read project view events": "SELECT",
  "Clients can read own project view events": "SELECT",
  "Admins can manage admin notes": "ALL",
  "Admins can read notifications": "SELECT",
  "Users can read own notifications": "SELECT",
  "Users can update own notification read state": "UPDATE",
};

const expectedPolicyFragments: Record<string, string[]> = {
  "Clients can read own client record": [
    "profile_id = auth.uid()",
    "status",
    "'active'",
    "archived_at is null",
    "deleted_at is null",
  ],
  "Clients can read assigned projects": [
    "is_client_assigned_to_project",
    "archived_at is null",
    "deleted_at is null",
  ],
  "Clients can create feedback for assigned projects": [
    "created_by = auth.uid()",
    "current_client_id()",
    "admin_response is null",
    "resolved_at is null",
    "is_client_assigned_to_project",
  ],
  "Clients can read assigned visible project files": [
    "is_visible_to_client = true",
    "deleted_at is null",
    "is_client_assigned_to_project",
  ],
  "Admins can manage clients": ["is_profile_in_workspace"],
  "Admins can manage projects": ["is_profile_in_workspace"],
  "Admins can manage project assignments": [
    "is_project_assignment_consistent",
    "is_profile_in_workspace",
  ],
  "Admins can manage milestones": [
    "is_project_in_workspace",
    "is_profile_in_workspace",
  ],
  "Admins can manage tasks": [
    "is_project_in_workspace",
    "is_milestone_in_project",
    "is_profile_in_workspace",
  ],
  "Admins can manage project updates": [
    "is_project_in_workspace",
    "is_profile_in_workspace",
  ],
  "Admins can manage feedback": [
    "is_project_assignment_consistent",
    "is_profile_in_workspace",
  ],
  "Admins can manage approvals": [
    "is_project_in_workspace",
    "is_milestone_in_project",
    "is_profile_in_workspace",
  ],
  "Admins can manage payments": ["is_project_in_workspace"],
  "Admins can manage project files": [
    "is_project_in_workspace",
    "is_profile_in_workspace",
  ],
  "Admins can manage client invitations": [
    "is_client_in_workspace",
    "is_profile_in_workspace",
  ],
  "Admins can manage project activity": [
    "is_project_in_workspace",
    "is_profile_in_workspace",
  ],
  "Admins can read project view events": [
    "is_project_assignment_consistent",
    "is_profile_in_workspace",
  ],
  "Admins can read notifications": [
    "is_profile_in_workspace",
    "is_project_in_workspace",
  ],
  "Users can read own notifications": [
    "recipient_profile_id = auth.uid()",
    "is_profile_in_workspace",
    "is_project_in_workspace",
  ],
};

const sql = postgres(connectionString, {
  max: 1,
  prepare: false,
  idle_timeout: 5,
});

const failures: string[] = [];
const notes: string[] = [];

function fail(message: string) {
  failures.push(message);
}

async function verify() {
  await sql.begin("read only", async (tx) => {
    const [role] = await tx<
      {
        current_user: string;
        rolbypassrls: boolean;
        rolsuper: boolean;
      }[]
    >`
      select current_user, r.rolbypassrls, r.rolsuper
      from pg_catalog.pg_roles r
      where r.rolname = current_user
    `;

    notes.push(
      `Database role: ${role.current_user} (superuser=${role.rolsuper}, bypassrls=${role.rolbypassrls}).`,
    );

    const tableRows = await tx<
      {
        relforcerowsecurity: boolean;
        relname: string;
        relowner: string;
        relrowsecurity: boolean;
      }[]
    >`
      select c.relname,
             c.relrowsecurity,
             c.relforcerowsecurity,
             pg_get_userbyid(c.relowner) as relowner
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind in ('r', 'p')
        and c.relname in ${tx(Object.keys(expectedPolicies))}
    `;
    const tables = new Map(tableRows.map((row) => [row.relname, row]));
    const ownerBypassTables = tableRows.filter(
      (row) => row.relowner === role.current_user && !row.relforcerowsecurity,
    ).length;
    notes.push(
      `Connection role owns ${ownerBypassTables}/${Object.keys(expectedPolicies).length} application tables without FORCE RLS.`,
    );

    for (const tableName of Object.keys(expectedPolicies)) {
      const table = tables.get(tableName);
      if (!table) {
        fail(`Missing application table public.${tableName}.`);
      } else if (!table.relrowsecurity) {
        fail(`RLS is disabled on public.${tableName}.`);
      }
    }

    const policyRows = await tx<
      {
        cmd: string;
        permissive: string;
        policyname: string;
        qual: string | null;
        roles: string[];
        tablename: string;
        with_check: string | null;
      }[]
    >`
      select tablename, policyname, permissive, roles, cmd, qual, with_check
      from pg_catalog.pg_policies
      where schemaname = 'public'
        and tablename in ${tx(Object.keys(expectedPolicies))}
    `;
    const actualPolicies = new Map<string, Set<string>>();
    for (const row of policyRows) {
      if (!row.roles.includes("authenticated")) {
        fail(
          `Policy ${row.policyname} on public.${row.tablename} does not target authenticated.`,
        );
      }
      if (row.permissive !== "PERMISSIVE") {
        fail(
          `Policy ${row.policyname} on public.${row.tablename} is unexpectedly restrictive.`,
        );
      }
      if (expectedPolicyCommands[row.policyname] !== row.cmd) {
        fail(
          `Policy ${row.policyname} on public.${row.tablename} has command ${row.cmd}; expected ${expectedPolicyCommands[row.policyname] ?? "no policy"}.`,
        );
      }
      const definition =
        `${row.qual ?? ""} ${row.with_check ?? ""}`.toLowerCase();
      for (const fragment of expectedPolicyFragments[row.policyname] ?? []) {
        if (!definition.includes(fragment)) {
          fail(
            `Policy ${row.policyname} on public.${row.tablename} is missing expected condition: ${fragment}.`,
          );
        }
      }
      const policies = actualPolicies.get(row.tablename) ?? new Set<string>();
      policies.add(row.policyname);
      actualPolicies.set(row.tablename, policies);
    }

    for (const [tableName, expected] of Object.entries(expectedPolicies)) {
      const actual = actualPolicies.get(tableName) ?? new Set<string>();
      for (const policyName of expected) {
        if (!actual.has(policyName)) {
          fail(`Missing policy ${policyName} on public.${tableName}.`);
        }
      }
      for (const policyName of actual) {
        if (!expected.includes(policyName)) {
          fail(`Unexpected policy ${policyName} on public.${tableName}.`);
        }
      }
    }

    const unsafeGrants = await tx<
      { grantee: string; privilege_type: string; table_name: string }[]
    >`
      select grantee, table_name, privilege_type
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name in ${tx(Object.keys(expectedPolicies))}
        and grantee in ('anon', 'PUBLIC')
        and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    `;
    for (const grant of unsafeGrants) {
      fail(
        `Unexpected ${grant.privilege_type} grant on public.${grant.table_name} to ${grant.grantee}.`,
      );
    }

    const forbiddenAuthenticatedGrants = await tx<
      {
        privilege_type: string;
        table_name: string;
      }[]
    >`
      select table_name, privilege_type
      from information_schema.role_table_grants
      where table_schema = 'public'
        and grantee = 'authenticated'
        and (
          (table_name = 'project_files' and privilege_type in ('INSERT', 'UPDATE', 'DELETE'))
          or (table_name = 'project_file_cleanup_jobs')
          or (table_name = 'project_view_events' and privilege_type in ('INSERT', 'UPDATE', 'DELETE'))
          or (table_name = 'notifications' and privilege_type in ('INSERT', 'UPDATE', 'DELETE'))
        )
    `;
    for (const grant of forbiddenAuthenticatedGrants) {
      fail(
        `Unexpected authenticated ${grant.privilege_type} table grant on public.${grant.table_name}.`,
      );
    }

    const [notificationReadGrant] = await tx<{ allowed: boolean }[]>`
      select has_column_privilege('authenticated', 'public.notifications', 'read_at', 'UPDATE') as allowed
    `;
    if (!notificationReadGrant.allowed) {
      fail(
        "authenticated is missing the read_at-only notification update grant.",
      );
    }

    const [clientColumnGrants] = await tx<
      {
        id_allowed: boolean;
        notes_allowed: boolean;
      }[]
    >`
      select
        has_column_privilege('authenticated', 'public.clients', 'id', 'SELECT') as id_allowed,
        has_column_privilege('authenticated', 'public.clients', 'notes', 'SELECT') as notes_allowed
    `;
    if (!clientColumnGrants.id_allowed || clientColumnGrants.notes_allowed) {
      fail(
        "Client-record column grants expose internal notes or hide required identity fields.",
      );
    }

    const removedColumns = await tx<{ column_name: string }[]>`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'project_files'
        and column_name in ('scan_status', 'scan_completed_at', 'scan_failure_reason')
    `;
    if (removedColumns.length > 0) {
      fail(
        `Obsolete project_files columns remain deployed: ${removedColumns.map((row) => row.column_name).join(", ")}.`,
      );
    }

    const [removedType] = await tx<{ exists: boolean }[]>`
      select to_regtype('public.project_file_scan_status') is not null as exists
    `;
    if (removedType.exists) {
      fail("Obsolete public.project_file_scan_status type remains deployed.");
    }

    const functionRows = await tx<
      {
        anon_execute: boolean;
        authenticated_execute: boolean;
        proname: string;
        prosecdef: boolean;
        safe_search_path: boolean;
      }[]
    >`
      select p.proname,
             p.prosecdef,
             coalesce(p.proconfig @> array['search_path=public'], false) as safe_search_path,
             has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
             has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ${tx(expectedFunctions)}
    `;
    const functions = new Map(functionRows.map((row) => [row.proname, row]));
    for (const functionName of expectedFunctions) {
      const fn = functions.get(functionName);
      if (!fn) {
        fail(`Missing security function public.${functionName}.`);
        continue;
      }
      if (!fn.prosecdef || !fn.safe_search_path) {
        fail(
          `Function public.${functionName} is missing SECURITY DEFINER or a fixed public search_path.`,
        );
      }
      const shouldBeServerOnly = serverOnlyFunctions.has(functionName);
      if (
        fn.anon_execute ||
        (shouldBeServerOnly && fn.authenticated_execute) ||
        (!shouldBeServerOnly && !fn.authenticated_execute)
      ) {
        fail(`Function execute grants drifted for public.${functionName}.`);
      }
    }

    const [bucketTable] = await tx<{ exists: boolean }[]>`
      select to_regclass('storage.buckets') is not null as exists
    `;
    if (!bucketTable.exists) {
      fail("Supabase Storage catalog storage.buckets is unavailable.");
    } else {
      const buckets = await tx<{ public: boolean }[]>`
        select public from storage.buckets where id = 'project-files'
      `;
      if (buckets.length === 0) {
        fail("Private Storage bucket project-files is missing.");
      } else if (buckets[0].public) {
        fail("Storage bucket project-files is public; it must be private.");
      }
    }

    const storagePolicies = await tx<{ policyname: string }[]>`
      select policyname
      from pg_catalog.pg_policies
      where schemaname = 'storage' and tablename = 'objects'
    `;
    for (const policy of storagePolicies) {
      fail(`Unexpected direct Storage object policy: ${policy.policyname}.`);
    }
  });
}

verify()
  .then(() => {
    for (const note of notes) console.log(note);
    if (failures.length > 0) {
      console.error(
        `RLS verification failed with ${failures.length} issue(s):`,
      );
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }
    console.log(
      `RLS verification passed: ${Object.keys(expectedPolicies).length} tables, ${Object.values(expectedPolicies).flat().length} policies, ${expectedFunctions.length} functions, grants, and private Storage checked.`,
    );
  })
  .catch((error: unknown) => {
    const rawMessage =
      error instanceof Error ? error.message : "Unknown database error";
    console.error(
      `RLS verification could not complete: ${rawMessage.replaceAll(connectionString, "[redacted]")}`,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
