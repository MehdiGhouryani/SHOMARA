create table if not exists public.learning_identities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete set null,
  display_name text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','DELETED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists learning_identities_active_account_uq
on public.learning_identities(account_id)
where account_id is not null and status = 'ACTIVE';

create table if not exists public.client_installations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete restrict,
  learning_identity_id uuid references public.learning_identities(id) on delete set null,
  platform text not null check (platform in ('WEB','IOS','ANDROID')),
  app_version text,
  device_model text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','REVOKED')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_installation_id uuid not null references public.client_installations(id) on delete restrict,
  provider text not null,
  token text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','REVOKED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, token)
);

create trigger learning_identities_touch_updated_at
before update on public.learning_identities
for each row execute function public.touch_updated_at();

alter table public.learning_identities enable row level security;
alter table public.client_installations enable row level security;
alter table public.push_subscriptions enable row level security;

create policy learning_identity_self_select on public.learning_identities
for select to authenticated
using (account_id = auth.uid() or public.is_admin());

create policy learning_identity_self_update on public.learning_identities
for update to authenticated
using (account_id = auth.uid() or public.is_admin())
with check (account_id = auth.uid() or public.is_admin());

create policy client_installation_owner_rw on public.client_installations
for all to authenticated
using (account_id = auth.uid() or public.is_admin())
with check (account_id = auth.uid() or public.is_admin());

create policy push_subscription_owner_rw on public.push_subscriptions
for all to authenticated
using (exists (
  select 1 from public.client_installations ci
  where ci.id = push_subscriptions.client_installation_id
    and (ci.account_id = auth.uid() or public.is_admin())
))
with check (exists (
  select 1 from public.client_installations ci
  where ci.id = push_subscriptions.client_installation_id
    and (ci.account_id = auth.uid() or public.is_admin())
));
