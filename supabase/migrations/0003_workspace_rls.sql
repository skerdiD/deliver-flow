-- =========================================================
-- DeliverFlow workspace tenancy RLS
-- =========================================================

begin;

alter table public.workspaces enable row level security;
alter table public.admin_notes enable row level security;

grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.admin_notes to authenticated;

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

drop trigger if exists set_admin_notes_updated_at on public.admin_notes;
create trigger set_admin_notes_updated_at
before update on public.admin_notes
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
begin
  insert into public.workspaces (name, slug)
  values (
    coalesce(
      nullif(new.raw_user_meta_data ->> 'company_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1),
      'Personal'
    ) || ' Workspace',
    'workspace-' || replace(new.id::text, '-', '')
  )
  on conflict (slug) do update
  set updated_at = now()
  returning id into v_workspace_id;

  insert into public.profiles (
    id,
    workspace_id,
    email,
    full_name,
    role
  )
  values (
    new.id,
    v_workspace_id,
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
    workspace_id = coalesce(public.profiles.workspace_id, excluded.workspace_id),
    updated_at = now();

  return new;
end;
$$;

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
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
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
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
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
    on p.id = auth.uid()
   and p.workspace_id = c.workspace_id
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
      on c.id = pa.client_id
     and c.workspace_id = pa.workspace_id
    join public.projects p
      on p.id = pa.project_id
     and p.workspace_id = pa.workspace_id
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

grant execute on function public.current_workspace_id() to authenticated;
grant execute on function public.is_workspace_admin(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_client_id() to authenticated;
grant execute on function public.is_client_assigned_to_project(uuid) to authenticated;

drop policy if exists "Workspace members can read workspace" on public.workspaces;

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

drop policy if exists "Admins can manage client invitations" on public.client_invitations;
drop policy if exists "Users can read own client invitations" on public.client_invitations;

drop policy if exists "Admins can manage project activity" on public.project_activity;
drop policy if exists "Clients can read assigned project activity" on public.project_activity;

drop policy if exists "Admins can manage project view events" on public.project_view_events;
drop policy if exists "Clients can manage own project view events" on public.project_view_events;

drop policy if exists "Admins can manage admin notes" on public.admin_notes;

create policy "Workspace members can read workspace"
on public.workspaces
for select
to authenticated
using (id = public.current_workspace_id());

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Admins can manage clients"
on public.clients
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read own client record"
on public.clients
for select
to authenticated
using (
  profile_id = auth.uid()
  and workspace_id = public.current_workspace_id()
);

create policy "Admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned projects"
on public.projects
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and public.is_client_assigned_to_project(id)
);

create policy "Admins can manage project assignments"
on public.project_assignments
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read own project assignments"
on public.project_assignments
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and client_id = public.current_client_id()
);

create policy "Admins can manage milestones"
on public.milestones
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned visible milestones"
on public.milestones
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage tasks"
on public.tasks
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned visible tasks"
on public.tasks
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage project updates"
on public.project_updates
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned visible project updates"
on public.project_updates
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage feedback"
on public.feedback
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned feedback"
on public.feedback
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

create policy "Clients can create feedback for assigned projects"
on public.feedback
for insert
to authenticated
with check (
  workspace_id = public.current_workspace_id()
  and created_by = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage approvals"
on public.approvals
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned approvals"
on public.approvals
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage payments"
on public.payments
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned payments"
on public.payments
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage project files"
on public.project_files
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned visible project files"
on public.project_files
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage client invitations"
on public.client_invitations
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

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

create policy "Admins can manage project activity"
on public.project_activity
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can read assigned project activity"
on public.project_activity
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage project view events"
on public.project_view_events
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Clients can manage own project view events"
on public.project_view_events
for all
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and user_id = auth.uid()
  and public.is_client_assigned_to_project(project_id)
)
with check (
  workspace_id = public.current_workspace_id()
  and user_id = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

create policy "Admins can manage admin notes"
on public.admin_notes
for all
to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and created_by = auth.uid()
)
with check (
  public.is_workspace_admin(workspace_id)
  and created_by = auth.uid()
);

drop policy if exists "Admins can manage project file objects" on storage.objects;
drop policy if exists "Clients can read assigned project file objects" on storage.objects;

create policy "Admins can manage project file objects"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.project_files pf
    where pf.bucket_name = storage.objects.bucket_id
      and pf.storage_path = storage.objects.name
      and public.is_workspace_admin(pf.workspace_id)
  )
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
      and pf.workspace_id = public.current_workspace_id()
      and pf.is_visible_to_client = true
      and public.is_client_assigned_to_project(pf.project_id)
  )
);

commit;
