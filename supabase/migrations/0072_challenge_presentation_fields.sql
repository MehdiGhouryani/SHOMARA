-- P10 readiness (Phase 0+1): surface title + display + sequence from metadata.presentation
-- in challenge_run_view / challenge_open_encounter so mobile can render generic MC
-- without hard-coding ST01. No evaluator / answer-key fields are exposed.

create or replace function public.challenge_run_view(p_run_id uuid, p_idempotent boolean, p_next jsonb default null)
returns jsonb language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  v_run public.station_challenge_runs;
  v_def public.station_challenge_definitions;
  v_state public.station_challenge_round_states;
  v_next jsonb := p_next;
  v_content public.content_versions;
  v_pres jsonb;
begin
  select * into v_run from public.station_challenge_runs where id = p_run_id;
  select * into v_def from public.station_challenge_definitions where id = v_run.challenge_definition_id;
  if v_next is null and v_run.status = 'ACTIVE' then
    select * into v_state from public.station_challenge_round_states where run_id = v_run.id and round_index = v_run.current_round_index;
    if v_state.open_encounter_id is not null then
      select cv.* into v_content from public.encounters e join public.content_versions cv on cv.id = e.content_version_id where e.id = v_state.open_encounter_id;
      v_pres := coalesce(v_content.metadata->'presentation', '{}'::jsonb);
      v_next := jsonb_build_object(
        'encounterId', v_state.open_encounter_id,
        'roundIndex', v_state.round_index,
        'attemptNumber', v_state.attempt_count + 1,
        'level', v_state.current_level,
        'skillId', v_state.skill_code,
        'contentVersionId', v_content.id,
        'interactionType', v_content.interaction_type,
        'prompt', v_content.prompt,
        'title', v_pres->>'title',
        'options', coalesce(v_pres->'options', '[]'::jsonb),
        'display', v_pres->>'display',
        'sequence', v_pres->'sequence',
        'content', jsonb_build_object(
          'prompt', v_content.prompt,
          'interactionType', v_content.interaction_type,
          'title', v_pres->>'title',
          'options', coalesce(v_pres->'options', '[]'::jsonb),
          'display', v_pres->>'display',
          'sequence', v_pres->'sequence',
          'questions', coalesce(v_pres->'questions', '[]'::jsonb),
          'visualCount', v_pres->'visualCount'
        )
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

-- Enrich challenge_open_encounter so fresh starts carry the same presentation fields.
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
  v_content public.content_versions;
  v_pres jsonb;
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
  select coalesce(max(e.sequence), 0) + 1 into v_sequence from public.encounters e where e.session_id = v_run.session_id;
  v_encounter := public.runtime_create_encounter(v_run.session_id, v_sequence, v_variant.content_version_id, v_station_code, v_variant.skill_code, null, null, null);
  update public.station_challenge_round_states
    set current_level = v_variant.difficulty_level, open_encounter_id = (v_encounter->>'id')::uuid, encounter_count = encounter_count + 1
  where id = v_state.id;
  select * into v_content from public.content_versions where id = v_variant.content_version_id;
  v_pres := coalesce(v_content.metadata->'presentation', '{}'::jsonb);
  return jsonb_build_object(
    'encounterId', v_encounter->>'id',
    'roundIndex', p_round_index,
    'attemptNumber', v_state.attempt_count + 1,
    'level', v_variant.difficulty_level,
    'skillId', v_variant.skill_code,
    'contentVersionId', v_variant.content_version_id,
    'interactionType', coalesce(v_content.interaction_type, v_encounter->'content'->>'interactionType'),
    'prompt', coalesce(v_content.prompt, v_encounter->'content'->>'prompt'),
    'title', v_pres->>'title',
    'options', coalesce(v_pres->'options', '[]'::jsonb),
    'display', v_pres->>'display',
    'sequence', v_pres->'sequence',
    'content', jsonb_build_object(
      'prompt', coalesce(v_content.prompt, v_encounter->'content'->>'prompt'),
      'interactionType', coalesce(v_content.interaction_type, v_encounter->'content'->>'interactionType'),
      'title', v_pres->>'title',
      'options', coalesce(v_pres->'options', '[]'::jsonb),
      'display', v_pres->>'display',
      'sequence', v_pres->'sequence',
      'questions', coalesce(v_pres->'questions', '[]'::jsonb),
      'visualCount', v_pres->'visualCount'
    )
  );
end;
$$;
