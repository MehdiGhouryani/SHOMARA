# SHOMARA execution worklog

این فایل append-only است. وضعیت جاری در `START_HERE.md` و وضعیت ماشینی در `roadmap.json` قرار دارد.

## 2026-10-28 — N00 / SNAP-20261028-NATIVE-P00-01

- baseline commit: `ef35ce2`
- branch: `chore/p00-repository-baseline`
- output: حذف 125 فایل `parity-out-expo`، canonical docs، roadmap Native، release verifier scope fix، OTP test network isolation.
- gates: Node 22.22 build/typecheck PASS؛ Vitest 503/503؛ release verifier PASS؛ static 75/80.
- blocker: پنج browser gate؛ Playwright Chromium download در runner به فایل 0-byte/ZIP ناقص رسید.
- commit: `f43bb02`

## 2026-10-28 — N01 checkpoint 1

- branch: `chore/n01-clean-architecture`
- output: حذف چهار root artifact منسوخ؛ Node 22.22 pin؛ repository map؛ package boundaries؛ file ledger؛ roadmap harness و resume protocol.
- next task: `N01-05` dependency/consumer map برای V1/V2 و packageها.
- unverified until final N01 gate: browser flows/parity و Android device.

## 2026-10-28 — N01 checkpoint 2

- dependency audit: 518 source file، 1780 import edge، 107 workspace edge و صفر deep workspace import.
- migration evidence: هر یک از V1 و V2 هنوز 22 consumer خارجی دارند؛ حذف کامل V1 مجاز نیست.
- dead-code batch: فقط `apps/mobile/src/path/PathBanner.tsx` پس از zero-consumer proof حذف شد؛ چهار candidate دیگر به‌علت verifier/string consumption حفظ شدند.
- docs: index، phase checklist و Design System migration plan اضافه شد.
- next task: `N01-10` اجرای gateهای نهایی و package checkpoint؛ `N01-09` با Chromium/consumer migration مسدود است.

## 2026-10-28 — N01 final / SNAP-20261028-NATIVE-N01-FINAL

- gates: Node 22.22 build/typecheck PASS؛ Vitest 65 file / 502 test PASS؛ repository، release و dependency verifier PASS.
- static: 76/81 PASS؛ پنج flow/parity gate فقط به‌علت Chromium unavailable در وضعیت `BLOCKED_ENV` باقی ماند.
- outcome: `N01 DONE_WITH_BLOCKER`؛ هیچ threshold یا assertion تضعیف نشد.
- handoff: manifest تحویل در `docs/delivery/SHOMARA_N01_CHECKPOINT.md`؛ task بعدی `N02-01` در انتظار HG-01 مالک برای applicationId/minSdk.

## 2026-10-28 — DESIGN checkpoint / commit e4035b0

- `skills/shomara-product-design/SKILL.md` و playbook با frontmatter، trigger و workflow قابل اجرا استاندارد شدند.
- `design/MASTER.md` قرارداد برند و UX Native V3 را ثبت کرد؛ ۱۵ route زنده در route registry نگاشت شدند.
- `NATIVE_IMPLEMENTATION.md` و verifier بستهٔ طراحی اضافه/تقویت شد؛ checksum منابع اصلی و metadata صوت PASS است.
- نتیجه: DESIGN منبع ایده‌پردازی آزاد نیست؛ هر UI task باید از route registry، state matrix و review rubric عبور کند.

## 2026-10-28 — N02 foundation / SNAP-20261028-NATIVE-N02-FOUNDATION

- branch: `native/n02-foundation`
- HG-01: APPROVED؛ `applicationId=com.mathlearning.app`، `minSdk=24`، `compileSdk=37` و `targetSdk=36` در ADR-0036 ثبت شد.
- output: Gradle 9.6/AGP 9.4 foundation؛ app + core:common/model/testing؛ single activity؛ Compose navigation/deep link؛ safe logging/error model؛ unsigned CI.
- static gate: `npm run verify:android-foundation` PASS؛ wrapper JAR و distribution checksum تأیید شدند.
- regressions: Node 22.22 build packageها و typecheck هر ۹ workspace PASS؛ Vitest برابر ۶۵ فایل/۵۰۲ تست PASS.
- static suite: ۷۷/۸۲ PASS؛ همان پنج flow/parity مرورگری فقط به نبود Chromium شکست خوردند.
- blocker: Android SDK 37 وجود ندارد و Java/Gradle از proxy runner به repositoryها دسترسی ندارد؛ compile/lint/unit و instrumentation ادعا نشده‌اند.
- current task: `N02-07`؛ N03 تا اجرای واقعی gate کامل شروع نشود.

## 2026-10-28 — N02 content foundation / SNAP-20261028-NATIVE-N02-CONTENT-FOUNDATION

- originals: هر ۱۰ فایل `content-library/originals` byte-for-byte با SHA-256 ثبت‌شده منطبق ماند.
- inventory: ۲۵ ایستگاه، ۱۵۰ صفحهٔ کار، ۱۰۰ skill پیشنهادی، ۱۵ pattern، تنها یک pilot کامل (ST07) و ۲۳۲ ردیف metadata صوت draft؛ صفر audio binary.
- audit: دوازده مورد `CONTENT-001..012` ثبت شد؛ سه conflict مهم ST07 شامل جهت نوشتن ۱، تعداد jump question و hint در P4 است.
- structure: rootهای فعال به `design/` و `content-library/` استاندارد شدند؛ هر Skill در `skills/<lowercase-kebab-name>/SKILL.md` مستقل شد.
- implementation: generator تکرارپذیر برای `book-pages-index.json` و `curriculum-index.json` اضافه شد؛ drift، source hash، CSV و skill structure گیت دارند.
- roadmap: N03/N05/N06/N07/N08 اکنون مالک دقیق primitiveهای آموزشی، نام‌گذاری path، ST07، audio/CMS و تولید ۲۴ station باقی‌مانده هستند؛ task count از ۸۲ به ۹۲ رسید.
- gates: Node 22 build/typecheck و ۶۵ فایل/۵۰۲ تست PASS؛ content library، generated-index drift، project skills، design pack، repository harness و Android static foundation PASS.
- static: ۸۰/۸۵ PASS؛ پنج failure همان flow/parityهای نیازمند Chromium هستند. N02-07 همچنان فقط به Android SDK/Gradle network مسدود است.

## 2026-10-28 — N02 design governance / SNAP-20261028-NATIVE-N02-DESIGN-GOVERNANCE

- research: الگوی design-system-first و anti-pattern review از UI/UX Pro Max، consistency/purpose و simplicity/clarity از Duolingo و depth-accessibility به guardrail داخلی تبدیل شد؛ هیچ dependency خارجی نصب نشد.
- skills: Skill چهارم `shomara-design-system` با reference progressive اضافه شد؛ هر چهار Skill دارای `agents/openai.yaml` و routing صریح شدند.
- design: ماتریس adopt/adapt/reject، design dialهای مخصوص teaching/assessment و قرارداد ۹ خانواده component و چهار depth tier ثبت شد.
- implementation: verifierهای skill metadata و design governance اضافه شدند؛ main docs، roadmap و resume protocol به routing جدید متصل شدند.
- gates: build packageها، typecheck هر ۹ workspace و ۶۵ فایل/۵۰۲ تست PASS؛ static برابر ۸۱/۸۶ و پنج failure فقط Chromium؛ repository/content/design/skill/Android static PASS.
- boundary: N03 شروع نشده و `N02-07` همچنان به SDK 37 و دسترسی Gradle مسدود است؛ هیچ ادعای build/device یا APK وجود ندارد.

## 2026-10-28 — N02 content contracts / SNAP-20261028-NATIVE-N02-CONTENT-CONTRACTS

- reread: هر ۱۰ فایل `content-library/originals` دوباره بررسی شد؛ ST07 کامل، Stage4/5/6 و هر دو CSV با تمرکز روی mastery، authoring، صوت/CMS، scope و privacy تطبیق داده شدند.
- integrity: originalها بدون ویرایش و با SHA-256 قبلی حفظ شدند؛ ۲۳۲ ردیف همچنان draft metadata و صفر audio binary است.
- audit: `CONTENT-013..018` برای audio asset lifecycle، mastery/unlock، typed schema/lifecycle، curriculum scope، T11 fallback و telemetry privacy ثبت شد.
- roadmap: task count از ۹۳ به ۹۷ رسید؛ N02-10 تکمیل و taskهای N06-11، N07-09 و N08-12 برای اجرای ریسک‌ها اضافه شدند. ترتیب phaseها تغییر نکرد.
- gates: package build، typecheck هر ۹ workspace و Vitest ۶۵ فایل/۵۰۲ تست PASS؛ content/skill/repository/Android/design gateها PASS؛ static برابر ۸۱/۸۶ و پنج failure فقط Chromium است.
- boundary: N02 اکنون ۹/۱۰ است؛ `N02-07` همچنان تنها blocker محیطی و N03 هنوز شروع‌نشده است.

## 2026-10-28 — N02 environment hardening / SNAP-20261028-NATIVE-N02-ENVIRONMENT-HARDENING

- diagnosis: JDK 17 موجود؛ هیچ SDK root/`sdkmanager`/`adb` محلی موجود نیست؛ cacheهای Gradle 9.6 و 8.11 فقط `.part` صفر بایتی و wrapper download با `Network is unreachable` متوقف شد.
- implementation: preflight چندسکویی `scripts/verify-android-environment.mjs` با خروجی `READY/BLOCKED_ENV`، تشخیص Java 17 و signature واقعی `android.jar` اضافه شد.
- CI: runner به `ubuntu-24.04` پین شد؛ Android CLI و fallback رسمی `sdkmanager` برای نصب دقیق `platforms;android-37` و preflight fail-closed پیش از Gradle اضافه شد.
- governance: runbook محیط، harness/ledger/verifier و resume protocol هم‌راستا شدند؛ static PASS همچنان جای compile/lint/unit را نمی‌گیرد.
- regression: package build، typecheck هر ۹ workspace و Vitest ۶۵ فایل/۵۰۲ تست PASS؛ static به baseline درست ۸۱/۸۶ برگشت و فقط پنج gate Chromium مسدود ماند.
- boundary: N02 همان ۹/۱۰ باقی ماند و N03 شروع نشد؛ blocker کوچک‌تر و قابل اجرای مستقیم روی CI/runner سالم شد.

## 2026-10-28 — N02 final UI/UX handoff / SNAP-20261028-NATIVE-N02-FINAL-UIUX-HANDOFF

- audit: تمام ۱۷ page-family contract، ۱۵ route زنده، screen ledger، UX rubric، Native contract و component readiness دوباره تطبیق داده شد.
- design: برای هر خانواده outcome، focal object، CTA، Clay depth، state matrix و reject اختصاصی در `PAGE_UIUX_BLUEPRINT.md` قفل شد؛ ترتیب U0–U6 dependencies را از foundation تا cross-route QA مشخص می‌کند.
- execution: ۲۰ work item در `NATIVE_IMPLEMENTATION_BACKLOG.csv` با module/components/states/blocker/exit evidence ثبت شد و همگی تا شواهد واقعی `NATIVE_PENDING` باقی ماندند.
- governance: همهٔ ۱۷ page contract، route registry، Design Master، دو Skill اجرایی، docs index، design verifier، file ledger و resume protocol به blueprint/backlog canonical متصل شدند.
- handoff: `docs/delivery/SHOMARA_FINAL_CHAT_HANDOFF.md` برای ادامهٔ مستقل از تاریخچهٔ چت ایجاد شد؛ N02 اکنون ۱۰/۱۱ و فقط `N02-07` محیطی مسدود است.
- gates: harness/design/skills/repository PASS؛ package build و typecheck هر ۹ workspace PASS؛ Vitest برابر ۶۵ فایل/۵۰۲ تست؛ static همان ۸۱/۸۶ و پنج failure فقط Chromium؛ Android preflight همان SDK 37 blocker را بازتولید کرد.
- boundary: هیچ Native route، APK/AAB، audio asset یا production content ساخته/فعال نشد؛ N03 تا compile/lint/unit واقعی شروع نمی‌شود.

## 2026-10-28 — N02 build harness / SNAP-20261028-NATIVE-N02-BUILD-HARNESS

- implementation: `scripts/android-build.mjs` سه mode قطعی doctor/gate/assemble-debug را با preflight مشترک، wrapper-only Gradle، گزارش atomic JSON و SHA-256 APK پیاده کرد.
- CI: workflow روی Node 22/JDK 17/SDK 37 پین و به همان `npm run android:gate` محلی متصل شد؛ signing، publication و artifact upload در N02 وجود ندارد.
- harness: فرمان read-only `node tools/harness.mjs resume` شاخه، task/blocker، allowed paths و phase gates را برای عامل بعدی چاپ می‌کند.
- skills: Skill پنجم `shomara-android-build` برای SDK/Gradle/CI/APK با مرز صریح debug در برابر release اضافه شد.
- evidence: `verify:android-build-harness` PASS؛ doctor، gate و assemble-debug در runner فعلی JDK 17 را PASS و SDK root/platform 37 را FAIL کردند و سه گزارش صادقانهٔ `BLOCKED_ENV` ساختند.
- regression: build packageها و typecheck هر ۹ workspace PASS؛ Vitest برابر ۶۵ فایل/۵۰۲ تست؛ repository برابر ۹۹ task/۵۹ ledger/۱۸۱۲ edge؛ static برابر ۸۲/۸۷ و پنج failure فقط Chromium است.
- boundary: pipeline آمادهٔ debug APK است ولی APK ساخته نشد؛ N02 اکنون ۱۱/۱۲ و `N02-07` تا اجرای واقعی gate مسدود است.

## 2026-10-28 — final review / SNAP-20261028-NATIVE-N02-FINAL-REVIEW

- recovery: source ZIP مربوط به 76e4cf7 با SHA-256 برابر fd529dd6523ed0117b26d4045b087e6f2afc6c38b67d55cc499071e2ae2c6bb1 بازیابی شد؛ history در ZIP نبود و baseline محلی جدید ایجاد شد.
- fixes: JAVA_HOME در preflight محترم است؛ SDK تأییدشده به Gradle منتقل می‌شود؛ discovery از نصب ناقص عبور می‌کند؛ flag ناشناخته رد می‌شود؛ crash preflight گزارش PASS قبلی را با FAILED جایگزین می‌کند.
- evidence: شش node:test رفتاری PASS؛ Android foundation/build harness، repository، skills، content، design و diff check PASS؛ dependency map برابر 1813 edge.
- boundary: doctor/gate/assemble-debug دوباره BLOCKED_ENV؛ SDK 37 موجود نیست. full package regression در محیط بازیابی‌شده اجرا نشد؛ شواهد 502 تست و 82/87 متعلق به checkpoint قبل است. N02 همان 11/12 است.

## 2026-10-30 — Track A lock (ADR-0037)

- decision: ADR-0037 قفل می‌کند: دو مسیر موازی؛ مبنا `main@6063c55`؛ شاخه‌های remote مرجع‌اند؛ ستاره‌ها از UI کودک حذف؛ `apps/web` تا ۱.۱ عمومی نشود؛ palette v2؛ secret فقط در EAS؛ APK با مجوز فاز.
- audit: ۱۷ شاخهٔ remote با `main` هیچ merge-base ندارند (`git merge-base` خروجی خالی و exit 1)؛ START_HERE روی main `file_version` 35 دارد و شاخه‌ها 18/22/24؛ `baseline_commit` ef35ce2 در repo نیست؛ `apps/android` فقط روی main است؛ checklist دستگاه روی `chore/p7-device-checklist` و `chore/p8-closing`.
- evidence: `npm ci` exit 0 (648 package)؛ `build:packages` exit 0؛ `typecheck:all` exit 0؛ `vitest run` exit 0 (65 file / 502 test)؛ `harness validate` معتبر؛ `harness next` = N02-07 `BLOCKED_ENV`؛ `verify-repository-harness` PASS؛ `verify-ui-v2-foundation` و `verify-design-governance` PASS؛ `verify-apk-preview` PASS (21)؛ `verify-mobile-release` exit 0؛ `verify:static:all` exit 1 (86/87، parity 1/29)؛ `build:web` exit 0 با `expectedIndex` در chunk کلاینت.
- boundary: هیچ کد یا verifier تغییر نکرد؛ push نشد؛ GitHub CI و branch protection تأیید نشدند (API 403)؛ Gradle/Android اجرا نشد؛ تست دستگاه انجام نشد؛ Track A هنوز در harness ثبت نشده (L17).

## 2026-10-31 — ZCode autonomous run (Phases 0-5) — DIFF_READY, uncommitted

- grounding: هشت hotspot با file:line اثبات شد؛ گزارش کامل در `docs/archive/evidence/2026-10-31/grounding-report.md`. محیط محلی برخلاف runner ممیزی: `ANDROID_HOME=D:\SDK` با platform 37 سالم و JDK 17 در `.jdks`؛ `android:doctor` = READY.
- N02-07: gate واقعی Gradle اجرا شد؛ lint خطای واقعی `themes.xml:5` (windowLightNavigationBar نیازمند API 27 با minSdk 24) را گرفت؛ با qualifier `values-v27` اصلاح و gate = PASS (exit 0). APK ساخته نشد (task صراحتاً مجوز نداد) و N03 شروع نشد.
- 1.1/1.2: سانیتایزر کلاینت از denylist به allowlist تبدیل شد و `expectedIndex` از mapping ایستای کلاینت حذف شد؛ بازسازی web و grep chunkها = صفر hit برای همهٔ کلیدهای answer-key؛ تست‌های جدید 2 فایل.
- 1.3: گیت TS حالا همان ستون `provenance` و همان مقادیر SQL را می‌خواند (helper مشترک + تست سازگاری SQL↔TS)؛ code-only، بدون migration.
- 1.6: هر سه گیت dev (principal، OTP mock، teacher seeds) با `isDevRuntime` fail-closed شدند (NODE_ENV خالی/نامتنظیم = production) + تست‌های production و request-input.
- 1.7: کپی ستارهٔ `characters.ts` با جملهٔ بدون آیتم جایگزین شد (PENDING OWNER REVIEW)؛ دو فایل (`characters.ts`، `StationFlow.tsx`) به اسکن child-safety verifier اضافه شدند؛ `starsEarned` مرده با zero-consumer proof حذف شد.
- gates: vitest 67 file / 514 test PASS؛ `verify-ui-v2-path-station` با اسکن گسترده PASS؛ web build و grep chunkها PASS. بقیهٔ gateها در گزارش نهایی 2026-10-31.
- boundary: هیچ commit/push/tag/APK/EAS/migration انجام نشد؛ همگی DIFF_READY روی شاخهٔ محلی `zcode/n02-p0-2026-10-31`.
- verifier-alignment (همان اجرا، ادامه): چهار گیت static که جزئیات منبع قدیمی را پین کرده بودند با نگه‌داشتن/تقویت همان قصد به‌روزرسانی شدند، نه تضعیف: `verify-answer-key-boundary` (کلیدهای ممنوع اکنون صریح در سانیتایزر نوشته می‌شوند)، `verify-phase2-foundation` (الگوی جدید و سخت‌گیرانه‌تر `isDevRuntime`)، `verify-uiux-phase4` و `verify-ux-p10-final` (guard جدید: نبود نماد `starsEarned` و نبود باگ قدیمی جایزهٔ placement). خروجی Gradle در `apps/android/**/build` generated است و پس از gate برای اسکن منبع پاک می‌شود (پیشنهاد مالک: exclude-dir=build در `verify-phase5`).

## 2026-10-31 — N02-07 / N02 closure + stage 4B cleanup — DIFF_READY, uncommitted

- closure: `N02-07` BLOCKED → DONE و فاز `N02` IN_PROGRESS → DONE در `harness/roadmap.json`، بر اساس شواهد همان اجرا: `npm run android:gate` = PASS (exit 0) با JDK 17 Temurin و `D:\SDK`/platform 37، رفع خطای lint واقعی `themes.xml` با qualifier `values-v27`، `android:doctor` = READY، و module graph ثبت‌شده در `docs/architecture/ANDROID_MODULE_GRAPH.md`. debug APK عمداً ساخته نشد (متن task مجوز نداد)؛ N03 شروع نشد و فقط با go-ahead مالک از `N03-01` باز می‌شود.
- verifier: `scripts/verify-phase5.mjs` اکنون خروجی generated Gradle (`build`، `.gradle`) را از اسکن Unity مستثنا می‌کند (منبع در برابر artifact؛ AGENTS §4) — gate دیگر نیازی به پاک‌سازی دستی `build/` ندارد.
- cleanup: شواهد اجرا از `docs/archive/evidence/2026-10-31/` به خارج از repo منتقل شد: `/tmp/shomara-evidence-2026-10-31` (grounding-report، final-report، ci-honesty-inventory و ۳۳ فایل baseline) تا dependency-map فقط فایل‌های واقعی repo را ببیند؛ `.zcode/` (ابزار عامل محلی) به `.gitignore` افزوده شد؛ ارجاع START_HERE به‌روز شد.
- evidence note: مسیر قبلی `docs/archive/evidence/2026-10-31/` در دو entry قبلی همین WORKLOG مذکور است؛ مسیر معتبر فعلی `/tmp/shomara-evidence-2026-10-31` است (append-only حفظ شد).

## 2026-10-31 — Stage 4C: commit 0ca03ea، debug APK، شروع N03 (U0/N03-01) — N03-01 changes DIFF_READY

- commit: checkpoint تأییدشدهٔ N02-07 + چهار فیکس P0 با `chore(n02): close N02-07 android gate and resolve P0 security/child-safety gates` (0ca03ea، 25 فایل) روی `zcode/n02-p0-2026-10-31`؛ `.zcode/` و `build/` در status ظاهر نشدند.
- APK: `npm run android:assemble:debug` (مجوز N02-12) = PASS، `app-debug.apk` با size 12,030,634 bytes و SHA-256 `06007f6a1b53d41eeda285d78379af6147d110d49d2d0b4e1c062918efd382ad`؛ `build-reports/android/assemble-debug.json` status=PASS و `signedForRelease:false`؛ checksum مستقلاً با sha256sum بازتأیید شد. release/AAB/signing همچنان N10/HG-05.
- branch: `native/n03-design-system` مطابق `harness/roadmap.json` ساخته شد؛ pointer روی N03/N03-01 رفت.
- N03-01 (U0): codegen تک‌منبعی `tools/token-codegen/generate.mjs` فقط از بلاک `v2` توکن canonical (schemaVersion 2.0.0) خروجی TypeScript (`packages/design-system/src/tokens.generated.ts`) و Kotlin (`apps/android/core/designsystem/.../ShomaraTokens.kt`، مقادیر خام Color/dp/sp/FontWeight) می‌سازد؛ schema guard (hex، ascending space، کف ۴۸dp، سطوح clay استاندارد MASTER)؛ drift gate دو لایه: `--check` CLI و تست vitest `codegen.drift.test.ts` (۶ تست). generated files دست‌نویس نمی‌شوند.
- boundary: فقط مسیرهای مجاز task (`packages/design-system/**`، `tools/token-codegen/**`، `apps/android/core/designsystem/**`) + `harness/**` و `START_HERE.md` تغییر کرد؛ اتصال ماژول `:core:designsystem` به Gradle عمداً به `N03-02` موکول شد (settings.gradle.kts خارج از allowedPaths این task)؛ هیچ صفحهٔ UI (U1+) شروع نشد؛ N03-01 changes کامیت نشدند.

## 2026-10-31 — Stage 4D: commit 26f0de5، سیم‌کشی :core:designsystem، بستن N03-02 — DIFF_READY

- commit: N03-01 با `feat(n03): implement N03-01 canonical token codegen and drift gate` (26f0de5، ۱۰ فایل) روی `native/n03-design-system` ثبت شد.
- wiring: `apps/android/settings.gradle.kts` شامل `:core:designsystem` شد؛ `core/designsystem/build.gradle.kts` با قرارداد ماژول‌های core (AGP 9.4.0 library + compose compiler، compileSdk 37، minSdk 24، JDK 17، api compose-bom/ui/material3) ساخته شد؛ `verify-android-foundation.mjs` اکنون ۵ ماژول را الزام می‌کند؛ `"apps/android/settings.gradle.kts"` و `"scripts/verify-android-foundation.mjs"` با مجوز مالک به N03.allowedPaths افزوده شدند.
- N03-02: `ShomaraTheme.kt` — نگاشت slot-by-slot colorScheme از ShomaraTokens، پنج سبک تایپوگرافی v2 (وزن/اندازه/ارتفاع خط از token)، پنج tier شعاع، specهای clay چهار سطحی با جفت‌رنگ ثابتِ note توکن، و CompositionLocalهای جهت (پیش‌فرض RTL رابط؛ LTR صریح برای ریاضی طبق MASTER §6). صفر magic value. Vazirmatn: بدون فایل فونت در repo و با ممنوعیت دانلود (L10)، خانواده موقتاً `FontFamily.Default` است — ورودی باز مالک.
- evidence: `./gradlew :core:designsystem:test :core:designsystem:lint` = BUILD SUCCESSFUL (۷/۷ تست)؛ `npm run android:gate` = PASS؛ TOKEN_DRIFT PASS؛ verify-android-foundation PASS (۵ ماژول)؛ کل سوئیت: static 87/87، typecheck 9/9، vitest 68 فایل/۵۲۰ تست، verify:repository ۵۳۰ فایل/۱۸۲۶ یال.
- boundary: هیچ UI صفحه‌ای (U1+) شروع نشد؛ N03-03 دست نخورد؛ تغییرات N03-02 کامیت نشدند (DIFF_READY برای بازبینی مالک).

## 2026-10-31 — Stage 4D+ / MEGA N03 — M2: N03-03 Button/Input/OTP — atomic commit

- subagent repair (Action 0.1): هر پنج تعریف (`~/.zcode/agents/shomara-native-engineer.md` + چهار فایل پروژه) به `model: inherit` نرمال و کلیدهای unsupported (thoughtLevel/color/injectAgentsMd) حذف شدند. تست پرتاب (Action 0.2): هر تلاش با خطای provider-side «request has been blocked due to unusual activity» مسدود ماند (یکسان در agentهای مختلف) → کل پروتکل audit→implement→audit مستقیم و مستند اجرا شد.
- N03-03: `ShomaraButton` (۵ حالت، ۳ واریانت، ShomaraTapGuard برای جلوگیری از tap تکراری، ارتفاع ثابت در loading، کاهش depth در pressed)، `ShomaraTextField` (۶ حالت با اولویت قطعی، label پایدار، خطای متنی فارسی actionable، جهت متن LTR برای عدد/تلفن)، `ShomaraOtpInput` (پیشرفت رقم LTR با index، پر شدن سقف‌دار بدون overwrite، backspace، label TalkBack رقمی). همه فقط از ShomaraTokens تغذیه می‌شوند.
- foundation 1.12 note: BasicTextField قدیمی (value-based) حذف شده؛ مسیر state-owning `rememberTextFieldState` استفاده شد؛ `KeyboardOptions` در `androidx.compose.foundation.text` است.
- evidence: module test/lint BUILD SUCCESSFUL؛ ۷ (theme) + ۱۴ (primitives) تست JVM؛ هیچ verifier تضعیف نشد.

## 2026-10-31 — MEGA N03 — M3: N03-04 Card/Choice/Feedback/Progress — atomic commit

- `ShomaraCard`/`ShomaraChoiceTile`: ۷ حالت (default/pressed/selected/checked/correct/retry/disabled)، کاهش depth در pressed، جفت‌رنگ گرم توکن برای درست/دوباره، حامل غیررنگی (label فارسی + mark) برای همهٔ وضعیت‌های status دار، انتخاب تکی idempotent، قاعدهٔ «حداکثر یک featured».
- `ShomaraFeedbackBanner`: چهار kind با ارتفاع ثابت و متن‌های پیش‌فرض گرم هم‌راستا با خطوط تأییدشدهٔ شخصیت‌ها (تست، عدم وجود واژهٔ تنبیهی را الزام می‌کند).
- `ShomaraProgressBar`: چهار حالت، reducedMotion فقط انیمیشن indeterminate را می‌بندد، آگهی Persian قطعی با toFa، رندر verbatim وضعیت سرور (بدون حدس mastery).
- evidence: module test/lint BUILD SUCCESSFUL (۳۲/۳۲ JVM)؛ هیچ گیت تضعیف نشد.

## 2026-10-31 — MEGA N03 — M4: N03-05 Navigation/Dialog/Audio — atomic commit

- `ShomaraTabBar`/`ShomaraTopBar`: قرارداد سه تب canonical کودک (مسیر/تمرین/من) با تست سخت‌گیرانه (ترتیب + نبود تب والدین)؛ تب قفل خودش را «قفل + دلیل» اعلام می‌کند؛ جلوگیری از navigation تکراری با همان TapGuard؛ Back فقط وقتی واقعی است؛ badge-free.
- `ShomaraDialog`/`ShomaraBottomSheet`: خط‌مشی dismiss fail-closed (busy یا غیرقابل‌بستن، back سیستم را هم می‌بندد)، خطا پنجره را باز نگه می‌دارد و با liveRegion polite اعلام می‌شود؛ sheet همان خط‌مشی را دارد.
- `ShomaraAudioControl`: شش حالت با action map؛ fallback متنی فارسی اجباری برای unavailable/failed؛ قرارداد ثابت `isContentLocked=false` برای همهٔ حالت‌ها (تست‌شده) — درس هرگز پشت صوت قفل نمی‌شود.
- evidence: module test/lint BUILD SUCCESSFUL (۴۲/۴۲ JVM)؛ هیچ گیت تضعیف نشد.

## 2026-10-31 — MEGA N03 — M5: N03-08 manipulativeهای آموزشی — atomic commit

- توکن‌سازی باند: `v2.component.manipulativeMin=72` و `manipulativeMax=80` به tokens.json اضافه و از مسیر codegen (N03-01) تولید شد — باند AGENTS §6 اکنون دادهٔ canonical است، نه عدد جادویی؛ drift gate PASS.
- `ShomaraNumberTile`/`ShomaraCountersGrid`/`ShomaraEquationSlot`/`ShomaraManipulativeSession`: جایگزین کامل tap-to-select/tap-to-place در کنار drag (هر دو معادل)، tiles قفل از هر دو مسیر بی‌اعتنا می‌شوند، وضعیت retry گرم و با حامل غیررنگی، هندسهٔ ریاضی با CompositionLocal اجباراً LTR مستقل از جهت رابط، toleranceها با default توکن‌مشتق و override تماس‌گیرنده.
- audio replay/missing قبلاً در N03-05 پوشش داده شد (ارجاع در evidence).
- evidence: module test/lint BUILD SUCCESSFUL (۵۲/۵۲ JVM)؛ هیچ گیت تضعیف نشد.

## 2026-10-31 — MEGA N03 — M6: N03-06 catalog + N03-07 gate + بستن فاز N03 — atomic commit (DIFF_READY)

- `ShomaraDesignSystemCatalog`: fixture قطعی light theme برای هر ۹ خانواده (RTL رابط + LTR ریاضی)؛ ماتریس ۳۶۰/۳۹۰/۴۱۲ × font scale 1/2 با تست JVM (۴ تست؛ مجموع ماژول ۵۶/۵۶). Screenshot واقعی صادقانه NATIVE_PENDING ماند (Paparazzi در cache آفلاین موجود نبود؛ افزودن plugin تصمیم مالک است).
- `scripts/verify-design-system-native.mjs`: گیت صفر raw token (hex/dp/sp/FontWeight خارج از ShomaraTokens.kt) روی :core:designsystem و :app + ممنوعه‌های ایمنی کودک؛ اولین اجرا دو literal خام در FoundationScreen.kt (placeholder N02) گرفت که توکنیزه شد و `:app` به `:core:designsystem` وابسته شد؛ PASS (۱۸ فایل Kotlin).
- ثبت صادقانه: `docs/design/NATIVE_COMPONENT_READINESS_N03.md` — جدول ۹ خانواده با تفکیک JVM/semantics/catalog از screenshot/device.
- closure: N03-06 = DONE؛ N03-07 = DONE_WITH_BLOCKER (HG-02 امضای مالک + شواهد device/paparazzi)؛ فاز N03 = DONE_WITH_BLOCKER (8/8)؛ harness next = N04-01.
- boundary: هیچ commit برای این milestone انجام نشد (DIFF_READY)؛ N04 شروع نشد.

## 2026-10-31 — HG-02 owner sign-off؛ بستن نهایی N03 — commit

- HG-02 با دستور مستقیم مالک (goal نشست: «Commit N03-06/07 with owner HG-02 sign-off») به APPROVED رسید؛ N03-07 → DONE و فاز N03 → DONE (8/8). screenshot/device روی Path/Auth/Lesson همچنان NATIVE_PENDING و در readiness doc پیگیری می‌شود.

## 2026-10-31 — N04 شروع — M1: commit N03-06/07 با HG-02 + N04-01 — atomic commit

- commit `3f6dd69`: بستهٔ N03-06/07 (catalog، verifier صفر-raw-token، readiness doc) با امضای HG-02 (دستور مستقیم مالک)؛ N03-07 → DONE؛ فاز N03 → DONE (8/8)؛ شاخهٔ `native/n04-auth-onboarding` ساخته شد.
- N04-01: سه ماژول واقعی Gradle (:core:network/:core:datastore/:feature:onboarding) با کتابخانه‌های pinned (datastore 1.1.1، okhttp+mockwebserver 4.12.0، coroutines 1.8.1)؛ قرارداد حالت/مسیر onboarding با reducer خالص و تست؛ `GuestEntryAllowed=false`؛ restore fail-closed. verify-android-foundation اکنون ۸ ماژول الزام می‌کند و سیاست app→feature:onboarding را چک می‌کند؛ design guard شاخهٔ feature را هم اسکن می‌کند.
- boundary: هیچ صفحهٔ UI رندر نشد (قرارداد خالص)؛ connectedCheck به فاز دارای device موکول و صادقانه ثبت می‌شود.

## 2026-10-31 — N04 — M2: N04-02 Welcome/Phone — atomic commit

- `ShomaraPhoneLogic` (ارقام فارسی/عربی، پیشوندهای 0098/+98/98/0، جداکننده‌ها، فرم canonical 09XXXXXXXXX) و `ShomaraBackLogic` (نقشهٔ back هر گام)؛ صفحات Welcome/Phone فقط از primitiveهای design system ساخته شدند (field عددی LTR، CTA gated).
- evidence: module test/lint BUILD SUCCESSFUL (۱۳/۱۳).

## 2026-10-31 — N04 — M3: N04-03 OTP request/verify + secure storage — atomic commit

- `ShomaraOtpApi` (OkHttp واقعی؛ endpoint تزریقی در runtime، بدون URL در repo طبق L10)؛ همهٔ مسیرهای منفی با MockWebServer: 429+Retry-After، 400، 5xx، timeout، connection-refused (offline)، endpoint پیکربندی‌نشده = fail-closed بدون هیچ فراخوانی شبکه.
- `ShomaraOtpThrottle`: cooldown محلی، احترام به Retry-After با cap، escalation محدود روی 429.
- `PreferencesTokenStore` (DataStore واقعی، تست file-backed روی JVM) + `ShomaraAuthSession`: ذخیرهٔ توکن فقط با verify موفق؛ restore fail-closed (missing/rejected → پاک‌سازی فوری؛ offline → نگه‌داشت برای تلاش بعدی)؛ signOut همیشه پاک می‌کند.
- evidence: سه ماژول test+lint = BUILD SUCCESSFUL؛ ۱۱+۶+۲۲ = ۳۹ تست، صفر شکست.

## 2026-10-31 — N04 — M4: N04-04 Profile/placement — atomic commit

- `ShomaraProfileDraft`/`ShomaraProfileSaveState`/`ShomaraPlacementState`: draft ناقص غیرقابل‌ارسال، retry گرم چندمرحله‌ای با حفظ ورودی و پیام Persian قطعی، placement صرفاً رندر تصمیم سرور (skip و تصمیم سرور با ساختار mutually exclusive)، پایهٔ G1-only canonical.
- evidence: module test/lint BUILD SUCCESSFUL (۲۸/۲۸ feature tests).

## 2026-10-31 — N04 — M5: N04-05 Session expiry/restore — atomic commit

- `ShomaraSessionExpiry` (TTL هم‌راستا با پنجرهٔ restore؛ timestamp مفقود = منقضی) + `AuthSession.ensureUnexpired` (session منقضی قبل از هر استفادهٔ کودک‌روی تخریب و secret پاک می‌شود) + `ShomaraAuthGate` (تصمیم خالص سطح: ChildShell/OnboardingRestoring/OnboardingNew در هر ۴ ترکیب).
- evidence: module test/lint BUILD SUCCESSFUL (۳۲/۳۲ feature tests).

## 2026-10-31 — N04 — M6: N04-06/07 + بستن فاز N04 — atomic commit (DIFF_READY)

- N04-06: قرارداد traversal هر گام (ترتیب TalkBack در ترتیب اعلان؛ عنوان اول، اکشن آخر، برچسب‌های گرم) با تست؛ اعداد cellهای OTP با ارقام فارسی و ترتیب LTR سخت. Screenshot واقعی NATIVE_PENDING (پروتکل N03).
- N04-07: مسیر launch واقعی — NavHost با startDestination ONBOARDING + deep link، گام‌های منطقی به routeهای واقعی mirror می‌شوند، ورود موفق → FOUNDATION با popUpTo inclusive؛ AppContainer دارای DataStore context-scoped و endpoint تزریقی (null تا backend؛ fail-closed)؛ journey tests: happy path با HTTP واقعی (400 سپس 200)، گیت draft ناقص، throttle بدون فراخوانی شبکه، offline بدون ذخیرهٔ secret؛ back با پاک‌سازی OTP.
- connectedCheck اجرا نشد (بدون AVD روی این ماشین) — ثبت صادقانه؛ evidence دستگاه در فاز بعد.
- closure: N04-06/07 DONE؛ فاز N04 DONE (7/7)؛ pointer → N04-07؛ harness next = N05-01.

## 2026-10-31 — MEGA-STAGE N04 close-out — deltas beyond the completed phase — atomic commit (DIFF_READY)

- audit: هدف تکراری بود؛ همهٔ اقلام اصلی (HG-02، ۷ task، سه ماژول، APK، 88/88) قبلاً انجام و commit شده بودند؛ فقط دلتاهای واقعی اجرا شد.
- module graph: `docs/architecture/ANDROID_MODULE_GRAPH.md` به گرام N04 (۸ ماژول + مرزها) به‌روز شد؛ allowedPaths آن سند + `core:model/**` را مجاز کرد.
- `:core:model`: `ShomaraLaunchState` (UI-001: Resolving/NewUser/RestoringSession/RecoverIncompleteProfile/Offline/Error)، `ShomaraGradeCatalog` (G1..G6 آینه‌ی contracts؛ G2+ قفل با توضیح گرم «به‌زودی»)، `ShomaraAvatarCatalog` (sun/leaf/cloud/moon) — آینه‌ی `packages/contracts/src/onboarding.ts`.
- `:feature:onboarding`: نگه‌داشت launch→mode (fail-closed)، `ShomaraFlowUiState` (FirstRun/Resume/Back/Saving/Error)، OTP paste (`fillFromCode` LTR سقف‌دار) + حالت Expired با برچسب گرم (پاک‌شدن در ورود بعدی)، انتخاب آواتار، resume draft با DataStore واقعی (`PreferencesProfileDraftStore`) و `OnboardingRoutes.stepFor` برای process-death؛ host و app به draftStore وصل شدند.
- guard: `verify-design-system-native.mjs` اکنون کل `apps/android/feature` (منابع production، بدون src/test) را اسکن می‌کند — PASS (۲۶ فایل).
- readiness: `docs/product/ONBOARDING_JOURNEY_READINESS_N04.md` با تفکیک صادقانهٔ اثبات‌شده/NATIVE_PENDING.
- evidence: feature 50 + model 2 + designsystem 56 تست JVM سبز؛ `:app:compileDebugKotlin` PASS.

## 2026-11-01 — N05 شروع — M1/M2: wiring + N05-01 child shell — atomic commit

- branch: `native/n05-child-shell` ساخته شد؛ پنج ماژول واقعی (:feature:path/practice/profile/settings/parent) به Gradle و verify-android-foundation (۱۳ ماژول) اضافه شد؛ allowedPaths شامل settings/core:model/verifierها/docs طبق الگوی مجاز مالک.
- N05-01: shell سه‌تب در `:app` (خانوادهٔ ۱۷): NavHost با saveState/restoreState برای هر تب (حفظ واقعی state)، re-select no-op، Back قطعی (تب غیرپیش‌فرض → مسیر؛ پیش‌فرض → خروج)، deep link هر تب؛ احراز موفق اکنون به SHELL می‌رود. تست ۴ موردی JVM.
- N05-09 data foundation: `ShomaraStationCatalog` (ST01–ST25 با workingTitle از stations-index.json، IDs ثابت CONTENT-004، پرچم provisional) + `ShomaraChapterCatalog` (۵ فصل × ۵ ایستگاه، برچسب ساختاری «فصل ۱..۵» بدون ادعای نام کتاب).

## 2026-11-01 — N05 — M3: N05-02 path graph + N05-09 metadata — atomic commit

- `ShomaraPathGraphLogic`: stateها فقط از progress ارائه‌شده (سرور)؛ دقیقاً یک Current؛ perfect⇒completed در ساخت؛ offline → Lock + بنر بازیابی؛ گره‌های قفل تپ‌پذیر (توضیح، نه بن‌بست)؛ برچسب فارسی صریح برای همهٔ وضعیت‌ها (TalkBack truth)؛ restore-scroll.
- N05-09: ۲۵ ID ثابت ST01..ST25 از stations-index.json؛ عنوان‌ها provisional؛ برچسب ساختاری «فصل ۱..۵» — CONTENT-004 برای UI بسته شد بدون هیچ ادعای حل‌نشده؛ تغییر نام نهایی مالک ورودی غیرمسدودساز ماند.
- evidence: path 9/9 + model 2/2 تست JVM؛ lint سبز.

## 2026-11-01 — N05 — M4: N05-03 station start + jump sheet — atomic commit

- `ShomaraStationStartSheet` (۷ حالت، CTA واحد با برچسب قطعی، توضیح گرم قفل، metadata واقعی کاتالوگ) + `ShomaraJumpSheet` (پرش فقط داخل فصل، قفل/آفلاین/خطا confirm را می‌بندد، انتخاب idempotent). شیت‌ها آیندهٔ اتصال به learning-player (N06) را از طریق onStart باز می‌گذارند.
- evidence: path 16/16 تست JVM؛ lint سبز.

## 2026-11-01 — N05 — M5: N05-04 practice hub — atomic commit

- `ShomaraPracticeHubScreen`/`ShomaraPracticeHubLogic`: هفت حالت؛ recommended/history verbatim از دادهٔ تماس‌گیرنده (هیچ دادهٔ ساختگی)؛ empty گرم به سمت مسیر؛ ردیف قفل با دلیل گرم و TalkBack؛ صفر اقتصاد/ستاره.
- evidence: practice 6/6 تست JVM؛ lint سبز.

## 2026-11-01 — N05 — M6: N05-05 profile/avatar/settings — atomic commit

- `:feature:profile` Me (خانوادهٔ ۱۴): facts واقعی (نام + پیشرفت با ارقام فارسی)، حالت‌ها با تست، صفر سطح جعلی (تست سطح field). `:feature:settings` (خانوادهٔ ۱۵): گرید آواتار canonical با equipped/owned، toggle حرکت کمتر، lifecycle ذخیره با revert در شکست.
- evidence: profile 4/4 + settings 7/7 تست JVM؛ lint سبز.

## 2026-11-01 — N05 — M7: N05-06 parent boundary — atomic commit

- `ShomaraParentGate`: reducer با fail-closed (نبود verifier = ورود ناممکن)، lockout سه‌مرحله‌ای با cooldown، ورود مجدد وقتی Authenticated بی‌اثر. `ShomaraParentSurfaceContract`: فقط progress-report/settings/sign-out — درس/تمرین/شروع ایستگاه ساختاراً رد می‌شوند؛ تب والدین در shell کودک وجود ندارد (ورود فقط از Me → دروازه).
- evidence: parent 7/7 تست JVM؛ lint سبز.

## 2026-11-01 — N05 — M8: N05-07 responsive/a11y matrix — atomic commit

- `ShomaraShellMatrixTest`: ماتریس ۳۶۰/۳۹۰/۴۱۲ × 1.0/2.0 روی هفت سطح shell؛ برچسب فصل در باند ۳۶۰؛ ارقام OTP فارسی LTR؛ CTA واحد؛ parent خارج از تب‌های کودک. Shell host اکنون سطح‌های واقعی path/practice/me/settings/parent را رندر می‌کند.
- evidence: app 12/12 تست JVM.

## 2026-11-01 — N05 — M9: N05-08 journey gate + بستن فاز N05 — atomic commit

- `ShomaraShellJourneyTest`: cold start → تب پیش‌فرض؛ warm resume → تب دقیق ذخیره‌شده + round-trip SHELL در NavigationSnapshot؛ deep link درست و رد لینک والدین؛ Back journey قطعی (Me→مسیر→خروج)؛ tab switch بدون duplicate. احراز موفق اکنون روی SHELL فرود می‌آید (مهاجرت launch کامل).
- closure: N05-08 DONE؛ فاز N05 DONE (9/9)؛ pointer → N05-08؛ harness next = N06-01.
- boundary: هیچ commit پس از این برای فاز N05 لازم نیست؛ screenshot/device/connectedCheck همچنان NATIVE_PENDING (پروتکل readiness).
- correction: دو closure (N05-02/N05-09) به‌دلیل جاافتادن write در اسکریپت M3 در roadmap.json ثبت نشده بودند؛ اکنون با همان evidence اعمال و validate شد (START_HERE از ابتدا درست بود).
- correction 2: replace اولیهٔ الگوی feature-dependency در verify-android-foundation.mjs بی‌صدا اعمال نشده بود؛ اکنون شش feature مجاز (onboarding/path/practice/profile/settings/parent) و هنوز :data: ممنوع — PASS (۱۳ ماژول).

## 2026-11-01 — N06 شروع — M1: wiring + N06-01/09/11 — atomic commit

- branch: `native/n06-learning-player`؛ `:feature:lesson` چهاردهمین ماژول Gradle (compose + okhttp/mockwebserver test deps)؛ allowedPaths با مجوز مالک گسترش یافت (originals دست‌نخورده).
- N06-01/09/11: مرز سه‌لایه‌ای در `packages/contracts/src/content-projection.ts` (lifecycleهای ۷مرحله‌ای، ۴ نقش بازبینی، DAG validator، hint-ban P4/P5، deep-stripping projectors، behaviorId typed، telemetry حداقلی) + آینهٔ Kotlin `:core:model/ContentProjection.kt`. ۱۳ Vitest + ۸ JUnit سبز.
- boundary: `content-library/originals/**` byte-protected و لمس نشد.

## 2026-11-01 — N06 — M2: N06-02/03 chrome + checkpoint + teach/guided — atomic commit

- `LessonCheckpointStore` (DataStore واقعی، کلید session|station، پاک‌سازی فقط با تکمیل سروری) + `ShomaraLessonChromeLogic` (progress سرور-محور + close confirm fail-safe) + P1 teach (صوت هرگز مسدود نیست) + P2/P3 guided (submit ساختاراً تکی؛ نتیجه فقط سرور؛ hint محدود).
- evidence: lesson 8/8 تست JVM.

## 2026-11-01 — N06 — M3: N06-04/05/06 assessment/result/challenge — atomic commit

- `LessonGateway` (Idempotency-Key قطعی، replay→Duplicate، MockWebServer: 201/200/400/timeout/offline) + `ShomaraAssessmentSession` (P4/P5 فقط؛ صفر hint؛ duplicate-tap ساختاری بسته؛ disconnect→resume با همان key) + `ShomaraResultLogic` (next action verbatim؛ کپی گرم) + `ShomaraChallengeSession` (جدا از mastery با تست reflection؛ timer غیرتنبیهی + reducedMotion).
- evidence: lesson 23/23 تست JVM.

## 2026-11-01 — N06 — M4: N06-10 adapters T01/T05/T13/T15 — atomic commit

- چهار adapter خالص: T01 (شمارش با باند ۷۲–۸۰ و taught-numeral guard)، T05 (drag و tap-درخت هم‌نتیجه)، T13 (خط کرسing بالابه‌پایین برای ۱ + tolerance سروری ۲۸dp + fallback تپ با همان تکمیل)، T15 (صوت EXPECTED_NEVER_BLOCKING با fallback متنی؛ telemetry حداقلی P5).
- evidence: lesson 32/32 تست JVM.

## 2026-11-01 — N06 — M5: N06-07/08 + بستن فاز N06 — atomic commit

- N06-07: ماتریس player (۳ عرض × دو font scale × ۴ حالت) با آگهی Persian قطعی.
- N06-08: سفر E2E دروازهٔ ST07 (P1→P5 با HTTP واقعی، قطع ۵۰۳ میانه، checkpoint + resume دقیق با FIFO idempotency assertions)، `nonProductionDraft=true`/`STAGED_PILOT` ثابت و رد در production، ۸ disposition CONTENT در source-audit.json (originals byte-protected)، readiness doc در docs/product.
- :app: LESSON destination با deep link؛ شروع ایستگاه از مسیر → lesson → بازگشت به shell؛ gateway/checkpoints از AppContainer.
- closure: N06-07/08 DONE؛ فاز N06 DONE (11/11)؛ pointer → N06-08؛ next = N07-01.
- correction 2: `ShomaraAssessmentResultChallenge.kt` comment contained banned token stars → بازنویسی شد؛ `verify-android-foundation` اکنون فایل‌های boundary-guard (ContentProjection.kt که خودش answerKey را ممنوع می‌کند) از forbidden-scan مستثنا می‌کند و feature allowlist شامل lesson شد.

## 2026-11-01 — N07 شروع — M1: wiring + N07-01 — atomic commit

- branch: `native/n07-offline-content`؛ ماژول‌های `:core:database` و `:sync` سیم‌کشی شدند (verifier ۱۶ ماژول).
- N07-01: ۴ جدول محلی + migration engine (v1→v2 حفظ کامل؛ downgrade/corrupt fail-closed) + رد فیلدهای ممنوعه قبل از persistence (CONTENT-008).
- evidence: database 6/6 تست JVM.

## 2026-11-01 — N07 — M2: N07-02 sync queue + N07-03 atomic manifest — atomic commit

- `OutboxSyncEngine`: FIFO، backoff نمایی با jitter و cap، توقف روی اولین خطای retriable، قرنطینه فوری 4xx، Server-Wins (reconcile به پاسخ سرور). `ManifestActivationEngine`: SHA-256 + schema gate قبل از هر write؛ mismatch/unsupported/contaminated → rollback با حفظ نسخه فعال.
- evidence: sync 12/12 تست JVM (6 sync engine + 6 manifest).

## 2026-11-01 — N07 — M3: N07-04/05/08/09 audio cache + CMS governance — atomic commit

- N07-04: `ShomaraAudioCacheManager` — SHA-256 gate برای ReadyCached؛ خراب → قرنطینه؛ مفقود → fallback متنی؛ هیچ URL hardcoded.
- N07-05/09: `cms-audio.ts` — تفکیک AudioScriptMetadata/AudioAssetVersion؛ RBAC پنج‌نقشی + audit trail؛ LISTEN_REVIEW_REQUIRED؛ reversible publish/rollback با checksum؛ reports impact/orphan/missing.
- N07-08: importer idempotent ۲۳۲ ردیف (۱۷۹+۵۳) با قفل DRAFT/UNPUBLISHED_NO_BINARY — TS + Kotlin mirror.
- HG-03: APPROVED با دستور مستقیم مالک. CONTENT-006/010/013 در source-audit.json ثبت شد.
- evidence: lesson 42/42 + database 11/11 + 9 Vitest.

## 2026-11-01 — N07 — M4: N07-06/07 + بستن فاز N07 — atomic commit

- `OfflineJourneyTest`: سفر بحرانی کامل (manifest کش‌شده → آفلاین → process death → restore → drain idempotent با همان key → Server-Wins به COMPLETED) + قرنطینه SHA-256 خراب برای manifest و باینری صوت.
- :app به :core:database و :sync وصل شد (AppContainer: localDatabase + outboxSyncEngine؛ transport تا I2 retriable). module graph به N07 (۱۶ ماژول) به‌روز شد.
- readiness در `docs/content/OFFLINE_CMS_AUDIO_READINESS_N07.md`. closure: فاز N07 DONE (9/9)؛ pointer → N07-07؛ next = N08-01.

## 2026-11-03 — N08 شروع — M1: تثبیت کار نیمه‌کارهٔ N08-08 + رفع دو شکست گیت — atomic commit

- branch: `native/n08-ux-completion`؛ کار نیمه‌کارهٔ untracked قبلی (dispositions.ts + ویرایش roadmap) کامل و صادقانه بازسازی شد.
- N08-08: ledger کامل ۱۸ disposition در `packages/content-delivery/src/dispositions.ts` — ۱۴ مورد بسته با evidence ثبت‌شدهٔ n06/n07/N08، ۴ مورد (CONTENT-005/006/007/016) صادقانه `OWNER_DECISION_PENDING` با guard کدی موجود؛ `OPEN_OWNER_DECISIONS` صریح؛ `allDispositionsClosed()` تا تصمیم مالک false می‌ماند. originals دست‌نخورده.
- N08-12 (پیش‌زمینه): `CALIBRATION_V1` نسخه‌دار (idleReplay ۸۰۰۰ms، traceTolerance 28dp، transitions 250/350/450ms، rate −15٪، mastery 3/4، T08 cap 6) + `applyCalibration` رد نزول نسخه + `rollbackCalibration` + gateهای `t08GridAllowed`/`st23`/`st25`. device-tested calibration به N08-06/07 موکول است.
- export از index.ts بستهٔ content-delivery؛ ۱۲ تست جدید (`dispositions.test.ts`) — مجموع پکیج ۲۱/۲۱.
- `content-library/derived/source-audit.json`: `n08Resolutions` ثبت شد (recordedAt 2026-11-03، originalsTouched=false، openOwnerDecisions صریح).
- bugfix: `scripts/verify-phase5.mjs` وابستگی به `grep` سیستم (ENOENT روی ویندوز بدون Git usr/bin) با اسکن معادل Node جایگزین شد — همان scope/exclude/case-insensitivity، بدون تضعیف شدت.
- hygiene: `harness/dependency-map.json` بازتولید شد (۵۳۷ فایل، ۱۸۳۸ یال)؛ roadmap updatedAt=2026-11-03 و currentTask=N08-08 با status IN_PROGRESS + blocker صریح؛ START_HERE فیلدهای yaml به N08 به‌روز شد (file_version 48).
- gates: vitest 554/554 PASS؛ `verify:static:all` **88/88 PASS** (قبلاً 86/88 به‌دلیل grep ENOENT + dependency drift)؛ `verify:repository` PASS؛ `verify:content-library` PASS؛ harness VALID.
- blocker: چهار تصمیم مالک باز (بستهٔ خنثی/فرهنگی، صدای راوی نهایی، پیش‌فرض haptics، scope نهایی T08/ST23/ST25) — قبل از N08-09 (تولید انبوه ۲۴ ایستگاه) لازم است.

## 2026-11-03 — N08 — M2: N08-13 پنل CMS صوت ادمین (وب) + ثبت جهت مالک — atomic commit

- تصمیم مالک ثبت شد: مدیریت صوت‌ها از پنل CMS وب (CONTENT-006 در dispositions + n08Resolutions به‌روز؛ انتخاب نهایی صدای راوی با شنیدن نمونه در پنل).
- roadmap: task N08-13 اضافه شد (dependsOn N07-09)؛ allowedPaths فاز N08 با apps/web/** و supabase/migrations/** گسترش یافت؛ currentTask → N08-13.
- `apps/web/lib/admin-audio.ts`: adapter نازک روی هستهٔ governance تست‌شدهٔ cms-audio (RBAC پنج‌نقشی، LISTEN_REVIEW_REQUIRED، checksum، reports)؛ seed idempotent ۲۳۲ ردیف DRAFT از CSVهای byte-protected (فقط خواندن)؛ production fail-closed (AUDIO_ADMIN_BACKEND_NOT_CONFIGURED).
- ۶ API route زیر `apps/web/app/api/v1/admin/audio/`: scripts list/filter، detail + تاریخچهٔ متن، PATCH ویرایش text_display/text_tts، upload binary (اعتبارسنجی SHA-256/duration؛ رد binary جعلی)، transition با RBAC، rollback ادمین، reports. همه با `requireRequestAccountPrincipal(request, 'ADMIN')`.
- `supabase/migrations/0074_audio_cms_tables.sql`: چهار جدول (scripts/script_versions/asset_versions/audit) + RLS (admin write، teacher read) + ایندکس‌ها. محتوای CSV در migration تکرار نشد (خطر drift) — seed از importer اجرا می‌شود. static guards: 74 migration PASS.
- `apps/web/app/admin/audio/page.tsx`: پنل فارسی RTL روی AdultRouteShell و tokenهای موجود — فیلتر/جست‌وجو، ویرایش دوگانهٔ متن، دکمه‌های گردش وضعیت، تاریخچهٔ audit، نوار گزارش‌ها (missing/impact/orphan)؛ stateهای loading/error/retry.
- evidence: Vitest جدید ۸/۸ (admin-audio.test.ts)؛ کل ۵۶۲/۵۶۲؛ static 88/88؛ repository PASS (۱۰۰ task، ۵۴۶ فایل، ۱۸۷۳ یال)؛ content PASS؛ typecheck وب clean؛ migration guards PASS.
- blocker: پیوست‌سازی production (الان in-memory با fail-closed)، تولید TTS واقعی نیازمند voice + credential مالک، تصمیم object storage برای آپلود.

## 2026-11-03 — N08 — M3: N08-13 کامل شد (DONE_WITH_BLOCKER) + شروع N08-01

- UI آپلود در پنل اضافه شد: checksum SHA-256 با crypto.subtle سمت مرورگر + مدت‌زمان از decode واقعی Audio metadata — هیچ متادیتای حدسی؛ فایل خالی رد می‌شود؛ دکمهٔ rollback در بلوک asset.
- N08-13 → DONE_WITH_BLOCKER: همهٔ ۶ بند acceptance با evidence ثبت شد؛ blocker صادقانه: persistence (in-memory fail-closed تا wiring Supabase — schema آماده در 0074)، bytes در object storage، TTS واقعی owner-gated.
- gates: vitest 562/562 · static 88/88 · typecheck web clean · harness VALID.
- next: N08-01 (Route/state ledger audit) — آغاز شد.

## 2026-11-03 — N08 — M4: N08-01 DONE (route/state ledger audit با verifier جدید)

- `scripts/verify-n08-01-ledger.mjs`: ممیزی ماشینی — همهٔ ۱۵ route اکسپو و ۱۶ صفحهٔ وب باید در SCREEN_LEDGER.csv طبقه‌بندی شده باشند و هر مسیر ledger واقعاً روی دیسک وجود داشته باشد (blocked روی drift).
- SCREEN_LEDGER.csv از ۲۱ به ۳۴ ردیف رسید: redirect ایستگاه (REDIRECT-ONLY)، جدایی placement از jump (jump با LEGACY-UNSTYLED و restyle در صف)، ۱۳ ردیف WEB-PARITY برای همهٔ صفحات وب (تا cutover فقط سطح مرجع/CMS)، admin/audio به‌عنوان ADMIN-CMS.
- state حدسی حذف شد: هر ردیف یا evidence تست دارد یا طبقه‌بندی صریح سطح (WEB-PARITY/ADMIN-CMS/REDIRECT-ONLY).
- N08-01 → DONE با evidence؛ currentTask → N08-02 (TalkBack/focus order — نیازمند device، احتمالاً NATIVE_PENDING صادقانه).
- gates: verify-n08-01 PASS · static 89/89 · vitest 562/562 · repository PASS (۱۰۰ task، ۵۴۷ فایل، ۱۸۷۵ یال).

## 2026-11-03 — N08 — M5: N08-02 بخش ماشینی (roles/states حقیقی)

- `apps/mobile/src/ui/a11yRoles.test.ts` (۲ تست): ممیزی ایستای همهٔ دایرکتوری‌های V2 — هر Pressable/Button2 باید accessibilityRole و accessibilityLabel داشته باشد؛ پوسته‌های focus-forwarding (role="none") معاف ولی CodeInput2 الان label هم دارد.
- forms.tsx: TextField2 وضعیت invalid را اعلام می‌کند (accessibilityState)؛ label روی پوستهٔ CodeInput2.
- N08-02 → IN_PROGRESS: بخش «roles/states حقیقی» ماشینی و سبز؛ «gesture path» (قدم‌زدن واقعی TalkBack روی دستگاه) صادقانه NATIVE_PENDING.
- gates: vitest 564/564 · static 89/89 · repository PASS (۵۴۸ فایل، ۱۸۷۸ یال) · harness VALID.

## 2026-11-04 — N08 — M6: N08-02 بسته شد با DONE_WITH_BLOCKER (تست‌های instrumented واقعی)

- مکان تست اصلاح شد: API تست Compose فقط برای variant اندروید resolve می‌شود؛ variantهای `jvmStubs` ماژول `ui-test` خالی منتشر می‌شوند، بنابراین `testImplementation` منجر به `Unresolved reference 'onNode'` می‌شد. تست‌ها به `androidTest` منتقل شدند — همان‌جا که واقعاً می‌توان semantics را assert کرد.
- `apps/android/core/designsystem/src/androidTest/kotlin/com/mathlearning/core/designsystem/ShomaraInteractiveSemanticsTest.kt` (جدید، ۱۰ تست): قرارداد ماشینی role/label/state/error/action برای همهٔ کنترل‌های تعاملی design system.
- دو باگ واقعی دسترسی‌پذیری با همین تست‌ها پیدا و رفع شد (نه آرایشی):
  1. `ShomaraButton`: `clickable` کامپوز حتی با `enabled=false` اکشن `OnClick` را به سرویس‌های دسترسی‌پذیری تبلیغ می‌کند. حالا حالت‌های Disabled/Loading اصلاً modifier `clickable` نمی‌گیرند و `semantics(mergeDescendants = true)` اعلام می‌شود تا TalkBack برچسب+وضعیت را یک گره بخواند.
  2. `ShomaraCard`: حالت Disabled نه `disabled()` داشت و نه کلیکش متوقف می‌شد. حالا `disabled()` + `semantics(mergeDescendants = true)` و `clickable(enabled = false)`.
- شاهد: `cd apps/android && ./gradlew :core:designsystem:connectedDebugAndroidTest -Dhttp.proxyHost= -Dhttps.proxyHost=` → BUILD SUCCESSFUL؛ نتیجه در `build/outputs/androidTest-results/connected/debug/TEST-Pixel_6a(AVD) - 15.xml`: `tests="10" failures="0" errors="0"` روی امولاتور واقعی Pixel_6a (Android 15).
- gateهای فاز N08 اجرا شد: `./gradlew test` SUCCESS · `./gradlew lint` SUCCESS · `./gradlew connectedCheck` SUCCESS (با امولاتور) · `git diff --check` exit 0 · `npm run android:gate` → ANDROID_BUILD: PASS.
- وابستگی تست جدید (قاعدهٔ ۱۱): `androidx.compose.ui:ui-test-junit4` و `:ui-test-manifest` به‌صورت `androidTestImplementation` در `apps/android/core/designsystem/build.gradle.kts` اضافه شدند و از version catalog + Compose BOM موجود resolve می‌شوند (alias جدید یا pin نسخه اضافه نشد). فقط تستی‌اند و در artifact اپ منتشر نمی‌شوند؛ به‌صورت گذرا `androidx.test:core:1.5.0` و `espresso-core:3.5.0` را می‌کشند (اکنون cache شده).
- N08-02 → DONE_WITH_BLOCKER: همهٔ معیارهای غیردستگاهی سبز؛ تنها «gesture path» واقعی (قدم‌زدن با TalkBack، اکتشاف سوایپ، فعال‌سازی با دوبار ضربه، تأیید شنیداری) باقی است که بدون سرویس TalkBack فعال روی دستگاه قابل اثبات نیست و ادعا هم نمی‌شود.
- gates: vitest 564/564 (۷۳ فایل) · static 89/89 · repository PASS (۱۰۰ task، ۵۹ ledger، ۱۸۷۸ یال) · content PASS · harness VALID (۱۰۰ task، ۱۱ فاز).

## 2026-11-04 — N08 — M7: پیش‌آماده‌سازی N08-03 (Font scale/RTL/math direction)

- ممیزی فقط‌خواندنی، بدون تغییر کد محصول. مبنای کار: `DeviceConfigurationOverride.FontScale` روی امولاتور واقعی.
- **نقص تأییدشده با اندازه‌گیری (نه حدس):** `ShomaraButton` ارتفاع ثابت `ComponentButtonH = 56.dp` دارد و `Text(maxLines = 1)`. با خواندن `TextLayoutResult` از طریق `SemanticsActions.GetTextLayoutResult`:
  - `scale=1.0` → `lines=1 height=97px line0bottom=97.0 didOverflowHeight=false`
  - `scale=2.0` → `lines=1 height=147px line0bottom=155.0 didOverflowHeight=TRUE`
  یعنی در بزرگ‌نمایی ۲۰۰٪ برچسب فارسی داخل جعبهٔ ۵۶dp بریده می‌شود. اندازه‌گیری مکمل: `getUnclippedBoundsInRoot` برای دکمه و برچسب هر دو ۵۶.۰dp در هر دو scale — یعنی جعبه ارتفاع را تعیین می‌کند و متن مجبور به جا شدن در آن است.
- سطح ریسک دوم: `ShomaraFeedback` هم `.height(ComponentProgressH)` دارد ولی متن ندارد (احتمالاً بی‌خطر)؛ `ShomaraNavigation`/`ShomaraTextField`/`ShomaraCard` از `defaultMinSize(minHeight=…)` استفاده می‌کنند و درست رشد می‌کنند. تنها ترکیب «.height ثابت + متن» در همهٔ ۵۸ فایل main همین `ShomaraButton` است.
- جهت‌دهی از قبل درست است: `ShomaraManipulativeRules.mathDirection()` همیشه `LayoutDirection.Ltr` برمی‌گرداند (هندسهٔ ریاضی هرگز آینه نمی‌شود)، `ShomaraOtp` برای ترتیب رقم Ltr را force می‌کند، `ShomaraTextField` برای `numericLtr` مقدار `TextDirection.Ltr` می‌دهد، و `ShomaraTheme` ریشه را Rtl می‌کند. تست JVM موجود «math direction is LTR independent of the interface direction» این را پوشش می‌دهد.
- کار لازم برای پذیرش N08-03 ثبت شد: (۱) جایگزینی ارتفاع ثابت دکمه با minHeight + padding عمودی تا برچسب در ۲۰۰٪ رشد کند (کف لمسی ۴۸dp و ۵۶dp به‌عنوان حداقل حفظ شود)؛ (۲) تصمیم مالک دربارهٔ سیاست `maxLines` (اجازهٔ ۲ خط یا ellipsis)؛ (۳) تست‌های instrumented که `didOverflowHeight=false` را در ۱۰۰٪ و ۲۰۰٪ برای button/card/textfield/OTP اثبات کنند؛ (۴) اثبات LTR ماندن هندسهٔ number-line/manipulative در ۲۰۰٪ زیر رابط RTL؛ (۵) اسکرین‌شات ۱۰۰٪/۲۰۰٪ برای ledger.
- وضعیت N08-03 همچنان `TODO` است؛ هیچ کد محصولی تغییر نکرد و هیچ ادعای پیشرفت ثبت نشد.

## 2026-11-04 — N08 — M8: N08-03 بسته شد (Font scale/RTL/math direction) با شاهد واقعی امولاتور

- **نقص اصلی رفع شد:** `ShomaraButton` از `.height(56.dp)` + `maxLines = 1` به `defaultMinSize(minHeight = ComponentButtonH)` + پدینگ عمودی `Space12` + بدون سقف خط + `textAlign = Center` تغییر کرد. `loadingHeight()` به `minHeight()` تغییر نام داد: ۵۶dp حالا **حداقل** است نه جعبهٔ ثابت.
- **سطح دوم و سوم که در ممیزی قبلی پیدا نشده بود:** `ShomaraOtp` یک رقم ۴۰sp را داخل `.size(48dp)` جا می‌داد؛ حالا `weight(1f)` + `defaultMinSize(48dp)` + پدینگ عمودی در یک Row با `fillMaxWidth()` — رقم عمودی رشد می‌کند و هرگز ردیف را از لبهٔ صفحه بیرون نمی‌برد. `ShomaraNumberTile` هم `.size(72..80dp)` دور برچسب ۴۰sp داشت → `defaultMinSize` + پدینگ.
- **`ShomaraTopBar` بازچینی شد:** عنوان در `Box` با `align(CenterStart/CenterEnd)` هم‌نشین بود و در متن بزرگ روی دکمهٔ بازگشت می‌افتاد. حالا `Row` با عنوان `weight(1f)` و جاهای رزروشدهٔ Back/trailing؛ نوار در ارتفاع رشد می‌کند.
- **P0 واقعی که ممیزی آماده‌سازی اشتباه گزارش کرده بود:** `ShomaraTheme` فقط `MaterialTheme` را صدا می‌زد و `LocalLayoutDirection` را هرگز provide نمی‌کرد. `android:supportsRtl="true"` فقط یعنی اپ جهت دستگاه را **محترم می‌شمارد**؛ محصول فارسی را RTL نمی‌کند. روی امولاتور en-US کل رابط LTR رندر می‌شد. حالا `ShomaraTheme` داخل `CompositionLocalProvider(LocalLayoutDirection = Rtl, LocalShomaraInterfaceDirection = Rtl, LocalShomaraMathDirection = Ltr)` پیچیده شده. ریاضی از طریق `ShomaraManipulativeRules.mathDirection` / `ShomaraEquationSlot` صریحاً LTR می‌ماند و هرگز جهت پوسته را به ارث نمی‌برد.
- **تست‌های جدید:** `apps/android/core/designsystem/src/androidTest/kotlin/com/mathlearning/core/designsystem/ShomaraFontScaleTest.kt` — ۱۶ تست instrumented. همه‌شان setContent را **یک بار** صدا می‌زنند و scale/label را با state می‌چرخانند (setContent دوباره روی همان Activity استثنا می‌دهد).
- **شاهد اصلی:** `cd apps/android && ./gradlew :core:designsystem:connectedDebugAndroidTest` → BUILD SUCCESSFUL، exit 0؛ در `build/outputs/androidTest-results/connected/debug/TEST-Pixel_6a(AVD) - 15.xml`: `tests="26" failures="0" errors="0"` (FontScaleTest ۱۶ + InteractiveSemanticsTest ۱۰) روی امولاتور واقعی Pixel_6a / Android 15.
- **Negative control A (اثبات غیرتوخالی بودن):** بازگرداندن موقت `.height(56.dp)` + `maxLines=1` دقیقاً ۳ تست را شکست: `button box must grow with the label: 100%=147 px, 200%=147 px` و `long label clipped at 200%`. سپس fix بازگردانده و سوئیت دوباره سبز شد.
- **Negative control B:** حذف موقت `CompositionLocalProvider` از `ShomaraTheme` تست‌های `themeProvidesRtlInterfaceDirectionRegardlessOfDeviceLocale` و `rtlShellDoesNotMirrorMathContent` را شکست. سپس بازگردانده شد.
- **تصمیم مالک دربارهٔ maxLines (که در آماده‌سازی باز مانده بود):** بدون ellipsis، بدون سقف خط. طبق قاعدهٔ «برچسب اقدام ضروری هرگز بریده نمی‌شود» (UI/UX Pro Max: Essential Text Truncation = Critical) برچسب اقدام آموزشی هرگز با ellipsis پنهان نمی‌شود؛ برچسب غیرعادی طولانی یک نقص محتواست که با ممیزی رشته گرفته می‌شود، نه چیزی که کامپوننت از چشم کودک پنهان کند.
- `./gradlew test` SUCCESS (designsystem unit 56/56) · `./gradlew lint` SUCCESS · `harness validate` HARNESS_VALID (۱۰۰ task، ۱۱ فاز).
- N08-03 → **DONE**. `harness next` → **N08-04** (Motion/haptic/reduced motion).
- ادعا نشده: اسکرین‌شات ۱۰۰٪/۲۰۰٪ برای `SCREEN_LEDGER` هنوز گرفته نشده؛ ۱۳۰٪/۱۵۰٪ فقط برای برش عمودی assert شده‌اند؛ gesture path واقعی TalkBack همچنان NATIVE_PENDING.

## 2026-11-04 — N08 — M9: N08-04 بسته شد + P0 «اپ باز نمی‌شد» رفع شد

**P0 که فقط با نصب APK پیدا شد.** تست‌ها همه سبز بودند، اما اپ روی دستگاه در همان فریم اول می‌مرد:

```
FATAL EXCEPTION: main
java.lang.IllegalArgumentException: Navigation destination that matches route
onboarding/welcome cannot be found in the navigation graph
```

علت: `ShomaraOnboardingHost` هر مرحلهٔ آنبوردینگ را به بالا گزارش می‌داد و اپ هر کدام را به
`navController.navigate(...)` تبدیل می‌کرد، در حالی که گراف فقط `onboarding` را ثبت کرده بود.
طبق `design/playbook/ROUTE_REGISTRY.md`، `onboarding` **یک** route است و مراحلش داخلی‌اند؛ پس
راه‌حل درست «ثبت پنج route قلابی» نبود، بلکه «navigate نکردن به مراحل» بود. یک گارد مکانیکی
(`AppNavigationRoutes.isRegistered`) و `RegisteredRoutesTest` (۶ assertion روی JVM) اضافه شد تا
این رگرسیون در `./gradlew test` بشکند، نه فقط وقتی کسی اپ را باز کند.

تأیید روی دستگاه: `am start` → pid 27130 زنده، `logcat -s AndroidRuntime:E` بدون FATAL،
و `uiautomator` صفحهٔ خوش‌آمد فارسی را نشان می‌دهد.

**N08-04 (reduced motion).** یافتهٔ مهم: در کل `apps/android` هیچ API انیمیشن Compose وجود
ندارد. تنها حرکت واقعی، indicator نامعین پیشرفت است که مثل هر infinite transition، تنظیم
animator سیستمی را نادیده می‌گیرد. پس کار «حذف انیمیشن» نبود؛ «واقعی کردن احترام به تنظیم» بود.

- `ShomaraMotionLogic`: دو سیگنال مستقل (انتخاب کودک **یا** `ANIMATOR_DURATION_SCALE == 0`) و
  یک resolver. تنظیم ناخوانا «خاموش» تلقی نمی‌شود تا حرکت بی‌دلیل قطع نشود. مدت‌ها از token
  می‌آیند و در حالت reduced به صفر (cut) تبدیل می‌شوند، نه به انیمیشن سریع‌تر.
- `ShomaraCelebrationGate`: قاعدهٔ «بدون celebration هم‌زمان» — celebration دوم اولی را لغو
  می‌کند و پایانِ کهنه نمی‌تواند جانشینش را پاک کند.
- reduced motion فقط **حرکت** را حذف می‌کند نه **اطلاعات**: fraction و پیام وضعیت فارسی می‌مانند.

**سطح ناقص بسته‌شده: پایداری تنظیمات قلابی بود.** صفحهٔ تنظیمات avatar/reducedMotion را در
`remember { mutableStateOf }` نگه می‌داشت و `onSave` تابع `startSave().onSaveSuccess()` را
صدا می‌زد؛ یعنی پیام «ذخیره شد.» نمایش می‌داد بدون اینکه چیزی نوشته شود. `PreferencesSettingsStore`
واقعی (DataStore، خواندن fail-closed، رد avatar ناشناس در نوشتن) اضافه شد، شل به آن وصل شد و
پارامتر **اجباری** شد تا حالت موفقیت قلابی برنگردد. `MainActivity` هم همان store را می‌خواند و
`reducedMotion` را به `ShomaraTheme` می‌دهد — پیش از این، آن toggle اصلاً نمی‌توانست اثری داشته باشد.

**شواهد:** `gradlew test`/`lint`/`connectedCheck` exit 0 (۳۰ تست instrumented روی Pixel_6a،
۷۰ تست واحد designsystem، ۱۱ تست datastore)؛ negative control روی `ShomaraProgressBar` دقیقاً
`indeterminateProgressStopsWhenReducedMotionIsOn` را شکست؛ `typecheck:all` exit 0؛
`vitest` ۵۶۴/۵۶۴؛ `verify:static:all` ۸۹/۸۹؛ `verify:content-library` PASS؛ harness VALID.

**APK:** `apps/android/app/build/outputs/apk/debug/app-debug.apk` — ۱۳٬۶۲۳٬۰۸۱ بایت،
sha256 `451359541d9dff53d748f3a7bf073181903c4703ffbd3ef5352509b9b7616815`؛ `adb install -r`
موفق و اجرا شد روی emulator-5554 (sdk_gphone64_x86_64 / Android 15 / API 35).

**شاهد واقعی font-scale برای N08-03** (از uiautomator، نه ادعای کد): در ۲۰۰٪ جعبهٔ دکمهٔ «ادامه»
از w=195/h=161 به w=261/h=219 پیکسل رشد می‌کند و متن بدنه به دو خط می‌شکند.

**باز مانده:** `CONTENT-007` (hapticsPolicy) هنوز تصمیم مالک است؛ هیچ haptic اضافه نشد.
خودِ حرکت celebration وجود ندارد (فقط gate آن). TalkBack gesture path همچنان NATIVE_PENDING.
`harness next` → **N08-05**.

## 2026-11-04 — N08 — M10: N08-05 بسته شد + P0 «همهٔ deep linkها مرده بودند»

**دومین P0 که فقط با اجرای واقعی روی دستگاه پیدا شد.** هیچ تستی آن را نمی‌گرفت چون تست‌ها گراف
ناوبری را روی دستگاه اجرا نمی‌کنند:

```
Error: Activity not started, unable to resolve Intent { act=VIEW
dat=mathlearning://lesson/... pkg=com.mathlearning.app }
```

علت: `ShomaraApp` برای `onboarding`/`shell`/`lesson/{stationId}` الگوی `navDeepLink` ثبت
می‌کرد، اما `AndroidManifest.xml` فقط `mathlearning://foundation` را اعلام کرده بود. Android
بقیه را در سطح OS رد می‌کرد. حالا هر چهار host اعلام شده‌اند و `DeepLinkManifestTest` خودِ
manifest واقعی را می‌خواند؛ negative control (حذف سه `<data>`) دقیقاً دو تست را شکست.

**BackHandler صفر بود.** هیچ `BackHandler` در کل `apps/android` وجود نداشت، پس back سیستمی
صفحهٔ درس را فوراً می‌بست، در حالی که دکمهٔ روی صفحه تأیید می‌گرفت — دو مسیر با رفتار متضاد.
حالا `ShomaraBackLogic` + `shomaraBackHandler` هست و روی دستگاه اثبات شد: bar اول می‌پرسد
(«آیا می‌خواهی از ایستگاه خارج شوی؟» با خروج/می‌مانم)، bar دوم سؤال را می‌بندد و کودک می‌ماند.

**سه نقص دیگر در lesson:**
- **tap سریع:** دکمهٔ ثبت پاسخ هیچ قفل in-flight نداشت و `submitCurrent` suspend است؛ یک
  double-tap می‌توانست دو پاسخ بفرستد. `ShomaraLessonSubmitGate` single-flight می‌کند و
  تست ثابت می‌کند ۲۵ tap صف‌شده فقط **یک** ارسال در جریان می‌سازد.
- **پاسخ قلابی:** هاست همیشه `choiceId = "opt-1"` می‌فرستاد (با دکمهٔ دیباگ «ثبت پاسخ نمونه»).
  حالا id از گزینهٔ واقعی می‌آید؛ وقتی projection سرور گزینه‌ای نداده، سطح پیام صادقانهٔ
  «گزینه‌های این تمرین هنوز از سرور نیامده‌اند» را نشان می‌دهد و چیزی نمی‌فرستد.
- **بن‌بست:** پیمایش مرحله با `coerceAtMost(lastIndex)` در مرحلهٔ آخر همان مرحله را **بی‌نهایت**
  تکرار می‌کرد. حالا `next` بعد از مرحلهٔ آخر `null` می‌دهد و وضعیت صادقانهٔ «منتظر تأیید
  سرور» نمایش داده می‌شود. negative control (برگرداندن clamp) دو تست را شکست.

**آزمون‌های روی دستگاه:** offline (airplane mode) → اپ باز شد، pid زنده، بدون FATAL. process death
(`am force-stop` سپس relaunch) → بدون FATAL. ۱۰ tap سریع روی CTA و backهای تکراری → pid پایدار.
deep link `mathlearning://lesson/ST07` → سطح درس رندر شد.

**وابستگی جدید (ثبت طبق قاعدهٔ ۱۱ AGENTS):** `core:designsystem` حالا
`androidx.activity:activity-compose` را برای BackHandler صادر می‌کند، همراه با pin کردن
core-ktx / lifecycle-runtime-compose / savedstate در `gradle/libs.versions.toml` (نسخه‌هایی که
پروژه از قبل با آن‌ها build می‌شود؛ activity-compose تنها، نسخه‌های قدیمی و uncached می‌کشید).

**شواهد:** `gradlew test lint connectedCheck` exit 0؛ ۱۳ تست جدید (lesson total 55)؛
`typecheck:all` 0؛ `vitest` ۵۶۴/۵۶۴؛ `verify:static:all` ۸۹/۸۹؛ `verify:content-library` PASS؛
harness VALID؛ `git diff --check` 0.

**APK نهایی:** `apps/android/app/build/outputs/apk/debug/app-debug.apk` — ۱۳٬۴۹۶٬۸۰۸ بایت،
sha256 `3063f2b57498ce3eb48fa2f63ea3f03958d43e1e96d240f338fdca98bcbf31a3`؛ نصب و اجرا روی
emulator-5554 (sdk_gphone64_x86_64 / Android 15 / API 35).

**وضعیت roadmap:** `node tools/harness.mjs next` → **«No executable task remains.»**
بقیهٔ N08 (۰۶..۱۲) به N08-08 وابسته‌اند که سه تصمیم محتوایی مالک را باز دارد
(CONTENT-005/006/007/016). این بن‌بست صادقانه ثبت شد، نه با ساختن task قلابی.

## 2026-11-04 — N08 — M11: ممیزی UI/UX Pro Max خانواده‌های صفحه + تکمیل سطوح ناقص + APK نهایی

- ممیزی کامل ۱۷ خانوادهٔ صفحه (design/MASTER, INSPIRATION_GUARDRAILS, PAGE_UIUX_BLUEPRINT, ROUTE_REGISTRY, NATIVE_IMPLEMENTATION_BACKLOG)؛ رکورد تصمیم در docs/qa/N08_UIUX_AUDIT_DECISION_RECORD.md.
- کشف اصلی: NATIVE_IMPLEMENTATION_BACKLOG.csv برای همهٔ ۲۰ ردیف blocked_by=N02-07 می‌گفت در حالی که N02-07 از 2026-10-31 DONE است؛ N02-07 از blocked_by حذف شد، status هیچ ردیفی عوض نشد (۲۰/۲۰ همچنان NATIVE_PENDING تا evidence خودشان).
- P0-P3 طبقه‌بندی شد: ۸ عدد P0 و ۷ عدد P1 (همه در M8/M9/M10 رفع شده بودند)، ۸ عدد P2 عمداً رفع‌نشده با دلیل، ۴ عدد P3 آرایشی.
- تمرین‌ها (خانوادهٔ 12): تب تمرین به جای emptyList() همیشگی، حالا از کاتالوگ واقعی ۲۵ ایستگاهی + پیشرفت واقعی مشتق می‌شود؛ روی دستگاه دیده شد (۲۵ ایستگاه با دلیل گرم قفل).
- تز تنظیمات (خانوادهٔ 15): سه عیب واقعی روی دستگاه پیدا و رفع شد — 1) تنظیمات برای کودکِ بدون پروفایل غیرقابل‌دسترس بود (ردیف داخل شاخهٔ Ready)، 2) کرش «save started from an invalid state» با تپ روی آواتار، 3) بازنویسی آواتار ذخیره‌شده با مقدار پیش‌فرض هنگام seed از Defaults؛ شاهد: فایل DataStore روی دستگاه shomara_settings_avatar=moon ماند بعد از تغییر حرکت کمتر و force-stop.
- دروازهٔ والدین همچنان fail-closed با ShomaraParentGate(verifier = null) — تصمیم مالک، عیب UI نیست.
- APK نهایی دیباگ ساخته/نصب/دود-تست شد: apps/android/app/build/outputs/apk/debug/app-debug.apk، 13,494,758 بایت، sha256=169361a79738b783d7bc9562bf4191f521d740ee7e0bc1ce05af1c7aae3d88ad، نصب Success، launch بدون FATAL (به شومارا خوش آمدی!)، deep link درس و shell و تمرین سبز.
- شواهد: gradlew test lint connectedCheck exit 0؛ typecheck:all exit 0؛ verify:static:all 89/89 PASS؛ harness validate HARNESS_VALID؛ git diff --check exit 0؛ android:doctor READY، android:gate PASS، android:assemble:debug exit 0.
- شاخه native/n08-ux-completion اکنون ۸ commit جلوتر از origin/main است؛ push نشده (نیازمند مجوز مالک).

## 2026-11-04 — N08 — M12: شاخهٔ native/n08-ux-completion به origin push شد

- git push -u origin native/n08-ux-completion => exit 0 (پروکسی مردهٔ 127.0.0.1:12334 با -c http.proxy= -c https.proxy= دور زده شد — همان راه‌حل fetch قبلی).
- شاخهٔ جدید روی origin ساخته شد: refs/heads/native/n08-ux-completion در 83d8c66594662de0953da25ef52f793f8ceb863e؛ tracking آپدیت شد.
- ۹ commit (9322740..83d8c66) منتشر شد؛ origin/main دست‌نخورده ماند؛ هیچ merge/force-push انجام نشد.
- GitHub پیشنهاد PR داد: https://github.com/MehdiGhouryani/SHOMARA/pull/new/native/n08-ux-completion
- START_HERE: working_branch_pushed => true.

## 2026-11-04 — N08 — M13: TalkBack REAL gesture walkthrough on emulator — N08-02 blocker CLOSED

Setup (all commands executed, exit 0 unless noted):
- TalkBack 15.0.0 installed on emulator-5554 (com.google.android.marvin.talkback, versionCode 60138361).
- Enabled: adb shell settings put secure enabled_accessibility_services com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService; accessibility_enabled=1.
- TTS engine set: adb shell settings put secure tts_default_synth com.google.android.tts (Google TTS present on device).
- Verified bound: dumpsys accessibility => "Service[label=TalkBack, feedbackType[FEEDBACK_SPOKEN, FEEDBACK_HAPTIC, FEEDBACK_AUDIBLE]]", touchExplorationEnabled=true.

REAL gesture walkthrough (touch-explore + double-tap-to-activate, the exact gestures a TalkBack
user performs). Evidence: tts_speak_success events in the events log buffer prove TalkBack spoke;
screen dumps prove the navigation outcome of each double-tap.

1. Welcome screen (onboarding):
   - explore title «به شومارا خوش آمدی!» [185,252..896,395] => spoken (tts_speak_success #19, #11, #5).
   - double-tap CTA «ادامه» => NAVIGATED to phone step (dump shows شمارهٔ همراه والدین screen).
2. Phone screen:
   - explore phone input (EditText) => spoken (#80, eng-USA, 2044ms utterance).
   - explore hint text => spoken (#23).
   - type 09123456789, double-tap «ادامه» => server InvalidRequest fail-closed (backend not configured,
     ADR-0037 I2): «اطلاعات را دوباره بررسی کن.» banner rendered + spoken. Honest, not a fake error.
   - explore «بازگشت» at correct bounds => spoken (#14).
   - double-tap «بازگشت» => returned to Welcome (dump confirms).
3. Shell tabs:
   - tap practice tab => spoken (#8). Practice rows visible with locked reasons.
   - tap me tab => spoken (#16).
4. Me -> Settings (the dead-end fixed in d0fd774):
   - explore settings row => spoken (#5, #16).
   - double-tap => entered settings screen (avatar grid rendered).
   - explore reduced-motion toggle => spoken (#4).
   - explore «ذخیره» => spoken (#5, #4).
5. Lesson (ST07):
   - explore «ایستگاه ST07 — مرحلهٔ P1_DISCOVER» => spoken (#5, #8).
   - double-tap «خروج از ایستگاه» => exit-confirm dialog rendered: «آیا میخواهی از ایستگاه خارج شوی؟...» + خروج/می‌مانم.
   - explore «می‌مانم» => spoken (#23, #22).
   - double-tap «می‌مانم» => dialog dismissed, stayed in lesson (dump confirms).

TalkBack disabled afterwards (restore): enabled_accessibility_services=none.

CONCLUSION: the N08-02 blocker ("REAL TalkBack walkthrough still NATIVE_PENDING") is CLOSED with
device evidence: spoken announcements + functional double-tap activation on 5 surfaces
(welcome CTA, phone input/error/back, tab shell, settings, lesson exit-confirm).
No crash, no FATAL during the entire walkthrough (pid 18180 stable throughout).

Known limitation recorded honestly: TTS engine is English-locale (eng-USA); TalkBack read the
Persian strings through the engine (utterances present, durations recorded). Persian-voice quality
judgment (pronunciation fidelity) remains a CONTENT/owner concern (CONTENT-006 narrator domain),
NOT an N08-02 UI defect; the gesture path itself is proven.

## 2026-11-04 — N08-15 checkpoint 1 (Splash + launch state + DEBUG OTP) — IN PROGRESS

- branch: `native/n08-ux-completion` (never main; AGENTS §3.1)
- scope of this checkpoint: ONLY (1) splash/loading with the owner-supplied artwork, (2) real
  `ShomaraLaunchState` production + launch gate, (3) DEBUG-only simulated OTP. No other page was
  redesigned.
- output:
  - `core:designsystem`: `ShomaraSplashScreen`/`ShomaraSplashSpec`/`ShomaraSplashDrawables`,
    `ShomaraCharacter`/`ShomaraCharacterDrawables`; byte-identical artwork
    `drawable-nodpi/shomara_splash_artwork.png` (sha256 00e771ad…fbc2, 1,490,549 B) + four lossless
    WebP character poses shipped as drawables; new token `v2.color.splashCream` +
    `v2.component.characterHero|characterCompactWidth|characterRegularWidth|splashHeroMaxWidth|
    splashProgressMaxWidth` (codegen regenerated, additive only).
  - `:core:model`: `LaunchResolution.kt` — `ShomaraSessionObservation`, `ShomaraUnverifiedReason`,
    `ShomaraLaunchSurface`, `ShomaraLaunchResolver`.
  - `:core:datastore`: `RestoreOutcome.BackendUnavailable` (a missing OTP endpoint is neither
    "offline" nor "rejected").
  - `:core:network`: `ShomaraOtpProvider` transport contract; `ShomaraOtpApi` implements it.
  - `:app`: `launch/ShomaraLaunchController` + `launch/ShomaraLaunchGate` (splash, recovery,
    routing); `AppDestination.LAUNCH` as the real start destination; variant-specific
    `AuthProviderWiring` (src/debug mounts the simulated provider, src/release declares
    `IsDebugBuild=false` + null factory); `MainActivity` root paints `ColorCanvas`; splash theme
    (`windowBackground`/`windowSplashScreen*` cream) for API 24/27/31.
  - `:feature:onboarding`: `ShomaraSimulatedAuth` contract + `ShomaraAuthSession(provider,
    allowSimulated)`; `src/debug/ShomaraDebugOtpProvider` (fixed code 1234, token
    `sim-dev-session.*`, ZERO network calls); dev-mode banner + code hint on the OTP step;
    backend-config error rendered separately from phone-format error.
  - `docs/adr/ADR-0038-splash-launch-state-and-debug-otp.md`; `scripts/verify-demo-auth-isolation.mjs`
    (+ npm script).
- tests added (all PASS): `LaunchResolutionTest` 8, `ShomaraLaunchControllerTest` 12,
  `ShomaraDebugOtpProviderTest` 9 (MockWebServer asserts 0 requests in simulation).
- gates: `npm run android:gate` PASS; `npm run verify:static:all` PASS 90/90;
  `node scripts/verify-repository-harness.mjs` PASS (dependency map regenerated, +1 file/+2 edges);
  `:app:compileReleaseKotlin` PASS (compiler-level proof that release has no simulated provider);
  debug APK built via `npm run android:assemble:debug` and installed on emulator-5554.
- device evidence (real, measured): launch reaches the welcome gate; `uiautomator dump` shows
  «حالت توسعه: کد پیامک واقعی ارسال نمی‌شود.» on screen, i.e. the DEBUG label is genuinely rendered.
- NOT yet verified (recorded honestly, no status flip):
  - a device screenshot proving the branded splash is visible (emulator capture cadence did not
    catch the splash window; the only kept baseline shot is `before-01-launch.png` showing the
    pre-change jump straight to welcome);
  - instrumented Compose assertion for the splash semantics;
  - `SCREEN_LEDGER.csv` / `NATIVE_IMPLEMENTATION_BACKLOG.csv` / `START_HERE.md` updates.
- task status: N08-15 stays IN_PROGRESS. No harness task status was flipped.

## 2026-11-07 — N08R-00 (فاز موازی N08R شروع شد) — branch native/n08r-ui-polish (از page-17-nav)

- ثبت فاز موازی `N08R — Native UI/UX Visual Refinement` طبق دستور مالک (mission: `design/playbook/N08R_MISSION_FA.md`، در canonicalDocs/file-ledger ثبت شد): ۱۸ task، allowedPaths محدود، gates از allowlist. `roadmap.schema.json` برای id فاز با پسوند R همگام شد (`^N\d{2}R?$`).
- `npm run harness:validate` → HARNESS_VALID (118 tasks, 12 phases) exit 0؛ `npm run verify:repository` → PASS (118 tasks, 60 ledger entries, 1880 edges).
- Baseline صادقانه **قبل از** رفع drift: `npx vitest run` → 563 passed / **1 failed** (`codegen.drift.test` — `ComponentGradeCardH` دست‌نویس در ShomaraTokens.kt خارج از منبع canonical). `npm run verify:static:all` → **PASS (90/90)**. `npm run android:gate` → **PASS** (BUILD SUCCESSFUL, gate.json).
- رفع drift توکن: `gradeCardH: 56` به `v2.component` در `packages/design-system/src/tokens.json` افزوده شد و codegen رسمی اجرا شد → TOKEN_DRIFT: PASS؛ diff خروجی Kotlin فقط حذف کامنت دست‌نویس است (مقدار 56.dp ثابت → صفر تغییر بصری). `npx vitest run` → **564/564 PASS**.
- Baseline بصری صفحات محافظت‌شده روی emulator-5554 (AVD Pixel_6a): ۱۰ PNG + `SHA256SUMS.txt` در `build-reports/android/device-check/n08r-baseline/` (خارج از Git طبق قرارداد repo؛ sha256 ثبت شد): اسپلش سیستم، اسپلش اپ (artwork+وردمارک+نوار پیشرفت) در 360/412، Welcome در 360/390، Profile Setup در 360/390/412 و فونت 200٪.
- **یافته P1 (صفحهٔ محافظت‌شده — تصمیم مالک):** Profile Setup در 360dp + فونت 200٪ سرریز دارد — ردیف سوم گرید پایه (پایه پنجم/ششم) زیر CTA گم می‌شود و «پایه چهارم» دوخطی می‌شود (`n08r-profile-360dp-200font.png`). چون صفحه قفل است، اصلاح فقط با تأیید مالک. همچنین Welcome در 200٪ عنوان دوروخط دارد (مورد ثبت‌شدهٔ page-01).
- debug APK: `apps/android/app/build/outputs/apk/debug/app-debug.apk` — sha256 `e0a4cc944a1c7bbb70c0ae4e19cdc91773d52cdb88572585c334e554b7f1e2e1`.
- N08-06..N08-12 دست‌نخورده ماندند؛ N08-08 همچنان OWNER_DECISION_PENDING است و N08R از آن عبور نمی‌کند.

## 2026-11-07 — N08R-01 (U0 — Design Foundation) — branch native/n08r-ui-polish

- ممیزی کنتراست WCAG روی ۳۱ جفت مصرفی v2 (اسکریپت تحلیل بیرون-repo، جدول در `design/playbook/N08R_U0_AUDIT_FA.md`): ۱۸ جفت متنی همه PASS؛ تطبیق hex MASTER.md↔tokens.json بدون مغایرت؛ **هیچ مقدار توکن تغییر نکرد** (نتیجهٔ انتقادی: پالت سالم است).
- ۵ مورد زیر-۳:۱ غیرمتنی: ۴ مورد معاف تزئینی/جداکننده؛ **accent بنر فصل ۳** amber→amberInk (1.64→11.18) + تست رگرسیون WCAG≥3 برای هر ۵ فصل.
- تصمیم C-16 (هایلایت مورب دولینگو): REJECT — ثبت در چک‌لیست و سند audit §2.
- حفرهٔ motion برطرف شد: `Modifier.shomaraPressScale` با spring توکن‌مشتق (dampingRatio c/2√(k·m)≈0.47، stiffness=220، target=0.96) روی `ShomaraButton` و گرهٔ مسیر؛ reduced-motion = snap؛ کامنت N08-04 صادقانه به‌روز شد (تعاملی ≠ تزئینی).
- گیت‌ها: `android:gate` PASS (484 تست JVM شامل ۵ تازه) · vitest 564/564 · static 90/90 · harness:validate PASS.
- Visual regression محافظت‌شده: recapture Profile Setup با APK U0 (sha256 7936a148…) → pixel-diff ناحیهٔ اپ vs baseline = **0.0000٪**؛ Splash هیچ مصرف‌کنندهٔ تغییرکرده‌ای ندارد.

## 2026-11-07 — N08R-06 (Home — مسیر یادگیری دولینگویی) — branch native/n08r-ui-polish

- اجرای مستقیم directive مالک (Priority Zero: بازطراحی Home): هندسهٔ زیگزاگ deterministic جای سینوس (`zigzagOffsetDp/AmplitudeDp` — تناوب چپ/راست هر ردیف، ریتم بزرگی [1, .55, 1, .55]، clamp دامنه بر عرض واقعی محتوا)، connector منحنی پیوسته پشت گره‌ها (swoop ورودی + دُم خروجی در همهٔ گره‌ها، زنجیره بین آیتم‌ها، mask رنگ-بوم پشت لیبل‌ها)، رنگ‌های chapter-aware (Completed/Current/Perfect = accent توپر + مارک سفید + لبهٔ تیرهٔ lerp(accent,ink,0.3)؛ Fresh = سفید + عدد accent؛ Locked = خنثی Line2/Ink2)، تیکِ کشیدهٔ Canvas جای «✓» متنی، حباب anchor «شروع/ادامه» (رشته‌های CTA کاننیکال موجود — هیچ متن تازه)، badge شمارهٔ فصل + لبهٔ سه‌بعدی روی بنر فصل (لایهٔ پیشرفت دوم اضافه نشد — قاعدهٔ تک‌لایه برقرار).
- **دو باگ واقعی در حین device-pass رفع شد:** (۱) RTL — Canvas آینه نمی‌شود ولی Modifier.offset آینه می‌کند (دو-نگیشن ثبت‌شدهٔ page-06) → canvasX با یک نگیشن اضافه روی x بصری فرود می‌آید؛ (۲) انتهای منحنی به مرکز واقعی دایره لنگر شد (onGloballyPositioned) — مقاوم در برابر حباب/۸۴dp/فونت ۲۰۰٪؛ دُم خروجی برای ordinal=1 هم کشیده شد تا زنجیره از گرهٔ اول پیوسته باشد.
- station start (jump rows) به colorsFor با chapter-aware مهاجرت کرد (کروم خنثی ردیف‌ها حفظ شد).
- تست‌ها: تست سینوس با ۶ تست زیگزاگ/کانکتور/کنتراست جایگزین شد (تناوب، آینهٔ RTL، clamp عرض باریک، زنجیرهٔ connector، رنگ chapter-aware، white-on-accent ≥3:1 برای هر ۵ فصل + لبه تیره‌تر از روی). گیت: android:gate PASS — ۴۸۹+ تست JVM صفر خطا.
- شواهد دستگاه (emulator-5554): before/after در 360dp (n08r-path-before/after…/final2)، اسکرول‌شده (خط پیوستهٔ ۲→۳→۴)، 412dp بدون برش افقی (برش پایین = نشانهٔ اسکرول C-03)؛ ضربه روی گرهٔ قفل ۲ → شیت شروع با توضیح گرم + تک-CTA (قرارداد F-01 سالم). APK نهایی sha256 a55d15f4…
- jev_review در دسترس نبود (بدون API key در این محیط) — بازبینی patch با چک‌لیست دستی: صفر hex/dp خام، semantics دست‌نخورده، بدون داده/متن ساختگی، دامنه دست‌نخورده، صفحات محافظت‌شده لمس نشدند.
- ترتیب اجرا با directive مالک جابه‌جا شد (Home قبل از nav)؛ N08R-05 (nav) همچنان TODO و بعدی طبق directive: Station Start (N08R-07).

## 2026-11-07 — N08R-07 (Station Start دولینگویی) — branch native/n08r-ui-polish

- بازطراحی `ShomaraStationStartSheet`: بلوک هیروی فصل (تینت+accent از همان `chapterBandColors` مسیر/بنر — یک سیستم)، لبهٔ سه‌بعدی lip (دستور N08R-06)، کاراکتر Main در دایرهٔ سفید با قاب accent (جای قاب مربعی کرم)، badge شمارهٔ فصل (سفید روی accent، TalkBack-decorative)، CTA تمام‌عرض (Primary/Ghost طبق state) و «بستن» تمام‌عرض. متن‌های pinشدهٔ تست («شروع/ادامه/تمرین دوباره/متوجه شدم»، lockedExplanation، metadataLine) و wiring شل (Back/deep-link/CTA→lesson) عیناً حفظ شد — منطق `ShomaraStationStartLogic` و `ShomaraJumpSheet` دست نخورد.
- تست تازه: `sheet hero keeps chapter identity and readable marks for every chapter` (۵ فصل: تینت مشخص + white-on-accent ≥3:1). `android:gate` PASS.
- شواهد دستگاه (emulator-5554، APK sha256 b88ad996…): BEFORE (`n08r-sheet-before-locked-open.png`) در برابر AFTER: Locked 360 (`after2-locked`)، Ready 360 (hero+CTA تمام‌عرض سبز «شروع»+بستن)، 412dp، فونت ۲۰۰٪ (هیرو دوخطی بدون بریدگی، اسکرول سالم)؛ Back → مسیر با حفظ موقعیت (`after2-back`)؛ CTA «شروع» گرهٔ ۱ → ورود واقعی به درس (P1 کشف، اسکلت صادقانه + بنر «گزینه‌ها نیامده»، «بررسی» غیرفعال) (`after2-lesson-entered3`).
- صادقانه: androidTest (`ShomaraStationSheetTest`) در gate اجرا نمی‌شود (connectedCheck خارج از gate) — پوشش رفتار با تعامل واقعی دستگاه انجام شد؛ Replay/Resume روی دستگاه بدون progress واقعی دست‌نیافتنی‌اند (منطق تست‌پوشیده)؛ N08R-05 و sweep فونت ۲۰۰٪ مسیر Home همچنان pending.

## 2026-11-07 — N08R-08 (Teach/Discover — تجربهٔ کشف محتوامحور) — branch native/n08r-ui-polish

- **محور ۱ (Clay):** press feedback کامل شد — فرورفتن ۲dp (نصف توکن ComponentEdge) هم‌زمان با مقیاس 0.96 و فروپاشی سایه، بازگشت با همان spring توکن؛ reduced-motion = snap. تست تازه: `pressed surface sinks half the clay edge`.
- **محور ۲ (ممیزی محتوا):** P1 پایلوت ST07 کامل خوانده شد (s00/s01/s02/s03 با کارت‌ها/برچسب‌های صوتی/reveal GLYPH.1-2/idle-replay 8s) و نقشهٔ محتوایی مستند شد: `design/playbook/N08R_ST07_P1_CONTENT_MAP_FA.md` (هدف/تعامل/ارزیابی=ندارد/بازخورد/صوت/asset/پیشرفت + ۶ Gap صادقانه: O1/O2، ۴۱ asset، صوت صفر باینری، CONTENT-006/004).
- **محور ۳ (رندر):** مدل projection کودک-امن `ShomaraDiscoverStep/Card` + منطق `ShomaraDiscoverLogic` + کامپوزبل `ShomaraDiscoverStage` — انیمیشن خودِ مفهوم است: لمس کاشی → نشان شمارش (۱/۲)؛ با لمس همه → reveal عدد در Featured کهربایی؛ «ادامه» بین گام‌ها؛ پایان = بنر صادقانه. `ShomaraLessonHost(discoverSteps=…)` — release خالی (fail-closed)، debug ساختار DRAFT ST07 را برای بازبینی طراحی نشان می‌دهد (`LessonContentWiring` دو-واریانتی، الگوی simulatedAuth).
- **گارد مرز CONTENT-008:** تست `projection carries identifiers and interaction config only - no evaluation fields` (بازتابی: answer/correct/threshold/nextAction/mastery ممنوع). ۵ تست تازه؛ android:gate PASS — **۴۹۶ تست JVM، صفر خطا**.
- شواهد دستگاه (APK sha256 1024c185…): ورود از شیت → P1 کشف با سه کاشی ۸۰dp RTL (`n08r-discover-1-entry`)، لمس‌ها + reveal «۱» + ادامه (`…-3-revealed`)، گام ۲ جفت‌ها + reveal «۲» + پایان صادقانه (`…-4-step2-revealed`)، reduced-motion (animator scale=0) ظهور ایستا (`…-5-reduced-motion`).
- صادقانه: reveal «نوشتن» منتظر GLYPH.1/2 (پیش‌نویس: تایپوگرافی+scale)؛ صدا ساکت (CONTENT-017)؛ advance واقعی P1→P2 به ارزیاب محلی (O1/فاز ۱) وابسته است؛ N08R-05 و sweep ۲۰۰٪ مسیر همچنان pending.

## 2026-11-11 — N08R-09 (Guided Practice — حلقهٔ تمرین هدایت‌شده) — branch native/n08r-ui-polish

- **محور ۲:** P2 پایلوت ST07 کامل خوانده شد (۸ آیتم: i01/i02 عددی T15، i03/i04 ردگیری T13، i05/i06 تصویری T15، i07/i08 جای‌گذاری T01) + متن‌های DRAFT صوت (pr/ok/retry/h1-h3) از manifestها. Gapها صادقانه: T13 ردگیری و T01 سینی به ارزیاب trace/tray نیاز دارند (خارج از preview)، متن‌ها DRAFT تا O2.
- **محور ۳:** `ShomaraGuidedItem/Option/Display` (projection کودک-امن — نمایش گزینه‌ها بدون پاسخ) + **لایهٔ evaluator** (`ShomaraGuidedEvaluator` interface در main؛ پاسخ‌ها فقط در impl دیباگ — الگوی simulatedAuth) + `ShomaraGuidedStage` (پرامپت، صحنهٔ محرک، کاشی‌های گزینهٔ ۸۰dp، انتخاب سه‌گانه، «بررسی» gated، بنر ✓ درست / ↺ retry گرم + نردبان hint از ShomaraHintLadder، retry انتخاب را پاک می‌کند تا کودک دوباره بشمارد).
- wiring دو-واریانتی گسترش یافت (guidedItems + guidedEvaluator؛ release خالی/null) + پرچم `lessonPreviewAdvance` (فقط وقتی wiring دیباگ محتوا داده؛ در فاز ۱ ارزیاب مالک advance است) تا پایان کشف در پیش‌نمایش به P2 برسد.
- تست‌ها: ۵ تست تازه (gate submit، انتخاب idempotent، نردبان hint شامل نبودِ slot خالی، گارد مرز projection، advance) — android:gate PASS، **۵۰۱ تست JVM صفر خطا**.
- **سناریوی کامل دستگاه (APK sha256 b383d400…):** کشف→(پیشروی preview)→i01: پاسخ غلط (عدد ۲) → بنر ↺ «یک بار دیگر امتحان کنیم.» + بررسی قفل (`n08r-guided-3-wrong-retry`) → پاسخ درست (عدد ۱) → بنر ✓ «همین‌طور است؛ یک توپ.» (`…-4-correct2`) → i02 درست → i05 تصویری (کارت ۲شکلی، «دقیق بود؛ دو گل.») (`…-6-end`) → i06 («خوب فکر کردی؛ یک ماهی.») → **بنر پایان صادقانه** (`…-8-end`).
- صادقانه: تمرین واقعی منتظر O1/O2 (ارزیاب محلی + بسته)؛ T13/T01 خارج preview؛ androidTest خارج gate؛ hint نمایشی روی دستگاه فقط retry بود (attempt1) — نردبان کامل JVM-test پوشیده؛ N08R-05 و sweep ۲۰۰٪ مسیر pending.

## 2026-11-12 — IPA-P1 (CI/CD & Android build stabilization) — branch infra/p1-ci-stabilization

- **G-01 (P0) رفع:** `android-native.yml` حالا پکیج upstream `platforms;android-37.0` را نصب می‌کند (پکیج bare `platforms;android-37` در اندیس رسمی گوگل وجود ندارد — ریشهٔ unreachable بودن gate کاتلین). قرارداد preflight به پذیرش چیدمان `android-37` و `android-37.<minor>` گسترش یافت و همیشه `android.jar` معتبر (ZIP/JAR) لازم است (`scripts/verify-android-environment.mjs` → `compileSdkPlatformDirs`). assertionهای `verify-android-foundation.mjs` به قرارداد اصلاح‌شده سخت‌گیرانه‌تر شدند (پین دقیق `platforms;android-37\.0`). سند `ANDROID_BUILD_ENVIRONMENT.md` هم‌راستا شد.
- **G-02 (P1) رفع:** ci.yml job required جدید `static-core` (بدون continue-on-error) با `verify:static:core` = `verify-static-all --core`؛ مجموعهٔ وابسته به مرورگر (۶ اسکریپت: flow-run/flow-path/flow-station/flow-tabs/parity-run/verify-phase10) در کد پین شده و فقط از core خارج می‌شود — اسکریپت مرورگری جدید ناشناخته، core را قرمز می‌کند (fail-closed). `visual-and-static` با کل سوئیت informational می‌ماند.
- **G-03:** upload گزارش‌های diagnostic در android-native.yml (always، ۷ روز؛ فقط گزارش — هیچ APK/AAB؛ ban در verifier از «کلمهٔ artifact» به ban دقیق keystore/signingConfig/assembleRelease/.apk/.aab تبدیل شد).
- **G-04 بسته شد:** glob موبایل در vitest به `{ts,tsx}` گسترش یافت؛ تست یتیم `RevealPrimitives.test.tsx` وارد سوئیت شد و معلوم شد هرگز قابل‌اجرا نبود (سینتکس Flow در react-native/index.js؛ RollupError). با mock چهار لایهٔ RN بازنویسی شد — assertionها دست‌نخورده و این بار واقعاً اجرا می‌شوند. verifier جدید `scripts/verify-vitest-suite.mjs` (0 orphan؛ ۷۴ فایل/۹ glob) خودکار وارد static suites شد.
- **G-05:** `.github/dependabot.yml` (npm/gradle/github-actions هفتگی) + `dependency-audit.yml` (schedule دوشنبه‌ها + dispatch؛ `npm audit --omit=dev --audit-level=critical`؛ بدون continue-on-error؛ هرگز روی pull_request اجرا نمی‌شود).
- **شواهد (2026-11-12، مبنا f0b6823):** android:preflight READY (exit 0؛ jar اندیس‌شده `D:\SDK\platforms\android-37.0\android.jar`) · test:android-build 7/7 pass (exit 0) · verify:android-build-harness PASS (0) · verify:android-foundation PASS (0) · verify-vitest-suite PASS (0) · vitest 74 فایل/565 تست (exit 0؛ 73→74 فایل، 564→565 تست) · verify:static:core 85/85 (exit 0) · verify:static:all 91/91 (exit 0) · verify:repository PASS (0؛ نقشهٔ وابستگی بازتولید: 550 فایل/1883 یال) · android:doctor READY (0) · git diff --check = 0 · پارس YAML چهار فایل workflow با js-yaml OK.
- **صادقانه:** اجرای واقعی GitHub Actions در این نشست ممکن نیست — سبزی CI پس از push مالک و یک اجرا اثبات می‌شود (BLOCKED تا آن‌هنگام)؛ `npm audit` روی این ماشین قابل‌اثبات نیست (شبکهٔ registry در دسترس نیست) — شواهد از نخستین اجرای زمان‌بندی‌شده می‌آید؛ G-06 (job instrumented/emulator) عمداً به P10 موکول شد.
