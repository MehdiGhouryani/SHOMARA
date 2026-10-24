create table if not exists public.learning_decisions (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  target_skill_id uuid references public.skills(id) on delete restrict,
  target_objective_id uuid references public.learning_objectives(id) on delete restrict,
  relationship_context_id uuid not null references public.relationship_contexts(id) on delete restrict,
  objective_context text,
  goal_refs jsonb not null default '[]'::jsonb,
  input_state_snapshot jsonb not null default '{}'::jsonb,
  evidence_refs jsonb not null default '[]'::jsonb,
  interpretation_refs jsonb not null default '[]'::jsonb,
  generation_version text not null,
  applicable_constraints jsonb not null default '[]'::jsonb,
  arbitration_result jsonb not null default '{}'::jsonb,
  selected_step jsonb not null default '{}'::jsonb,
  decision_policy_version text not null,
  actor_type text not null default 'SYSTEM' check (actor_type in ('SYSTEM','TEACHER','PARENT','ADMIN')),
  status text not null default 'SELECTED' check (status in ('CANDIDATE','SELECTED','CONFLICT','DEFERRED','SUPERSEDED')),
  created_at timestamptz not null default now(),
  supersedes_ref uuid references public.learning_decisions(id) on delete restrict
);

create table if not exists public.learning_plans (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.learning_decisions(id) on delete restrict,
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  plan_payload jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','CANCELLED','SUPERSEDED')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.learning_decisions enable row level security;
alter table public.learning_plans enable row level security;

create policy decisions_access on public.learning_decisions for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy plans_access on public.learning_plans for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy decisions_admin_write on public.learning_decisions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy plans_admin_write on public.learning_plans for all to authenticated using (public.is_admin()) with check (public.is_admin());
