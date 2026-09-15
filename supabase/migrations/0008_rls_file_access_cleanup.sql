-- DeliverFlow RLS hardening and legacy file-state removal.
-- Apply after Drizzle migration 0012_majestic_mentallo.sql.

begin;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.is_profile_in_workspace(
  profile_uuid uuid,
  workspace_uuid uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select profile_uuid is null or exists (
    select 1 from public.profiles p
    where p.id = profile_uuid and p.workspace_id = workspace_uuid
  );
$$;

create or replace function public.is_project_in_workspace(
  project_uuid uuid,
  workspace_uuid uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = project_uuid and p.workspace_id = workspace_uuid
  );
$$;

create or replace function public.is_client_in_workspace(
  client_uuid uuid,
  workspace_uuid uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select client_uuid is null or exists (
    select 1 from public.clients c
    where c.id = client_uuid and c.workspace_id = workspace_uuid
  );
$$;

create or replace function public.is_milestone_in_project(
  milestone_uuid uuid,
  project_uuid uuid,
  workspace_uuid uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select milestone_uuid is null or exists (
    select 1 from public.milestones m
    where m.id = milestone_uuid
      and m.project_id = project_uuid
      and m.workspace_id = workspace_uuid
  );
$$;

create or replace function public.is_project_assignment_consistent(
  project_uuid uuid,
  client_uuid uuid,
  workspace_uuid uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_project_in_workspace(project_uuid, workspace_uuid)
    and coalesce(public.is_client_in_workspace(client_uuid, workspace_uuid), false);
$$;

revoke all on function public.is_profile_in_workspace(uuid, uuid) from public, anon;
revoke all on function public.is_project_in_workspace(uuid, uuid) from public, anon;
revoke all on function public.is_client_in_workspace(uuid, uuid) from public, anon;
revoke all on function public.is_milestone_in_project(uuid, uuid, uuid) from public, anon;
revoke all on function public.is_project_assignment_consistent(uuid, uuid, uuid) from public, anon;
grant execute on function public.is_profile_in_workspace(uuid, uuid) to authenticated;
grant execute on function public.is_project_in_workspace(uuid, uuid) to authenticated;
grant execute on function public.is_client_in_workspace(uuid, uuid) to authenticated;
grant execute on function public.is_milestone_in_project(uuid, uuid, uuid) to authenticated;
grant execute on function public.is_project_assignment_consistent(uuid, uuid, uuid) to authenticated;

-- Supabase may grant new public-schema tables to API roles by default. Keep anon
-- entirely outside the private application schema and narrow server-only tables.
revoke all on table
  public.workspaces,
  public.profiles,
  public.clients,
  public.projects,
  public.project_assignments,
  public.tasks,
  public.milestones,
  public.project_updates,
  public.feedback,
  public.approvals,
  public.payments,
  public.project_files,
  public.client_invitations,
  public.project_activity,
  public.project_view_events,
  public.admin_notes,
  public.project_file_cleanup_jobs,
  public.notifications
from public, anon;

revoke insert, update, delete on public.workspaces from authenticated;
revoke select on public.clients from authenticated;
grant select (
  id,
  workspace_id,
  profile_id,
  company_name,
  contact_name,
  email,
  phone,
  status,
  created_at,
  updated_at,
  archived_at,
  deleted_at
) on public.clients to authenticated;
revoke insert, update, delete on public.project_files from authenticated;
revoke all on public.project_file_cleanup_jobs from authenticated;
revoke insert, update, delete on public.project_view_events from authenticated;
revoke insert, update, delete on public.notifications from authenticated;
grant select on public.workspaces, public.project_files,
  public.project_view_events, public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles" on public.profiles
for all to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

drop policy if exists "Admins can manage clients" on public.clients;
create policy "Admins can manage clients" on public.clients
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_profile_in_workspace(profile_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_profile_in_workspace(profile_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
);

drop policy if exists "Clients can read own client record" on public.clients;
create policy "Clients can read own client record" on public.clients
for select to authenticated
using (
  profile_id = auth.uid()
  and workspace_id = public.current_workspace_id()
  and status = 'active'
  and archived_at is null
  and deleted_at is null
);

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects" on public.projects
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
);

drop policy if exists "Clients can read assigned projects" on public.projects;
create policy "Clients can read assigned projects" on public.projects
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and status <> 'archived'
  and archived_at is null
  and deleted_at is null
  and public.is_client_assigned_to_project(id)
);

drop policy if exists "Admins can manage project assignments" on public.project_assignments;
create policy "Admins can manage project assignments" on public.project_assignments
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_assignment_consistent(project_id, client_id, workspace_id)
  and public.is_profile_in_workspace(assigned_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_assignment_consistent(project_id, client_id, workspace_id)
  and public.is_profile_in_workspace(assigned_by, workspace_id)
);

drop policy if exists "Clients can read own project assignments" on public.project_assignments;
create policy "Clients can read own project assignments" on public.project_assignments
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage milestones" on public.milestones;
create policy "Admins can manage milestones" on public.milestones
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
);

drop policy if exists "Admins can manage tasks" on public.tasks;
create policy "Admins can manage tasks" on public.tasks
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_milestone_in_project(milestone_id, project_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_milestone_in_project(milestone_id, project_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
);

drop policy if exists "Clients can read assigned visible tasks" on public.tasks;
create policy "Clients can read assigned visible tasks" on public.tasks
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and deleted_at is null
  and public.is_milestone_in_project(milestone_id, project_id, workspace_id)
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage project updates" on public.project_updates;
create policy "Admins can manage project updates" on public.project_updates
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
);

drop policy if exists "Admins can manage feedback" on public.feedback;
create policy "Admins can manage feedback" on public.feedback
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_assignment_consistent(project_id, client_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_assignment_consistent(project_id, client_id, workspace_id)
  and public.is_profile_in_workspace(created_by, workspace_id)
);

drop policy if exists "Admins can manage approvals" on public.approvals;
create policy "Admins can manage approvals" on public.approvals
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_milestone_in_project(milestone_id, project_id, workspace_id)
  and public.is_profile_in_workspace(requested_by, workspace_id)
  and public.is_profile_in_workspace(responded_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_milestone_in_project(milestone_id, project_id, workspace_id)
  and public.is_profile_in_workspace(requested_by, workspace_id)
  and public.is_profile_in_workspace(responded_by, workspace_id)
);

drop policy if exists "Clients can read assigned approvals" on public.approvals;
create policy "Clients can read assigned approvals" on public.approvals
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and deleted_at is null
  and public.is_milestone_in_project(milestone_id, project_id, workspace_id)
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage payments" on public.payments;
create policy "Admins can manage payments" on public.payments
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
);

drop policy if exists "Clients can read assigned visible clean project files" on public.project_files;
drop policy if exists "Clients can read assigned visible project files" on public.project_files;
drop policy if exists "Admins can manage project files" on public.project_files;
create policy "Admins can manage project files" on public.project_files
for select to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_profile_in_workspace(uploaded_by, workspace_id)
);
create policy "Clients can read assigned visible project files" on public.project_files
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and deleted_at is null
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage client invitations" on public.client_invitations;
create policy "Admins can manage client invitations" on public.client_invitations
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_client_in_workspace(client_id, workspace_id)
  and public.is_profile_in_workspace(invited_by, workspace_id)
  and public.is_profile_in_workspace(accepted_by, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_client_in_workspace(client_id, workspace_id)
  and public.is_profile_in_workspace(invited_by, workspace_id)
  and public.is_profile_in_workspace(accepted_by, workspace_id)
);
drop policy if exists "Users can read own client invitations" on public.client_invitations;

drop policy if exists "Admins can manage project activity" on public.project_activity;
create policy "Admins can manage project activity" on public.project_activity
for all to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_profile_in_workspace(actor_id, workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_project_in_workspace(project_id, workspace_id)
  and public.is_profile_in_workspace(actor_id, workspace_id)
);

drop policy if exists "Clients can read assigned project activity" on public.project_activity;
create policy "Clients can read assigned project activity" on public.project_activity
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and public.is_profile_in_workspace(actor_id, workspace_id)
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage project view events" on public.project_view_events;
create policy "Admins can read project view events" on public.project_view_events
for select to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_project_assignment_consistent(project_id, client_id, workspace_id)
  and public.is_profile_in_workspace(user_id, workspace_id)
);
drop policy if exists "Clients can manage own project view events" on public.project_view_events;
create policy "Clients can read own project view events" on public.project_view_events
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and user_id = auth.uid()
  and client_id = public.current_client_id()
  and public.is_client_assigned_to_project(project_id)
);

drop policy if exists "Admins can manage notifications" on public.notifications;
create policy "Admins can read notifications" on public.notifications
for select to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_profile_in_workspace(recipient_profile_id, workspace_id)
  and public.is_profile_in_workspace(actor_profile_id, workspace_id)
  and (project_id is null or public.is_project_in_workspace(project_id, workspace_id))
);

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" on public.notifications
for select to authenticated
using (
  workspace_id = public.current_workspace_id()
  and recipient_profile_id = auth.uid()
  and public.is_profile_in_workspace(actor_profile_id, workspace_id)
  and (project_id is null or public.is_project_in_workspace(project_id, workspace_id))
);

-- A recipient may update only read_at because the table grant above is
-- column-scoped; privileged fields cannot be forged through the Data API.
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notification read state" on public.notifications
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

drop policy if exists "Admins can manage project file objects" on storage.objects;
drop policy if exists "Clients can read assigned project file objects" on storage.objects;

commit;
