# ثبت تصمیم‌های مالک — O1 تا O13 و CONTENT-001 تا 018 (Phase 0)

- **تاریخ:** 2026-11-12 · **مبنا:** commit `aa2805c`
- **قاعده:** هیچ تصمیمی این‌جا «انتخاب» نمی‌شود؛ فقط گزینه‌ها، اثر هر انتخاب، و چیزی که مسدود می‌کند ثبت می‌شود. توصیه‌های فنی با برچسب «توصیهٔ فنی (غیرقابل‌تصمیم‌گیری از طرف مالک)» آمده‌اند.
- **منبع O:** `docs/adr/ADR-0039-fully-offline-content-and-duolingo-copy-ui.md` §3/§4/§8. **منبع CONTENT:** `content-library/derived/source-audit.json` (18 issue: 16 OPEN + 2 GUARDED).

## جدول O (تصمیم‌های معماری/محصول)

| # | تصمیم | گزینه‌ها | چه را مسدود می‌کند | توصیهٔ فنی | وضعیت |
|---|---|---|---|---|---|
| O1 | مدل answer-key و امنیت ارزیاب محلی | (1) کلید در APK داخل لایهٔ ارزیاب جدا؛ (2) ارزیاب بدون کلید قابل‌استخراج — اثبات per-template؛ (3) ارزیاب از پارامتر آیتم در runtime | Phase 1 / حلقهٔ درس (G-12, G-16, G-26) | (3)+(2) ترکیبی: هر جا از پارامتر مشتق شد، از پارامتر؛ وگرنه کلید داخل لایهٔ ارزیاب جدا با obfuscation+بدون لاگ؛ گزینهٔ 2/3 فقط per-template اثبات شود | OPEN |
| O2 | فرمت پکیج محتوای امضاشده | تأیید پیشنهاد ADR-0039 §4 (+امضای منفصل/چرخش کلید) یا جایگزین | Phase 1 (G-13, G-14) | تأیید پیشنهاد + امضای منفصل + پین کلید + چرخش | OPEN |
| O3 | سرنوشت `LessonGateway` | (a) نگه‌داشتن interface با پیاده‌سازی محلی؛ (b) حذف و `LocalLessonEvaluator` صریح | Phase 1/M1 (G-09) | (b) — نام گمراه‌کنندهٔ Gateway نمی‌ماند؛ idempotency-key قطعی حفظ شود | OPEN |
| O4 | فروشگاه پایدار محلی | Room (پیشرفت/پکیج/تاریخچه) + DataStore (تنظیمات) — یا همهٔ داده در DataStore یا ساختار دیگر | Phase 1/M2 (G-10) | Room + DataStore همان پیشنهاد ADR-0039 §8؛ تست روی SQLite واقعی الزامی | OPEN |
| O5 | هویت محلی کودک | تک‌پروفایل vs چندپروفایل با انتخاب در launch | Phase 2 (G-27) | برای خانه: تک‌پروفایل کافی؛ چندپروفایل فقط اگر مدرسه/خواهر-برادر هدف است — نیاز ADR کوچک | OPEN |
| O6 | سرنوشت Backend/Supabase (۷۴ migration) و `apps/web` (شامل پنل N08-13) | حذف کامل / نگه‌داشتن به‌عنوان ابزار authoring آفلاین (CMS بدون backend کودک) | Phase 2/5، بازنویسی ledger (G-23, G-24) | ماتریس در baseline report §O6؛ هر دو سناریو مکتوب؛ حذف بدون retirement plan ممنوع | OPEN |
| O7 | بودجهٔ حجم APK/AAB و پکیج | عدد سقف (متن ~۱.۲MB؛ صوت/تصویر نامعلوم تا Phase 4) | Phase 1/4 (G-13, G-29) | تعیین سقف تجربی پس از نمونهٔ صوت/تصویر؛ CI measure gate | OPEN |
| O8 | تأمین فونت Vazirmatn | مالک TTF approved می‌دهد؛ تا آن‌هنگام `FontFamily.Default`؛ دانلود تصادفی ممنوع | Phase 4 و همهٔ UI | — | OPEN (ورودی مالک) |
| O9 | چهرهٔ راهنما و assetهای شخصیت | Main (بنفش، پیش‌فرض فعلی — تأییدنشده) vs سایر؛ نقش‌های Dana/Fandogh/Roka؛ CONTENT-006 | فازهای A–D (G-15) | — | OPEN |
| O10 | اقتصاد انگیزشی (کپی Duolingo §5.4) | جان/انرژی، streak غیرتنبیهی، لگیز، سکه/فروشگاه، بج، حلقهٔ هدف روزانه — هر کدام فقط با ADR مستقل + نسخهٔ child-safe | هر فازی که یکی را بسازد (هیچ‌کدام برنامه‌ریزی نشده) | هیچ‌کدام ساخته نشود | OPEN (پیش‌فرض: تعویق) |
| O11 | CONTENT-004/005/007/016 (مسدودکننده‌های N08-08) | 004 نام ۸ ایستگاه+۵ فصل؛ 005 محتوای مذهبی (neutral-first vs پکیج فرهنگی جدا)؛ 007 منبع SFX+haptic پیش‌فرض؛ 016 scope پایهٔ اول (۹×۹، مقایسهٔ دومرقمی، ۱۰۰) | Phase 1، 3، 4 | — | OPEN |
| O12 | باقی CONTENT-001…018 (جز موارد بالا) | جدول CONTENT پایین سند | Phase 1–4 | — | OPEN |
| O13 | تعریف parity برای N09-01 و «web/API unaffected» (N09-03) | parity با چه، وقتی backend نیست؟ | Phase 5 (M6) | parity = رفتار مرجع Expo فقط برای جریان‌های آفلاین زنده؛ contract test = تست پکیج bundle | OPEN |

## جدول CONTENT-001…018 (از source-audit.json — status واقعی)

| # | نوع | موضوع | blocks | گره به تصمیم/فاز |
|---|---|---|---|---|
| CONTENT-001 | OPEN | جهت خط نوشتن عدد ۱ در ST07 | N06 | O12 — قبل از authoring نهایی ST07 |
| CONTENT-002 | OPEN | تعداد سؤال jump-test | N06 | O12 — قاعدهٔ نسخه‌دار موتور (P1-3) |
| CONTENT-003 | OPEN | ارجاع hint در pool مستقل | N06 | O12 — سیاست hint نسخه‌دار |
| CONTENT-004 | OPEN_DECISION | نام ایستگاه‌ها و فصل‌ها | N05 | O11 — Phase 3 |
| CONTENT-005 | OPEN_DECISION | محتوای مذهبی و عکس کتاب درسی | N08 | O11 — Phase 3 |
| CONTENT-006 | OPEN_DECISION | نریتور، سرعت و سبک گفتار | N07 | O9 — Phase 4 |
| CONTENT-007 | OPEN_DECISION | haptic پیش‌فرض و لایسنس SFX | N07,N08 | O11 — Phase 4 |
| CONTENT-008 | GUARDED | پاسخ authoring فقط سمت ارزیاب (نه پروجکشن/DB/لاگ) | N06 | مرز همیشگی — در مدل جدید «ارزیاب محلی» است؛ snapshot test الزامی |
| CONTENT-009 | MISSING_ARTIFACT | assetهای تصویری ST07 | N06 | Phase 4 |
| CONTENT-010 | MISSING_ARTIFACT | صوت approved قابل‌پخش | N07 | Phase 4 |
| CONTENT-011 | UNVERIFIED_VALUE | زمان‌بندی/تحمل/سرعت/بلندی گفتار | N08 | O12 — اعتبارسنجی با محتوای واقعی |
| CONTENT-012 | QUALITY_GAP | ۲۴ spec ایستگاه authoring نشده | N08 | Phase 3 (۵ بچ) |
| CONTENT-013 | SCHEMA_GAP | متادیتای اسکریپت صوت و lifecycle باینری آمیخته‌اند | N07 | O6/Phase 4 — تفکیک schema |
| CONTENT-014 | UNVERIFIED_SEMANTICS | معناشناسی mastery/unlock/jump | N06,N08 | مسدودکنندهٔ موتور (P1-3) — تصمیم نسخه‌دار مالک |
| CONTENT-015 | SCHEMA_GAP | behavior تایپ‌شدهٔ authoring و نقش‌های review | N06 | P3-1 validator |
| CONTENT-016 | CURRICULUM_SCOPE | scope پایهٔ اول و بار شناختی آیتم‌های پیشرفته | N08 | O11 — Phase 3 |
| CONTENT-017 | SOURCE_CONFLICT | T11 صوت همیشه‌موجود vs fallback غیرمسدودساز سراسری | N06,N07 | O12 — قاعدهٔ نسخه‌دار موتور |
| CONTENT-018 | GUARDED | telemetry فقط IDs، بدون پاسخ خام/کلید | N06,N10 | مرز همیشگی — در این ممیزی تأیید (LessonGateway.minimalPayload؛ لاگ بدون مقادیر) |

## اولویت پیشنهادی تصمیم‌گیری مالک (ترتیب ازدودار رفع مسدودکنندگی)

1. **O1** (باز می‌کند: موتور و bundling) → 2. **O2** (فرمت پکیج) → 3. **O4** (Room/DataStore) → 4. **O3** (شکل cutover ارزیاب) → 5. **O7** (بودجهٔ حجم برای طراحی CI measure) → 6. **O5** (قبل از Phase 2) → 7. **O6** (قبل از بازنویسی ledger و Phase 5) → 8. **O11/O12/CONTENT-014** (قبل از Phase 3) → 9. **O8/O9** (قبل از Phase 4) → 10. **O13** (قبل از Phase 5) → O10 در هر نقطه که مالک بخواهد اقتصادی ساخته شود (هیچ فازی منتظرش نیست).

**قاعدهٔ اجرا:** هیچ عامل کدنویسی اجازه ندارد یکی از این گزینه‌ها را خودش انتخاب کند؛ «توصیهٔ فنی» ورودی تصمیم است، نه تصمیم.
