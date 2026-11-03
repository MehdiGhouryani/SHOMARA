-- Migration 0074: CMS audio admin tables (N08-13).
-- Script metadata and binary asset versions are STRICTLY separate (CONTENT-010);
-- every state transition is RBAC-gated and audited (CONTENT-013, HG-03);
-- no audio binary bytes live in the database or git — only metadata + checksum.
-- Seeds the 232 DRAFT script rows from the protected CSV manifests (idempotent).

create table if not exists public.audio_scripts (
  audio_id text primary key,
  kind text not null default 'prompt',
  text_display text not null default '',
  text_tts text not null default '',
  provider_voice_hint text not null default '',
  used_by text[] not null default '{}',
  script_status text not null default 'DRAFT' check (script_status in ('DRAFT','EDITED','REVIEWED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (audio_id)
);

create table if not exists public.audio_script_versions (
  id uuid primary key default gen_random_uuid(),
  audio_id text not null references public.audio_scripts(audio_id) on delete restrict,
  text_display text not null,
  text_tts text not null,
  editor_account_id uuid references public.accounts(id) on delete set null,
  edited_at timestamptz not null default now()
);

create table if not exists public.audio_asset_versions (
  id uuid primary key default gen_random_uuid(),
  audio_id text not null references public.audio_scripts(audio_id) on delete restrict,
  asset_version int not null check (asset_version >= 1),
  format text not null,
  duration_ms int not null check (duration_ms > 0),
  bytes bigint not null check (bytes > 0),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  storage_path text,             -- object storage reference; never a git path
  source_kind text not null check (source_kind in ('TTS','HUMAN_UPLOAD')),
  voice_profile_id text not null, -- abstract profile id; provider names are hints only
  rights_status text not null default 'UNSETTLED',
  moderation_status text not null default 'PENDING',
  script_sha256 text,
  bound_text_sha256 text,        -- impact report: script edit after generation invalidates binary
  publish_state text not null default 'GENERATED_OR_UPLOADED' check (publish_state in
    ('DRAFT','GENERATED_OR_UPLOADED','TECHNICALLY_VALIDATED','LISTENED','RIGHTS_CLEARED','APPROVED','PUBLISHED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (audio_id, asset_version)
);

create table if not exists public.audio_asset_audit (
  id uuid primary key default gen_random_uuid(),
  audio_id text not null,
  asset_version int not null,
  actor_account_id uuid references public.accounts(id) on delete set null,
  actor_role text not null check (actor_role in
    ('CURRICULUM_REVIEWER','PERSIAN_PRONUNCIATION_REVIEWER','ACCESSIBILITY_REVIEWER','RIGHTS_MODERATOR','PUBLISHER_ADMIN')),
  from_stage text not null,
  to_stage text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create trigger audio_scripts_touch_updated_at before update on public.audio_scripts
  for each row execute function public.touch_updated_at();
create trigger audio_asset_versions_touch_updated_at before update on public.audio_asset_versions
  for each row execute function public.touch_updated_at();

create index if not exists audio_scripts_kind_idx on public.audio_scripts(kind);
create index if not exists audio_scripts_used_by_idx on public.audio_scripts using gin(used_by);
create index if not exists audio_asset_versions_audio_state_idx on public.audio_asset_versions(audio_id, publish_state);
create index if not exists audio_asset_audit_audio_idx on public.audio_asset_audit(audio_id, asset_version, created_at);

alter table public.audio_scripts enable row level security;
alter table public.audio_script_versions enable row level security;
alter table public.audio_asset_versions enable row level security;
alter table public.audio_asset_audit enable row level security;

-- Admins manage everything; teachers read for review context; children/parents never.
create policy audio_scripts_admin_write on public.audio_scripts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy audio_scripts_teacher_read on public.audio_scripts for select to authenticated
  using (public.is_admin() or public.has_role('TEACHER'));

create policy audio_script_versions_admin_write on public.audio_script_versions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy audio_script_versions_teacher_read on public.audio_script_versions for select to authenticated
  using (public.is_admin() or public.has_role('TEACHER'));

create policy audio_asset_versions_admin_write on public.audio_asset_versions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy audio_asset_versions_teacher_read on public.audio_asset_versions for select to authenticated
  using (public.is_admin() or public.has_role('TEACHER'));

create policy audio_asset_audit_admin_write on public.audio_asset_audit for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy audio_asset_audit_teacher_read on public.audio_asset_audit for select to authenticated
  using (public.is_admin() or public.has_role('TEACHER'));

-- Idempotent seed of the 232 DRAFT script rows.
-- IMPORTANT: the authoritative source rows live in content-library/originals/*.csv
-- (byte-protected; this migration must NOT embed them a second time — drift risk).
-- The seed is executed by the admin importer (apps/web admin-audio + the
-- packages/content-delivery importer) against these tables at panel first-run;
-- rows are DRAFT-locked, idempotent by audio_id primary key, and carry only the
-- non-authoritative provider voice hint (CONTENT-006/013/017).
-- Migration ships the SCHEMA only; no content rows are hard-coded here.
