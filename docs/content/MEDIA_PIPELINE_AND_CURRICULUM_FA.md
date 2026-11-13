# Media Pipeline و Curriculum Matrix (P9/ADR-0046)

- **تاریخ:** 2026-11-14 · **اجرا:** `npm run content:pipeline -- report-media | curriculum-matrix` · گیت استاتیک: `scripts/verify-media-pipeline.mjs` (۹۴مِ verify:static:all)

## 1. بازبینی آمار با validator جاری (مأموریت §اول — همه تأیید، تغییر نکرده)

| آمار ادعاشده | اندازه‌گیری امروز | نتیجه |
|---|---|---|
| ۲۵ ایستگاه فهرست‌شده | stations-index.json → ۲۵ | ✓ تغییری نکرده |
| ST07 تنها Pilot متنی DRAFT | authoring artifact + source-audit | ✓ تنها transcribe-شده (MAPPED_TO_REPO→VALIDATED) |
| ۲۴ ایستگاه بدون spec کامل | matrix → NOT_AUTHORED ×۲۴ | ✓ |
| ۲۳۲ ردیف صوت DRAFT | 179 global + 53 ST07 = 232 | ✓ |
| صفر باینری صوت | find(opus/ogg/wav/mp3/m4a در content-library) → 0 | ✓ |
| صفر asset تصویری ایستگاهی | find(content-library) → 0؛ ۷۵ تصویر موجود همگی project-design-v2 (برند/کاراکتر) هستند نه asset ایستگاه | ✓ (۳۶ token تصویری pilot بدون فایل) |

## 2. Asset Registry + Metadata Validator (`lib/media.mjs`)

- فرمت از **هدر sniff می‌شود** (WAV/OGG/MP3/FLAC برای صوت؛ PNG/WebP برای تصویر) — پسوند اعتماد نمی‌شود.
- **silence detection**: RMS روی payload PCM — فایل بی‌صدا `audio-silence` reject می‌شود («فایل سکوت asset واقعی نیست» — قاعدهٔ مأموریت).
- hash recompute + mismatch reject؛ placeholder/dummy در نام فایل reject؛ فایل غایب reject؛ provenance (source/recordedBy/rightsStatus) الزامی.
- duration واقعی از WAV parse می‌شود؛ فرمت‌های غیر-WAV باید durationSec اعلان کنند.
- رجیستری: `content-library/authoring/assets/registry.json` — **امروز ۰ asset واقعی** (صداقت: متادیتا ≠ تحویل).

## 3. Missing / Orphan / Impact Reporter (`lib/report-missing.mjs`)

| بخش | عدد واقعی |
|---|---|
| ST07 audio binaries missing | **۵۳** |
| ST07 image tokens missing | **۳۶** (OBJ./GLYPH./PAT. از pilot) |
| Orphan registered assets | ۰ (رجیستری خالی) |
| Impact ST07 | HUMAN_REVIEWED (نیازمند صوت واقعی برای بازبینی شنیداری) → APPROVED → ENABLED |
| Impact ۲۴ ایستگاه دیگر | NOT_AUTHORED — همهٔ مراحل بعدی |

## 4. Curriculum Matrix (`authoring/matrix/curriculum-matrix.json`)

- ۲۵ ایستگاه × ۱۴ فیلد مأموریت (learningGoalAndPrereq … contentVersion) با وضعیت **صادقانه**: ST07 = PROTOTYPE_DRAFT؛ ۲۴ ایستگاه = NOT_AUTHORED. هیچ مقدار جعل نشده.
- Batches A–E طبق ADR-0039 §7 (A: ST01–06 · B: ST08–12 · C: ST13–17 · D: ST18–22 · E: ST23–25) — status=PLANNED با ۴ نقش review مستقل.
- Batch reports: هر batch با همان gateهای P7 (validator→STAGED→VALIDATED→HUMAN_REVIEWED→APPROVED→ENABLED) بسته می‌شود؛ rollback با PackageRollbackManager (P5) و manifest دقیق.

## 5. Media Pipeline — قرارداد تحویل واقعی

- **تصویر**: PNG/WebP، ابعاد از header، بدون متن/عدد embedded مگر تصمیم هنری ثبت‌شده (pilot §9: فقط GLYPH.*/PAT.num*)، سبک ثابت (PALETTE canonical).
- **صوت**: Audio Script از باینری جدا (اسکریپت = CSV متادیتا؛ باینری = فایل واقعی)؛ WAV باید duration/RMS واقعی داشته باشد؛ OGG/Opus با durationSec اعلانی + provenance.
- **رد شدن‌ها**: silence، placeholder-name، hash mismatch، فایل غایب، فرمت ناشناس — هرکدام rule id پایدار.
- **بودجهٔ O7**: پس از تحویل اولین media واقعی اندازه‌گیری می‌شود؛ تا آن‌هنگام فقط گاردهای PROPOSED (ADR-0043 §2) — **هیچ عدد فرضی ثبت نشد**.
- **Image/Audio Optimizer/Normalizer**: نرمال‌سازی فرمت/نرخ/بیت به‌عنوان گام transform پس از تحویل فایل واقعی — در این فاز validator/pipeline چک‌ها را enforce می‌کند؛ ابزار تبدیل خود با تحویل اولین media معرفی می‌شود (gap ثبت).

## 6. وضعیت ST07 (الگوی فرآیند)

- Real ledger: **MAPPED_TO_REPO → STAGED → VALIDATED** (machine gates PASS با evidence tool-run)؛ **HUMAN_REVIEWED صادقانه refuse شد** — فایل evidence انسانی وجود ندارد و ابزار نمی‌تواند بسازد.
- در انتظار: curriculum/pronunciation/accessibility/rights review انسانی + media واقعی.

## 7. Gapهای باز (فهرست نهایی فاز)

1. تألیف ۲۴ ایستگاه (content team) — ۲۴×۱۴ فیلد
2. ۵۳ باینری صوت ST07 + بازبینی شنیداری فارسی + حقوق صدا
3. ۳۶ token تصویری ST07 + تولید ایلوستریشن + بازبینی هنری
4. O1 (evaluator model برای T13/T01 و نهایی‌سازی T15/T05) · O2 (schema نهایی) · O7 (بودجه پس از اندازه‌گیری)
5. Image/Audio Optimizer/Normalizer ابزار تبدیل (پس از اولین تحویل)
6. Human review evidence برای ST07 و همهٔ batchها
