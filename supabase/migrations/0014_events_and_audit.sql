create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid references public.learning_identities(id) on delete restrict,
  client_installation_id uuid references public.client_installations(id) on delete set null,
  event_type text not null,
  client_event_id text,
  payload jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  unique(client_installation_id, client_event_id, event_type)
);

create table if not exists public.audit_records (
  id uuid primary key default gen_random_uuid(),
  actor_account_id uuid references public.accounts(id) on delete restrict,
  resource_type text not null,
  resource_id uuid,
  action text not null,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.audit_records enable row level security;

create policy events_owner_select on public.events for select to authenticated using (learning_identity_id is null or public.can_access_learning_identity(learning_identity_id) or public.is_admin());
create policy audit_admin_select on public.audit_records for select to authenticated using (actor_account_id = auth.uid() or public.is_admin());
create policy events_admin_write on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy audit_admin_write on public.audit_records for all to authenticated using (public.is_admin()) with check (public.is_admin());
