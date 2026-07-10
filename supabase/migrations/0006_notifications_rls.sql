begin;

alter table public.notifications enable row level security;

grant select, insert, update, delete on public.notifications to authenticated;

drop policy if exists "Admins can manage notifications" on public.notifications;
drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;

create policy "Admins can manage notifications"
on public.notifications
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and recipient_profile_id = auth.uid()
);

create policy "Users can update own notifications"
on public.notifications
for update
to authenticated
using (
  workspace_id = public.current_workspace_id()
  and recipient_profile_id = auth.uid()
)
with check (
  workspace_id = public.current_workspace_id()
  and recipient_profile_id = auth.uid()
);

commit;
