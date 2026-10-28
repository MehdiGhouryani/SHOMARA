create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_account_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select id from public.accounts where id = auth.uid();
$$;

create or replace function public.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.account_roles ar
    where ar.account_id = auth.uid()
      and ar.role = p_role
      and ar.status = 'ACTIVE'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select public.has_role('ADMIN');
$$;
