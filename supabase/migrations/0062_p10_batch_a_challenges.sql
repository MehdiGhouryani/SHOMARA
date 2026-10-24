-- P10 Batch A: Signature Challenge definitions for ST02–ST05.
-- Reuses station_challenge_definitions + reward_catalog from P04/P05.
-- Does not claim educational PASS; review remains human (PENDING_HUMAN_SIGN_OFF in contracts).

insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-ST02-CH','STICKER','{"sticker":"DIRECTION_GRID","assetRef":"sticker/direction-grid"}','ACTIVE'),
  ('G1-R-ST03-CH','STICKER','{"sticker":"NUMBER_COMPOSE","assetRef":"sticker/number-compose"}','ACTIVE'),
  ('G1-R-ST04-CH','STICKER','{"sticker":"SHAPE_SORT","assetRef":"sticker/shape-sort"}','ACTIVE'),
  ('G1-R-ST05-CH','STICKER','{"sticker":"ADD_SUB_PATH","assetRef":"sticker/add-sub-path"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

-- ST02 position / direction
insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select
  '2f0a0000-0000-4000-8000-000000000002',
  'G1-ST02-CH-01', 1, g.id, '21000000-0000-4000-8000-000000000002',
  'G1-GAME-POSITION',
  '["G1-SK047","G1-SK048"]',
  '["G1-SK012"]',
  'جای درست را در شبکه پیدا کن.',
  'REVIEW', 3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE',
  'st02-ch-position-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST02-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60, 'ACTIVE'
from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

-- ST03 compose numbers
insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select
  '2f0a0000-0000-4000-8000-000000000003',
  'G1-ST03-CH-01', 1, g.id, '21000000-0000-4000-8000-000000000003',
  'G1-GAME-COMPOSE',
  '["G1-SK025","G1-SK026"]',
  '["G1-SK016","G1-SK006"]',
  'دو گروه را با هم جمع کن تا عدد هدف ساخته شود.',
  'INDEPENDENT_PRACTICE', 3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE',
  'st03-ch-compose-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST03-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60, 'ACTIVE'
from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

-- ST04 shapes
insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select
  '2f0a0000-0000-4000-8000-000000000004',
  'G1-ST04-CH-01', 1, g.id, '21000000-0000-4000-8000-000000000004',
  'G1-GAME-SHAPE',
  '["G1-SK041","G1-SK043"]',
  '["G1-SK042"]',
  'شکل درست را از روی ویژگی‌ها انتخاب کن.',
  'REVIEW', 3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE',
  'st04-ch-shape-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST04-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60, 'ACTIVE'
from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

-- ST05 add/sub
insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select
  '2f0a0000-0000-4000-8000-000000000005',
  'G1-ST05-CH-01', 1, g.id, '21000000-0000-4000-8000-000000000005',
  'G1-GAME-ADDSUB',
  '["G1-SK026","G1-SK032"]',
  '["G1-SK031","G1-SK025"]',
  'جمع یا تفریق کوچک را با مدل حل کن.',
  'INDEPENDENT_PRACTICE', 3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE',
  'st05-ch-addsub-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST05-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60, 'ACTIVE'
from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;
