# DeliverFlow Security Model

DeliverFlow uses two authorization layers:

1. Server-side route, action, route-handler, and Drizzle query checks in the Next.js app.
2. Supabase Row Level Security policies in `supabase/migrations/`.

The app should be deployed with both layers active. The Next.js server remains the primary application boundary because most data access uses Drizzle with `DATABASE_URL`; Supabase RLS is the database hardening layer for direct Supabase access and storage policies.

## Authentication

- Supabase Auth owns user sessions.
- App authorization comes from `public.profiles.role`.
- Supported roles are `owner` and `client`.
- `/admin/*` routes require `owner`.
- `/client/*` routes require `client`.
- Middleware provides fast redirects, and protected layouts call server-side role guards again.

## Authorization

- Owners can manage clients, projects, tasks, milestones, files, approvals, payments, feedback, invitations, and settings.
- Clients can only see active, assigned projects and related visible records.
- Server actions re-check role or assignment before mutating data.
- Client project reads join through `clients` and `project_assignments`.
- Client feedback reads are filtered by the assigned `project_id`, the assigned
  `client_id`, `is_visible_to_client`, and active lifecycle fields.
- Client feedback creation ignores browser-supplied client ownership and inserts
  with the `client_id` and `project_id` from the verified assignment.
- Client file downloads generate signed URLs only after checking the logged-in client is assigned to the owning project.
- Client file reads and downloads now require `scan_status = 'clean'`.
- Client approval responses only update pending approvals for an assigned project.
- Owner feedback responses require the `owner` role, save to `admin_response`,
  mark unresolved feedback as reviewed, and are revalidated back into the client
  feedback history.

Route params and hidden form fields are treated as untrusted. They are validated with Zod and then checked against the database before use.

## Row Level Security

RLS policy SQL exists in `supabase/migrations/`.

The policies:

- Enable RLS on application tables.
- Allow owners to manage workspace records through the owner RLS helper functions.
- Allow clients to read records only when `public.is_client_assigned_to_project(project_id)` passes.
- Limit visible client reads for tasks, milestones, updates, feedback, and files.
- Keep direct `project_files` access read-only for authenticated Supabase users; browser-driven inserts, updates, and deletes are revoked.
- Keep approval responses behind the `public.respond_to_approval(...)` RPC.
- Create a private `project-files` storage bucket when possible.
- Remove direct `storage.objects` file-object policies so all downloads go through server-generated signed URLs.

Because this repository cannot inspect your Supabase Dashboard directly, verify that these migrations have been applied in the live project.

## Storage Security

- Project files belong in the private `project-files` bucket.
- Storage paths are generated server-side and should not be trusted from the browser.
- New object keys are randomized under `workspaces/{workspaceId}/projects/{projectId}/{uuid}/file.ext`.
- Downloads use short-lived signed URLs.
- Signed URLs are created only after role and ownership checks pass.
- Uploaded files are validated against size, extension, declared MIME type, and content signatures before they are accepted.
- Dangerous executable, script, HTML, installer, and double-extension file names are rejected.
- Workspace quota enforcement uses `workspaces.storage_used_bytes` and `workspaces.storage_quota_bytes`, updated transaction-safely before uploads and after deletes or replacements.
- Partial storage failures are recorded in `project_file_cleanup_jobs` so orphaned objects can be cleaned up later.
- Seeded demo file rows require matching objects in Supabase Storage, or signed URL creation will fail.

## Scan Status

- New uploads start with `scan_status = 'pending'`.
- In local development, `PROJECT_FILE_SCAN_MODE=development-noop` marks uploads clean immediately to preserve the authoring workflow.
- In production, use `PROJECT_FILE_SCAN_MODE=quarantine` and wire a trusted scanner to `POST /api/internal/file-scans/[fileId]` with `Authorization: Bearer $PROJECT_FILE_SCAN_WEBHOOK_SECRET`.
- Supported scan states are `pending`, `clean`, `infected`, and `failed`.
- Pending, infected, and failed files are blocked from client visibility and client downloads.
- This repository does not include a real antivirus engine. Production malware detection depends on an external scanner calling the webhook.

## Environment Variables

- `NEXT_PUBLIC_*` variables are browser-readable and must contain only public values such as Supabase URL, anon key, and public site URL.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `ARCJET_KEY`, and Sentry auth tokens must stay server-only.
- Service-role Supabase clients live in server-only modules and must not be imported by client components.
- File hardening uses:
  - `PROJECT_FILE_MAX_UPLOAD_BYTES`
  - `PROJECT_FILE_SIGNED_URL_TTL_SECONDS`
  - `PROJECT_FILE_WORKSPACE_QUOTA_BYTES`
  - `PROJECT_FILE_SCAN_MODE`
  - `PROJECT_FILE_SCAN_WEBHOOK_SECRET`

## Recommended Hardening

- Confirm RLS is enabled in the Supabase Dashboard for all app tables.
- Confirm the `project-files` bucket is private.
- Monitor authorization failures and signed URL failures in Sentry.
- Keep permission tests close to data-access helpers, route handlers, and server actions.
- Add a scheduled worker or script that processes `project_file_cleanup_jobs` and retries failed storage deletions.
- Add a disposable Supabase integration environment if you want automated tests for live RLS, storage policies, and signed URL expiry.
