# نقشهٔ راه اجرای زیرساخت SHOMARA — Phase 0 تا 6 (وابستگی‌آگاه)

- **تاریخ:** 2026-11-12 · **مبنا:** commit `aa2805c` · **وضعیت:** نقشهٔ پیشنهادی؛ هر فاز فقط با gate فاز قبل شروع می‌شود.
- **هماهنگی با ADR-0039 §7:** نقشهٔ فازها همان ترتیب ADR-0039 است با تفکیک مهندسی ریزتر. هیچ فاز بدون gate قبلی و تصمیم‌های مسدودکنندهٔ خودش شروع نمی‌شود.
- **قواعد ثابت:** شاخهٔ مستقل هر فاز؛ کار مستقیم روی main ممنوع؛ PASS فقط با فرمان+exit code+evidence؛ حذف فقط با consumer-proof؛ بازنویسی اسناد canonical فقط یک نسخهٔ یکتا.

---

## Phase 0 — عمومی‌سازی ممیزی، رفع P0 مکانیکی و هم‌راستاسازی حاکمیت (فوری؛ بدون تصمیم مالک)

| # | کار | خروجی/گیت |
|---|---|---|
| P0-1 | ثبت ۵ سند ممیزی این مجموعه روی شاخهٔ audit و بازبینی مالک | همین اسناد؛ بدون تغییر کد |
| P0-2 | رفع G-01: نصب `platforms;android-37.0` در `android-native.yml` + گسترش قرارداد preflight به `android-37/37.x` (`verify-android-environment.mjs`) + هم‌راستاسازی ADR-0036/`ANDROID_BUILD_ENVIRONMENT.md` | یک اجرای CI تا `android:gate` PASS؛ preflight محلی READY |
| P0-3 | رفع G-02: تفکیک job required «static-core» از job اطلاعاتی مرورگری در `ci.yml`؛ حذف continue-on-error از بخش required | شکست عمدی verifier غیرمرورگری → CI قرمز (negative control) |
| P0-4 | G-03: upload artifact گزارش‌های gate/lint/test؛ G-04: repair تست یتیم vitest + verifier شمارش فایل‌ها؛ G-05: dependabot + یک job audit زمان‌بندی‌شده | CI green با artifact |
| P0-5 | آماده‌سازی گام بازنویسی ledger (G-08): فهرست دقیق ردیف‌های server-authoritative در AGENTS/START_HERE/PACKAGE_BOUNDARIES/ADR-0003/roadmap به‌عنوان پیوست این سند — اجرای متن پس از تصمیم O6/O13 تا متن جدید یک‌باره و بدون تناقض نوشته شود | پیوست در baseline report؛ commit بازنویسی در P1-0 |

**DoD فاز 0:** CI دو workflow با gate required واقعاً green؛ اسناد ممیزی تأیید مالک؛ هیچ تغییر معماری انجام نشده.

## Phase 1 — اسکلت آفلاین (ST07 pilot) — مسدودکننده: O1، O2، O4، CONTENT-014، (O7 برای بودجهٔ حجم)

| # | کار | گیت/تست |
|---|---|---|
| P1-0 | گام بازنویسی ledger (G-08/P0-5) — هم‌زمان با شروع P1 | یک commit؛ verifierهای static سبز |
| P1-1 | `:core:contentpackage` — فرمت O2: manifest schema نسخه‌دار، امضای منفصل + کلید پین‌شده + چرخش، verify کامل، فعال‌سازی اتمیک فایل‌سیستم، rollback پایدار، corruption/missing-asset fail-closed، بودجهٔ حجم O7 | negative control: checksum خراب/امضای نادرست/schema ناشناخته → rollback؛ تست JVM |
| P1-2 | `:core:database` Room واقعی `[O4]`: اسکیمای سند هدف §3، migration پایدار، FK/index، transaction، downgrade/corrupt fail-closed روی دیسک | تست Robolectric/instrumented روی SQLite واقعی؛ ردیف‌ها پس از upgrade حفظ |
| P1-3 | `:core:learning` موتور محلی `[O1]` + قواعد نسخه‌دار (CONTENT-014/CALIBRATION_V1): ارزیاب per-template، hint/attempt policy، determinism | تست قطعی determinism؛ snapshot «پروجکشن بدون answer» برای هر adapter؛ T13/T01 evaluation مسیر اثبات per-template |
| P1-4 | cutover M1/M2/M3: جایگزینی gateway stub با ارزیاب محلی `[O3]`؛ path stateFor از پیشرفت Room؛ حذف wiring دستی ST07 از debug به پکیج واقعی | journey تست ST07 آفلاین از teach تا result با قطع میانه و resume |
| P1-5 | gate فاز: `android:gate` + تست‌های جدید + یک اجرای روی دستگاه/امولاتور موجود (بدون ساخت emulator جدید) + به‌روزرسانی START_HERE/WORKLOG با evidence | DoD: ST07 کاملاً آفلاین قابل‌اجرای روی build debug؛ release هنوز بدون محتوا (فقط پس از APPROVED) |

## Phase 2 — حذف سرور و هویت محلی — مسدودکننده: Phase 1 + O5

- P2-1 حذف زنجیرهٔ OTP/token/session/debug OTP + probe سرور launch (`ShomaraOtpApi`, `ShomaraRealOtpProvider`, `ShomaraDebugOtpProvider`, `PreferencesTokenStore`)؛ کوتاه‌شدن onboarding به مدل محلی (خانوادهٔ 03 حذف در UI طبق ADR-0039 §7).
- P2-2 profile محلی + چند/تک پروفایل `[O5]` + Parent PIN هش‌شده fail-closed + ParentGate با verifier محلی.
- P2-3 حذف `:sync` و transport آن‌لاین + `ShomaraRuntimeConfig` + `LessonGateway` HTTP `[O3-b]`؛ بازنشستهٔ `:core:network` (یا نگاه‌داشت صفر-استفاده با ADR).
- P2-4 حذف permission ناسازگار/کد مردهٔ شبکه از release؛ اندازهٔ APK قبل/بعد.
- **گیت:** کل onboarding→path→lesson آفلاین و بدون هیچ مسیر شبکه؛ تست process death برای profile/PIN؛ static gateها سبز.

## Phase 3 — authoring ۲۴ ایستگاه در ۵ بچ — مسدودکننده: Phase 1 + CONTENT-004، CONTENT-005، CONTENT-016، CONTENT-012

- P3-1 validator اجرایی کامل (لیست §G-20) + artifact typed برای pilot ST07 (بدون تغییر originals) + ماشین‌سازی زنجیرهٔ `SOURCE_ONLY→…→ENABLED`.
- P3-2..P3-5 بچ‌های A تا E (ST01–06، ST08–12، ST13–17، ST18–22، ST23–25): هر بچ = authoring→validator→بازبینی انسانی مستقل→APPROVED→bundling؛ P0/P1 بچ قبلی اول بسته شود.
- **گیت هر بچ:** validator صفر خطا + evidence بازبینی + پکیج بسته‌شده که gate فعال‌سازی را پاس می‌کند.

## Phase 4 — صوت و تصویر کامل — مسدودکننده: Phase 1..3 + O8، O9، CONTENT-006، CONTENT-007، CONTENT-009، CONTENT-010

- P4-1 تولید/دریافت ۲۳۲+ باینری صوت (نریتور `[O9/006]`، SFX `[007]`) با manifest (duration+checksum+voiceProfileId).
- P4-2 ۴۱+ asset تصویری ST07 + assetهای ۲۴ ایستگاه؛ بدون متن/عدد/ستاره داخل تصویر.
- P4-3 شفارش Vazirmatn TTF توسط مالک `[O8]` (دانلود تصادفی ممنوع — ADR-0037) + حذف `FontFamily.Default` موقت.
- **گیت:** playable آفلاین کامل روی دستگاه واقعی؛ بودجهٔ حجم O7 در CI.

## Phase 5 — Cutover و release (بازتعریف N09/N10) — مسدودکننده: Phase 1..4 + O6، O13، HG-05

- P5-0 تصمیم O6 اجرا شود (حذف یا ابزار authoring) — retirement plan مکتوب برای ۷۴ migration و `apps/web`؛ بستهٔ تاریخی به `docs/archive/`.
- P5-1 بازتعریف parity `[O13]` = parity با «رفتار مرجع Expo» فقط برای جریان‌های زندهٔ آفلاین؛ contract test جدید = تست پکیج bundle (نه بک‌اند).
- P5-2 بازنشستگی route-by-route Expo کودک + بازنویسی «web/API unaffected».
- P5-3 release engineering: signing `[HG-05]`، AAB، reproducible build، migration-on-upgrade تست، clean install/offline cold start/low-memory/device matrix، checklist فروش (Families policy).
- **گیت:** اجرای تجربهٔ اصلی در airplane mode بدون هیچ network config؛ Debug APK success = نه release approval.

## Phase 6 — کارایی و سخت‌سازی (پس از release gate اول)

- P6-1 baseline اندازه‌گیری (cold/warm، memory، verify/activation time، frame time، حجم، storage growth) قبل از هر بهینه‌سازی؛ Macrobenchmark/Baseline Profile فقط در صورت توجیه.
- P6-2 هر بهینه‌سازی با before/after measure؛ بدون premature optimization.

---

## ماتریس مسدودکننده‌ها

| فاز | تصمیم‌های مالک لازم | محتوای لازم |
|---|---|---|
| 0 | — | — |
| 1 | O1, O2, O3, O4, O7 | CONTENT-014 (+012 برای pilot توسعه) |
| 2 | O5, O3 | — |
| 3 | O11 (004/005/016) | CONTENT-004/005/012/016 |
| 4 | O8, O9 | CONTENT-006/007/009/010 |
| 5 | O6, O13, HG-05 | — |
| 6 | — | — |

## استراتژی تست سراسری

- هر فاز: unit + integration واقعی (SQLite/instrumented حیاتی) + negative control حداقل یکی + screenshot هم‌اندازه 360/390/412 + فونت ۲۰۰٪ برای هر UI لمسی جدید + ledger/WORKLOG با evidence.
- ممنوعیت همیشگی: تضعیف verifier/threshold برای سبزشدن؛ fake content/asset/test/progress؛ PASS بدون evidence.
