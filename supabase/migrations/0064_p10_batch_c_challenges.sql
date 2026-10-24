-- P10 Batch C: ST11–ST15 signature challenges. PRACTICE_EVIDENCE only.

insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-ST11-CH','STICKER','{"sticker":"EQUAL8","assetRef":"sticker/equal8"}','ACTIVE'),
  ('G1-R-ST12-CH','STICKER','{"sticker":"COMPARE9","assetRef":"sticker/compare9"}','ACTIVE'),
  ('G1-R-ST13-CH','STICKER','{"sticker":"PLUS_SIGN","assetRef":"sticker/plus-sign"}','ACTIVE'),
  ('G1-R-ST14-CH','STICKER','{"sticker":"SUB_LEN","assetRef":"sticker/sub-len"}','ACTIVE'),
  ('G1-R-ST15-CH','STICKER','{"sticker":"GROUP_PV","assetRef":"sticker/group-pv"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0c0000-0000-4000-8000-000000000011','G1-ST11-CH-01',1,g.id,'21000000-0000-4000-8000-000000000011','G1-GAME-EQUAL8',
  '["G1-SK037","G1-SK016"]','["G1-SK035","G1-SK003"]','مجموعه‌های مساوی را پیدا کن و عدد ۸ را بشناس.','REVIEW',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st11-ch-equal8-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST11-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0c0000-0000-4000-8000-000000000012','G1-ST12-CH-01',1,g.id,'21000000-0000-4000-8000-000000000012','G1-GAME-COMPARE9',
  '["G1-SK036","G1-SK035"]','["G1-SK016","G1-SK001"]','عددها را مقایسه کن و عدد ۹ را بشناس.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st12-ch-compare9-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST12-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0c0000-0000-4000-8000-000000000013','G1-ST13-CH-01',1,g.id,'21000000-0000-4000-8000-000000000013','G1-GAME-PLUS',
  '["G1-SK025","G1-SK028"]','["G1-SK029","G1-SK026"]','نشانهٔ جمع را به کار ببر و ترکیب عددی بساز.','GUIDED_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st13-ch-plus-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST13-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0c0000-0000-4000-8000-000000000014','G1-ST14-CH-01',1,g.id,'21000000-0000-4000-8000-000000000014','G1-GAME-SUBLEN',
  '["G1-SK031","G1-SK032"]','["G1-SK038","G1-SK033"]','تفریق کن و طول‌ها را مقایسه کن.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st14-ch-sublen-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST14-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0c0000-0000-4000-8000-000000000015','G1-ST15-CH-01',1,g.id,'21000000-0000-4000-8000-000000000015','G1-GAME-GROUP',
  '["G1-SK021","G1-SK006"]','["G1-SK008","G1-SK020"]','گروه‌بندی کن و ارزش مکانی اولیه را ببین.','REVIEW',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st15-ch-group-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST15-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;
