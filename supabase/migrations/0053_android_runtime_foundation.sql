-- Phase 2 — Android-first runtime foundation (migration 0053).
-- Goals:
--   1) authoritative session resume/reconciliation
--   2) server-authoritative jump assessment + unlock grant
--   3) append-only jump audit with idempotent replay
--   4) public assessment payload never exposes the answer key

create table if not exists public.progression_jump_assessments (
  id uuid primary key default gen_random_uuid(),
  assessment_code text not null unique,
  from_station_id uuid not null references public.stations(id) on delete restrict,
  target_station_id uuid not null references public.stations(id) on delete restrict,
  target_unit_id text not null,
  title text not null,
  intro text not null,
  questions jsonb not null,
  answer_key jsonb not null,
  pass_threshold numeric(5,4) not null default 0.8000 check (pass_threshold > 0 and pass_threshold <= 1),
  version text not null,
  status text not null default 'ACTIVE' check (status in ('DRAFT','ACTIVE','RETIRED')),
  created_at timestamptz not null default now(),
  unique(target_station_id, version)
);

create table if not exists public.progression_jump_attempts (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  assessment_id uuid not null references public.progression_jump_assessments(id) on delete restrict,
  client_idempotency_key text not null,
  answers_hash text not null,
  correct_count integer not null check (correct_count >= 0),
  total_count integer not null check (total_count > 0),
  passed boolean not null,
  target_station_id uuid not null references public.stations(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(learning_identity_id, client_idempotency_key)
);

create index if not exists progression_jump_attempts_identity_idx
  on public.progression_jump_attempts(learning_identity_id, created_at desc);

alter table public.progression_jump_assessments enable row level security;
alter table public.progression_jump_attempts enable row level security;

-- Child clients never read the secret answer key or write attempts directly.
create policy progression_jump_assessments_admin_read on public.progression_jump_assessments
for select to authenticated
using (public.is_admin());

create policy progression_jump_attempts_access on public.progression_jump_attempts
for select to authenticated
using (public.can_access_learning_identity(learning_identity_id));

revoke all on table public.progression_jump_assessments from anon, authenticated;
revoke all on table public.progression_jump_attempts from anon, authenticated;

delete from public.progression_jump_assessments where assessment_code in ('JUMP-U02','JUMP-U03','JUMP-U04','JUMP-U05');

insert into public.progression_jump_assessments(
  id, assessment_code, from_station_id, target_station_id, target_unit_id,
  title, intro, questions, answer_key, pass_threshold, version, status
) values
(
  '2a460000-0000-4000-8000-000000000002', 'JUMP-U02',
  '21000000-0000-4000-8000-000000000005', '21000000-0000-4000-8000-000000000006', 'G1-U02',
  'آماده‌ای جلوتر بروی؟', 'پنج سؤال کوتاه از چیزهایی که در واحد بعد لازم داری.',
  '[
    {"id":"J02-01","targetStationId":"ST06","prompt":"۳ مهره داریم. ۲ مهره دیگر اضافه کنیم، چندتا می‌شود؟","options":["۴","۵","۶"]},
    {"id":"J02-02","targetStationId":"ST06","prompt":"کدام عدد بزرگ‌تر است؟","options":["۱","۲","۳"]},
    {"id":"J02-03","targetStationId":"ST06","prompt":"جای خالی را پیدا کن: ۱، ۲، __، ۴","options":["۲","۳","۵"]},
    {"id":"J02-04","targetStationId":"ST06","prompt":"۴ تا از ۵ تا کم کنیم، چندتا می‌ماند؟","options":["۱","۲","۳"]},
    {"id":"J02-05","targetStationId":"ST06","prompt":"کدام گروه بیشتر است؟","options":["●●","●●●","●"]}
  ]'::jsonb,
  '[1,2,1,0,1]'::jsonb, 0.8000, 'v1', 'ACTIVE'
),(
  '2a460000-0000-4000-8000-000000000003', 'JUMP-U03',
  '21000000-0000-4000-8000-000000000010', '21000000-0000-4000-8000-000000000011', 'G1-U03',
  'یک پرش دیگر؟', 'مهارت‌های پایه را در پنج سؤال بررسی کن.',
  '[
    {"id":"J03-01","targetStationId":"ST11","prompt":"۷ و ۸؛ کدام بزرگ‌تر است؟","options":["۷","۸","هر دو"]},
    {"id":"J03-02","targetStationId":"ST11","prompt":"۲ + ۳ = ؟","options":["۴","۵","۶"]},
    {"id":"J03-03","targetStationId":"ST11","prompt":"کدام دو گروه برابرند؟","options":["●● و ●","●● و ●●","● و ●●●"]},
    {"id":"J03-04","targetStationId":"ST11","prompt":"۹ بعد از کدام عدد می‌آید؟","options":["۷","۸","۱۰"]},
    {"id":"J03-05","targetStationId":"ST11","prompt":"۵ − ۲ = ؟","options":["۲","۳","۴"]}
  ]'::jsonb,
  '[1,1,1,1,1]'::jsonb, 0.8000, 'v1', 'ACTIVE'
),(
  '2a460000-0000-4000-8000-000000000004', 'JUMP-U04',
  '21000000-0000-4000-8000-000000000015', '21000000-0000-4000-8000-000000000016', 'G1-U04',
  'می‌خواهی جلوتر بروی؟', 'پنج سؤال از جمع، تفریق و عددها.',
  '[
    {"id":"J04-01","targetStationId":"ST16","prompt":"۶ + ۴ = ؟","options":["۹","۱۰","۱۱"]},
    {"id":"J04-02","targetStationId":"ST16","prompt":"۱۲ بعد از کدام عدد می‌آید؟","options":["۱۰","۱۱","۱۳"]},
    {"id":"J04-03","targetStationId":"ST16","prompt":"۱۴ − ۵ = ؟","options":["۸","۹","۱۰"]},
    {"id":"J04-04","targetStationId":"ST16","prompt":"کدام عدد کوچک‌تر است؟","options":["۱۶","۱۳","۱۵"]},
    {"id":"J04-05","targetStationId":"ST16","prompt":"۸ + ۲ = ؟","options":["۹","۱۰","۱۲"]}
  ]'::jsonb,
  '[1,1,1,1,1]'::jsonb, 0.8000, 'v1', 'ACTIVE'
),(
  '2a460000-0000-4000-8000-000000000005', 'JUMP-U05',
  '21000000-0000-4000-8000-000000000020', '21000000-0000-4000-8000-000000000021', 'G1-U05',
  'آماده آخرین بخش؟', 'پنج سؤال برای سنجیدن آمادگی واحد بعد.',
  '[
    {"id":"J05-01","targetStationId":"ST21","prompt":"۲۰ + ۵ = ؟","options":["۲۳","۲۵","۳۰"]},
    {"id":"J05-02","targetStationId":"ST21","prompt":"کدام عدد به ۳۰ نزدیک‌تر است؟","options":["۲۴","۲۹","۳۵"]},
    {"id":"J05-03","targetStationId":"ST21","prompt":"۳۰ − ۱۰ = ؟","options":["۱۰","۲۰","۳۰"]},
    {"id":"J05-04","targetStationId":"ST21","prompt":"بعد از ۳۹ کدام عدد می‌آید؟","options":["۳۸","۴۰","۴۱"]},
    {"id":"J05-05","targetStationId":"ST21","prompt":"کدام تعداد بیشتر است؟","options":["۱۰","۸","۹"]}
  ]'::jsonb,
  '[1,1,1,1,0]'::jsonb, 0.8000, 'v1', 'ACTIVE'
);

create or replace function public.progression_get_jump_assessment(p_target_station_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_assessment public.progression_jump_assessments;
begin
  if auth.uid() is null then
    raise exception using errcode='P0001', message='AUTH_REQUIRED';
  end if;

  select ja.* into v_assessment
  from public.progression_jump_assessments ja
  join public.stations st on st.id = ja.target_station_id
  where st.code = p_target_station_code
    and st.status = 'ACTIVE'
    and ja.status = 'ACTIVE'
  order by ja.created_at desc
  limit 1;

  if v_assessment.id is null then
    raise exception using errcode='P0001', message='JUMP_ASSESSMENT_NOT_FOUND';
  end if;

  return jsonb_build_object(
    'id', v_assessment.assessment_code,
    'targetUnitId', v_assessment.target_unit_id,
    'targetStationId', replace((select code from public.stations where id=v_assessment.target_station_id), 'G1-', ''),
    'title', v_assessment.title,
    'intro', v_assessment.intro,
    'questions', v_assessment.questions
  );
end;
$$;

create or replace function public.progression_submit_jump_assessment(
  p_assessment_code text,
  p_answers jsonb,
  p_client_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_identity public.learning_identities;
  v_assessment public.progression_jump_assessments;
  v_attempt public.progression_jump_attempts;
  v_target public.stations;
  v_from public.stations;
  v_key jsonb;
  v_questions jsonb;
  v_item jsonb;
  v_answer jsonb;
  v_question_id text;
  v_question_index int;
  v_answer_index int;
  v_correct_count int := 0;
  v_total_count int;
  v_passed boolean;
  v_expected int;
  v_hash text;
  v_unlock_id uuid;
  v_distinct_sessions int := 0;
  v_required_prereq boolean := false;
begin
  if auth.uid() is null then raise exception using errcode='P0001', message='AUTH_REQUIRED'; end if;
  if p_assessment_code is null or length(trim(p_assessment_code)) < 6 then raise exception using errcode='P0001', message='JUMP_ASSESSMENT_INVALID'; end if;
  if p_client_idempotency_key is null or length(trim(p_client_idempotency_key)) < 16 then raise exception using errcode='P0001', message='IDEMPOTENCY_KEY_INVALID'; end if;
  if jsonb_typeof(p_answers) <> 'object' then raise exception using errcode='P0001', message='JUMP_ANSWERS_INVALID'; end if;

  select li.* into v_identity
  from public.learning_identities li
  where li.account_id = auth.uid() and li.status='ACTIVE'
  order by li.created_at asc limit 1;
  if v_identity.id is null then raise exception using errcode='P0001', message='LEARNING_IDENTITY_NOT_FOUND'; end if;

  select * into v_assessment
  from public.progression_jump_assessments
  where assessment_code = p_assessment_code and status='ACTIVE';
  if v_assessment.id is null then raise exception using errcode='P0001', message='JUMP_ASSESSMENT_NOT_FOUND'; end if;

  -- Validate the assessment context before looking up idempotency so a reused key
  -- can never accidentally disclose or replay a different assessment.
  select * into v_attempt
  from public.progression_jump_attempts
  where learning_identity_id = v_identity.id
    and client_idempotency_key = p_client_idempotency_key
  for update;
  if v_attempt.id is not null then
    if v_attempt.assessment_id <> v_assessment.id then
      raise exception using errcode='P0001', message='IDEMPOTENCY_CONTEXT_MISMATCH';
    end if;
    return jsonb_build_object(
      'ok', true,
      'assessmentId', p_assessment_code,
      'targetStationId', replace((select code from public.stations where id=v_attempt.target_station_id), 'G1-', ''),
      'targetUnitId', v_assessment.target_unit_id,
      'correctCount', v_attempt.correct_count,
      'totalCount', v_attempt.total_count,
      'passed', v_attempt.passed,
      'unlockGranted', v_attempt.passed,
      'idempotentReplay', true
    );
  end if;

  select * into v_target from public.stations where id=v_assessment.target_station_id and status='ACTIVE';
  select * into v_from from public.stations where id=v_assessment.from_station_id and status='ACTIVE';
  if v_target.id is null or v_from.id is null then raise exception using errcode='P0001', message='JUMP_TARGET_NOT_FOUND'; end if;

  select count(*) into v_distinct_sessions
  from (
    select distinct scr.session_id
    from public.station_check_results scr
    where scr.learning_identity_id=v_identity.id
      and scr.station_id=v_from.id
      and scr.passed_check=true
      and scr.check_group='STATION_PASS'
  ) q;
  v_required_prereq := v_distinct_sessions >= 2;
  if not v_required_prereq then
    raise exception using errcode='P0001', message='JUMP_PREREQUISITE_NOT_MET';
  end if;

  v_questions := v_assessment.questions;
  v_total_count := jsonb_array_length(v_questions);
  if jsonb_object_length(p_answers) <> v_total_count then
    raise exception using errcode='P0001', message='JUMP_ANSWERS_INCOMPLETE';
  end if;

  for v_question_index in 0..(v_total_count-1) loop
    v_item := v_questions -> v_question_index;
    v_question_id := v_item ->> 'id';
    if not (p_answers ? v_question_id) then
      raise exception using errcode='P0001', message='JUMP_ANSWERS_INCOMPLETE';
    end if;
    v_answer := p_answers -> v_question_id;
    if jsonb_typeof(v_answer) <> 'number' or (v_answer::text !~ '^[0-9]+$') then
      raise exception using errcode='P0001', message='JUMP_ANSWER_INVALID';
    end if;
    v_answer_index := (v_answer #>> '{}')::int;
    if v_answer_index < 0 or v_answer_index >= jsonb_array_length(v_item->'options') then
      raise exception using errcode='P0001', message='JUMP_ANSWER_INVALID';
    end if;
    v_expected := (v_assessment.answer_key ->> v_question_index::text)::int;
    if v_answer_index = v_expected then v_correct_count := v_correct_count + 1; end if;
  end loop;

  v_passed := (v_correct_count::numeric / v_total_count::numeric) >= v_assessment.pass_threshold;
  v_hash := encode(digest(p_answers::text, 'sha256'), 'hex');

  insert into public.progression_jump_attempts(
    learning_identity_id, assessment_id, client_idempotency_key, answers_hash,
    correct_count, total_count, passed, target_station_id
  ) values (
    v_identity.id, v_assessment.id, p_client_idempotency_key, v_hash,
    v_correct_count, v_total_count, v_passed, v_target.id
  ) on conflict (learning_identity_id, client_idempotency_key) do nothing
  returning * into v_attempt;

  -- Concurrent replay: the unique idempotency key belongs to the first committed
  -- attempt. Re-read it and return the canonical result rather than surfacing a
  -- transient unique-constraint failure to the child app.
  if v_attempt.id is null then
    select * into v_attempt
    from public.progression_jump_attempts
    where learning_identity_id=v_identity.id
      and client_idempotency_key=p_client_idempotency_key
    for update;
    if v_attempt.assessment_id <> v_assessment.id then
      raise exception using errcode='P0001', message='IDEMPOTENCY_CONTEXT_MISMATCH';
    end if;
    return jsonb_build_object(
      'ok', true,
      'assessmentId', p_assessment_code,
      'targetStationId', replace((select code from public.stations where id=v_attempt.target_station_id), 'G1-', ''),
      'targetUnitId', v_assessment.target_unit_id,
      'correctCount', v_attempt.correct_count,
      'totalCount', v_attempt.total_count,
      'passed', v_attempt.passed,
      'unlockGranted', v_attempt.passed,
      'idempotentReplay', true
    );
  end if;

  if v_passed then
    insert into public.unlocks(
      learning_identity_id, progression_milestone_id, unlock_type, target_ref, status
    ) values (
      v_identity.id,
      null,
      'JUMP_STATION',
      v_target.id,
      'GRANTED'
    )
    on conflict (learning_identity_id, unlock_type, target_ref)
    do update set status='GRANTED', granted_at=least(public.unlocks.granted_at, now())
    returning id into v_unlock_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'assessmentId', v_assessment.assessment_code,
    'targetStationId', replace(v_target.code, 'G1-', ''),
    'targetUnitId', v_assessment.target_unit_id,
    'correctCount', v_correct_count,
    'totalCount', v_total_count,
    'passed', v_passed,
    'unlockGranted', (v_unlock_id is not null),
    'idempotentReplay', false
  );
end;
$$;

create or replace function public.runtime_resume_session(
  p_session_id uuid,
  p_client_installation_id uuid default null
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
  v_station_code text;
  v_skill_code text;
  v_interaction_type text;
  v_prompt text;
  v_answer_schema jsonb;
  v_presentation jsonb;
  v_logical_id text;
  v_title text;
  v_station_options jsonb;
  v_questions jsonb;
  v_visual_count integer;
begin
  if auth.uid() is null then raise exception using errcode='P0001', message='AUTH_REQUIRED'; end if;

  select li.* into v_identity
  from public.learning_identities li
  where li.account_id=auth.uid() and li.status='ACTIVE'
  order by li.created_at asc limit 1;
  if v_identity.id is null then raise exception using errcode='P0001', message='LEARNING_IDENTITY_NOT_FOUND'; end if;

  select s.* into v_session
  from public.sessions s
  where s.id=p_session_id and s.learning_identity_id=v_identity.id
  for update;
  if v_session.id is null then raise exception using errcode='P0001', message='SESSION_NOT_FOUND'; end if;

  if p_client_installation_id is not null and not exists (
    select 1 from public.client_installations ci
    where ci.id=p_client_installation_id and ci.account_id=auth.uid() and ci.status='ACTIVE'
  ) then raise exception using errcode='P0001', message='CLIENT_INSTALLATION_FORBIDDEN'; end if;

  if v_session.status='ABANDONED' then
    raise exception using errcode='P0001', message='SESSION_ABANDONED';
  end if;

  if v_session.status in ('CREATED','INTERRUPTED') then
    update public.sessions
    set status='ACTIVE',
        last_activity_at=now(),
        last_resumed_by_client_installation_id=coalesce(p_client_installation_id, last_resumed_by_client_installation_id)
    where id=v_session.id
    returning * into v_session;
  else
    update public.sessions
    set last_activity_at=now(),
        last_resumed_by_client_installation_id=coalesce(p_client_installation_id, last_resumed_by_client_installation_id)
    where id=v_session.id
    returning * into v_session;
  end if;

  select e.* into v_encounter
  from public.encounters e
  where e.session_id=v_session.id
  order by e.sequence desc, e.created_at desc
  limit 1;

  if v_encounter.id is not null then
    select st.code into v_station_code from public.stations st where st.id=v_encounter.station_id;
    select sk.code into v_skill_code from public.skills sk where sk.id=v_encounter.skill_id;
    select cv.interaction_type, cv.prompt, cv.answer_schema,
           coalesce(cv.metadata->'presentation','{}'::jsonb)
      into v_interaction_type, v_prompt, v_answer_schema, v_presentation
    from public.content_versions cv
    where cv.id=v_encounter.content_version_id;
    if jsonb_typeof(v_presentation) <> 'object' then
      raise exception using errcode='P0001', message='CONTENT_PRESENTATION_MISSING';
    end if;
    v_logical_id := coalesce(v_presentation->>'logicalEncounter', v_presentation->>'id', (select ca.artifact_code from public.content_artifacts ca where ca.id=(select cv.content_artifact_id from public.content_versions cv where cv.id=v_encounter.content_version_id)));
    v_title := coalesce(v_presentation->>'title', (select st.title from public.stations st where st.id=v_encounter.station_id));
    v_station_options := coalesce(v_presentation->'options','[]'::jsonb);
    v_questions := coalesce(v_presentation->'questions','[]'::jsonb);
    v_visual_count := case when (v_presentation ? 'visualCount') and jsonb_typeof(v_presentation->'visualCount')='number' then (v_presentation->>'visualCount')::integer else null end;
  end if;

  return jsonb_build_object(
    'session', jsonb_build_object(
      'id', v_session.id,
      'learningIdentityId', v_session.learning_identity_id,
      'gradeId', v_session.grade_id,
      'curriculumVersionId', v_session.curriculum_version_id,
      'skillGraphVersionId', v_session.skill_graph_version_id,
      'relationshipContextId', v_session.relationship_context_id,
      'sessionType', v_session.session_type,
      'status', v_session.status,
      'startedAt', v_session.started_at,
      'lastActivityAt', v_session.last_activity_at,
      'completedAt', v_session.completed_at,
      'lastResumedByClientInstallationId', v_session.last_resumed_by_client_installation_id
    ),
    'latestEncounter', case when v_encounter.id is null then null else jsonb_build_object(
      'id', v_encounter.id,
      'sequence', v_encounter.sequence,
      'stationId', v_station_code,
      'skillId', v_skill_code,
      'learningObjectiveId', v_encounter.learning_objective_id,
      'contentVersionId', v_encounter.content_version_id,
      'learningRole', v_encounter.learning_role,
      'experienceForm', v_encounter.experience_form,
      'status', v_encounter.status,
      'createdAt', v_encounter.created_at,
      'completedAt', v_encounter.completed_at,
      'content', jsonb_build_object(
        'id', v_logical_id,
        'title', v_title,
        'prompt', v_prompt,
        'stationId', v_station_code,
        'skillId', v_skill_code,
        'learningRole', v_encounter.learning_role,
        'experienceForm', v_encounter.experience_form,
        'interactionType', v_interaction_type,
        'contentVersionId', v_encounter.content_version_id,
        'options', v_station_options,
        'questions', v_questions,
        'visualCount', v_visual_count
      )
    ) end
  );
end;
$$;



-- Every Android client gets a stable per-installation identifier stored by the
-- app and bound to the authenticated account here. Direct client table writes
-- are disabled; registration happens through this security-definer RPC only.
create or replace function public.runtime_register_client_installation(
  p_installation_id uuid,
  p_platform text,
  p_app_version text default null,
  p_device_model text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_identity public.learning_identities;
  v_installation public.client_installations;
begin
  if auth.uid() is null then raise exception using errcode='P0001', message='AUTH_REQUIRED'; end if;
  if p_installation_id is null then raise exception using errcode='P0001', message='CLIENT_INSTALLATION_ID_REQUIRED'; end if;
  if p_platform not in ('ANDROID','IOS','WEB') then raise exception using errcode='P0001', message='CLIENT_INSTALLATION_PLATFORM_INVALID'; end if;

  select * into v_identity
  from public.learning_identities
  where account_id=auth.uid() and status='ACTIVE'
  order by created_at asc
  limit 1;
  if v_identity.id is null then raise exception using errcode='P0001', message='LEARNING_IDENTITY_NOT_FOUND'; end if;

  select * into v_installation
  from public.client_installations
  where id=p_installation_id
  for update;

  if v_installation.id is not null and v_installation.account_id is distinct from auth.uid() then
    raise exception using errcode='P0001', message='CLIENT_INSTALLATION_FORBIDDEN';
  end if;

  if v_installation.id is null then
    insert into public.client_installations(
      id, account_id, learning_identity_id, platform, app_version, device_model, status, last_seen_at
    ) values (
      p_installation_id, auth.uid(), v_identity.id, p_platform, nullif(trim(p_app_version), ''),
      nullif(trim(p_device_model), ''), 'ACTIVE', now()
    ) returning * into v_installation;
  else
    update public.client_installations
    set learning_identity_id=v_identity.id,
        platform=p_platform,
        app_version=coalesce(nullif(trim(p_app_version), ''), app_version),
        device_model=coalesce(nullif(trim(p_device_model), ''), device_model),
        status='ACTIVE',
        revoked_at=null,
        last_seen_at=now()
    where id=v_installation.id
    returning * into v_installation;
  end if;

  return jsonb_build_object(
    'id', v_installation.id,
    'learningIdentityId', v_installation.learning_identity_id,
    'platform', v_installation.platform,
    'appVersion', v_installation.app_version,
    'deviceModel', v_installation.device_model,
    'status', v_installation.status,
    'lastSeenAt', v_installation.last_seen_at
  );
end;
$$;

revoke insert, update, delete on public.client_installations from authenticated;
revoke insert, update, delete on public.client_installations from anon;
revoke all on function public.runtime_register_client_installation(uuid,text,text,text) from public;
grant execute on function public.runtime_register_client_installation(uuid,text,text,text) to authenticated;

comment on function public.runtime_register_client_installation(uuid,text,text,text) is
'Registers or refreshes an Android-first client installation through an authenticated server boundary; child clients never write the installation table directly.';



-- 0046_st01_content_canonical_approval already established canonical approval in
-- provenance. Normalize the presentation-facing metadata to the same status so
-- clients, audits, and release tooling cannot observe contradictory states.
update public.content_versions cv
set metadata = jsonb_set(coalesce(cv.metadata, '{}'::jsonb), '{approvalStatus}', '"CANONICAL_APPROVED"'::jsonb, true)
where cv.content_artifact_id in (
  select ca.id from public.content_artifacts ca
  where ca.station_id = '21000000-0000-4000-8000-000000000001'
);

revoke all on function public.progression_get_jump_assessment(text) from public;
revoke all on function public.progression_submit_jump_assessment(text,jsonb,text) from public;
revoke all on function public.runtime_resume_session(uuid,uuid) from public;
grant execute on function public.progression_get_jump_assessment(text) to authenticated;
grant execute on function public.progression_submit_jump_assessment(text,jsonb,text) to authenticated;
grant execute on function public.runtime_resume_session(uuid,uuid) to authenticated;

comment on function public.progression_submit_jump_assessment(text,jsonb,text) is
'Android-first server-authoritative Jump Assessment. Evaluates secret answer key, requires prior Station Pass evidence, records idempotent attempt, and grants JUMP_STATION unlock atomically.';

comment on function public.runtime_resume_session(uuid,uuid) is
'Authoritative session resume/reconciliation boundary. Re-activates CREATED/INTERRUPTED sessions, updates resume provenance, and returns only child-safe latest encounter content.';

-- Canonical child-safe presentation data for the Android ST01 vertical slice.
-- expectedAnswers stay only in evaluator_config; presentation contains no answer key.
update public.content_versions cv
set metadata = cv.metadata || jsonb_build_object('presentation', p.presentation)
from (
  values
    ('26000000-0000-4000-8000-000000000001'::uuid, jsonb_build_object('title','اول بشماریم')),
    ('26000000-0000-4000-8000-000000000002'::uuid, jsonb_build_object('title','یه انتخاب کوچولو','options',jsonb_build_array('★ ★','★ ★ ★','★ ★ ★ ★'))),
    ('26000000-0000-4000-8000-000000000003'::uuid, jsonb_build_object('title','مسیر الگو','options',jsonb_build_array('زرد','آبی','سبز'))),
    ('26000000-0000-4000-8000-000000000004'::uuid, jsonb_build_object('title','شکار شمارش','options',jsonb_build_array('۲','۳','۴'),'visualCount',3)),
    ('26000000-0000-4000-8000-000000000005'::uuid, jsonb_build_object('title','تمرین مستقل','options',jsonb_build_array('۲','۳','۴'),'visualCount',3)),
    ('26000000-0000-4000-8000-000000000006'::uuid, jsonb_build_object('title','مرور الگو','options',jsonb_build_array('زرد','آبی','سبز'))),
    ('26000000-0000-4000-8000-000000000007'::uuid, jsonb_build_object('title','چالش اول','questions',jsonb_build_array(
      jsonb_build_object('prompt','چند ستاره؟','options',jsonb_build_array('۲','۳','۴','۵'),'visualCount',3),
      jsonb_build_object('prompt','چند ستاره؟','options',jsonb_build_array('۱','۲','۳','۴'),'visualCount',3),
      jsonb_build_object('prompt','چند ستاره؟','options',jsonb_build_array('۳','۴','۵','۶'),'visualCount',4),
      jsonb_build_object('prompt','چند ستاره؟','options',jsonb_build_array('۱','۲','۳','۴'),'visualCount',2),
      jsonb_build_object('prompt','چند ستاره؟','options',jsonb_build_array('۳','۴','۵','۶'),'visualCount',5)
    ))),
    ('26000000-0000-4000-8000-000000000008'::uuid, jsonb_build_object('title','چالش دوم','questions',jsonb_build_array(
      jsonb_build_object('prompt','چه رنگی جای علامت سؤال می‌آید؟','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','الگو را کامل کن.','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','کدام مهره ادامه الگوست؟','options',jsonb_build_array('قرمز','سبز','آبی')),
      jsonb_build_object('prompt','کدام رنگ باید بیاید؟','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','پایان الگو چیست؟','options',jsonb_build_array('زرد','آبی','سبز'))
    ))),
    ('26000000-0000-4000-8000-000000000009'::uuid, jsonb_build_object('title','دوباره و آهسته‌تر','options',jsonb_build_array('۱','۲','۳'),'visualCount',3)),
    ('26000000-0000-4000-8000-000000000010'::uuid, jsonb_build_object('title','بررسی دوباره','questions',jsonb_build_array(
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۲','۳','۴'),'visualCount',3),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',1),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',2),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',3),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',2)
    ))),
    ('26000000-0000-4000-8000-000000000011'::uuid, jsonb_build_object('title','در دنیای واقعی','options',jsonb_build_array('الگو A','الگو B','الگو C'))),
    ('26000000-0000-4000-8000-000000000012'::uuid, jsonb_build_object('title','چالش نهایی مهارت','questions',jsonb_build_array(
      jsonb_build_object('prompt','گزینه درست چیست؟','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','الگو را کامل کن.','options',jsonb_build_array('قرمز','سبز','آبی')),
      jsonb_build_object('prompt','کدام مورد ادامه الگوست؟','options',jsonb_build_array('سبز','زرد','آبی')),
      jsonb_build_object('prompt','چه رنگی می‌آید؟','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','پایان الگو چیست؟','options',jsonb_build_array('آبی','سبز','زرد'))
    ))),
    ('26000000-0000-4000-8000-000000000013'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E09','title','با هم دوباره','options',jsonb_build_array('۱','۲','۳'),'visualCount',3)),
    ('26000000-0000-4000-8000-000000000014'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E09','title','دوباره و آهسته‌تر','options',jsonb_build_array('۲','۳','۴'),'visualCount',3)),
    ('26000000-0000-4000-8000-000000000015'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E09','title','با هم الگو می‌سازیم','options',jsonb_build_array('زرد','آبی','سبز'))),
    ('26000000-0000-4000-8000-000000000016'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E09','title','قانون الگو را دوباره پیدا کن','options',jsonb_build_array('الگو A','الگو B','الگو C'))),
    ('26000000-0000-4000-8000-000000000017'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E10','title','بررسی دوباره','questions',jsonb_build_array(
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۲','۳','۴'),'visualCount',3),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',1),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',2),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',3),
      jsonb_build_object('prompt','چند ستاره داریم؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',2)
    ))),
    ('26000000-0000-4000-8000-000000000018'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E10','title','بررسی دوباره الگو','questions',jsonb_build_array(
      jsonb_build_object('prompt','چه رنگی می‌آید؟','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','ادامه چیست؟','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','کدام مورد درست است؟','options',jsonb_build_array('قرمز','سبز','آبی')),
      jsonb_build_object('prompt','رنگ بعدی چیست؟','options',jsonb_build_array('زرد','آبی','سبز')),
      jsonb_build_object('prompt','پایان الگو چیست؟','options',jsonb_build_array('زرد','آبی','سبز'))
    ))),
    ('26000000-0000-4000-8000-000000000019'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E10','title','بررسی دوباره تعداد','questions',jsonb_build_array(
      jsonb_build_object('prompt','چند شیء است؟','options',jsonb_build_array('۲','۳','۴'),'visualCount',3),
      jsonb_build_object('prompt','چند شیء است؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',1),
      jsonb_build_object('prompt','چند شیء است؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',2),
      jsonb_build_object('prompt','چند شیء است؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',3),
      jsonb_build_object('prompt','چند شیء است؟','options',jsonb_build_array('۱','۲','۳'),'visualCount',2)
    ))),
    ('26000000-0000-4000-8000-000000000020'::uuid, jsonb_build_object('logicalEncounter','G1-ST01-E10','title','بررسی دوباره قانون الگو','questions',jsonb_build_array(
      jsonb_build_object('prompt','قانون درست چیست؟','options',jsonb_build_array('A','B','C')),
      jsonb_build_object('prompt','کدام ادامه درست است؟','options',jsonb_build_array('A','B','C')),
      jsonb_build_object('prompt','چه چیزی باید بیاید؟','options',jsonb_build_array('A','B','C')),
      jsonb_build_object('prompt','کدام قانون درست است؟','options',jsonb_build_array('A','B','C')),
      jsonb_build_object('prompt','پایان الگو چیست؟','options',jsonb_build_array('A','B','C'))
    )))
) as p(content_version_id, presentation) on cv.id=p.content_version_id;

-- Replace the content payload with a canonical, child-safe representation.
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
  v_presentation jsonb;
  v_logical_id text;
begin
  if p_sequence is null or p_sequence < 1 then raise exception using errcode='P0001', message='ENCOUNTER_SEQUENCE_INVALID'; end if;

  select s.* into v_session
  from public.sessions s
  join public.learning_identities li on li.id=s.learning_identity_id
  where s.id=p_session_id and li.account_id=auth.uid();
  if v_session.id is null then raise exception using errcode='P0001', message='SESSION_FORBIDDEN'; end if;
  if v_session.status <> 'ACTIVE' then raise exception using errcode='P0001', message='SESSION_NOT_ACTIVE'; end if;

  select cv.* into v_content from public.content_versions cv where cv.id=p_content_version_id and cv.status='ACTIVE';
  if v_content.id is null then raise exception using errcode='P0001', message='CONTENT_VERSION_NOT_FOUND'; end if;
  if coalesce(v_content.provenance->>'approvalStatus', '') not in ('CANONICAL_APPROVED','PRODUCTION_APPROVED') then
    raise exception using errcode='P0001', message='CONTENT_NOT_PRODUCTION_APPROVED';
  end if;
  select ca.* into v_artifact from public.content_artifacts ca where ca.id=v_content.content_artifact_id and ca.status='ACTIVE';
  if v_artifact.id is null then raise exception using errcode='P0001', message='CONTENT_ARTIFACT_NOT_FOUND'; end if;
  if v_artifact.grade_id <> v_session.grade_id then raise exception using errcode='P0001', message='CONTENT_GRADE_MISMATCH'; end if;

  select st.* into v_station from public.stations st
  where st.id=v_artifact.station_id and st.code=p_station_code and st.curriculum_version_id=v_session.curriculum_version_id and st.status='ACTIVE';
  if v_station.id is null then raise exception using errcode='P0001', message='STATION_VERSION_INTEGRITY_ERROR'; end if;
  select sk.* into v_skill from public.skills sk where sk.id=v_artifact.skill_id and sk.code=p_skill_code and sk.status in ('ACTIVE','PROVISIONAL');
  if v_skill.id is null then raise exception using errcode='P0001', message='SKILL_VERSION_INTEGRITY_ERROR'; end if;
  if not exists (select 1 from public.station_skills ss where ss.station_id=v_station.id and ss.skill_id=v_skill.id) then raise exception using errcode='P0001', message='STATION_SKILL_MAPPING_NOT_FOUND'; end if;
  if not exists (select 1 from public.skill_graph_nodes sgn where sgn.skill_graph_version_id=v_session.skill_graph_version_id and sgn.skill_id=v_skill.id and sgn.is_active=true) then raise exception using errcode='P0001', message='SKILL_NOT_IN_PINNED_GRAPH'; end if;
  if p_learning_objective_id is not null and not exists (
    select 1 from public.learning_objectives lo where lo.id=p_learning_objective_id and lo.status='ACTIVE' and lo.grade_id=v_session.grade_id and (lo.station_id is null or lo.station_id=v_station.id) and (lo.skill_id is null or lo.skill_id=v_skill.id)
  ) then raise exception using errcode='P0001', message='LEARNING_OBJECTIVE_INTEGRITY_ERROR'; end if;
  if (p_learning_role is not null and p_learning_role<>v_content.learning_role) or (p_experience_form is not null and p_experience_form<>v_content.experience_form) then raise exception using errcode='P0001', message='CONTENT_ROLE_FORM_OVERRIDE_FORBIDDEN'; end if;
  select exists (
    select 1 from public.content_package_items cpi join public.content_packages cp on cp.id=cpi.package_id
    where cpi.content_version_id=v_content.id and cp.status='ACTIVE' and cp.release_channel='STABLE' and cp.grade_id=v_session.grade_id and (cp.station_id is null or cp.station_id=v_station.id) and public.can_access_content_package(cp.id,v_session.learning_identity_id)
  ) into v_package_access;
  if not v_package_access and not public.is_admin() then raise exception using errcode='P0001', message='CONTENT_PACKAGE_FORBIDDEN'; end if;
  if exists (select 1 from public.encounters where session_id=p_session_id and sequence=p_sequence) then raise exception using errcode='P0001', message='ENCOUNTER_SEQUENCE_CONFLICT'; end if;

  insert into public.encounters(session_id,sequence,station_id,skill_id,learning_objective_id,content_version_id,learning_role,experience_form,status)
  values(p_session_id,p_sequence,v_station.id,v_skill.id,p_learning_objective_id,v_content.id,v_content.learning_role,v_content.experience_form,'PRESENTED') returning * into v_encounter;

  v_presentation := coalesce(v_content.metadata->'presentation','{}'::jsonb);
  if jsonb_typeof(v_presentation) <> 'object' then
    raise exception using errcode='P0001', message='CONTENT_PRESENTATION_MISSING';
  end if;
  if jsonb_typeof(v_presentation->'options') not in ('array', 'null') then
    raise exception using errcode='P0001', message='CONTENT_PRESENTATION_INVALID';
  end if;
  if jsonb_typeof(v_presentation->'questions') not in ('array', 'null') then
    raise exception using errcode='P0001', message='CONTENT_PRESENTATION_INVALID';
  end if;
  v_logical_id := coalesce(v_content.metadata->>'logicalEncounter', v_presentation->>'id', v_artifact.artifact_code);

  return jsonb_build_object(
    'id',v_encounter.id,
    'sessionId',v_encounter.session_id,
    'sequence',v_encounter.sequence,
    'stationId',v_station.code,
    'skillId',v_skill.code,
    'learningObjectiveId',v_encounter.learning_objective_id,
    'contentVersionId',v_encounter.content_version_id,
    'learningRole',v_encounter.learning_role,
    'experienceForm',v_encounter.experience_form,
    'status',v_encounter.status,
    'createdAt',v_encounter.created_at,
    'content',jsonb_build_object(
      'id',v_logical_id,
      'title',coalesce(v_presentation->>'title',v_station.title),
      'prompt',v_content.prompt,
      'stationId',v_station.code,
      'skillId',v_skill.code,
      'learningRole',v_content.learning_role,
      'experienceForm',v_content.experience_form,
      'interactionType',v_content.interaction_type,
      'contentVersionId',v_content.id,
      'options',coalesce(v_presentation->'options','[]'::jsonb),
      'questions',coalesce(v_presentation->'questions','[]'::jsonb),
      'visualCount',v_presentation->'visualCount'
    )
  );
end;
$$;

revoke all on function public.runtime_create_encounter(uuid,integer,uuid,text,text,text,text,uuid) from public;
grant execute on function public.runtime_create_encounter(uuid,integer,uuid,text,text,text,text,uuid) to authenticated;


-- Canonical Android ST01 package. The server package serializer hashes the exact
-- child-safe payload returned by dbPackage(); these values make the DB package
-- descriptor self-consistent with the generated bytes.
update public.content_package_items
set ordinal = case content_version_id
  when '26000000-0000-4000-8000-000000000001' then 1
  when '26000000-0000-4000-8000-000000000002' then 2
  when '26000000-0000-4000-8000-000000000003' then 3
  when '26000000-0000-4000-8000-000000000004' then 4
  when '26000000-0000-4000-8000-000000000005' then 5
  when '26000000-0000-4000-8000-000000000006' then 6
  when '26000000-0000-4000-8000-000000000007' then 7
  when '26000000-0000-4000-8000-000000000008' then 8
  when '26000000-0000-4000-8000-000000000009' then 9
  when '26000000-0000-4000-8000-000000000010' then 10
  when '26000000-0000-4000-8000-000000000011' then 11
  when '26000000-0000-4000-8000-000000000012' then 12
  when '26000000-0000-4000-8000-000000000013' then 13
  when '26000000-0000-4000-8000-000000000014' then 14
  when '26000000-0000-4000-8000-000000000015' then 15
  when '26000000-0000-4000-8000-000000000016' then 16
  when '26000000-0000-4000-8000-000000000017' then 17
  when '26000000-0000-4000-8000-000000000018' then 18
  when '26000000-0000-4000-8000-000000000019' then 19
  when '26000000-0000-4000-8000-000000000020' then 20
  else ordinal
end
where package_id='28000000-0000-4000-8000-000000000001'
  and content_version_id in (
    '26000000-0000-4000-8000-000000000001','26000000-0000-4000-8000-000000000002',
    '26000000-0000-4000-8000-000000000003','26000000-0000-4000-8000-000000000004',
    '26000000-0000-4000-8000-000000000005','26000000-0000-4000-8000-000000000006',
    '26000000-0000-4000-8000-000000000007','26000000-0000-4000-8000-000000000008',
    '26000000-0000-4000-8000-000000000009','26000000-0000-4000-8000-000000000010',
    '26000000-0000-4000-8000-000000000011','26000000-0000-4000-8000-000000000012',
    '26000000-0000-4000-8000-000000000013','26000000-0000-4000-8000-000000000014',
    '26000000-0000-4000-8000-000000000015','26000000-0000-4000-8000-000000000016',
    '26000000-0000-4000-8000-000000000017','26000000-0000-4000-8000-000000000018',
    '26000000-0000-4000-8000-000000000019','26000000-0000-4000-8000-000000000020'
  );

update public.content_packages
set version='1.2.0-android',
    checksum='bc684964f275808fd87a07880979aba0435a7909a74826e73e996d1a4adc1c94',
    bytes=20186,
    storage_path='content://g1/st01/1.2.0-android/package.json',
    min_app_version='0.1.0',
    release_channel='STABLE',
    status='ACTIVE'
where id='28000000-0000-4000-8000-000000000001';

update public.content_manifests
set version='g1-android-st01-1.2.0'
where id='29000000-0000-4000-8000-000000000001';
