-- P10 Batch A DEPTH: playable rounds/variants/content for ST02–ST05.
-- Uses G1-GAME-001 (MULTIPLE_CHOICE) so existing challenge engine can run them.
-- Answers only in evaluator_config; presentation metadata has no answer key field for clients.

update public.station_challenge_definitions set game_code='G1-GAME-001', evaluator_version='st02-ch-position-v1', status='ACTIVE' where id='2f0a0000-0000-4000-8000-000000000002';
update public.station_challenge_definitions set game_code='G1-GAME-001', evaluator_version='st03-ch-compose-v1', status='ACTIVE' where id='2f0a0000-0000-4000-8000-000000000003';
update public.station_challenge_definitions set game_code='G1-GAME-001', evaluator_version='st04-ch-shape-v1', status='ACTIVE' where id='2f0a0000-0000-4000-8000-000000000004';
update public.station_challenge_definitions set game_code='G1-GAME-001', evaluator_version='st05-ch-addsub-v1', status='ACTIVE' where id='2f0a0000-0000-4000-8000-000000000005';

insert into public.content_artifacts(id,grade_id,artifact_code,artifact_type,station_id,skill_id,status)
select x.id,g.id,x.code,'EXPERIENCE',x.station,x.skill,'ACTIVE' from public.grades g
cross join (values
('270a0000-0000-4000-8000-000000000100'::uuid,'G1-ST02-CH01-R0-S','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000047'::uuid),
('270a0000-0000-4000-8000-000000000101'::uuid,'G1-ST02-CH01-R0-C','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000047'::uuid),
('270a0000-0000-4000-8000-000000000102'::uuid,'G1-ST02-CH01-R0-S','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000047'::uuid),
('270a0000-0000-4000-8000-000000000103'::uuid,'G1-ST02-CH01-R1-S','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000048'::uuid),
('270a0000-0000-4000-8000-000000000104'::uuid,'G1-ST02-CH01-R1-C','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000048'::uuid),
('270a0000-0000-4000-8000-000000000105'::uuid,'G1-ST02-CH01-R1-S','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000048'::uuid),
('270a0000-0000-4000-8000-000000000106'::uuid,'G1-ST02-CH01-R2-S','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000047'::uuid),
('270a0000-0000-4000-8000-000000000107'::uuid,'G1-ST02-CH01-R2-C','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000047'::uuid),
('270a0000-0000-4000-8000-000000000108'::uuid,'G1-ST02-CH01-R2-S','21000000-0000-4000-8000-000000000002'::uuid,'22000000-0000-4000-8000-000000000047'::uuid),
('270a0000-0000-4000-8000-000000000109'::uuid,'G1-ST03-CH01-R0-S','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000025'::uuid),
('270a0000-0000-4000-8000-000000000110'::uuid,'G1-ST03-CH01-R0-C','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000025'::uuid),
('270a0000-0000-4000-8000-000000000111'::uuid,'G1-ST03-CH01-R0-S','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000025'::uuid),
('270a0000-0000-4000-8000-000000000112'::uuid,'G1-ST03-CH01-R1-S','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000026'::uuid),
('270a0000-0000-4000-8000-000000000113'::uuid,'G1-ST03-CH01-R1-C','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000026'::uuid),
('270a0000-0000-4000-8000-000000000114'::uuid,'G1-ST03-CH01-R1-S','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000026'::uuid),
('270a0000-0000-4000-8000-000000000115'::uuid,'G1-ST03-CH01-R2-S','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000016'::uuid),
('270a0000-0000-4000-8000-000000000116'::uuid,'G1-ST03-CH01-R2-C','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000016'::uuid),
('270a0000-0000-4000-8000-000000000117'::uuid,'G1-ST03-CH01-R2-S','21000000-0000-4000-8000-000000000003'::uuid,'22000000-0000-4000-8000-000000000016'::uuid),
('270a0000-0000-4000-8000-000000000118'::uuid,'G1-ST04-CH01-R0-S','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000041'::uuid),
('270a0000-0000-4000-8000-000000000119'::uuid,'G1-ST04-CH01-R0-C','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000041'::uuid),
('270a0000-0000-4000-8000-000000000120'::uuid,'G1-ST04-CH01-R0-S','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000041'::uuid),
('270a0000-0000-4000-8000-000000000121'::uuid,'G1-ST04-CH01-R1-S','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000042'::uuid),
('270a0000-0000-4000-8000-000000000122'::uuid,'G1-ST04-CH01-R1-C','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000042'::uuid),
('270a0000-0000-4000-8000-000000000123'::uuid,'G1-ST04-CH01-R1-S','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000042'::uuid),
('270a0000-0000-4000-8000-000000000124'::uuid,'G1-ST04-CH01-R2-S','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000043'::uuid),
('270a0000-0000-4000-8000-000000000125'::uuid,'G1-ST04-CH01-R2-C','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000043'::uuid),
('270a0000-0000-4000-8000-000000000126'::uuid,'G1-ST04-CH01-R2-S','21000000-0000-4000-8000-000000000004'::uuid,'22000000-0000-4000-8000-000000000043'::uuid),
('270a0000-0000-4000-8000-000000000127'::uuid,'G1-ST05-CH01-R0-S','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000026'::uuid),
('270a0000-0000-4000-8000-000000000128'::uuid,'G1-ST05-CH01-R0-C','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000026'::uuid),
('270a0000-0000-4000-8000-000000000129'::uuid,'G1-ST05-CH01-R0-S','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000026'::uuid),
('270a0000-0000-4000-8000-000000000130'::uuid,'G1-ST05-CH01-R1-S','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000032'::uuid),
('270a0000-0000-4000-8000-000000000131'::uuid,'G1-ST05-CH01-R1-C','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000032'::uuid),
('270a0000-0000-4000-8000-000000000132'::uuid,'G1-ST05-CH01-R1-S','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000032'::uuid),
('270a0000-0000-4000-8000-000000000133'::uuid,'G1-ST05-CH01-R2-S','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000031'::uuid),
('270a0000-0000-4000-8000-000000000134'::uuid,'G1-ST05-CH01-R2-C','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000031'::uuid),
('270a0000-0000-4000-8000-000000000135'::uuid,'G1-ST05-CH01-R2-S','21000000-0000-4000-8000-000000000005'::uuid,'22000000-0000-4000-8000-000000000031'::uuid)
) x(id,code,station,skill) where g.code='G1' on conflict(id) do update set status='ACTIVE';

insert into public.content_versions(id,content_artifact_id,version_number,interaction_type,experience_form,learning_role,prompt,answer_schema,evaluator_config,feedback_config,hint_config,metadata,provenance,status) values
('260a0000-0000-4000-8000-000000000100','270a0000-0000-4000-8000-000000000100',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','توپ کجاست؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "بالا یا پایین", "options": ["بالا", "پایین"], "display": "توپ روی قفسه بالا"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000101','270a0000-0000-4000-8000-000000000101',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','گربه نسبت به جعبه کجاست؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "چپ یا راست", "options": ["چپ", "راست", "روی جعبه"], "display": "گربه سمت چپ جعبه"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000102','270a0000-0000-4000-8000-000000000102',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','پرنده کجای درخت است؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "موقعیت", "options": ["بین", "پشت", "زیر", "جلو"], "display": "پرنده بین دو شاخه"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000103','270a0000-0000-4000-8000-000000000103',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام یکی وسط است؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "ردیف", "options": ["وسط", "اول"], "display": "ستاره دایره ستاره"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000104','270a0000-0000-4000-8000-000000000104',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام صندلی کنار در است؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "کنار", "options": ["صندلی", "میز", "پنجره"], "display": "در صندلی میز"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000105','270a0000-0000-4000-8000-000000000105',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام خانه پایین چپ است؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "جدول", "options": ["خانه پایین-چپ", "خانه بالا-راست", "وسط", "بیرون"], "display": "جدول دو در دو"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000106','270a0000-0000-4000-8000-000000000106',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کفشها کجایند؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "زیر یا رو", "options": ["زیر", "رو"], "display": "کفش زیر نیمکت"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000107','270a0000-0000-4000-8000-000000000107',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کیف نسبت به صندلی کجاست؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "پشت جلو", "options": ["پشت", "جلو", "روی صندلی"], "display": "کیف پشت صندلی"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000108','270a0000-0000-4000-8000-000000000108',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام راه به در میرسد؟','{}','{"version": "st02-ch-position-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "مسیر", "options": ["راست-راست", "چپ-بالا", "پایین-پایین", "همانجا"], "display": "شبکه ساده"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000109','270a0000-0000-4000-8000-000000000109',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۲ و ۱ با هم چند تا میشوند؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "جمع کوچک", "options": ["۳", "۲"], "display": "دو به علاوه یک"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000110','270a0000-0000-4000-8000-000000000110',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۳ و ۲ با هم چند تا؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "جمع", "options": ["۴", "۵", "۶"], "display": "سه به علاوه دو"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000111','270a0000-0000-4000-8000-000000000111',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۴ و ۳ با هم چند تا؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "جمع", "options": ["۶", "۷", "۸", "۵"], "display": "چهار به علاوه سه"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000112','270a0000-0000-4000-8000-000000000112',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','برای ساختن ۴ کدام جفت درست است؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "ترکیب", "options": ["۲ و ۲", "۱ و ۱"], "display": "هدف چهار"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000113','270a0000-0000-4000-8000-000000000113',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','برای ساختن ۵ کدام جفت؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "ترکیب", "options": ["۲ و ۲", "۳ و ۲", "۱ و ۱"], "display": "هدف پنج"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000114','270a0000-0000-4000-8000-000000000114',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','برای ساختن ۶ کدام جفت؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "ترکیب", "options": ["۱ و ۴", "۳ و ۳", "۲ و ۲", "۵ و ۵"], "display": "هدف شش"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000115','270a0000-0000-4000-8000-000000000115',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام عدد چهار است؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "نماد", "options": ["۴", "۲"], "display": "چهار"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000116','270a0000-0000-4000-8000-000000000116',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام نماد برای پنج است؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "نماد", "options": ["۳", "۵", "۶"], "display": "پنج مهره"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000117','270a0000-0000-4000-8000-000000000117',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام درست است؟','{}','{"version": "st03-ch-compose-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "نماد و کمیت", "options": ["۵", "۶", "۷", "۴"], "display": "شش نقطه"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000118','270a0000-0000-4000-8000-000000000118',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام دایره است؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "شکل", "options": ["دایره", "مثلث"], "display": "اشکال"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000119','270a0000-0000-4000-8000-000000000119',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام مربع است؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "شکل", "options": ["مثلث", "مربع", "دایره"], "display": "اشکال"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000120','270a0000-0000-4000-8000-000000000120',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام مستطیل است؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [2], "maxScore": 1}','{}','{}','{"presentation": {"title": "شکل", "options": ["مربع", "مثلث", "مستطیل", "دایره"], "display": "اشکال"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000121','270a0000-0000-4000-8000-000000000121',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','مثلث چند گوشه دارد؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "گوشه", "options": ["۳", "۴"], "display": "مثلث"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000122','270a0000-0000-4000-8000-000000000122',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','مربع چند ضلع دارد؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "ضلع", "options": ["۳", "۴", "۵"], "display": "مربع"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000123','270a0000-0000-4000-8000-000000000123',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام شکل ۴ گوشه دارد؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [2], "maxScore": 1}','{}','{}','{"presentation": {"title": "ویژگی", "options": ["مثلث", "دایره", "مربع", "هیچکدام"], "display": "اشکال"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000124','270a0000-0000-4000-8000-000000000124',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام مثل بقیه نیست؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "گروه", "options": ["مثلث", "دایره"], "display": "دو دایره یک مثلث"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000125','270a0000-0000-4000-8000-000000000125',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدامها همخانوادهاند؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "ردهبندی", "options": ["مربع و مستطیل", "دایره و مربع", "همه"], "display": "مربع مستطیل دایره"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000126','270a0000-0000-4000-8000-000000000126',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام شکل گوشه ندارد؟','{}','{"version": "st04-ch-shape-v1", "expectedAnswers": [2], "maxScore": 1}','{}','{}','{"presentation": {"title": "ویژگی", "options": ["مثلث", "مربع", "دایره", "مستطیل"], "display": "اشکال"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000127','270a0000-0000-4000-8000-000000000127',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۳ تا بود ۱ تا اضافه شد. چند تا؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "جمع", "options": ["۴", "۳"], "display": "سه به علاوه یک"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000128','270a0000-0000-4000-8000-000000000128',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۲ به علاوه ۳ چند میشود؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "جمع", "options": ["۴", "۵", "۶"], "display": "۲+۳"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000129','270a0000-0000-4000-8000-000000000129',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۴ به علاوه ۲ چند؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "جمع", "options": ["۵", "۶", "۷", "۸"], "display": "۴+۲"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000130','270a0000-0000-4000-8000-000000000130',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۴ تا بود ۱ تا برداشتیم. چند ماند؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "تفریق", "options": ["۳", "۴"], "display": "چهار منهای یک"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000131','270a0000-0000-4000-8000-000000000131',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۵ منهای ۲ چند؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "تفریق", "options": ["۲", "۳", "۴"], "display": "۵-۲"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000132','270a0000-0000-4000-8000-000000000132',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۶ منهای ۳ چند؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "تفریق", "options": ["۲", "۳", "۴", "۵"], "display": "۶-۳"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000133','270a0000-0000-4000-8000-000000000133',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام یعنی کم کردن؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [0], "maxScore": 1}','{}','{}','{"presentation": {"title": "معنی", "options": ["تفریق", "جمع"], "display": "برداشتن"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000134','270a0000-0000-4000-8000-000000000134',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','۳ تا بود ۲ تا کم شد. چند؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "تفریق", "options": ["۰", "۱", "۲"], "display": "سه منهای دو"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE'),
('260a0000-0000-4000-8000-000000000135','270a0000-0000-4000-8000-000000000135',1,'MULTIPLE_CHOICE','CHALLENGE','REVIEW','کدام عبارت درست است؟','{}','{"version": "st05-ch-addsub-v1", "expectedAnswers": [1], "maxScore": 1}','{}','{}','{"presentation": {"title": "انتخاب", "options": ["۵+۲", "۵-۲", "۲-۵", "۵"], "display": "۵ تا ۲ تا رفت"}}','{"approvalStatus":"DRAFT_BATCH_A_DEPTH"}','ACTIVE')
on conflict(id) do update set prompt=excluded.prompt, evaluator_config=excluded.evaluator_config, metadata=excluded.metadata, status='ACTIVE';

insert into public.station_challenge_rounds(id,challenge_definition_id,round_index,skill_code) values
('2a0a0000-0000-4000-8000-000000000020','2f0a0000-0000-4000-8000-000000000002',0,'G1-SK047'),
('2a0a0000-0000-4000-8000-000000000021','2f0a0000-0000-4000-8000-000000000002',1,'G1-SK048'),
('2a0a0000-0000-4000-8000-000000000022','2f0a0000-0000-4000-8000-000000000002',2,'G1-SK047'),
('2a0a0000-0000-4000-8000-000000000030','2f0a0000-0000-4000-8000-000000000003',0,'G1-SK025'),
('2a0a0000-0000-4000-8000-000000000031','2f0a0000-0000-4000-8000-000000000003',1,'G1-SK026'),
('2a0a0000-0000-4000-8000-000000000032','2f0a0000-0000-4000-8000-000000000003',2,'G1-SK016'),
('2a0a0000-0000-4000-8000-000000000040','2f0a0000-0000-4000-8000-000000000004',0,'G1-SK041'),
('2a0a0000-0000-4000-8000-000000000041','2f0a0000-0000-4000-8000-000000000004',1,'G1-SK042'),
('2a0a0000-0000-4000-8000-000000000042','2f0a0000-0000-4000-8000-000000000004',2,'G1-SK043'),
('2a0a0000-0000-4000-8000-000000000050','2f0a0000-0000-4000-8000-000000000005',0,'G1-SK026'),
('2a0a0000-0000-4000-8000-000000000051','2f0a0000-0000-4000-8000-000000000005',1,'G1-SK032'),
('2a0a0000-0000-4000-8000-000000000052','2f0a0000-0000-4000-8000-000000000005',2,'G1-SK031')
on conflict(id) do update set skill_code=excluded.skill_code;

insert into public.station_challenge_variants(id,round_id,difficulty_level,content_version_id,skill_code)
select gen_random_uuid(), r.id, v.level, v.cv, r.skill_code
from public.station_challenge_rounds r
join (values
('2a0a0000-0000-4000-8000-000000000020'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000100'::uuid),
('2a0a0000-0000-4000-8000-000000000020'::uuid,'CORE','260a0000-0000-4000-8000-000000000101'::uuid),
('2a0a0000-0000-4000-8000-000000000020'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000102'::uuid),
('2a0a0000-0000-4000-8000-000000000021'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000103'::uuid),
('2a0a0000-0000-4000-8000-000000000021'::uuid,'CORE','260a0000-0000-4000-8000-000000000104'::uuid),
('2a0a0000-0000-4000-8000-000000000021'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000105'::uuid),
('2a0a0000-0000-4000-8000-000000000022'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000106'::uuid),
('2a0a0000-0000-4000-8000-000000000022'::uuid,'CORE','260a0000-0000-4000-8000-000000000107'::uuid),
('2a0a0000-0000-4000-8000-000000000022'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000108'::uuid),
('2a0a0000-0000-4000-8000-000000000030'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000109'::uuid),
('2a0a0000-0000-4000-8000-000000000030'::uuid,'CORE','260a0000-0000-4000-8000-000000000110'::uuid),
('2a0a0000-0000-4000-8000-000000000030'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000111'::uuid),
('2a0a0000-0000-4000-8000-000000000031'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000112'::uuid),
('2a0a0000-0000-4000-8000-000000000031'::uuid,'CORE','260a0000-0000-4000-8000-000000000113'::uuid),
('2a0a0000-0000-4000-8000-000000000031'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000114'::uuid),
('2a0a0000-0000-4000-8000-000000000032'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000115'::uuid),
('2a0a0000-0000-4000-8000-000000000032'::uuid,'CORE','260a0000-0000-4000-8000-000000000116'::uuid),
('2a0a0000-0000-4000-8000-000000000032'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000117'::uuid),
('2a0a0000-0000-4000-8000-000000000040'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000118'::uuid),
('2a0a0000-0000-4000-8000-000000000040'::uuid,'CORE','260a0000-0000-4000-8000-000000000119'::uuid),
('2a0a0000-0000-4000-8000-000000000040'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000120'::uuid),
('2a0a0000-0000-4000-8000-000000000041'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000121'::uuid),
('2a0a0000-0000-4000-8000-000000000041'::uuid,'CORE','260a0000-0000-4000-8000-000000000122'::uuid),
('2a0a0000-0000-4000-8000-000000000041'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000123'::uuid),
('2a0a0000-0000-4000-8000-000000000042'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000124'::uuid),
('2a0a0000-0000-4000-8000-000000000042'::uuid,'CORE','260a0000-0000-4000-8000-000000000125'::uuid),
('2a0a0000-0000-4000-8000-000000000042'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000126'::uuid),
('2a0a0000-0000-4000-8000-000000000050'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000127'::uuid),
('2a0a0000-0000-4000-8000-000000000050'::uuid,'CORE','260a0000-0000-4000-8000-000000000128'::uuid),
('2a0a0000-0000-4000-8000-000000000050'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000129'::uuid),
('2a0a0000-0000-4000-8000-000000000051'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000130'::uuid),
('2a0a0000-0000-4000-8000-000000000051'::uuid,'CORE','260a0000-0000-4000-8000-000000000131'::uuid),
('2a0a0000-0000-4000-8000-000000000051'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000132'::uuid),
('2a0a0000-0000-4000-8000-000000000052'::uuid,'SUPPORTED','260a0000-0000-4000-8000-000000000133'::uuid),
('2a0a0000-0000-4000-8000-000000000052'::uuid,'CORE','260a0000-0000-4000-8000-000000000134'::uuid),
('2a0a0000-0000-4000-8000-000000000052'::uuid,'STRETCH','260a0000-0000-4000-8000-000000000135'::uuid)
) v(round_id,level,cv) on v.round_id = r.id
where not exists (select 1 from public.station_challenge_variants x where x.round_id=r.id and x.difficulty_level=v.level);

