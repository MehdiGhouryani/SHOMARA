# START_HERE.md — وضعیت canonical پروژهٔ SHOMARA
| 2026-10-31 | SNAP-20261031-N04-PHASE-CLOSED | فاز N04 بسته شد: سه ماژول واقعی network/datastore/onboarding، OTP با مسیرهای منفی MockWebServer، DataStore امن، restore/expiry fail-closed، سیم‌کشی واقعی launch؛ ۷۲ تست جدید؛ connectedCheck بدون device ثبت صادقانه. |

```yaml
file_version: 42
last_updated: 2026-10-31
snapshot_id: SNAP-20261031-N04-U0-01
baseline_commit: ef35ce24fb8023ce0d247d1281cf0166bffb2140
working_branch: native/n02-foundation
active_product: SHOMARA
closed_product: AVA
target_client: Android Native (Kotlin + Jetpack Compose)
current_phase: N05
current_task: N05-01
phase_status: N05_IN_PROGRESS_1_OF_9
apk_status: ANDROID_GATE_PASS__DEBUG_APK_BUILT_SHA256_06007F6A
```

## 0. تصمیم مالک و مرز کار

- از این snapshot به بعد فقط SHOMARA توسعه می‌یابد.
- AVA بسته است؛ فقط الگوهای مفید معماری/فرایندی آن قابل الهام‌اند و هیچ تغییری در آن انجام نمی‌شود.
- هدف، تبدیل مرحله‌ای کلاینت کودک به Android Native با UI/UX یکپارچه، کد مرتب و gateهای قابل اثبات است.
- Expo فعلی تا cutover حذف نمی‌شود؛ در فازهای Clean کوچک و قابل اجرا نگه‌داری می‌شود و بعد route-by-route جایگزین خواهد شد.

## 1. ترتیب مطالعه

1. `AGENTS.md`
2. همین فایل
3. `node tools/harness.mjs validate`
4. `node tools/harness.mjs next`
5. `docs/roadmap/SHOMARA_NATIVE_ROADMAP_FA.md`
6. فقط قراردادها و کد task اعلام‌شده

برای build/SDK/Gradle/APK از `shomara-android-build`، برای تصمیم UI از `shomara-product-design`، برای token/theme/component از `shomara-design-system`، برای اجرای route از `shomara-screen-execution` و برای curriculum/audio/CMS از `shomara-learning-content` استفاده شود. نام Skillها به مسیرهای `skills/<name>/SKILL.md` نگاشت می‌شود.

انتقال این گفت‌وگو در `docs/delivery/SHOMARA_FINAL_CHAT_HANDOFF.md` مستقل شده است. قرارداد ۱۷ خانواده صفحه در `design/playbook/PAGE_UIUX_BLUEPRINT.md` و وضعیت/وابستگی ۲۰ work item در `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` است.

فایل `ROADMAP_PHASES.md` و goldenهای V1 تاریخی‌اند و هنوز توسط verifierهای legacy خوانده می‌شوند؛ تا مهاجرت verifierها حذف نشوند.

## 2. وضعیت واقعی baseline

بازبینی نهایی: source checkpoint `76e4cf7` از ZIP با SHA-256 تأییدشده بازیابی شد؛ تاریخچهٔ Git بسته نبود و یک baseline محلی جدید برای ثبت اصلاحات ساخته شد. شش تست رفتاری build، verifierهای Android/build/repository/skills/content/design و diff check دوباره PASS شدند. سه فرمان doctor/gate/assemble-debug همچنان `BLOCKED_ENV` هستند. اعداد build/typecheck/Vitest/static جدول زیر شواهد checkpoint پیشین‌اند و در محیط بازیابی‌شده دوباره اجرا نشده‌اند.

مبنای بررسی clone تمیز GitHub در commit `ef35ce2` است.

| بررسی | نتیجهٔ واقعی | وضعیت |
|---|---:|---|
| `npm ci --no-audit --no-fund` | 648 package، exit 0 | PASS |
| `npm run build:packages` | exit 0 | PASS |
| `npm run typecheck:all` | هر 9 workspace، exit 0 | PASS |
| `npx vitest run` | 65 file / 502 test | PASS |
| `npm run verify:static:all` | 75/80؛ تمام 75 gate غیرمرورگری سبز | BLOCKED_ENV |
| N02 static suite | 82/87؛ تمام 82 gate غیرمرورگری از جمله Native/build/content/skill/design governance سبز | BLOCKED_ENV |
| Chromium flows + parity | مرورگر در runner موجود نیست | BLOCKED_ENV |
| Node 22.22 build/typecheck | exit 0 | PASS |
| Node 22.22 Vitest | 65 file / 502 test | PASS |
| Android Native static foundation | ۴ ماژول، wrapper/checksum، CI، navigation، logging/error | PASS |
| Android Native compile/lint/unit | Android SDK 37 موجود نیست؛ Java/Gradle به proxy runner دسترسی ندارد | BLOCKED_ENV |
| Android build harness | doctor/gate/assemble-debug + CI واحد + JSON/SHA-256 report | PASS |

پنج failure باقیمانده فقط verifierهای مرورگری‌اند. تلاش نصب Playwright Chromium به‌علت پاسخ دانلود 0-byte/ZIP ناقص شکست خورد. اشکال release verifier که `apps/mobile/parity/dist-flow` را source تلقی می‌کرد اصلاح شد و اکنون مستقل PASS است.

> **Annotation 2026-10-31 (ZCode run):** اعداد تاریخی ۵۱۸ فایل/۱۷۸۰ یال در این سند و `harness/roadmap.json` (N01-05) مال checkpoint 2026-10-28 هستند و بازنویسی نشدند. شمار فعلی `harness/dependency-map.json` در بازتولید بازبینی‌شدهٔ همین تاریخ به‌روز شد (شواهد خارج از repo: `/tmp/shomara-evidence-2026-10-31`). در همان اجرا: `android:gate` با نصب موجود platform 37 روی ماشین محلی PASS شد (رفع خطای lint واقعی themes.xml با qualifier values-v27) و `verify:static:all` با parity کامل 87/87 PASS شد؛ سپس N02-07 و فاز N02 طبق شواهد همان اجرا DONE شدند.

## 3. موجودی تأییدشده

| بخش | فایل | حجم تقریبی | تصمیم |
|---|---:|---:|---|
| کل repository بدون `.git/node_modules` | 1399 | 30.5 MB | مبنا |
| `parity-out-expo/` | 125 | 8.35 MB | generated؛ حذف از Git در N00 |
| `docs/` | 367 | 11.8 MB | دسته‌بندی و dedupe در N01 |
| `docs/design-handoff-2026-10/` | 192 | 10.7 MB | legacy reference؛ تا مهاجرت verifier حفظ |
| `project-design-v2/` | 91 | 3.32 MB | asset pipeline فعال؛ حذف نشود |
| `apps/mobile/src/ui/v1` | 31 | 63 KB | مصرف‌کنندهٔ زنده؛ بازنشستگی در N01/N09 |
| `apps/mobile/src/ui/v2` | 10 | 45 KB | مرجع رفتاری موقت؛ منبع نهایی Native نیست |

## 4. چک‌لیست فاز تکمیل‌شده N00

- [x] clone مخزن اصلی و ثبت commit/branch
- [x] نصب تمیز و baseline build/typecheck/test
- [x] inventory حجم، routeها، V1/V2 و اسناد
- [x] حذف `parity-out-expo/` از Git: 125 فایل / حدود 8.35 MB؛ قابل بازیابی از history یا build
- [x] تقویت و dedupe `.gitignore`
- [x] حذف handoff منسوخ V1 و اصلاح تمام ارجاع‌های فعال
- [x] اصلاح release verifier برای نادیده‌گرفتن generated parity output
- [x] ایزوله‌کردن تست OTP؛ صفر درخواست شبکهٔ واقعی در unit test
- [x] ایجاد roadmap رسمی Native و route migration matrix
- [x] اجرای دوبارهٔ build/typecheck/Vitest/release gates
- [x] اجرای Node 22: build/typecheck و 503/503 تست PASS
- [ ] Chromium flows/parity — `BLOCKED_ENV` با خطای دانلود ثبت‌شده

**نتیجهٔ N00:** `DONE_WITH_BROWSER_ENV_BLOCKER`. artifact تولیدی track نیست؛ فایل‌های canonical یک‌مسیره‌اند؛ build/typecheck/503 تست و هر 75 gate غیرمرورگری PASS است؛ پنج gate مرورگری صادقانه BLOCKED مانده‌اند.

## 5. فاز تکمیل‌شده N01 — Clean Architecture & Repository Structure

- [x] `N01-01` حذف چهار root artifact بدون مصرف
- [x] `N01-02` pin کردن Node 22.22 و هم‌راستاسازی package/lockfile
- [x] `N01-03` ایجاد harness، schema، file ledger، worklog و `ZCODE.md`
- [x] `N01-04` ثبت repository map و package boundaries
- [x] `N01-05` تولید consumer/dependency map: ۵۱۸ فایل، ۱۷۸۰ یال، ۲۲ مصرف‌کنندهٔ خارجی برای هر یک از V1/V2، صفر deep workspace import
- [x] `N01-06` ایجاد index اسناد و طبقه‌بندی current/legacy/history
- [x] `N01-07` ثبت token source موقت واحد، codegen مقصد و ترتیب بازنشستگی V1/V2
- [x] `N01-08` حذف `PathBanner.tsx` با zero-consumer proof؛ حفظ چهار candidate مصرف‌شده توسط verifier
- [ ] `N01-09` بازنشستگی کامل V1/goldens — `BLOCKED` تا مهاجرت consumer و Chromium
- [x] `N01-10` گیت نهایی و package checkpoint — `DONE_WITH_BROWSER_ENV_BLOCKER`

فهرست taskها، dependencyها، مسیرهای مجاز و acceptance criteria در `harness/roadmap.json` است. خروجی `node tools/harness.mjs next` بر حدس مدل اولویت دارد.

**نتیجهٔ N01:** `DONE_WITH_BLOCKER`. build/typecheck و ۶۵ فایل/۵۰۲ تست با Node 22.22 PASS؛ repository/release/dependency gateها PASS؛ static برابر ۷۶/۸۱ است و پنج gate مرورگری به‌علت نبود Chromium مسدود مانده‌اند.

## 6. فاز جاری N02 — Android Native Foundation

- [x] `N02-01` ADR-0036 و HG-01: حفظ `com.mathlearning.app`، حداقل Android 7.0 / API 24
- [x] `N02-02` Gradle 9.6 wrapper با SHA-256، AGP 9.4.0 و version catalog بدون نسخهٔ dynamic
- [x] `N02-03` ساخت `app`، `core:common`، `core:model` و `core:testing` با مرزهای مستند
- [x] `N02-04` composition root دستی، error taxonomy و logger با حذف کلیدهای حساس؛ source test اضافه شد
- [x] `N02-05` single-activity Compose، placeholder route، deep link و source test بازیابی navigation
- [x] `N02-06` CI کم‌دسترسی روی Ubuntu 24.04، نصب صریح SDK 37، preflight، wrapper validation و test/lint/compile؛ بدون signing یا انتشار artifact
- [x] `N02-08` ممیزی کامل content originals و ۱۸ conflict/decision/boundary، ادغام در فازها، استانداردسازی `design/`، `content-library/` و `skills/`
- [x] `N02-09` تبدیل الهام Duolingo/AVA/UIUXProMax/Clay به guardrail، ایجاد Design System Skill و component readiness contract
- [x] `N02-10` بازخوانی عمیق هر ۱۰ original، ثبت `CONTENT-013..018` و تثبیت authoring/published/client و audio/CMS lifecycle
- [x] `N02-11` قفل UI/UX تمام ۱۷ خانواده صفحه، ترتیب U0–U6، backlog بیست‌ردیفی و بستهٔ انتقال مستقل
- [x] `N02-12` build harness واحد، Skill تخصصی Android، CI هم‌مسیر، گزارش ماشینی و debug APK با hash
- [x] `N02-07` اجرای واقعی compile/lint/unit — `DONE` در 2026-10-31: نخستین اجرای واقعی Gradle روی ماشین مالک (JDK 17 + `D:\SDK` با platform 37)؛ lint خطای واقعی `themes.xml` را گرفت که با qualifier `values-v27` رفع شد و `npm run android:gate` = PASS (exit 0)؛ debug APK عمداً ساخته نشد (task صراحتاً مجوز نداد)؛ instrumentation همچنان به فاز دارای emulator/device موکول است.

پنج Skill پروژه فقط در `skills/<name>/` قرار دارند و `agents/openai.yaml` معتبر دارند: چهار Skill طراحی/اجرا/محتوا و یک Skill مستقل build. `design/MASTER.md` قرارداد برند/UX V3، `INSPIRATION_GUARDRAILS.md` مرز adopt/adapt/reject و `COMPONENT_READINESS.md` قرارداد componentهای N03 را تعریف می‌کند. ۱۵ route زنده در `design/playbook/ROUTE_REGISTRY.md` ثبت شده‌اند. هر ۱۷ خانوادهٔ صفحه outcome/focal/CTA/depth/state اختصاصی دارد و ۲۰ work item Native با dependencies/evidence صریح، تا اجرای واقعی در وضعیت `NATIVE_PENDING` نگه داشته شده‌اند.

محیط Android اکنون build harness قابل‌تکرار دارد: `npm run android:doctor` برای readiness، `npm run android:gate` برای test/lint/compile و `npm run android:assemble:debug` برای gate + APK. workflow روی `ubuntu-24.04` و Node 22 پین شده، `platforms;android-37` را صریح نصب می‌کند و همان gate محلی را اجرا می‌کند. گزارش‌ها generated و خارج از Git هستند؛ APK موفق فقط با مسیر/اندازه/SHA-256 پذیرفته می‌شود. در runner ممیزی قبلی JDK 17 سبز بود اما SDK root/platform 37 وجود نداشت؛ در 2026-10-31 همین harness روی ماشین مالک (با SDK موجود) به PASS واقعی رسید.

`content-library/originals/**` شامل ۱۰ فایل byte-protected است: مطالعهٔ ۲۵ بخش/۱۵۰ صفحه، معماری ۱۰۰ مهارت، ۱۵ pattern و ۲۳۲ ردیف metadata صوت. فقط ST07 spec کامل دارد؛ ۲۴ ایستگاه دیگر هنوز باید تولید شوند. ممیزی canonical در `content-library/integration/SOURCE_AUDIT.md`، مرز سه مدل/lifecycle در `AUTHORING_CONTRACT_GAPS.md` و مالکیت فازها در `PHASE_INTEGRATION.md` است. هیچ original، صوت واقعی یا محتوای production فعال نشده است.

**نتیجهٔ نهایی N02 (2026-10-31):** هر ۱۲ task پیاده‌سازی شد. `N02-07` با نخستین اجرای واقعی Gradle بسته شد: doctor = READY و gate (test/lint/compile) = PASS با exit 0 روی ماشین مالک (JDK 17 Temurin + `D:\SDK` با platform 37)؛ lint در همان اجرا یک خطای واقعی (`themes.xml`، نیازمند API 27) را آشکار کرد که با qualifier `values-v27` رفع شد. debug APK عمداً ساخته نشد (task صراحتاً مجوز نداد) و instrumentation/emulator به فازهای بعدی موکول است. N03 فقط با go-ahead صریح مالک و از `N03-01` شروع می‌شود.

## 6b. فاز جاری N03 — Native Design System V3 (U0 انجام شد)

- [x] `N03-01` Token schema و codegen TypeScript/Kotlin — `DONE` در 2026-10-31: codegen تک‌منبعی `tools/token-codegen/generate.mjs` که فقط بلاک canonical `v2` از `packages/design-system/src/tokens.json` را می‌خواند (ADR-0037 L6)؛ خروجی‌های generated: `packages/design-system/src/tokens.generated.ts` و `apps/android/core/designsystem/src/main/kotlin/com/mathlearning/core/designsystem/ShomaraTokens.kt` (مقادیر خام Compose؛ اتصال ماژول Gradle در `N03-02`)؛ drift gate با `--check` (TOKEN_DRIFT: PASS) و تست `packages/design-system/src/codegen.drift.test.ts` (۶ تست). هیچ مقدار v1 یا کپی JSON دومی وارد Native نشد.
- [x] `N03-02` ShomaraTheme و typography RTL — `DONE` در 2026-10-31: ماژول `:core:designsystem` در Gradle سیم‌کشی شد (library + compose compiler، compileSdk 37/minSdk 24/JDK 17) و به لیست verify-android-foundation (۵ ماژول) افزوده شد؛ `ShomaraTheme.kt` با نگاشت slot-by-slot از ShomaraTokens (colorScheme، Typography با وزن‌های v2، Shapes از radius، clay چهار سطحی، و معنای جهت: پیش‌فرض RTL رابط در برابر LTR ریاضی)؛ هر مقدار از token می‌آید، صفر magic value؛ `FontFamily.Default` موقت است چون فایل‌های Vazirmatn در repo نیست و دانلود ممنوع (L10) — منتظر asset مالک؛ `:core:designsystem:test` و `lint` = PASS با ۷/۷ تست.
- [x] `N03-03` Button/Input/OTP primitives — `DONE` در 2026-10-31: سه primitive با state matrix کامل، duplicate-tap guard، کاهش عمق clay در pressed، خطای متنی actionable، و OTP با پیشرفت LTR صریح در صفحهٔ RTL؛ ۱۴ تست JVM جدید (مجموع ۲۱).
**نتیجهٔ نهایی N03 (2026-10-31):** هر ۸ task اجرا شد (۷ DONE + N03-07 با DONE_WITH_BLOCKER). گیت‌های ماشینی همه سبزند (۵۶ تست JVM ماژول، android:gate، static 87/87 با verifier جدید صفر-raw-token). HG-02 با دستور مستقیم مالک تأیید شد؛ شواهد screenshot/device (Paparazzi در cache آفلاین نیست) و asset فونت Vazirmatn به‌عنوان ورودی باز باقی‌اند. ثبت کامل: `docs/design/NATIVE_COMPONENT_READINESS_N03.md`.

## 6c. فاز جاری N04 — Auth & Onboarding (Native)

- [x] `N04-01` قرارداد state و route onboarding — `DONE` در 2026-10-31: سه ماژول واقعی Gradle سیم‌کشی شد (:core:network با okhttp/mockwebserver، :core:datastore با datastore-preferences، :feature:onboarding با compose)؛ قرارداد حالت‌ها (New/Restoring/Recover/Error)، مسیرهای canonical و ماشین AuthSession با تست (۷/۷)؛ ورود مهمان در production با ثابت قراردادی ممکن نیست؛ restore با وضعیت Authenticated fail-closed می‌شود.
- [x] `N04-02` Welcome و phone input — `DONE` در 2026-10-31 (اعتبارسنجی فارسی با نرمال‌سازی ارقام و پیشوندها، back map قطعی، ۶ تست جدید).
**نتیجهٔ نهایی N04 (2026-10-31):** هر ۷ task با ۶ commit اتمی بسته شد. سه ماژول واقعی Gradle (:core:network با OkHttp/MockWebServer، :core:datastore با DataStore واقعی، :feature:onboarding با Compose) و مسیر launch واقعی (NavHost از ONBOARDING با deep link؛ ورود موفق به FOUNDATION). ۷۲ تست سه‌ماژوله (network 11، datastore 6، feature 40) + تست navigation اپ. `connectedCheck` اجرا نشد (بدون AVD) — ثبت صادقانه؛ شواهد device در فاز بعد. مسیرهای منفی شبکه با MockWebServer پوشش کامل دارند.

## 6d. فاز جاری N05 — Child Shell, Path, Practice & Profile

- [x] `N05-01` Child shell و tab navigation — `DONE` در 2026-11-01: shell سه‌تب canonical در `:app` با حفظ state واقعی هر تب (saveState/restoreState)، re-select بی‌اثر، Back قطعی، deep link هر تب؛ پنج ماژول واقعی Gradle سیم‌کشی شد (13 ماژول در verifier).
- [x] `N05-02` Path graph و chapter bands — `DONE` در 2026-11-01 (نگاشت state فقط از progress سرور، یک Current واحد، برچسب TalkBack صریح، ۵ باند فصل؛ ۹ تست).
- [x] `N05-09` Station/chapter metadata — `DONE` در 2026-11-01 (ST01..ST25 ثابت از stations-index، عنوان‌ها provisional و بدون ادعا، برچسب ساختاری فصل‌ها؛ CONTENT-004 برای UI بسته شد — تغییر نام نهایی ورودی غیرمسدودساز مالک می‌ماند).
## 7. تصمیم‌های محافظت‌شده

- فارسی/RTL و Android-first.
- shell کودک: «مسیر / تمرین / من» تا تصمیم صریح دیگر.
- Phone OTP تنها onboarding production؛ ParentGate مستقل اضافه نمی‌شود.
- Learning Truth، progression، mastery و Station Pass سروری.
- Challenge / Mastery / Station Pass مفاهیم جدا.
- answer key/evaluator خارج از child client.
- بدون stars/lives/punitive streak/coin/loot box/store/leaderboard.
- یک Design System canonical و یک learning engine.

## 8. Blockerها و موارد تأییدنشده

- Chromium در runner فعلی نصب نیست.
- Node 22.22 با runner موقت اجرا و تأیید شد؛ Node پیش‌فرض میزبان همچنان 24 است.
- Android preflight (runner ممیزی 2026-10-28): JDK 17 `PASS`؛ Android SDK root و platform 37 `FAIL`. — **رفع شد در 2026-10-31**: روی ماشین مالک `D:\SDK` با platform 37 موجود است و gate واقعی PASS شد.
- Gradle wrapper در runner ممیزی distribution را نگرفت (`Network is unreachable`). — **رفع شد در 2026-10-31**: روی ماشین مالک distribution 9.6.0 با checksum پین‌شده دانلود و gate کامل اجرا شد.
- تست دستگاه واقعی، TalkBack، font scaling و child/educational QA انجام نشده است.
- مسئله‌های `CONTENT-001` تا `CONTENT-018` طبق source audit باز/محافظت‌شده‌اند؛ به‌ویژه جهت نوشتن ۱، jump/hint policy، mastery/unlock، schema typed، audio lifecycle، curriculum scope و telemetry باید در فاز مالک حل شوند.
- هیچ ادعای APK/AAB یا production readiness وجود ندارد.
- debug APK ساخته نشده — نه به‌علت blocker محیطی، بلکه چون متن task صراحتاً مجوزش را نداده است؛ release/signing همچنان N10/HG-05 است.

## 9. تاریخچهٔ کوتاه مسیر جدید

| تاریخ | snapshot | نتیجه |
|---|---|---|
| 2026-10-28 | SNAP-20261028-NATIVE-P00-01 | AVA بسته شد؛ SHOMARA تنها scope؛ N00 با حذف 125 artifact، canonical docs، اصلاح release verifier و تست OTP ایزوله تکمیل شد؛ 503/503 تست PASS؛ Chromium blocked. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-01 | N01 checkpoint 1: چهار root artifact حذف؛ Node pin؛ harness با 11 فاز و task graph؛ file ledger، repository map و package boundaries اضافه شد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-02 | N01 checkpoint 2: dependency map تکرارپذیر، docs index، phase checklist، Design System migration plan و نخستین dead-code batch تکمیل شد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-FINAL | N01 بسته شد؛ تمام gateهای غیرمرورگری سبز، ۵ browser gate مسدود؛ بستهٔ source checkpoint آماده؛ N02 منتظر HG-01 است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-FOUNDATION | DESIGN Native-ready شد؛ ۴ ماژول Native، toolchain pin، CI، logging/error، navigation/deep link و تست‌های پایه ایجاد شد؛ گیت کامل Android به SDK/proxy محیط مسدود است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-CONTENT-FOUNDATION | ده original با checksum حفظ شد؛ content source audit و phase integration ثبت شد؛ سه Skill مستقل و نام‌گذاری lowercase/kebab-case ایجاد شد؛ N02 فقط به gate واقعی Android مسدود است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-DESIGN-GOVERNANCE | Skill چهارم برای Design System، metadata چهار Skill، guardrail الهام و readiness matrix پیاده شد؛ N03 همچنان تا gate واقعی Android شروع نشده است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-CONTENT-CONTRACTS | هر ۱۰ original دوباره ممیزی شد؛ سه مدل محتوایی، دو lifecycle و شش issue جدید به چهار task اجرایی N02/N06/N07/N08 تبدیل شد؛ originalها دست‌نخورده و N03 بسته ماند. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-ENVIRONMENT-HARDENING | preflight fail-closed، نصب صریح SDK 37 و runner پین‌شده به CI افزوده شد؛ blocker با evidence دقیق SDK/cache/network ثبت و N03 عمداً شروع نشد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-FINAL-UIUX-HANDOFF | قرارداد اختصاصی ۱۷ خانواده صفحه، ترتیب U0–U6 و ۲۰ work item Native قفل شد؛ Skill/route/verifier/harness متصل و handoff مستقل ساخته شد؛ N03 همچنان عمداً پشت N02-07 ماند. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-BUILD-HARNESS | build محلی و CI به doctor/gate/assemble-debug واحد منتقل شد؛ گزارش JSON و SHA-256، Skill تخصصی و resume report اضافه شد؛ SDK 37 تنها blocker باقی ماند. |

| 2026-10-28 | SNAP-20261028-NATIVE-N02-BUILD-HARNESS | build محلی و CI به doctor/gate/assemble-debug واحد منتقل شد؛ گزارش JSON و SHA-256، Skill تخصصی و resume report اضافه شد؛ SDK 37 تنها blocker باقی ماند. |
| 2026-10-31 | SNAP-20261031-N02-CLOSED | N02 با PASS واقعی `android:gate` بسته شد (رفع خطای lint واقعی themes.xml با values-v27)؛ چهار فیکس P0 فاز ۱ Track A (allowlist answer-key، lifecycle provenance، fail-closed dev identity، حذف کپی ستاره) و هاردنینگ verifierها؛ Vitest 67/514، static 87/87، parity 29/29. |
| 2026-10-31 | SNAP-20261031-N03-U0-01 | checkpoint N02/P0 با commit `0ca03ea` ثبت شد؛ debug APK واقعی ساخته و تأیید شد (PASS، 12,030,634 bytes، SHA-256 06007f6a…)؛ شاخهٔ `native/n03-design-system` ساخته شد و U0/`N03-01` (token codegen TS/Kotlin + drift gate) با تست و گیت سبز بسته شد. |
| 2026-10-31 | SNAP-20261031-N03-DS-02 | commit `26f0de5` (N03-01)؛ `:core:designsystem` سیم‌کشی و کامپایل شد؛ ShomaraTheme/typography/clay/direction با صفر magic value پیاده و ۷ تست JVM سبز شد؛ گیت ماژول، android:gate و کل سوئیت PASS؛ N03-02 به‌صورت DIFF_READY. |
| 2026-10-31 | SNAP-20261031-N03-PHASE-CLOSED | فاز N03 با ۶ commit اتمی بسته شد (ShomaraTheme، Button/OTP، Card/Feedback، Navigation/Dialog/Audio، Manipulatives، Catalog + گیت صفر-raw-token)؛ ۵۶ تست JVM؛ دو blocker صادقانه: HG-02 و screenshot/device (NATIVE_PENDING). |

## 10. کار بعدی دقیق

`N02-07` و فاز `N02` در 2026-10-31 با شواهد PASS واقعی بسته شدند (اینجا و `harness/WORKLOG.md`). N03 با go-ahead مالک از `N03-01` (U0) شروع شد و همان task با شواهد بسته شد؛ N03-02 (ShomaraTheme و typography RTL) با شواهد بسته شد؛ تغییرات آن DIFF_READY و بدون commit است؛ فاز N04 نیز بسته شد (۷/۷)؛ گام بعدی `N05-01` است و فقط با go-ahead مالک شروع می‌شود. برای ادامه از چت جدید: `node tools/harness.mjs validate` و سپس `node tools/harness.mjs next` (اکنون `N03-01 [TODO]` را نشان می‌دهد) و `node tools/harness.mjs task N03-01`. اگر debug APK خواسته شد، فقط `npm run android:assemble:debug` معتبر است؛ release/AAB/signing تا N10/HG-05 ممنوع می‌ماند.

## 11. قفل مسیر Track A (ADR-0037، ۲۰۲۶-۱۰-۳۰)

این بخش مسیر موازی بتای قابل‌نصب را ثبت می‌کند. تا وقتی Track A در harness ثبت نشده (L17)، خروجی `node tools/harness.mjs next` پس از بسته‌شدن N02 اکنون `N03-01` را نشان می‌دهد و کار Track A فقط مطابق ADR-0037 انجام می‌شود.

**تصمیم‌های قفل‌شده (L1 تا L17):** در `docs/adr/ADR-0037-installable-beta-track-lock.md`.

- دو مسیر موازی: Track A (Expo beta با backend، فقط P0/P1 و parity) و Track B (Native طبق roadmap).
- مبنای خط کاری: `main@6063c55`. شاخه‌های remote فقط مرجع‌اند؛ تاریخچه‌شان با main نامرتبط است و merge یا rebase روی آن‌ها انجام نمی‌شود.
- اصلاح از شاخه‌ها فقط پس از بازتولید خطا یا نبود قابلیت روی main، با تست و diff جدا.
- ستاره‌ها از UI کودک حذف می‌شوند (قاعدهٔ ۸ AGENTS مقدم بر MASTER §5).
- `apps/web` تا پایان ۱.۱ عمومی منتشر نمی‌شود.
- palette canonical = v2.
- هیچ URL، کلید، keystore یا credential در repo نیست؛ API base از EAS secret تزریق می‌شود.
- APK فقط با مجوز صریح فاز و توسط مالک ساخته می‌شود؛ انتشار داخلی تا M3؛ release تا N10/HG-05 ممنوع است.
- هر فاز شاخهٔ جدا دارد و PASS فقط با فرمان، exit code و evidence معتبر است.

**ورودی‌های باز (I1 تا I6):**

- I1: وضعیت GitHub Actions و branch protection (API در این نشست 403 داد).
- I2: backend با HTTPS، پروژهٔ Supabase، provider OTP و محل نگه‌داری secrets.
- I3: اجرای EAS preview توسط مالک.
- I4: مدل گوشی و نسخهٔ Android.
- I5: تأیید محتوای seed `0035_grade1_staging_seed.sql`.
- I6: اصلاح `baseline_commit` (`ef35ce2` در repo وجود ندارد).

**Milestones:**

- M1: APK متصل به backend روی گوشی مالک. gate: 0.5، 1.1، 1.6 و 2.1 تا 2.4.
- M2: بتای پایدار. gate: فاز ۱ کامل، 2.5، 3.1 تا 3.4، 3.9، 3.10 و I1.
- M3: آماده برای کودکان واقعی. gate: فازهای ۴ و ۶، بازبینی L7 و تأیید مالک.

**چک‌لیست فعال Track A** (وضعیت هر آیتم فقط با evidence تغییر می‌کند):

- فاز ۰ (مستندات): 0.1 ثبت ADR-0037 — انجام شد روی شاخهٔ `docs/phase0-lock-beta-track` · 0.2 وضعیت CI و branch protection — باز (I1) · 0.3 نگاشت شاخه‌ها — انجام شد (ADR-0037، بخش Context) · 0.4 ثبت Track A در harness — پس از بازبینی · 0.5 تعیین backend — باز (I2) · 0.6 عدم انتشار عمومی `apps/web` — فعال (L5)
- فاز ۱ (P0، امنیت و محتوا): 1.1 حذف `expectedIndex` از bundle کلاینت · 1.2 جایگزینی denylist با allowlist در `learning-client-content.ts` · 1.3 یک منبع approval برای TS و SQL · 1.4 محتوای p10 با `DRAFT_*` و `status=ACTIVE` · 1.5 تست یکپارچگی دیتابیس در CI · 1.6 guard برای dev identity در production · 1.7 حذف کپی ستاره و افزودن دو فایل به verifier · 1.8 بازبینی seed (I5)
- فاز ۲ (APK): 2.1 EAS secret برای API base · 2.2 ارتقای RN به ≥ 0.86.2 · 2.3 بیلد توسط مالک (I3) · 2.4 preflight روی بیلد · 2.5 چک‌لیست دستگاه، کپی از `chore/p8-closing` (I4)
- فاز ۳ (پایداری Expo، بدون قابلیت جدید): 3.1 شروع آفلاین ایستگاه · 3.2 نمایش پاسخ صف‌شده · 3.3 resume بر اساس snapshot سرور · 3.4 `normalizeAuthoritativeContent` · 3.5 اندازهٔ مهره‌ها (۷۲ تا ۸۰dp) · 3.6 کنتراست مرز کنترل‌ها · 3.7 مقادیر جادویی `jump.tsx` · 3.8 انتقال v1 به v2 · 3.9 اجرای تست‌های `.tsx` · 3.10 علت شکست parity · 3.11 حذف داده والدین روی سرور · 3.12 حذف `missions` · 3.13 کامنت‌های قدیمی · 3.14 کد مرده
- فاز ۴ (gate و CI): 4.1 `core` به‌عنوان required · 4.2 حذف `continue-on-error` از `visual-and-static` · 4.3 ESLint · 4.4 job بیلد APK دستی · 4.5 تبدیل DoD به verifier و ledger · 4.6 verifierها و parity به بخش required
- فاز ۵ (Native، موازی): 5.1 N02-07 روی runner با SDK 37 · 5.2 ماژول `:core:designsystem` · 5.3 screenshot harness · 5.4 job با emulator · 5.5 DTO و contract tests · 5.6 لایهٔ network، cache و sync · 5.7 U0 تا U6 · 5.8 cutover و release
- فاز ۶ (پیش از کودکان واقعی): 6.1 سیاست حریم و متن پذیرش · 6.2 حذف داده در سرور · 6.3 تصمیم crash reporting و analytics · 6.4 keystore و secrets · 6.5 سیاست نسخه · 6.6 QA کودک، TalkBack، فونت ۲۰۰٪ و process death · 6.7 فقط محتوای approved در production
