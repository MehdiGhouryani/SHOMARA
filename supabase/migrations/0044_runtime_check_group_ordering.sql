-- Phase 16 hotfix: resolve check-group before Evidence/Interpretation/Decision writes.
-- Migration 0043 remains historical; this migration applies the forward correction.

-- Phase 15 deep audit: canonical runtime semantics v2.
-- Fixes: duplicated new-attempt branch, check-group-aware station pass, mastery-only evaluation,
-- explicit provenance/interpretation fields, and idempotent replay completeness.

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
  v_interpretation public.interpretations;
  v_check_group text;
  v_mastery_eval public.mastery_evaluations;
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
    select count(*) into v_distinct_sessions from (select distinct session_id from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true and check_group='STATION_PASS') q;
    v_station_pass := (select count(*) from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true and check_group='STATION_PASS') >= 2 and v_distinct_sessions >= 2;
    v_json := jsonb_build_object(
      'idempotent', true,
      'attempt', (select to_jsonb(a) || jsonb_build_object('answers', coalesce((select jsonb_agg(jsonb_build_object('answerIndex',ans.answer_index,'answerPayload',ans.answer_payload) order by ans.answer_index) from public.answers ans where ans.attempt_id=a.id),'[]'::jsonb)) from public.attempts a where a.id=v_existing.id),
      'evidence', (select to_jsonb(e) from public.evidence e where e.attempt_id=v_existing.id order by e.created_at desc limit 1),
      'interpretation', (select to_jsonb(i) from public.interpretations i join public.evidence e on e.id=i.evidence_id where e.attempt_id=v_existing.id order by i.created_at desc limit 1),
      'masteryEvaluation', (select to_jsonb(me) from public.mastery_evaluations me where me.attempt_id=v_existing.id order by me.evaluated_at desc limit 1),
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

  v_check_group := case when v_encounter.learning_role='MASTERY_CHECK'
    then coalesce(v_content.evaluator_config->>'checkGroup', 'NON_PASS_GATE')
    else 'NON_PASS_GATE' end;

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
    relationship_context_id, evidence_type, quality, payload, occurred_at,
    source_type, actor_account_id, evidence_kind, provenance, client_event_id
  ) values (
    v_identity.id, v_session.id, v_encounter.id, v_attempt.id, v_encounter.skill_id, v_encounter.content_version_id,
    v_session.relationship_context_id,
    case when v_encounter.learning_role='MASTERY_CHECK' then 'MASTERY_CHECK_RESULT' else 'ENCOUNTER_RESULT' end,
    'USABLE',
    jsonb_build_object('correct',v_correct,'score',v_score,'maxScore',v_max_score,'evaluatorVersion',v_evaluator_version,'experienceForm',v_encounter.experience_form),
    now(),
    'SYSTEM', auth.uid(),
    case when v_check_group='MASTERY_EVIDENCE' then 'ASSESSMENT' else 'PERFORMANCE' end,
    jsonb_build_object('sessionId',v_session.id,'encounterId',v_encounter.id,'attemptId',v_attempt.id,'contentVersionId',v_encounter.content_version_id,'stationId',v_encounter.station_id,'skillId',v_encounter.skill_id,'policyVersion','phase13-postgres-v1'),
    p_client_idempotency_key
  ) returning * into v_evidence;

  insert into public.interpretations(
    evidence_id, error_hypothesis, confidence, payload, status, interpretation_type, uncertainty, basis
  ) values (
    v_evidence.id,
    case when v_positive then null else 'INSUFFICIENT_CURRENT_PERFORMANCE_EVIDENCE' end,
    v_confidence,
    jsonb_build_object(
      'sourceAttemptId', v_attempt.id,
      'policyVersion', 'phase13-postgres-v1',
      'interpretationType', case when v_positive then 'STATE_SIGNAL' else 'ERROR_PATTERN' end
    ),
    'ACTIVE',
    case when v_positive then 'STATE_SIGNAL' else 'ERROR_PATTERN' end,
    v_uncertainty,
    jsonb_build_object('evidenceIds',jsonb_build_array(v_evidence.id),'policyVersion','phase13-postgres-v1','confidence',v_confidence,'uncertainty',v_uncertainty)
  ) returning * into v_interpretation;

  if not v_positive then
    insert into public.error_hypotheses(
      interpretation_id, hypothesis_code, status, strength, reasoning
    ) values (
      v_interpretation.id,
      'INSUFFICIENT_CURRENT_PERFORMANCE_EVIDENCE',
      'ACTIVE',
      greatest(0, 1-v_confidence),
      jsonb_build_object('evidenceId',v_evidence.id,'attemptId',v_attempt.id,'correctCount',v_correct_count,'totalCount',v_answer_count,'policyVersion','phase13-postgres-v1')
    );
  end if;

  update public.learning_states
  set current_interpretation_refs = jsonb_build_array(v_interpretation.id)
  where id = v_state.id;
  select * into v_state from public.learning_states where id=v_state.id;

  if v_encounter.learning_role='MASTERY_CHECK' then
    insert into public.station_check_results(
      learning_identity_id, station_id, session_id, encounter_id, attempt_id, correct_count, total_count, passed_check, check_group
    ) values (
      v_identity.id, v_encounter.station_id, v_session.id, v_encounter.id, v_attempt.id, v_correct_count, 5, v_qualifying, v_check_group
    ) returning * into v_check;
  end if;

  if v_check_group='STATION_PASS' then
    select count(*) into v_distinct_sessions from (
      select distinct session_id from public.station_check_results
      where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true and check_group='STATION_PASS'
    ) q;
    v_station_pass := (select count(*) from public.station_check_results where learning_identity_id=v_identity.id and station_id=v_encounter.station_id and passed_check=true and check_group='STATION_PASS') >= 2 and v_distinct_sessions >= 2;
  else
    v_station_pass := false;
  end if;

  v_selected_step := case
    when v_station_pass then 'STATION_PASS'
    when v_encounter.learning_role='MASTERY_CHECK' and v_check_group='MASTERY_EVIDENCE' and v_qualifying then 'CONTINUE'
    when not v_correct then 'RECOVERY'
    when v_encounter.learning_role='MASTERY_CHECK' and v_check_group='RECOVERY_RECHECK' then 'CONTINUE'
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
    goal_refs, input_state_snapshot, evidence_refs, interpretation_refs,
    generation_version, applicable_constraints, arbitration_result, selected_step, decision_policy_version,
    actor_type, status, source_attempt_id
  ) values (
    v_identity.id, v_encounter.skill_id, v_session.relationship_context_id, v_encounter.learning_role,
    '[]'::jsonb,
    jsonb_build_object('state',v_state.state,'revision',v_state.revision,'confidence',v_state.confidence,'uncertainty',v_state.uncertainty,'reviewNeed',v_state.review_need,'recoveryNeed',v_state.recovery_need),
    jsonb_build_array(v_evidence.id), jsonb_build_array(v_interpretation.id),
    'phase13-postgres-v1',
    jsonb_build_array(case when v_encounter.learning_role='MASTERY_CHECK' then jsonb_build_object('checkGroup',coalesce(v_check_group,'NON_PASS_GATE'),'requiredCorrect',4,'totalItems',5,'stationPassPolicyVersion','phase15-station-pass-4of5x2-v1') else jsonb_build_object('type','NONE') end),
    jsonb_build_object('stationPass',v_station_pass,'positive',v_positive,'confidence',v_confidence,'uncertainty',v_uncertainty),
    jsonb_build_object('step',v_selected_step),
    'phase13-postgres-v1', 'SYSTEM', 'SELECTED', v_attempt.id
  ) returning * into v_decision;

  if v_encounter.learning_role='MASTERY_CHECK' and v_check_group='MASTERY_EVIDENCE' then
    insert into public.mastery_evaluations(
      learning_identity_id, skill_id, relationship_context_id, encounter_id, attempt_id,
      policy_version, result, evidence_snapshot, evaluated_at, decision_id
    ) values (
      v_identity.id, v_encounter.skill_id, v_session.relationship_context_id, v_encounter.id, v_attempt.id,
      'phase13-postgres-v1',
      case when v_qualifying then 'MET' when v_correct_count = 0 then 'NOT_MET' else 'UNCERTAIN' end,
      jsonb_build_object('evidenceId',v_evidence.id,'interpretationId',v_interpretation.id,'correctCount',v_correct_count,'totalCount',5),
      now(), v_decision.id
    ) returning * into v_mastery_eval;
    update public.learning_states
      set active_mastery_evaluation_ref = v_mastery_eval.id
    where id = v_state.id;
    select * into v_state from public.learning_states where id = v_state.id;
  end if;

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
    'interpretation', to_jsonb(v_interpretation),
    'masteryEvaluation', case when v_mastery_eval.id is null then null else to_jsonb(v_mastery_eval) end,
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
