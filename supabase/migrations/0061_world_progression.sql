-- P09 World layer. Derived from authoritative station passes. Does not replace Path.
-- World completion never sets mastery. No client-authored unlocks.

insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-WORLD-1','WORLD_ELEMENT','{"world":1,"assetRef":"world/w1-complete"}','ACTIVE'),
  ('G1-R-WORLD-2','WORLD_ELEMENT','{"world":2,"assetRef":"world/w2-complete"}','ACTIVE'),
  ('G1-R-WORLD-3','WORLD_ELEMENT','{"world":3,"assetRef":"world/w3-complete"}','ACTIVE'),
  ('G1-R-WORLD-4','WORLD_ELEMENT','{"world":4,"assetRef":"world/w4-complete"}','ACTIVE'),
  ('G1-R-WORLD-5','WORLD_ELEMENT','{"world":5,"assetRef":"world/w5-complete"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

create table if not exists public.world_definitions_p09 (
  id text primary key,
  code text not null unique,
  number int not null check (number between 1 and 5),
  unit_code text not null,
  title_fa text not null,
  story_arc_fa text not null,
  accent_token text not null,
  station_codes text[] not null,
  world_challenge_code text not null,
  completion_reward_code text not null references public.reward_catalog(code) on delete restrict,
  collectible_set_code text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','RETIRED'))
);

alter table public.world_definitions_p09 enable row level security;
create policy world_definitions_p09_read on public.world_definitions_p09
  for select to authenticated using (status='ACTIVE' or public.is_admin());

insert into public.world_definitions_p09
  (id, code, number, unit_code, title_fa, story_arc_fa, accent_token, station_codes, world_challenge_code, completion_reward_code, collectible_set_code, status)
values
  ('G1-W01','G1-WORLD-1',1,'G1-U01','دره‌ی عددها','شمارش، جهت و شکل‌های آشنا را پیدا کن.','primary',
    array['ST01','ST02','ST03','ST04','ST05'],'G1-WCH-1','G1-R-WORLD-1','G1-COLLECT-W1','ACTIVE'),
  ('G1-W02','G1-WORLD-2',2,'G1-U02','جنگل اندازه‌ها','اندازه بگیر، مقایسه کن و عددهای تازه بساز.','violet',
    array['ST06','ST07','ST08','ST09','ST10'],'G1-WCH-2','G1-R-WORLD-2','G1-COLLECT-W2','ACTIVE'),
  ('G1-W03','G1-WORLD-3',3,'G1-U03','رودخانه‌ی مسئله','جمع و تفریق را در مسئله‌های واقعی به کار ببر.','teal',
    array['ST11','ST12','ST13','ST14','ST15'],'G1-WCH-3','G1-R-WORLD-3','G1-COLLECT-W3','ACTIVE'),
  ('G1-W04','G1-WORLD-4',4,'G1-U04','قله‌ی زمان','زمان، الگو و عددهای بزرگ‌تر را کشف کن.','secondary',
    array['ST16','ST17','ST18','ST19','ST20'],'G1-WCH-4','G1-R-WORLD-4','G1-COLLECT-W4','ACTIVE'),
  ('G1-W05','G1-WORLD-5',5,'G1-U05','دشت اندازه‌گیری','اندازه‌گیری و مسئله‌های چندمرحله‌ای را تمام کن.','coral',
    array['ST21','ST22','ST23','ST24','ST25'],'G1-WCH-5','G1-R-WORLD-5','G1-COLLECT-W5','ACTIVE')
on conflict (id) do update set
  title_fa=excluded.title_fa, story_arc_fa=excluded.story_arc_fa, station_codes=excluded.station_codes, status='ACTIVE';

-- Ledger of derived world completions (written only by server sync from station facts)
create table if not exists public.world_completions_p09 (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  world_id text not null references public.world_definitions_p09(id) on delete restrict,
  completed_at timestamptz not null default now(),
  reward_grant_key text,
  unique (learning_identity_id, world_id)
);

alter table public.world_completions_p09 enable row level security;
create policy world_completions_p09_read on public.world_completions_p09
  for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
revoke insert, update, delete on public.world_completions_p09 from authenticated;

create or replace function public.worlds_projection()
returns jsonb
language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_passed text[];
  v_worlds jsonb := '[]'::jsonb;
  v_def record;
  v_done int;
  v_total int;
  v_completed boolean;
  v_status text;
  v_prev_completed boolean := true;
  v_current text := null;
  v_completed_count int := 0;
  v_key text;
begin
  v_identity := public.collection_current_identity();

  select coalesce(array_agg(replace(s.code, 'G1-', '')), '{}') into v_passed
  from public.stations s
  where exists (
    select 1 from public.station_check_results scr
    where scr.learning_identity_id = v_identity.id and scr.station_id = s.id
      and scr.passed_check = true and scr.check_group = 'STATION_PASS'
    group by scr.station_id having count(distinct scr.session_id) >= 2
  );

  for v_def in select * from public.world_definitions_p09 where status='ACTIVE' order by number loop
    select count(*) into v_total from unnest(v_def.station_codes) x;
    select count(*) into v_done from unnest(v_def.station_codes) x where x = any (v_passed);
    v_completed := (v_done = v_total and v_total > 0);

    if v_completed then
      v_status := 'COMPLETED';
      v_key := v_identity.id || ':WORLD_COMPLETION:' || v_def.id || ':' || v_def.completion_reward_code;
      insert into public.world_completions_p09 (learning_identity_id, world_id, reward_grant_key)
      values (v_identity.id, v_def.id, v_key)
      on conflict (learning_identity_id, world_id) do nothing;
      insert into public.collection_grant_presentations_p07
        (learning_identity_id, idempotency_key, reward_code, reward_type, source_type, source_ref, granted_at)
      select v_identity.id, v_key, v_def.completion_reward_code, rc.reward_type, 'ADVENTURE_COMPLETION', v_def.id, now()
      from public.reward_catalog rc where rc.code = v_def.completion_reward_code
      on conflict (idempotency_key) do nothing;
      v_completed_count := v_completed_count + 1;
    elsif v_done > 0 or v_prev_completed then
      v_status := 'CURRENT';
      if v_current is null then v_current := v_def.id; end if;
    else
      v_status := 'LOCKED';
    end if;

    v_worlds := v_worlds || jsonb_build_array(jsonb_build_object(
      'worldId', v_def.id,
      'code', v_def.code,
      'number', v_def.number,
      'unitId', v_def.unit_code,
      'titleFa', v_def.title_fa,
      'storyArcFa', v_def.story_arc_fa,
      'accentToken', v_def.accent_token,
      'status', v_status,
      'stationsCompleted', v_done,
      'stationsTotal', v_total,
      'completed', v_completed,
      'completionRewardCode', v_def.completion_reward_code,
      'worldChallengeCode', v_def.world_challenge_code,
      'worldChallengeReady', false,
      'whatChangedFa', case
        when v_completed then v_def.title_fa || ' کامل شد.'
        when v_status = 'CURRENT' then v_done::text || ' از ' || v_total::text || ' ایستگاه این دنیا'
        else null end
    ));

    v_prev_completed := v_completed;
  end loop;

  if v_current is null then
    select w->>'worldId' into v_current from jsonb_array_elements(v_worlds) w
    where (w->>'completed')::boolean = false limit 1;
  end if;

  return jsonb_build_object(
    'engineVersion', '2026-10-05-p09-v1',
    'worlds', v_worlds,
    'currentWorldId', v_current,
    'completedWorldCount', v_completed_count,
    'pathIsPrimarySurface', true,
    'setsMastery', false,
    'inventsLocalUnlocks', false
  );
end $$;

revoke all on function public.worlds_projection() from public;
grant execute on function public.worlds_projection() to authenticated;
