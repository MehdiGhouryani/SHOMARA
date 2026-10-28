-- P06 Mission Engine + Mission Hub.
--
-- This is a forward-only server boundary. Mission progress is derived from
-- accepted runtime facts; clients can read the projection, but cannot write
-- instances, receipts, completion, or rewards.

create table if not exists public.mission_definitions_p06 (
  id uuid primary key,
  grade_id uuid not null references public.grades(id) on delete restrict,
  code text not null,
  version int not null,
  category text not null check (category in ('DAILY','STATION','WORLD','ADVENTURE')),
  daily_slot text check (daily_slot in ('EASY_START','SKILL_BUILDER','MEANINGFUL_PROGRESS')),
  station_id uuid references public.stations(id) on delete restrict,
  quest_type text not null,
  title_fa text not null,
  objective_fa text not null,
  steps jsonb not null,
  reward_code text not null references public.reward_catalog(code) on delete restrict,
  reward_type text not null,
  reward_preview_fa text not null,
  requires text not null default 'NONE' check (requires in ('NONE','CHALLENGE_AVAILABLE')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','RETIRED')),
  unique (code, version)
);

create table if not exists public.mission_instances_p06 (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  definition_id uuid not null references public.mission_definitions_p06(id) on delete restrict,
  period_key text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','EXPIRED')),
  starts_at timestamptz not null default now(),
  completed_at timestamptz,
  reward_grant_key text,
  unique (learning_identity_id, definition_id, period_key)
);

create table if not exists public.mission_receipts_p06 (
  id uuid primary key default gen_random_uuid(),
  mission_instance_id uuid not null references public.mission_instances_p06(id) on delete restrict,
  step_id text not null,
  event_key text not null,
  source_ref text not null,
  occurred_at timestamptz not null,
  unique (mission_instance_id, event_key),
  unique (mission_instance_id, source_ref)
);

create table if not exists public.mission_reward_grants_p06 (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  mission_instance_id uuid not null references public.mission_instances_p06(id) on delete restrict,
  reward_code text not null references public.reward_catalog(code) on delete restrict,
  reward_type text not null,
  idempotency_key text not null unique,
  granted_at timestamptz not null default now(),
  presented_at timestamptz
);

alter table public.mission_definitions_p06 enable row level security;
alter table public.mission_instances_p06 enable row level security;
alter table public.mission_receipts_p06 enable row level security;
alter table public.mission_reward_grants_p06 enable row level security;
create policy mission_definitions_p06_read on public.mission_definitions_p06 for select to authenticated using (status='ACTIVE' or public.is_admin());
create policy mission_instances_p06_read on public.mission_instances_p06 for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
create policy mission_receipts_p06_read on public.mission_receipts_p06 for select to authenticated using (exists (select 1 from public.mission_instances_p06 i where i.id=mission_instance_id and public.can_access_learning_identity(i.learning_identity_id)));
create policy mission_reward_grants_p06_read on public.mission_reward_grants_p06 for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
revoke insert, update, delete on public.mission_instances_p06 from authenticated;
revoke insert, update, delete on public.mission_receipts_p06 from authenticated;
revoke insert, update, delete on public.mission_reward_grants_p06 from authenticated;

insert into public.reward_catalog(code,reward_type,payload,status)
values
  ('G1-R-001','STAR_PROGRESS','{"meter":"PATH_PROGRESS","assetRef":"reward/star-progress"}','ACTIVE'),
  ('G1-R-002','STICKER','{"sticker":"PATTERN","assetRef":"sticker/pattern"}','ACTIVE'),
  ('G1-R-003','CHARACTER_REACTION','{"reaction":"CHEER","assetRef":"reaction/cheer"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type,payload=excluded.payload,status='ACTIVE';

insert into public.mission_definitions_p06
  (id,grade_id,code,version,category,daily_slot,station_id,quest_type,title_fa,objective_fa,steps,reward_code,reward_type,reward_preview_fa,requires,status)
select
  ('2f060000-0000-4000-8000-' || lpad((100 + x.n)::text,12,'0'))::uuid,
  g.id,x.code,1,'DAILY',x.slot,null,x.quest_type,x.title_fa,x.objective_fa,
  x.steps::jsonb,x.reward_code,x.reward_type,x.reward_preview_fa,x.requires,'ACTIVE'
from public.grades g
cross join (values
  (1,'G1-MD-EASY-01','EASY_START','GAME_PRACTICE','یک بازی کوچک','یک بازی ریاضی را در مسیر انجام بده.','[{"id":"GAME","type":"GAME_COMPLETED","targetRef":null,"count":1}]','G1-R-003','CHARACTER_REACTION','تشویق دوستت','NONE'),
  (2,'G1-MD-SKILL-01','SKILL_BUILDER','GAME_PRACTICE','دو بازی تمرینی','دو بازی ریاضی را تا آخر انجام بده.','[{"id":"GAMES","type":"GAME_COMPLETED","targetRef":null,"count":2}]','G1-R-002','STICKER','یک برچسب تازه','NONE'),
  (3,'G1-MD-PROG-01','MEANINGFUL_PROGRESS','TRANSFER','ریاضی در دنیای واقعی','یاد گرفته‌ات را در یک موقعیت تازه به کار ببر.','[{"id":"TRANSFER","type":"TRANSFER_COMPLETED","targetRef":null,"count":1}]','G1-R-001','STAR_PROGRESS','یک ستاره‌ی پیشرفت','NONE')
) x(n,code,slot,quest_type,title_fa,objective_fa,steps,reward_code,reward_type,reward_preview_fa,requires)
where g.code='G1'
on conflict(code,version) do update set steps=excluded.steps,status='ACTIVE';

insert into public.mission_definitions_p06
  (id,grade_id,code,version,category,daily_slot,station_id,quest_type,title_fa,objective_fa,steps,reward_code,reward_type,reward_preview_fa,requires,status)
select
  ('2f060000-0000-4000-8000-' || lpad((200 + s.sequence)::text,12,'0'))::uuid,
  g.id,'G1-M-' || replace(s.code,'G1-',''),1,'STATION',null,s.id,'PATH_PROGRESS',
  'ماموریت ' || s.title,'این ایستگاه را کامل کن تا راه تازه باز شود.',
  jsonb_build_array(jsonb_build_object('id','STATION_PASSED','type','STATION_COMPLETED','targetRef',replace(s.code,'G1-',''),'count',1)),
  'G1-R-001','STAR_PROGRESS','یک ستاره‌ی پیشرفت','NONE','ACTIVE'
from public.stations s
join public.grades g on g.code='G1'
where s.code like 'G1-ST%' and s.status='ACTIVE'
on conflict(code,version) do update set station_id=excluded.station_id,steps=excluded.steps,status='ACTIVE';

create or replace function public.mission_current_identity()
returns public.learning_identities
language plpgsql stable security definer set search_path=public,pg_catalog as $$
declare v public.learning_identities;
begin
  if auth.uid() is null then raise exception using errcode='28000',message='AUTH_REQUIRED'; end if;
  select * into v from public.learning_identities where account_id=auth.uid() and status='ACTIVE' order by created_at asc limit 1;
  if v.id is null then raise exception using errcode='P0001',message='LEARNING_IDENTITY_NOT_FOUND'; end if;
  return v;
end $$;

create or replace function public.mission_sync(p_time_zone text default 'Asia/Tehran', p_now timestamptz default now())
returns jsonb
language plpgsql security definer set search_path=public,pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_day text := to_char(p_now at time zone p_time_zone,'YYYY-MM-DD');
  v_def record; v_inst record; v_step jsonb; v_fact record; v_key text;
begin
  v_identity := public.mission_current_identity();

  update public.mission_instances_p06 set status='EXPIRED'
  where learning_identity_id=v_identity.id and status='ACTIVE' and period_key <> v_day
    and exists(select 1 from public.mission_definitions_p06 d where d.id=definition_id and d.category='DAILY');

  for v_def in
    select * from public.mission_definitions_p06
    where category='DAILY' and status='ACTIVE' and daily_slot is not null
    order by case daily_slot when 'EASY_START' then 1 when 'SKILL_BUILDER' then 2 else 3 end
  loop
    insert into public.mission_instances_p06(learning_identity_id,definition_id,period_key)
    values(v_identity.id,v_def.id,v_day) on conflict do nothing;
  end loop;

  for v_def in
    select d.* from public.mission_definitions_p06 d
    where d.category='STATION' and d.status='ACTIVE'
      and not exists(select 1 from public.mission_instances_p06 i where i.learning_identity_id=v_identity.id and i.definition_id=d.id and i.status='COMPLETED')
    order by d.code limit 1
  loop
    insert into public.mission_instances_p06(learning_identity_id,definition_id,period_key)
    values(v_identity.id,v_def.id,'NONE') on conflict do nothing;
    exit;
  end loop;

  for v_inst in
    select i.*,d.steps,d.reward_code,d.reward_type,d.category,d.code
    from public.mission_instances_p06 i join public.mission_definitions_p06 d on d.id=i.definition_id
    where i.learning_identity_id=v_identity.id and i.status='ACTIVE' and (d.category<>'DAILY' or i.period_key=v_day)
  loop
    for v_step in select * from jsonb_array_elements(v_inst.steps)
    loop
      for v_fact in
        -- Station pass (authoritative; requires 2 distinct sessions, matching learning runtime)
        select 'STATION_COMPLETED'::text event_type,'station:'||s.code source_ref, max(scr.created_at) occurred_at
        from public.station_check_results scr join public.stations s on s.id=scr.station_id
        where scr.learning_identity_id=v_identity.id and scr.passed_check=true and scr.check_group='STATION_PASS'
          and (v_step->>'type')='STATION_COMPLETED'
          and (
            v_step->>'targetRef' is null
            or (v_step->>'targetRef')=replace(s.code,'G1-','')
            or (v_step->>'targetRef')=s.code
          )
        group by s.code having count(distinct scr.session_id)>=2
        union all
        -- Signature / station challenge runs
        select 'CHALLENGE_COMPLETED','challenge-run:'||r.id::text,r.finished_at
        from public.station_challenge_runs r
        where r.learning_identity_id=v_identity.id and r.status='COMPLETED'
          and r.result in ('COMPLETED','COMPLETED_WITH_SUPPORT')
          and (v_step->>'type')='CHALLENGE_COMPLETED'
        union all
        -- Mini-game encounters (daily GAME_COMPLETED)
        select 'GAME_COMPLETED','encounter:'||e.id::text,coalesce(e.completed_at,e.created_at)
        from public.encounters e
        join public.sessions s on s.id=e.session_id
        where s.learning_identity_id=v_identity.id
          and e.status='COMPLETED'
          and e.experience_form='MINI_GAME'
          and (v_step->>'type')='GAME_COMPLETED'
        union all
        -- Review encounters
        select 'SKILL_REVIEW_COMPLETED','encounter:'||e.id::text,coalesce(e.completed_at,e.created_at)
        from public.encounters e
        join public.sessions s on s.id=e.session_id
        where s.learning_identity_id=v_identity.id
          and e.status='COMPLETED'
          and e.learning_role='REVIEW'
          and (v_step->>'type')='SKILL_REVIEW_COMPLETED'
        union all
        -- Transfer encounters
        select 'TRANSFER_COMPLETED','encounter:'||e.id::text,coalesce(e.completed_at,e.created_at)
        from public.encounters e
        join public.sessions s on s.id=e.session_id
        where s.learning_identity_id=v_identity.id
          and e.status='COMPLETED'
          and e.learning_role='TRANSFER'
          and (v_step->>'type')='TRANSFER_COMPLETED'
        union all
        -- Recovery encounters
        select 'RECOVERY_COMPLETED','encounter:'||e.id::text,coalesce(e.completed_at,e.created_at)
        from public.encounters e
        join public.sessions s on s.id=e.session_id
        where s.learning_identity_id=v_identity.id
          and e.status='COMPLETED'
          and s.session_type='RECOVERY'
          and (v_step->>'type')='RECOVERY_COMPLETED'
      loop
        insert into public.mission_receipts_p06(mission_instance_id,step_id,event_key,source_ref,occurred_at)
        values(v_inst.id,v_step->>'id',v_fact.event_type||':'||v_fact.source_ref,v_fact.source_ref,coalesce(v_fact.occurred_at,p_now))
        on conflict do nothing;
      end loop;
    end loop;
    -- Complete only when EVERY step has receipts >= step.count (mirrors contracts/missions.ts)
    if (
      select bool_and(
        (select count(*) from public.mission_receipts_p06 r
         where r.mission_instance_id=v_inst.id and r.step_id=s->>'id')
        >= greatest(1, coalesce((s->>'count')::int, 1))
      )
      from jsonb_array_elements(v_inst.steps) s
    ) then
      update public.mission_instances_p06 set status='COMPLETED',completed_at=coalesce(completed_at,p_now),
        reward_grant_key=coalesce(reward_grant_key,v_identity.id||':QUEST:'||v_inst.code||':'||v_inst.period_key||':'||v_inst.reward_code)
      where id=v_inst.id;
      v_key := v_identity.id||':QUEST:'||v_inst.code||':'||v_inst.period_key||':'||v_inst.reward_code;
      insert into public.mission_reward_grants_p06(learning_identity_id,mission_instance_id,reward_code,reward_type,idempotency_key)
      values(v_identity.id,v_inst.id,v_inst.reward_code,v_inst.reward_type,v_key) on conflict do nothing;
    end if;
  end loop;

  return public.mission_hub_projection(p_time_zone,p_now);
end $$;

create or replace function public.mission_hub_projection(p_time_zone text default 'Asia/Tehran', p_now timestamptz default now())
returns jsonb
language plpgsql stable security definer set search_path=public,pg_catalog as $$
declare v_identity public.learning_identities; v_day text := to_char(p_now at time zone p_time_zone,'YYYY-MM-DD'); v_daily jsonb; v_station jsonb; v_reveals jsonb;
begin
  v_identity := public.mission_current_identity();
  select coalesce(jsonb_agg(jsonb_build_object(
    'instanceId',i.id,'code',d.code,'category',d.category,'dailySlot',d.daily_slot,'titleFa',d.title_fa,'objectiveFa',d.objective_fa,
    'progress',(select coalesce(sum(least(
        (select count(*) from public.mission_receipts_p06 r where r.mission_instance_id=i.id and r.step_id=s->>'id'),
        greatest(1, coalesce((s->>'count')::int, 1))
      )), 0) from jsonb_array_elements(d.steps) s),
    'maxProgress',(select coalesce(sum(greatest(1, coalesce((s->>'count')::int, 1))), 0) from jsonb_array_elements(d.steps) s),
    'status',i.status,'rewardPreviewFa',d.reward_preview_fa,'rewardType',d.reward_type,
    'rewardGranted',exists(select 1 from public.mission_reward_grants_p06 g where g.mission_instance_id=i.id),
    'steps',(select coalesce(jsonb_agg(jsonb_build_object('id',s->>'id','have',(select count(*) from public.mission_receipts_p06 r where r.mission_instance_id=i.id and r.step_id=s->>'id'),'required',(s->>'count')::int,'done',((select count(*) from public.mission_receipts_p06 r where r.mission_instance_id=i.id and r.step_id=s->>'id') >= (s->>'count')::int))), '[]'::jsonb) from jsonb_array_elements(d.steps) s)
  ) order by case d.daily_slot when 'EASY_START' then 1 when 'SKILL_BUILDER' then 2 else 3 end),'[]'::jsonb)
  into v_daily from public.mission_instances_p06 i join public.mission_definitions_p06 d on d.id=i.definition_id
  where i.learning_identity_id=v_identity.id and d.category='DAILY' and i.period_key=v_day;
  select to_jsonb(x) into v_station from (
    select i.id "instanceId",d.code,d.category,d.daily_slot "dailySlot",d.title_fa "titleFa",d.objective_fa "objectiveFa",
      (select coalesce(sum(least(
          (select count(*) from public.mission_receipts_p06 r where r.mission_instance_id=i.id and r.step_id=s->>'id'),
          greatest(1, coalesce((s->>'count')::int, 1))
        )), 0) from jsonb_array_elements(d.steps) s) progress,
      (select coalesce(sum(greatest(1, coalesce((s->>'count')::int, 1))), 0) from jsonb_array_elements(d.steps) s) "maxProgress",
      i.status,
      d.reward_preview_fa "rewardPreviewFa",d.reward_type "rewardType",
      exists(select 1 from public.mission_reward_grants_p06 g where g.mission_instance_id=i.id) "rewardGranted"
    from public.mission_instances_p06 i join public.mission_definitions_p06 d on d.id=i.definition_id
    where i.learning_identity_id=v_identity.id and d.category='STATION' and i.status='ACTIVE' limit 1
  ) x;
  select coalesce(jsonb_agg(jsonb_build_object('grantId',g.id,'rewardCode',g.reward_code,'rewardType',g.reward_type,'titleFa',g.reward_code,'descriptionFa','ماموریت را انجام دادی.','missionCode',d.code) order by g.granted_at),'[]'::jsonb)
    into v_reveals from public.mission_reward_grants_p06 g join public.mission_instances_p06 i on i.id=g.mission_instance_id join public.mission_definitions_p06 d on d.id=i.definition_id
    where g.learning_identity_id=v_identity.id and g.presented_at is null;
  return jsonb_build_object('engineVersion','2026-10-04-p06-v1','dayKey',v_day,'timeZone',p_time_zone,'daily',v_daily,'station',v_station,'world',null,'pendingReveals',v_reveals,
    'summary',jsonb_build_object('dailyCompleted',(select count(*) from public.mission_instances_p06 i join public.mission_definitions_p06 d on d.id=i.definition_id where i.learning_identity_id=v_identity.id and d.category='DAILY' and i.period_key=v_day and i.status='COMPLETED'),'dailyTotal',jsonb_array_length(v_daily)),
    'setsMastery',false,'setsStationCompletion',false);
end $$;

revoke all on function public.mission_current_identity() from public;
revoke all on function public.mission_sync(text,timestamptz) from public;
revoke all on function public.mission_hub_projection(text,timestamptz) from public;
grant execute on function public.mission_sync(text,timestamptz) to authenticated;
grant execute on function public.mission_hub_projection(text,timestamptz) to authenticated;
