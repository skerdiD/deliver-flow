# DeliverFlow Security Model

DeliverFlow uses two authorization layers:

1. Server-side route, action, route-handler, and Drizzle query checks in the Next.js app.
2. Supabase Row Level Security policies in `supabase/migrations/0001_security_rls_storage.sql` and `supabase/migrations/0002_activity_invitation_rls.sql`.

The app should be deployed with both layers active. The Next.js server remains the primary application boundary because most data access uses Drizzle with `DATABASE_URL`; Supabase RLS is the database hardening layer for direct Supabase access and storage policies.

## Authentication

- Supabase Auth owns user sessions.
- App authorization comes from `public.profiles.role`.
- Supported roles are `admin` and `client`.
- `/admin/*` routes require `admin`.
- `/client/*` routes require `client`.
- Middleware provides fast redirects, and admin/client layouts call `requireRole()` again on the server.

## Authorization

- Admins can manage clients, projects, tasks, milestones, files, approvals, payments, feedback, invitations, and settings.
- Clients can only see active, assigned projects and related visible records.
- Server actions re-check role or assignment before mutating data.
- Client project reads join through `clients` and `project_assignments`.
- Client file downloads generate signed URLs only after checking the logged-in client is assigned to the owning project.
- Client approval responses only update pending approvals for an assigned project.

Route params and hidden form fields are treated as untrusted. They are validated with Zod and then checked against the database before use.

## Row Level Security

RLS policy SQL exists in `supabase/migrations/`.

The policies:

- Enable RLS on application tables.
- Allow admins to manage workspace records through `public.is_admin()`.
- Allow clients to read records only when `public.is_client_assigned_to_project(project_id)` passes.
- Limit visible client reads for tasks, milestones, updates, feedback, and files.
- Keep approval responses behind the `public.respond_to_approval(...)` RPC.
- Create a private `project-files` storage bucket when possible.
- Restrict storage object reads to admins or clients assigned to the matching `project_files` row.

Because this repository cannot inspect your Supabase Dashboard directly, verify that these migrations have been applied in the live project.

## Storage Security

- Project files belong in the private `project-files` bucket.
- Storage paths are generated server-side and should not be trusted from the browser.
- Downloads use short-lived signed URLs.
- Signed URLs are created only after role and ownership checks pass.
- Seeded demo file rows require matching objects in Supabase Storage, or signed URL creation will fail.

## Environment Variables

- `NEXT_PUBLIC_*` variables are browser-readable and must contain only public values such as Supabase URL, anon key, and public site URL.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `ARCJET_KEY`, and Sentry auth tokens must stay server-only.
- Service-role Supabase clients live in server-only modules and must not be imported by client components.

## Recommended Hardening

- Confirm RLS is enabled in the Supabase Dashboard for all app tables.
- Confirm the `project-files` bucket is private.
- Add integration tests against a disposable Supabase project for real RLS and storage policy checks.
- Monitor authorization failures and signed URL failures in Sentry.
- Keep permission tests close to data-access helpers, route handlers, and server actions.
