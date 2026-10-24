create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  code text not null unique,
  version text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.diagnostic_probes (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.diagnostics(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  content_version_id uuid not null references public.content_versions(id) on delete restrict,
  sequence int not null,
  weight numeric not null default 1 check (weight > 0),
  unique (diagnostic_id, sequence)
);

create table if not exists public.progression_configs (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  version text not null,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  unique (grade_id, version)
);

create table if not exists public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_type text not null,
  version text not null,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  unique (policy_type, version)
);

alter table public.diagnostics enable row level security;
alter table public.diagnostic_probes enable row level security;
alter table public.progression_configs enable row level security;
alter table public.policy_versions enable row level security;

create policy diagnostic_read on public.diagnostics for select to authenticated using (status = 'ACTIVE' or public.is_admin());
create policy probe_read on public.diagnostic_probes for select to authenticated using (exists (select 1 from public.diagnostics d where d.id = diagnostic_probes.diagnostic_id and d.status = 'ACTIVE') or public.is_admin());
create policy progression_config_read on public.progression_configs for select to authenticated using (status = 'ACTIVE' or public.is_admin());
create policy policy_versions_read on public.policy_versions for select to authenticated using (status = 'ACTIVE' or public.is_admin());

create policy diagnostic_admin_write on public.diagnostics for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy probe_admin_write on public.diagnostic_probes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy progression_config_admin_write on public.progression_configs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy policy_versions_admin_write on public.policy_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
