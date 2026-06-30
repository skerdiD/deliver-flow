-- =========================================================
-- DeliverFlow RLS hardening for activity, view events, invites
-- =========================================================
-- Run this after 0001_security_rls_storage.sql.
-- These tables were added to the Drizzle schema after the initial Supabase
-- security migration, so this file keeps the Supabase policy surface current.
-- =========================================================

begin;

drop trigger if exists set_client_invitations_updated_at on public.client_invitations;
create trigger set_client_invitations_updated_at
before update on public.client_invitations
for each row
execute function public.set_updated_at();

alter table public.client_invitations enable row level security;
alter table public.project_activity enable row level security;
alter table public.project_view_events enable row level security;

grant select, insert, update, delete on public.client_invitations to authenticated;
grant select, insert, update, delete on public.project_activity to authenticated;
grant select, insert, update, delete on public.project_view_events to authenticated;

drop policy if exists "Admins can manage client invitations" on public.client_invitations;
drop policy if exists "Users can read own client invitations" on public.client_invitations;

drop policy if exists "Admins can manage project activity" on public.project_activity;
drop policy if exists "Clients can read assigned project activity" on public.project_activity;

drop policy if exists "Admins can manage project view events" on public.project_view_events;
drop policy if exists "Clients can manage own project view events" on public.project_view_events;

-- =========================================================
-- CLIENT INVITATIONS
-- =========================================================

create policy "Admins can manage client invitations"
on public.client_invitations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read own client invitations"
on public.client_invitations
for select
to authenticated
using (
  email = (
    select au.email
    from auth.users au
    where au.id = auth.uid()
  )
);

-- =========================================================
-- PROJECT ACTIVITY
-- =========================================================

create policy "Admins can manage project activity"
on public.project_activity
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned project activity"
on public.project_activity
for select
to authenticated
using (public.is_client_assigned_to_project(project_id));

-- =========================================================
-- PROJECT VIEW EVENTS
-- =========================================================

create policy "Admins can manage project view events"
on public.project_view_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can manage own project view events"
on public.project_view_events
for all
to authenticated
using (
  user_id = auth.uid()
  and public.is_client_assigned_to_project(project_id)
)
with check (
  user_id = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

commit;
