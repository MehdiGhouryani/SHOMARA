-- P10 Batch D: ST16–ST20 signature challenges. PRACTICE_EVIDENCE only.

insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-ST16-CH','STICKER','{"sticker":"CLOCK","assetRef":"sticker/clock"}','ACTIVE'),
  ('G1-R-ST17-CH','STICKER','{"sticker":"MULTIADD","assetRef":"sticker/multiadd"}','ACTIVE'),
  ('G1-R-ST18-CH','STICKER','{"sticker":"PATTERN_TIME","assetRef":"sticker/pattern-time"}','ACTIVE'),
  ('G1-R-ST19-CH','STICKER','{"sticker":"TENS_BUY","assetRef":"sticker/tens-buy"}','ACTIVE'),
  ('G1-R-ST20-CH','STICKER','{"sticker":"TWODIGIT","assetRef":"sticker/twodigit"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0d0000-0000-4000-8000-000000000016','G1-ST16-CH-01',1,g.id,'21000000-0000-4000-8000-000000000016','G1-GAME-CLOCK',
  '["G1-SK052","G1-SK016"]','["G1-SK053","G1-SK007"]','ساعت دقیق را بخوان و عددهای ۱۰ تا ۲۰ را بشناس.','REVIEW',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st16-ch-clock-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST16-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0d0000-0000-4000-8000-000000000017','G1-ST17-CH-01',1,g.id,'21000000-0000-4000-8000-000000000017','G1-GAME-MULTIADD',
  '["G1-SK030","G1-SK027"]','["G1-SK025","G1-SK006"]','جمع چندبخشی و تقریب ساده را انجام بده.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st17-ch-multiadd-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST17-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0d0000-0000-4000-8000-000000000018','G1-ST18-CH-01',1,g.id,'21000000-0000-4000-8000-000000000018','G1-GAME-PATTERN-TIME',
  '["G1-SK013","G1-SK054"]','["G1-SK052","G1-SK011"]','الگوی عددی را ادامه بده و زمان را بخوان.','REVIEW',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st18-ch-pattern-time-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST18-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0d0000-0000-4000-8000-000000000019','G1-ST19-CH-01',1,g.id,'21000000-0000-4000-8000-000000000019','G1-GAME-TENS-BUY',
  '["G1-SK021","G1-SK057"]','["G1-SK026","G1-SK008"]','با ده‌تایی‌ها مسئلهٔ خرید ساده را حل کن.','GUIDED_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st19-ch-tens-buy-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST19-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;

insert into public.station_challenge_definitions(
  id, code, version, grade_id, station_id, game_code,
  primary_skill_codes, supporting_skill_codes, objective, learning_role, rounds,
  difficulty_policy, hint_policy, timer_policy, evaluator_version, reward_policy, evidence_policy,
  estimated_duration_sec, status
)
select '2f0d0000-0000-4000-8000-000000000020','G1-ST20-CH-01',1,g.id,'21000000-0000-4000-8000-000000000020','G1-GAME-TWODIGIT',
  '["G1-SK023","G1-SK022"]','["G1-SK020","G1-SK021"]','عدد دو رقمی را با ارزش مکانی بساز و بخوان.','INDEPENDENT_PRACTICE',3,
  '{"mode":"STEP_ADAPTIVE","startLevel":"CORE","stepDownAfterWrongAttempts":2,"stepUpAfterFirstTryRounds":2,"preservesSkillIdentity":true}',
  '{"ladder":["STRATEGY","REPRESENTATION","WORKED_STEP"],"offerAfterWrongAttempts":1,"offerAfterIdleMs":8000,"revealsFinalAnswer":false,"reducesReward":false}',
  'NONE','st20-ch-twodigit-v1',
  '{"source":"CHALLENGE_COMPLETION","rewardClass":"STICKER","rewardDefinitionCode":"G1-R-ST20-CH","grantedOn":["COMPLETED","COMPLETED_WITH_SUPPORT"],"oncePerChallengeInstance":true,"replayGrants":false}',
  '{"mode":"PRACTICE_EVIDENCE","countsTowardStationPass":false,"countsTowardMastery":false,"tagsScaffoldedAttempts":true}',
  60,'ACTIVE' from public.grades g where g.code='G1'
on conflict (id) do update set status='ACTIVE', objective=excluded.objective, evaluator_version=excluded.evaluator_version;
