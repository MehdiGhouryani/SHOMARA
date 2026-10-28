create table if not exists public.content_artifacts (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  artifact_code text not null,
  artifact_type text not null check (artifact_type in ('INSTRUCTION','PRACTICE','CHECK','RECOVERY','EXPERIENCE','REWARD','AUDIO','IMAGE','ANIMATION')),
  station_id uuid references public.stations(id) on delete restrict,
  skill_id uuid references public.skills(id) on delete restrict,
  learning_objective_id uuid references public.learning_objectives(id) on delete restrict,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  created_at timestamptz not null default now(),
  unique (grade_id, artifact_code)
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_artifact_id uuid not null references public.content_artifacts(id) on delete restrict,
  version_number int not null check (version_number > 0),
  interaction_type text not null check (interaction_type in ('MULTIPLE_CHOICE','TAP','DRAG_DROP','SORT','COUNT','COLOR','NUMBER_LINE','MATCH','MINI_GAME')),
  experience_form text not null check (experience_form in ('STORY','PUZZLE','CHALLENGE','BOSS','BUILD_EXPLORE','CONVERSATION_EXPLANATION','MINI_GAME')),
  learning_role text not null check (learning_role in ('DIAGNOSTIC_PROBE','INSTRUCTION','GUIDED_PRACTICE','INDEPENDENT_PRACTICE','REVIEW','TRANSFER','MASTERY_CHECK')),
  prompt text,
  answer_schema jsonb not null default '{}'::jsonb,
  evaluator_config jsonb not null default '{}'::jsonb,
  feedback_config jsonb not null default '{}'::jsonb,
  hint_config jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED','QUARANTINED')),
  created_at timestamptz not null default now(),
  unique (content_artifact_id, version_number)
);

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  content_version_id uuid not null references public.content_versions(id) on delete restrict,
  storage_path text not null,
  asset_type text not null,
  checksum text not null,
  bytes bigint not null check (bytes >= 0),
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','RETIRED'))
);

alter table public.content_artifacts enable row level security;
alter table public.content_versions enable row level security;
alter table public.content_assets enable row level security;

create policy content_artifacts_read on public.content_artifacts for select to authenticated using (status = 'ACTIVE' or public.is_admin());
create policy content_versions_read on public.content_versions for select to authenticated using (status = 'ACTIVE' or public.is_admin());
create policy content_assets_read on public.content_assets for select to authenticated using (status = 'ACTIVE' or public.is_admin());

create policy content_artifacts_admin_write on public.content_artifacts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy content_versions_admin_write on public.content_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy content_assets_admin_write on public.content_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
