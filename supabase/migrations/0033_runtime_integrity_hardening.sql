-- Phase 13 deep audit remediation — close integrity gaps found in 0031/0032.
-- This migration does not introduce new client authority; it tightens the existing RPC boundary.

-- 0031 added boolean flags with a false default, which could leave historical NEEDS_REVIEW rows
-- incorrectly marked as not needing review/recovery. Reconcile existing rows deterministically.
update public.learning_states
set
  review_need = (state = 'NEEDS_REVIEW'),
  recovery_need = (state = 'NEEDS_REVIEW')
where review_need is distinct from (state = 'NEEDS_REVIEW')
   or recovery_need is distinct from (state = 'NEEDS_REVIEW');

-- Runtime APIs must only expose one canonical active learning identity per account.
-- The base schema already enforces this via learning_identities_active_account_uq.
-- Re-assert the intended invariant as a database comment for operators.
comment on index public.learning_identities_active_account_uq is
'Exactly one ACTIVE Learning Identity per account; Runtime RPCs rely on this invariant.';

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

create or replace function public.runtime_submit_attempt(
  p_session_id uuid,
  p_encounter_id uuid,
  p_attempt_number integer,
  p_client_idempotency_key text,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_identity public.learning_identities;
  v_session public.sessions;
  v_encounter public.encounters;
  v_content public.content_versions;
  v_existing public.attempts;
  v_attempt public.attempts;
  v_answer jsonb;
  v_index integer;
  v_expected jsonb;
  v_expected_count integer;
  v_answer_count integer;
  v_correct_count integer;
  v_max_score numeric;
  v_score numeric;
  v_correct boolean;
  v_accepted boolean;
  v_evaluator_version text;
  v_qualifying boolean;
  v_station_pass boolean;
  v_previous public.learning_states;
  v_state public.learning_states;
  v_evidence public.evidence;
  v_check public.station_check_results;
  v_decision public.learning_decisions;
  v_plan public.learning_plans;
  v_confidence numeric;
  v_uncertainty numeric;
  v_positive boolean;
  v_selected_step text;
  v_action text;
  v_semantic_event text;
  v_distinct_sessions integer;
  v_json jsonb;
  v_existing_answers jsonb;
  v_requested_answers jsonb;
begin
  if p_attempt_number is null or p_attempt_number < 1 then raise exception using errcode='P0001', message='ATTEMPT_NUMBER_INVALID'; end if;
  if p_client_idempotency_key is null or length(trim(p_client_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) = 0 then raise exception using errcode='P0001', message='ANSWERS_REQUIRED'; end if;

  select li.* into v_identity
  from public.learning_identities li
  where li.account_id = auth.uid() and li.status='ACTIVE'
  order by li.created_at asc limit 1;
  if v_identity.id is null then raise exception using errcode='P0001', message='LEARNING_IDENTITY_NOT_FOUND'; end if;

  select s.* into v_session
  from public.sessions s
  where s.id = p_session_id and s.learning_identity_id = v_identity.id
  for update;
  if v_session.id is null then raise exception using errcode='P0001', message='SESSION_FORBIDDEN'; end if;

  -- Idempotent replay is allowed even after the original transaction completed the encounter/session.
  -- Only a genuinely new attempt is blocked by COMPLETED runtime state.
  select a.* into v_existing from public.attempts a where a.client_idempotency_key=p_client_idempotency_key for update;
  if v_existing.id is not null then
    if v_existing.encounter_id <> p_encounter_id or v_existing.attempt_number <> p_attempt_number then
      raise exception using errcode='P0001', message='IDEMPOTENCY_CONTEXT_MISMATCH';
    end if;
    select e.* into v_encounter
    from public.encounters e
    where e.id = v_existing.encounter_id and e.session_id = v_session.id;
    if v_encounter.id is null then raise exception using errcode='P0001', message='IDEMPOTENCY_CONTEXT_MISMATCH'; end if;

    select coalesce(jsonb_agg(ans.answer_payload order by ans.answer_index),'[]'::jsonb)
    into v_existing_answers
    from public.answers ans where ans.attempt_id=v_existing.id;
    select coalesce(jsonb_agg(items.value->'answerPayload' order by items.ordinality),'[]'::jsonb)
    into v_requested_answers
    from jsonb_array_elements(p_answers) with ordinality as items(value, ordinality);
    if v_existing_answers <> v_requested_answers then
      raise exception using errcode='P0001', message='IDEMPOTENCY_PAYLOAD_MISMATCH';
    end if;

    select cv.* into v_content from public.content_versions cv where cv.id=v_encounter.content_version_id and cv.status='ACTIVE';
    if v_content.id is null then raise exception using errcode='P0001', message='CONTENT_VERSION_NOT_FOUND'; end if;
    select le.* into v_previous from public.learning_states le where le.learning_identity_id=v_identity.id and le.skill_id=v_encounter.skill_id and le.relationship_context_id=v_session.relationship_context_id;
    select ld.* into v_decision from public.learning_decisions ld where ld.source_attempt_id=v_existing.id order by ld.created_at desc limit 1;
    if v_decision.id is null then raise exception using errcode='P0001', message='IDEMPOTENCY_DECISION_MISSING'; end if;
    select lp.* into v_plan from public.learning_plans lp where lp.decision_id=v_decision.id order by lp.created_at desc limit 1;
    select count(*) into v_distinct_sessions from (select distinct session_id from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true) q;
    v_station_pass := (select count(*) from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true) >= 2 and v_distinct_sessions >= 2;
    v_json := jsonb_build_object(
      'idempotent', true,
      'attempt', (select to_jsonb(a) || jsonb_build_object('answers', coalesce((select jsonb_agg(jsonb_build_object('answerIndex',ans.answer_index,'answerPayload',ans.answer_payload) order by ans.answer_index) from public.answers ans where ans.attempt_id=a.id),'[]'::jsonb)) from public.attempts a where a.id=v_existing.id),
      'evidence', null,
      'learningState', (select to_jsonb(ls) from public.learning_states ls where ls.learning_identity_id=v_identity.id and ls.skill_id=v_encounter.skill_id and ls.relationship_context_id=v_session.relationship_context_id),
      'decision', (select to_jsonb(d) from public.learning_decisions d where d.id=v_decision.id),
      'plan', (select to_jsonb(lp) from public.learning_plans lp where lp.decision_id=v_decision.id order by lp.created_at desc limit 1),
      'stationPass', v_station_pass,
      'recheckRequired', v_decision.selected_step='RECHECK',
      'semanticEvent', case when v_station_pass then 'STATION_PASS' when coalesce((v_existing.evaluation_payload->>'correct')::boolean,false) then 'ANSWER_CORRECT' else 'ANSWER_WRONG' end
    );
    return v_json;
  end if;

  if v_session.status <> 'ACTIVE' then raise exception using errcode='P0001', message='SESSION_NOT_ACTIVE'; end if;

  select e.* into v_encounter
  from public.encounters e
  where e.id = p_encounter_id and e.session_id = v_session.id
  for update;
  if v_encounter.id is null then raise exception using errcode='P0001', message='ENCOUNTER_NOT_FOUND'; end if;
  if v_encounter.status='COMPLETED' then raise exception using errcode='P0001', message='ENCOUNTER_COMPLETED'; end if;

  select cv.* into v_content from public.content_versions cv where cv.id=v_encounter.content_version_id and cv.status='ACTIVE';
  if v_content.id is null then raise exception using errcode='P0001', message='CONTENT_VERSION_NOT_FOUND'; end if;

  v_expected := v_content.evaluator_config->'expectedAnswers';
  if jsonb_typeof(v_expected) <> 'array' or jsonb_array_length(v_expected) = 0 then
    raise exception using errcode='P0001', message='EVALUATOR_CONFIG_INVALID';
  end if;
  v_expected_count := jsonb_array_length(v_expected);
  v_answer_count := jsonb_array_length(p_answers);

  if v_encounter.learning_role='MASTERY_CHECK' and v_answer_count <> 5 then
    raise exception using errcode='P0001', message='MASTERY_CHECK_REQUIRES_FIVE_ANSWERS';
  end if;
  if v_answer_count <> v_expected_count then
    raise exception using errcode='P0001', message='ANSWER_COUNT_MISMATCH';
  end if;
    if v_existing.encounter_id <> v_encounter.id then raise exception using errcode='P0001', message='IDEMPOTENCY_CONTEXT_MISMATCH'; end if;
    select le.* into v_previous from public.learning_states le where le.learning_identity_id=v_identity.id and le.skill_id=v_encounter.skill_id and le.relationship_context_id=v_session.relationship_context_id;
    select ld.* into v_decision from public.learning_decisions ld where ld.source_attempt_id=v_existing.id order by ld.created_at desc limit 1;
    if v_decision.id is null then raise exception using errcode='P0001', message='IDEMPOTENCY_DECISION_MISSING'; end if;
    select lp.* into v_plan from public.learning_plans lp where lp.decision_id=v_decision.id order by lp.created_at desc limit 1;
    select count(*) into v_distinct_sessions from (select distinct session_id from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true) q;
    v_station_pass := (select count(*) from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true) >= 2 and v_distinct_sessions >= 2;
    v_json := jsonb_build_object(
      'idempotent', true,
      'attempt', (select to_jsonb(a) || jsonb_build_object('answers', coalesce((select jsonb_agg(jsonb_build_object('answerIndex',ans.answer_index,'answerPayload',ans.answer_payload) order by ans.answer_index) from public.answers ans where ans.attempt_id=a.id),'[]'::jsonb)) from public.attempts a where a.id=v_existing.id),
      'evidence', null,
      'learningState', (select to_jsonb(ls) from public.learning_states ls where ls.learning_identity_id=v_identity.id and ls.skill_id=v_encounter.skill_id and ls.relationship_context_id=v_session.relationship_context_id),
      'decision', (select to_jsonb(d) from public.learning_decisions d where d.id=v_decision.id),
      'plan', (select to_jsonb(lp) from public.learning_plans lp where lp.decision_id=v_decision.id order by lp.created_at desc limit 1),
      'stationPass', v_station_pass,
      'recheckRequired', v_decision.selected_step='RECHECK',
      'semanticEvent', case when v_station_pass then 'STATION_PASS' when coalesce((v_existing.evaluation_payload->>'correct')::boolean,false) then 'ANSWER_CORRECT' else 'ANSWER_WRONG' end
    );
    return v_json;
  end if;

  v_max_score := coalesce(nullif((v_content.evaluator_config->>'maxScore')::numeric, 0), greatest(v_expected_count,1));
  v_evaluator_version := coalesce(v_content.evaluator_config->>'version', 'v1');
  v_correct_count := 0;

  for v_index in 0..greatest(v_answer_count,1)-1 loop
    v_answer := p_answers -> v_index -> 'answerPayload';
    if v_answer is not null and v_answer = (v_expected -> v_index) then
      v_correct_count := v_correct_count + 1;
    end if;
  end loop;

  v_score := least(v_correct_count, v_max_score);
  v_correct := v_expected_count > 0 and v_correct_count = v_expected_count;
  v_accepted := true;
  v_qualifying := v_encounter.learning_role='MASTERY_CHECK' and v_correct_count >= 4 and v_answer_count=5 and v_max_score=5;

  insert into public.attempts(encounter_id, attempt_number, client_idempotency_key, evaluator_version, status, submitted_at, evaluation_payload, score, max_score, accepted, evaluated_at)
  values (v_encounter.id, p_attempt_number, p_client_idempotency_key, v_evaluator_version, 'EVALUATED', now(),
          jsonb_build_object('correctCount',v_correct_count,'answerCount',v_answer_count,'interactionType',v_content.interaction_type,'correct',v_correct,'score',v_score,'maxScore',v_max_score,'accepted',v_accepted,'evaluatorVersion',v_evaluator_version,'feedbackCode',case when v_correct then 'CORRECT' else 'TRY_AGAIN' end), v_score, v_max_score, v_accepted, now())
  returning * into v_attempt;

  v_index := 0;
  for v_answer in select value from jsonb_array_elements(p_answers) loop
    insert into public.answers(attempt_id, answer_index, answer_payload) values (v_attempt.id, v_index, coalesce(v_answer->'answerPayload','null'::jsonb));
    v_index := v_index + 1;
  end loop;

  select * into v_previous from public.learning_states
  where learning_identity_id=v_identity.id and skill_id=v_encounter.skill_id and relationship_context_id=v_session.relationship_context_id
  for update;

  v_positive := v_correct or v_qualifying;
  v_confidence := case
    when v_positive and v_previous.id is not null then least(0.95, v_previous.confidence + case when v_correct then 0.15 else 0.10 end)
    when v_positive then case when v_correct then 0.70 else 0.60 end
    when v_previous.id is not null then greatest(0.05, v_previous.confidence - 0.25)
    else 0.20
  end;
  v_uncertainty := round((1 - v_confidence)::numeric, 3);

  insert into public.learning_states(
    learning_identity_id, skill_id, relationship_context_id, state, revision, retention_state,
    last_evidence_at, confidence, uncertainty, review_need, recovery_need
  ) values (
    v_identity.id, v_encounter.skill_id, v_session.relationship_context_id,
    case when not v_positive then 'NEEDS_REVIEW' when v_confidence >= 0.80 then 'STRONG' else 'BUILDING' end,
    coalesce(v_previous.revision,0)+1,
    case when v_positive then 'FRESH' else coalesce(v_previous.retention_state,'FRESH') end,
    now(), v_confidence, v_uncertainty, not v_positive, not v_positive
  )
  on conflict (learning_identity_id, skill_id, relationship_context_id) do update
  set state=excluded.state, revision=excluded.revision, retention_state=excluded.retention_state,
      last_evidence_at=excluded.last_evidence_at, confidence=excluded.confidence,
      uncertainty=excluded.uncertainty, review_need=excluded.review_need,
      recovery_need=excluded.recovery_need
  returning * into v_state;

  insert into public.evidence(
    learning_identity_id, session_id, encounter_id, attempt_id, skill_id, content_version_id,
    relationship_context_id, evidence_type, quality, payload, occurred_at
  ) values (
    v_identity.id, v_session.id, v_encounter.id, v_attempt.id, v_encounter.skill_id, v_encounter.content_version_id,
    v_session.relationship_context_id,
    case when v_encounter.learning_role='MASTERY_CHECK' then 'MASTERY_CHECK_RESULT' else 'ENCOUNTER_RESULT' end,
    'USABLE',
    jsonb_build_object('correct',v_correct,'score',v_score,'maxScore',v_max_score,'evaluatorVersion',v_evaluator_version,'experienceForm',v_encounter.experience_form),
    now()
  ) returning * into v_evidence;

  if v_encounter.learning_role='MASTERY_CHECK' then
    insert into public.station_check_results(
      learning_identity_id, station_id, session_id, encounter_id, attempt_id, correct_count, total_count, passed_check
    ) values (
      v_identity.id, v_encounter.station_id, v_session.id, v_encounter.id, v_attempt.id, v_correct_count, 5, v_qualifying
    ) returning * into v_check;
  end if;

  if v_encounter.learning_role='MASTERY_CHECK' then
    select count(*) into v_distinct_sessions from (
      select distinct session_id from public.station_check_results
      where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true
    ) q;
    v_station_pass := (select count(*) from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true) >= 2 and v_distinct_sessions >= 2;
  else
    v_station_pass := false;
  end if;

  v_selected_step := case
    when v_station_pass then 'STATION_PASS'
    when (not v_correct and not v_qualifying) then 'RECOVERY'
    when v_encounter.learning_role='MASTERY_CHECK' then 'RECHECK'
    else 'CONTINUE'
  end;

  v_action := case v_selected_step
    when 'RECOVERY' then 'CHANGE_REPRESENTATION_OR_DIFFICULTY'
    when 'RECHECK' then 'RUN_NEW_CHECK'
    when 'STATION_PASS' then 'ADVANCE_TO_NEXT_STATION'
    else 'CONTINUE_CURRENT_PLAN'
  end;

  insert into public.learning_decisions(
    learning_identity_id, target_skill_id, relationship_context_id, objective_context,
    evidence_refs, generation_version, selected_step, decision_policy_version,
    actor_type, status, source_attempt_id
  ) values (
    v_identity.id, v_encounter.skill_id, v_session.relationship_context_id, v_encounter.learning_role,
    jsonb_build_array(v_evidence.id), 'phase13-postgres-v1', jsonb_build_object('step',v_selected_step),
    'temporary-4-of-5-in-two-checks-v3', 'SYSTEM', 'SELECTED', v_attempt.id
  ) returning * into v_decision;

  insert into public.learning_plans(
    decision_id, learning_identity_id, plan_payload, status
  ) values (
    v_decision.id, v_identity.id, jsonb_build_object('action',v_action,'sourceDecision',v_decision.id), 'ACTIVE'
  ) returning * into v_plan;

  update public.encounters set status='COMPLETED', completed_at=now() where id=v_encounter.id;
  update public.sessions set last_activity_at=now(), status=case when v_station_pass then 'COMPLETED' else status end where id=v_session.id;

  v_semantic_event := case when v_station_pass then 'STATION_PASS' when v_correct or v_qualifying then 'ANSWER_CORRECT' else 'ANSWER_WRONG' end;

  return jsonb_build_object(
    'idempotent', false,
    'attempt', to_jsonb(v_attempt) || jsonb_build_object('answers', (select coalesce(jsonb_agg(jsonb_build_object('answerIndex',ans.answer_index,'answerPayload',ans.answer_payload) order by ans.answer_index),'[]'::jsonb) from public.answers ans where ans.attempt_id=v_attempt.id)),
    'evidence', to_jsonb(v_evidence),
    'learningState', to_jsonb(v_state),
    'decision', to_jsonb(v_decision),
    'plan', to_jsonb(v_plan),
    'stationPass', v_station_pass,
    'recheckRequired', v_selected_step='RECHECK',
    'semanticEvent', v_semantic_event
  );
exception
  when unique_violation then
    if exists (select 1 from public.attempts where client_idempotency_key=p_client_idempotency_key) then
      raise exception using errcode='P0001', message='IDEMPOTENCY_RACE_RETRY';
    end if;
    raise;
end;
$$;

revoke all on function public.runtime_create_encounter(uuid,integer,uuid,text,text,text,text,uuid) from public;
revoke all on function public.runtime_submit_attempt(uuid,uuid,integer,text,jsonb) from public;
grant execute on function public.runtime_create_encounter(uuid,integer,uuid,text,text,text,text,uuid) to authenticated;
grant execute on function public.runtime_submit_attempt(uuid,uuid,integer,text,jsonb) to authenticated;

comment on function public.runtime_create_encounter(uuid,integer,uuid,text,text,text,text,uuid) is
'Canonical encounter creation. Content version is authoritative for learning role/experience form; caller cannot transform ordinary content into a mastery check.';

comment on function public.runtime_submit_attempt(uuid,uuid,integer,text,jsonb) is
'Atomic server-authoritative Learning Runtime commit with evaluator cardinality checks, content integrity, idempotency, evidence/state/decision/plan, and Station Pass enforcement.';
