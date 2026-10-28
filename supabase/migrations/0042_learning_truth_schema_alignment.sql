-- Phase 15 deep audit: align Learning Truth persistence with the canonical evidence/interpretation contract.
-- This migration is additive and intentionally does not change the operational Learning State vocabulary.

alter table public.evidence
  add column if not exists source_type text,
  add column if not exists actor_account_id uuid references public.accounts(id) on delete restrict,
  add column if not exists evidence_kind text,
  add column if not exists provenance jsonb not null default '{}'::jsonb,
  add column if not exists client_installation_id uuid references public.client_installations(id) on delete restrict,
  add column if not exists client_event_id text;

alter table public.interpretations
  add column if not exists status text not null default 'ACTIVE',
  add column if not exists interpretation_type text not null default 'STATE_SIGNAL',
  add column if not exists uncertainty numeric,
  add column if not exists basis jsonb not null default '{}'::jsonb,
  add column if not exists superseded_at timestamptz;

alter table public.interpretations
  add constraint interpretations_confidence_range_chk
  check (confidence is null or (confidence >= 0 and confidence <= 1));
alter table public.interpretations
  add constraint interpretations_uncertainty_range_chk
  check (uncertainty is null or (uncertainty >= 0 and uncertainty <= 1));
alter table public.interpretations
  add constraint interpretations_status_chk
  check (status in ('ACTIVE','SUPERSEDED'));
alter table public.interpretations
  add constraint interpretations_type_chk
  check (interpretation_type in ('STATE_SIGNAL','ERROR_PATTERN','OTHER'));

create table if not exists public.error_hypotheses (
  id uuid primary key default gen_random_uuid(),
  interpretation_id uuid not null references public.interpretations(id) on delete restrict,
  hypothesis_code text not null,
  status text not null default 'PROPOSED' check (status in ('PROPOSED','ACTIVE','REJECTED','SUPERSEDED','EXPIRED')),
  strength numeric check (strength is null or (strength >= 0 and strength <= 1)),
  reasoning jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists evidence_identity_occurred_idx
  on public.evidence(learning_identity_id, occurred_at desc);
create unique index if not exists evidence_client_event_unique_idx
  on public.evidence(learning_identity_id, client_event_id)
  where client_event_id is not null;
create index if not exists interpretations_evidence_status_idx
  on public.interpretations(evidence_id, status, created_at desc);
create index if not exists error_hypotheses_interpretation_idx
  on public.error_hypotheses(interpretation_id, created_at desc);

alter table public.error_hypotheses enable row level security;
revoke insert, update, delete on public.error_hypotheses from authenticated;
drop policy if exists error_hypotheses_access on public.error_hypotheses;
create policy error_hypotheses_access on public.error_hypotheses
for select to authenticated
using (
  exists (
    select 1
    from public.interpretations i
    join public.evidence e on e.id = i.evidence_id
    where i.id = error_hypotheses.interpretation_id
      and public.can_access_raw_learning_identity(e.learning_identity_id)
  )
  or public.is_admin()
);

alter table public.station_check_results
  add constraint station_check_results_check_group_chk
  check (check_group in ('STATION_PASS','RECOVERY_RECHECK','MASTERY_EVIDENCE','NON_PASS_GATE'));

-- Evidence must always have explicit provenance once created by the canonical runtime.
-- Legacy rows may remain null until backfilled; new RPC writes populate these columns.
