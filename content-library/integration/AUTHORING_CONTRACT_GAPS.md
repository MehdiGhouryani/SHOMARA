# شکاف‌های قرارداد authoring و CMS

- وضعیت: canonical planning contract
- مبنا: بازخوانی دوبارهٔ هر ۱۰ فایل `originals/` در 2026-10-28
- دامنه: تبدیل پژوهش به schema سروری، projection امن کلاینت و workflow صوت/CMS

این سند چیزی از `originals/**` را تصویب نمی‌کند. هدفش جداکردن «پیشنهاد پژوهشی» از «قرارداد قابل اجرا» است تا N06 تا N08 مجبور به حدس‌زدن نشوند.

## ۱. سه مدل جدا، نه یک YAML مشترک

| مدل | محل/مالک | دادهٔ مجاز | دادهٔ ممنوع |
|---|---|---|---|
| `AuthoringStation` | backend/CMS | answer، evaluator، mastery proposal، provenance، review evidence | انتشار مستقیم به کودک |
| `PublishedStationPackage` | content delivery | نسخهٔ قفل‌شده، asset/audio refs، checksum، evaluator server ref | draft و asset تأییدنشده |
| `ChildLessonProjection` | API/Android | prompt، گزینه‌های قابل نمایش، interaction config، audio/asset ID، accessibility copy | answer، correctness، pass threshold، next step، reviewer identity |

`params.correct`، `answer`، `pass_threshold` و قواعد draw/recheck در Stage6/7 فقط ورودی authoring سرورند. هیچ serializer یا cache کلاینت نباید آن‌ها را دریافت کند. telemetry کودک نیز پاسخ خام یا answer key را نگه نمی‌دارد؛ فقط شناسهٔ گزینه/interaction کمینه و نتیجهٔ محاسبه‌شدهٔ سرور، با policy حریم خصوصی، مجاز است.

## ۲. نگاشت lifecycleها

دو lifecycle مستقل لازم است:

| دامنه | lifecycle canonical |
|---|---|
| station/content | `SOURCE_ONLY → MAPPED_TO_REPO → STAGED → VALIDATED → HUMAN_REVIEWED → APPROVED → ENABLED` |
| audio asset | `DRAFT → GENERATED_OR_UPLOADED → TECHNICALLY_VALIDATED → LISTENED → RIGHTS_CLEARED → APPROVED → PUBLISHED` |

وضعیت‌های Stage6 (`draft/validated/reviewed/approved`) فقط aliasهای ورودی‌اند و هنگام import باید به lifecycle canonical نگاشت شوند. `reviewed` بدون نوع بازبین کافی نیست. evidence باید حداقل نقش‌های curriculum، Persian/pronunciation، accessibility و rights/moderation را جدا ثبت کند.

## ۳. قرارداد صوت و CMS

CSVهای فعلی «audio script metadata» هستند، نه `AudioAsset`. مدل دارایی صوتی حداقل این فیلدها را لازم دارد:

```text
AudioAsset(id, locale, purpose, scriptVersion, assetVersion, format,
           durationMs, checksum, sourceKind, voiceProfileId,
           rightsStatus, moderationStatus, reviewEvidence, publishState)
```

- `voice` و `rate` فعلی draft provider hints هستند؛ مدل محصول باید `voiceProfileId` انتزاعی داشته باشد.
- تولید TTS و upload جایگزین هر دو version جدید می‌سازند؛ ID معنایی ثابت می‌ماند.
- پنل باید diff متن نمایشی/TTS، preview، batch pronunciation test، impact analysis، orphan/missing report، history/rollback، RBAC و audit trail داشته باشد.
- package ایستگاه فقط assetهای `APPROVED/PUBLISHED` را با checksum می‌گیرد. نبود فایل، درس را قفل نمی‌کند.

## ۴. مقادیر پژوهشی configurable و نیازمند evidence

موارد زیر default قطعی نیستند: `8s` idle replay، `28dp` trace tolerance، `250/350/450ms` timing، `3/4` mastery، آزمون پرش یک یا پنج سؤال، speech rate `-15%`، LUFS/ducking، haptic و بودجهٔ ۳۰/۱۲/۳. هر کدام باید:

1. در server/config token نسخه‌دار باشد؛
2. fallback امن داشته باشد؛
3. با device/child/educator evidence تصویب شود؛
4. بدون APK جدید قابل rollback باشد، مگر تغییر contract.

بازشدن ایستگاه بعد از ناکامی، تعداد retry و اثر jump test بر progression فقط پاسخ سرور است. کلاینت نباید آن را از فایل محتوایی استنتاج کند.

## ۵. validatorهای اجباری پیش از ST07 gate

- schema typed برای `advance` و `interaction`؛ prose آزاد فقط توضیح نویسنده باشد.
- prerequisite graph بدون cycle و تمام refها موجود.
- coverage هر skill در assessment و حداقل یک spiral item طبق policy تصویب‌شده.
- منع hint/guide/celebration در P4/P5 در projection مستقل، نه فقط بر اساس متن.
- answer-stripping snapshot test برای هر template adapter.
- taught-numeral، audio/asset ref، ID uniqueness و provenance.
- review role/evidence، rights/moderation و promotion transition معتبر.
- package checksum، rollback و missing-audio behavior.

## ۶. تصمیم‌های دامنهٔ آموزشی

این موارد قبل از authoring انبوه N08 نیازمند disposition انسانی‌اند:

- T08 تا شبکهٔ ۹×۹ از ST12؛ بار شناختی و مناسب‌بودن برای پایهٔ اول.
- ST23 مقایسهٔ دو رقمی و ST25 معرفی/نوشتن ۱۰۰ که خود منبع آن‌ها را مرزی با پایهٔ دوم می‌داند.
- معیار تسلط ۳ از ۴ و سیاست «ایستگاه بعدی از دست نمی‌رود».
- تضاد T11 «صدا همیشه موجود باشد» با اصل سراسری missing-audio fallback؛ الزام محصول باید «audio expected, never blocking» باشد.

مالکیت و وضعیت این موارد با `CONTENT-013..018` در `SOURCE_AUDIT.md` و taskهای roadmap پیگیری می‌شود.
