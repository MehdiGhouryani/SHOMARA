# N08R — نقشهٔ محتوایی ST07 · P1 «کشف» (محور ۲ directive مالک)

> **تاریخ:** ۲۰۲۶-۱۱-۰۷ · **منبع:** `content-library/originals/shomara-stage7-pilot-ST07.md` §2 (DRAFT، SOURCE_ONLY — byte-protected، فقط خوانده شد) + `derived/game-patterns-index.json` + قرارداد ADR-0039 §2 (مرز projection کودک).
> **وضعیت:** نقشهٔ محتوایی برای طراحی مرحلهٔ Teach/Discover؛ هیچ محتوایی از این سند وارد runtime نمی‌شود (زنجیرهٔ `SOURCE_ONLY→…→ENABLED` باز است و O1/O2 تصمیم مالک‌اند).

## ۱) نقشهٔ مرحلهٔ P1 (۴ قدم)

| قدم | kind | محتوای واقعی | تعامل کودک | ارزیابی | بازخورد | صوت (ID) | advance |
|---|---|---|---|---|---|---|---|
| s00 | intro | راهنما pose `CH.guide.encourage` بزرگ | فقط تماشا | **ندارد** (P1 بی‌نمره) | — | `ST07.P1.s00.pr` | پایان صدا |
| s01 | discover T01 | کارت‌های `OBJ.sun/house/tree` + برچسب‌های صوتی `a/b/c`، reveal ‏`GLYPH.1` | لمس هر کارت → برجسته + پخش برچسب؛ پس از هر سه → ظهور نماد «۱» با انیمیشن نوشتن | **ندارد** — کشف آزاد | مثبتِ ضمنی (برجسته‌شدن + صوت) | `…s01.pr` + `…s01.done` | پایان صدای done |
| s02 | discover T01 | کارت‌های `OBJ.eyes/shoes/wheels` (گروه‌های دوتایی)، reveal ‏`GLYPH.2` | مانند s01 با شمارش ۲ | **ندارد** | مانند s01 | `…s02.pr`/`…s02.done` | پایان صدای done |
| s03 | transition | راهنما encourage بزرگ | فقط تماشا | **ندارد** | — | `ST07.P1.s03.pr` | پایان صدا |

- **هدف آموزشی:** «هر چیز یک‌تایی با نماد ۱ شمرده می‌شود؛ گروهِ دوتایی با نماد ۲» (ارقام ۱ و ۲ — `numerals_taught: [1,2]`).
- **Idle replay:** ۸ ثانیه بی‌کاری → تکرار صوت آخرین دستور، بدون نمایش خطا (در `CALIBRATION_V1` config است — هاردکد ممنوع).
- **راهنما:** poseهای `CH.guide.think/encourage` — از پنج شخصیت cast تأییدشده (CONTENT-006 برای چهره/صدا باز).

## ۲) تطبیق با معماری Android (اجراشده در N08R-08)

| لایه | مصوبه | فایل |
|---|---|---|
| مدل کودک-امن (projection) | فقط `assetId/labelAudioId/countPerCard/revealGlyphAssetId/promptAudioId/doneAudioId` — **بدون هیچ فیلد answer/correct/threshold** (گارد تست) | `feature/lesson/ShomaraLessonDiscover.kt` |
| منطق جریان | لمس idempotent، گیت reveal، advance درون‌فهرست — بدون قضاوت | همان فایل (`ShomaraDiscoverLogic`) |
| رندر | کاشی‌های ۸۰dp با placeholder هندسی خنثی (assetها تحویل نشده)، تیکِ شمارش روی لمس (انیمیشن=مفهوم)، reveal با تایپوگرافی توکن + Featured واحد؛ reduced-motion = ظهور ایستا | همان فایل |
| تغذیه | `ShomaraLessonHost(discoverSteps=…)` ← `ShomaraApp` ← `AppContainer.lessonDiscoverSteps` ← `LessonContentWiring` دو-واریانتی (debug = ساختار DRAFT برای بازبینی طراحی؛ **release = لیست خالی، fail-closed**) | `app/src/debug|release/.../LessonContentWiring.kt` |
| اتصال به ارزیاب | `onAllStepsComplete` — عمداً no-op تا O1/O2 و فاز ۱ (بستهٔ محلی + ارزیاب) بسته شوند | `ShomaraLessonHost` |

## ۳) Gapهای ثبت‌شده (جعل ممنوع)

1. **O1/O2 باز** → ارزیاب محلی و بستهٔ باندل وجود ندارند؛ advance واقعی P1→P2 به ارزیاب وابسته است.
2. **۴۱ asset ST07 (OBJ.*/GLYPH.*/UI.*/PAT.*)** فقط توصیف‌اند → placeholder هندسی؛ انیمیشن «نوشتن نماد» منتظر GLYPH.1/2.
3. **صوت ۲۳۲ ردیف DRAFT، صفر باینری** → صدا ساکت و هرگز مسدودکننده نیست (CONTENT-017)؛ idle-replay 8s هنوز به config نسخه‌دار وصل نشده.
4. **چهرهٔ راهنما/poseها** (CONTENT-006) → فقط cameo استاتیک Main/Number pose 1 موجود.
5. عنوان‌های ایستگاه provisional (CONTENT-004) — هیچ متن هدفی اختراع نشد؛ محتوای روی صفحه = کارت‌ها + نماد.
6. پیش‌نمایش DEBUG ساختار ST07 را برای هر ایستگاهی که ورود شود نشان می‌دهد (برچسب «پیش‌نمایش طراحی») — در release این مسیر وجود ندارد.
