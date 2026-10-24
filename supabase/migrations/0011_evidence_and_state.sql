create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  session_id uuid references public.sessions(id) on delete restrict,
  encounter_id uuid references public.encounters(id) on delete restrict,
  attempt_id uuid references public.attempts(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  content_version_id uuid references public.content_versions(id) on delete restrict,
  relationship_context_id uuid not null references public.relationship_contexts(id) on delete restrict,
  evidence_type text not null,
  quality text not null default 'USABLE' check (quality in ('UNREVIEWED','USABLE','LIMITED','RETRACTED')),
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_validity_records (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.evidence(id) on delete restrict,
  validity_status text not null check (validity_status in ('USABLE','LIMITED','RETRACTED')),
  reason text,
  actor_account_id uuid references public.accounts(id) on delete restrict,
  policy_ref text,
  recorded_at timestamptz not null default now(),
  supersedes_ref uuid references public.evidence_validity_records(id) on delete restrict
);

create table if not exists public.interpretations (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.evidence(id) on delete restrict,
  error_hypothesis text,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_states (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  relationship_context_id uuid not null references public.relationship_contexts(id) on delete restrict,
  state text not null check (state in ('UNKNOWN','BUILDING','STRONG','NEEDS_REVIEW')),
  revision bigint not null default 1,
  retention_state text not null default 'FRESH' check (retention_state in ('FRESH','REVIEW_DUE','AT_RISK')),
  last_evidence_at timestamptz,
  active_mastery_evaluation_ref uuid,
  current_interpretation_refs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(learning_identity_id, skill_id, relationship_context_id)
);

create trigger learning_states_touch_updated_at
before update on public.learning_states
for each row execute function public.touch_updated_at();

alter table public.evidence enable row level security;
alter table public.evidence_validity_records enable row level security;
alter table public.interpretations enable row level security;
alter table public.learning_states enable row level security;

create policy evidence_access on public.evidence for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy evidence_insert_owner on public.evidence for insert to authenticated with check (exists (select 1 from public.learning_identities li where li.id=evidence.learning_identity_id and li.account_id=auth.uid()) or public.is_admin());
create policy validity_access on public.evidence_validity_records for select to authenticated using (exists (select 1 from public.evidence e where e.id=evidence_validity_records.evidence_id and public.can_access_learning_identity(e.learning_identity_id)) or public.is_admin());
create policy interpretations_access on public.interpretations for select to authenticated using (exists (select 1 from public.evidence e where e.id=interpretations.evidence_id and public.can_access_learning_identity(e.learning_identity_id)) or public.is_admin());
create policy learning_state_access on public.learning_states for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy learning_state_admin_write on public.learning_states for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy evidence_admin_write on public.evidence for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy validity_admin_write on public.evidence_validity_records for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy interpretations_admin_write on public.interpretations for all to authenticated using (public.is_admin()) with check (public.is_admin());
