begin;

alter table public.project_file_cleanup_jobs enable row level security;

revoke insert, update, delete on public.project_files from authenticated;
grant select on public.project_files to authenticated;

revoke all on public.project_file_cleanup_jobs from authenticated;

drop policy if exists "Clients can read assigned visible project files" on public.project_files;

create policy "Clients can read assigned visible clean project files"
on public.project_files
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and is_visible_to_client = true
  and scan_status = 'clean'
  and public.is_client_assigned_to_project(project_id)
);

update storage.buckets
set public = false
where id = 'project-files';

drop policy if exists "Admins can manage project file objects" on storage.objects;
drop policy if exists "Clients can read assigned project file objects" on storage.objects;

commit;
