-- P04 — Station Challenge runtime RPCs (forward patch of the 0055 boundary stubs).
--
-- 0055 created the challenge schema and three RPC stubs that raised
-- CHALLENGE_RUNTIME_DEPLOYMENT_REQUIRED. This migration replaces them with the real,
-- transactional implementation. It mirrors packages/challenge-runtime (TS orchestrator)
-- one-to-one; any change here must keep the same idempotency/context/error semantics.
--
-- Invariants (Roadmap P04 rules, ADR-0003, P01-G):
-- * Every round attempt is an ordinary encounter + attempt: encounters are created by
--   runtime_create_encounter and evaluated by runtime_submit_attempt. No second evaluator.
-- * Challenge content can never be MASTERY_CHECK, so challenge attempts never write
--   station_check_results / station pass / mastery evaluations.
-- * Reward is a PENDING eligibility row (outbox for P07), never a grant and never mastery.
-- * Evidence stays append-only: challenge provenance lives in station_challenge_attempt_links.
-- * The server computes the request fingerprint; the client value is advisory only.
-- * Answer keys / evaluator_config never leave the database.

create table if not exists public.station_challenge_attempt_links (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.station_challenge_runs(id) on delete restrict,
  round_index int not null check (round_index >= 0),
  attempt_number int not null check (attempt_number > 0),
  encounter_id uuid not null references public.encounters(id) on delete restrict,
  attempt_id uuid not null references public.attempts(id) on delete restrict,
  evidence_id uuid references public.evidence(id) on delete restrict,
  difficulty_level text not null check (difficulty_level in ('SUPPORTED','CORE','STRETCH')),
  scaffolded boolean not null,
  counts_toward_station_pass boolean not null default false check (counts_toward_station_pass = false),
  counts_toward_mastery boolean not null default false check (counts_toward_mastery = false),
  created_at timestamptz not null default now(),
  unique (run_id, round_index, attempt_number),
  unique (attempt_id)
);
alter table public.station_challenge_attempt_links enable row level security;
create policy station_challenge_attempt_link_self_read on public.station_challenge_attempt_links for select to authenticated
  using (exists (select 1 from public.station_challenge_runs r where r.id=run_id and public.can_access_learning_identity(r.learning_identity_id)));
revoke insert, update, delete on public.station_challenge_attempt_links from authenticated;

alter table public.station_challenge_round_states add column if not exists encounter_count int not null default 0 check (encounter_count >= 0);

-- ---------------------------------------------------------------------------
-- Internal helpers (not granted to clients)
-- ---------------------------------------------------------------------------

create or replace function public.challenge_current_identity()
returns public.learning_identities language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare v_identity public.learning_identities;
begin
  if auth.uid() is null then raise exception using errcode='28000', message='AUTH_REQUIRED'; end if;
  select li.* into v_identity from public.learning_identities li
  where li.account_id = auth.uid() and li.status='ACTIVE' order by li.created_at asc limit 1;
  if v_identity.id is null then raise exception using errcode='P0001', message='LEARNING_IDENTITY_NOT_FOUND'; end if;
  return v_identity;
end;
$$;

-- Shape-only check of one raw response; mirrors CHALLENGE_TEMPLATE_ADAPTERS. Never truth.
create or replace function public.challenge_action_shape_ok(p_game_code text, p_payload jsonb)
returns boolean language plpgsql immutable set search_path = public, pg_catalog as $$
declare v numeric;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'number' then return false; end if;
  v := (p_payload #>> '{}')::numeric;
  if v <> trunc(v) then return false; end if;
  return case p_game_code
    when 'G1-GAME-001' then v between 0 and 3
    when 'G1-GAME-002' then v between 0 and 20
    else false
  end;
end;
$$;

-- Server-side canonical fingerprint: [[answerIndex, answerPayload], ...] ordered by index.
-- jsonb normalises object key order, matching challengeAnswerFingerprint().
create or replace function public.challenge_answers_fingerprint(p_answers jsonb)
returns text language sql immutable set search_path = public, pg_catalog as $$
  select coalesce(jsonb_agg(jsonb_build_array(a.value->'answerIndex', coalesce(a.value->'answerPayload','null'::jsonb)) order by (a.value->>'answerIndex')::int), '[]'::jsonb)::text
  from jsonb_array_elements(p_answers) a;
$$;

create or replace function public.challenge_client_view(p_def public.station_challenge_definitions)
returns jsonb language sql stable security definer set search_path = public, pg_catalog as $$
  select jsonb_build_object(
    'challengeId', p_def.id,
    'code', p_def.code,
    'version', p_def.version,
    'stationId', (select st.code from public.stations st where st.id = p_def.station_id),
    'gameCode', p_def.game_code,
    'objective', p_def.objective,
    'plannedRounds', p_def.rounds,
    'timerPolicy', jsonb_build_object('policy', p_def.timer_policy),
    'hintLadder', coalesce(p_def.hint_policy->'ladder', '["STRATEGY","REPRESENTATION","WORKED_STEP"]'::jsonb),
    'finalMoment', 'SUMMARY_CELEBRATION',
    'contractVersion', '2026-10-04-p04-v1'
  );
$$;

-- Deterministic level for the next round (mirrors levelForNextRound()).
create or replace function public.challenge_level_for_next_round(p_def public.station_challenge_definitions, p_run_id uuid)
returns text language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  v_levels text[] := array['SUPPORTED','CORE','STRETCH'];
  v_start text := coalesce(p_def.difficulty_policy->>'startLevel', 'CORE');
  v_step_up int := coalesce((p_def.difficulty_policy->>'stepUpAfterFirstTryRounds')::int, 2);
  v_step_down int := coalesce((p_def.difficulty_policy->>'stepDownAfterWrongAttempts')::int, 2);
  v_level text := v_start;
  v_streak int := 0;
  r record;
begin
  if coalesce(p_def.difficulty_policy->>'mode', 'STEP_ADAPTIVE') = 'FIXED' then return v_start; end if;
  for r in select solved, attempt_count from public.station_challenge_round_states where run_id = p_run_id and closed order by round_index loop
    if r.solved and r.attempt_count = 1 then
      v_streak := v_streak + 1;
      if v_streak >= v_step_up then
        v_level := v_levels[least(3, array_position(v_levels, v_level) + 1)];
        v_streak := 0;
      end if;
    else
      v_streak := 0;
      if not r.solved or r.attempt_count > v_step_down then v_level := v_start; end if;
    end if;
  end loop;
  return v_level;
end;
$$;

-- Opens the encounter for (run, round) at a level through runtime_create_encounter.
-- Returns the client-safe presentation (no evaluator data).
create or replace function public.challenge_open_encounter(p_run_id uuid, p_round_index int, p_level text)
returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_run public.station_challenge_runs;
  v_def public.station_challenge_definitions;
  v_state public.station_challenge_round_states;
  v_variant public.station_challenge_variants;
  v_station_code text;
  v_sequence int;
  v_encounter jsonb;
begin
  select * into v_run from public.station_challenge_runs where id = p_run_id;
  select * into v_def from public.station_challenge_definitions where id = v_run.challenge_definition_id;
  select * into v_state from public.station_challenge_round_states where run_id = p_run_id and round_index = p_round_index for update;
  select v.* into v_variant
  from public.station_challenge_variants v
  join public.station_challenge_rounds r on r.id = v.round_id
  where r.challenge_definition_id = v_def.id and r.round_index = p_round_index
  order by case when v.difficulty_level = p_level then 0 when v.difficulty_level = 'CORE' then 1 else 2 end, v.difficulty_level
  limit 1;
  if v_variant.id is null then raise exception using errcode='P0001', message='CHALLENGE_VARIANT_NOT_FOUND'; end if;
  select st.code into v_station_code from public.stations st where st.id = v_def.station_id;
  -- Session row is locked by the caller; sequence follows the existing runtime contract.
  select coalesce(max(e.sequence), 0) + 1 into v_sequence from public.encounters e where e.session_id = v_run.session_id;
  v_encounter := public.runtime_create_encounter(v_run.session_id, v_sequence, v_variant.content_version_id, v_station_code, v_variant.skill_code, null, null, null);
  update public.station_challenge_round_states
    set current_level = v_variant.difficulty_level, open_encounter_id = (v_encounter->>'id')::uuid, encounter_count = encounter_count + 1
  where id = v_state.id;
  return jsonb_build_object(
    'encounterId', v_encounter->>'id',
    'roundIndex', p_round_index,
    'attemptNumber', v_state.attempt_count + 1,
    'level', v_variant.difficulty_level,
    'skillId', v_variant.skill_code,
    'contentVersionId', v_variant.content_version_id,
    'interactionType', v_encounter->'content'->>'interactionType',
    'prompt', v_encounter->'content'->>'prompt',
    'content', v_encounter->'content'
  );
end;
$$;

create or replace function public.challenge_result_view(p_run public.station_challenge_runs)
returns jsonb language sql stable security definer set search_path = public, pg_catalog as $$
  select jsonb_build_object(
    'result', coalesce(p_run.result, 'ABANDONED'),
    'semanticEvent', case coalesce(p_run.result, 'ABANDONED') when 'COMPLETED' then 'MILESTONE' when 'COMPLETED_WITH_SUPPORT' then 'MILESTONE' when 'NOT_YET' then 'RECOVERY' else null end,
    'solvedRounds', (select count(*) from public.station_challenge_round_states s where s.run_id = p_run.id and s.solved),
    'plannedRounds', (select d.rounds from public.station_challenge_definitions d where d.id = p_run.challenge_definition_id),
    'rewardEligible', p_run.reward_eligible,
    'rewardGrantKey', p_run.reward_grant_key,
    'setsMastery', false,
    'setsStationCompletion', false
  );
$$;

-- Full run view. p_next is the freshly opened presentation (or null to rebuild it).
create or replace function public.challenge_run_view(p_run_id uuid, p_idempotent boolean, p_next jsonb default null)
returns jsonb language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  v_run public.station_challenge_runs;
  v_def public.station_challenge_definitions;
  v_state public.station_challenge_round_states;
  v_next jsonb := p_next;
  v_content public.content_versions;
begin
  select * into v_run from public.station_challenge_runs where id = p_run_id;
  select * into v_def from public.station_challenge_definitions where id = v_run.challenge_definition_id;
  if v_next is null and v_run.status = 'ACTIVE' then
    select * into v_state from public.station_challenge_round_states where run_id = v_run.id and round_index = v_run.current_round_index;
    if v_state.open_encounter_id is not null then
      select cv.* into v_content from public.encounters e join public.content_versions cv on cv.id = e.content_version_id where e.id = v_state.open_encounter_id;
      v_next := jsonb_build_object(
        'encounterId', v_state.open_encounter_id, 'roundIndex', v_state.round_index, 'attemptNumber', v_state.attempt_count + 1,
        'level', v_state.current_level, 'skillId', v_state.skill_code, 'contentVersionId', v_content.id,
        'interactionType', v_content.interaction_type, 'prompt', v_content.prompt,
        'content', jsonb_build_object('prompt', v_content.prompt, 'interactionType', v_content.interaction_type,
          'options', coalesce(v_content.metadata->'presentation'->'options', '[]'::jsonb),
          'questions', coalesce(v_content.metadata->'presentation'->'questions', '[]'::jsonb),
          'visualCount', v_content.metadata->'presentation'->'visualCount')
      );
    end if;
  end if;
  return jsonb_build_object(
    'idempotent', p_idempotent,
    'runId', v_run.id,
    'status', v_run.status,
    'challenge', public.challenge_client_view(v_def),
    'currentRoundIndex', v_run.current_round_index,
    'plannedRounds', v_def.rounds,
    'next', case when v_run.status = 'ACTIVE' then v_next else null end,
    'result', case when v_run.status = 'ACTIVE' then null else public.challenge_result_view(v_run) end
  );
end;
$$;

-- Finalises a run (mirrors ChallengeRuntime.finalize + resolveChallengeResult).
create or replace function public.challenge_finalize_run(p_run_id uuid, p_exited_early boolean)
returns void language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_run public.station_challenge_runs;
  v_def public.station_challenge_definitions;
  v_closed int; v_solved int; v_supported boolean; v_result text; v_key text; v_inserted int;
begin
  select * into v_run from public.station_challenge_runs where id = p_run_id for update;
  select * into v_def from public.station_challenge_definitions where id = v_run.challenge_definition_id;
  select count(*) filter (where closed), count(*) filter (where solved), coalesce(bool_or(hints_used > 0 or scaffolded), false)
    into v_closed, v_solved, v_supported
  from public.station_challenge_round_states where run_id = p_run_id;
  v_result := case
    when p_exited_early or v_closed < v_def.rounds then 'ABANDONED'
    when v_solved < v_def.rounds then 'NOT_YET'
    when v_supported then 'COMPLETED_WITH_SUPPORT'
    else 'COMPLETED' end;
  update public.station_challenge_runs set status = case when v_result = 'ABANDONED' then 'ABANDONED' else 'COMPLETED' end,
    result = v_result, finished_at = now() where id = p_run_id;
  update public.station_challenge_round_states set open_encounter_id = null where run_id = p_run_id;

  if v_result in ('COMPLETED','COMPLETED_WITH_SUPPORT')
     and coalesce(v_def.reward_policy->'grantedOn', '["COMPLETED","COMPLETED_WITH_SUPPORT"]'::jsonb) ? v_result then
    -- Same shape as rewardGrantKeyString(): one key per learner + source + challenge + reward definition.
    v_key := v_run.learning_identity_id || ':CHALLENGE_COMPLETION:' || v_def.code || ':' || coalesce(v_def.reward_policy->>'rewardDefinitionCode', v_def.code);
    insert into public.station_challenge_reward_eligibility(learning_identity_id, challenge_code, run_id, result, reward_grant_key, status)
    values (v_run.learning_identity_id, v_def.code, v_run.id, v_result, v_key, 'PENDING')
    on conflict do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted = 1 then
      update public.station_challenge_runs set reward_eligible = true, reward_grant_key = v_key where id = p_run_id;
    end if;
  end if;
end;
$$;

revoke all on function public.challenge_current_identity() from public;
revoke all on function public.challenge_action_shape_ok(text, jsonb) from public;
revoke all on function public.challenge_answers_fingerprint(jsonb) from public;
revoke all on function public.challenge_client_view(public.station_challenge_definitions) from public;
revoke all on function public.challenge_level_for_next_round(public.station_challenge_definitions, uuid) from public;
revoke all on function public.challenge_open_encounter(uuid, int, text) from public;
revoke all on function public.challenge_result_view(public.station_challenge_runs) from public;
revoke all on function public.challenge_run_view(uuid, boolean, jsonb) from public;
revoke all on function public.challenge_finalize_run(uuid, boolean) from public;

-- ---------------------------------------------------------------------------
-- Client RPCs
-- ---------------------------------------------------------------------------

create or replace function public.runtime_get_station_challenge(p_station_code text)
returns jsonb language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare v_def public.station_challenge_definitions;
begin
  perform public.challenge_current_identity();
  select d.* into v_def from public.station_challenge_definitions d join public.stations st on st.id = d.station_id
  where st.code = p_station_code and d.status = 'ACTIVE' order by d.version desc limit 1;
  if v_def.id is null then raise exception using errcode='P0001', message='CHALLENGE_NOT_FOUND'; end if;
  return public.challenge_client_view(v_def);
end;
$$;

create or replace function public.runtime_start_challenge(
  p_session_id uuid,
  p_challenge_definition_id uuid,
  p_start_idempotency_key text
) returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_session public.sessions;
  v_def public.station_challenge_definitions;
  v_run public.station_challenge_runs;
  v_bad text;
  v_round_count int;
  v_start_level text;
  v_next jsonb;
begin
  v_identity := public.challenge_current_identity();
  if p_start_idempotency_key is null or length(trim(p_start_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;

  select s.* into v_session from public.sessions s where s.id = p_session_id and s.learning_identity_id = v_identity.id for update;
  if v_session.id is null then raise exception using errcode='P0001', message='SESSION_FORBIDDEN'; end if;

  select r.* into v_run from public.station_challenge_runs r where r.learning_identity_id = v_identity.id and r.start_idempotency_key = p_start_idempotency_key;
  if v_run.id is not null then
    if v_run.session_id <> p_session_id or v_run.challenge_definition_id <> p_challenge_definition_id then
      raise exception using errcode='P0001', message='IDEMPOTENCY_CONTEXT_MISMATCH';
    end if;
    return public.challenge_run_view(v_run.id, true);
  end if;

  if v_session.status <> 'ACTIVE' then raise exception using errcode='P0001', message='SESSION_NOT_ACTIVE'; end if;
  select d.* into v_def from public.station_challenge_definitions d where d.id = p_challenge_definition_id;
  if v_def.id is null then raise exception using errcode='P0001', message='CHALLENGE_NOT_FOUND'; end if;
  if v_def.status <> 'ACTIVE' then raise exception using errcode='P0001', message='CHALLENGE_NOT_ACTIVE'; end if;
  if v_def.grade_id <> v_session.grade_id then raise exception using errcode='P0001', message='VERSION_INTEGRITY_ERROR'; end if;

  select count(*) into v_round_count from public.station_challenge_rounds where challenge_definition_id = v_def.id;
  if v_round_count <> v_def.rounds then raise exception using errcode='P0001', message='CHALLENGE_DEFINITION_INVALID'; end if;
  if exists (select 1 from public.station_challenge_rounds r where r.challenge_definition_id = v_def.id
             and not exists (select 1 from public.station_challenge_variants v where v.round_id = r.id and v.difficulty_level = 'CORE')) then
    raise exception using errcode='P0001', message='CHALLENGE_DEFINITION_INVALID';
  end if;

  -- Content integrity (mirrors assertContentIntegrity): same station/skill, never MASTERY_CHECK,
  -- CHALLENGE form, declared learning role, pinned evaluator version.
  select v.content_version_id::text into v_bad
  from public.station_challenge_variants v
  join public.station_challenge_rounds r on r.id = v.round_id
  left join public.content_versions cv on cv.id = v.content_version_id and cv.status = 'ACTIVE'
  left join public.content_artifacts ca on ca.id = cv.content_artifact_id
  left join public.skills sk on sk.id = ca.skill_id
  where r.challenge_definition_id = v_def.id and (
    cv.id is null or ca.station_id is distinct from v_def.station_id or sk.code is distinct from v.skill_code or v.skill_code is distinct from r.skill_code
    or cv.learning_role = 'MASTERY_CHECK' or cv.learning_role is distinct from v_def.learning_role or cv.experience_form is distinct from 'CHALLENGE'
    or coalesce(cv.evaluator_config->>'version', 'v1') is distinct from v_def.evaluator_version
  ) limit 1;
  if v_bad is not null then raise exception using errcode='P0001', message='CHALLENGE_CONTENT_INTEGRITY_ERROR', detail=v_bad; end if;

  v_start_level := coalesce(v_def.difficulty_policy->>'startLevel', 'CORE');
  insert into public.station_challenge_runs(challenge_definition_id, learning_identity_id, relationship_context_id, session_id, start_idempotency_key, status, current_round_index)
  values (v_def.id, v_identity.id, v_session.relationship_context_id, v_session.id, p_start_idempotency_key, 'ACTIVE', 0)
  returning * into v_run;
  insert into public.station_challenge_round_states(run_id, round_index, skill_code, start_level, current_level)
  select v_run.id, r.round_index, r.skill_code, v_start_level, v_start_level
  from public.station_challenge_rounds r where r.challenge_definition_id = v_def.id order by r.round_index;

  v_next := public.challenge_open_encounter(v_run.id, 0, v_start_level);
  return public.challenge_run_view(v_run.id, false, v_next);
exception
  when unique_violation then
    raise exception using errcode='P0001', message='IDEMPOTENCY_RACE_RETRY';
end;
$$;

create or replace function public.runtime_submit_challenge_round(
  p_run_id uuid,
  p_round_index integer,
  p_attempt_number integer,
  p_idempotency_key text,
  p_request_fingerprint text,
  p_answers jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_run public.station_challenge_runs;
  v_def public.station_challenge_definitions;
  v_state public.station_challenge_round_states;
  v_stored public.station_challenge_round_submissions;
  v_expected_key text;
  v_fingerprint text;
  v_answer jsonb;
  v_lr jsonb;
  v_correct boolean;
  v_score numeric;
  v_max numeric;
  v_eval_version text;
  v_step_down int;
  v_max_attempts int;
  v_attempt_level text;
  v_level text;
  v_scaffold_next boolean := false;
  v_next jsonb := null;
  v_result jsonb := null;
  v_response jsonb;
begin
  v_identity := public.challenge_current_identity();
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) = 0 then raise exception using errcode='P0001', message='ANSWERS_REQUIRED'; end if;
  if p_round_index is null or p_round_index < 0 or p_attempt_number is null or p_attempt_number < 1 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;

  select r.* into v_run from public.station_challenge_runs r where r.id = p_run_id and r.learning_identity_id = v_identity.id for update;
  if v_run.id is null then raise exception using errcode='P0001', message='CHALLENGE_RUN_NOT_FOUND'; end if;
  v_expected_key := 'challenge:v1:round:' || v_run.id || ':r' || p_round_index || ':a' || p_attempt_number;
  if p_idempotency_key <> v_expected_key then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  v_fingerprint := public.challenge_answers_fingerprint(p_answers);

  select s.* into v_stored from public.station_challenge_round_submissions s where s.run_id = v_run.id and s.idempotency_key = v_expected_key;
  if v_stored.id is not null then
    if v_stored.request_fingerprint <> v_fingerprint then raise exception using errcode='P0001', message='IDEMPOTENCY_PAYLOAD_MISMATCH'; end if;
    return v_stored.runtime_result || jsonb_build_object('idempotent', true);
  end if;

  if v_run.status <> 'ACTIVE' then raise exception using errcode='P0001', message='CHALLENGE_RUN_NOT_ACTIVE'; end if;
  if p_round_index > v_run.current_round_index then raise exception using errcode='P0001', message='ROUND_OUT_OF_ORDER', hint='RETRYABLE'; end if;
  if p_round_index < v_run.current_round_index then raise exception using errcode='P0001', message='ROUND_ALREADY_CLOSED'; end if;
  select s.* into v_state from public.station_challenge_round_states s where s.run_id = v_run.id and s.round_index = p_round_index for update;
  if v_state.id is null or v_state.closed or v_state.open_encounter_id is null then raise exception using errcode='P0001', message='ROUND_ALREADY_CLOSED'; end if;
  if p_attempt_number > v_state.attempt_count + 1 then raise exception using errcode='P0001', message='ATTEMPT_OUT_OF_ORDER', hint='RETRYABLE'; end if;
  if p_attempt_number <> v_state.attempt_count + 1 then raise exception using errcode='P0001', message='ATTEMPT_ALREADY_RECORDED'; end if;

  select d.* into v_def from public.station_challenge_definitions d where d.id = v_run.challenge_definition_id;
  if v_def.status not in ('ACTIVE','RETIRED') then raise exception using errcode='P0001', message='CHALLENGE_NOT_ACTIVE'; end if;
  for v_answer in select value from jsonb_array_elements(p_answers) loop
    if not public.challenge_action_shape_ok(v_def.game_code, v_answer->'answerPayload') then
      raise exception using errcode='P0001', message='ACTION_SHAPE_INVALID';
    end if;
  end loop;

  -- Lock the session row before the runtime touches it (same order as runtime_submit_attempt).
  perform 1 from public.sessions where id = v_run.session_id for update;

  -- Authoritative evaluation: the existing runtime, same idempotency key, fresh encounter per attempt.
  v_lr := public.runtime_submit_attempt(v_run.session_id, v_state.open_encounter_id, 1, v_expected_key, p_answers);
  v_correct := coalesce((v_lr->'attempt'->'evaluation_payload'->>'correct')::boolean, false);
  v_score := coalesce((v_lr->'attempt'->>'score')::numeric, 0);
  v_max := coalesce((v_lr->'attempt'->>'max_score')::numeric, 1);
  v_eval_version := v_lr->'attempt'->>'evaluator_version';
  if v_eval_version is distinct from v_def.evaluator_version then raise exception using errcode='P0001', message='EVALUATOR_VERSION_MISMATCH'; end if;

  v_attempt_level := v_state.current_level;
  insert into public.station_challenge_attempt_links(run_id, round_index, attempt_number, encounter_id, attempt_id, evidence_id, difficulty_level, scaffolded)
  values (v_run.id, p_round_index, p_attempt_number, v_state.open_encounter_id, (v_lr->'attempt'->>'id')::uuid, nullif(v_lr->'evidence'->>'id','')::uuid, v_attempt_level, v_attempt_level = 'SUPPORTED');

  v_step_down := coalesce((v_def.difficulty_policy->>'stepDownAfterWrongAttempts')::int, 2);
  v_max_attempts := v_step_down + 1;
  update public.station_challenge_round_states set
    attempt_count = attempt_count + 1,
    wrong_attempt_count = wrong_attempt_count + case when v_correct then 0 else 1 end,
    solved = v_correct,
    closed = v_correct or (attempt_count + 1) >= v_max_attempts,
    open_encounter_id = null
  where id = v_state.id
  returning * into v_state;

  if not v_state.closed then
    v_level := case when coalesce(v_def.difficulty_policy->>'mode','STEP_ADAPTIVE') <> 'FIXED' and v_state.wrong_attempt_count >= v_step_down then 'SUPPORTED' else v_state.start_level end;
    v_scaffold_next := v_level = 'SUPPORTED' and v_attempt_level <> 'SUPPORTED';
    if v_level = 'SUPPORTED' then update public.station_challenge_round_states set scaffolded = true where id = v_state.id; end if;
    v_next := public.challenge_open_encounter(v_run.id, p_round_index, v_level);
  elsif p_round_index + 1 < v_def.rounds then
    update public.station_challenge_runs set current_round_index = p_round_index + 1 where id = v_run.id;
    v_level := public.challenge_level_for_next_round(v_def, v_run.id);
    update public.station_challenge_round_states set start_level = v_level, current_level = v_level where run_id = v_run.id and round_index = p_round_index + 1;
    v_next := public.challenge_open_encounter(v_run.id, p_round_index + 1, v_level);
  else
    perform public.challenge_finalize_run(v_run.id, false);
  end if;

  select * into v_run from public.station_challenge_runs where id = v_run.id;
  if v_run.status <> 'ACTIVE' then v_result := public.challenge_result_view(v_run); end if;

  v_response := jsonb_build_object(
    'idempotent', false,
    'runId', v_run.id,
    'roundIndex', p_round_index,
    'attemptNumber', p_attempt_number,
    'correct', v_correct,
    'score', v_score,
    'maxScore', v_max,
    'evaluatorVersion', v_eval_version,
    'semanticEvent', case when v_correct then 'ANSWER_CORRECT' when v_score > 0 then 'NEAR_MISS' else 'ANSWER_WRONG' end,
    'roundClosed', v_state.closed,
    'roundSolved', v_state.solved,
    'scaffoldNext', v_scaffold_next,
    'offerHint', not v_state.closed and v_state.wrong_attempt_count >= coalesce((v_def.hint_policy->>'offerAfterWrongAttempts')::int, 1),
    'evidenceId', v_lr->'evidence'->>'id',
    'next', v_next,
    'runStatus', v_run.status,
    'result', v_result
  );
  insert into public.station_challenge_round_submissions(run_id, round_index, attempt_number, idempotency_key, request_fingerprint, runtime_result)
  values (v_run.id, p_round_index, p_attempt_number, v_expected_key, v_fingerprint, v_response);
  return v_response;
exception
  when unique_violation then
    raise exception using errcode='P0001', message='IDEMPOTENCY_RACE_RETRY', hint='RETRYABLE';
end;
$$;

create or replace function public.runtime_request_challenge_hint(
  p_run_id uuid,
  p_round_index integer,
  p_hint_index integer,
  p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_run public.station_challenge_runs;
  v_def public.station_challenge_definitions;
  v_state public.station_challenge_round_states;
  v_ladder jsonb;
  v_level text;
  v_expected_key text;
begin
  v_identity := public.challenge_current_identity();
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  if p_hint_index is null or p_hint_index < 0 then raise exception using errcode='P0001', message='HINT_OUT_OF_ORDER'; end if;
  select r.* into v_run from public.station_challenge_runs r where r.id = p_run_id and r.learning_identity_id = v_identity.id for update;
  if v_run.id is null then raise exception using errcode='P0001', message='CHALLENGE_RUN_NOT_FOUND'; end if;
  v_expected_key := 'challenge:v1:hint:' || v_run.id || ':r' || p_round_index || ':h' || p_hint_index;
  if p_idempotency_key <> v_expected_key then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  select s.* into v_state from public.station_challenge_round_states s where s.run_id = v_run.id and s.round_index = p_round_index for update;
  if v_state.id is null then raise exception using errcode='P0001', message='ROUND_NOT_FOUND'; end if;
  select d.* into v_def from public.station_challenge_definitions d where d.id = v_run.challenge_definition_id;
  v_ladder := coalesce(v_def.hint_policy->'ladder', '["STRATEGY","REPRESENTATION","WORKED_STEP"]'::jsonb);
  v_level := v_ladder->>least(p_hint_index, jsonb_array_length(v_ladder) - 1);

  if exists (select 1 from public.station_challenge_hint_receipts h where h.run_id = v_run.id and h.idempotency_key = v_expected_key) then
    return jsonb_build_object('idempotent', true, 'runId', v_run.id, 'roundIndex', p_round_index, 'hintLevel', v_level, 'hintsUsed', v_state.hints_used, 'reducesReward', false, 'revealsFinalAnswer', false);
  end if;
  if v_run.status <> 'ACTIVE' or v_state.closed then raise exception using errcode='P0001', message='ROUND_ALREADY_CLOSED'; end if;
  if p_hint_index <> v_state.hints_used then raise exception using errcode='P0001', message='HINT_OUT_OF_ORDER', hint='RETRYABLE'; end if;

  insert into public.station_challenge_hint_receipts(run_id, round_index, hint_index, idempotency_key, hint_level)
  values (v_run.id, p_round_index, p_hint_index, v_expected_key, v_level);
  update public.station_challenge_round_states set hints_used = hints_used + 1 where id = v_state.id returning * into v_state;
  return jsonb_build_object('idempotent', false, 'runId', v_run.id, 'roundIndex', p_round_index, 'hintLevel', v_level, 'hintsUsed', v_state.hints_used, 'reducesReward', false, 'revealsFinalAnswer', false);
end;
$$;

-- Early exit only (EXITED → ABANDONED); completing the last round finalises inside submit.
create or replace function public.runtime_finish_challenge(p_run_id uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_run public.station_challenge_runs;
begin
  v_identity := public.challenge_current_identity();
  select r.* into v_run from public.station_challenge_runs r where r.id = p_run_id and r.learning_identity_id = v_identity.id for update;
  if v_run.id is null then raise exception using errcode='P0001', message='CHALLENGE_RUN_NOT_FOUND'; end if;
  if v_run.status = 'ACTIVE' then
    if p_reason is distinct from 'EXITED' then raise exception using errcode='P0001', message='FINISH_REASON_INVALID'; end if;
    perform public.challenge_finalize_run(v_run.id, true);
    select * into v_run from public.station_challenge_runs where id = p_run_id;
  end if;
  return public.challenge_result_view(v_run);
end;
$$;

create or replace function public.runtime_get_challenge_run(p_run_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_run public.station_challenge_runs;
begin
  v_identity := public.challenge_current_identity();
  select r.* into v_run from public.station_challenge_runs r where r.id = p_run_id and r.learning_identity_id = v_identity.id;
  if v_run.id is null then raise exception using errcode='P0001', message='CHALLENGE_RUN_NOT_FOUND'; end if;
  return public.challenge_run_view(v_run.id, true);
end;
$$;

revoke all on function public.runtime_get_station_challenge(text) from public;
revoke all on function public.runtime_start_challenge(uuid,uuid,text) from public;
revoke all on function public.runtime_submit_challenge_round(uuid,integer,integer,text,text,jsonb) from public;
revoke all on function public.runtime_request_challenge_hint(uuid,integer,integer,text) from public;
revoke all on function public.runtime_finish_challenge(uuid,text) from public;
revoke all on function public.runtime_get_challenge_run(uuid) from public;
grant execute on function public.runtime_get_station_challenge(text) to authenticated;
grant execute on function public.runtime_start_challenge(uuid,uuid,text) to authenticated;
grant execute on function public.runtime_submit_challenge_round(uuid,integer,integer,text,text,jsonb) to authenticated;
grant execute on function public.runtime_request_challenge_hint(uuid,integer,integer,text) to authenticated;
grant execute on function public.runtime_finish_challenge(uuid,text) to authenticated;
grant execute on function public.runtime_get_challenge_run(uuid) to authenticated;
