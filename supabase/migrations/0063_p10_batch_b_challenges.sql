-- P10 Batch B: Signature Challenge definitions for ST06–ST10.
-- PRACTICE_EVIDENCE only; educational PASS remains human-gated.

insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-ST06-CH','STICKER','{"sticker":"COUNTER_PATH","assetRef":"sticker/counter-path"}','ACTIVE'),
  ('G1-R-ST07-CH','STICKER','{"sticker":"NUM_12","assetRef":"sticker/num-12"}','ACTIVE'),
  ('G1-R-ST08-CH','STICKER','{"sticker":"NUM_34","assetRef":"sticker/num-34"}','ACTIVE'),
  ('G1-R-ST09-CH','STICKER','{"sticker":"ZERO5_SYM","assetRef":"sticker/zero5-sym"}','ACTIVE'),
  ('G1-R-ST10-CH','STICKER','{"sticker":"NUM_67","assetRef":"sticker/num-67"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0b0000-0000-4000-8000-000000000006','G1-ST06-CH-01',1,g.id,'21000000-0000-4000-8000-000000000006','G1-GAME-COUNTER',
  '["G1-SK026","G1-SK032"]','["G1-SK005","G1-SK006"]','با مهره و شمارنده جمع یا تفریق کوچک را حل کن.','GUIDED_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st06-ch-counter-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST06-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0b0000-0000-4000-8000-000000000007','G1-ST07-CH-01',1,g.id,'21000000-0000-4000-8000-000000000007','G1-GAME-NUM12',
  '["G1-SK016","G1-SK001"]','["G1-SK035","G1-SK003"]','عددهای ۱ و ۲ را بشناس، بساز و مقایسه کن.','REVIEW',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st07-ch-num12-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST07-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0b0000-0000-4000-8000-000000000008','G1-ST08-CH-01',1,g.id,'21000000-0000-4000-8000-000000000008','G1-GAME-NUM34',
  '["G1-SK016","G1-SK038"]','["G1-SK001","G1-SK004"]','عددهای ۳ و ۴ را بشناس و قد/طول را مقایسه کن.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st08-ch-num34-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST08-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0b0000-0000-4000-8000-000000000009','G1-ST09-CH-01',1,g.id,'21000000-0000-4000-8000-000000000009','G1-GAME-ZERO5',
  '["G1-SK016","G1-SK045"]','["G1-SK004","G1-SK046"]','صفر و ۵ را بشناس و تقارن ساده را کامل کن.','REVIEW',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st09-ch-zero5-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST09-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0b0000-0000-4000-8000-000000000010','G1-ST10-CH-01',1,g.id,'21000000-0000-4000-8000-000000000010','G1-GAME-NUM67',
  '["G1-SK016","G1-SK035"]','["G1-SK036","G1-SK001"]','عددهای ۶ و ۷ را بشناس و مجموعه‌ها را مقایسه کن.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st10-ch-num67-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST10-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;
