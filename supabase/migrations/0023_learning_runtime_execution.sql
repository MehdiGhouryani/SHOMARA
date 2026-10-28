-- Phase 5 — executable learning runtime persistence contract.
-- Historical facts remain append-only; authoritative transitions are server-side.

alter table public.attempts
  add column if not exists evaluation_payload jsonb,
  add column if not exists score numeric,
  add column if not exists max_score numeric,
  add column if not exists accepted boolean,
  add column if not exists evaluated_at timestamptz;

create table if not exists public.station_check_results (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  station_id uuid not null references public.stations(id) on delete restrict,
  session_id uuid not null references public.sessions(id) on delete restrict,
  encounter_id uuid not null references public.encounters(id) on delete restrict,
  attempt_id uuid not null references public.attempts(id) on delete restrict,
  correct_count int not null check (correct_count >= 0),
  total_count int not null check (total_count > 0),
  passed_check boolean not null,
  created_at timestamptz not null default now(),
  unique(attempt_id)
);

create index if not exists station_check_results_identity_station_idx
  on public.station_check_results(learning_identity_id, station_id, created_at desc);

alter table public.station_check_results enable row level security;

create policy station_check_results_access on public.station_check_results
for select to authenticated
using (public.can_access_learning_identity(learning_identity_id));

create policy station_check_results_admin_write on public.station_check_results
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Client must never directly finalize evaluation, Learning State, or Station Pass.
revoke insert, update, delete on public.evidence from authenticated;
revoke insert, update, delete on public.learning_states from authenticated;
revoke insert, update, delete on public.station_check_results from authenticated;

create index if not exists attempts_encounter_submitted_idx on public.attempts(encounter_id, submitted_at desc);
create index if not exists evidence_attempt_idx on public.evidence(attempt_id);
