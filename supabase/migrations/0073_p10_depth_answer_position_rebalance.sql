-- Phase 4 (2026-10-06): rebalance MC answer positions for P10 depth (ST02–ST25).
-- Same correct answer text; option order + expectedAnswers index only.
-- Pairing is sequential with p10-batch-*-depth.ts variant order (SUPPORTED/CORE/STRETCH per round).

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"بالا یا پایین","options":["بالا","پایین"],"display":"توپ روی قفسهٔ بالا"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000100';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"چپ یا راست","options":["چپ","راست","روی جعبه"],"display":"گربه سمت چپ جعبه"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000101';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"موقعیت","options":["بین","پشت","زیر","جلو"],"display":"پرنده بین دو شاخه"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000102';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ردیف","options":["وسط","اول"],"display":"★ ○ ★"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000103';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"کنار","options":["میز","پنجره","صندلی"],"display":"در | صندلی | میز"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000104';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جدول","options":["خانهٔ بالا-راست","وسط","خانهٔ پایین-چپ","بیرون جدول"],"display":"جدول ۲×۲"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000105';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"زیر یا رو","options":["زیر","رو"],"display":"کفش زیر نیمکت"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000106';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"پشت / جلو","options":["جلو","پشت","روی صندلی"],"display":"کیف پشت صندلی"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000107';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مسیر شبکه","options":["راست-راست","چپ-بالا","پایین-پایین","همان‌جا"],"display":"شبکه ساده ۳ خانه"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000108';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع کوچک","options":["۲","۳"],"display":"●● + ●"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000109';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۴","۵","۶"],"display":"●●● + ●●"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000110';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۶","۷","۸","۵"],"display":"•••• + •••"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000111';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۱ و ۱","۲ و ۲"],"display":"هدف: ۴"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000112';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۳ و ۲","۲ و ۲","۱ و ۱"],"display":"هدف: ۵"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000113';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۱ و ۴","۲ و ۲","۵ و ۵","۳ و ۳"],"display":"هدف: ۶"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000114';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نماد","options":["۲","۴"],"display":"۴"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000115';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نماد","options":["۳","۶","۵"],"display":"پنج مهره"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000116';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نماد و کمیت","options":["۵","۶","۷","۴"],"display":"●●●●●●"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000117';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شکل","options":["دایره","مثلث"],"display":"○ △ □"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000118';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شکل","options":["مثلث","دایره","مربع"],"display":"△ □ ○"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000119';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شکل","options":["مربع","مثلث","مستطیل","دایره"],"display":"اشکال مخلوط"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000120';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گوشه","options":["۳","۴"],"display":"△"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000121';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ضلع","options":["۳","۴","۵"],"display":"□"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000122';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ویژگی","options":["مربع","مثلث","دایره","هیچکدام"],"display":"△ ○ □"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000123';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گروه","options":["مثلث","دایره"],"display":"○ ○ △"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000124';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"رده‌بندی","options":["مربع و مستطیل","دایره و مربع","همه"],"display":"□ مستطیل ○"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000125';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ویژگی","options":["مثلث","مربع","دایره","مستطیل"],"display":"اشکال"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000126';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۳","۴"],"display":"●●● + ●"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000127';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۵","۴","۶"],"display":"۲ + ۳"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000128';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۵","۷","۸","۶"],"display":"۴ + ۲"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000129';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۴","۳"],"display":"●●●● − ●"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000130';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۲","۴","۳"],"display":"۵ − ۲"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000131';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۲","۳","۴","۵"],"display":"۶ − ۳"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000132';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معنی","options":["جمع","تفریق"],"display":"برداشتن از ظرف"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000133';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۰","۱","۲"],"display":"●●● − ●●"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000134';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"انتخاب","options":["۵ + ۲","۲ − ۵","۵","۵ − ۲"],"display":"۵ تا، ۲ تا رفت"}'::jsonb, true)
where id = '260a0000-0000-4000-8000-000000000135';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مهره","options":["۳","۲"],"display":"●● + ●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000200';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع با شمارنده","options":["۵","۴","۶"],"display":"●●● + ●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000201';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۷","۶","۸","۵"],"display":"•••• + •••"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000202';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۳","۴"],"display":"●●●● − ●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000203';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۲","۴","۳"],"display":"●●●●● − ●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000204';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۱","۳","۲","۴"],"display":"۶ − ۴"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000205';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معنی","options":["جمع","تفریق"],"display":"اضافه کردن مهره"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000206';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارنده","options":["۰","۱","۲"],"display":"●●● − ●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000207';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"انتخاب","options":["۵ + ۲","۵ − ۲","۲ − ۵","۵"],"display":"۵ مهره، ۲ تا اضافه"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000208';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"عدد ۱","options":["۲","۱"],"display":"۱"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000209';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"یک","options":["گروه دوم","گروه اول","هر دو"],"display":"●  |  ●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000210';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"عدد ۲","options":["۱","۲","۳","۰"],"display":"دو نقطه"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000211';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش","options":["۱","۲"],"display":"●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000212';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["دوتایی","یکی","برابر"],"display":"●  و  ●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000213';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["دوتایی","برابر","نمی‌دانم","یکی"],"display":"●●  و  ●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000214';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ساخت","options":["۱","۲"],"display":"● + ●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000215';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۲ و ۲","۰ و ۱","۱ و ۱"],"display":"هدف: ۲"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000216';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۱ بزرگ‌تر از ۲","۲ بزرگ‌تر از ۱","برابرند","هیچکدام"],"display":"۱ و ۲"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000217';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"عدد ۳","options":["۳","۴"],"display":"۳"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000218';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"عدد ۴","options":["گروه اول","برابر","گروه دوم"],"display":"●●●  |  ●●●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000219';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نماد","options":["۲","۳","۴","۵"],"display":"چهار مهره"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000220';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"قد","options":["خط بلند","خط کوتاه"],"display":"—  و  ———"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000221';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه قد","options":["اولی","دومی","برابر"],"display":"کوتاه | بلند"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000222';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["کوتاه-متوسط-بلند","بلند-کوتاه-متوسط","همه برابر","فقط بلند"],"display":"سه چوب"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000223';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش","options":["۳","۴"],"display":"●●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000224';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع کوچک","options":["۴","۳","۵"],"display":"۲ + ۲"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000225';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۳","برابر","۴","نمی‌دانم"],"display":"۳ و ۴"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000226';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"صفر","options":["جعبه با مهره","جعبه خالی"],"display":"●●  |  (خالی)"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000227';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۰","options":["۰","۵","۱"],"display":"۰"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000228';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"به صفر","options":["۱","۵","۲","۰"],"display":"۵ − ۵"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000229';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقارن","options":["شکل کج","مربع"],"display":"□ متقارن | شکل کج"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000230';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقارن","options":["مثلث","خط","همان شکل برعکس"],"display":"نیمه‌قلب"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000231';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقارن","options":["فقط یک ضلع کج","دایره","ابر نامنظم","خط شکسته"],"display":"چند شکل"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000232';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۵","options":["۰","۵"],"display":"۵"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000233';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش تا ۵","options":["۴","۵","۶"],"display":"●●●●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000234';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تا ۵","options":["۴","۶","۳","۵"],"display":"۴ + ۱"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000235';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۶","options":["۶","۷"],"display":"۶"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000236';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۷","options":["شش‌تایی","هفت‌تایی","برابر"],"display":"●●●●●●  |  ●●●●●●●"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000237';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نماد","options":["۷","۵","۶","۸"],"display":"هفت مهره"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000238';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۶","۵"],"display":"۶ و ۵"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000239';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۷","۶","برابر"],"display":"۶ ؟ ۷"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000240';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["۷-۶-۵","۶-۵-۷","۵-۶-۷","فقط ۷"],"display":"۵، ۷، ۶"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000241';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تا ۶","options":["۶","۵"],"display":"۳ + ۳"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000242';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تا ۷","options":["۶","۸","۷"],"display":"۵ + ۲"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000243';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معادل","options":["۴ + ۳","۳ + ۳","۲ + ۲","۵ + ۱"],"display":"هدف: ۷"}'::jsonb, true)
where id = '260b0000-0000-4000-8000-000000000244';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"برابری","options":["برابرند","نابرابر"],"display":"●●  و  ●●"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000300';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مساوی","options":["۳ و ۳","۲ و ۴","هیچکدام"],"display":"۳ و ۳  |  ۲ و ۴"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000301';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"برابری","options":["۱","۲","۰","۳"],"display":"●●●  ؟  ●●●●"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000302';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۸","options":["۸","۶"],"display":"۸"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000303';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش ۸","options":["اولی","برابر","دومی"],"display":"۷ نقطه | ۸ نقطه"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000304';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تا ۸","options":["۶","۷","۸","۹"],"display":"۴ + ۴"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000305';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع تا ۸","options":["۸","۷"],"display":"۵ + ۳"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000306';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معادل","options":["۳ + ۴","۵ + ۳","۲ + ۵"],"display":"هدف: ۸"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000307';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۸ بزرگ‌تر","۷ بزرگ‌تر","برابر","نمی‌دانم"],"display":"۷ و ۸"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000308';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۵","۷"],"display":"۵ و ۷"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000309';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"کمتر","options":["۸","۶","برابر"],"display":"۸ ؟ ۶"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000310';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["۹-۸-۷","۷-۸-۹","۸-۷-۹","فقط ۹"],"display":"۹، ۷، ۸"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000311';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۹","options":["۸","۹"],"display":"۹"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000312';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش","options":["نه‌تایی","هشت‌تایی","برابر"],"display":"۸ | ۹"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000313';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تا ۹","options":["۸","۱۰","۷","۹"],"display":"۵ + ۴"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000314';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۶","۹"],"display":"۶ و ۹"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000315';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معادل","options":["۴ + ۴","۳ + ۵","۵ + ۴"],"display":"هدف: ۹"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000316';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۷","۸","۹","۱۰"],"display":"۹ − ۱"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000317';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نشانه +","options":["+","−"],"display":"+ − ="}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000318';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معنی +","options":["کم کردن","فقط نوشتن","جمع کردن"],"display":"۲ + ۳"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000319';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تشخیص","options":["۵ − ۲","۳ = ۳","۴ + ۱","فقط ۵"],"display":"چند عبارت"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000320';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۵","۴"],"display":"۱ + ۴"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000321';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۵","۶","۷"],"display":"۳ + ۳"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000322';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۸","۷","۹","۶"],"display":"۲ + ۶"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000323';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۲ + ۳","۱ + ۱"],"display":"هدف: ۵"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000324';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۴ + ۲","۲ + ۲","۱ + ۳"],"display":"هدف: ۶"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000325';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معادل","options":["متفاوت","هر دو ۴","هر دو ۵","نمی‌دانم"],"display":"۳+۲ و ۴+۱"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000326';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نشانه −","options":["+","−"],"display":"+ −"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000327';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"معنی","options":["کم کردن","جمع","فقط خواندن"],"display":"۵ − ۲"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000328';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تشخیص","options":["۳ + ۱","۴ = ۴","۲ + ۲","۶ − ۲"],"display":"عبارت‌ها"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000329';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۴","۳"],"display":"۴ − ۱"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000330';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۳","۵","۴"],"display":"۷ − ۳"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000331';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۴","۵","۶","۳"],"display":"۹ − ۴"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000332';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"طول","options":["نوار کوتاه","نوار بلند"],"display":"کوتاه | بلند"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000333';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه طول","options":["A","B","برابر"],"display":"A بلند B کوتاه"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000334';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"طول و تفریق","options":["بلندتر","همان","ناپدید","کوتاه‌تر از قبل"],"display":"بلند − ۲"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000335';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ده‌تایی","options":["۱۰","۱"],"display":"یک بسته"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000336';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ارزش مکانی","options":["۱۰","۱۲","۳"],"display":"۱۰ + ۲"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000337';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ساخت عدد","options":["۱۵","５۱","۱۰","۶"],"display":"ده و پنج یکی"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000338';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گروه‌بندی","options":["۱ گروه ده‌تایی","۱۰ گروه"],"display":"۱۰ مهره"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000339';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تجزیه","options":["۱ ده و ۴ یکی","۴ ده و ۱ یکی","۱۴ یکی فقط"],"display":"۱۴"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000340';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۳۲","۵","۲۳","۲۰"],"display":"۲۰ + ۳"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000341';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تشخیص","options":["بسته ۱۰","۵ تای پراکنده"],"display":"بسته ۱۰ | ۵ تای پراکنده"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000342';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ارزش مکانی","options":["۰ و ۱۱","۲ و ۱","۱ و ۱"],"display":"۱۱"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000343';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"انتخاب","options":["۱ ده و ۶ یکی","۶ ده و ۱ یکی","۱۶ ده","فقط ۶"],"display":"۱۶"}'::jsonb, true)
where id = '260c0000-0000-4000-8000-000000000344';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ساعت","options":["۳","۹"],"display":"ساعت عقربه‌ای"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000400';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"خواندن ساعت","options":["۶","۱۲","۳"],"display":"عقربه ساعت‌شمار روی ۶"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000401';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"زمان","options":["۲:۳۰","۳:۰۰","۱:۳۰","۲:۱۵"],"display":"۲:۰۰ → ؟"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000402';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۱۰","options":["۱۰","۱۲"],"display":"۱۰"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000403';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۱۱–۱۹","options":["۸","۲۲","۱۵"],"display":"۸، ۱۵، ۲۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000404';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ارزش مکانی","options":["۲ و ۱","۱۲ یکی","۱ و ۲","۱ و ۱۲"],"display":"۱۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000405';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"دقیقه","options":["۶۰","۳۰"],"display":"ساعت کامل"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000406';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گذشت زمان","options":["۴","۶","۷"],"display":"۵ → +۱"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000407';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"فاصله","options":["۲","۱","۳","۰"],"display":"۱۰ → ۱۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000408';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع چندتایی","options":["۴","۵"],"display":"۲+۲+۱"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000409';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۵","۶","۷"],"display":"۳+۱+۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000410';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۸","۹","۱۰","۷"],"display":"۴+۲+۳"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000411';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقریب","options":["۹","۴"],"display":"۴ یا ۹"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000412';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقریب","options":["۱۰","۵","۰"],"display":"به ۵ یا به ۱۰"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000413';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گرد کردن","options":["۲۰","۱۲","۱۵","۱۰"],"display":"۱۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000414';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۲","۳"],"display":"۱+۱+۱"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000415';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۳+۱","برابر","۲+۲+۲"],"display":"۲+۲+۲ و ۳+۱"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000416';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"با صفر","options":["۵","۷","۶","۲"],"display":"۵+۰+۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000417';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"الگوی عددی","options":["۸","۷"],"display":"۲ ۴ ۶ ؟"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000418';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"الگو","options":["۶","۸","۷"],"display":"۱ ۳ ۵ ؟"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000419';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"الگوی کاهشی","options":["۵","۲","۴","۷"],"display":"۱۰ ۸ ۶ ؟"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000420';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"زمان","options":["۷","۱"],"display":"ساعت"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000421';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ربع","options":["۳:۳۰","۳:۱۵","۴:۰۰"],"display":"۳:۰۰ + ۱۵دقیقه"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000422';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مدت","options":["۳۰","۱۵","۶۰","۴۵"],"display":"۸:۰۰ → ۸:۳۰"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000423';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"الگوی شکلی","options":["■","●"],"display":"■ ● ■ ● ؟"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000424';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"الگو","options":["۴","۵","۳"],"display":"۲ ۲ ۳ ۳ ۴ ؟"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000425';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش ۵تایی","options":["۱۶","۲۵","۲۰","۱۸"],"display":"۵ ۱۰ ۱۵ ؟"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000426';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ده‌تایی","options":["۱","۱۰"],"display":"۱ بسته"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000427';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ده‌تایی","options":["۲۰","۱۲","۲"],"display":"۲ بسته"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000428';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترکیب","options":["۴۳","۷","۳۰","۳۴"],"display":"۳۰ + ۴"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000429';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"خرید","options":["۵","۲"],"display":"۵ تایی با ۱۰"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000430';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مسئله","options":["۳","۱","۲"],"display":"۸ با ۲۰"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000431';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"باقی","options":["۲","۳","۴","۱"],"display":"۱۵ − ۱۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000432';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جمع","options":["۵","۱۵"],"display":"۱۰+۵"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000433';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۵","۱۰","۱۵"],"display":"۲۰−۱۰"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000434';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"برآورد","options":["۲","۱","۵","۳"],"display":"۲۵"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000435';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"دورقمی","options":["بیست و سه","دو و سه"],"display":"۲۳"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000436';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تشخیص","options":["۷","۱۴","۵"],"display":"۷، ۱۴، ۵"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000437';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ارزش مکانی","options":["۴ و ۵","۵ و ۴","۴۵ یکی","۴"],"display":"۴۵"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000438';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ساخت","options":["۱۷","۷۱"],"display":"۱۰+۷"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000439';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ساخت","options":["۳۰","۳","۳۳"],"display":"۳۰+۰"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000440';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"انتخاب","options":["۸ ده و ۲ یکی","۲۸ ده","۲ ده و ۸ یکی","فقط ۸"],"display":"۲۸"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000441';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۵۲","۲۵"],"display":"۲۵ و ۵۲"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000442';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۳۰","برابر","۲۹"],"display":"۳۰ ؟ ۲۹"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000443';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["۱۴-۲۴-۴۱","۴۱-۲۴-۱۴","۲۴-۱۴-۴۱","فقط ۴۱"],"display":"۴۱، ۱۴، ۲۴"}'::jsonb, true)
where id = '260d0000-0000-4000-8000-000000000444';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جدول","options":["۲۶","۲۴"],"display":"۲۵ → ؟"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000500';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"جدول ۱۰۰","options":["کنار ۴۹","کنار ۹۰","اول جدول"],"display":"۴۹، ۵۰، ۵۱"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000501';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"بازه","options":["۱۰","۹","۱۱","۲۰"],"display":"۳۰ → ۴۰"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000502';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"اندازه","options":["بلند","کوتاه"],"display":"کوتاه | بلند"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000503';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"اندازه‌گیری","options":["۱","۱۰","۵"],"display":"۵ واحد"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000504';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"طول","options":["۴","۶","۵","۳"],"display":"۸ − ۳"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000505';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۴۳","۳۴"],"display":"۳۴ و ۴۳"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000506';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["۶۰","۵۹","برابر"],"display":"۶۰ ؟ ۵۹"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000507';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["۲۷-۵۲-۷۲","۷۲-۵۲-۲۷","۵۲-۲۷-۷۲","فقط ۷۲"],"display":"۷۲، ۲۷، ۵۲"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000508';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقویم","options":["جمعه","یکشنبه"],"display":"شنبه → ؟"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000509';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"هفته","options":["۵","۷","۱۰"],"display":"تقویم"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000510';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"روزها","options":["چهارشنبه","پنجشنبه","جمعه","دوشنبه"],"display":"سه‌شنبه + ۲"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000511';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش","options":["۷","۸"],"display":"الگوی زوج"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000512';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۵تایی","options":["۲۰","۱۶","۲۵"],"display":"۵ ۱۰ ۱۵ ؟"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000513';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ده‌تایی","options":["۳۵","۵۰","۳۱","۴۰"],"display":"۱۰ ۲۰ ۳۰ ؟"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000514';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"الگو","options":["هفته","روز"],"display":"تکرار"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000515';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"شمارش پشت‌سرهم","options":["۶","۴","۵"],"display":"۱–۴"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000516';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"کاهشی","options":["۳","۴","۵","۸"],"display":"۷ ۶ ۵ ؟"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000517';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۵تایی","options":["۱۵","۱۲"],"display":"۵ ۱۰ ؟"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000518';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گروه","options":["۱۰","۲۰","۱۵"],"display":"۳ × ۵"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000519';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گروه","options":["۱۵","۲۵","۲۰","۱۰"],"display":"۴ × ۵"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000520';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۸تایی","options":["۱۶","۱۰"],"display":"۲ × ۸"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000521';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"الگو","options":["۲۰","۲۴","۱۸"],"display":"۸ ۱۶ ؟"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000522';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مسئله","options":["۲۴","۲۱","۲۷","۱۶"],"display":"۳ × ۸"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000523';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"گروه‌بندی","options":["درست","غلط"],"display":"۱۰ = ۵+۵"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000524';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقسیم گروهی","options":["۴","۳","۵"],"display":"۲۰ ÷ ۵"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000525';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مسئله","options":["۱","۴","۲","۸"],"display":"۱۶ ÷ ۸"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000526';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"دو قدم","options":["۳","۵"],"display":"۳ + ۲"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000527';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"چندمرحله","options":["۶","۵","۷"],"display":"۵−۱+۲"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000528';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"چندمرحله","options":["۱۰","۱۲","۹","۱۱"],"display":"۱۰−۳+۴"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000529';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"زمان تقریبی","options":["۳:۰۰","حدود ۲:۱۰"],"display":"۲:۰۰ + ۱۰د"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000530';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تقریب زمان","options":["۴:۱۵","۵:۰۰","۴:۳۰"],"display":"۴:۰۰ + ۳۰د"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000531';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مجموع زمان","options":["۱:۱۵","۱:۳۰","۲:۰۰","۱:۴۵"],"display":"۱:۰۰ + ۳۰د"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000532';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["۵","۴"],"display":"۲+۳−۱"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000533';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["۵","۶","۸"],"display":"۴+۴−۲"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000534';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[3]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"ترتیب","options":["۴","۶","۳","۵"],"display":"۶+۳−۴"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000535';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۱۰۰","options":["۱۰۰","۱۰"],"display":"۱۰۰"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000536';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[1]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تا ۱۰۰","options":["۱۰","۱۰۰","۲۰"],"display":"۱۰ × ۱۰"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000537';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"۱۰۰","options":["۱۰۰","۹۹","۱۰۱","۹۰"],"display":"۹۹+۱"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000538';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"کفایت","options":["نه","بله"],"display":"سؤال تعداد"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000539';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"کفایت","options":["ناکافی","کافی","مهم نیست"],"display":"بدون عدد"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000540';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"کفایت","options":["ناکافی","فقط رنگ مهم است","کافی","نمی‌دانم"],"display":"۳+۲"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000541';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"مقایسه","options":["بله","خیر"],"display":"۱۰۰ و ۹۰"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000542';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[2]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"نزدیکی","options":["۸۰","برابر","۹۵"],"display":"۹۵ و ۸۰"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000543';

update public.content_versions set
  evaluator_config = jsonb_set(coalesce(evaluator_config, '{}'::jsonb), '{expectedAnswers}', '[0]'::jsonb, true),
  metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{presentation}', '{"title":"تفریق","options":["۹۰","۸۰","۱۱۰","۱۰"],"display":"۱۰۰−۱۰"}'::jsonb, true)
where id = '260e0000-0000-4000-8000-000000000544';
