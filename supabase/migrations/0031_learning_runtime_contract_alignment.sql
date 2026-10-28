-- Phase 12 — align persistent Learning Runtime schema with the canonical runtime contract.
-- The TypeScript LearningState/Decision records already expose these fields; the database
-- must persist them as first-class canonical state rather than silently dropping them.

alter table public.learning_states
  add column if not exists confidence numeric(6,5),
  add column if not exists uncertainty numeric(6,5),
  add column if not exists review_need boolean not null default false,
  add column if not exists recovery_need boolean not null default false;

update public.learning_states
set
  confidence = coalesce(confidence, case state when 'STRONG' then 0.90 when 'BUILDING' then 0.60 when 'NEEDS_REVIEW' then 0.20 else 0 end),
  uncertainty = coalesce(uncertainty, case state when 'STRONG' then 0.10 when 'BUILDING' then 0.40 when 'NEEDS_REVIEW' then 0.80 else 1 end),
  review_need = coalesce(review_need, state = 'NEEDS_REVIEW'),
  recovery_need = coalesce(recovery_need, state = 'NEEDS_REVIEW')
where confidence is null or uncertainty is null;

alter table public.learning_states
  alter column confidence set not null,
  alter column uncertainty set not null;

alter table public.learning_states
  add constraint learning_states_confidence_range check (confidence >= 0 and confidence <= 1),
  add constraint learning_states_uncertainty_range check (uncertainty >= 0 and uncertainty <= 1);

alter table public.learning_decisions
  add column if not exists source_attempt_id uuid references public.attempts(id) on delete restrict;

create unique index if not exists learning_decisions_source_attempt_uq
  on public.learning_decisions(source_attempt_id)
  where source_attempt_id is not null;

create index if not exists learning_states_identity_skill_updated_idx
  on public.learning_states(learning_identity_id, skill_id, updated_at desc);

comment on column public.learning_states.confidence is 'Canonical runtime confidence derived from evidence/policy; bounded 0..1.';
comment on column public.learning_states.uncertainty is 'Canonical runtime uncertainty, currently 1 - confidence in the active V1 policy.';
comment on column public.learning_decisions.source_attempt_id is 'Authoritative causal reference to the runtime attempt that produced this decision.';
