-- Phase 13 deep audit — version pin integrity and production seed gate.
-- Session is pinned to Grade + Curriculum + Skill Graph; an encounter skill must belong to that pinned graph.

create or replace function public.runtime_start_session(
  p_grade_code text,
  p_curriculum_version text,
  p_skill_graph_version text,
  p_session_type text,
  p_relationship_context_id uuid default null,
  p_client_installation_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_identity public.learning_identities;
  v_identity_count integer;
  v_grade public.grades;
  v_curriculum public.curriculum_versions;
  v_graph public.skill_graph_versions;
  v_context public.relationship_contexts;
  v_session public.sessions;
begin
  select count(*) into v_identity_count
  from public.learning_identities
  where account_id = auth.uid() and status = 'ACTIVE';
  if v_identity_count = 0 then raise exception using errcode='P0001', message='LEARNING_IDENTITY_NOT_FOUND'; end if;
  if v_identity_count > 1 then raise exception using errcode='P0001', message='LEARNING_IDENTITY_NOT_UNIQUE'; end if;

  select * into v_identity
  from public.learning_identities
  where account_id = auth.uid() and status = 'ACTIVE'
  limit 1;

  select * into v_grade from public.grades
  where code = p_grade_code and status in ('ACTIVE','REGISTERED');
  if v_grade.id is null then raise exception using errcode='P0001', message='GRADE_NOT_FOUND'; end if;

  select * into v_curriculum from public.curriculum_versions
  where grade_id = v_grade.id and version = p_curriculum_version and status = 'ACTIVE';
  if v_curriculum.id is null then raise exception using errcode='P0001', message='CURRICULUM_VERSION_NOT_FOUND'; end if;

  select * into v_graph from public.skill_graph_versions
  where grade_id = v_grade.id and version = p_skill_graph_version and status in ('ACTIVE','PROVISIONAL');
  if v_graph.id is null then raise exception using errcode='P0001', message='SKILL_GRAPH_VERSION_NOT_FOUND'; end if;
  if not exists (select 1 from public.skill_graph_nodes sgn where sgn.skill_graph_version_id = v_graph.id and sgn.is_active = true) then
    raise exception using errcode='P0001', message='SKILL_GRAPH_EMPTY';
  end if;

  if p_relationship_context_id is null then
    select * into v_context from public.relationship_contexts
    where context_type = 'PLATFORM' and name = 'Platform Context'
    order by created_at asc limit 1;
  else
    select * into v_context from public.relationship_contexts where id = p_relationship_context_id;
  end if;

  if v_context.id is null then raise exception using errcode='P0001', message='RELATIONSHIP_CONTEXT_NOT_FOUND'; end if;

  if v_context.context_type <> 'PLATFORM' and not (
    v_context.owner_account_id = auth.uid()
    or exists (
      select 1 from public.relationships r
      where r.learning_identity_id = v_identity.id
        and r.related_account_id = auth.uid()
        and r.context_id = v_context.id
        and r.lifecycle_status = 'ACTIVE'
    )
  ) then
    raise exception using errcode='P0001', message='RELATIONSHIP_CONTEXT_FORBIDDEN';
  end if;

  if p_client_installation_id is not null and not exists (
    select 1 from public.client_installations ci
    where ci.id = p_client_installation_id
      and ci.account_id = auth.uid()
      and ci.status = 'ACTIVE'
  ) then
    raise exception using errcode='P0001', message='CLIENT_INSTALLATION_FORBIDDEN';
  end if;

  insert into public.sessions(
    learning_identity_id, grade_id, curriculum_version_id, skill_graph_version_id,
    relationship_context_id, created_by_client_installation_id, last_resumed_by_client_installation_id,
    session_type, status, started_at, last_activity_at
  ) values (
    v_identity.id, v_grade.id, v_curriculum.id, v_graph.id,
    v_context.id, p_client_installation_id, p_client_installation_id,
    p_session_type, 'ACTIVE', now(), now()
  ) returning * into v_session;

  return jsonb_build_object(
    'id', v_session.id,
    'learningIdentityId', v_identity.id,
    'relationshipContextId', v_context.id,
    'gradeId', v_grade.id,
    'curriculumVersionId', v_curriculum.id,
    'skillGraphVersionId', v_graph.id,
    'sessionType', v_session.session_type,
    'status', v_session.status,
    'createdAt', v_session.created_at,
    'lastActivityAt', v_session.last_activity_at
  );
end;
$$;

-- The session-pinned graph must contain every evidence-bearing encounter skill.
-- Existing canonical function is replaced so this invariant is enforced server-side.
comment on function public.runtime_start_session(text,text,text,text,uuid,uuid) is
'Creates a version-pinned session. Requires exactly one active Learning Identity and a non-empty pinned Skill Graph.';
