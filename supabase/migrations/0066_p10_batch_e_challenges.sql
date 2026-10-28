-- P10 Batch E: ST21–ST25 signature challenges. Completes definition seed coverage for G1 path.
-- PRACTICE_EVIDENCE only. Educational PASS remains human-gated (VD-017).

insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-ST21-CH','STICKER','{"sticker":"HUNDRED_TABLE","assetRef":"sticker/hundred-table"}','ACTIVE'),
  ('G1-R-ST22-CH','STICKER','{"sticker":"CALENDAR","assetRef":"sticker/calendar"}','ACTIVE'),
  ('G1-R-ST23-CH','STICKER','{"sticker":"GROUP_COUNT","assetRef":"sticker/group-count"}','ACTIVE'),
  ('G1-R-ST24-CH','STICKER','{"sticker":"MULTI_STEP","assetRef":"sticker/multi-step"}','ACTIVE'),
  ('G1-R-ST25-CH','STICKER','{"sticker":"HUNDRED_INFO","assetRef":"sticker/hundred-info"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0e0000-0000-4000-8000-000000000021','G1-ST21-CH-01',1,g.id,'21000000-0000-4000-8000-000000000021','G1-GAME-HUNDRED-TABLE',
  '["G1-SK023","G1-SK049"]','["G1-SK007","G1-SK050"]','در جدول عددها حرکت کن و اندازه بگیر.','REVIEW',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st21-ch-hundred-table-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST21-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0e0000-0000-4000-8000-000000000022','G1-ST22-CH-01',1,g.id,'21000000-0000-4000-8000-000000000022','G1-GAME-CALENDAR',
  '["G1-SK056","G1-SK008"]','["G1-SK013","G1-SK055"]','تقویم را بخوان و الگوی شمارش را ادامه بده.','GUIDED_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st22-ch-calendar-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST22-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0e0000-0000-4000-8000-000000000023','G1-ST23-CH-01',1,g.id,'21000000-0000-4000-8000-000000000023','G1-GAME-GROUP-COUNT',
  '["G1-SK008","G1-SK057"]','["G1-SK006","G1-SK030"]','شمارش ۵تایی و ۸تایی را در مسئله به کار ببر.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st23-ch-group-count-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST23-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0e0000-0000-4000-8000-000000000024','G1-ST24-CH-01',1,g.id,'21000000-0000-4000-8000-000000000024','G1-GAME-MULTI-STEP',
  '["G1-SK062","G1-SK055"]','["G1-SK057","G1-SK058"]','مسئلهٔ چندمرحله‌ای و زمان تقریبی را حل کن.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st24-ch-multi-step-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST24-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0e0000-0000-4000-8000-000000000025','G1-ST25-CH-01',1,g.id,'21000000-0000-4000-8000-000000000025','G1-GAME-HUNDRED-INFO',
  '["G1-SK024","G1-SK061"]','["G1-SK023","G1-SK064"]','عدد ۱۰۰ را بشناس و بگو اطلاعات مسئله کافی است یا نه.','TRANSFER',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st25-ch-hundred-info-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST25-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;
