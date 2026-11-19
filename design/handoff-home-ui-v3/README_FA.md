# بستهٔ جامع طراحی و پیاده‌سازی صفحهٔ اصلی شمارا — نسخهٔ ۳

**نوع تحویل:** Design + Asset + Native Implementation Handoff برای Harness  
**Target:** Android / Kotlin / Jetpack Compose  
**صفحه:** صفحهٔ اصلی کودک، تب «مسیر یادگیری» (Page Family 06)

این بسته به‌جای چند تصویر نمونه، یک handoff چندبخشی ارائه می‌کند: قرارداد طراحی و layout، کاتالوگ componentها، SVGهای source، VectorDrawableهای Android، زمینهٔ WebP، Kotlin reference، قرارداد immutable UI state، ابزار نصب/اعتبارسنجی character assets، و معیارهای QA.

## شروع سریع برای Harness

1. ZIP را Extract کن و folder `SHOMARA_HOME_UI_HANDOFF_v3` را کنار root مخزن SHOMARA نگه دار.
2. فایل `00_START_HERE/HARNESS_PROMPT_FA.md` را مستقیماً به Harness بده.
3. ابتدا `00_START_HERE/IMPLEMENTATION_ORDER_FA.md` را اجرا کند؛ بعد راهنمای جامع `01_DESIGN/IMPLEMENTATION_GUIDE_FA.md` و نقشهٔ کد `01_DESIGN/CODE_REFERENCE_MAP_FA.md` را بخواند.
4. وضعیت واقعی repository، branch، worktree، route، ViewModel، content package و feature موجود را audit کند. هیچ تغییر کاربر را پاک نکند.
5. برای نصب بردارها، از اسکریپت‌های PowerShell یا Bash در `02_ASSETS/` استفاده کند. در conflict، copy خودکار متوقف می‌شود تا merge دستی و آگاهانه انجام شود.
6. ابتدا character sourceهای رسمی را با script بررسی کند؛ Main/Number از قبل Native هستند و فقط Fandogh در صورت نیاز کپی می‌شود.
7. Kotlin referenceها را پس از تطبیق با APIهای موجود مصرف کند؛ component موازی برای Button/Navigation/Path ایجاد نکند.
8. بعد از پیاده‌سازی، Gradle build/test و screenshotهای واقعی 360/390/412dp و font scaleهای هدف را تولید کند.

## محتویات بسته

| پوشه | محتوا |
|---|---|
| `00_START_HERE/` | پرامپت آمادهٔ Harness و ترتیب پیاده‌سازی با quality gates |
| `01_DESIGN/` | راهنمای جامع، مشخصات صفحه، کاتالوگ ۲۶ کامپوننت، layout/state JSON، visual tokens، تصمیم‌ها، integration map |
| `02_ASSETS/svg/` | source vector قابل ویرایش برای nav، node states، lesson topics، state illustrations و UI controls |
| `02_ASSETS/android/drawable/` | VectorDrawable XML برای استفادهٔ Native Android |
| `02_ASSETS/backgrounds/` | یک WebP تزئینی دارای alpha، اختیاری |
| `03_ANDROID/kotlin/` | Screen-local tokens، Kotlin reference components، immutable UI State/Event contract و wiring notes |
| `03_ANDROID/tools/` | بررسی character sourceها، نصب Fandogh و اعتبارسنجی قراردادهای بسته |
| `04_PREVIEWS/` | پیش‌نمایش 360/412dp در حالت شروع تازه و ادامهٔ مسیر، به‌همراه Component Sheet |
| `05_QA/` | acceptance checklist، matrix دستگاه، سناریوهای تست و policy حجم/عملکرد asset |

## کامپوننت‌ها و وضعیت‌ها

- Header و action button
- Grade chip و Chapter Progress Card
- Continue Station Card با یک CTA اصلی
- Chapter Ribbon و Path Connector پیوسته
- Path Node و labelها برای Fresh / Current / Completed / Perfect / Locked
- Locked Reason Sheet و Path Return FAB
- Bottom Navigation با سه تب «مسیر / تمرین / من» و SVG/VectorDrawable فعال و غیرفعال
- Lesson Topic Icons برای شمارش، جمع، شکل‌ها و الگوها
- Empty / Error / Offline / Success / Loading surfaces
- Character Slot با Main / Number / Fandogh
- Progress Indicator و Scroll Restoration

## تصمیم بصری

از تصویر مرجع کاربر، زمینهٔ یاسی روشن، سطح سفید، کارت‌های نرم، radius بزرگ، آیکون‌های برجسته و لهجهٔ بنفش الهام گرفته شده است. مکانیک‌های سکه، تروفی، streak، lives، loot box، leaderboard و پاداش تصادفی عمداً وارد طراحی نشده‌اند. green برای پیشرفت/تکمیل معتبر، violet برای active state و amber برای تأکید کوچک است.

## استفادهٔ صحیح از assetها

- Android runtime باید از VectorDrawableهای `02_ASSETS/android/drawable/` استفاده کند؛ SVGها source قابل‌ویرایش هستند، نه فرمت runtime.
- `garden_path_footer.webp` اختیاری است؛ تنها وقتی در screenshot واقعی کیفیت را بهتر کرد وارد APK شود.
- Main و Number از قبل در repo Native هستند؛ duplicate image وارد ZIP نشده است.
- Fandogh از handoff رسمی داخل همان repository برداشته می‌شود. دو script در `03_ANDROID/tools/` منبع را check و در صورت نیاز به Native drawable کپی می‌کنند.
- فونت Vazirmatn از پروژه مصرف شود؛ هیچ فونت یا نسخهٔ کپی‌شده در این بسته وجود ندارد.

## محدوده و صداقت تحویل

این ZIP handoff اجرایی است، نه ادعای تغییر در GitHub یا APK آمادهٔ نصب. هیچ Gradle build، Compose instrumentation، emulator screenshot یا runtime performance test از این محیط اجرا نشده است. کدهای Kotlin به‌عنوان reference برای reconciliation با APIهای واقعی مخزن‌اند؛ Harness باید build/test/device evidence واقعی را ثبت کند.

## فایل‌های مهم

- `00_START_HERE/HARNESS_PROMPT_FA.md`
- `01_DESIGN/IMPLEMENTATION_GUIDE_FA.md`
- `01_DESIGN/HOME_PATH_DESIGN_SPEC_FA.md`
- `01_DESIGN/COMPONENT_CATALOG_FA.md`
- `01_DESIGN/CODE_REFERENCE_MAP_FA.md`
- `01_DESIGN/ASSET_INTEGRATION_FA.md`
- `02_ASSETS/ASSET_MANIFEST.json`
- `03_ANDROID/kotlin/ShomaraHomeUiState.kt`
- `05_QA/ACCEPTANCE_CHECKLIST_FA.md`
- `05_QA/TEST_CASES_FA.md`

## گزارش صحت‌سنجی

در ریشهٔ پوشه `PACKAGE_AUDIT.md`، `PACKAGE_CONTRACT_AUDIT.md`، `PACKAGE_VALIDATION_REPORT.md`، `PACKAGE_FILE_INDEX.csv` و `CHECKSUMS.sha256` قرار دارند. علاوه بر XML/SVG/JSON parsing و bitmap checks، ابزار `verify_handoff_contracts.py` ارجاع resourceها، تطبیق stateها، component inventory و هفت زوج رنگ متن را کنترل می‌کند. این بررسی جایگزین AAPT/Gradle/Device test نیست.
