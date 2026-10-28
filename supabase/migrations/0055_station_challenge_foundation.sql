-- P04 — Station Challenge Foundation.
-- Challenge orchestration is downstream of Learning Runtime. These tables hold
-- challenge/run bookkeeping only; correctness, evidence, mastery, station pass,
-- and progression remain owned by runtime_submit_attempt and its projections.

create table if not exists public.station_challenge_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  version int not null check (version > 0),
  grade_id uuid not null references public.grades(id) on delete restrict,
  station_id uuid not null references public.stations(id) on delete restrict,
  game_code text not null,
  primary_skill_codes jsonb not null default '[]'::jsonb check (jsonb_typeof(primary_skill_codes) = 'array'),
  supporting_skill_codes jsonb not null default '[]'::jsonb check (jsonb_typeof(supporting_skill_codes) = 'array'),
  objective text not null,
  learning_role text not null check (learning_role in ('GUIDED_PRACTICE','INDEPENDENT_PRACTICE','REVIEW','TRANSFER')),
  rounds int not null check (rounds between 2 and 4),
  difficulty_policy jsonb not null default '{}'::jsonb,
  hint_policy jsonb not null default '{}'::jsonb,
  timer_policy text not null check (timer_policy in ('NONE','SOFT')),
  evaluator_version text not null,
  reward_policy jsonb not null default '{}'::jsonb,
  evidence_policy jsonb not null default '{}'::jsonb,
  estimated_duration_sec int not null check (estimated_duration_sec between 30 and 90),
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  created_at timestamptz not null default now(),
  unique (code, version)
);

create unique index if not exists station_challenge_one_active_per_station
  on public.station_challenge_definitions(station_id) where status = 'ACTIVE';

create table if not exists public.station_challenge_rounds (
  id uuid primary key default gen_random_uuid(),
  challenge_definition_id uuid not null references public.station_challenge_definitions(id) on delete restrict,
  round_index int not null check (round_index >= 0),
  skill_code text not null,
  unique (challenge_definition_id, round_index)
);

create table if not exists public.station_challenge_variants (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.station_challenge_rounds(id) on delete restrict,
  difficulty_level text not null check (difficulty_level in ('SUPPORTED','CORE','STRETCH')),
  content_version_id uuid not null references public.content_versions(id) on delete restrict,
  skill_code text not null,
  unique (round_id, difficulty_level)
);

create table if not exists public.station_challenge_runs (
  id uuid primary key default gen_random_uuid(),
  challenge_definition_id uuid not null references public.station_challenge_definitions(id) on delete restrict,
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  relationship_context_id uuid not null references public.relationship_contexts(id) on delete restrict,
  session_id uuid not null references public.sessions(id) on delete restrict,
  start_idempotency_key text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','ABANDONED')),
  current_round_index int not null default 0 check (current_round_index >= 0),
  result text check (result in ('COMPLETED','COMPLETED_WITH_SUPPORT','NOT_YET','ABANDONED')),
  reward_eligible boolean not null default false,
  reward_grant_key text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (learning_identity_id, start_idempotency_key)
);

create table if not exists public.station_challenge_round_states (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.station_challenge_runs(id) on delete restrict,
  round_index int not null check (round_index >= 0),
  skill_code text not null,
  start_level text not null check (start_level in ('SUPPORTED','CORE','STRETCH')),
  current_level text not null check (current_level in ('SUPPORTED','CORE','STRETCH')),
  attempt_count int not null default 0 check (attempt_count >= 0),
  wrong_attempt_count int not null default 0 check (wrong_attempt_count >= 0),
  hints_used int not null default 0 check (hints_used >= 0),
  scaffolded boolean not null default false,
  solved boolean not null default false,
  closed boolean not null default false,
  open_encounter_id uuid references public.encounters(id) on delete restrict,
  unique (run_id, round_index)
);

create table if not exists public.station_challenge_round_submissions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.station_challenge_runs(id) on delete restrict,
  round_index int not null check (round_index >= 0),
  attempt_number int not null check (attempt_number > 0),
  idempotency_key text not null,
  request_fingerprint text not null,
  runtime_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (run_id, idempotency_key),
  unique (run_id, round_index, attempt_number)
);

create table if not exists public.station_challenge_hint_receipts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.station_challenge_runs(id) on delete restrict,
  round_index int not null check (round_index >= 0),
  hint_index int not null check (hint_index >= 0),
  idempotency_key text not null,
  hint_level text not null check (hint_level in ('STRATEGY','REPRESENTATION','WORKED_STEP')),
  created_at timestamptz not null default now(),
  unique (run_id, idempotency_key),
  unique (run_id, round_index, hint_index)
);

-- This is an eligibility outbox, not the reward grant ledger. P07 consumes it
-- through the existing idempotent reward-grant boundary.
create table if not exists public.station_challenge_reward_eligibility (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  challenge_code text not null,
  run_id uuid not null references public.station_challenge_runs(id) on delete restrict,
  result text not null check (result in ('COMPLETED','COMPLETED_WITH_SUPPORT')),
  reward_grant_key text not null,
  status text not null default 'PENDING' check (status in ('PENDING','CONSUMED')),
  created_at timestamptz not null default now(),
  unique (learning_identity_id, challenge_code),
  unique (reward_grant_key)
);

create index if not exists station_challenge_runs_identity_idx on public.station_challenge_runs(learning_identity_id, started_at desc);
create index if not exists station_challenge_round_submissions_run_idx on public.station_challenge_round_submissions(run_id, round_index, attempt_number);

alter table public.station_challenge_definitions enable row level security;
alter table public.station_challenge_rounds enable row level security;
alter table public.station_challenge_variants enable row level security;
alter table public.station_challenge_runs enable row level security;
alter table public.station_challenge_round_states enable row level security;
alter table public.station_challenge_round_submissions enable row level security;
alter table public.station_challenge_hint_receipts enable row level security;
alter table public.station_challenge_reward_eligibility enable row level security;

create policy station_challenge_definition_active_read on public.station_challenge_definitions for select to authenticated using (status = 'ACTIVE');
create policy station_challenge_round_active_read on public.station_challenge_rounds for select to authenticated using (exists (select 1 from public.station_challenge_definitions d where d.id=challenge_definition_id and d.status='ACTIVE'));
create policy station_challenge_variant_active_read on public.station_challenge_variants for select to authenticated using (exists (select 1 from public.station_challenge_rounds r join public.station_challenge_definitions d on d.id=r.challenge_definition_id where r.id=round_id and d.status='ACTIVE'));
create policy station_challenge_run_self_read on public.station_challenge_runs for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy station_challenge_round_state_self_read on public.station_challenge_round_states for select to authenticated using (exists (select 1 from public.station_challenge_runs r where r.id=run_id and public.can_access_learning_identity(r.learning_identity_id)));
create policy station_challenge_submission_self_read on public.station_challenge_round_submissions for select to authenticated using (exists (select 1 from public.station_challenge_runs r where r.id=run_id and public.can_access_learning_identity(r.learning_identity_id)));
create policy station_challenge_hint_self_read on public.station_challenge_hint_receipts for select to authenticated using (exists (select 1 from public.station_challenge_runs r where r.id=run_id and public.can_access_learning_identity(r.learning_identity_id)));
create policy station_challenge_reward_self_read on public.station_challenge_reward_eligibility for select to authenticated using (public.can_access_learning_identity(learning_identity_id));

-- Explicit boundary: all writes happen inside security-definer challenge RPCs,
-- which must call runtime_submit_attempt for every round attempt. No client table writes.
revoke insert, update, delete on public.station_challenge_definitions from authenticated;
revoke insert, update, delete on public.station_challenge_rounds from authenticated;
revoke insert, update, delete on public.station_challenge_variants from authenticated;
revoke insert, update, delete on public.station_challenge_runs from authenticated;
revoke insert, update, delete on public.station_challenge_round_states from authenticated;
revoke insert, update, delete on public.station_challenge_round_submissions from authenticated;
revoke insert, update, delete on public.station_challenge_hint_receipts from authenticated;
revoke insert, update, delete on public.station_challenge_reward_eligibility from authenticated;

-- The exact RPC contract is intentionally narrow. Runtime implementation must
-- preserve the same idempotency/context/error semantics as the TS orchestrator.
create or replace function public.runtime_start_challenge(
  p_session_id uuid,
  p_challenge_definition_id uuid,
  p_start_idempotency_key text
) returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
begin
  if auth.uid() is null then raise exception using errcode='28000', message='AUTH_REQUIRED'; end if;
  if p_start_idempotency_key is null or length(trim(p_start_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  -- P04 schema boundary: the application service performs the definition/version
  -- validation, creates encounters through runtime_create_encounter, and persists
  -- this transaction with the same uniqueness constraints above.
  raise exception using errcode='0A000', message='CHALLENGE_RUNTIME_DEPLOYMENT_REQUIRED';
end;
$$;

create or replace function public.runtime_submit_challenge_round(
  p_run_id uuid,
  p_round_index integer,
  p_attempt_number integer,
  p_idempotency_key text,
  p_request_fingerprint text,
  p_answers jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
begin
  if auth.uid() is null then raise exception using errcode='28000', message='AUTH_REQUIRED'; end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers)=0 then raise exception using errcode='P0001', message='ANSWERS_REQUIRED'; end if;
  -- The implementation must lock the run/round, call runtime_submit_attempt,
  -- persist the returned JSON as the replayable result, then advance one round.
  raise exception using errcode='0A000', message='CHALLENGE_RUNTIME_DEPLOYMENT_REQUIRED';
end;
$$;

create or replace function public.runtime_request_challenge_hint(
  p_run_id uuid,
  p_round_index integer,
  p_hint_index integer,
  p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
begin
  if auth.uid() is null then raise exception using errcode='28000', message='AUTH_REQUIRED'; end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  raise exception using errcode='0A000', message='CHALLENGE_RUNTIME_DEPLOYMENT_REQUIRED';
end;
$$;

revoke all on function public.runtime_start_challenge(uuid,uuid,text) from public;
revoke all on function public.runtime_submit_challenge_round(uuid,integer,integer,text,text,jsonb) from public;
revoke all on function public.runtime_request_challenge_hint(uuid,integer,integer,text) from public;
 grant execute on function public.runtime_start_challenge(uuid,uuid,text) to authenticated;
 grant execute on function public.runtime_submit_challenge_round(uuid,integer,integer,text,text,jsonb) to authenticated;
 grant execute on function public.runtime_request_challenge_hint(uuid,integer,integer,text) to authenticated;
