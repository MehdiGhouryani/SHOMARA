# پرامپت اجرایی Harness — SHOMARA Home / Learning Path (نسخهٔ ۳)

تو در checkout واقعی مخزن `MehdiGhouryani/SHOMARA` کار می‌کنی. هدف، تکمیل production-quality صفحهٔ اصلی کودک در تب «مسیر» با استفاده از handoff موجود است؛ نه ساخت یک prototype جدا، نه بازنویسی کل app و نه تولید صرفاً تصویر.

## ورودی‌های لازم — پیش از تغییر کد

1. `README_FA.md` و `00_START_HERE/IMPLEMENTATION_ORDER_FA.md` را بخوان.
2. `01_DESIGN/IMPLEMENTATION_GUIDE_FA.md`, `HOME_PATH_DESIGN_SPEC_FA.md`, `COMPONENT_CATALOG_FA.md`, `CODE_REFERENCE_MAP_FA.md` و JSONهای design/state/layout را کامل بررسی کن.
3. دستورهای ریشهٔ repo، `AGENTS.md` و ADRهای مرتبط را بخوان: `ADR-0039-fully-offline-content-and-duolingo-copy-ui.md`, `ADR-0035-ui-v1-from-2026-10-pages.md` (یا نسخهٔ فعلی در checkout).
4. وضعیت git/branch/worktree و آخرین commit را ذخیره کن. هیچ فایل کاربر را پاک یا overwrite نکن.
5. کد فعلی `ShomaraPathGraph.kt`, `ShomaraNavigation.kt`, `ShomaraButton.kt`, `ShomaraCharacter.kt`, `ShomaraTokens.kt`, ViewModel/UseCase/repository/catalog/evaluator و تست‌ها را بخوان.

## کارهایی که باید انجام دهی

### مرحله A — Audit و mapping
- یک جدول «موجود / نیازمند اصلاح / جدید» برای componentهای catalog بساز.
- route مالک صفحه و event owner را مشخص کن.
- بررسی کن Home UI فعلی با Navigation graph و saved state چطور وصل است.
- هیچ source of truth جدید برای progress، completion، mastery، unlock یا current station نساز.

### مرحله B — Resource integration
- SVG source را برای editing حفظ کن.
- Android VectorDrawable XMLها را با scriptهای `02_ASSETS/COPY_ANDROID_DRAWABLES.*` اضافه کن؛ conflictها را دستی resolve کن.
- image/character sources را از checkout رسمی استفاده کن؛ Main/Number را duplicate نکن، Fandogh را در صورت نیاز با script نصب کن.
- asset manifest/checksums را بعد از integration update کن.

### مرحله C — Component reconciliation
- `ShomaraTopBar`, `ShomaraTabBar`, `ShomaraButton`, `ShomaraPathGraph`, `ShomaraStateSurface`, `ShomaraFeedbackBanner`, `ShomaraCharacterImage` و `ShomaraDigits` را reuse کنید.
- bottom nav باید سه تب مسیر/تمرین/من داشته باشد؛ اگر icon slot لازم است، design-system API موجود را توسعه بده و duplicate bar را حذف کن.
- اگر Compose referenceهای handoff با API موجود فرق دارند، reference را تطبیق بده، نه اینکه project code را به sample تبدیل کنی.

### مرحله D — Screen assembly
- header، chapter progress، continue card، مسیر پیوسته، node states و bottom nav را با visual direction پیشنهادی بساز.
- یک CTA اصلی برای state جاری داشته باش.
- مسیر را با `ShomaraPathGraph` نگه دار؛ geometry مستقل/موازی نساز.
- spacing و content padding را برای bar و insets واقعی تنظیم کن.
- Main/Number/Fandogh را فقط در slotهای تعریف‌شده و با pose رسمی به‌کار ببر.

### مرحله E — State, interaction, a11y
- fresh/current/completed/perfect/locked/offline/loading/empty/error/scroll restoration را تست کن.
- locked node با guide واقعی clickable بماند و disabled semantics نگیرد.
- تمام progress و stateها از immutable ViewModel projection بیایند.
- rapid tap/duplicate action guard، tab reselect، Back و process recreation را پوشش بده.
- RTL، number/math direction، 48dp touch target، fontScale 200% و TalkBack را بررسی کن.

### مرحله F — Performance و QA
- LazyColumn با stable stationId keys؛ no blocking I/O یا mapping سنگین داخل composition.
- connector Canvas deterministic و بدون rebuild غیرضروری.
- no SVG runtime parser؛ no oversized bitmaps؛ no infinite animation.
- Reduced Motion، safe insets، 360/390/412dp و tablet width را آزمایش کن.
- پروژه را با Gradle taskهای واقعی build/test/lint کن و log ذخیره کن.

## ممنوعیت‌ها

- هیچ سکه، XP، streak تنبیهی، heart/lives، loot box، random prize، leaderboard یا badge به عنوان ارز اضافه نکن.
- answer key، threshold و evaluator internals را در UI/log/preview قرار نده.
- هیچ route، CTA یا retry جعلی.
- global token source، schema، data package، route architecture یا content را خارج scope تغییر نده.
- از asset نامعتبر یا mascot جدید/pose تولیدشده استفاده نکن.
- screenshot شبیه‌سازی‌شده را به‌جای screenshot واقعی دستگاه گزارش نکن.

## خروجی اجباری

1. کد و assets ادغام‌شده با report فایل‌های تغییر یافته.
2. تست‌های جدید و نتیجهٔ واقعی Gradle build/test/lint.
3. screenshotهای واقعی 360، 390، 412dp و component states.
4. نتیجهٔ TalkBack، RTL، fontScale 1.0/1.3/2.0 و reduced motion.
5. فهرست blockerها، debtهای باقی‌مانده و هر تصمیمی که نیازمند owner approval است.
6. asset manifest و checksums به‌روز.

**Definition of Done:** مسیر و progress واقعی‌اند؛ current و node stateها درست‌اند؛ سه tab بدون route duplication کار می‌کنند؛ UI در اندازه‌ها و font scaleهای هدف overlap ندارد؛ locked explanation قابل‌دسترسی است؛ P0/P1 و interaction dead نداریم؛ build/test و screenshot واقعی با evidence ثبت شده‌اند.
