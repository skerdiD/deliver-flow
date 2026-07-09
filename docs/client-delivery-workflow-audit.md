# Client Delivery Workflow Audit

## Already Working

- Route protection separates `owner` and `client` roles through server-side role guards.
- Client portal pages read assigned projects, visible files, payments, feedback, and approvals from PostgreSQL.
- Client approval responses update the approval row and mark the related milestone as `approved` when an approval is accepted.
- Client file downloads use a protected API route and Supabase Storage signed URLs.
- Payments are manual records only; there is no payment gateway integration.

## Fixed In This Pass

- Owner client and project creation now use the same Drizzle/PostgreSQL data layer as the client portal.
- New owner projects create a project assignment, so the selected client can see the project after login.
- Project detail pages now let owners request approval, upload a visible deliverable file, and create/update manual payment records.
- Owner approval, file, payment, and client/project pages now share the same workflow data instead of mixing database records with local in-memory stores.

## Test Notes

- The Playwright happy-path spec is skipped unless owner/client e2e credentials are configured.
- The e2e verifies the real browser workflow through project creation, approval request, client approval, and owner status review.
- File upload is represented by the upload UI in e2e because real Supabase Storage credentials and buckets vary by environment.
