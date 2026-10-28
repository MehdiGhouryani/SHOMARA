-- Phase 14 content/runtime boundary hardening.
-- Runtime encounter creation may only consume STABLE content packages.
-- Package checksum is aligned with the canonical staging package representation.

update public.content_packages
set checksum='0113d666ce79e7b3a259f72368addf2126f245c5f6722cb360dfed71b2bd2640',
    bytes=1640,
    version='1.1.0-staging',
    release_channel='STABLE',
    status='ACTIVE'
where package_code='G1-ST01' and grade_id=(select id from public.grades where code='G1') and version='1.1.0-staging';

create or replace function public.runtime_create_encounter(
  p_session_id uuid,
  p_sequence integer,
  p_content_version_id uuid,
  p_station_code text,
  p_skill_code text,
  p_learning_role text default null,
  p_experience_form text default null,
  p_learning_objective_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_session public.sessions;
  v_content public.content_versions;
  v_artifact public.content_artifacts;
  v_station public.stations;
  v_skill public.skills;
  v_encounter public.encounters;
  v_package_access boolean;
begin
  if p_sequence is null or p_sequence < 1 then
    raise exception using errcode='P0001', message='ENCOUNTER_SEQUENCE_INVALID';
  end if;

  select s.* into v_session
  from public.sessions s
  join public.learning_identities li on li.id = s.learning_identity_id
  where s.id = p_session_id
    and li.account_id = auth.uid();

  if v_session.id is null then raise exception using errcode='P0001', message='SESSION_FORBIDDEN'; end if;
  if v_session.status <> 'ACTIVE' then raise exception using errcode='P0001', message='SESSION_NOT_ACTIVE'; end if;

  select cv.* into v_content
  from public.content_versions cv
  where cv.id = p_content_version_id and cv.status = 'ACTIVE';
  if v_content.id is null then raise exception using errcode='P0001', message='CONTENT_VERSION_NOT_FOUND'; end if;

  select ca.* into v_artifact from public.content_artifacts ca
  where ca.id = v_content.content_artifact_id and ca.status = 'ACTIVE';
  if v_artifact.id is null then raise exception using errcode='P0001', message='CONTENT_ARTIFACT_NOT_FOUND'; end if;
  if v_artifact.grade_id <> v_session.grade_id then
    raise exception using errcode='P0001', message='CONTENT_GRADE_MISMATCH';
  end if;

  select st.* into v_station from public.stations st
  where st.id = v_artifact.station_id
    and st.code = p_station_code
    and st.curriculum_version_id = v_session.curriculum_version_id
    and st.status = 'ACTIVE';
  if v_station.id is null then raise exception using errcode='P0001', message='STATION_VERSION_INTEGRITY_ERROR'; end if;

  select sk.* into v_skill from public.skills sk
  where sk.id = v_artifact.skill_id
    and sk.code = p_skill_code
    and sk.status in ('ACTIVE','PROVISIONAL');
  if v_skill.id is null then raise exception using errcode='P0001', message='SKILL_VERSION_INTEGRITY_ERROR'; end if;

  if not exists (
    select 1 from public.station_skills ss
    where ss.station_id = v_station.id and ss.skill_id = v_skill.id
  ) then
    raise exception using errcode='P0001', message='STATION_SKILL_MAPPING_NOT_FOUND';
  end if;

  if not exists (
    select 1 from public.skill_graph_nodes sgn
    where sgn.skill_graph_version_id = v_session.skill_graph_version_id
      and sgn.skill_id = v_skill.id
      and sgn.is_active = true
  ) then
    raise exception using errcode='P0001', message='SKILL_NOT_IN_PINNED_GRAPH';
  end if;

  if p_learning_objective_id is not null and not exists (
    select 1 from public.learning_objectives lo
    where lo.id = p_learning_objective_id
      and lo.status = 'ACTIVE'
      and lo.grade_id = v_session.grade_id
      and (lo.station_id is null or lo.station_id = v_station.id)
      and (lo.skill_id is null or lo.skill_id = v_skill.id)
  ) then
    raise exception using errcode='P0001', message='LEARNING_OBJECTIVE_INTEGRITY_ERROR';
  end if;

  if (p_learning_role is not null and p_learning_role <> v_content.learning_role)
     or (p_experience_form is not null and p_experience_form <> v_content.experience_form) then
    raise exception using errcode='P0001', message='CONTENT_ROLE_FORM_OVERRIDE_FORBIDDEN';
  end if;

  select exists (
    select 1
    from public.content_package_items cpi
    join public.content_packages cp on cp.id = cpi.package_id
    where cpi.content_version_id = v_content.id
      and cp.status = 'ACTIVE'
      and cp.release_channel = 'STABLE'
      and cp.grade_id = v_session.grade_id
      and (cp.station_id is null or cp.station_id = v_station.id)
      and public.can_access_content_package(cp.id, v_session.learning_identity_id)
  ) into v_package_access;
  if not v_package_access and not public.is_admin() then
    raise exception using errcode='P0001', message='CONTENT_PACKAGE_FORBIDDEN';
  end if;

  if exists (select 1 from public.encounters where session_id=p_session_id and sequence=p_sequence) then
    raise exception using errcode='P0001', message='ENCOUNTER_SEQUENCE_CONFLICT';
  end if;

  insert into public.encounters(
    session_id, sequence, station_id, skill_id, learning_objective_id, content_version_id,
    learning_role, experience_form, status
  ) values (
    p_session_id, p_sequence, v_station.id, v_skill.id, p_learning_objective_id, v_content.id,
    v_content.learning_role, v_content.experience_form, 'PRESENTED'
  ) returning * into v_encounter;

  return jsonb_build_object(
    'id', v_encounter.id,
    'sessionId', v_encounter.session_id,
    'sequence', v_encounter.sequence,
    'stationId', v_encounter.station_id,
    'skillId', v_encounter.skill_id,
    'learningObjectiveId', v_encounter.learning_objective_id,
    'contentVersionId', v_encounter.content_version_id,
    'learningRole', v_encounter.learning_role,
    'experienceForm', v_encounter.experience_form,
    'status', v_encounter.status,
    'createdAt', v_encounter.created_at,
    'content', jsonb_build_object(
      'id', v_content.id,
      'gradeId', v_session.grade_id,
      'stationId', v_station.code,
      'skillId', v_skill.code,
      'learningRole', v_content.learning_role,
      'experienceForm', v_content.experience_form,
      'interactionType', v_content.interaction_type,
      'prompt', v_content.prompt,
      'answerSchema', v_content.answer_schema,
      'evaluatorConfig', v_content.evaluator_config,
      'feedbackConfig', v_content.feedback_config,
      'hintConfig', v_content.hint_config
    )
  );
end;
$$;
