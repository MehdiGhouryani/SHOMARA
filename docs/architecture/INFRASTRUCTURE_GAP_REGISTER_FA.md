# ثبت شکاف‌های زیرساخت SHOMARA (Phase 0 — ممیزی فنی)

- **تاریخ:** 2026-11-12 · **مبنا:** commit `aa2805c` روی شاخهٔ `audit/infrastructure-phase0` (از `main`)
- **نوع مأموریت:** ممیزی زیرساخت غیر-بصری و نقشهٔ راه اجرا؛ بدون بازطراحی UI
- **مرجع تصمیم مالک:** `docs/adr/ADR-0039-fully-offline-content-and-duolingo-copy-ui.md` (محصول کاملاً آفلاین؛ پکیج محتوای bundle + ارزیاب محلی)
- **قاعده:** هیچ شکافی بدون شواهد `file:line` ثبت نشده؛ هیچ تصمیم مالکی جعل نشده؛ وضعیت‌ها فقط با evidence عوض می‌شوند.
- **همراهان این سند:** `INFRASTRUCTURE_TARGET_ARCHITECTURE_FA.md`، `INFRASTRUCTURE_EXECUTION_ROADMAP_FA.md`، `INFRASTRUCTURE_OWNER_DECISIONS_FA.md`، `INFRASTRUCTURE_BASELINE_REPORT_FA.md`

راهنمای شدت:
- **P0** = مسدودکنندهٔ فوری؛ بدون رفعش هیچ gate قابل‌اعتماد یا محصول قابل‌اجرا وجود ندارد.
- **P1** = ریسک معماری/امنیتی/حاکمیتی جدی؛ قبل از Phase 1 باید مسیرش مشخص شود.
- **P2** = شکاف واقعی با برنامهٔ اجرای مشخص در فازهای بعدی.
- **P3** = بهبود کیفی/پاکسازی.

---

## A. CI/CD و Release Engineering

### G-01 · P0 · gate کاتلین در GitHub Actions هرگز اجرا نمی‌شود (نصب SDK ناموجود)
- **شواهد:** `.github/workflows/android-native.yml:49-56` گام «Install compile SDK 37» فرمان `sdkmanager --channel=0 "platforms;android-37"` را اجرا می‌کند. اندیس رسمی SDK گوگل (`repository2-3.xml`) پکیجی به نام `platforms;android-37` ندارد؛ فقط `android-37.0`، `android-37.1`، `android-37.2` (و betaها) وجود دارند. sdkmanager برای پکیج ناموجود exit 1 می‌دهد (به‌صورت تجربی روی SDK محلی با یک پکیج ساختگی پروب شد). پس گام‌های بعدی (`verify:android-build-harness`، تست رفتاری، `android:gate`) هرگز نمی‌رسند — دقیقاً همان ادعای ثبت‌شده «failed while installing compile SDK 37. The Kotlin gate was not reached».
- **چرا محلی سبز است:** روی ماشین مالک `D:\SDK\platforms\android-37\android.jar` وجود دارد (پکیج `android-37.0` در پوشه‌ای به نام `android-37`؛ sdkmanager هشدار «inconsistent location» می‌دهد) — پس preflight محلی پاس می‌شود ولی CI نمی‌تواند همان پکیج را نصب کند.
- **ناسازگاری نرم‌افزاری ruled-out:** AGP 9.4.0 حداکثر API 37 را پشتیبانی می‌کند، Gradle حداقل 9.6.0 و JDK حداقل 17 — هر سه با پین‌های repo (`apps/android/gradle/libs.versions.toml:5-7`، wrapper 9.6.0، JDK 17 در workflow) منطبق‌اند. مشکل فقط نام پکیج است.
- **اثر کاربر/محصول:** هیچ اجرای CI از gate کاتلین (تست/lint/compile) عبور نکرده است؛ «سبز بودن» Android CI اثبات‌ناپذیر است؛ PRهای Android بدون gate واقعی merge می‌شوند (یا همیشه قرمزند).
- **راه‌حل (مکانیکی، بدون تصمیم مالک):** در workflow نصب `platforms;android-37.0` (یا جدیدترین 37.x پایدار)؛ همزمان قرارداد preflight در `scripts/verify-android-environment.mjs:60,70` از `platforms/android-37/android.jar` به پذیرش `android-37` یا `android-37.*` گسترش یابد (این تضعیف verifier نیست — تصحیح انتظارِ نادرست است؛ همچنان وجود android.jar معتبر لازم است)؛ ردیف SDK در ADR-0036/`ANDROID_BUILD_ENVIRONMENT.md` هم‌راستا شود. compileSdk=37 عوض نشود (با AGP 9.4 مجاز است).
- **وابستگی:** G-12 (upload artifact برای evidence). **معیار پذیرش:** یک اجرای GitHub Actions که تا `android:gate` برود و PASS ثبت کند؛ preflight محلی و CI هر دو READY.
- **تصمیم مالک لازم:** خیر. **وضعیت:** OPEN (دستور صریح §10 مأموریت: diagnose & fix).

### G-02 · P1 · شکست static gate در CI به «سبز» تبدیل می‌شود
- **شواهد:** `.github/workflows/ci.yml:27` روی کل job `visual-and-static` ‏`continue-on-error: true` است. این job علاوه بر مرورگری‌ها `npm run verify:static:all` (ci.yml:37-38) را اجرا می‌کند که **90 verifier** از جمله موارد امنیتی را می‌دود: `verify-answer-key-boundary`، `verify-demo-auth-isolation`، `verify-content-library` (byte-protection)، `verify-migrations-static` (گارد `answer_key` سمت سرور)، `verify-android-foundation` (اسکن `answerKey/correctAnswer/signingConfig`). گام «surface hidden failures» (ci.yml:39-48) همیشه `exit 0` می‌دهد و فقط `::warning` چاپ می‌کند.
- **اثر:** شکست هر verifier امنیتی/معماری در check-run سبز دیده می‌شود؛ مرز «required» فقط job `core` (build/typecheck/vitest) است.
- **راه‌حل:** تفکیک: یک job required «static-core» برای verifierهای غیرمرورگری، و فقط gateهای Chromium/parity در job اطلاعاتی بمانند تا وقتی runner سبز شود؛ سپس حذف `continue-on-error`.
- **معیار پذیرش:** شکست عمدی یک verifier غیرمرورگری → CI قرمز؛ شکست gate مرورگری → فقط informational. **تصمیم مالک لازم:** خیر (دستور §10). **وضعیت:** OPEN.

### G-03 · P2 · هیچ artifact از CI نگه‌داری نمی‌شود
- **شواهد:** در `android-native.yml` هیچ `actions/upload-artifact` وجود ندارد؛ گزارش‌های lint/test و `build-reports/android/gate.json` بعد از اجرا دور ریخته می‌شوند.
- **اثر:** evidence تکرارپذیر برای PASS/FAIL و اشکال‌زدایی lint از دست می‌رود؛ مغایر روح قاعدهٔ 3 AGENTS (PASS با evidence).
- **راه‌حل:** upload گزارش‌های lint/test و gate.json به‌عنوان artifact (retention کوتاه). **تصمیم مالک:** خیر. **وضعیت:** OPEN.

### G-04 · P2 · فایل تست یتیم در vitest (چهل‌وهفتمین فایل اجرا نمی‌شود)
- **شواهد:** `apps/mobile/src/game-feel/RevealPrimitives.test.tsx` تنها تست `.tsx` است ولی همهٔ include-globهای `vitest.config.mjs` پسوند `.test.ts` دارند؛ `npx vitest run <فایل>` → «no file matched». CI در واقع 73/74 فایل را می‌دود؛ `scripts/verify-phase3-game-feel.mjs:15` فقط وجود فایل را چک می‌کند.
- **راه‌حل:** افزودن glob `.test.tsx` یا تغییر نام، به‌علاوه assertion «تعداد فایل‌های vitest == تعداد فایل‌های روی دیسک» در یک verifier. **تصمیم مالک:** خیر. **وضعیت:** OPEN.

### G-05 · P2 · هیچ پایش وابستگی امنیتی وجود ندارد
- **شواهد:** بدون `.github/dependabot.yml`/`renovate`؛ npm audit در هر دو job با `--no-audit --no-fund` غیرفعال (ci.yml:17,34)؛ برای Gradle نه `gradle.lockfile` و نه `gradle/verification-metadata.xml` وجود دارد (نسخه‌ها پین‌اند ولی hash-verified نیستند).
- **راه‌حل:** Dependabot (npm+gradle)، یک job زمان‌بندی‌شدهٔ audit، فعال‌سازی Gradle dependency verification. **تصمیم مالک:** خیر. **وضعیت:** OPEN.

### G-06 · P2 · Android CI هیچ job instrumented/emulator ندارد
- **شواهد:** `android-native.yml` فقط JVM gate دارد؛ ۹ فایل `androidTest` (app 4، designsystem 3، lesson 1، parent 1) فقط روی ماشین مالک اجرا شده‌اند (WORKLOG صادقانه «androidTest خارج gate» ثبت کرده).
- **راه‌حل:** job با emulator (API پایه) برای connectedCheck یا حداقل زیرمجموعهٔ بحرانی؛ اولویت بعد از G-01. **تصمیم مالک:** خیر. **وضعیت:** OPEN.

### G-07 · P2 · اعتبارسنجی release build هیچ‌وقت اجرا نشده
- **شواهد:** gate = `test lint :app:compileDebugKotlin` فقط (`scripts/android-build.mjs:130`)؛ `assembleRelease/bundleRelease` تا N10/HG-05 توسط `scripts/verify-android-build-harness.mjs:28-29` صریحاً ممنوع است؛ R8/minify=true در release (`apps/android/app/build.gradle.kts:22`) ولی هیچ‌وقت compile نشده؛ signing config وجود ندارد (عمدی — HG-05).
- **راه‌حل:** در فاز release (پس از HG-05): job اعتبارسنجی release (بدون انتشار artifact امضاشده) + تست signature. **تصمیم مالک:** HG-05. **وضعیت:** OPEN.

---

## B. معماری، حاکمیت و تناقض اسناد

### G-08 · P1 · تناقض اسناد حاکمیتی با ADR-0039 (server-authoritative در برابر fully-offline)
- **شواهد:** ADR-0039 (Accepted 2026-11-05) محصول را کاملاً آفلاین تعریف و ADR-0003 را «in part» supersedes می‌کند؛ اما ADR-0039 خودش تصریح می‌کند بازنویسی‌های بعدی انجام نشده. امروز همچنان:
  - `AGENTS.md` §3 قواعد 5/6 («منطق پاسخ… فقط server-authoritative»)، §5 (لایهٔ data با remote)، §1؛
  - `START_HERE.md` §7 («Learning Truth، progression، mastery و Station Pass سروری»)؛
  - `docs/architecture/PACKAGE_BOUNDARIES_FA.md` («repository تنها مرز هماهنگی local/remote»)؛
  - `docs/adr/ADR-0003` بدون یادداشت وضعیت؛
  - `harness/roadmap.json` متن taskهای N06/N07/N08/N09/N10 (contract test بک‌اند، parity، CMS panel) و `ROADMAP_PHASES.md`.
- **اثر:** هر عامل/verifier که به متن فعلی وفادار بماند دوباره coupling سرور می‌سازد؛ دو «حقیقت معماری» موازی وجود دارد؛ خطر رگرسیون معماری بالا است.
- **راه‌حل:** یک گام ledger بازنویسی (یک commit قابل‌بازبینی): آپدیت AGENTS/START_HERE/PACKAGE_BOUNDARIES/ADR-0003 (status line) + بازثبت taskهای N09/N10 با O13 و O6. ADR-0039 مرجع می‌ماند؛ هیچ نسخهٔ موازیِ متضاد جدید نسازیم.
- **وابستگی:** O6/O13 (بخش‌های backend/parity متن جدید را قفل می‌کنند). **تصمیم مالک لازم:** برای بازنویسی متن‌ها خیر (ADR-0039 مبناست)، برای محتوای N09/N10 بله (O13). **وضعیت:** OPEN.

### G-09 · P1 · کد دورهٔ سرور در کلاینت کودک زنده ولی بی‌اثر است (O3/O6)
- **شواهد:** `ShomaraRuntimeConfig` هر دو URL همیشه null (`apps/android/app/src/main/kotlin/com/mathlearning/app/di/AppContainer.kt:70-76`؛ هیچ نقطهٔ set دیگری در repo نیست). `LessonGateway.submit` همیشه `Failed("lesson submit endpoint not configured")` (`core/network/.../LessonGateway.kt:51-53`). transport آن‌لاین outbox همیشه `Retriable("backend not configured (I2)")` (`AppContainer.kt:146-153`). `ManifestActivation` در `:sync` متصل به همان DB حافظه‌ای است.
- **نکتهٔ مکمل:** در هیچ manifest اندرویدی `uses-permission`/`INTERNET` وجود ندارد (rg روی همهٔ AndroidManifest.xmlهای `apps/android` → صفر) — یعنی حتی اگر URL ست می‌شد، شبکه عملاً fail بود؛ آفلاین‌بودن «به تصادف fail-closed» است نه به طراحی ثبت‌شده.
- **اثر:** کد مرده/گمراه‌کننده، مسیرهای مختلف پاسخ (submit همیشه شکست) که باید به ارزیاب محلی برسد (O3)، حجم و سطح حملهٔ اضافی (OkHttp در release بلااستفاده).
- **راه‌حل:** طبق O3: (a) نگه‌داشتن interface با پیاده‌سازی محلی، یا (b) حذف و جایگزینی صریح `LocalLessonEvaluator` (پیشنهاد مطالعهٔ آفلاین: b). مفهوم idempotency-key قطعی برای هویت attempt حفظ شود. در Phase 2 طبق ADR-0039 §7: حذف OTP/token/session/debug OTP، probe سرور در launch، transport آن‌لاین.
- **تصمیم مالک لازم:** بله — O3 (و O5 برای حذف OTP). **وضعیت:** OPEN.

---

## C. زیرساخت دادهٔ پایدار (Android)

### G-10 · P1 · «دیتابیس» محلی در حافظه است؛ هیچ چیز بعد از process death نمی‌ماند
- **شواهد:** `apps/android/core/database/src/main/kotlin/com/mathlearning/core/database/LocalLearningDatabase.kt:77-80` — چهار `MutableList` ساده (`stationPackages`, `progressProjections`, `outboxOperations`, `audioAssets`)؛ هیچ وابستگی Room/SQLite در ماژول نیست (`core/database/build.gradle.kts` فقط coroutines+JUnit). «migration engine» فقط روی آبجکت in-memory کار می‌کند. تنها ذخیرهٔ پایدار واقعی: یک فایل Preferences DataStore (`shomara_auth.preferences_pb`, `AppContainer.kt:95-98`) برای token/profile-draft/checkpoint/settings.
- **اثر:** پیشرفت کودک، رجیستری پکیج، outbox و اندیس صوت با مرگ پروسه از بین می‌رود؛ مستقیماً با تعهد ADR-0039 («Local progress is persisted on device») ناسازگار است؛ ادعای N07-01 «مهاجرت با حفظ ردیف‌ها» فقط روی fake معنا دارد — تست Room/SQLite واقعی صفر.
- **ریشه:** N07-01 سیاست migration را طراحی کرد ولی فروشگاه واقعی به فاز بعد موکول شد؛ با چرخش ADR-0039 این تبدیل به P1 شد چون local store حالا trust boundary کل محصول است.
- **راه‌حل:** O4 → Room برای progress/packages/attempts/sessions + DataStore فقط settings؛ تست integration روی SQLite واقعی (Robolectric/instrumented)؛ سیاست downgrade/corrupt همان fail-closed فعلی ولی روی دیسک.
- **تصمیم مالک لازم:** بله — O4 (پیشنهاد ثبت‌شده در ADR-0039 §8: Room برای progress/packages + DataStore برای settings). **وضعیت:** OPEN.

### G-11 · P2 · مدل دادهٔ هدف ناقص است
- **شواهد:** امروز فقط ۴ entity in-memory داریم (station package / progress projection / outbox / audio asset). برای هدف آفلاین این‌ها لازم‌اند ولی وجود ندارند: ChildProfile+preferences محلی (امروز profile-draft در DataStore، بدون مدل نهایی O5)، LessonSession/AttemptHistory، SkillMastery، رجیستری نسخه‌های ContentPackage با وضعیت lifecycle، LocalEvaluatorVersion، MigrationMetadata. فیلدهای ممنوعه (CONTENT-008) با `LocalSchema.FORBIDDEN_KEYS` قبل از persistence رد می‌شوند (`LocalLearningDatabase.kt:21-26,87-96`) — این مرز حفظ شود.
- **راه‌حل:** اسکیمای normalized در سند معماری هدف پیشنهاد شده؛ نام جدول‌ها مقیّد نیست. **تصمیم مالک:** O4/O5 غیرمستقیم. **وضعیت:** OPEN.

---

## D. موتور پکیج محتوای آفلاین

### G-12 · P0 · build release هیچ محتوای درسی ندارد — محصول کودک در release اجرا نمی‌شود
- **شواهد:** `apps/android/app/src/release/kotlin/com/mathlearning/app/di/LessonContentWiring.kt:15-20` — release: `discoverSteps=emptyList()`, `guidedItems=emptyList()`, `guidedEvaluator=null` (fail-closed عمدی). تمام دادهٔ ST07 به‌صورت دستی در variant دیباگ hardwired است (`src/debug/.../LessonContentWiring.kt:30-135`) و کلیدهای پاسخ DRAFT فقط همان‌جا هستند (:93-98). هیچ asset در `src/main/assets` هیچ ماژولی وجود ندارد (find → صفر فایل).
- **اثر:** «محصول کاملاً آفلاین» فقط روی کاغذ است؛ release یک shell است. رفعش کد-تنها نیست: نیازمند O1+O2 و authoring محتوا (CONTENT-012) و ساخت package engine.
- **تصمیم مالک لازم:** بله — O1، O2 (و زنجیرهٔ محتوا). **وضعیت:** OPEN — مرکزی‌ترین شکاف محصولی.

### G-13 · P1 · «پکیج انجین» واقعی وجود ندارد؛ فقط یک helper فعال‌سازی in-memory
- **شواهد:** `apps/android/sync/src/main/kotlin/com/mathlearning/sync/ManifestActivation.kt:44-89` — `ManifestActivationEngine` یک payload تک-ایستگاهی را با SHA-256 و gate نسخهٔ اسکیما در DB حافظه‌ای activate می‌کند. غایب‌ها: manifest کل-پکیج (فایل‌ها+checksum هر فایل)، امضای دیجیتال/کلید پین‌شده/چرخش کلید (O2)، فعال‌سازی اتمیک روی فایل‌سیستم واقعی، rollback پایدار (نسخهٔ قبلی بعد از restart هم بماند — الان با مرگ پروسه می‌پرد)، تشخیص corruption روی دیسک، سیاست asset گمشده، gate سازگاری نسخهٔ اپ، بودجهٔ حجم (O7)، lifecycle APPROVED/ENABLED در مسیر bundle.
- **اثر:** ADR-0039 §4 به هیچ وجه قابل‌فعال‌سازی نیست؛ «activation on first run» فعلاً معنایی ندارد.
- **راه‌حل:** طراحی و پیاده‌سازی در Phase 1 طبق O2؛ تست با package واقعی و negative control (checksum خراب، schema ناشناخته، payload آلوده).
- **تصمیم مالک لازم:** بله — O2 (فرمت امضاشده) + O7 (بودجهٔ حجم). **وضعیت:** OPEN.

### G-14 · P2 · هیچ verify امضا/صحت در کد اندروید وجود ندارد
- **شواهد:** `rg -il "signature|getPackageInfo|PackageManager" apps/android --glob "*.kt"` → صفر. در مدل آفلاین، صحت پکیج تنها مرز اعتماد است (مission §5: APK هرگز پکیج نا-authentic را activate نکند).
- **راه‌حل:** بخشی از G-13/O2 (Java Signature/Ed25519+کلید پین‌شده در app، تست negative). **تصمیم مالک:** O2. **وضعیت:** OPEN.

### G-15 · P2 · صوت واقعی صفر است؛ cache با fallback متنی کار می‌کند
- **شواهد:** صفر فایل صوتی/تصویری در کل repo برای runtime (`find` روی `.opus/.mp3/.wav/.m4a/.webp/.png` در apps و content-library → صفر). `ShomaraAudioCache` با fallback متنی تست شده؛ `DraftAudioImporter` ۲۳۲ ردیف DRAFT را به DB in-memory می‌ریزد. CONTENT-010/013/006 باز.
- **راه‌حل:** Phase 4 (بعد از O8/O9 و تصمیم صوت). **تصمیم مالک:** CONTENT-006/007/010. **وضعیت:** OPEN.

---

## E. موتور یادگیری محلی

### G-16 · P1 · ارزیاب محلی به‌عنوان «موتور» وجود ندارد؛ فقط یک ارزیاب DRAFT دیباگ تک-ایستگاهی
- **شواهد:** interface `ShomaraGuidedEvaluator` (`feature/lesson/.../ShomaraLessonGuided.kt:93-99`) و پیاده‌سازی بی‌نام با map کلیدها فقط در wiring دیباگ (`src/debug/.../LessonContentWiring.kt:92-108`)؛ فقط ۴ آیتم T15 ST07؛ رد T13 (trace) و T01 (tray) به‌عنوان gap ثبت شده (کامنت :26-28). هیچ موتور progression/mastery/unlock/recovery در کاتلین وجود ندارد؛ thresholds نسخه‌دار-محلی ندارند (CALIBRATION_V1 سمت ledger/content ثبت است، نه موتور). وابستگی‌ها: CONTENT-014 (معناشناسی mastery/unlock/jump) و O1.
- **اثر:** بدون موتور، «learning truth محلی» تعریف‌نشده است؛ هر پیاده‌سازی زودهنگام یعنی اختراع threshold — ممنوع (مission §6).
- **راه‌حل:** Phase 1 پس از O1 و CONTENT-014: موتور pure-Kotlin تست‌پذیر بیرون از Compose؛ determinism برای (packageVersion,item,input,config) با تست قطعی.
- **تصمیم مالک لازم:** بله — O1 + CONTENT-014/O12. **وضعیت:** OPEN.

### G-17 · P2 · unlock engine و stateFor مسیر هنوز روی «پیشرفت سرور» بنا شده‌اند
- **شواهد:** ADR-0039 §Context: `stateFor` بدون branch Fresh و `currentStationId=null` → هر ۲۵ ایستگاه Locked در اسکرین‌شات دستگاه؛ `ShomaraApp` هرگز `pathProgress` پاس نمی‌دهد. زیر مدل آفلاین، unlock باید از پیشرفت محلی (G-10/O4) خوانده شود.
- **راه‌حل:** در Phase 1 همراه دیتابیس پایدار. **تصمیم مالک:** خیر (جز CONTENT-014 برای قواعد). **وضعیت:** OPEN.

### G-18 · P2 · سیاست hint/attempt در کاتلین ناقص است
- **شواهد:** حلقهٔ guided فقط `Retry` برمی‌گرداند (بدون ladder واقعی)؛ منع hint در P4/P5 فقط در validatorهای TS دورهٔ سرور اعمال می‌شود؛ CONTENT-002/003/014 باز.
- **راه‌حل:** بخشی از موتور محلی با قواعد نسخه‌دار از محتوای approved. **وضعیت:** OPEN.

### G-19 · P2 · resume/restore نیمه‌پوشش است
- **شواهد:** checkpoint درس در DataStore واقعی (`PreferencesLessonCheckpointStore`, N06-02)؛ تست instrumented `ShomaraLessonHostResumeTest` روی ماشین مالک سبز؛ ولی ادامهٔ مسیر پس از process death به پیشرفت پایدار وابسته است (G-10). SavedStateHandle در ViewModels استفاده نمی‌شود (الگوی فعلی store-based است — کافی است اگر store پایدار شود).
- **راه‌حل:** همراه G-10. **وضعیت:** OPEN.

---

## F. خط تولید محتوا (authoring pipeline)

### G-20 · P1 · هیچ validator اجرایی برای دادهٔ authoring وجود ندارد؛ «۰ خطای pilot» ادعای متنی است
- **شواهد:** `scripts/verify-content-library.mjs` فقط: re-hash ۱۰ original در برابر `derived/source-sha256.json` (:16-23)، شمارش inventory و drift اندیس‌ها (:25-46)، شکل CSV صوت (:48+). فایل pilot کامل ST07 یک **Markdown** است (`content-library/originals/shomara-stage7-pilot-ST07.md`) نه artifact ماشین-خوان. validator تایپ‌شدهٔ N06-09 سمت TS (`packages/learning-runtime`) روی staging JSON کار می‌کند (review-role/DAG/hint-ban) ولی هیچ staging JSON از pilot تولید نشده. چک‌های غایب از لیست لازم: unique IDs، integrity ارجاع audio/asset، تشخیص چرخه در گراف پیش‌نیاز، پوشش skill، سازگاری template، قیود taught-number، محدودیت‌های assessment، سیاست hint، مرز answer، provenance فایل، حقوق/مدیریت، evidence بازبینی انسانی، سازگاری پکیج.
- **راه‌حل:** ساخت validator اجرایی + artifact typed برای pilot (بدون تغییر originals) در Phase 1/3؛ زنجیرهٔ `SOURCE_ONLY→…→ENABLED` ماشین-اجرا شود.
- **تصمیم مالک:** خیر برای ابزار؛ بله برای scope محتوا (O11/O12). **وضعیت:** OPEN.

### G-21 · P2 · وضعیت واقعی inventory
- **شواهد (تأییدشده با find/verify):** ۱۰ original byte-protected (PASS هش)، ۲۵ ایستگاه در اندیس، ۱۵ pattern، ۲۳۲ ردیف صوت DRAFT در دو CSV، صفر باینری صوت، صفر تصویر؛ فقط ST07 spec کامل دارد؛ ۱۸ issue ثبت‌شده که ۱۶ OPEN + ۲ GUARDED (CONTENT-008، CONTENT-018).
- **راه‌حل:** authoring پنج-بچ (ADR-0039 §7 Phase 3) پس از تصمیم‌های O11. **وضعیت:** OPEN — ثبت برای تصمیم‌گیری مالک.

### G-22 · P2 · byte-protection سالم است — حفظ شود
- **شواهد:** `verify:content-library` = PASS (10 protected originals) در اجرای امروز؛ خطر فقط در گام‌های آیندهٔ promotion است. **وضعیت:** محافظت‌شده؛ نیازی به تغییر ندارد.

---

## G. Backend / Supabase / CMS (منوط به O6)

### G-23 · P1 · پنل CMS صوت با persistent-repository=false؛ داده روی restart می‌پرد
- **شواهد:** `apps/web/lib/admin-audio.ts:88` — `const PERSISTENT_AUDIO_ADMIN_REPO_IMPLEMENTED = false;`؛ کلاس `InMemoryAudioAdminRepository` در :96 و singleton در :234؛ گارد production در :91. تمام upload/transition/rollback پنل N08-13 (۶ API route زیر `apps/web/app/api/v1/admin/audio/**`) روی حافظهٔ پروسه است.
- **اثر:** اگر O6 نگه‌داشتن CMS را انتخاب کند، این پنل فعلاً ابزار واقعی authoring نیست؛ اگر حذف شود، ۶ route + migration 0074 + UI بازنشسته می‌شوند.
- **راه‌حل:** منوط به O6: (حذف) بازنشسته با plan قابل‌بازبینی؛ (نگه‌داشتن) persistent repo + Supabase storage + checksum + audit trail + RLS test. **تصمیم مالک لازم:** بله — O6. **وضعیت:** OPEN.

### G-24 · P2 · inventory کامل سمت سرور (ورودی ماتریس O6)
- **شواهد:** ~۴۰+ Next.js API route (auth/otp، assignments، challenges، content packages/manifest/entitlements، learning sessions/attempts، missions، parent، progression/jump، sync/batch، teacher، admin-audio)؛ ۷۴ migration (آخرین `0074_audio_cms_tables.sql`)؛ RLS+RPC؛ چند repository InMemory در packages (learning-runtime، assignment-runtime، teacher-applications، admin-audio)؛ Expo (`apps/mobile`) همچنان به authApi/runtimeApi/MobileSyncManager متصل است.
- **اثر/راه‌حل:** ماتریس کامل در `INFRASTRUCTURE_BASELINE_REPORT_FA.md` §O6. حذف ۷۴ migration بدون retirement plan ممنوع (مission §8). **تصمیم مالک:** O6. **وضعیت:** OPEN.

---

## H. امنیت و حریم کودک

### G-25 · P2 · پایهٔ خوب موجود — حفظ و تکمیل شود
- **شواهد:** `android:allowBackup="false"` + `fullBackupContent="false"` (`apps/android/app/src/main/AndroidManifest.xml:5-6`) → بدون backup/restore؛ بدون permission INTERNET (شبکه ذاتاً fail)؛ لاگ فقط نام event + کلیدهای attribute است، مقادیر لاگ نمی‌شوند (`AndroidLogSink`, `AppContainer.kt:156-166`)؛ provider OTP شبیه‌سازی فقط در variant debug (`src/debug/ShomaraDebugOtpProvider`) و `simulatedAuthEnabled=false` در release؛ `AttemptSubmission.minimalPayload` فقط IDها (`LessonGateway.kt:26-34`)؛ گارد FORBIDDEN_KEYS قبل از persistence؛ بدون SDK آنالیتیکس در version catalog.
- **راه‌حل:** حفظ؛ اضافه‌شدن هر telemetry/SDK ممنوع مگر ADR مالک. **وضعیت:** OK (ثبت برای مرجع).

### G-26 · P1 · سطح مواجههٔ answer-key: تصمیم O1 پیش‌نیاز هر bundling است
- **شواهد:** پاسخ‌های authoring در `content-library/originals/**` (byte-protected، وارد APK نمی‌شوند — تأیید: هیچ asset/JSON محتوایی در APK نیست)؛ کلیدهای DRAFT در APK **debug** فقط (`src/debug/.../LessonContentWiring.kt:93-98`)؛ release بدون هیچ کلیدی. R8/minify=true در release است ولی امضای پکیج و pinned key وجود ندارد (G-14).
- **راه‌حل:** O1 یکی از سه گزینهٔ ADR-0039 §3 را انتخاب کند؛ هیچ گزینه‌ای قبل از آن پیاده نشود؛ snapshot test «پروجکشن کودک بدون answer» برای هر adapter الزامی (ادامهٔ N06-11).
- **تصمیم مالک لازم:** بله — O1. **وضعیت:** OPEN (مسدودکنندهٔ Phase 1/B).

### G-27 · P2 · هویت محلی و Parent PIN محلی وجود ندارد (O5/Phase 2)
- **شواهد:** OTP/token/session دورهٔ سرور هنوز مسیر launch است و با URL null عملاً fail-closed می‌ماند؛ ParentGate با re-auth fail-closed ولی بدون verifier محلی (در عمل قفل دائمی تا Phase 2)؛ تصمیم تک/چند-پروفایل باز (O5).
- **راه‌حل:** Phase 2 طبق ADR-0039 §7: profile محلی + PIN والد هش‌شده (هرگز plaintext). **تصمیم مالک:** O5. **وضعیت:** OPEN.

### G-28 · P3 · deep linkها exported هستند ولی fail-closed رفتار می‌کنند
- **شواهد:** `AndroidManifest.xml:30-39` پنج host روی scheme `mathlearning`؛ `DeepLinkManifestTest` با negative control از drift جلوگیری می‌کند؛ ناوبری برای ایستگاه ناشناخته/قفل باز نمی‌شود. **وضعیت:** قابل‌قبول؛ ثبت مرجع.

---

## I. کارایی و release engineering

### G-29 · P2 · هیچ baseline کارایی وجود ندارد
- **شواهد:** بدون ماژول macrobenchmark/baseline-profile؛ بدون اندازه‌گیری cold/warm start، memory، زمان verify/activation پکیج، frame time؛ بودجهٔ حجم APK/AAB تعریف نشده (O7). آخرین اندازهٔ ثبت‌شده: debug APK ≈ 12,030,634 bytes (checkpoint 2026-10-31).
- **راه‌حل:** در Phase 5/6 با Macrobenchmark (فقط اگر justified)؛ اول rule: هر تغییر با before/after. **تصمیم مالک:** O7 برای بودجه. **وضعیت:** OPEN.

### G-30 · P2 · version policy و checklist فروش store اجرایی نشده
- **شواهد:** `versionCode=1`/`versionName="0.1.0"` (`app/build.gradle.kts:14-15`)؛ versioning پکیج مستقل از اپ (ADR-0039 §1) هنوز مدل پیاده‌سازی ندارد؛ `docs/qa/ANDROID_STORE_RELEASE_CHECKLIST.md` به‌عنوان plan موجود است ولی هیچ اجرایی برایش ثبت نشده؛ Families-policy بررسی نشده.
- **راه‌حل:** Phase 5. **وضعیت:** OPEN.

### G-31 · P3 · کیفیت workflow
- **شواهد:** `android-native.yml` کش مضاعف (setup-java `cache: gradle` + `setup-gradle@v4`)؛ `ci.yml` بدون concurrency group و timeout؛ trigger محدود android-native به مسیرهای خاص (تغییر preflight script خودش trigger می‌شود — خوب). **وضعیت:** بهبود کم‌ارزش.

---

## خلاصهٔ اولویت

| رتبه | شناسه | خلاصه |
|---|---|---|
| P0 | G-01 | gate کاتلین در CI unreachable (پکیج SDK ناموجود) — فوری و بدون تصمیم مالک |
| P0 | G-12 | release بدون هیچ محتوایی — نیازمند O1/O2 + authoring |
| P1 | G-02 | continue-on-error مرز required را می‌شکند |
| P1 | G-08 | تناقض اسناد حاکمیتی با ADR-0039 |
| P1 | G-09 | کد دورهٔ سرور زنده ولی بی‌اثر (O3) |
| P1 | G-10 | persistence پایدار غایب — هیچ چیز روی process death نمی‌ماند (O4) |
| P1 | G-13 | پکیج‌انجین واقعی غایب (O2/O7) |
| P1 | G-16 | موتور یادگیری/ارزیاب محلی غایب (O1+CONTENT-014) |
| P1 | G-20 | validator authoring اجرایی غایب |
| P1 | G-23 | CMS صوت in-memory (O6) |
| P1 | G-26 | مرز answer-key برای bundling (O1) |
| P2 | G-03..G-07, G-11..G-15, G-17..G-19, G-21..G-24, G-25..G-27, G-29, G-30 | برنامهٔ فازهای 1–6 |
| P3 | G-28, G-31 | ثبت/بهبود کم‌ارزش |

**قاعدهٔ طلایی این ثبت:** هیچ شکاف P0/P1 بدون رفعش «بسته» نمی‌شود؛ هیچ تصمیم مالکی جایگزین نمی‌شود؛ هیچ PASS بدون فرمان+exit code+evidence ثبت نمی‌شود.
