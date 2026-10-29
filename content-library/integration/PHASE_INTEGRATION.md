# ادغام CONTENT در فازبندی Native

این سند مالک هر خروجی محتوا را مشخص می‌کند. وضعیت taskها فقط در `harness/roadmap.json` تغییر می‌کند.

| فاز | استفاده از پژوهش | خروجی اجباری | ممنوع |
|---|---|---|---|
| N02 Foundation | provenance، checksum، conflict inventory، skill routing | ساختار `content-library/` و `skills/`، validatorهای source/skill | runtime lesson یا production import |
| N03 Design System | Stage2/5 اصول لمس، feedback، motion، audio control و math direction | primitiveهای 48/72dp، state/semantics، reduced motion و audio replay | hardcode زمان/tolerance تأییدنشده |
| N04 Auth | فقط قواعد حریم خصوصی و زبان کودک | بدون PII در telemetry/log و copy کوتاه | استفاده از curriculum برای احراز هویت |
| N05 Child Shell | Stage4 station/chapter map | path metadata و عنوان‌های owner-approved با ID ثابت | rename خام station contract |
| N06 Learning Player | Stage5/6 و ST07 | سه مدل authoring/published/child projection، lifecycle mapping، چهار adapter پایلوت T01/T05/T13/T15، answer-stripping و ST07 draft acceptance | answer/evaluator/threshold در APK یا enable production |
| N07 Offline/Audio/CMS | Stage5 audio و دو CSV | جداسازی script metadata از binary asset، manifest/version/checksum/cache، CMS RBAC/audit/rollback/impact و import idempotent ۲۳۲ row | ادعای audio موجود، provider hint به‌عنوان contract یا auto-approve |
| N08 UX & Educational QA | Stage1/4/6، سپس ۲۴ station باقی‌مانده | resolution conflictها و curriculum scope، پنج authoring batch، spiral/prerequisite audit، child/educator QA | تولید انبوه قبل از ST07 و scope gate |
| N09 Cutover | فقط محتوای `APPROVED` | parity و حذف legacy بدون از دست‌رفتن provenance | انتقال draft به enabled |
| N10 Release | rights/privacy/performance evidence | package allowlist فقط برای approved versionها | signing/release بدون HG-05 |

## ترتیب authoring بعد از ST07

1. Batch A: ST01–ST06
2. Batch B: ST08–ST12
3. Batch C: ST13–ST17
4. Batch D: ST18–ST22
5. Batch E: ST23–ST25

بعد از هر batch: schema validation، بررسی صفحه‌های کتاب، skill coverage، audio-ID uniqueness، spiral prerequisites، human educational review و ثبت blockerها. تولید batch بعدی بدون بستن خطاهای P0/P1 batch قبلی ممنوع است.

## promotion evidence

| انتقال | evidence کمینه |
|---|---|
| SOURCE_ONLY → MAPPED_TO_REPO | compatibility map و conflict IDs |
| MAPPED_TO_REPO → STAGED | typed schema، feature flag خاموش و provenance |
| STAGED → VALIDATED | deterministic validator، server-boundary tests و zero schema error |
| VALIDATED → HUMAN_REVIEWED | review متخصص محتوا/فارسی/تلفظ؛ بدون دادهٔ کودک |
| HUMAN_REVIEWED → APPROVED | owner decision، asset/audio rights و version lock |
| APPROVED → ENABLED | migration/rollout plan، offline/device/observability evidence و rollback |
