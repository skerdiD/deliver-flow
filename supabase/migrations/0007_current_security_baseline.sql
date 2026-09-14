-- =========================================================
-- DeliverFlow current Supabase security baseline
-- =========================================================
-- Apply after the complete Drizzle schema. This migration intentionally
-- restates the current end-state because the older SQL files mirror historical
-- Drizzle states (including the retired `admin` enum value).

begin;

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();
drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();
drop trigger if exists set_milestones_updated_at on public.milestones;
create trigger set_milestones_updated_at before update on public.milestones
for each row execute function public.set_updated_at();
drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks
for each row execute function public.set_updated_at();
drop trigger if exists set_project_updates_updated_at on public.project_updates;
create trigger set_project_updates_updated_at before update on public.project_updates
for each row execute function public.set_updated_at();
drop trigger if exists set_feedback_updated_at on public.feedback;
create trigger set_feedback_updated_at before update on public.feedback
for each row execute function public.set_updated_at();
drop trigger if exists set_approvals_updated_at on public.approvals;
create trigger set_approvals_updated_at before update on public.approvals
for each row execute function public.set_updated_at();
drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();
drop trigger if exists set_project_files_updated_at on public.project_files;
create trigger set_project_files_updated_at before update on public.project_files
for each row execute function public.set_updated_at();
drop trigger if exists set_client_invitations_updated_at on public.client_invitations;
create trigger set_client_invitations_updated_at before update on public.client_invitations
for each row execute function public.set_updated_at();
drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at before update on public.workspaces
for each row execute function public.set_updated_at();
drop trigger if exists set_admin_notes_updated_at on public.admin_notes;
create trigger set_admin_notes_updated_at before update on public.admin_notes
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_role public.app_role;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'invited_via' = 'deliverflow'
      then 'client'::public.app_role
    else 'owner'::public.app_role
  end;

  insert into public.workspaces (name, slug)
  values (
    coalesce(
      nullif(new.raw_user_meta_data ->> 'workspace_name', ''),
      nullif(new.raw_user_meta_data ->> 'company_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1),
      'Personal'
    ) || case
      when new.raw_user_meta_data ? 'workspace_name' then ''
      else ' Workspace'
    end,
    'workspace-' || replace(new.id::text, '-', '')
  )
  on conflict (slug) do update set updated_at = now()
  returning id into v_workspace_id;

  insert into public.profiles (
    id, workspace_id, email, full_name, role
  ) values (
    new.id,
    v_workspace_id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    v_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    workspace_id = coalesce(public.profiles.workspace_id, excluded.workspace_id),
    role = coalesce(public.profiles.role, excluded.role),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_workspace_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.is_workspace_admin(workspace_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'owner'
      and workspace_id = workspace_uuid
  );
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.clients c
  join public.profiles p
    on p.id = auth.uid() and p.workspace_id = c.workspace_id
  where c.profile_id = auth.uid()
    and c.status = 'active'
    and c.archived_at is null
    and c.deleted_at is null
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
      on c.id = pa.client_id and c.workspace_id = pa.workspace_id
    join public.projects p
      on p.id = pa.project_id and p.workspace_id = pa.workspace_id
    where pa.project_id = project_uuid
      and c.profile_id = auth.uid()
      and c.status = 'active'
      and c.archived_at is null
      and c.deleted_at is null
      and p.archived_at is null
      and p.deleted_at is null
      and pa.workspace_id = public.current_workspace_id()
  );
$$;

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
  set status = p_status,
      response_note = p_response_note,
      responded_by = auth.uid(),
      responded_at = now(),
      updated_at = now()
  where a.id = p_approval_id
    and a.status = 'pending'
    and a.workspace_id = public.current_workspace_id()
    and public.is_client_assigned_to_project(a.project_id)
  returning * into v_approval;

  if v_approval.id is null then
    raise exception 'Approval not found, already answered, or not available for this client.';
  end if;

  return v_approval;
end;
$$;

revoke all on function public.current_workspace_id() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_workspace_admin(uuid) from public, anon;
revoke all on function public.current_client_id() from public, anon;
revoke all on function public.is_client_assigned_to_project(uuid) from public, anon;
revoke all on function public.respond_to_approval(uuid, public.approval_status, text) from public, anon;
grant execute on function public.current_workspace_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_workspace_admin(uuid) to authenticated;
grant execute on function public.current_client_id() to authenticated;
grant execute on function public.is_client_assigned_to_project(uuid) to authenticated;
grant execute on function public.respond_to_approval(uuid, public.approval_status, text) to authenticated;

alter table public.workspaces enable row level security;
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
alter table public.client_invitations enable row level security;
alter table public.project_activity enable row level security;
alter table public.project_view_events enable row level security;
alter table public.admin_notes enable row level security;
alter table public.project_file_cleanup_jobs enable row level security;
alter table public.notifications enable row level security;

grant select, insert, update, delete on public.workspaces to authenticated;
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
grant select on public.project_files to authenticated;
revoke insert, update, delete on public.project_files from authenticated;
grant select, insert, update, delete on public.client_invitations to authenticated;
grant select, insert, update, delete on public.project_activity to authenticated;
grant select, insert, update, delete on public.project_view_events to authenticated;
grant select, insert, update, delete on public.admin_notes to authenticated;
revoke all on public.project_file_cleanup_jobs from authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

drop policy if exists "Workspace members can read workspace" on public.workspaces;
create policy "Workspace members can read workspace" on public.workspaces
for select to authenticated using (id = public.current_workspace_id());

drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Admins can manage profiles" on public.profiles
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Users can read own profile" on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists "Admins can manage clients" on public.clients;
drop policy if exists "Clients can read own client record" on public.clients;
create policy "Admins can manage clients" on public.clients
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read own client record" on public.clients
for select to authenticated
using (profile_id = auth.uid() and workspace_id = public.current_workspace_id());

drop policy if exists "Admins can manage projects" on public.projects;
drop policy if exists "Clients can read assigned projects" on public.projects;
create policy "Admins can manage projects" on public.projects
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned projects" on public.projects
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and public.is_client_assigned_to_project(id)
);

drop policy if exists "Admins can manage project assignments" on public.project_assignments;
drop policy if exists "Clients can read own project assignments" on public.project_assignments;
create policy "Admins can manage project assignments" on public.project_assignments
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read own project assignments" on public.project_assignments
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and client_id = public.current_client_id()
);

drop policy if exists "Admins can manage milestones" on public.milestones;
drop policy if exists "Clients can read assigned visible milestones" on public.milestones;
create policy "Admins can manage milestones" on public.milestones
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned visible milestones" on public.milestones
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage tasks" on public.tasks;
drop policy if exists "Clients can read assigned visible tasks" on public.tasks;
create policy "Admins can manage tasks" on public.tasks
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned visible tasks" on public.tasks
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and deleted_at is null
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage project updates" on public.project_updates;
drop policy if exists "Clients can read assigned visible project updates" on public.project_updates;
create policy "Admins can manage project updates" on public.project_updates
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned visible project updates" on public.project_updates
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage feedback" on public.feedback;
drop policy if exists "Clients can read assigned feedback" on public.feedback;
drop policy if exists "Clients can create feedback for assigned projects" on public.feedback;
create policy "Admins can manage feedback" on public.feedback
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned feedback" on public.feedback
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and client_id = public.current_client_id()
  and is_visible_to_client = true
  and archived_at is null
  and deleted_at is null
  and public.is_client_assigned_to_project(project_id)
);
create policy "Clients can create feedback for assigned projects" on public.feedback
for insert to authenticated
with check (
  workspace_id = public.current_workspace_id()
  and created_by = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage approvals" on public.approvals;
drop policy if exists "Clients can read assigned approvals" on public.approvals;
create policy "Admins can manage approvals" on public.approvals
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned approvals" on public.approvals
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and deleted_at is null
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage payments" on public.payments;
drop policy if exists "Clients can read assigned payments" on public.payments;
create policy "Admins can manage payments" on public.payments
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned payments" on public.payments
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and deleted_at is null
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage project files" on public.project_files;
drop policy if exists "Clients can read assigned visible project files" on public.project_files;
drop policy if exists "Clients can read assigned visible clean project files" on public.project_files;
create policy "Admins can manage project files" on public.project_files
for select to authenticated
using (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned visible clean project files" on public.project_files
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and scan_status = 'clean'
  and deleted_at is null
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage client invitations" on public.client_invitations;
drop policy if exists "Users can read own client invitations" on public.client_invitations;
create policy "Admins can manage client invitations" on public.client_invitations
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Users can read own client invitations" on public.client_invitations
for select to authenticated
using (
  email = (select au.email from auth.users au where au.id = auth.uid())
);

drop policy if exists "Admins can manage project activity" on public.project_activity;
drop policy if exists "Clients can read assigned project activity" on public.project_activity;
create policy "Admins can manage project activity" on public.project_activity
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can read assigned project activity" on public.project_activity
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage project view events" on public.project_view_events;
drop policy if exists "Clients can manage own project view events" on public.project_view_events;
create policy "Admins can manage project view events" on public.project_view_events
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Clients can manage own project view events" on public.project_view_events
for all to authenticated
using (
  workspace_id = public.current_workspace_id()
  and user_id = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
)
with check (
  workspace_id = public.current_workspace_id()
  and user_id = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage admin notes" on public.admin_notes;
create policy "Admins can manage admin notes" on public.admin_notes
for all to authenticated
using (
  public.is_workspace_admin(workspace_id) and created_by = auth.uid()
)
with check (
  public.is_workspace_admin(workspace_id) and created_by = auth.uid()
);

drop policy if exists "Admins can manage notifications" on public.notifications;
drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Admins can manage notifications" on public.notifications
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
create policy "Users can read own notifications" on public.notifications
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and recipient_profile_id = auth.uid()
);
create policy "Users can update own notifications" on public.notifications
for update to authenticated
using (
  workspace_id = public.current_workspace_id()
  and recipient_profile_id = auth.uid()
)
with check (
  workspace_id = public.current_workspace_id()
  and recipient_profile_id = auth.uid()
);

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do update set public = false;

-- Object access is deliberately absent for authenticated browser clients.
-- The Next.js server validates application authorization and creates short-lived
-- signed URLs with its server-only service-role client.
drop policy if exists "Admins can manage project file objects" on storage.objects;
drop policy if exists "Clients can read assigned project file objects" on storage.objects;

commit;
