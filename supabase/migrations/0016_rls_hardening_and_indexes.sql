create index if not exists evidence_identity_time_idx on public.evidence(learning_identity_id, occurred_at desc);
create index if not exists evidence_skill_time_idx on public.evidence(skill_id, occurred_at desc);
create index if not exists sessions_identity_time_idx on public.sessions(learning_identity_id, created_at desc);
create index if not exists encounters_session_seq_idx on public.encounters(session_id, sequence);
create index if not exists answers_attempt_time_idx on public.answers(attempt_id, submitted_at);
create index if not exists events_identity_time_idx on public.events(learning_identity_id, recorded_at desc);
create index if not exists client_installations_account_status_idx on public.client_installations(account_id, status);
create index if not exists learning_states_identity_idx on public.learning_states(learning_identity_id, skill_id, relationship_context_id);
create index if not exists assignments_class_status_idx on public.assignments(class_id, status);
create index if not exists assignment_instances_learner_status_idx on public.assignment_instances(learning_identity_id, execution_state);
create index if not exists entitlements_identity_status_idx on public.entitlements(learning_identity_id, status, expires_at);

create or replace function public.is_entitled_to_package(p_learning_identity_id uuid, p_package_scope jsonb)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.entitlements e
    where (e.learning_identity_id = p_learning_identity_id or e.account_id = auth.uid())
      and e.status = 'ACTIVE'
      and e.starts_at <= now()
      and (e.expires_at is null or e.expires_at > now())
      and e.scope @> p_package_scope
  );
$$;

revoke all on function public.is_entitled_to_package(uuid,jsonb) from public;
grant execute on function public.is_entitled_to_package(uuid,jsonb) to authenticated;
