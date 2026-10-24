-- Migration 0048: Teacher Authentication Mapping & Credentials
-- Provides safe mapping between unique username and auth.users/accounts with TEACHER role.
-- No passwords or hashes are stored in public database tables.

create table if not exists public.teacher_credentials (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  username text not null,
  application_id uuid references public.teacher_applications(id) on delete set null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_teacher_credentials_account unique (account_id),
  constraint uq_teacher_credentials_username unique (username)
);

-- Case-insensitive index for fast and safe unique username lookups
create unique index if not exists idx_teacher_credentials_username_lower
on public.teacher_credentials (lower(username));

-- Trigger for updated_at
create trigger teacher_credentials_touch_updated_at
before update on public.teacher_credentials
for each row execute function public.touch_updated_at();

-- Enable RLS
alter table public.teacher_credentials enable row level security;

-- Policy: authenticated teachers can view their own credential mapping
create policy teacher_credentials_self_select on public.teacher_credentials
for select to authenticated
using (account_id = auth.uid() or public.is_admin());

-- Policy: only admin can modify credential mappings
create policy teacher_credentials_admin_write on public.teacher_credentials
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
