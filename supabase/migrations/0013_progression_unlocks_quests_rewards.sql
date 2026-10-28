create table if not exists public.progression_milestones (
  id uuid primary key default gen_random_uuid(),
  progression_config_id uuid not null references public.progression_configs(id) on delete restrict,
  code text not null,
  condition jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','RETIRED')),
  unique(progression_config_id, code)
);

create table if not exists public.unlocks (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  progression_milestone_id uuid references public.progression_milestones(id) on delete restrict,
  unlock_type text not null,
  target_ref uuid,
  status text not null default 'GRANTED' check (status in ('GRANTED','REVOKED')),
  granted_at timestamptz not null default now(),
  unique(learning_identity_id, unlock_type, target_ref)
);

create table if not exists public.quest_definitions (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  code text not null,
  version text not null,
  quest_type text not null,
  target_config jsonb not null default '{}'::jsonb,
  condition jsonb not null default '{}'::jsonb,
  reward_config jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  unique(grade_id, code, version)
);

create table if not exists public.quest_instances (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  quest_definition_id uuid not null references public.quest_definitions(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','EXPIRED','CANCELLED')),
  progress jsonb not null default '{}'::jsonb,
  source_context jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.reward_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  reward_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED'))
);

create table if not exists public.reward_grants (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  reward_catalog_id uuid not null references public.reward_catalog(id) on delete restrict,
  source_type text not null,
  source_ref uuid,
  idempotency_key text not null unique,
  status text not null default 'PENDING' check (status in ('PENDING','GRANTED','FAILED')),
  granted_at timestamptz
);

alter table public.progression_milestones enable row level security;
alter table public.unlocks enable row level security;
alter table public.quest_definitions enable row level security;
alter table public.quest_instances enable row level security;
alter table public.reward_catalog enable row level security;
alter table public.reward_grants enable row level security;

create policy progression_read on public.progression_milestones for select to authenticated using (true);
create policy unlocks_access on public.unlocks for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy quest_definitions_read on public.quest_definitions for select to authenticated using (status='ACTIVE' or public.is_admin());
create policy quest_instances_access on public.quest_instances for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy reward_catalog_read on public.reward_catalog for select to authenticated using (status='ACTIVE' or public.is_admin());
create policy reward_grants_access on public.reward_grants for select to authenticated using (public.can_access_learning_identity(learning_identity_id));

create policy progression_admin_write on public.progression_milestones for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy unlocks_admin_write on public.unlocks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy quest_definitions_admin_write on public.quest_definitions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy quest_instances_admin_write on public.quest_instances for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy reward_catalog_admin_write on public.reward_catalog for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy reward_grants_admin_write on public.reward_grants for all to authenticated using (public.is_admin()) with check (public.is_admin());
