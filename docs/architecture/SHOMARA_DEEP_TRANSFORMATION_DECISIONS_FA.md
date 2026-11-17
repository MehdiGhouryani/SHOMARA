# SHOMARA — Deep Transformation Decision Register

- تاریخ مبنا: 2026-11-17
- شاخهٔ اجرا: `work/shomara-deep-transformation`
- مبنای ثابت: `infra/p14b-home-ui@6cd0e7ac7e69d6d5a6117f38ccbcb9b2bc69eb8c`
- وضعیت: **در حال اجرا؛ این سند جایگزین ADRهای مصوب یا تصمیم مالک نیست.**
- قاعده: وضعیت `OPEN` فقط با تصمیم صریح مالک تغییر می‌کند. توصیهٔ فنی، تصمیم مصوب محسوب نمی‌شود.

## 1. خلاصهٔ تصمیم‌ها

| حوزه | وضعیت | تصمیم فعلی |
|---|---|---|
| Kotlin + Jetpack Compose / single activity | KEEP | مسیر Native حفظ شود؛ تغییر framework/replatform در این مأموریت لازم نیست. |
| Room برای دادهٔ ساختاریافته + DataStore برای تنظیمات سبک | KEEP | با O4 مصوب و ADR-0042 همسو است. |
| منبع حقیقت یادگیری آفلاین: پکیج نسخه‌دار + evaluator محلی | KEEP / OPEN | مرز معماری حفظ؛ O1/O2 هنوز تصمیم مالک می‌خواهد و release package واقعی موجود نیست. |
| Home: grade/chapter ثابت و شمارش صفر | REVISE | از Host حذف شد؛ بدون identity/progress واقعی نباید نمایش داده شود. |
| Home: Continue Card در کنار Current node | REVISE | از Host حذف شد؛ هر دو یک Station Start Sheet را باز می‌کردند و CTA تکراری بودند. |
| گراف مسیر و Station Start Sheet | KEEP | گراف/قفل/برگهٔ شروع حفظ شده‌اند؛ مسیر اصلی Home است. |
| ثبت Lesson Attempt در Room | REVISE → IMPLEMENTED, UNVERIFIED | اکنون session + attempt در یک transaction و با idempotency اتمیک ثبت می‌شوند؛ تست جدید نوشته شده ولی هنوز اجرا نشده است. |
| تزریق LessonRecordRepository در composition root | REVISE → IMPLEMENTED, UNVERIFIED | از container واقعی به `MainActivity → ShomaraApp → LessonHost` تزریق شد؛ compile/device هنوز تأیید نشده. |
| OTP به‌عنوان ورود production و محصول کاملاً offline | OPEN / CONFLICT | Manifest فاقد INTERNET است و endpointهای OTP پیش‌فرض null هستند؛ هیچ مجوز شبکه یا مسیر ورود جعلی افزوده نشد. |
| O1 evaluator / O2 package schema / O3 LessonGateway | OPEN | تصمیم یا تأیید قبلی مالک لازم است؛ UI حق دور زدن آن را ندارد. |
| O5 local identity / single vs multi profile | OPEN | تا تعیین identity نمی‌توان ProgressRepository را به Home وصل کرد یا از token به‌عنوان identity استفاده کرد. |
| O6 CMS/backend | OPEN | retirement/retain بدون رأی مالک ممنوع است. |
| O7 package/media budget | OPEN | سقف نهایی بدون اندازه‌گیری assetهای واقعی جعل نمی‌شود. |
| محتوای ۲۴ ایستگاه + media انسانی/دارای حق | BLOCKED_EXTERNAL | تألیف، صوت/تصویر واقعی، حقوق و بازبینی انسانی خارج از توان تغییر کد خودکار است. |
| حذف V1/Expo و verifierهای legacy | DEFERRED | فقط بعد از parity route-by-route و اثبات consumer-free. |
| HomePathScreen / HomeUiState موازی | OPEN | استفادهٔ زندهٔ آن‌ها باید با reference scan کامل اثبات شود؛ حذف عجولانه ممنوع. |
| وضعیت Home در اسناد P12/P14b/P14c | SUPERSEDED / RECONCILE | ادعای «Home BLOCKED» در P12 از نظر دسترسی به handoff منسوخ است؛ اتصال بصری P14c هم‌معنای تکمیل داده/UX نیست. |

## 2. تصمیم‌های اجرایی با شواهد

### DTR-001 — اتمیک‌بودن attempt و session

**وضعیت:** REVISE → تغییر کد ثبت شده؛ اجرای تست‌ها UNVERIFIED.

- **مسئله:** `LessonRecordRepository.recordAttempt` در قرارداد خود یک تراکنش را الزام می‌کرد، اما پیاده‌سازی قبلی ابتدا session/duplicate check و سپس attempt insert را در دو تراکنش انجام می‌داد.
- **شواهد:** `apps/android/core/database/src/main/kotlin/com/mathlearning/core/database/repo/RoomLessonRecordRepository.kt`؛ قرارداد در `apps/android/core/model/src/main/kotlin/com/mathlearning/core/model/repository/LearningRepositories.kt`.
- **تغییر:** کل عملیات در یک `db.withTransaction`؛ بررسی تطابق session ID؛ `INSERT OR IGNORE` برای رقابت کلید یکتا؛ retry همان کلید و همان session بدون تغییر session؛ برخورد کلید متعلق به نشست دیگر fail-closed.
- **تست‌های افزوده‌شده:** ثبت عادی؛ تکرار بدون تغییر timestamp؛ ۱۲ retry هم‌زمان؛ collision بین دو session؛ عدم تطابق session/attempt؛ باقی‌ماندن داده پس از بستن/بازگشایی DB؛ CONTENT-018.
- **ریسک باقیمانده:** Room/Kotlin compile و اجرای Robolectric هنوز در این محیط اثبات نشده؛ اجرای CI لازم است.

### DTR-002 — وصل‌کردن Repository واقعی درس

**وضعیت:** REVISE → تغییر کد ثبت شده؛ compile UNVERIFIED.

- **مسئله:** `DefaultAppContainer` پیاده‌سازی Room را می‌ساخت، ولی `MainActivity` آن را به `ShomaraApp` نمی‌داد؛ در نتیجه پارامتر اختیاری Host برابر null می‌ماند و مسیر persistence زنده نبود.
- **شواهد:** `apps/android/app/src/main/kotlin/com/mathlearning/app/di/AppContainer.kt`، `MainActivity.kt` و `navigation/ShomaraApp.kt`.
- **تغییر:** `container.lessonRecords` از MainActivity تزریق می‌شود و پارامتر composition root دیگر nullable/اختیاری نیست.
- **مرز:** وجود repository به معنی تأیید production lesson نیست؛ release همچنان فاقد draft guided items و evaluator است و O1/O2 باز هستند.

### DTR-003 — صادق‌سازی Home و حذف CTA تکراری

**وضعیت:** REVISE → تغییر کد ثبت شده؛ UX/device UNVERIFIED.

- **مسئله:** `ShomaraChildShellHost` برچسب پایه/عنوان فصل را ثابت نشان می‌داد و شمارش `completedStations` با مقدار پیش‌فرض صفر نمایش داده می‌شد؛ در همان صفحه Continue Card و Current node یک Station Start Sheet یکسان را باز می‌کردند.
- **شواهد:** `apps/android/app/src/main/kotlin/com/mathlearning/app/shell/ShomaraChildShellHost.kt`؛ قرارداد `ShomaraHomeUiState.kt` هنوز یک UiState immutable می‌خواهد؛ ProgressRepository فقط دادهٔ server-verified را بر اساس learningIdentityId می‌خواند.
- **تغییر:** کارت‌های summary و Continue از Host فعال حذف شدند؛ Header، مسیر زیگزاگی و Station Start Sheet حفظ شدند.
- **دلیل:** identity معتبر و projection قابل‌مصرف در root وجود ندارد؛ AuthSession فقط token/session state دارد و افزودن raw token به‌عنوان identity ممنوع/نامعتبر است. O5 نیز OPEN است.
- **ریسک/گام بعدی:** طراحی یک منبع هویت محلی یا تأیید هویت محصولی، سپس UseCase/ViewModel/UiState برای Home و wiring واقعی progress. تا آن زمان هیچ شمارش یا فصل ساختگی نمایش داده نشود.

### DTR-004 — تناقض Offline و OTP

**وضعیت:** OPEN — نیازمند تصمیم مالک.

- **مسئله:** ADR-0039 و طراحی فعلی می‌گویند مسیر کودک کاملاً آفلاین است؛ مسیر OTP production در اسناد/کد ورود وجود دارد، اما Manifest فعلی هیچ permission از جمله INTERNET ندارد و endpointهای runtime پیش‌فرض null هستند.
- **گزینه‌ها:** (A) ساخت هویت محلی کودک و OTP صرفاً برای قابلیت اختیاری والد/همگام‌سازی خارج از مسیر یادگیری؛ (B) ورود OTP آنلاین، با بازنگری صریح Offline-only، مجوز شبکه، privacy/data declarations و طراحی حالت عدم اتصال؛ (C) سیاست دیگری که مالک ثبت کند.
- **توصیهٔ مهندسی غیرمصوب:** گزینهٔ A با local-first child journey، مشروط به تصمیم مالک و بازنگری ADR/Privacy.
- **ریسک:** تغییر authentication/profile schema می‌تواند به migration، دادهٔ قبلی، حذف حساب، PIN والد و privacy flow اثر بگذارد؛ هیچ‌یک با اصلاح UI تنها حل نمی‌شود.

## 3. معماری و کیفیت — وضعیت baseline

### KEEP
- Kotlin/Compose و مرزبندی feature/core.
- Room/DataStore split طبق O4 و ADR-0042.
- Fail-closed package trust و evaluator؛ no destructive migration.
- Canonical token source و codegen؛ RTL/math direction باید جداگانه حفظ شود.
- Safety rules: بدون lives/streak تنبیهی، currency/leaderboard یا پاسخ تحقیرآمیز.
- V1/Expo تا زمان parity واقعی حذف نمی‌شود.

### OPEN / BLOCKED
- O1/O2/O3/O5/O6/O7 در Owner Decision Register بازند؛ این مأموریت آن‌ها را به‌جای مالک نمی‌بندد.
- ST07 همچنان draft/pilot است؛ ۲۴ station تألیف نشده‌اند.
- گزارش pipeline ثبت می‌کند: ۵۳ صوت ST07 و ۳۶ token تصویری کم است، asset registry صفر است و human review/rights evidence موجود نیست.
- Production Readiness طبق گزارش P15 همچنان BLOCKED؛ compile تاریخی release معادل signed AAB یا store-ready نیست.
- TalkBack فیزیکی، ۲۰۰٪ font sweep، بنچمارک device واقعی و signed release در این نشست اجرا نشده‌اند.

## 4. تغییرات ثبت‌شده در شاخهٔ اجرا

| Commit | تغییر |
|---|---|
| `ab5bcba92b649bccdb319536b49c2cec2140302d` | DAO attempt insert با conflict strategy = IGNORE |
| `6f3a8a95760f6f8b9fa87ac78500b59e9c7ab465` | session + attempt در یک تراکنش |
| `261c6bd970b0f3bd647911969a38abc7feeae7aa` | تست retry هم‌زمان، collision و عدم mutation |
| `d5c9af2c5b28e1673862db29e90de45fd7884591` | تزریق Room lesson repository از MainActivity |
| `ea4a8edb91fa501aade0f8ab1fa50177cc4a2c9a` | الزام repository در ShomaraApp |
| `c0a65fb9ff0c25d5e3630f8b290ee301dd53076b` | توضیح دقیق مرز release/debug lesson recorder |
| `dd911935530036022c3b967e06de72cec107e6df` | حذف Home summary غیرمعتبر و Continue تکراری |

## 5. گیت‌ها و محدودیت اجرای این checkpoint

- **PASS ادعاشده در این سند:** فقط عملیات GitHub API برای ایجاد branch و commitها موفق بوده‌اند؛ SHAها از پاسخ GitHub ثبت شده‌اند.
- **UNVERIFIED:** Gradle compile، lint، Robolectric، Android instrumentation، screenshot/visual regression، TalkBack و physical device.
- محیط حاضر به working tree/Android SDK پروژه دسترسی اجرایی ندارد؛ در این checkpoint هیچ exit code برای npm/Gradle ثبت نشده است.
- مرحلهٔ بعد باید CI را روی همین branch اجرا کند؛ هر failure باید بر اساس log اصلاح شود، نه با حذف assertion یا تضعیف gate.
