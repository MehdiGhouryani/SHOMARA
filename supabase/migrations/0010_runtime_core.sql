create table if not exists public.mission_instances (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  objective_id uuid references public.learning_objectives(id) on delete restrict,
  source_context jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','ABANDONED')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  mission_instance_id uuid references public.mission_instances(id) on delete restrict,
  grade_id uuid not null references public.grades(id) on delete restrict,
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete restrict,
  skill_graph_version_id uuid not null references public.skill_graph_versions(id) on delete restrict,
  relationship_context_id uuid not null references public.relationship_contexts(id) on delete restrict,
  created_by_client_installation_id uuid references public.client_installations(id) on delete set null,
  last_resumed_by_client_installation_id uuid references public.client_installations(id) on delete set null,
  session_type text not null check (session_type in ('LEARNING','DIAGNOSTIC','RECOVERY','REVIEW')),
  status text not null default 'CREATED' check (status in ('CREATED','ACTIVE','INTERRUPTED','COMPLETED','ABANDONED')),
  resume_token text,
  started_at timestamptz,
  last_activity_at timestamptz,
  completed_at timestamptz,
  abandoned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encounters (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete restrict,
  sequence int not null,
  station_id uuid references public.stations(id) on delete restrict,
  skill_id uuid references public.skills(id) on delete restrict,
  learning_objective_id uuid references public.learning_objectives(id) on delete restrict,
  content_version_id uuid references public.content_versions(id) on delete restrict,
  learning_role text not null check (learning_role in ('DIAGNOSTIC_PROBE','INSTRUCTION','GUIDED_PRACTICE','INDEPENDENT_PRACTICE','REVIEW','TRANSFER','MASTERY_CHECK')),
  experience_form text not null check (experience_form in ('STORY','PUZZLE','CHALLENGE','BOSS','BUILD_EXPLORE','CONVERSATION_EXPLANATION','MINI_GAME')),
  status text not null default 'CREATED' check (status in ('CREATED','PRESENTED','IN_PROGRESS','COMPLETED','ABANDONED')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(session_id, sequence)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete restrict,
  attempt_number int not null check (attempt_number > 0),
  client_idempotency_key text not null,
  evaluator_version text not null,
  status text not null default 'CREATED' check (status in ('CREATED','SUBMITTED','EVALUATED','REJECTED')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique(encounter_id, attempt_number),
  unique(client_idempotency_key)
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete restrict,
  answer_index int not null,
  answer_payload jsonb not null,
  submitted_at timestamptz not null default now(),
  unique(attempt_id, answer_index)
);

create trigger sessions_touch_updated_at
before update on public.sessions
for each row execute function public.touch_updated_at();

alter table public.mission_instances enable row level security;
alter table public.sessions enable row level security;
alter table public.encounters enable row level security;
alter table public.attempts enable row level security;
alter table public.answers enable row level security;

create policy mission_self_access on public.mission_instances for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy session_self_access on public.sessions for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy encounter_session_access on public.encounters for select to authenticated using (exists (select 1 from public.sessions s where s.id = encounters.session_id and public.can_access_learning_identity(s.learning_identity_id)));
create policy attempt_session_access on public.attempts for select to authenticated using (exists (select 1 from public.encounters e join public.sessions s on s.id=e.session_id where e.id=attempts.encounter_id and public.can_access_learning_identity(s.learning_identity_id)));
create policy answer_session_access on public.answers for select to authenticated using (exists (select 1 from public.attempts a join public.encounters e on e.id=a.encounter_id join public.sessions s on s.id=e.session_id where a.id=answers.attempt_id and public.can_access_learning_identity(s.learning_identity_id)));

create policy session_child_insert on public.sessions for insert to authenticated
with check (exists (select 1 from public.learning_identities li where li.id=learning_identity_id and li.account_id=auth.uid()));
create policy attempt_child_insert on public.attempts for insert to authenticated
with check (exists (select 1 from public.encounters e join public.sessions s on s.id=e.session_id join public.learning_identities li on li.id=s.learning_identity_id where e.id=encounter_id and li.account_id=auth.uid()));
create policy answer_child_insert on public.answers for insert to authenticated
with check (exists (select 1 from public.attempts a join public.encounters e on e.id=a.encounter_id join public.sessions s on s.id=e.session_id join public.learning_identities li on li.id=s.learning_identity_id where a.id=attempt_id and li.account_id=auth.uid()));

create policy runtime_admin_write on public.mission_instances for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy runtime_admin_update_sessions on public.sessions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy runtime_admin_write_encounters on public.encounters for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy runtime_admin_write_attempts on public.attempts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy runtime_admin_write_answers on public.answers for all to authenticated using (public.is_admin()) with check (public.is_admin());
