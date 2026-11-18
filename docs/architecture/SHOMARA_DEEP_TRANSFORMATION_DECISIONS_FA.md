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
| محصول کاملاً آفلاین / no server | KEEP (OWNER-APPROVED, ADR-0039) | تصمیم 2026-11-05: محتوای bundle + evaluator محلی + پروفایل محلی؛ Phone/OTP در محصول نهایی وجود ندارد و در Phase 2 پس از O5 حذف می‌شود. |
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
- **تست‌های افزوده‌شده و اجراشده:** ثبت عادی؛ تکرار بدون تغییر timestamp؛ ۱۲ retry هم‌زمان؛ برخورد کلید متعلق به نشست دیگر؛ عدم تطابق session/attempt IDs؛ دوام پس از بستن/بازگشایی DB؛ CONTENT-018. فایل LessonRecordRepositoryTest.xml در CI، ۷/۷ PASS گزارش کرد.
- **گیت:** Android CI در 2026-11-17 روی PR merge commit، Gradle command را با exit code 0 تمام کرد؛ ۵۷۵ تست در ۸۱ XML suite، صفر failure/error/skip. Robolectric test جدید ۷/۷ PASS. lint و app compile نیز در همان gate موفق شدند.

### DTR-002 — وصل‌کردن Repository واقعی درس

**وضعیت:** REVISE → تغییر کد ثبت شده؛ compile UNVERIFIED.

- **مسئله:** `DefaultAppContainer` پیاده‌سازی Room را می‌ساخت، ولی `MainActivity` آن را به `ShomaraApp` نمی‌داد؛ در نتیجه پارامتر اختیاری Host برابر null می‌ماند و مسیر persistence زنده نبود.
- **شواهد:** `apps/android/app/src/main/kotlin/com/mathlearning/app/di/AppContainer.kt`، `MainActivity.kt` و `navigation/ShomaraApp.kt`.
- **تغییر:** `container.lessonRecords` از MainActivity تزریق می‌شود و پارامتر composition root دیگر nullable/اختیاری نیست.
- **گیت:** همان Android CI command با exit code 0؛ wiring در compile واقعی تأیید شد. **مرز:** وجود repository به معنی تأیید production lesson نیست؛ release هنوز فاقد approved local package/evaluator است و O1/O2 باز هستند.

### DTR-003 — صادق‌سازی Home و حذف CTA تکراری

**وضعیت:** REVISE → تغییر کد ثبت شده؛ UX/device UNVERIFIED.

- **مسئله:** `ShomaraChildShellHost` برچسب پایه/عنوان فصل را ثابت نشان می‌داد و شمارش `completedStations` با مقدار پیش‌فرض صفر نمایش داده می‌شد؛ در همان صفحه Continue Card و Current node یک Station Start Sheet یکسان را باز می‌کردند.
- **شواهد:** `apps/android/app/src/main/kotlin/com/mathlearning/app/shell/ShomaraChildShellHost.kt`؛ قرارداد Home هنوز یک UiState immutable می‌خواهد؛ projection قبلی server-verified متعلق به معماری پیش از ADR-0039 است و منبع Home آفلاین فعلی نیست.
- **تغییر:** کارت‌های summary و Continue از Host فعال حذف شدند؛ Header، مسیر زیگزاگی و Station Start Sheet حفظ شدند.
- **دلیل:** identity معتبر و projection قابل‌مصرف در root وجود ندارد؛ AuthSession فقط token/session state دارد و افزودن raw token به‌عنوان identity ممنوع/نامعتبر است. O5 نیز OPEN است.
- **اصلاح fail-closed:** ShomaraPathProgress به‌صورت unresolved پیش‌فرض می‌شود؛ فقط emptyResolved() پس از load هویت/پیشرفت اجازهٔ نمایش Fresh را می‌دهد. Home و Practice تا resolve شدن Loading هستند؛ deep link و Station Start Sheet هم تا همان زمان deferred می‌شوند. این guard جلوی state ساختگی را می‌گیرد، اما هویت محلی و Room progress هنوز پیاده نشده‌اند.

### DTR-004 — OTP در برابر محصول کاملاً آفلاین
**وضعیت:** KEEP / OWNER-APPROVED + REVISE (MIGRATION DEBT) — نه OPEN دربارهٔ سیاست محصول.

- **تصمیم حاکم:** ADR-0039 با وضعیت Accepted و تصمیم صریح مالک در 2026-11-05 محصول را «کاملاً آفلاین، بدون سرور» تعیین می‌کند؛ ADR-0003 را در بخش یادگیری supersede کرده و می‌گوید خانوادهٔ Phone/OTP در محصول آفلاین وجود ندارد. Phase 2 صراحتاً حذف OTP/token/session/server launch probe/debug OTP و جایگزینی با local child profile + local parent PIN را مقرر می‌کند.
- **شواهد کد فعلی:** ONBOARDING_JOURNEY_READINESS_N04.md متعلق به 2026-10-31 و قبل از ADR-0039 است؛ OTP endpoints در runtime null هستند و Android Manifest هم INTERNET permission ندارد. این رفتار فعلی، پیاده‌سازی آفلاین کامل نیست؛ مسیر ورود قدیمیِ fail-closed است که هنوز retire نشده.
- **تصمیم اجرایی:** هیچ INTERNET permission، OTP آنلاین، server sync یا fake auth اضافه نمی‌شود. مسیر محصول باید به profile محلی و PIN والد منتقل شود، اما cutover مخرب تا آماده‌شدن Phase 1 و تصمیم O5 اجرا نمی‌شود.
- **OPEN باقی‌مانده:** O5 فقط تک‌پروفایل در برابر چندپروفایل محلی را تعیین می‌کند؛ O3 انتخاب حفظ LessonGateway با implementation محلی در برابر حذف آن را تعیین می‌کند. O6 سرنوشت CMS/backend authoring را تعیین می‌کند. هیچ‌کدام سیاست آفلاین ADR-0039 را باز نمی‌کنند.
- **ریسک/اثر مهاجرت:** launch/onboarding routeها، session restoration، ParentGate، حذف داده، profile schema و deep links باید route-by-route مهاجرت و تست شوند. اسناد پیش از 2026-11-05 باید به‌عنوان baseline تاریخی برچسب بخورند، نه قرارداد جاری.



### DTR-005 — یکپارچه‌سازی Clay و معنای tokenهای visual

**وضعیت:** KEEP canonical token source + REVISE → SOURCE_IMPLEMENTED / LOGIC_TESTED؛ Native visual validation هنوز OPEN.

- **مسئله:** دو مسیر resolver برای Clay وجود داشت: `ShomaraClayDepth/ShomaraClay` در Theme و `ClayDepth/ClaySpecResolver` در `ClaySurface.kt`. مقدار Hint در Theme تنها elevation را از token می‌گرفت و border/shadow/highlight آن از Flat به ارث می‌رسید؛ resolver دوم propertyهای کامل Hint را می‌خواند. همچنین Border در Card برای تمام stateها Soft بود، حتی وقتی state عمق Hint یا Flat داشت.
- **شواهد:** `ShomaraTheme.kt`، `ClaySurface.kt`، `PathKit.kt`، `LessonKit.kt`، `Previews.kt`، Debug `DesignSystemGalleryActivity.kt`، `ShomaraCard.kt` و تست‌های `ClayContractTest` / `ShomaraThemeTest` / `ShomaraPrimitives04Test`.
- **KEEP:** `packages/design-system/src/tokens.json` با v2 به‌عنوان منبع canonical و codegen دوخروجی‌ای؛ generated Kotlin دستی تغییر نمی‌کند. legacy v1 تا اثبات عدم مصرف وب/سایر پلتفرم retire نمی‌شود.
- **REVISE / تغییر:** resolver موازی حذف شد؛ همهٔ source و debug consumerها به `ShomaraClayDepth` و `ShomaraClay.specFor` مهاجرت کردند. Flat/Hint/Soft/Featured تمام propertyهای خود را از generated v2 tokens می‌گیرند. Border Card از tier state resolve می‌شود. Ghost Button عمداً Flat می‌ماند ولی outline یک‌پیکسلی خود را از HintBorderWidth می‌گیرد، نه SoftBorderWidth.
- **Regression tests:** property-by-property token mapping برای چهار tier؛ border mapping همهٔ Card states؛ border mapping Primary Disabled/Pressed/Default و Ghost. Token drift CLI به static-core PR CI اضافه شد.
- **CI evidence:** Android Native run `44188354588` روی commit `8ebfa084` در 2026-11-17 موفق؛ gate JSON status PASS، SDK 37 + JDK 17 READY؛ `./gradlew test lint :app:compileDebugKotlin :app:compileDebugAndroidTestKotlin --stacktrace --no-daemon` exit 0 و BUILD SUCCESSFUL. Gate artifact counts را منتشر نکرد؛ هیچ عدد تستی از این artifact قابل اثبات نیست.
- **مرز rendering:** `ClaySurface` هنوز shadow opacity/radius/offset و highlight opacity را به rendering مستقل map نمی‌کند؛ Compose elevation renderer فعلی است. بدون screenshot compare روی 360/390/412dp و font scale 2.0، Canvas/gradient سفارشی اضافه نمی‌شود.
- **ریسک/گام بعد:** lint/compile/JVM pass معادل screenshot، Compose semantics، TalkBack، IME یا physical device نیست. همهٔ کامپوننت‌ها تا ثبت evidence واقعی `NATIVE_PENDING` هستند. فایل TTF مجاز Vazirmatn هم هنوز ورودی مالک است.


### DTR-006 — Home unresolved state و اصلاح parity صفحهٔ تمرین

**وضعیت:** REVISE → source implemented؛ Practice parity fix در CI تأیید شد.

- **Home:** `isResolved` پیش‌فرض false است؛ فقط snapshot محلی resolveشده یا `emptyResolved()` اجازهٔ Fresh می‌دهد. Home/Practice در حالت unresolved Loading هستند و deep link/Station Start Sheet تا resolve شدن متوقف می‌شود.
- **تست:** JVM distinction برای unresolved/emptyResolved، Compose test برای deferred deep link (unresolved → resolved) و Compose test برای Practice Loading افزوده شده‌اند. Android Native Gate در run `44191580216` روی head `7dd835a`، Gradle test/lint/app compile/androidTest-source compile را با exitCode صفر اجرا کرد.
- **Parity baseline:** artifact `14374088460` از run `44186937373` نشان داد Practice diff = 0.5040485829959515% (1494/296400؛ سقف 0.5%). Actual در ردیف Locked دو قفل داشت؛ golden یک قفل داخل badge داشت.
- **ریشهٔ دقیق:** specimen در tabs.tsx icon='lock' را می‌داد؛ PracticeView همان badge icon را رندر می‌کرد و trailingIcon='lock' را دوباره به ListRow می‌داد. trailingIcon تکراری حذف شد؛ badge lock باقی است. در run `44191579879` مقدار Practice به 0.4683% (1388/296400) رسید و PASS شد. Golden/threshold دست‌نخورده‌اند.
- **O5:** تصمیم همچنان OPEN است؛ بستهٔ تصمیم مالک در `OWNER_DECISION_BRIEF_O5_LOCAL_PROFILE_FA.md`. هیچ child_profiles table یا single/multi policy بدون رأی مالک اضافه نشده.

### DTR-007 — compact replay button و وضعیت visual parity

**وضعیت:** source layout correction implemented؛ pixel parity still FAIL.

- **مسئله:** golden دکمهٔ «دوباره بشنو» را در یک خط نشان می‌داد؛ نسخهٔ compact می‌توانست label را دوخطی کند.
- **تغییر:** در `apps/mobile/src/ui/v1/Button.tsx`، متن compact به یک خط محدود شد (`numberOfLines=1`، `ellipsizeMode=clip`، `flexShrink=0`). Golden و threshold تغییر نکردند.
- **Evidence:** artifact `14375744795`، report run `44191579879`: `button-replay-07` هنوز 0.7994% (88/11008 pixels؛ حد 0.5%) است، هرچند actual و golden هر دو یک‌خطی‌اند و اختلاف visible عمدتاً در glyph/icon pixels است. بنابراین این specimen هنوز FAIL است و به تغییر threshold دست نزده‌ایم.
- **گیت کل:** `core` PASS؛ `static-core` PASS؛ `visual-and-static` FAIL فقط در parity؛ `PARITY: FAIL (7/29)` و `STATIC_ALL: FAIL (93/94)`.
- **تاریخچه:** main run `40687075654` در 2026-10-28 و `43088599553` در 2026-11-11 هر دو total parity `8/29` داشته‌اند؛ current head `7/29` است. لاگ‌های تاریخی همهٔ هویت‌های شکست را نگه نداشته‌اند؛ نمی‌توان همهٔ هفت مورد فعلی را دقیقاً همان هفت مورد تاریخی نامید.
- **Android Gate:** run `44191580216` SUCCESS روی head `7dd835a`؛ environment JDK17/SDK37 READY؛ preflight exit 0؛ Gradle exit 0؛ 822 tasks (533 executed/289 cached)، BUILD SUCCESSFUL در 3m08s. instrumentation source compile شده اما connected/device tests اجرا نشده و APK تولید نشده است.

### DTR-008 — یک Home فعال، بدون Header تکراری و کارت‌های موازی

**وضعیت:** REVISE → RETIRE duplicate implementation / KEEP Path Graph + shell Header.

- **مسئله:** دو پیاده‌سازی برای Home/Path در Native وجود داشت. مسیر فعال در `ShomaraChildShellHost` از `ShomaraPathScreen` (LazyColumn/zigzag/chapter bands/node states) استفاده می‌کرد؛ `ShomaraHomePathScreen` یک صفحهٔ جدا با `verticalScroll` و node label card بود که به آن route نشده بود. Header/کاراکتر «مسیر یادگیری» نیز هم در shell و هم در Path Graph تکرار می‌شد.
- **Consumer evidence:** تمام ۳۸ فایل Kotlin در app shell/navigation، app tests/androidTests و feature/path بررسی شدند. `ShomaraHomePathScreen` فقط در فایل خودش، `ShomaraHomeUiState` فقط در همان screen و تعریف خودش، و `ShomaraChapterProgressCard`/`ShomaraContinueStationCard`/`ShomaraHomeNodeLabelCard` فقط از screen یتیم ارجاع می‌شدند. تنها consumer بیرونی `ShomaraHomeHeader`، `ShomaraChildShellHost` است.
- **KEEP:** `ShomaraPathGraph` مسیر اصلی و تنها graph یادگیری باقی می‌ماند؛ `ShomaraHomeHeader` Header رسمی shell می‌ماند. CTA اصلی هر ایستگاه همچنان از Station Start Sheet می‌گذرد.
- **RETIRE:** `ShomaraHomePathScreen.kt` و `ShomaraHomeUiState.kt` حذف شدند. سه composable موازی Progress/Continue/NodeLabel از `ShomaraHomeComponents.kt` حذف شد؛ خود فایل فقط Header فعال را نگه می‌دارد. `ShomaraHomeUiTokens` به چهار alias موردنیاز Header محدود شد. حذف‌ها در `harness/file-ledger.json` با class=DELETED ثبت شدند.
- **REVISE:** Path Graph API با `showPathHeading` توسعه یافت؛ مقدار پیش‌فرض true است تا استفادهٔ مستقل/Preview عنوان و کاراکتر خود را داشته باشد. shell مقدار false می‌دهد و Summary/Next-step باقی می‌ماند؛ پس در Home عنوان/کاراکتر دوبار رندر نمی‌شود. shell Header به inset افقی 24dp و padding عمودی 12dp align شد و title semantics از نوع heading گرفت.
- **Regression test:** Compose test تعداد heading «مسیر یادگیری» را در Home دقیقاً یک بررسی می‌کند و متن تعداد ایستگاه‌های باقی‌مانده را هم assert می‌کند.
- **مرز:** این تغییر ViewModel/UseCase/Room progress نمی‌سازد؛ O5 همچنان OPEN است. تا زمانی که identity/progress از منبع محلی معتبر نیامده، Home و Practice در Loading می‌مانند. گیت Android جدید روی cleanup و Header refactor باید PASS شود؛ device/TalkBack screenshot و parity همچنان جداگانه لازم‌اند.

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
