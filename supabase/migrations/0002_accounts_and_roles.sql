create table if not exists public.accounts (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','DELETED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_roles (
  account_id uuid not null references public.accounts(id) on delete restrict,
  role text not null check (role in ('CHILD','PARENT','TEACHER','ADMIN')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','REVOKED')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (account_id, role)
);

create trigger accounts_touch_updated_at
before update on public.accounts
for each row execute function public.touch_updated_at();

alter table public.accounts enable row level security;
alter table public.account_roles enable row level security;

create policy accounts_self_select on public.accounts
for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy accounts_self_update on public.accounts
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy account_roles_self_select on public.account_roles
for select to authenticated
using (account_id = auth.uid() or public.is_admin());

create policy account_roles_admin_write on public.account_roles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
