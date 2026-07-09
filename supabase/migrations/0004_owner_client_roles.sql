-- =========================================================
-- DeliverFlow owner/client role model
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'app_role'
      and e.enumlabel = 'owner'
  ) then
    if exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public'
        and t.typname = 'app_role'
        and e.enumlabel = 'admin'
    ) then
      alter type public.app_role add value 'owner' before 'admin';
    else
      alter type public.app_role add value 'owner' before 'client';
    end if;
  end if;
end;
$$;

update public.profiles
set role = 'owner'
where role::text in ('admin', 'manager', 'staff');

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'project_activity_actor_role'
      and e.enumlabel = 'owner'
  ) then
    if exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public'
        and t.typname = 'project_activity_actor_role'
        and e.enumlabel = 'admin'
    ) then
      alter type public.project_activity_actor_role add value 'owner' before 'admin';
    else
      alter type public.project_activity_actor_role add value 'owner' before 'client';
    end if;
  end if;
end;
$$;

update public.project_activity
set actor_role = 'owner'
where actor_role::text = 'admin';

alter type public.app_role rename to app_role_old;
create type public.app_role as enum ('owner', 'client');
alter table public.profiles alter column role drop default;
alter table public.profiles
  alter column role type public.app_role using role::text::public.app_role;
alter table public.profiles alter column role set default 'client';
drop type public.app_role_old;

alter type public.project_activity_actor_role rename to project_activity_actor_role_old;
create type public.project_activity_actor_role as enum ('owner', 'client', 'system');
alter table public.project_activity alter column actor_role drop default;
alter table public.project_activity
  alter column actor_role type public.project_activity_actor_role
  using actor_role::text::public.project_activity_actor_role;
alter table public.project_activity alter column actor_role set default 'system';
drop type public.project_activity_actor_role_old;

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
    when new.raw_user_meta_data ->> 'invited_via' = 'deliverflow' then 'client'::public.app_role
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
    v_role
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    workspace_id = coalesce(public.profiles.workspace_id, excluded.workspace_id),
    role = coalesce(public.profiles.role, excluded.role),
    updated_at = now();

  return new;
end;
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
      and role = 'owner'
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
      and role = 'owner'
      and workspace_id = workspace_uuid
  );
$$;
