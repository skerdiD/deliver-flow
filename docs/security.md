# DeliverFlow Security Model

DeliverFlow uses two authorization layers:

1. Server-side route, Server Action, Route Handler, and Drizzle query checks.
2. Supabase Row Level Security policies in `supabase/migrations/`.

Both layers are required in production. Most application data access uses
Drizzle through `DATABASE_URL`, so the Next.js server is the primary boundary.
RLS protects direct Supabase Data API access and supplies defense in depth.

## Authentication and authorization

- Supabase Auth owns user sessions.
- `public.profiles.role` supports `owner` and `client`.
- `/admin/*` requires an owner; `/client/*` requires a client.
- Middleware performs fast redirects, while protected layouts, actions, and
  handlers repeat authentication and authorization on the server.
- Owners are scoped to their profile's workspace.
- Active clients can access only their own client record, assigned active
  projects, and client-visible project resources.
- Route parameters and hidden form values are parsed as untrusted input before
  workspace, assignment, and lifecycle checks.

## Row Level Security

`0007_current_security_baseline.sql` establishes the full owner/client policy
baseline. `0008_rls_file_access_cleanup.sql` is the current forward hardening
migration: it removes the obsolete file-state predicate, validates related IDs
against the row's workspace, narrows browser grants, and keeps anonymous users
outside every application table.

All 18 public application tables have RLS enabled. Important behavior includes:

- Owner policies require the authenticated owner and row to share a workspace.
- Relationship helpers also verify project, client, milestone, actor, uploader,
  and recipient IDs belong to the claimed workspace.
- Clients receive read-only access to assigned, visible project resources.
- Client feedback inserts derive from the authenticated client identity and
  reject forged status, response, resolution, client, project, or workspace
  values.
- Approval responses remain behind `public.respond_to_approval(...)`.
- File metadata is read-only through the Data API.
- Cleanup jobs are server-only.
- Notification updates are column-limited to `read_at`.
- Anonymous API roles have no application-table grants.

Run `npm run security:verify-rls` with `DIRECT_URL` or `DATABASE_URL` to compare a
deployed database against the expected tables, policies, grants, helper
functions, and private Storage configuration. The command is read-only and
returns a non-zero exit status on meaningful drift.

## Privileged server database access

The `DATABASE_URL` role may be the database owner, a superuser, or have
`BYPASSRLS`, depending on the supplied Supabase connection string. Do not assume
RLS filters Drizzle queries. The verification command reports those role
properties without printing credentials.

Server code therefore authenticates first and scopes Drizzle reads and writes
by trusted `workspace_id`, verified project assignment, and active/deleted state.
This explicit authorization remains required even when RLS is enabled.

## File security

- `project-files` is a private Supabase Storage bucket.
- Browser roles have no `storage.objects` policy for this bucket.
- Uploads run server-side size, extension, declared MIME, and magic-byte/file
  signature checks.
- Executable, script, HTML, installer, path-traversal, and dangerous compound
  extensions are rejected.
- Object keys are generated server-side with randomized UUID path segments;
  original names are metadata only.
- Workspace quota reservations are transaction-safe around uploads,
  replacements, and deletions.
- SHA-256 checksums remain as useful integrity/audit metadata.
- Owner and client download handlers re-check workspace, project lifecycle,
  client status, assignment, visibility, deletion state, and managed-path shape.
- The server-only service-role client creates download URLs that expire after
  120 seconds by default. Responses disable caching and referrer forwarding.
- Failed object deletion and partial upload failures create generic
  `project_file_cleanup_jobs` records for later recovery.

The application does not claim to inspect file contents beyond format/signature
validation. File-type validation reduces upload risk but cannot establish that
an otherwise valid document or archive is harmless.

## Credential boundaries

- Only `NEXT_PUBLIC_*` values are browser-readable.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `ARCJET_KEY`, cron
  secrets, and Sentry auth tokens stay server-side.
- Privileged Supabase clients live behind `server-only` modules.
- A static test scans Client Components for service-role imports and secret
  references.

## Deployment checks

1. Apply Drizzle migration `0012_majestic_mentallo.sql`.
2. Apply Supabase migration `0008_rls_file_access_cleanup.sql`.
3. Run `npm run security:verify-rls` against the deployed database.
4. Run the disposable Supabase integration suite in CI.

The integration workflow starts local Supabase, applies the migration sequence,
creates separate users and workspaces, and tests anonymous denial, owner/client
isolation, relationship forgery, write boundaries, private Storage, and signed
URL expiry without production credentials.
