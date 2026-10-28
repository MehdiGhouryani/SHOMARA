-- Android-first runtime foundation: one authoritative progression snapshot.
-- Clients may cache/mirror this projection, but they must not derive learning truth locally.

create or replace function public.runtime_get_progression_snapshot(
  p_grade_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identity public.learning_identities;
  v_grade public.grades;
  v_curriculum public.curriculum_versions;
  v_stations jsonb;
  v_completed_ids jsonb;
  v_jump_ids jsonb;
  v_active_session jsonb;
begin
  if auth.uid() is null then
    raise exception using errcode = '28000', message = 'AUTH_REQUIRED';
  end if;

  select * into v_identity
  from public.learning_identities
  where account_id = auth.uid() and status = 'ACTIVE'
  order by created_at desc
  limit 1;

  if not found then
    raise exception using errcode = '42501', message = 'LEARNING_IDENTITY_REQUIRED';
  end if;

  select * into v_grade
  from public.grades
  where code = p_grade_code and status = 'ACTIVE';

  if not found then
    raise exception using errcode = '22023', message = 'GRADE_NOT_FOUND';
  end if;

  select * into v_curriculum
  from public.curriculum_versions
  where grade_id = v_grade.id and status = 'ACTIVE'
  order by created_at desc, version desc
  limit 1;

  if not found then
    raise exception using errcode = '22023', message = 'CURRICULUM_NOT_FOUND';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'stationId', replace(s.code, v_grade.code || '-', ''),
      'stationCode', s.code,
      'sequence', s.sequence,
      'title', s.title,
      'status', s.status,
      'passed', coalesce(gate.passed, false),
      'qualifyingCheckSessionCount', coalesce(gate.distinct_sessions, 0)
    ) order by s.sequence
  ), '[]'::jsonb)
  into v_stations
  from public.stations s
  left join lateral (
    select
      count(distinct scr.session_id)::int as distinct_sessions,
      (count(distinct scr.session_id) >= 2) as passed
    from public.station_check_results scr
    where scr.learning_identity_id = v_identity.id
      and scr.station_id = s.id
      and scr.passed_check = true
      and scr.check_group = 'STATION_PASS'
  ) gate on true
  where s.curriculum_version_id = v_curriculum.id
    and s.status = 'ACTIVE';

  select coalesce(jsonb_agg(
    replace(s.code, v_grade.code || '-', '') order by s.sequence
  ), '[]'::jsonb)
  into v_completed_ids
  from public.stations s
  join lateral (
    select count(distinct scr.session_id)::int as distinct_sessions
    from public.station_check_results scr
    where scr.learning_identity_id = v_identity.id
      and scr.station_id = s.id
      and scr.passed_check = true
      and scr.check_group = 'STATION_PASS'
  ) gate on gate.distinct_sessions >= 2
  where s.curriculum_version_id = v_curriculum.id
    and s.status = 'ACTIVE';

  select coalesce(jsonb_agg(
    replace(s.code, v_grade.code || '-', '') order by s.sequence
  ), '[]'::jsonb)
  into v_jump_ids
  from public.unlocks u
  join public.stations s on s.id = u.target_ref
  where u.learning_identity_id = v_identity.id
    and u.unlock_type = 'JUMP_STATION'
    and u.status = 'GRANTED'
    and s.curriculum_version_id = v_curriculum.id
    and s.status = 'ACTIVE';

  select jsonb_build_object(
    'id', s.id,
    'sessionType', s.session_type,
    'status', s.status,
    'stationId', replace(st.code, v_grade.code || '-', ''),
    'stationCode', st.code,
    'lastActivityAt', s.last_activity_at,
    'lastResumedByClientInstallationId', s.last_resumed_by_client_installation_id
  ) into v_active_session
  from public.sessions s
  left join lateral (
    select e.station_id
    from public.encounters e
    where e.session_id = s.id
    order by e.sequence desc
    limit 1
  ) last_encounter on true
  left join public.stations st on st.id = last_encounter.station_id
  where s.learning_identity_id = v_identity.id
    and s.curriculum_version_id = v_curriculum.id
    and s.status in ('CREATED','ACTIVE','INTERRUPTED')
  order by coalesce(s.last_activity_at, s.created_at) desc, s.created_at desc
  limit 1;

  return jsonb_build_object(
    'gradeId', v_grade.code,
    'curriculumVersion', v_curriculum.version,
    'generatedAt', now(),
    'stations', v_stations,
    'completedStationIds', v_completed_ids,
    'jumpUnlockedStationIds', v_jump_ids,
    'activeSession', coalesce(v_active_session, 'null'::jsonb)
  );
end;
$$;

revoke all on function public.runtime_get_progression_snapshot(text) from public;
grant execute on function public.runtime_get_progression_snapshot(text) to authenticated;
