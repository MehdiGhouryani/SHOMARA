-- P07 Achievement registry + Reward grant + Collection projection.
-- Forward-only. Never writes mastery, station completion, or unlocks of learning content.
-- Inventory is reconstructable from grants; presentation is separate from grant.

create table if not exists public.achievement_definitions_p07 (
  id uuid primary key,
  grade_id uuid not null references public.grades(id) on delete restrict,
  code text not null,
  version int not null,
  family text not null check (family in (
    'PATH','SKILL','CHALLENGE','RECOVERY','TRANSFER','EXPLORATION','COLLECTION','PERSISTENCE','WORLD'
  )),
  title_fa text not null,
  description_fa text not null,
  visual_asset_ref text not null,
  trigger_type text not null check (trigger_type in ('STATION_COMPLETED','CHALLENGE_COMPLETED','FAMILY_MILESTONE')),
  target_ref text,
  trigger_count int not null default 1 check (trigger_count >= 1),
  reward_code text references public.reward_catalog(code) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','RETIRED')),
  unique (code, version)
);

create table if not exists public.achievement_unlocks_p07 (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  definition_id uuid not null references public.achievement_definitions_p07(id) on delete restrict,
  unlocked_at timestamptz not null default now(),
  reward_grant_key text,
  unique (learning_identity_id, definition_id)
);

-- Unified presentation ledger for any reward grant (mission / challenge / achievement)
create table if not exists public.collection_grant_presentations_p07 (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  idempotency_key text not null,
  reward_code text not null references public.reward_catalog(code) on delete restrict,
  reward_type text not null,
  source_type text not null,
  source_ref text not null,
  granted_at timestamptz not null default now(),
  presented_at timestamptz,
  unique (idempotency_key)
);

alter table public.achievement_definitions_p07 enable row level security;
alter table public.achievement_unlocks_p07 enable row level security;
alter table public.collection_grant_presentations_p07 enable row level security;

create policy achievement_definitions_p07_read on public.achievement_definitions_p07
  for select to authenticated using (status='ACTIVE' or public.is_admin());
create policy achievement_unlocks_p07_read on public.achievement_unlocks_p07
  for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy collection_grant_presentations_p07_read on public.collection_grant_presentations_p07
  for select to authenticated using (public.can_access_learning_identity(learning_identity_id));

revoke insert, update, delete on public.achievement_unlocks_p07 from authenticated;
revoke insert, update, delete on public.collection_grant_presentations_p07 from authenticated;

-- Ensure reward catalog rows for collection
insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-001','STAR_PROGRESS','{"meter":"PATH_PROGRESS","assetRef":"reward/star-progress"}','ACTIVE'),
  ('G1-R-002','STICKER','{"sticker":"PATTERN","assetRef":"sticker/pattern"}','ACTIVE'),
  ('G1-R-003','CHARACTER_REACTION','{"reaction":"CHEER","assetRef":"reaction/cheer"}','ACTIVE'),
  ('G1-R-ST01-CH','STICKER','{"sticker":"PATTERN_PATH","assetRef":"sticker/pattern-path"}','ACTIVE'),
  ('G1-R-BADGE-MILESTONE','MILESTONE_BADGE','{"badge":"MILESTONE","assetRef":"badge/milestone"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

-- Seed path achievements for all active G1 stations
insert into public.achievement_definitions_p07
  (id, grade_id, code, version, family, title_fa, description_fa, visual_asset_ref, trigger_type, target_ref, trigger_count, reward_code, status)
select
  ('2f070000-0000-4000-8000-' || lpad((100 + s.sequence)::text, 12, '0'))::uuid,
  g.id,
  'G1-A-PATH-' || replace(s.code, 'G1-', ''),
  1,
  'PATH',
  coalesce(s.title, replace(s.code, 'G1-', '')),
  'ایستگاه را کامل کن.',
  'achievement/path/' || lower(replace(s.code, 'G1-', '')),
  'STATION_COMPLETED',
  replace(s.code, 'G1-', ''),
  1,
  null,
  'ACTIVE'
from public.stations s
join public.grades g on g.code = 'G1'
where s.code like 'G1-ST%' and s.status = 'ACTIVE'
on conflict (code, version) do update set status = 'ACTIVE', title_fa = excluded.title_fa;

-- ST01 challenge achievement (seed code preserved)
insert into public.achievement_definitions_p07
  (id, grade_id, code, version, family, title_fa, description_fa, visual_asset_ref, trigger_type, target_ref, trigger_count, reward_code, status)
select
  '2f070000-0000-4000-8000-000000000201'::uuid,
  g.id,
  'G1-ACH-CHALLENGE-001',
  1,
  'CHALLENGE',
  'کاشف چالش',
  'اولین چالش ویژه را کامل کردی.',
  'achievement/challenge-first',
  'CHALLENGE_COMPLETED',
  'G1-ST01-CH-01',
  1,
  'G1-R-ST01-CH',
  'ACTIVE'
from public.grades g where g.code = 'G1'
on conflict (code, version) do update set status = 'ACTIVE', reward_code = excluded.reward_code;

-- Family milestones PATH + CHALLENGE
insert into public.achievement_definitions_p07
  (id, grade_id, code, version, family, title_fa, description_fa, visual_asset_ref, trigger_type, target_ref, trigger_count, reward_code, status)
select
  ('2f070000-0000-4000-8000-' || lpad((300 + x.n)::text, 12, '0'))::uuid,
  g.id, x.code, 1, x.family, x.title_fa, x.description_fa, x.asset, 'FAMILY_MILESTONE', x.family, x.threshold, 'G1-R-BADGE-MILESTONE', 'ACTIVE'
from public.grades g
cross join (values
  (1, 'G1-A-MILESTONE-PATH-5', 'PATH', 5, 'مسیر ۵', '۵ ایستگاه را کامل کرده‌ای.', 'achievement/milestone/path-5'),
  (2, 'G1-A-MILESTONE-PATH-15', 'PATH', 15, 'مسیر ۱۵', '۱۵ ایستگاه را کامل کرده‌ای.', 'achievement/milestone/path-15'),
  (3, 'G1-A-MILESTONE-PATH-25', 'PATH', 25, 'مسیر ۲۵', 'همهٔ ایستگاه‌های مسیر را کامل کرده‌ای.', 'achievement/milestone/path-25'),
  (4, 'G1-A-MILESTONE-CHALLENGE-1', 'CHALLENGE', 1, 'چالش ۱', 'اولین چالش ویژه را کامل کرده‌ای.', 'achievement/milestone/challenge-1'),
  (5, 'G1-A-MILESTONE-CHALLENGE-5', 'CHALLENGE', 5, 'چالش ۵', '۵ چالش ویژه را کامل کرده‌ای.', 'achievement/milestone/challenge-5'),
  (6, 'G1-A-MILESTONE-CHALLENGE-15', 'CHALLENGE', 15, 'چالش ۱۵', '۱۵ چالش ویژه را کامل کرده‌ای.', 'achievement/milestone/challenge-15')
) x(n, code, family, threshold, title_fa, description_fa, asset)
where g.code = 'G1'
on conflict (code, version) do update set status = 'ACTIVE';

create or replace function public.collection_current_identity()
returns public.learning_identities
language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare v public.learning_identities;
begin
  if auth.uid() is null then raise exception using errcode = '28000', message = 'AUTH_REQUIRED'; end if;
  select * into v from public.learning_identities where account_id = auth.uid() and status = 'ACTIVE' order by created_at asc limit 1;
  if v.id is null then raise exception using errcode = 'P0001', message = 'LEARNING_IDENTITY_NOT_FOUND'; end if;
  return v;
end $$;

create or replace function public.collection_sync(p_now timestamptz default now())
returns jsonb
language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_def record;
  v_path_count int;
  v_challenge_count int;
  v_key text;
  v_passed text[];
  v_challenges text[];
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

  select coalesce(array_agg(distinct d.code), '{}') into v_challenges
  from public.station_challenge_runs r
  join public.station_challenge_definitions d on d.id = r.definition_id
  where r.learning_identity_id = v_identity.id and r.status = 'COMPLETED'
    and r.result in ('COMPLETED', 'COMPLETED_WITH_SUPPORT');

  v_path_count := coalesce(cardinality(v_passed), 0);
  v_challenge_count := coalesce(cardinality(v_challenges), 0);

  for v_def in select * from public.achievement_definitions_p07 where status = 'ACTIVE' loop
    if exists (
      select 1 from public.achievement_unlocks_p07 u
      where u.learning_identity_id = v_identity.id and u.definition_id = v_def.id
    ) then
      continue;
    end if;

    if v_def.trigger_type = 'STATION_COMPLETED' and v_def.target_ref is not null
       and v_def.target_ref = any (v_passed) then
      null; -- unlock
    elsif v_def.trigger_type = 'CHALLENGE_COMPLETED' and v_def.target_ref is not null
          and v_def.target_ref = any (v_challenges) then
      null;
    elsif v_def.trigger_type = 'FAMILY_MILESTONE' and v_def.target_ref = 'PATH'
          and v_path_count >= v_def.trigger_count then
      null;
    elsif v_def.trigger_type = 'FAMILY_MILESTONE' and v_def.target_ref = 'CHALLENGE'
          and v_challenge_count >= v_def.trigger_count then
      null;
    else
      continue;
    end if;

    v_key := case when v_def.reward_code is not null then
      v_identity.id || ':' ||
      case
        when v_def.family = 'CHALLENGE' then 'CHALLENGE_COMPLETION'
        when v_def.trigger_type = 'FAMILY_MILESTONE' then 'MILESTONE'
        else 'LEARNING_ACHIEVEMENT'
      end || ':' || v_def.code || ':' || v_def.reward_code
      else null end;

    insert into public.achievement_unlocks_p07 (learning_identity_id, definition_id, unlocked_at, reward_grant_key)
    values (v_identity.id, v_def.id, p_now, v_key)
    on conflict (learning_identity_id, definition_id) do nothing;

    if v_key is not null and v_def.reward_code is not null then
      insert into public.collection_grant_presentations_p07
        (learning_identity_id, idempotency_key, reward_code, reward_type, source_type, source_ref, granted_at)
      select v_identity.id, v_key, v_def.reward_code, rc.reward_type,
        case
          when v_def.family = 'CHALLENGE' then 'CHALLENGE_COMPLETION'
          when v_def.trigger_type = 'FAMILY_MILESTONE' then 'MILESTONE'
          else 'LEARNING_ACHIEVEMENT'
        end,
        v_def.code, p_now
      from public.reward_catalog rc where rc.code = v_def.reward_code
      on conflict (idempotency_key) do nothing;
    end if;
  end loop;

  -- Mirror mission reward grants into collection ledger (idempotent)
  insert into public.collection_grant_presentations_p07
    (learning_identity_id, idempotency_key, reward_code, reward_type, source_type, source_ref, granted_at)
  select g.learning_identity_id, g.idempotency_key, g.reward_code, g.reward_type, 'QUEST', d.code, g.granted_at
  from public.mission_reward_grants_p06 g
  join public.mission_instances_p06 i on i.id = g.mission_instance_id
  join public.mission_definitions_p06 d on d.id = i.definition_id
  where g.learning_identity_id = v_identity.id
  on conflict (idempotency_key) do nothing;

  return public.collection_projection();
end $$;

create or replace function public.collection_projection()
returns jsonb
language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_achievements jsonb;
  v_inventory jsonb;
begin
  v_identity := public.collection_current_identity();

  select coalesce(jsonb_agg(jsonb_build_object(
    'code', d.code,
    'family', d.family,
    'titleFa', d.title_fa,
    'descriptionFa', d.description_fa,
    'visualAssetRef', d.visual_asset_ref,
    'unlocked', u.id is not null,
    'unlockedAt', u.unlocked_at
  ) order by d.family, d.code), '[]'::jsonb)
  into v_achievements
  from public.achievement_definitions_p07 d
  left join public.achievement_unlocks_p07 u
    on u.definition_id = d.id and u.learning_identity_id = v_identity.id
  where d.status = 'ACTIVE';

  select coalesce(jsonb_agg(jsonb_build_object(
    'grantId', g.idempotency_key,
    'rewardCode', g.reward_code,
    'rewardType', g.reward_type,
    'titleFa', coalesce(rc.payload->>'titleFa', g.reward_code),
    'descriptionFa', coalesce(rc.payload->>'descriptionFa', ''),
    'sourceType', g.source_type,
    'grantedAt', g.granted_at,
    'presented', g.presented_at is not null
  ) order by g.granted_at), '[]'::jsonb)
  into v_inventory
  from public.collection_grant_presentations_p07 g
  left join public.reward_catalog rc on rc.code = g.reward_code
  where g.learning_identity_id = v_identity.id;

  return jsonb_build_object(
    'engineVersion', '2026-10-05-p07-v1',
    'achievements', v_achievements,
    'inventory', v_inventory,
    'summary', jsonb_build_object(
      'achievementsUnlocked', (select count(*) from public.achievement_unlocks_p07 u where u.learning_identity_id = v_identity.id),
      'achievementsTotal', (select count(*) from public.achievement_definitions_p07 d where d.status = 'ACTIVE'),
      'inventoryCount', (select count(*) from public.collection_grant_presentations_p07 g where g.learning_identity_id = v_identity.id),
      'pendingReveals', (select count(*) from public.collection_grant_presentations_p07 g where g.learning_identity_id = v_identity.id and g.presented_at is null)
    ),
    'setsMastery', false,
    'setsStationCompletion', false,
    'impliesMoneyValue', false
  );
end $$;

create or replace function public.collection_acknowledge_presentation(p_grant_id text, p_now timestamptz default now())
returns jsonb
language plpgsql security definer set search_path = public, pg_catalog as $$
declare v_identity public.learning_identities;
begin
  v_identity := public.collection_current_identity();
  update public.collection_grant_presentations_p07
    set presented_at = coalesce(presented_at, p_now)
  where learning_identity_id = v_identity.id and idempotency_key = p_grant_id;
  return public.collection_projection();
end $$;

revoke all on function public.collection_current_identity() from public;
revoke all on function public.collection_sync(timestamptz) from public;
revoke all on function public.collection_projection() from public;
revoke all on function public.collection_acknowledge_presentation(text, timestamptz) from public;
grant execute on function public.collection_sync(timestamptz) to authenticated;
grant execute on function public.collection_projection() to authenticated;
grant execute on function public.collection_acknowledge_presentation(text, timestamptz) to authenticated;
