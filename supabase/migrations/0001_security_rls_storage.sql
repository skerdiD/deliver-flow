-- =========================================================
-- DeliverFlow Supabase Security, RLS, Triggers, Storage
-- =========================================================
-- Run this AFTER Drizzle creates the tables.
-- Drizzle handles schema.
-- This file handles Supabase-specific security.
-- =========================================================

begin;

create extension if not exists "pgcrypto";

-- =========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists set_milestones_updated_at on public.milestones;
create trigger set_milestones_updated_at
before update on public.milestones
for each row
execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

drop trigger if exists set_project_updates_updated_at on public.project_updates;
create trigger set_project_updates_updated_at
before update on public.project_updates
for each row
execute function public.set_updated_at();

drop trigger if exists set_feedback_updated_at on public.feedback;
create trigger set_feedback_updated_at
before update on public.feedback
for each row
execute function public.set_updated_at();

drop trigger if exists set_approvals_updated_at on public.approvals;
create trigger set_approvals_updated_at
before update on public.approvals
for each row
execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

drop trigger if exists set_project_files_updated_at on public.project_files;
create trigger set_project_files_updated_at
before update on public.project_files
for each row
execute function public.set_updated_at();

-- =========================================================
-- AUTH PROFILE TRIGGER
-- =========================================================
-- New users default to client.
-- Admin role must be set manually or through trusted server logic.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    'client'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================================================
-- HELPER FUNCTIONS
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.clients
  where profile_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

create or replace function public.is_client_assigned_to_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_assignments pa
    join public.clients c
      on c.id = pa.client_id
    where pa.project_id = project_uuid
      and c.profile_id = auth.uid()
      and c.status = 'active'
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_client_id() to authenticated;
grant execute on function public.is_client_assigned_to_project(uuid) to authenticated;

-- =========================================================
-- CLIENT APPROVAL RESPONSE RPC
-- =========================================================

create or replace function public.respond_to_approval(
  p_approval_id uuid,
  p_status public.approval_status,
  p_response_note text default null
)
returns public.approvals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_approval public.approvals;
begin
  if p_status not in (
    'approved'::public.approval_status,
    'changes_requested'::public.approval_status
  ) then
    raise exception 'Approval response must be approved or changes_requested.';
  end if;

  update public.approvals a
  set
    status = p_status,
    response_note = p_response_note,
    responded_by = auth.uid(),
    responded_at = now(),
    updated_at = now()
  where a.id = p_approval_id
    and a.status = 'pending'
    and public.is_client_assigned_to_project(a.project_id)
  returning *
  into v_approval;

  if v_approval.id is null then
    raise exception 'Approval not found, already answered, or not available for this client.';
  end if;

  return v_approval;
end;
$$;

grant execute on function public.respond_to_approval(
  uuid,
  public.approval_status,
  text
) to authenticated;

-- =========================================================
-- ENABLE RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_assignments enable row level security;
alter table public.tasks enable row level security;
alter table public.milestones enable row level security;
alter table public.project_updates enable row level security;
alter table public.feedback enable row level security;
alter table public.approvals enable row level security;
alter table public.payments enable row level security;
alter table public.project_files enable row level security;

-- =========================================================
-- GRANTS
-- =========================================================

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_assignments to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.milestones to authenticated;
grant select, insert, update, delete on public.project_updates to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select, insert, update, delete on public.approvals to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.project_files to authenticated;

-- =========================================================
-- DROP OLD POLICIES
-- =========================================================

drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;

drop policy if exists "Admins can manage clients" on public.clients;
drop policy if exists "Clients can read own client record" on public.clients;

drop policy if exists "Admins can manage projects" on public.projects;
drop policy if exists "Clients can read assigned projects" on public.projects;

drop policy if exists "Admins can manage project assignments" on public.project_assignments;
drop policy if exists "Clients can read own project assignments" on public.project_assignments;

drop policy if exists "Admins can manage milestones" on public.milestones;
drop policy if exists "Clients can read assigned visible milestones" on public.milestones;

drop policy if exists "Admins can manage tasks" on public.tasks;
drop policy if exists "Clients can read assigned visible tasks" on public.tasks;

drop policy if exists "Admins can manage project updates" on public.project_updates;
drop policy if exists "Clients can read assigned visible project updates" on public.project_updates;

drop policy if exists "Admins can manage feedback" on public.feedback;
drop policy if exists "Clients can read assigned feedback" on public.feedback;
drop policy if exists "Clients can create feedback for assigned projects" on public.feedback;

drop policy if exists "Admins can manage approvals" on public.approvals;
drop policy if exists "Clients can read assigned approvals" on public.approvals;

drop policy if exists "Admins can manage payments" on public.payments;
drop policy if exists "Clients can read assigned payments" on public.payments;

drop policy if exists "Admins can manage project files" on public.project_files;
drop policy if exists "Clients can read assigned visible project files" on public.project_files;

-- =========================================================
-- PROFILES
-- =========================================================

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- =========================================================
-- CLIENTS
-- =========================================================

create policy "Admins can manage clients"
on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read own client record"
on public.clients
for select
to authenticated
using (profile_id = auth.uid());

-- =========================================================
-- PROJECTS
-- =========================================================

create policy "Admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned projects"
on public.projects
for select
to authenticated
using (public.is_client_assigned_to_project(id));

-- =========================================================
-- PROJECT ASSIGNMENTS
-- =========================================================

create policy "Admins can manage project assignments"
on public.project_assignments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read own project assignments"
on public.project_assignments
for select
to authenticated
using (client_id = public.current_client_id());

-- =========================================================
-- MILESTONES
-- =========================================================

create policy "Admins can manage milestones"
on public.milestones
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned visible milestones"
on public.milestones
for select
to authenticated
using (
  is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

-- =========================================================
-- TASKS
-- =========================================================

create policy "Admins can manage tasks"
on public.tasks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned visible tasks"
on public.tasks
for select
to authenticated
using (
  is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

-- =========================================================
-- PROJECT UPDATES
-- =========================================================

create policy "Admins can manage project updates"
on public.project_updates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned visible project updates"
on public.project_updates
for select
to authenticated
using (
  is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

-- =========================================================
-- FEEDBACK
-- =========================================================

create policy "Admins can manage feedback"
on public.feedback
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned feedback"
on public.feedback
for select
to authenticated
using (
  is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

create policy "Clients can create feedback for assigned projects"
on public.feedback
for insert
to authenticated
with check (
  created_by = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

-- =========================================================
-- APPROVALS
-- =========================================================

create policy "Admins can manage approvals"
on public.approvals
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned approvals"
on public.approvals
for select
to authenticated
using (public.is_client_assigned_to_project(project_id));

-- Clients should respond through:
-- select public.respond_to_approval('approval-id', 'approved', 'Looks good');
-- or:
-- select public.respond_to_approval('approval-id', 'changes_requested', 'Please adjust this');

-- =========================================================
-- PAYMENTS
-- =========================================================

create policy "Admins can manage payments"
on public.payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned payments"
on public.payments
for select
to authenticated
using (public.is_client_assigned_to_project(project_id));

-- =========================================================
-- PROJECT FILES
-- =========================================================

create policy "Admins can manage project files"
on public.project_files
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients can read assigned visible project files"
on public.project_files
for select
to authenticated
using (
  is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

-- =========================================================
-- STORAGE
-- =========================================================
-- Create the bucket from Supabase Dashboard if this insert fails.
-- Supabase sometimes restricts direct storage table changes.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'project-files',
  'project-files',
  false
)
on conflict (id) do nothing;

drop policy if exists "Admins can manage project file objects" on storage.objects;
drop policy if exists "Clients can read assigned project file objects" on storage.objects;

create policy "Admins can manage project file objects"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'project-files'
  and public.is_admin()
)
with check (
  bucket_id = 'project-files'
  and public.is_admin()
);

create policy "Clients can read assigned project file objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.project_files pf
    where pf.bucket_name = storage.objects.bucket_id
      and pf.storage_path = storage.objects.name
      and pf.is_visible_to_client = true
      and public.is_client_assigned_to_project(pf.project_id)
  )
);

commit;