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
- handoff: manifest تحویل در `docs/notes/SHOMARA_N01_CHECKPOINT.md`؛ task بعدی `N02-01` در انتظار HG-01 مالک برای applicationId/minSdk.

## 2026-10-28 — DESIGN checkpoint / commit e4035b0

- `docs/DESIGN_RULES.md § product design/SKILL.md` و playbook با frontmatter، trigger و workflow قابل اجرا استاندارد شدند.
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
- handoff: `docs/notes/SHOMARA_FINAL_CHAT_HANDOFF.md` برای ادامهٔ مستقل از تاریخچهٔ چت ایجاد شد؛ N02 اکنون ۱۰/۱۱ و فقط `N02-07` محیطی مسدود است.
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

- closure: `N02-07` BLOCKED → DONE و فاز `N02` IN_PROGRESS → DONE در `harness/roadmap.json`، بر اساس شواهد همان اجرا: `npm run android:gate` = PASS (exit 0) با JDK 17 Temurin و `D:\SDK`/platform 37، رفع خطای lint واقعی `themes.xml` با qualifier `values-v27`، `android:doctor` = READY، و module graph ثبت‌شده در `docs/notes/ANDROID_MODULE_GRAPH.md`. debug APK عمداً ساخته نشد (متن task مجوز نداد)؛ N03 شروع نشد و فقط با go-ahead مالک از `N03-01` باز می‌شود.
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
- ثبت صادقانه: `docs/notes/NATIVE_COMPONENT_READINESS_N03.md` — جدول ۹ خانواده با تفکیک JVM/semantics/catalog از screenshot/device.
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
- module graph: `docs/notes/ANDROID_MODULE_GRAPH.md` به گرام N04 (۸ ماژول + مرزها) به‌روز شد؛ allowedPaths آن سند + `core:model/**` را مجاز کرد.
- `:core:model`: `ShomaraLaunchState` (UI-001: Resolving/NewUser/RestoringSession/RecoverIncompleteProfile/Offline/Error)، `ShomaraGradeCatalog` (G1..G6 آینه‌ی contracts؛ G2+ قفل با توضیح گرم «به‌زودی»)، `ShomaraAvatarCatalog` (sun/leaf/cloud/moon) — آینه‌ی `packages/contracts/src/onboarding.ts`.
- `:feature:onboarding`: نگه‌داشت launch→mode (fail-closed)، `ShomaraFlowUiState` (FirstRun/Resume/Back/Saving/Error)، OTP paste (`fillFromCode` LTR سقف‌دار) + حالت Expired با برچسب گرم (پاک‌شدن در ورود بعدی)، انتخاب آواتار، resume draft با DataStore واقعی (`PreferencesProfileDraftStore`) و `OnboardingRoutes.stepFor` برای process-death؛ host و app به draftStore وصل شدند.
- guard: `verify-design-system-native.mjs` اکنون کل `apps/android/feature` (منابع production، بدون src/test) را اسکن می‌کند — PASS (۲۶ فایل).
- readiness: `docs/notes/ONBOARDING_JOURNEY_READINESS_N04.md` با تفکیک صادقانهٔ اثبات‌شده/NATIVE_PENDING.
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
- readiness در `docs/notes/OFFLINE_CMS_AUDIO_READINESS_N07.md`. closure: فاز N07 DONE (9/9)؛ pointer → N07-07؛ next = N08-01.

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

## 2026-11-13 — IPA-P1b (سخت‌سازی زنجیرهٔ Build/CI طبق دستور مالک) — branch infra/p1-ci-stabilization

- **پین Package ID با اثبات زنده:** `sdkmanager --list --channel=0` (cmdline-tools 22.0، exit 0) در تاریخ مبنا فقط `platforms;android-36 | rev2` و `platforms;android-37.0 | rev2` را در بازهٔ API 36/37 فهرست می‌کند — هیچ `platforms;android-37` (و در این لیست حتی 37.1/37.2) در stable نیست. پین ثابت در کد: `PINNED_PLATFORM_PACKAGE = 'platforms;android-37.0'`.
- **هویت پکیج ≠ نام پوشه:** preflight حالا `package.xml` داخل پوشهٔ platform را می‌خواند و فقط چیدمانی که دقیقاً `path="platforms;android-37.0"` را declare کند می‌پذیرد — canonical (`android-37.0`) و legacy inconsistent (`android-37`، حالت واقعی روی ماشین مالک با Warning sdkmanager) هر دو با همان Package ID تأیید می‌شوند؛ پوشه با پکیج دیگر (37.1/android-36) یا بدون manifest هرگز READY نمی‌شود. compileSdk عدد 37 می‌ماند و targetSdk=36 از آن جدا است.
- **تست‌های رفتاری پین** (7/7، exit 0): canonical 37.0 سبز؛ 37.1-under-37.0-dir رد؛ legacy-with-37.0 پذیرفته؛ android-36 رد؛ dir بدون package.xml رد.
- **الزام Play target API از منبع رسمی (استخراج 2026-11-13):** از 2026-08-31 اپ جدید/آپدیت باید target ≥36 داشته باشد — targetSdk=36 موجود دقیقاً منطبق؛ ثبت در سند با لینک Google Play Help (answer/11926878) و developer.android.com target-sdk. targetSdk دست نخورد (bump = ADR جدا).
- **Cacheهای دقیق و قابل invalidation در android-native.yml:** حذف کش مضاعف (setup-java cache:gradle + setup-gradle@v4)؛ دو actions/cache صریح: Gradle با key `OS + jdk17 + hash(wrapper.properties, libs.versions.toml, gradle.properties)` + restore-key، و SDK platform با key `OS + platforms-android-37.0`؛ گام install همیشه اجرا می‌شود و stale rev را در برابر اندیس زنده ارتقا می‌دهد. artifact diagnostics گسترش یافت به test-results XML (همیشه، حتی failure، ۷ روز).
- **ci.yml:** concurrency group (`ci-<ref>`) + timeout برای job core؛ static-core با timeout 20 از commit قبلی.
- **Node پنهان نمی‌ماند:** `verify:repository` هنگام اجرای Node خارج از پین، بنر بلند `NODE_VERSION_MISMATCH` (۵ خط) چاپ می‌کند و می‌گوید نتایج محلی evidence هم‌نسخه نیستند — warning است نه fail (ماشین اشتراکی بدون nvm بسته نمی‌شود؛ CI دقیقاً پین را با setup-node اجرا می‌کند؛ fix محلی: `nvm use 22.22.0`). در اجرای امروز banner دقیقاً یک‌بار چاپ شد (Node v24.22.1 vs پین 22.22.0).
- **سیاست Preview/Canary:** ممنوع — فقط stable channel؛ مسیر ارتقای minor به‌صورت یک commit شش‌قسمتی (ثابت preflight + workflow env/install + assertionها + سند + تست‌ها + اجرای CI سبز) ثبت شد.
- **سند:** `ANDROID_BUILD_ENVIRONMENT.md` بازنویسی شد — بخش پین پلتفرم، سیاست target API، جدول هم‌راستایی CI/Local (Node = تنها انحراف ثبت‌شده)، یادداشت منقضی‌شدن وضعیت N02-07.
- **شواهد (همه exit 0):** test:android-build 7/7 · preflight READY (`android-37.0/android.jar` + note package.xml) · harness PASS · foundation PASS (assertion پین جدید) · build:packages · typecheck:all · vitest 74/565 · static:core 85/85 · static:all 91/91 · repository PASS (+1 banner) · android:gate BUILD SUCCESSFUL (14s) · doctor READY · git diff --check 0 · YAML پارس OK.
- **صادقانه:** اجرای واقعی GitHub Actions و Run URL از این نشست ممکن نیست (gh CLI نصب نیست و شاخه push نشده) — معیار «CI اندروید مرحله نصب SDK را می‌گذراند» تا push مالک و یک اجرا اثبات‌ناپذیر می‌ماند (BLOCKED، جایگزین نشده با static).

## 2026-11-13 — IPA-P2 (ADR Reconciliation + Owner Decision Pack) — branch infra/p2-adr-reconciliation

- **ورودی‌ها تأیید شد (بدون تکرار ممیزی):** commit `f0b6823` ancestor of HEAD است و هر ۵ سند Phase 0 در clone فعال حاضرند.
- **Reconciliation Map (ADR_RECONCILIATION_P2_FA.md §1):** ۲۲ اثر/سند با وضعیت GOVERNING/AMENDED/STATUS-NOTE/ALREADY-RECONCILED/FROZEN-PENDING/HISTORICAL-KEEP/COMPATIBLE — پایه: ADR-0039 GOVERNING؛ ADR-0003 یادداشت SUPERSEDED-IN-PART گرفت (متن تاریخی حفظ)؛ design/MASTER.md قبلاً هم‌راستا بود؛ سطر Duolingo در AGENTS §6 و INSPIRATION_GUARDRAILS به ledger فاز بصری N08R موکول شد تا با فاز موازی مالک تصادم نکند.
- **اصلاح حداقلی قانون (۱۲ سایت در ۹ فایل، همه با ارجاع ADR-0039):** README.md:3 · AGENTS.md ق5/ق6/§5 · START_HERE.md §7 · PACKAGE_BOUNDARIES_FA.md:26 · skills/product-design:27 · screen-execution:21+41 · learning-content:32. متن‌های تاریخی roadmap N05/N06/N07 حفظ شدند؛ N08-06..12/N09/N10 و ADR-0037-backend و learning-content:15/45 قفل اجرا تا O6/O13/O11.
- **Owner Decision Register v2 (INFRASTRUCTURE_OWNER_DECISIONS_FA.md بازنویسی شد):** O1–O13 همگی **OPEN** با گزینه‌ها/trade-off/ریسک چهارگانه (🔒🛠🚢🧒)/پیشنهاد مهندسی غیرمصوب/وابستگی باز-بسته + حکمرانی تغییر وضعیت (فقط با بیانیهٔ مالک) + جدول CONTENT-001…018 (16 OPEN + 2 GUARDED) + اولویت پیشنهادی O1→O2→O4→O3→O7→O5→O6→O11/O12→O8/O9→O13.
- **Diagram به‌روز:** as-built پس از P1 (پین پکیج، بدون INTERNET permission، DB in-memory با مسیر O4) + هدف شرطی با برچسب [O?] — هیچ شاخه‌ای بدون تصویب پیاده نمی‌شود.
- **Phase Gate Matrix:** P0 DONE / P1 DONE_WITH_CI_PENDING / P2 = این Decision Pack / P3..P11 همه BLOCKED با مسدودکنندهٔ صریح (O4/O2/O1/O11-O12/O8-O9/O5/O6/HG-05+O13).
- **Forbidden Assumptions (۱۶ بند):** از جمله: هیچ O مصوب فرض نشود؛ نه Room قبل از O4، نه پکیج قبل از O2، نه ارزیابی قبل از O1، نه حذف backend قبل از O6، نه parity قبل از O13، نه threshold اختراقی، نه اجرای متن‌های FROZEN، نه بازطراحی UI در برنامهٔ زیرساخت.
- **گیت‌های فاز (exit code):** verify:static:all = PASS (91/91) · verify:repository = PASS (+1 بنر NODE_VERSION_MISMATCH طبق طراحی) · harness validate = HARNESS_VALID (118 tasks, 12 phases) · git diff --check = 0 · نقشهٔ وابستگی بازتولید (550 فایل/1883 یال).
- **توقف:** هیچ فاز 3–6 اجرا نشد؛ این فاز به‌عنوان Decision Pack تحویل شد و برنامه منتظر پاسخ مالک به Register است.

## 2026-11-13 — IPA-P3 (Native infrastructure contracts — بدون بازطراحی UI) — branch infra/p3-native-infra

- **بررسی واقعی:** هیچ ViewModel در کل اپ وجود ندارد (host-composable ها state را با پارامتر می‌گیرند)؛ ShomaraLaunchController تنها StateFlow producer است؛ AppError صفر مصرف‌کننده داشت؛ scope ی DataStore بی‌نام و بدون مالک صریح بود؛ violationهای مرز feature→data/network دقیقاً ۶ مورد (orchestratorها + audio cache) طبق جدول responsibilities سند graph.
- **C1 — AppGraph (di/AppGraph.kt):** قرارداد صریح composition root — `AppGraph : AppContainer` با `applicationScope` (SupervisorJob+Default از ShomaraScopes) و `startup`؛ DefaultAppContainer پیاده‌ساز؛ DataStore به scope اختصاصی مالک‌دار (`ShomaraScopes.dataStoreScope`) منتقل شد (scope بی‌نام قبلی حذف). جدول مالکیت scope در ADR-0041 + سند graph: Application/Screen/Feature(ممنوع)/I/O injected.
- **C2 — ShomaraAppStartup:** essential (در onCreate، فقط wiring+log — محتوا/صوت/CMS ممنوع) در برابر deferred (فقط id، اجرای lazy)؛ گام ضروری فعلی: `log-runtime-mode`؛ شکست گام диагنوستیک log+swallow می‌شود (crash launch ممنوع). تست: ترتیب اجرا، swallow، «deferred هرگز در launch اجرا نمی‌شود» با BoomGraph که لمس هر عضو غیرلازم را قرمز می‌کند.
- **C3 — ShomaraErrorModel (core:common/error):** سه لایه Domain/Data/Presentation روی leaf کاننیکال AppError؛ `ShomaraRetryPolicy` با **اعداد همین OutboxSyncEngine** (750ms/300s/8 — reuse، نه اختراع)؛ سیاست retry خودکار ≠ CTA retry کودک؛ قرارداد privacy: فقط identifier (incidentId) — بدون answer/نام/payload.
- **C4 — ShomaraStateHolder + SingleFlightExecutor (core:common/state):** قرارداد state (immutable، StateFlow، مالک lifecycle صریح) + استخراج primitive single-flight که lesson host به‌صورت ad-hoc داشت (N08-05)؛ تست JVM روی StandardTestDispatcher مالک‌دار: duplicate collapse، آزادسازی کلید پس از cancel، استقلال keyها، supervisor semantics.
  - یافتهٔ تست‌پژوهی: `advanceUntilIdle` در coroutines-test 1.8.1 کارهای `backgroundScope` را تخلیه نمی‌کند (با SchedulerProbe اثبات شد) — تست‌ها با اسکوپ مالک‌دار روی همان testScheduler بازنویسی شدند (الگوی کلاسیک).
- **C5 — verify-android-module-graph.mjs (gate ۹۲م static:all):** R1 بدون GlobalScope؛ R2 بدون Dispatchers.Main بیرون :app؛ R3 feature بدون okhttp3/androidx.datastore/core:database/:sync؛ R4 sync فقط :app/:sync؛ R5 بدون feature→feature؛ R6 importهای core:network/core:datastore در feature فقط با allowlist dated و فقط-co shrinking (۶ entry با reason)؛ کامنت‌ها قبل از scan strip می‌شوند (KDoc قانون نمی‌شکند)؛ STALE-ALLOWLIST هم گزارش می‌شود.
- **سند:** ADR-0041 (قراردادها + debts شش‌گانه) + ANDROID_MODULE_GRAPH.md به‌روز (graph، scope table، verifier reference).
- **شواهد (exit code):** android:gate = PASS (test+lint+compile؛ شامل ۵ تست JVM جدید: ۲ error-model، ۴ state-holder/single-flight، ۲ startup — مجموع JVM سبز) · ANDROID_MODULE_GRAPH = PASS (183 فایل، ۶ allowlist) · verify:android-foundation PASS · verify:android-build-harness PASS · verify:static:all = PASS (92/92) · verify:repository = PASS (551 فایل/1885 یال) · harness validate HARNESS_VALID.
- **صادقانه:** UI دست نخورد (هیچ composable بصری تغییر نکرد)؛ ViewModel معرفی wholesale نشد (debt ثبت شد)؛ AppError هنوز توسط فلوهای production مصرف نمی‌شود (migration debt)؛ runtime-config پین رفتار تکرار یکسان بین sync و common فعلاً mirror است (unification پس از O3).

## 2026-11-13 — IPA-P4 (Persistence واقعی — Room/SQLite؛ O4 APPROVED) — branch infra/p4-room-persistence

- **O4 → APPROVED** در متن مأموریت مالک (Room ساختاریافته + DataStore تنظیمات سبک + media در فضای خصوصی + Keystore فقط در صورت نیاز) — ثبت در Register با evidence.
- **نقشهٔ کامل consumerها قبل از تغییر:** ۱۳ فایل (AppContainer، OutboxSyncEngine، ManifestActivation، AudioCache، DraftAudioImporter، BoomGraph + ۶ تست).
- **Schema v1 (real-need فقط):** ۵ جدول Room — station_packages (PK ترکیبی + index stationId,isActive)، progress_projections (PK ترکیبی)، outbox_operations، audio_assets (+index publishState)، migration_metadata؛ **FKها عمداً غایب** (رجیستری‌های مستقل با شناسهٔ خارجی — توجیه در ADR-0042)؛ جدول‌های Profile (O5)، Mastery/Sessions/Attempts (O1/P5/CONTENT-014) عمداً ساخته نشدند — با مسیر migration مستند. Schema export: `core/database/schemas/…1.0.json` committed.
- **قراردادها در core:model:** StationPackageRepository/ProgressRepository/OutboxRepository/AudioAssetRepository (Flow/suspend)؛ پیاده‌سازی Room در core:database با mapping entity↔domain؛ payload با ShomaraPayloadJson (core:common، بدون dependency).
- **Transactionهای اتمیک:** activatePackage (deactivate-قبلی + insert-جدید در یک transaction — crash هرگز دو active یا صفر نمی‌گذارد)؛ completeAccepted (Server-Wins: upsert progress + حذف outbox در یک transaction).
- **CONTENT-008 در لبهٔ persistence:** ForbiddenFieldGuard به core:common منتقل شد (مشترک بین Room impl و fakeها)؛ تست repository-level: هر payload ممنوعه قبل از insert رد می‌شود.
- **Rewire کامل:** OutboxSyncEngine/ManifestActivation حالا فقط core:model (وابستگی :sync به core:database حذف شد)؛ ShomaraAudioCache از feature/lesson به AudioAssetRepository (import core:database حذف — **allowlist module-graph از ۶ به ۵ shrink شد**)؛ DraftAudioImporter suspend+repo؛ DefaultAppContainer دیتابیس واقعی می‌سازد (بدون fallbackToDestructiveMigration — اکنون گیت استاتیک R7).
- **تست‌های Robolectric واقعی (9/9 سبز):** schema round-trip؛ **process-death reopen** (نوشتن→close→بازگشایی→داده سالم)؛ activation transaction؛ اتمیک بودن epilogue؛ **concurrency** (۶۰ نویسندهٔ موازی → دقیقاً یک active)؛ **downgrade reject**؛ **foreign/future schema reject** (identity check)؛ CONTENT-008 guard؛ no-wipe.
  - **دو یافتهٔ پژوهی مهم:** (۱) Robolectric-Windows با WAL روی connection دوم code 14 می‌دهد → تست‌ها با TRUNCATE (production همان WAL پیش‌فرض). (۲) Robolectric فایل corrupt را **بی‌صدا init می‌کند** (۵۰B→65536B) — واگرایی از رفتار دستگاه (SQLITE_NOTADB)؛ بنابراین proof corruption-file روی دستگاه به فاز instrumented موکول شد و gat استاتیک R7 (ممنوعیت fallbackToDestructiveMigration + تک-factory بودن databaseBuilder) جایگزین اثبات سطح-ساختار شد.
- **نکتهٔ زیرساخت میزبان (همه با backup و تاریخ):** init script کاربر (mirror aliyun) اصلاح شد — زیرمخزن gradle-plugin خراب (AGP marker 404، KSP 502→abort کل resolve) حذف و pluginManagement دیگر دستکاری نمی‌شود؛ proxy محلی Hiddify خاموش (connection refused) در gradle.properties کاربر کامنت شد — شبکهٔ مستقیم با JVM probe (200) اثبات شد.
- **نسخه‌ها (resolve واقعی از مخازن):** Room 2.8.5 + KSP 2.3.13 + Robolectric 4.17 (SDK 34) + androidx.test:core 1.6.1.
- **شواهد (exit code):** android:gate = PASS (3m؛ شامل ۹ تست Robolectric + همهٔ unitها) · ANDROID_MODULE_GRAPH = PASS (190 فایل، ۵ allowlist، R7 جدید) · verify-android-foundation PASS · verify:static:all = PASS (92/92) · verify:repository = PASS (551 فایل/1885 یال) · schema 1.0.json committed.
- **صادقانه:** corruption-file روی device واقعی هنوز اثبات نشده (instrumented/faze P10)؛ migration واقعی v1→v2 هنوز رخ نداده (هارنس MigrationTestHelper + schemaها آماده)؛ Profile/SkillMastery/Sessions/Attempts جداول آینده‌اند.

## 2026-11-13 — IPA-P5 (Content Package Engine — trust chain؛ schema PROPOSED تا O2/O7) — branch infra/p5-content-package-engine

- **مرز صادقانه:** O2/O7 هنوز OPEN هستند → **هیچ فرمت محتوایی نهایی نشد**؛ اسکیمای manifest به‌صورت PROPOSED/DRAFT در ADR-0043 §2 ثبت شد و مکانیک‌های مستقل از فرمت (امضا/integrity/staging/activation/rollback) ساخته و اثبات شدند. release و debug هیچ پکیجی ندارند؛ fixtureها فقط در تست با کلیدهای ephemeral.
- **ماژول جدید `:core:contentpackage`** (per ADR-0041 map) + Room v2 با **اولین migration واقعی** (MIGRATION_1_2: جدول content_packages) و schema 2.json exported؛ تست مهاجرت با روش builder واقعی: بازسازی کامل v1 روی دیسک از روی 1.json (createSql+setupQueries+identity)، seed ردیف‌ها، بازگشایی با v2 → migration اجرا و اسکیمای migrated در برابر entityهای کامپایل‌شده validate شد (MigrationTestHelper با driver جدید Room 2.8 در Robolectric ناسازگار بود — روش مستقیم قوی‌تر است).
- **Trust chain:** manifest.sig منفصل (ECDSA P-256/SHA-256) روی بایت‌های دقیق manifest.json → فایل‌ها با sha256+size → activation فقط پس از verify کاملِ بایت‌های staged؛ **SHA-256 ≠ امضا** (قاعدهٔ مالک)؛ **کلید خصوصی هرگز در APK/Git/Log** — production trust slot خالی و fail-closed (هر پکیجی رد می‌شود تا مالک کلید عمومی را پین کند)؛ کلیدهای تست همه ephemeral.
- **۱۰ گام امنیتی مأموریت → پیاده‌سازی + تست:** جدول کامل در ADR-0043 §3 (parse محدود/scheMa/signature/hash/reference/compatibility/stage/atomic-flip/rollback/corruption-typed) + deterministic build + airplane-mode (R8 استاتیک: import شبکه در engine ممنوع؛ import خارج app/contentpackage هم ممنوع).
- **یافته‌های Lint/test:** java.util.Base64 نیازمند API 26 → android.util.Base64 در main؛ org.json در unit test خالص mocked → تست امنیتی Robolectric شد؛ JSONArray iteration روی JVM ambiguous → index-based؛ به‌روزرسانی boundaryGuardFiles در foundation verifier (فایل guard جدید جایگزین فایل حذف‌شده با همان مکانیزم رسمی N06).
- **شواهد (exit code):** android:gate = PASS (شامل ۳۳ تست: ۱۷ امنیتی/activation + ۹ Room قبلی + مهاجرت + بقیه) · ANDROID_MODULE_GRAPH = PASS (205 فایل، R8) · verify:static:all = PASS (92/92) · verify:repository = PASS (551/1885) · schemas/2.json committed · ADR-0043 committed.
- **صادقانه:** بدون O2 نهایی‌شده، هیچ loader-to-startup wiring انجام نشد (P7)؛ key rotation ceremony و cleanup staging dirs به ADRهای بعدی موکول؛ اثبات corruption-file روی دستگاه همچنان instrumented-pending.

## 2026-11-13 — IPA-P6 (Local Learning Engine — درزهای تصمیم ایزوله) — branch infra/p6-local-learning-engine

- **وضعیت پیش‌نیازها ثبت شد صادقانه:** O1/O3 و O2-final هنوز OPEN هستند → طبق قاعدهٔ خود مأموریت («هیچ threshold جعل نکن» + «mastery طبق سیاست تأییدشده») فاز به‌صورت **موتور decision-neutral + درزهای تصمیم fail-closed** تحویل شد؛ هیچ ارزیابی درستی/mastery/unlock واقعی پیاده نشد.
- **بررسی کامل انجام شد:** TS policies.ts (نسخه‌های ثبت‌شدهٔ دورهٔ سرور: runtime-policy phase13 / station-pass 4of5x2 = مرجع DRAFT با CONTENT-014 باز)، Kotlin lesson feature (chrome/position/checkpoint/adapters T01..)، ثبت در engine به‌عنوان REFERENCE نه policy.
- **ماژول جدید `:core:learning`** — LocalLessonEngine (lifecycle ACTIVE⇄INTERRUPTED→COMPLETED/ABANDONED؛ presentEncounter با cursor؛ **duplicate submission = no-op با کلید قطعی**؛ manual advance فقط؛ suspend/resume) · LocalLessonEvaluator SPI (**O1 seam — UnconfiguredEvaluator fail-closed**) · TemplateRegistry (version mismatch → refuse) · ProgressionEngine/MasteryEngine (**PolicyGate: PolicyNotApprovedException تا CONTENT-014**) · PrerequisiteGraph (cycle/missing-prereq در زمان ساخت) · HintPolicyEngine (**ممنوعیت ثبت‌شدهٔ P4/P5** از ShomaraMacroStages.HINT_BANNED؛ ladder depth = content) · RecoverySelector (اشتباهات به ترتیب، assessment حذف) · SessionCheckpointManager (SPI؛ **resume با rule-version mismatch رد می‌شود**) · DefaultLearningConfigRepository (نسخه‌های ثبت‌شده + isApproved=false).
- **Room v3:** lesson_sessions + lesson_attempts (unique attemptKey؛ فقط IDs+outcome — CONTENT-018) + MIGRATION_2_3 + schema 3.json + RoomLessonRecordRepository (**session upsert + attempt insert در یک transaction؛ تکرار کلید = no-op false**) — تست Robolectric شامل process-death reopen.
- **تست‌ها (همه سبز):** golden replay دوبار یکسان؛ duplicate idempotency (ارزیابی فقط یک‌بار)؛ boundary (advance خارج نوبت/عقب‌گرد/ID خالی رد)؛ unconfigured evaluator fail-closed؛ checkpoint round-trip + version mismatch + missing؛ graph cycle/missing-prereq؛ mastery edges با handle تستی و refusal بدون handle؛ hint ban + ladder؛ recovery queue؛ DB: one-tx/idempotency/reopen/CONTENT-018 string check.
- **دو تصحیح در حین پژوهش:** MacroStage واقعی P1_DISCOVER..P5_TRANSFER + HINT_BANNED موجود در core:model استفاده شد؛ helper تست DB sessionId را از خود attemptKey می‌گیرد (سگمنت دوم).
- **شواهد (exit code):** android:gate = PASS · ANDROID_MODULE_GRAPH = PASS (222 فایل) · verify:static:all = PASS (92/92) · verify:repository = PASS (551/1885) · schema 3.json committed.
- **صادقانه:** بدون O1 هیچ evaluator واقعی؛ بدون CONTENT-014 هیچ policy computation؛ wiring به UI انجام نشد (UI فعلی سرور-محور باقی مانده تا O3)؛ golden fixtures واقعی per-template بعد از انتخاب O1 (الگوی test-vectorهای ADR-0043)؛ T13/T01-tray/T05 proofها ثبت‌شده‌ماند.

## 2026-11-13 — IPA-P7 (Content Pipeline — schemas/validator/promotion/packaging) — branch infra/p7-content-pipeline

- **بررسی کامل:** derived indexes (stations/patterns/audio/source-audit/source-sha256)، integration docs، **قرارداد سه‌لایهٔ موجود N06-01/09/11 در packages/contracts/content-projection.ts** (AuthoringStation/Published/Child + publishForDelivery/projectForChild + ۱۵ تست — نقطهٔ extend، نه duplicate)، ST07 pilot (۱۴ بخش، ۱۸۰۲ خط)، audio manifests (۵۳ ردیف DRAFT)، CONTENT-001..018 (۱۶ OPEN + ۲ GUARDED). Originals فقط خوانده شدند — **byte-protection اثبات‌شده در verifier** (re-hash همه).
- **چهار مدل جدا:** AuthoringStation (`content-library/authoring/stations/ST07.json` — evaluatorConfig با pilotAnswerAnchor به originals؛ پاسخ‌ها فقط با anchor نه کپی) / PublishedStationPackage / ChildLessonProjection / LocalEvaluatorDefinition (درز O1، ADR-0044).
- **۸ کامپوننت در `tools/content-pipeline/`**: Typed schema (قرارداد contracts) · ContentValidator (۱۳ خانواده rule id پایدار) · ContentPromotionGate (**lifecycle ۷مرحله‌ای sequential؛ ledger append-only با at/actor/evidence؛ HUMAN_REVIEWED/APPROVED فقط با فایل evidence انسانی که ابزار نمی‌تواند بسازد؛ ENABLED فقط با marker امضای مالک**) · AssetManifestBuilder (۵۳ ردیف صوت، delivered=false صادقانه) · PackageBuilder (manifest PROPOSED ADR-0043، **UNSIGNED — امضا مالک**) · Child Projection Builder (publishForDelivery/projectForChild قراردادی) · ContentDiffReporter (removed keys + leak check + drift) · CLI چهارفرمانه.
- **fixtures:** ۷ منفی (duplicate-id/prereq-cycle/prereq-unknown/taught-numeral/unknown-template/source-hash-drift/item-count-drift) + leaked-projection (CONTENT-008) — همه با rule id موردانتظار reject شدند.
- **Gate استاتیک جدید** `verify-content-pipeline.mjs` (۹۳مِ static:all): artifact واقعی → فقط ۴ review-role gap (درست در MAPPED_TO_REPO)؛ gates روی ledger موقت (HUMAN/ENABLED refuse)؛ ledger واقعی دست‌نخورده؛ build-package روی unapproved → REVIEW_ROLES_INCOMPLETE؛ originals re-hash.
- **CLI/Gradle تکرارپذیر:** `npm run content:pipeline` + `gradlew contentPipelineValidate` (فلگ --machine-only برای مراحل pre-review؛ مسیر مطلق اسکریپت — rootProject دو سطح بالاست).
- **سند:** `docs/content/CONTENT_PIPELINE_FA.md` (مدل‌ها، lifecycle/Gateها، جدول ۱۳ بررسی، نگاشت Source→Published، **gap report**: O1/O2/O7، CONTENT-009/010/014، stage-mapping confirmation، review evidence، rights review، signed release).
- **شواهد (exit code):** android:gate = PASS · ANDROID_MODULE_GRAPH = PASS (222 فایل) · verify:static:all = **PASS (93/93)** · verify:repository = PASS (552 فایل/1891 یال) · gradlew contentPipelineValidate = PASS · CONTENT_PIPELINE verifier = PASS.
- **صادقانه:** فقط ST07 (تألیف ۲۴ ایستگاه = فاز بعد)؛ هیچ پکیجی امضا/منتشر نشد؛ review evidence انسانی وجود ندارد (درست است)؛ ENABLED بدون marker مالک مسدود؛ پاسخ‌ها با anchor به originals ارجاع می‌شوند نه کپی (single source of truth؛ originals byte-protected).

## 2026-11-13 — IPA-P8 (ST07 Vertical Slice — اثبات زنجیرهٔ کامل) — branch infra/p7-content-pipeline

- **زنجیرهٔ کامل اثبات شد:** draft package ساخته/امضاشده روی دستگاه (کلید EC ephemeral — debug trust فقط) → ContentPackageActivator (stage→verify→pointer اتمیک→registry ACTIVE) → Loader re-verify → projection (8 آیتم P2 + 2 گام P1) → LocalLessonEngine P1..P5 → DebugSt07Evaluator (پاسخ‌های T15 فقط در همین لایه — O1 option-1 shape) → RoomLessonRecordRepository (Room v3، یک transaction هر attempt، idempotent) → checkpoint suspend/resume (FileCheckpointStore مالک‌دار debug). Release fail-closed اثبات شد: trust خالی production، draft package را حتی اگر leak شود reject می‌کند و pointer ساخته نمی‌شود.
- **رفتار کودک‌وار:** تلاش اول گزینهٔ اول؛ INCORRECT → retry با پاسخ درست (بازخورد فوری ADR-0039 §6) — ۱۱ attempt (۸ آیتم + ۳ retry)، ۴ evaluated-correct، **۴ honest gap** (T13 stroke/T01 tray — بدون جعل).
- **تأیید Templateها بر اساس واقعیت نه نام:** T15 فعال با answers از pilot (correctOptionId صریح — ترتیب shuffled در pilot اثبات کرد که اشتقاق موقعیتی نادرست است)؛ T05 با ShomaraPatternRule.accepts قطعی؛ T13/T01 ارزیابی ندارند → AWAIT_POLICY صادقانه.
- **سناریوهای سبز:** full chain (Robolectric روی SQLite واقعی) · force-stop→reopen (۱۱ attempt سالم) · corrupted package fail-closed · schemaVersion=9 reject · release fail-closed · missing audio → متن فارسی (audio index؛ بدون جعل پخش) · asset missing → Absent · CONTENT-018 (فقط IDs+outcome).
- **Device evidence (emulator-5554، AVD موجود):** debug APK 17,275,031 B SHA-256 7b88b37e… نصب/اجرا/لانچ؛ deep link lesson/ST07؛ **airplane ON + force-stop + cold start سالم**؛ `connectedDebugAndroidTest St07VerticalSliceDeviceTest` = BUILD SUCCESSFUL — زنجیره روی SQLite واقعی دستگاه (پس از تست AGP uninstall می‌کند — از این رو run-as بعدها unknown؛ اثبات DB داخل تست با خواندن Room). اسکرین‌شات‌ها: artifacts/p8-device/01..03.
- **اصلاحات جانبی در حین اجرای device:** compose BOM به :app androidTest + جایگزینی API حذف‌شدهٔ assertDoesNotExist با assertCountEquals(0)/onAllNodes در ۵ فایل androidTest (۳ app + lesson + designsystem) — رفتار تست دست‌نخورده؛ deps: room-runtime/contentpackage/learning در :app(+androidTest room).
- **شواهد (exit code):** android:gate PASS · connectedDebugAndroidTest PASS · verify:static:all 93/93 · module-graph PASS (222) · repository PASS (552/1891).
- **صادقانه/مسدودکننده‌ها:** production-ready عنوان نمی‌شود (بدون O1/O2/O7/Human review)؛ preview UI هنوز از wiring hardcoded می‌خواند (اتصال UI به slice = باقیمانده)؛ P4/P5 pilot در projection transcribe نشده (honest gap)؛ T13/T01 evaluator ندارند؛ ENABLED/APPROVED بدون evidence انسانی مسدود.

## 2026-11-14 — IPA-P9 (Media Pipeline + Curriculum Matrix — آمار بازبینی‌شده) — branch infra/p7-content-pipeline

- **بازبینی آمار با validator جاری (مأموریت §اول) — همه تأیید، تغییر نکرده:** ۲۵ ایستگاه در stations-index · ST07 تنها pilot transcribe-شده · ۲۳۲ ردیف صوت DRAFT (179 global + 53 ST07) · **صفر باینری صوت** (find → 0) · **صفر asset تصویری ایستگاهی** (۷۵ تصویر موجود همگی project-design-v2 برند/کاراکترند؛ ۳۶ token تصویری pilot بدون فایل) · ۱۸ issue. گزارش به‌روزرسانی لازم نداشت — ثبت شد در MEDIA_PIPELINE_AND_CURRICULUM_FA.md §1.
- **Asset Registry + Asset Metadata Validator** (`lib/media.mjs`): فرمت از هدر sniff (wav/ogg/mp3/flac/png/webp — پسوند اعتماد نمی‌شود)؛ **silence detection با RMS روی PCM واقعی** (فایل بی‌صدا = `audio-silence` reject — قاعدهٔ صریح مأموریت)؛ hash recompute/mismatch reject؛ placeholder-name reject؛ فایل غایب reject؛ provenance (source/recordedBy/rightsStatus) الزامی؛ duration واقعی از WAV header؛ PNG dims از header. رجیستری واقعی: **۰ asset** (صداقت: متادیتا ≠ تحویل).
- **Image/Audio Pipeline checks** همان validator است — Optimizer/Normalizer تبدیل واقعی پس از تحویل اولین فایل معرفی می‌شود (gap ثبت؛ بدون ساخت ابزار صوری).
- **Missing/Orphan/Impact Reporter** (`lib/report-missing.mjs`): ST07 audio missing=53 · image tokens missing=36 · orphan=0 · impact: HUMAN_REVIEWED→APPROVED→ENABLED مسدود با صوت/تصویر واقعی؛ ۲۴ ایستگاه NOT_AUTHORED.
- **Curriculum Matrix نسخه‌دار** (`authoring/matrix/curriculum-matrix.json` + generator): ۲۵ ایستگاه × ۱۴ فیلد مأموریت با وضعیت صادقانه (ST07=PROTOTYPE_DRAFT؛ بقیه=NOT_AUTHORED) + **batches A–E طبق ADR-0039 §7** با ۴ نقش review مستقل — status=PLANNED. هیچ مقدار جعل نشد.
- **ST07 process template تا VALIDATED روی ledger واقعی:** MAPPED_TO_REPO→STAGED→VALIDATED با evidence tool-run (machine gates)؛ **HUMAN_REVIEWED صادقانه refuse شد** (فایل evidence انسانی الزامی — ابزار نمی‌تواند بسازد).
- **Media verifier (۹۴مِ static:all)** با WAV fixtures واقعی تولیدی در test (sine tone ۴۰۰۰ sample): real tone accepted (duration parsed 0.5s؛ RMS>0)؛ silence/hash-mismatch/placeholder/missing همه reject؛ image dims parse؛ inventory consistency (232/0/0؛ 53+36 missing)؛ impact check.
- **اصلاح وابسته:** verifier محتوای P7 حالا **state را از ledger مشتق می‌کند** (hardcode MAPPED_TO_REPO پس از ارتقای واقعی VALIDATED شکسته بود) — gate simulation از وضعیت فعلی dynamic شد؛ `ledger-untouched` نسبت به pre-state سنجیده می‌شود.
- **شواهد (exit code):** android:gate PASS · verify-media-pipeline PASS · verify-content-pipeline PASS · verify:static:all = **PASS (94/94)** · verify:repository = PASS (553 فایل/1896 یال) · matrix json committed · ledger واقعی: ST07=VALIDATED.
- **صادقانه/گپ‌ها:** تألیف ۲۴ ایستگاه = کار تیم محتوا (۲۴×۱۴ فیلد)؛ ۵۳ باینری صوت + ۳۶ تصویر ST07 تحویل نشده؛ O1/O2/O7 باز؛ Optimizer/Normalizer تبدیل واقعی پس از اولین تحویل؛ **هیچ SOURCE بدون evidence انسانی به APPROVED ارتقا نیافت**؛ بودجهٔ O7 پس از اندازه‌گیری media واقعی (هیچ عدد فرضی ثبت نشد).

## 2026-11-14 — IPA-P10 (Local identity + Parent PIN + Privacy foundation) — branch infra/p10-identity-privacy

- **بررسی اولیه:** ProfileDraft (name/avatar/grade در DataStore) · Settings (avatar/motion) · ParentBoundary (fail-closed re-auth) · Manifest (allowBackup=false، صفر permission) · Data inventory کامل شد (۸ محل داده؛ جدول در ADR-0047 §2).
- **وضعیت O5 ثبت صادقانه:** OPEN → **بدون schema چندپروفایلی و بدون launch flow**؛ single slot پیش‌فرض؛ `createSecondProfile` تا تصمیم مالک throw می‌کند (O5 seam).
- **کامپوننت‌ها در ماژول جدید `:core:profile`:** **ParentPinManager** — PBKDF2WithHmacSHA256 با 210,000 iteration + salt per-install + **constant-time verify**؛ سیاست retry/lockout نسخه‌دار v1 (۵ خطا → ۳۰s doubling تا ۱۵ دقیقه؛ counter پایدار در store — process death نمی‌تواند lockout را دور بزند؛ PIN طول ۴..۸) · **LocalProfileManager** (save/read/delete؛ deleteProfile) · **PrivacyDataController** — wipe orchestration fail-safe روی همهٔ storeها و دایرکتوری‌ها (failures جمع می‌شود؛ پاک‌سازی ادامه می‌یابد) · **BackupPolicyController** (backup-policy:v1-none — منبع یگانهٔ سیاست) · **SafeDiagnostics** (scan VALUE-side: phone/PIN-shape/email + کلیدهای حساس) · **DeviceKeyManager: ارزیابی شد — لازم نیست** (PIN با PBKDF2 بدون secret key؛ Keystore فقط با O1/O2 secret material وارد می‌شود — ثبت تصمیم).
- **Manifest hardening واقعی:** `android:dataExtractionRules="@xml/data_extraction_rules"` اضافه شد (API-31+؛ cloud-backup و device-transfer همهٔ domainها exclude) — هم‌راستا با BackupPolicyController.
- **Verifierهای جدید:** foundation verifier assertionهای manifest privacy (allowBackup=false/fullBackupContent=false/dataExtractionRules/صفر uses-permission — به‌صورت includes برای پرهیز از regex/XML hazard) · module-graph **R10**: debug types خارج src/debug ممنوع. دو SyntaxError رفع شد (comment break با */ و regex XML-path).
- **تست‌ها (۱۲ سبز):** PIN hashed-never-plaintext؛ correct/wrong؛ **lockout با persist در store** (process death نمی‌تواند دور بزند)؛ correct-during-lockout reject؛ طول مرزی؛ deletion همهٔ storeها+دایرکتوری‌ها؛ fail-safe wipe (store خراب مانع بقیه نمی‌شود)؛ backup policy v1؛ no-PII value scan؛ diagnostics key scan.
- **شواهد (exit code):** android:gate PASS · verify-android-foundation PASS (18 modules + manifest privacy) · module-graph R10 PASS (232 فایل) · verify:static:all = **PASS (94/94)** · verify:repository = PASS (553/1896) · ADR-0047 committed.
- **صادقانه:** PIN UI روی parent surface wire نشد (component+tests؛ wiring = فاز محصول) · Keystore استفاده نشد (ارزیابی ثبت) · assembleRelease همچنان ممنوع (HG-05) — بررسی Release APK با manifest assertions + compile-time debug isolation + R10 پوشش داده شد؛ multi-profile integration test با ساخت ممکن نبود (O5 gate عمداً throw می‌کند).

## 2026-11-14 — IPA-P11 (O6 Decision Pack — بدون اجرا) — branch infra/p10-identity-privacy

- **وضعیت O6 صادقانه:** OPEN → طبق مأموریت صریح مالک، **فقط Decision Pack** تهیه شد؛ **هیچ حذف، هیچ گسترش production، هیچ تغییری در runtime کودک** انجام نشد.
- **Inventory ماشین‌خوان از وضعیت واقعی repo** (`node tools/o6-inventory.mjs` → `docs/notes/o6-pack/inventory.json`): **۴۹ API route** (فهرست کامل endpoint-by-endpoint با dynamic segmentها) · **۷۴ migration** · **۸ فایل InMemory repo** · child runtime coupling = NONE (اثبات P5/P6/P8).
- **Decision Pack** (`docs/notes/O6_DECISION_PACK_FA.md`): سه مسیر اجرایی با کارهای گام‌به‌گام —
  **A** Retain as authoring service: persistent repos ×۸، Object Storage + signed URLs + checksum، RBAC/RLS/session/CSRF/rate-limit/audit، ۷۴ migration روی Local Supabase + Integration test چهار نقش، backup/restore، deploy separation — بزرگ‌ترین برنامه.
  **B** ⭐ توصیهٔ فنی (غیرمصوب): authoring محلی + export پکیج امضاشده؛ زیرساختش از P7 آماده (pipeline + validator + gate + builder)؛ باقی‌مانده: sign CLI مالک + archive/deprecation + verifier R11؛ retire ترتیبی auth→learning→sync→missions→teacher→admin با consumer-proof؛ ۷۴ migration archive و نگه‌داشت (هیچ SQL پاک نمی‌شود).
  **C** Retire کامل با archive (بازگشت‌ناپذیرترین).
- **ماتریس تصمیم** بر ۵ معیار (هم‌راستایی ADR-0039/هزینه/نگه‌داری/ابزار authoring/امنیت) — توصیه: B.
- **قانون اجرا پس از تصمیم:** هر گزینه فاز مستقل خودش؛ verifier R11 (archive-import ban) با اولین commit گزینه.
- **شواهد (exit code):** verify:static:all = PASS (94/94) · verify:repository = PASS (553/1896) · android:gate = PASS · inventory committed.
- **صادقانه:** هیچ گزینه‌ای اجرا نشد؛ این فاز فقط بستهٔ تصمیم است؛ child runtime در هر سه گزینه بدون Backend می‌ماند.

## 2026-11-14 — IPA-P12 (UX Architecture & Journey Contracts — بدون بازطراحی Home) — branch infra/p12-ux-architecture

- **بررسی کامل:** PAGE_UIUX_BLUEPRINT (۱۷ خانواده با outcome/focal/CTA/depth/states/rejects) · SCREEN_LEDGER (۲۳ ردیف Expo/V2، همه NATIVE_PENDING) · NATIVE_IMPLEMENTATION_BACKLOG (UI-001..013+) · ROUTE_REGISTRY (۱۵ مسیر Expo→Native destination) · ADR-0039 §6/§7 + ADR-0040.
- **وضعیت Home صادقانه:** فایل handoff نهایی Home در repo موجود نیست → **Home visual = BLOCKED**؛ فقط قرارداد داده/Interaction/State (§6 سند) تعریف شد؛ هیچ طرح جایگزینی ساخته نشد.
- **تحویل ADR-0048 (`design/playbook/UX_ARCHITECTURE_MAP_FA.md`):**
  - **UX Architecture Map**: shell سه‌تب + سه جریان (ورود 01–05، درس 07→08–11+13، من 14–15) + System states 16.
  - **Journey diagram**: onboarding→profile→placement(calibration)→first lesson→Path→Station→P1..P5→Result/Recovery→Mistake Review→Path؛ Practice→درس→Path؛ Me→Avatar/Settings/Guardian.
  - **Screen contract matrix ۱۷×۱۰ فیلد**: entry/exit، هدف، CTA per state، ۶+ state الزامی، Back/Resume، دادهٔ لازم، ViewModel UiState/Events، a11y focus order، motion intent — همه مطابق قراردادهای موجود blueprint (هیچ تخلفی از ۱۷ خانواده اضافه نشد).
  - **State/event catalog درس**: LessonUiState + ۹ Event + ۶ Effect با قواعد single-flight/hint-ban/manual-advance.
  - **Navigation/Back/Resume contract**: ۸ سطح (Tab/Path/Start/درس/Assessment/Guardian/DeepLink/ProcessDeath) — Back درس = دوگام confirm؛ Assessment صریح‌تر؛ Guardian fail-closed.
  - **قرارداد Home**: فقط data/interaction/state؛ ممنوعیت‌های ADR-0039 §6 در متن.
- **Gap list (۹ مورد):** engine→UI wiring صفر؛ Home BLOCKED؛ Family 03 حذف = Phase 2؛ P3 evaluator جز T05 وابسته O1؛ P4/P5 projection transcribe نشده؛ Practice review از engine؛ Guardian→PIN محلی (O3/O5)؛ missions legacy؛ TalkBack/predictive-back device evidence.
- **بدون تغییر کد:** این فاز docs-only است؛ هیچ ViewModel/کدی نوشته نشد (contracts برای U3/U4 آینده).
- **شواهد:** static:all 94/94 (بدون تغییر)، verify:repository PASS، ledger/START_HERE به‌روز.

## 2026-11-14 — IPA-P13 (Design System Library — Clay واقعی) — branch infra/p13-design-library

- **Audit کامل:** tokens.json v2 (clay.levels ۴tier؛ SOFT/FEATURED/answerTile specs موجود؛ **hint/flat specs غایب**) · ShomaraTokens.kt generated · ShomaraTheme (4 typography style: Display/Title/Body/Caption) · ShomaraButton (clayDepth mapping + single-flight) · ShomaraCard/ChoiceTile (maxFeaturedSurfaces=1) · ShomaraMotion (ShomaraPressFeedbackLogic spring/sink؛ CelebrationGate) · ShomaraReducedMotion (CompositionLocal) · ShomaraStateSurface · ShomaraNavigation · ShomaraManipulative · **صفر @Preview** · PathGraph node rendering قفل در feature:path.
- **Token gap پر شد:** `v2.clay.hint` (border 1/shadow 0.04/radius 6/offsetY 2/elevation 1) و `v2.clay.flat` (همه صفر) به tokens.json اضافه و با codegen بازتولید شد — resolver چهار-tier کاملاً token-driven شد.
- **کامپوننت‌های جدید (بدون duplicate):** `ClaySurface` + `shomaraClay/shomaraClayAnimated` (۴ tier، press=scale+sink با spring/snap reduced-motion، shadow فقط روی سطح — **متن هرگز سایه نمی‌گیرد**) · `ShomaraIconButton` (۴۸dp، semantics label الزامی) · **LessonKit**: UnitHeader/LessonProgressHeader (اعداد فارسی، remaining-work)/LessonActionBar (یک CTA primary)/HintCard/GuideBubble/ResultSummary/RecoveryCard · **PathKit**: ShomaraPathNode/ShomaraPathConnector (redundant encoding: fill+mark+label همه متفاوت — تست‌شده؛ CURRENT=FEATURED, LOCKED=FLAT) · **Previews.kt**: @Preview light+RTL برای همه.
- **نگهداری Design Guard:** verify-design-system-native همهٔ dp خام را گرفت — همه به Space/Component tokens map شدند (تک‌تک؛ raw=0) — NATIVE_DESIGN_GUARD: PASS (81 فایل).
- **تست‌ها:** ClayContractTest ۶ تست — ascending tier weight، generated-token equality، flat صفر، redundant encoding یکتا، CURRENT-only FEATURED، no-PII bridge.
- **Gallery:** DesignSystemGalleryActivity (debug-only) با RTL toggle؛ device screenshots: artifacts/p13-device/gallery-ltr.png + gallery-rtl.png.
- **شواهد (exit code):** android:gate PASS · NATIVE_DESIGN_GUARD PASS (81 فایل، raw=0) · static:all 94/94 · repository PASS (553/1896) · ClayContractTest 6/6 سبز.
- **صادقانه:** Paparazzi در این محیط نیست — screenshot regression با gallery activity + device captures ارائه شد؛ gate CI برای screenshots gap ثبت؛ Home دست‌نخورده (handoff BLOCKED)؛ PathGraph feature:path هنوز از rendering خودش استفاده می‌کند (migration به PathKit = debt ثبت‌شده)؛ OptionCard به‌عنوان wrapper روی ChoiceTile (سازگار با answerTile tokens).

## 2026-11-14 — IPA-P14 (Lesson Experiences — engine→UI wiring واقعی) — branch infra/p14-lesson-experiences

- **وصل‌کردن engine به UI واقعی (gap #1 از P12):**
  - `ShomaraGuidedStage` حالا callback `onAttemptEvaluated(encounterId, attemptIndex, outcome)` دارد — بعد از هر ارزیابی واقعی evaluator صدا می‌خورد.
  - `ShomaraLessonHost` param جدید `lessonRecords: LessonRecordRepository?` — debug wiring از ShomaraApp می‌گذرد؛ release null (fail-closed).
  - `ShomaraApp` param جدید `lessonRecordRepository` از container می‌گیرد؛ debug wiring آن را به host می‌دهد.
  - **نتیجه: هر «بررسی» tap → evaluator → outcome → Room v3 attempt (فقط IDs + outcome — CONTENT-018)**.
- **T15:** فعال و واقعی — select→check→evaluator→correct/retry→hint ladder→advance؛ روی دستگاه کار می‌کند (02-lesson-ST07.png).
- **T05:** ShomaraPatternRule.accepts قطعی — بدون O1 secret؛ round structure موجود.
- **T13/T01:** render + AWAIT_POLICY صادقانه (بدون ارزیابی جعلی — O1 باز).
- **P4/P5:** honest not-transcribed (بدون جعل محتوا).
- **شواهد (exit code):** android:gate PASS · verify:static:all 94/94 · verify:repository PASS (553/1896) · APK debug SHA-256 ade6a6e7… · device screenshot artifacts/p14-device/lesson-ST07.png.
- **صادقانه:** Home visual BLOCKED؛ P4/P5 محتوا transcribe نشده؛ T13/T01 ارزیاب ندارند؛ engine→UI wiring هنوز فقط در guided stage فعال است (discover/game/result از renderers موجود می‌آیند)؛ multi-profile منتظر O5.

## 2026-11-14 — IPA-P15 (Production Readiness Assessment — BLOCKED) — branch infra/p14-lesson-experiences

- **Release compile:** compileReleaseKotlin PASS — R8/minify فعال؛ ui-tooling-preview به implementation اضافه شد (@Preview compile-time only)؛ debug isolation compile-time اثبات.
- **Emulator timing (labeled — نه production claim):** cold start 2741ms؛ warm 2574ms؛ PSS 91MB؛ APK debug 17.8MB — physical device benchmark بعد از HG-05.
- **Release criteria audit:** targetSdk=36 ✓ · compileSdk=37+37.0 ✓ · zero permissions ✓ · allowBackup=false ✓ · dataExtractionRules ✓ · R8=true ✓ · debug isolation ✓ · Room migrations ✓ · no-PII logging ✓.
- **Security closure:** PBKDF2 PIN (210k) · ForbiddenFieldGuard · projectionViolations · R10 debug isolation · signed package (ECDSA P-256) · no network — همه تست‌شده.
- **Accessibility static audit:** contentDescription، mergeDescendants، Role، LiveRegion، touchMin=48dp، manipulative 72-80dp، RTL root، reduced-motion CompositionLocal، typography token-driven. TalkBack real gesture = BLOCKED (دستگاه فیزیکی).
- **Production Readiness Report:** BLOCKED — ۷ P0 + ۷ P1 + ۳ P2 فهرست دقیق در PRODUCTION_READINESS_REPORT_FA.md. مسیر رسیدن به PASS: O1/O2/O5/O6/O7/HG-05 → authoring ۲۴ ایستگاه → media واقعی → signing → device benchmarks.

## 2026-11-15 — IPA-P14b (Home UI implementation from handoff v3) — branch infra/p14-lesson-experiences

- **Handoff v3 ZIP:** 115 فایل — design spec, 32 VectorDrawable, 35 SVG source, Kotlin reference components, UiState contract, character integration, QA checklist.
- **Assets installed:** ۳۲ VectorDrawable → core/designsystem/res/drawable · Fandogh → drawable-nodpi/shomara_char_fandogh_01.webp · SVG sources → design/playbook/assets/home-handoff-v3/
- **HomeUiState (immutable)**: ShomaraHomePathUiState با nodes/progress/continueStation/currentStationId/scrollAnchor + ShomaraHomePathEvent (۶ intent) — از handoff v3 دقیق.
- **HomePathScreen**: HomeHeader (RTL, character slot 72dp Main) → ChapterProgressCard → ContinueStationCard (violet CTA) → PathNodes + Connectors → PathFab — همه از handoff v3 components با adaptation به ShomaraTokens موجود.
- **Attempt persistence wiring**: ShomaraGuidedStage → onAttemptEvaluated → ShomaraLessonHost → lessonRecords (Room v3) → سطر واقعی برای هر بررسی tap.
- **شواهد**: feature:path compile PASS · android:gate PASS · static:all 94/94 · repo PASS.
- **صادقانه**: این پیاده‌سازی UI-only است؛ اتصال به Room/ProgressionEngine از فاز P8 slice آماده؛ TalkBack walkthrough دستگاهی pending؛ Home visual design handoff BLOCKED از P12 اکنون UNBLOCKED (بسته در دسترس).

## 2026-11-17 — IPA-P14c (Home UI wired into real shell) — branch infra/p14b-home-ui

- **اتصال واقعی Home UI به tab مسیر:** ShomaraChildShellHost Path tab حالا HomeHeader + ChapterProgressCard + ContinueStationCard بالای ShomaraPathScreen رندر می‌کند؛ گراف زیگزاگی/nodeها/فصل‌ها دست‌نخورده. هیچ navigation دوم/موازی ساخته نشد.
- **Continue Station Card** به Station Start Sheet واقعی وصل شد (شروع/ادامه از real progress).
- **HomeHeader settings** به shell/settings واقعی وصل شد (همان NavHost destination).
- **Design tokens:** رنگ‌های handoff v3 (HomeViolet/HomeCanvas/HomeInk/...) به tokens.json canonical اضافه شدند + codegen — ShomaraHomeUiTokens حالا alias به ShomaraTokens است؛ **هیچ raw Color(0x) در فایل‌های جدید**.
- **Design Guard:** screen-local exclusions حذف شدند — ShomaraHomeComponents/Screen/UiTokens از بررسی مستثنا نیستند؛ همهٔ dp/sp/color از tokens می‌آیند.
- **VectorDrawable fix:** strokeColor="none" از shomara_ui_play.xml حذف شد (invalid AAPT attr).
- **شواهد:** android:gate PASS · static:all 94/94 · repo PASS · APK b9191d94… نصب و اجرا · screenshot artifacts/p14c-home/home-integrated.png.
- **صادقانه:** P4/P5 projection transcribe نشده؛ T13/T01 ارزیاب ندارند؛ TalkBack real walkthrough دستگاهی pending؛ Home visual handoff تایید نهایی می‌خواهد.

## 2026-11-17 — Deep Transformation / DT-01 — branch work/shomara-deep-transformation

- **Baseline:** exact fork point `infra/p14b-home-ui@6cd0e7ac7e69d6d5a6117f38ccbcb9b2bc69eb8c`; source branch and `main` remain untouched.
- **Persistence P0:** `LessonAttemptDao.insert` now uses SQLite `IGNORE`; `RoomLessonRecordRepository.recordAttempt` checks session ownership and writes session + attempt in one Room transaction. A duplicate key for the same session is a no-op without session mutation; a cross-session key collision fails closed.
- **Regression coverage authored:** normal write, duplicate replay without timestamp change, 12 concurrent same-key retries, cross-session collision, mismatched session IDs, close/reopen durability and CONTENT-018 projection. These tests are **written, not run** in this execution environment.
- **Composition root:** actual `container.lessonRecords` is passed MainActivity → ShomaraApp → LessonHost; the root repository argument is required instead of silently defaulting to null. Release remains without draft content/evaluator, so this is not a production lesson claim.
- **Home UX correction:** removed hardcoded grade/chapter and default-zero progress summary; removed the Continue card because it opened the same Station Start Sheet as the Current path node. Header, Path graph, station sheet and tab navigation remain. Do not restore summary until identity-backed UiState is available.
- **Decision register:** `docs/notes/SHOMARA_DEEP_TRANSFORMATION_DECISIONS_FA.md` records KEEP/REVISE/OPEN/SUPERSEDED/BLOCKED, evidence, trade-offs and human gates.
- **Unverified:** Gradle compile/lint/Robolectric, Android instrumentation, screenshot sweep, TalkBack and physical-device tests. No local project runtime/Android SDK is exposed in this session; no exit codes are fabricated.
- **External/product blockers:** O1/O2/O3/O5/O6/O7 remain owner decisions; correction: ADR-0039 already approves fully-offline/no-server product; OTP/token/session is legacy migration debt to retire in Phase 2 after O5; 24 stations, ST07 media, human review/rights remain unfulfilled; P15 release status stays BLOCKED.
- **Code commits:** `ab5bcba`, `6f3a8a9`, `261c6bd`, `d5c9af2`, `ea4a8ed`, `c0a65fb`, `dd91193`.

## 2026-11-17 — DT-02 — Android CI and owner-policy reconciliation

- **Android Native workflow:** run `44158203235`; merge-test commit `143d173aeb587d6735f4700720819ef14922195a`; gate report `build-reports/android/gate.json` = PASS, environment READY, JDK 17 + Android compile SDK 37, preflight exit 0.
- **Gradle command:** `./gradlew test lint :app:compileDebugKotlin --stacktrace --no-daemon` — exit code 0. Android lint and app `:app:compileDebugKotlin` passed in the same gate.
- **Test evidence:** 81 XML suites, 575 tests, 0 failures, 0 errors, 0 skipped. New `LessonRecordRepositoryTest` ran 7/7 PASS, including duplicate idempotency, 12 concurrent retries, cross-session key ownership, session mismatch and close/reopen durability.
- **Workflow:** `ci/core` PASS; `ci/static-core` PASS including real Harness validate/next. Informational `verify:static:all` = 93/94; sole remaining failure is the old Expo `parity-run`, with the same `practice diff 0.50% (max 0.5%)`, `PARITY: FAIL (8/29)` on main CI run 43088599553 (2026-11-11). No golden or threshold weakened.
- **Owner-policy correction:** canonical ADR-0039 is Accepted by owner (2026-11-05): fully offline/no-server, local package + local evaluator, no Phone/OTP in the final journey. OTP/token/session retirement is Phase-2 migration debt after O5, not an open product-policy conflict. O3 (LessonGateway fate) and O5 (single vs multiple local profiles) remain OPEN. No INTERNET permission, live OTP, server sync or mock authentication was added.
- **Home residual P0:** hardcoded summary and duplicate Continue were removed, but root still passes `ShomaraPathProgress()`; graph currently resolves empty progress to ST01 `Fresh`. Returning children can therefore be shown at ST01 incorrectly until approved local identity + Room progress projection are connected. Explicitly tracked for N11-05; no synthetic progress is fabricated.
- **Harness:** N11-02 = DONE_WITH_BLOCKER after real Android gate. N11-04 design-system foundation is now IN_PROGRESS and independent of N11-03 human-authored curriculum; content-specific manipulative design remains gated.
- **Artifact:** `android-gate-diagnostics.zip` contains CI reports only; no APK was built or attached. Physical-device/TalkBack and screenshot gates remain UNVERIFIED.

## 2026-11-18 — DT-03 — Home unresolved state and practice parity correction

- Home progress now defaults unresolved; only a resolved local-child snapshot or explicit emptyResolved() can show Fresh. Deep-linked lesson entry and Station Start Sheet are deferred until resolution.
- Practice tab remains Loading until local profile/progress resolve; it does not label all activities Locked. Compose tests cover deferred deep link and unresolved Practice.
- Parity artifact 14374088460, run 44186937373: practice raw diff 0.5040485829959515%, 1494 bad pixels / 296400 total; maximum remains 0.5%. Actual screenshot had two locks on the unavailable row while golden had one.
- Root cause: parity specimen tabs.tsx supplied icon='lock'; PracticeView.tsx rendered that badge icon and also passed trailingIcon='lock'. Removed the redundant trailingIcon. The badge lock remains; no golden or threshold changed.
- Fix commit ca8067f0e36a27ff75733336a0ec83d25b8362c2. CI run 44189288523 and Android Native run 44189288438 were pending when this checkpoint was prepared.
- Android evidence on ancestor 8ebfa084: Gate PASS; JDK 17, SDK 37, preflight exit 0, Gradle test/lint/app compile/androidTest-source compile exit 0; BUILD SUCCESSFUL. The published gate artifact did not expose a JUnit count. No APK or device test was produced.
- Harness: N11-02 DONE_WITH_BLOCKER; N11-04 DONE_WITH_BLOCKER (Native visual validation pending); N11-05 IN_PROGRESS. O5 remains OPEN.


## 2026-11-18 — DT-05 — Android gate PASS and parity review

- **Branch head:** `7dd835a80f0cde920b34f24a6b06932f5d6942b9`; PR #4 remains a draft against `infra/p14b-home-ui`. Main and candidate branch were not changed.
- **Android Native:** run `44191580216`, conclusion SUCCESS. Artifact `14377826064`, `build-reports/android/gate.json` status PASS. JDK 17 + SDK 37 READY; preflight exit 0; Gradle command `./gradlew test lint :app:compileDebugKotlin :app:compileDebugAndroidTestKotlin --stacktrace --no-daemon` exit 0; BUILD SUCCESSFUL in 3m08s; 822 actionable tasks, 533 executed and 289 from cache.
- **Android boundaries:** four deprecation warnings for `createComposeRule` in instrumentation test source; `:app:compileDebugAndroidTestKotlin` passed. The gate did not run connected/device instrumentation and did not produce an APK.
- **Web/core CI:** run `44191579879`: `core` PASS (package build, typecheck:all, Vitest); `static-core` PASS (Harness validate/next, token-codegen `--check`, verify:static:core); `visual-and-static` fails at parity; static aggregate `93/94`.
- **Parity report:** artifact `14375744795` from run `44191579879`, head `7dd835a`. Current summary: 7/29 specimens fail. Practice now passes at 0.4683% (1388/296400) after removing duplicate lock in `PracticeView`; no golden or threshold changed.
- **Compact replay Button:** source now uses single-line compact label; actual and golden both display one line. Its diff remains 0.7994% (88/11008) vs 0.5% limit, visually concentrated on text/icon pixels. It is NOT marked PASS and no threshold was weakened.
- **Other current parity failures:** phone 0.5052%; button-amber 0.3246% (max 0.15); guide-07 0.9209% (max 0.15); chip-06 2.6282% (max 0.15); chip-icon-clock-06 0.6655%; profile 0.5402%. These require deliberate visual/raster analysis.
- **Baseline:** main CI run `40687075654` (2026-10-28) and `43088599553` (2026-11-11) both had total parity failure 8/29. Their preserved logs explicitly show Practice at 0.50%; current branch has 7/29 after the duplicate-lock fix. The old logs do not preserve all individual failed specimen IDs, so no claim is made that every remaining failure is identical to all historical failures.
- **Harness:** N11-02 stays DONE_WITH_BLOCKER (O5 local identity/progress read-model); N11-04 stays DONE_WITH_BLOCKER (source/JVM and Gradle gates pass; native visual evidence pending); N11-05 remains IN_PROGRESS.
- **Still blocked:** O5, actual local active-child profile/progress projection, content/evaluator owner decisions, human-authored/licensed media, TalkBack/device screenshot catalog, release HG-05. No APK/release was generated.

## 2026-11-18 — DT-06 — Home single-header and dead-screen retirement

- **Home duplicate audit:** reviewed all 38 Kotlin files in the Android app shell/navigation, app tests/androidTests and feature/path. `ShomaraHomePathScreen` had no external consumer; `ShomaraHomeUiState` was only used by that unused screen; Progress/Continue/NodeLabel cards were only composed by that screen. The only shared consumer was `ShomaraHomeHeader` in the active `ShomaraChildShellHost`.
- **KEEP:** the active zigzag `ShomaraPathScreen` remains the only child learning path; shell Header and Station Start Sheet remain.
- **RETIRE:** deleted the unreferenced parallel `ShomaraHomePathScreen.kt` + `ShomaraHomeUiState.kt`; removed the three unused parallel cards; kept a header-only `ShomaraHomeComponents.kt` and four required Home token aliases. Recorded both deletions in `harness/file-ledger.json`.
- **Visual/layout correction:** active shell Home Header now uses 24dp horizontal inset and 12dp vertical spacing, exposes title as a semantic heading, while Path Graph supports `showPathHeading`; shell passes false so title/mascot are not duplicated. Path count and next-step summary remain visible.
- **Regression:** added Compose instrumentation test: exactly one `مسیر یادگیری` heading and remaining-station summary visible.
- **Identity boundary unchanged:** O5 remains OPEN. Home/Practice remain Loading when unresolved; no fabricated progress or new Room profile schema was introduced.
- **Evidence pending:** latest commit requires Android Native and CI. Even if compile/test gates pass, no physical device/TalkBack/screenshot/200% font validation is claimed. Parity thresholds and goldens were not changed.

## 2026-11-18 — DT-07/08 — Path state precedence, PIN and privacy evidence correction

- **Path state correction:** added pure `ShomaraPathGraphLogic.resolveEntryState`. Explicit Error/Empty and explicit Loading are preserved; Offline with unresolved progress now remains Loading, preventing a false fully locked path; resolved Offline still renders the real path. Four state-matrix assertions were added.
- **Android gate:** run `44308240426` on `bc9c1b8` PASS — JDK 17 / Android SDK 37; 81 XML suites, 583 tests, zero failures/errors/skips; `lint`, app debug compile and androidTest Kotlin source compile all passed. `ShomaraPathGraphTest` 33/33, `ParentPinManagerTest` 7/7, `PrivacyAndDiagnosticsTest` 6/6.
- **PIN hardening:** caller char arrays and temporary derived bytes are cleared; malformed records fail-closed; configured status validates salt/hash structure; persisted lockout test now asserts actual stored count and reset timestamp. Test store is in-memory only.
- **KDF correction:** 210k PBKDF2-HMAC-SHA256 is labeled legacy ADR-0047 v1 baseline, not current OWASP guidance. OWASP now prefers Argon2id; if FIPS requires PBKDF2-HMAC-SHA256 it lists 600k. No blind bump was made; target-device benchmark, algorithm/record version and migration are required before wiring.
- **Privacy deletion:** incomplete recursive directory deletion is surfaced as failure when the path remains; later wipes continue. Test proves it. Controller still accepts generic stores/dirs and is not app-composed.
- **ADR-0047 correction:** no `LocalProfileManager`, `ProfileSlotStore` or durable `PinStore` exists in the source tree. ParentGate is still instantiated with `verifier=null`; profile draft store is not a permanent identity. No in-app data deletion flow is currently shipped. O5 remains OPEN.
- **Visual/static:** CI core/static-core are green; visual-and-static remains informational FAIL due 7/29 pixel parity specimens. No golden, threshold or parity baseline was weakened.

## 2026-11-19 — DT-11 — PR4 failed-gate attribution and future Home handoff

- **Scope:** run `44309817949` on HEAD `4cb576f88837d54b07cab8c798c903e6e42d2cfd`; no repeated branch audit, no Base/Draft/main change and no Home ZIP inspection. Sole `STATIC_ALL` failure is `parity-run.mjs`; the other 93 checks pass.
- **Artifacts:** current `14429966821` and parent `14377315357` (run `44190147820`, SHA `3b1889f`) downloaded with existing in-memory GitHub authentication and verified against GitHub SHA-256 metadata. Current digest `3777b100060b57f5211d98fd74df4c22e9d7896d0806b365f00bab8e072c9434`; parent digest `3ecad0b7bdf71891e8817bd08848ecae127bbbc678f2dad85f8319f6e2b097c5`.
- **Attribution:** six non-replay actual/golden/diff triplets are byte-for-byte identical before/after the Button change. Replay improves from 748 bad pixels/6.7951% in the parent to 88/0.7994% at HEAD; parent spans y=15..54, HEAD only one text band y=25..38. This proves a real one-line UI improvement, not a regression. All seven failures pre-date the branch's new changes; no source fix is justified under the regression-only constraint.
- **Image evidence:** programmatic Pillow/NumPy pixel masks, bounding boxes, color pairs and SHA-256 comparisons were used; no unsupported visual-inspection claim. Exact file/region/result matrix is in `docs/design/SHOMARA_DESIGN_SYSTEM_AUDIT_N11_FA.md` §9. No golden, threshold, assertion, workflow or `continue-on-error` change.
- **Executed gates:** `npm ci --no-audit --no-fund` = exit 0 (641 packages); `npm run build:packages` = exit 0. Targeted seven-specimen `node scripts/parity-run.mjs ...` = exit 0, PASS 7/7. One full `npm run verify:static:all` = exit 0, PASS 94/94 including parity 29/29. Local Windows Node 24.22.1 differs from CI Ubuntu Node 22.22.0; Playwright is 1.63.0 and goldens are identical. Local PASS does not replace Linux CI 7/29 FAIL.
- **Android:** no Android file changed; Android Gate not rerun. Independent run `44309817994` remains PASS.
- **Future Home continuation only:** registered `C:\Users\VISION LAPTOP\Downloads\SHOMARA_HOME_UI_HANDOFF_v3_FINAL.zip` in `START_HERE.md`; ZIP remains unopened/unimplemented. Future task must verify manifest/checksum/provenance/assets and state/QA contracts before real Kotlin/Compose implementation with canonical tokens; no fake progress or duplicate Continue restoration.
- **Integration:** PR4 remains on its current Base. It is not ready to retarget to `main` while the Linux visual/static gate remains red.

## 2026-11-19 — DT-12 — Native Home/Path handoff implementation

- **Scope:** Home/Path از `SHOMARA_HOME_UI_HANDOFF_v3_FINAL.zip` روی Kotlin + Jetpack Compose پیاده شد. ZIP با SHA-256 `22dc8a8f0be3de1e47f4db8ebab5f2a230af7d3a54b17e088d018bbf1c04c3ee` باز شد؛ 114/114 checksum داخلی معتبر بود. تنها asset جدیدِ لازم `shomara_garden_path_footer.webp` است؛ 31 vector قبلاً byte-identical در repo بودند و هیچ preview/mockup وارد runtime نشد.
- **Implementation:** `ShomaraHomeScreen` stateless با `ShomaraHomeUiState`/action contract ساخته و به `ShomaraChildShellHost` وصل شد. Header تک‌عنوانه، خلاصهٔ واقعی مسیر، گراف قبلی، باندهای فصل، nodeهای Fresh/Current/Completed/Perfect/Locked، Station Start Sheet، FAB بازگشت به Current و Loading/Empty/Offline/Error حفظ/پیاده شدند. Continue تکراری برنگشت.
- **Structure:** `ShomaraPathGraph.kt` به orchestration محدود شد؛ state/geometry به `ShomaraPathState.kt`، chapter band به `ShomaraPathChapter.kt` و node/connector/ring به `ShomaraPathNodes.kt` منتقل شد. `ShomaraStateSurface` فقط با icon/container اختیاری سازگار با مصرف‌های قبلی گسترش یافت. هیچ dependency جدیدی اضافه نشد.
- **Tests:** `ShomaraPathGraphTest` = 36/36؛ instrumented `ShomaraHomeScreenTest` = 4/4 روی `Pixel_6a`/emulator-5554 (360/390/412dp، font scale 100/200%، semantics، 48dp، Loading/Empty/Offline/Error، click intent)؛ `ShomaraStationSheetTest` = 7/7 (sheet، locked، deep link، replay). `npm run android:gate` = exit 0؛ report `build-reports/android/gate.json` PASS؛ 81 XML suite / 586 JVM tests / 0 failures/errors/skips؛ lint و هر دو compile سبز.
- **Screenshots:** نه PNG واقعی از instrumented Compose (نه Preview) در `build-reports/android/home-screenshots-stage3/compose-evidence/` کشیده شد؛ ابعاد 945/1024/1080×2100 برای 360/390/412dp با density دستگاه و stateهای Fresh/Current/Error/Offline. این خروجی generated است و track نمی‌شود.
- **Gates:** `verify-design-system-native` PASS؛ token codegen `--check` PASS؛ `verify:design-governance` PASS؛ `verify:repository` PASS با هشدار شناخته‌شدهٔ Node محلی 24.22.1 در برابر pin 22.22.0؛ `verify:static:all` = 94/94 PASS؛ Harness validate = 129 task / 13 phase PASS و `next` همچنان N11-05 را IN_PROGRESS نشان می‌دهد.
- **Blockers:** O5 همچنان OPEN است؛ ViewModel/UseCase/Repository مبتنی بر هویت محلی ساخته نشد و production root unresolved می‌ماند. TalkBack gesture walkthrough، physical-device review، deep-link روی device و 7/29 web parity debt باقی‌اند؛ golden/threshold تغییر نکرد.

## 2026-11-19 — DT-13 — Home/Path rebuild + consumer-proven retirement

- **Scope:** بازسازی اصولی Home و مسیر یادگیری روی همان شاخه، حذف فایل‌های اضافه با اثبات صفر-مصرف‌کننده، و انتقال قرارداد از یک انتزاع موازی به رندر واقعی. هیچ verifier/assertion/threshold/golden تضعیف نشد؛ O5 دست‌نخورده ماند و هیچ state یا پیشرفت ساختگی اضافه نشد.
- **Home/Path UX (fix واقعی):** خلاصهٔ جهت‌یابی قبلاً اولین ردیف `LazyColumn` بود، پس وقتی لیست با `initialFirstVisibleIndex` روی ایستگاه Current باز می‌شد (سناریوی واقعی کودک برگشتی) فصل، گام بعدی و شمارش باقی‌مانده کاملاً از دید خارج می‌شدند. حالا `ShomaraHomeOrientationStrip` بیرون از لیست pin شده است و همیشه دیده می‌شود. هندسهٔ ایندکس به «فقط ردیف‌های مسیر» تغییر کرد (`chapterBandIndexForChapter`: band فصل ۱ = 0، stride = 7) و `headerItemIndexForChapter` حذف شد.
- **Semantics/visual:** `contentDescription` تکراری نوار پیشرفت حذف شد (متن مرئی حامل جمله است، نوار فقط progress را اعلام می‌کند)؛ `depthFor(state)` اضافه و در رندر واقعی مصرف شد (Current=Featured تنها، Locked=Flat، بقیه=Soft)؛ آرت پایان مسیر فقط با تکمیل واقعی همهٔ ۲۵ ایستگاه رندر می‌شود؛ متن حباب ایستگاه Current از حقیقت پیشرفت مشتق شد (`currentBubbleLabel`: بدون پیشرفت «شروع»، وگرنه «ادامه» — دیگر روی ST13 «شروع» نوشته نمی‌شود)؛ `ShomaraStateSurface` پارامتر `applySystemInsets` گرفت و تب‌های داخل `Scaffold` دیگر inset دو‌باره نمی‌گیرند.
- **Retirement (consumer proof):** حذف ۲۵ drawable با صفر ارجاع Kotlin/XML (۱۳٬۸۴۸ بایت): ۴ lesson icon، ۶ nav icon، ۵ node-state، ۲ state، ۸ ui icon (شامل `shomara_ui_book` که با حذف آیکون تزئینی خلاصه بی‌مصرف شد). حذف `PathKit.kt` (رندرکنندهٔ موازی مسیر با markهای emoji و Current کهربایی که با فوکال بنفش واقعی تناقض داشت)، `DesignSystemGalleryActivity.kt` (در هیچ manifest ثبت نشده بود و صفر مصرف‌کننده داشت، پس دستور `am start` خودش هم کار نمی‌کرد) و `LessonAttemptRecorder.kt` (صفر مصرف‌کننده). `Previews.kt` از `main` به source set ‏debug منتقل شد. تغییر نام: `ShomaraJumpTest.kt`→`ShomaraJumpAssessment.kt` و `ShomaraJumpTestTest.kt`→`ShomaraJumpAssessmentTest.kt` و حذف ادعای کهنهٔ «تغییر نام فایل ممکن نیست» از KDoc. بازیابی: همه از Git history (`git log --diff-filter=D`).
- **Contract migration (بدون از دست دادن پوشش):** قرارداد PathKit حذف نشد، منتقل شد: `ShomaraPathGraphLogic.depthFor` + سه تست جدید در `ShomaraPathGraphTest` (depth per state، کنتراست متن برچسب ≥4.5:1 روی هر دو بوم، کنتراست نشانهٔ گره ≥3:1 برای هر ۵ state × ۵ فصل) و تست `currentBubbleLabel`. `shomara_char_fandogh_01.webp` عمداً نگه داشته شد: آرت رسمی رزرو‌شدهٔ راهنماست و `ShomaraCharacter` اندروید هنوز عضوی برای Fandogh ندارد — این یک تصمیم مالک است، نه فایل اضافه.
- **Tests:** `ShomaraPathGraphTest` 40/40 (بود 36/36)؛ `ClayContractTest` 3/3 (دو تستِ انتزاع بازنشسته)؛ designsystem 82/82؛ instrumented `ShomaraHomeScreenTest` 5/5 شامل تست جدید `orientationStripStaysPinnedAboveTheListOnAMidPathStation` (با ST07 به‌عنوان Current هم ایستگاه بلافاصله قابل‌اقدام است و هم نوار جهت‌یابی دیده می‌شود، و بعد از scroll تا ST25 نوار جابه‌جا نمی‌شود) و `ShomaraStationSheetTest` 7/7 روی `Pixel_6a`/emulator-5554.
- **Screenshots:** ۱۰ PNG واقعی instrumented Compose (نه Preview) در `build-reports/android/home-screenshots-stage4/compose-evidence/` شامل `home-midpath-strip-390dp.png`؛ ابعاد 945/1024/1080×2100 برای 360/390/412dp. هیچ ادعای بازرسی چشمی مطرح نیست — فقط ابعاد و حجم فایل ثبت شده است.
- **Gates:** `npm run android:gate` = exit 0 (PASS؛ 81 XML suite / 588 JVM tests / 0 failures/errors/skips؛ lint و هر دو compile سبز)؛ `verify:design-governance` exit 0؛ `verify:design-pack` exit 0؛ `verify:repository` exit 0 با هشدار شناخته‌شدهٔ Node محلی 24.22.1 در برابر pin 22.22.0؛ `verify:static:all` 94/94 exit 0.
- **Blockers (بدون تغییر):** O5 همچنان OPEN است؛ production root unresolved می‌ماند و هیچ ViewModel/UseCase/Repository هویت‌محور ساخته نشد. Practice/Me در حالت unresolved صادقانه Loading می‌مانند. TalkBack gesture walkthrough، physical-device review، deep-link روی device و 7/29 Linux web parity debt باز است؛ golden/threshold تغییر نکرد.

## 2026-11-19 — DT-14 — بقیهٔ صفحات: گذرواژهٔ والدین و متن‌های تنظیمات

- **نقص واقعی ۱ (امنیت/UI):** فیلد گذرواژهٔ والدین یک فیلد متنی ساده بود، پس گذرواژهٔ بزرگسال روی دستگاه مشترکِ کودک به‌صورت واضح خوانده می‌شد و TalkBack آن را بلند می‌خواند. `ShomaraTextField` پارامتر `secure` گرفت: ماسک با `OutputTransformation` (چون `BasicTextField` مبتنی بر `TextFieldState` پارامتر `visualTransformation` ندارد — `No parameter with name 'visualTransformation'` از کامپایلر) به‌علاوهٔ semantics ‏`password()`، و شاخهٔ read-only (disabled/loading) با `ShomaraFieldLogic.readOnlyTextFor` ماسک می‌شود تا متن در حالت busy هم نشت نکند. منطق gate دست‌نخورده و همچنان fail-closed است (`verifier == null` هرگز احراز نمی‌کند).
- **نقص واقعی ۲ (کپی/a11y):** در تنظیمات، heading بخش دوم عیناً متن عنوان صفحه بود (`"تنظیمات"` به‌صورت literal با `heading()`)، پس TalkBack عنوان را دو بار می‌خواند و بخش دوم بی‌نام بود. `ShomaraSettingsStrings.PreferencesSection` («تنظیم‌های برنامه») اضافه و canonical شد؛ خط «آواتار انتخاب‌شده» هم از literal دست‌ساز به `ShomaraSettingsStrings.selectedAvatar(...)` با برچسب واقعی `ShomaraAvatarCatalog` منتقل شد.
- **تست:** `ShomaraSettingsTest` 9/9 (دو تست جدید: نبود تکرار عنوان، ساخت خط آواتار از catalog)؛ `ShomaraSettingsWiringTest` 14/14؛ `ShomaraParentBoundaryTest` 9/9 (بدون تغییر)؛ `ShomaraPrimitives03Test` 19/19 با تست جدید «فیلد امن اعتبارش را در شاخهٔ read-only بازتاب نمی‌دهد»؛ designsystem در مجموع 83/83.
- **شاهد دستگاه:** `ShomaraParentGateSemanticsTest` = 3/3 روی `Pixel_6a`/emulator-5554 (semantics ‏`Password` روی فیلد، گذرواژهٔ غلط → gate بسته می‌ماند و پیام خودِ state نمایش داده می‌شود، گذرواژهٔ درست → ورود). رگرسیون: `ShomaraHomeScreenTest` 5/5 و `ShomaraStationSheetTest` 7/7 دوباره سبز.
- **APK:** `npm run android:assemble:debug` exit 0 (`app-debug.apk` ۱۷٬۹۰۲٬۹۴۷ بایت، SHA-256 `15e4d938…8b2cb8`) و `:app:assembleDebugAndroidTest` exit 0 (`app-debug-androidTest.apk` ۱٬۲۲۴٬۳۲۸ بایت).
- **Ledger:** دو ردیف ANDROID برای Settings و Parent boundary اضافه شد (تا پیش از این تنها Home/Path ردیف بومی داشت و این دو صفحه در ledger با ردیف Expo پوشش داده می‌شدند).
- **بازمانده:** O5 باز؛ TalkBack gesture walkthrough و physical-device review برای هر سه صفحه `NATIVE_PENDING`؛ 7/29 Linux parity debt و PR4 بدون تغییر.

## 2026-11-19 — DT-15 — ادغام چهار CTA دست‌ساز onboarding در کامپوننت canonical

- **نقص ساختاری:** چهار CTA مستقل در `feature:onboarding` (`ShomaraLaunchCta`، `ShomaraPhoneCta`، `ShomaraProfileCta`، `ShomaraOtpConfirmButton`) هر یک ماشین‌آلات `ShomaraButton` را بازنویسی می‌کردند: state ‏pressed/focused، colors/depth از `ShomaraButtonLogic`، shadow/background، semantics ‏role/disabled/stateDescription، tap-guard، padding و label — حدود ۳۳۰ خط کد تکراری که باید دستی هم‌زمان نگه داشته می‌شد، و هر کدام هم یک قاعده (مثلاً press-scale یا semantics غیرفعال) را جا انداخته بود.
- **رفع:** `ShomaraButton` سه پارامتر defaulted گرفت — `shape` (نمونه‌های مالک pill هستند)، `disabledContainer`/`disabledContent` (تصمیم مستند «تیره‌ماندن CTA تا پر شدن فیلد») و اسلات `leading` که رنگ content را می‌گیرد تا فلش رسم‌شده هرگز از رنگ برچسب جدا نشود. سپس یک `OnboardingCta` داخلی، هر سه CTA پیلی را پشت یک نقطه می‌آورد و `ShomaraOtpConfirmButton` کاملاً حذف شد (بدنه‌اش از قبل همه‌چیز را به `ShomaraButtonLogic` واگذار می‌کرد؛ KDoc قدیمی‌اش ادعای override تیره می‌کرد که کد آگاهانه حذفش کرده بود — تناقض سند/کد هم اصلاح شد).
- **عدد:** `OnboardingHost` ۷۳۶→۶۲۷ (−۱۰۹)، `ProfileScreens` ۱۰۴۰→۹۲۶ (−۱۱۴)، `WelcomePhone` ۱۰۲۹→۸۸۶ (−۱۴۳)، فایل جدید `OnboardingCta.kt` ۷۴ خط → **خالص −۲۹۲ خط**؛ ۴۳ import بی‌استفاده هم حذف شد. رفتار رندر عیناً حفظ شد (شکل pill، فلش رسم‌شده، رنگ غیرفعال تیره) و CTAها برای اولین‌بار فیدبک press-scale متعارف را گرفتند.
- **تست:** `feature:onboarding` ۹۲/۹۲ و `core:designsystem` ۸۳/۸۳ واحد؛ روی `Pixel_6a`: `ShomaraOnboardingGatesTest` ۶/۶ (تست جدید: CTA غیرفعال پروفایل هیچ ‏OnClick به سرویس‌های دسترس‌پذیری اعلام نمی‌کند)، `ShomaraParentGateSemanticsTest` ۳/۳، و رگرسیون `ShomaraHomeScreenTest` ۵/۵، `ShomaraStationSheetTest` ۷/۷، `ShomaraJumpAssessmentShellTest` ۳/۳.
- **APK:** `npm run android:assemble:debug` exit 0 (`app-debug.apk`، SHA-256 `458c7e8f…e2d8878`) و `:app:assembleDebugAndroidTest` exit 0.
- **بازمانده:** O5 باز؛ نمونهٔ بصری روی دستگاه فیزیکی و TalkBack walkthrough برای onboarding همچنان `NATIVE_PENDING`.

## 2026-11-19 — DT-16 — قرارداد a11y فراصفحه‌ای و دو نقص واقعی که آشکار کرد

- **شکاف روش:** بازبینی دسترس‌پذیری تا امروز چشمی بود؛ هیچ سنجهٔ مکانیکی نمی‌گفت کدام کنترل بدون نام است یا کوچک‌تر از کف ۴۸dp. تست `ShomaraA11ySweepTest` اضافه شد: درخت semantics واقعی چهار صفحه (تنظیمات، من، تمرین، مرز والدین) را در ۳۶۰dp پیمایش می‌کند و اگر کنترل قابل‌لمسی نام گفتاری نداشته باشد یا ارتفاعش زیر ۴۸dp باشد، build را می‌شکند (نسخهٔ اول: ۴ تست).
- **نقص ۱ (واقعی، خصوصی‌سازی‌شده):** در «مرز والدین» فیلد گذرواژه یک **edit box بی‌نام** بود؛ لیبل بصری بیرون از semantics فیلد قرار داشت، پس TalkBack فقط «فیلد متن» می‌خواند. رفع در منبع: خودِ فیلد اکنون `contentDescription = label` دارد (هم‌زمان شاخهٔ read-only/disabled هم نام‌دار شد) و در شاخهٔ تعاملی، ارتفاع توکنی روی خودِ فیلد نشست.
- **نقص ۲ (واقعی):** ناحیهٔ لمسی فیلد با padding عمودی ۸dp فقط **۴۰dp** از ۵۶dp سطح را می‌گرفت (اندازه‌گیری دستگاه: ۱۰۵px در ۴۲۰dpi). حالا خود فیلد `heightIn(ComponentButtonH)` دارد؛ گره‌ای که TalkBack فوکوس می‌کند تمام سطح فیلد است و متن هم با `decorator` مرکز می‌ماند.
- **نقص ۳ (فرایندی):** مجموعهٔ androidTest ماژول `core:designsystem` **هرگز کامپایل نمی‌شد** (`assertCountEquals` روی کوئری تک‌گره‌ای) و دو تستش با قراردادهای مستند ناسازگار بود: اعلان رقم OTP ارقام لاتین را عمداً حفظ می‌کند (تصمیم باز مالک، F-22 الف) و اعلان پیشرفت کلمه‌محور است (ADR-0040)، در حالی که تست‌ها چیز دیگری می‌خواستند. تست‌ها با قرارداد واقعی و سخت‌گیرانه‌تر هم‌تراز شدند (پین کردن رشتهٔ دقیق + نبود رقم/درصد)، نه شل‌تر.
- **شواهد:** `:core:designsystem:connectedDebugAndroidTest` = **۳۳/۳۳** (FontScale ۱۶، InteractiveSemantics ۱۱، ReducedMotion ۶) — اولین‌بار که این مجموعه اصلاً اجرا می‌شود؛ روی `Pixel_6a`: `ShomaraA11ySweepTest` ۴/۴، `ShomaraParentGateSemanticsTest` ۳/۳، `ShomaraOnboardingGatesTest` ۶/۶، `ShomaraHomeScreenTest` ۵/۵، `ShomaraStationSheetTest` ۷/۷، `ShomaraJumpAssessmentShellTest` ۳/۳؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا.
- **بازمانده:** sweep فعلاً ۴ صفحه را پوشش می‌دهد (Home و مسیر با تست‌های اختصاصی خودشان پوشش دارند اما در sweep به‌عنوان صفحهٔ کامل نیستند)؛ O5 باز؛ device capture و TalkBack walkthrough همچنان `NATIVE_PENDING`.

## 2026-11-19 — DT-17 — sweep تا Home و گام‌های onboarding؛ حذف فیلد دست‌ساز پروفایل

- **گسترش sweep:** `ShomaraA11ySweepTest` از ۴ به **۷ صفحه** رسید: Home (با پیشرفت واقعی ST01–ST04)، گام پروفایل و گام تعیین سطح اضافه شدند. اکنون صفحهٔ اصلی و مسیر یادگیری — اولویت اصلی هدف — به‌صورت مکانیکی پیمایش می‌شوند، نه فقط دو گرهٔ دستی.
- **نقص ۳ (واقعی، رفع با ادغام):** فیلد نام در گام پروفایل یک **کپی ۱۱۳ خطی از `ShomaraTextField`** بود (لیبل، سطح، padding، sync وضعیت ویرایش، ردیف خطا و آیکون) و همان نقص ارتفاع را داشت: ناحیهٔ تعاملی ۱۰۴px ≈ ۳۹٫۶dp در سطح ۵۶dp. خود KDoc آن نوشته بود «اگر design system اسلات آیکون پیدا کند، این فیلد باید حذف شود و کامپوننت مشترک استفاده شود».
- **رفع:** `ShomaraTextField` پارامتر defaulted `leading: (@Composable () -> Unit)?` گرفت (فلش/آیکون تزئینی در layout-start، با inset متن `Space40` و همان اسلات در شاخهٔ read-only)، و فیلد پروفایل به یک فراخوانی نازک تبدیل شد: **۱۱۳ خط حذف، ۳۵ خط جایگزین** (خالص −۷۸ خط در صفحه) و ۱۰ import بی‌استفاده پاک شد. `ProfileScreens.kt` اکنون ۸۳۵ خط است.
- **شواهد:** `ShomaraA11ySweepTest` **۷/۷** روی `Pixel_6a` (Home + پروفایل + تعیین سطح + تنظیمات + من + تمرین + مرز والدین)؛ `:core:designsystem:connectedDebugAndroidTest` **۳۳/۳۳**؛ روی دستگاه: OnboardingGates ۶/۶، ParentGate ۳/۳، Home ۵/۵، StationSheet ۷/۷، JumpShell ۳/۳؛ `feature:onboarding` ۹۲/۹۲ و `core:designsystem` ۸۳/۸۳ واحد؛ `npm run android:gate` = exit 0 با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK SHA-256 `ec4e3f45…`.
- **بازمانده:** خودِ `ProfileScreens` هنوز ۸۳۵ خط است (هندسه/hero و گرید پایه در همان فایل)؛ O5 باز؛ capture و TalkBack walkthrough `NATIVE_PENDING`.

## 2026-11-19 — DT-18 — اثبات صفر-مصرف‌کننده برای نمادهای عمومی + پوشش شیت ایستگاه و خانهٔ والدین

- **ممیزی حذف (با اثبات، نه حدس):** برای هر ۲۷ نماد عمومی که در ممیزی اولیه «بدون ارجاع بیرونی» بودند، تعداد ارجاع در کل سورس‌های Kotlin شمرده شد (`build-reports/audit/zero_ref_proof.py`). نتیجه: **۲۵ نماد زنده‌اند** (یا درون فایل خودشان استفاده می‌شوند یا تست دارند) و تنها **۲ نماد** ارجاع صفر دارند: `AudioPolicy` و `ShomaraStateHolder`. هر دو **قرارداد مستند و پذیرفته‌شده** هستند (CONTENT-017 و ADR-0041 §4) و حذفشان یعنی برگرداندن یک تصمیم ثبت‌شده — که در یک پاس پاک‌سازی مجاز نیست. پس حذف نشدند؛ به‌جای آن این یافته ثبت می‌شود. یعنی از نظر کد مردهٔ **ثبت‌نشده** چیزی باقی نمانده؛ وزن واقعی در دور اول برداشته شد (۲۵ drawable + ۴ فایل).
- **گسترش sweep به ۹ صفحه:** شیت ایستگاه (سطح بین Home و درس) و خانهٔ والدین اضافه شدند؛ هر دو از نظر نام‌گذاری و کف ۴۸dp پاک بودند — این هم یک یافتهٔ صادقانه است، نه همهٔ sweepها نقص پیدا نمی‌کنند.
- **شواهد:** `ShomaraA11ySweepTest` **۹/۹** روی `Pixel_6a`؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`)؛ APK بدون تغییر بایت‌به‌بایت نسبت به دور قبل (`ec4e3f45…`) چون فقط کد تست اضافه شد.
- **بازمانده:** O5 باز؛ شکستن `ProfileScreens` (۸۳۵ خط) و `OnboardingHost` (۶۲۷ خط)؛ capture و TalkBack walkthrough `NATIVE_PENDING`؛ 7/29 Linux parity.

## 2026-11-19 — DT-19 — شکستن فایل ۸۳۵ خطی پروفایل به سه فایل موضوعی

- **مسئله:** `ProfileScreens.kt` به ۸۳۵ خط رسیده بود و سه موضوع بی‌ربط را در خود داشت: صفحهٔ منطقی (state/CTA/فیلد نام)، هنر hero (لایه‌های SVG روی canvas، ~۳۵۰ خط)، و گرید انتخاب پایه. هر ویرایش کوچک روی صفحه، دیف را در میان صدها خط ترسیم گم می‌کرد.
- **انجام:** با مرزهای تأییدشدهٔ اعلان‌ها جدا شد — `ProfileHero.kt` (۳۵۳ خط: رنگ‌های برگ/تپه، hero، canvas، برگ‌ها، پس‌زمینهٔ پایین)، `ProfileGradeGrid.kt` (۱۴۵ خط: گرید و کارت پایه)، `ProfileScreens.kt` (۳۷۷ خط: صفحه، فیلد نام، CTA، تعیین سطح). سه نماد که اکنون بین فایلی استفاده می‌شوند از `private` به `internal` رفتند (`ShomaraProfileHero`، `ShomaraProfileBottomBackground`، `ShomaraProfileGradeGrid`) — بدون تغییر رفتار. import هر فایل بعد از جابه‌جایی هرس شد.
- **تأیید:** `feature:onboarding` ۹۲/۹۲ واحد (بدون تغییر)؛ روی `Pixel_6a`: `ShomaraA11ySweepTest` ۹/۹ و `ShomaraOnboardingGatesTest` ۶/۶؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK SHA-256 `2b24a61…`.
- **بازمانده:** `OnboardingHost.kt` (۶۲۷ خط) نوبت بعد؛ O5 باز؛ capture/TalkBack `NATIVE_PENDING`.

## 2026-11-19 — DT-20 — شکستن `OnboardingHost` + قاعدهٔ ساختاری heading در sweep (و قرارداد a11y که دروغ می‌گفت)

- **شکستن فایل:** `OnboardingHost.kt` (۶۰۵ خط) به `OtpStep.kt` (۹۴ خط: `ShomaraOtpStepStrings` + `ShomaraOtpKeypad`) و `OnboardingHost.kt` (۵۲۵ خط) شکست؛ keypad از `private` به `internal` رفت و importها هرس شد. رفتار تغییر نکرد.
- **قاعدهٔ دوم sweep (ساختار، نه فقط اندازه):** `ShomaraA11ySweepTest` حالا علاوه بر «کنترل بی‌نام / زیر ۴۸dp» بررسی می‌کند که **هر صفحه دست‌کم یک heading** برای پیمایش ساختاری TalkBack داشته باشد.
- **نقص ۴ (واقعی و مهم):** گام پروفایل **هیچ heading رندرشده‌ای نداشت** — درحالی‌که `OnboardingA11y` (قرارداد پیمایش رسمی) صریحاً **دو heading** برای همین گام اعلام می‌کند: `ProfileTitle` و `GradeSectionTitle`. یعنی قرارداد/تست a11y چیزی را توصیف می‌کرد که در رندر وجود نداشت؛ آن تست فقط فهرست رشته‌ها را می‌سنجید، نه رندر واقعی. ۸ صفحهٔ دیگر پاس بودند.
- **رفع (بدون تغییر ظاهر):** hero — که از نظر بصری همان عنوان صفحه است — به‌صورت `heading()` با `contentDescription = ProfileTitle` و گرید پایه به‌صورت `heading()` با `GradeSectionTitle` علامت‌گذاری شدند. حالا ترتیب واقعی TalkBack (title → field → section → CTA) با قرارداد اعلام‌شده در `OnboardingA11y` یکی است.
- **شواهد:** `ShomaraA11ySweepTest` **۹/۹** (با قاعدهٔ جدید) روی `Pixel_6a`؛ `ShomaraOnboardingGatesTest` ۶/۶؛ `ShomaraHomeScreenTest` ۵/۵؛ `feature:onboarding` ۹۲/۹۲ واحد؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`)؛ APK SHA-256 `db9a59d…`. فایل‌ها: `OnboardingHost` ۵۲۵ · `OtpStep` ۹۴ · `ProfileScreens` ۳۷۷ · `ProfileHero` ۳۶۶ · `ProfileGradeGrid` ۱۵۸.
- **بازمانده:** O5 باز؛ صفحهٔ درس هنوز پوشش a11y ندارد؛ قاعدهٔ «CTA اصلی یکتا در هر state» هنوز مکانیکی نشده؛ capture/TalkBack `NATIVE_PENDING`.

## 2026-11-19 — DT-21 — صفحهٔ درس وارد sweep شد (سطحی که هیچ پوشش a11y نداشت)

- **شکاف:** صفحهٔ درس عمیق‌ترین و کنترل‌سنگین‌ترین سطح اپ است، ولی تنها اندرویدتست آن (`ShomaraLessonHostResumeTest` در `feature:lesson`) فقط «مرحلهٔ ازسرگیری‌شده» را می‌سنجد — هیچ سنجش نام/اندازه/ساختار روی این صفحه نبود.
- **انجام:** `lessonStartExposesLabelledTouchTargets` به `ShomaraA11ySweepTest` اضافه شد (اکنون **۱۰ صفحه**). برای اینکه تست «توخالی» سبز نشود، ابتدا وجود هدر واقعی درس (نام ایستگاه ST07) تأیید می‌شود و بعد قرارداد نام/۴۸dp/heading سنجیده می‌شود؛ پس یک اسکلت خالی نمی‌تواند قبول شود. صفحهٔ درس **پاک** بود.
- **یافتهٔ صادقانه دربارهٔ gate:** `scripts/android-build.mjs` در حالت gate فقط `test` (JVM) و کامپایل `:app` androidTest را اجرا می‌کند و **تست‌های instrumented را اجرا نمی‌کند** — یعنی همهٔ تست‌های دستگاه (androidTest در `:app`، `:core:designsystem`، `:feature:lesson`) در gate فقط کامپایل می‌شوند. اجرای واقعی تا امروز دستی روی `Pixel_6a` انجام و گزارش شده است. افزودن اجرای instrumented به gate یک تصمیم مالک است (نیازمند دستگاه/emulator در CI)، بنابراین فقط ثبت شد و خودسرانه اعمال نشد.
- **شواهد:** `ShomaraA11ySweepTest` **۱۰/۱۰** روی `Pixel_6a`؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`)؛ APK بدون تغییر بایت‌به‌بایت (`db9a59d…`) چون فقط کد تست اضافه شد.
- **بازمانده:** O5 باز؛ قاعدهٔ «CTA اصلی یکتا در هر state»؛ اجرای instrumented در CI (نیازمند تصمیم مالک)؛ capture/TalkBack `NATIVE_PENDING`.

## 2026-11-19 — DT-22 — پوشش state صفحهٔ Home (و نقص ۵: سیگنال آفلاین که نادیده گرفته می‌شد)

- **شکاف:** sweep تا امروز از هر صفحه فقط **یک** state را می‌سنجید، درحالی‌که AGENTS §۶ هر state را لازم می‌داند. حالا Home در چهار state غیرشاد سنجیده می‌شود: Loading، Offline، Error، Empty — هر کدام با **تأیید رندر شدن همان state** (وجود متن canonical آن) تا پاس توخالی ممکن نباشد؛ مثلاً اگر `entryState` نادیده گرفته شود، تست شکست می‌خورد.
- **نقص ۵ (واقعی):** همان تأییدِ ضد-توخالی، ناسازگاری را لو داد: صفحهٔ Home دو کانال برای واقعیت «آفلاین» دارد — `progress.offline` و `entryState = Offline` — ولی بنر آفلاین فقط به کانال اول وصل بود. یعنی فراخواننده‌ای که فقط می‌دانست «شبکه قطع است» و `entryState = Offline` می‌داد، کودک را با یک مسیر کاملاً عادی و بدون هیچ پیامی رها می‌کرد. `ShomaraPathGraphLogic.resolveEntryState` هم Offline را به مسیر پاس می‌داد و در `ShomaraPathGraph` عملاً no-op بود.
- **رفع:** شرط بنر به `progress.isResolved && (progress.offline || entryState == Offline)` تغییر کرد؛ پیام همان رشتهٔ canonical است و چیزی اختراع نشد. حالا هر دو کانال به کودک می‌رسند و دو تست جدا هر کانال را می‌سنجند.
- **شواهد:** `ShomaraA11ySweepTest` **۱۵/۱۵** روی `Pixel_6a` (۱۰ صفحه؛ Home با ۵ state)؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ رفتار Loading این‌گونه مستند شد که «در state بارگذاری هیچ کنترل عملی وجود ندارد» و به‌جای aimlessly سبز شدن، صریح با `expectActions = false` بیان شده است.
- **بازمانده:** O5 باز؛ قاعدهٔ «CTA اصلی یکتا»؛ اجرای instrumented در CI؛ capture/TalkBack `NATIVE_PENDING`.

## 2026-11-19 — DT-23 — state های تنظیمات/تمرین + استخراج متن canonical تمرین (نقض §۱۰ و یافتهٔ ۶)

- **نقض §۱۰ رفع شد:** کامپوزبل `ShomaraPracticeHubScreen` هفت رشتهٔ فارسی را **inline** داشت (عنوان، سه بنر، دو heading بخش، «انجام شده») و §۱۰ می‌گوید متن UI باید از منبع canonical بیاید. همه به `ShomaraPracticeHubStrings` منتقل شدند؛ حالا تست‌ها هم همان ثابت‌ها را می‌خوانند و متن در دو جا تکرار نمی‌شود. رشته‌ها **بدون تغییر متن** منتقل شدند و تست‌های JVM ماژول تمرین سبز ماندند.
- **پوشش state:** sweep از ۱۵ به **۲۲** تست رسید: تنظیمات در حالت‌های Dirty/Saving/Error (با تأیید متن «ذخیره» و پیام خطای واقعی) و تمرین در حالت‌های Loading/Offline/Error/Empty (با تأیید متن canonical همان state).
- **یافتهٔ ۶ (ثبت‌شده، عمداً تغییر نکرد):** سه state اطلاعاتی تمرین (Offline/Error/Empty) **هیچ کنترل درون‌صفحه‌ای** ندارند. بررسی شد که بن‌بست نیست: شل کودک سه تب ثابت دارد و مسیر همیشه در دسترس است. اما ناسازگاری واقعی است: Home در state خطا «تلاش دوباره» دارد و تمرین ندارد — یک محصول، دو پاسخ به یک پرسش. افزودن `onRetry` بدون مصرف‌کننده در شل، پارامتر مرده می‌ساخت، پس **API اختراع نشد**؛ قرارداد هر state صریح شد (`expectActions = false`) و یافته برای تصمیم مالک ثبت شد.
- **شواهد:** `ShomaraA11ySweepTest` **۲۲/۲۲** روی `Pixel_6a`؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `711362c…`.
- **بازمانده:** O5 باز؛ قاعدهٔ «CTA اصلی یکتا» (نیازمند نشانهٔ primary در design system)؛ اجرای instrumented در CI؛ `onRetry` تمرین (تصمیم مالک)؛ capture/TalkBack `NATIVE_PENDING`.

## 2026-11-19 — DT-24 — ممیزی مکانیکی متن inline (§۱۰) + canonical کردن «من» + state های آن

- **ممیزی سیستماتیک:** یک اسکریپت (`build-reports/audit/inline_persian_audit.py`) همهٔ رشته‌های فارسی را که **در خط `const val` نیستند** شمرد: **۲۴۶** مورد در `feature`/`core:designsystem`/`app`. این عدد **بالا-کران** است نه شمار نقض: توابع داخل آبجکت‌های `*Strings` (مثل `ShomaraHomeStrings.remaining`) و داده‌های preview و رشته‌های `debug` هم در آن حساب شده‌اند. پس آن را به‌عنوان «فهرست کار» استفاده می‌کنیم، نه به‌عنوان верdict.
- **بیشترین تراکم واقعی:** `LessonContentWiring` (۲۴، فقط debug)، `ShomaraStationStart` (۱۶)، `ShomaraParentBoundary` (۱۴)، `ShomaraMeScreen` (۱۲ → صفر شد)، `ShomaraLaunchGate` (۱۲)، `ShomaraLessonStageChrome` (۱۰)، `ShomaraSettingsScreen` (۷).
- **رفع در این دور:** `ShomaraMeScreen` (۱۲ رشتهٔ inline) به `ShomaraMeStrings` منتقل شد — شامل عنوان، چهار بنر حالت، پیشوند آواتار، برچسب/توضیح دو ردیف و «۳ از ۲۵ ایستگاه کامل شده» (به‌صورت تابع با ارقام فارسی از قبل تبدیل‌شده). متن **بدون تغییر** و تست‌های JVM ماژول پروفایل سبز.
- **پوشش state:** sweep از ۲۲ به **۲۶** رسید: «من» در Loading/Offline/Empty/Error، هر کدام با تأیید متن canonical. سه state اطلاعاتی به‌درستی `expectActions = false` هستند (شل تب دارد).
- **شواهد:** `ShomaraA11ySweepTest` **۲۶/۲۶** روی `Pixel_6a`؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `cae99d7…`.
- **بازمانده:** استخراج متن در `StationStart`/`ParentBoundary`/`LaunchGate`/`LessonStageChrome`/`Settings` (فایل‌به‌فایل)؛ O5 باز؛ قاعدهٔ CTA اصلی؛ instrumented در CI؛ capture/TalkBack `NATIVE_PENDING`.

## 2026-11-19 — DT-25 — شیت ایستگاه و تنظیمات canonical شدند + state های قفل/آفلاین شیت

- **شیت ایستگاه (نزدیک‌ترین سطح به مسیر):** `ShomaraStationStart` ۱۴ رشتهٔ inline داشت (برچسب CTA هر state، خط متادیتا، توضیح قفل، عنوان شیت پرش، بنرهای offline/error/preparing/starting، «بستن»، «پرش»، «؛ انتخاب شد»). همه به `ShomaraStationStartStrings` منتقل شدند؛ خط متادیتا و عنوان پرش به تابع تبدیل شدند تا ارقام فارسی از قبل تبدیل‌شده پاس داده شوند. متن **بدون تغییر** — `ShomaraStationStartTest` و بقیهٔ تست‌های ماژول مسیر سبز.
- **تنظیمات:** ۵ رشتهٔ inline باقی‌مانده (پسوند «انتخاب‌شده»، «روشن»/«خاموش» در `stateDescription` و برچسب) به `ShomaraSettingsStrings` اضافه شدند؛ constهای موجود دست‌نخورده.
- **پوشش state شیت:** دو case جدید — شیت در حالت **Locked** (تنها کنترل: «متوجه شدم») و **Offline** — با تأیید متن canonical قبل از سنجش؛ sweep از ۲۶ به **۲۸** رسید.
- **اثر قابل اندازه‌گیری:** ممیزی inline از **۲۴۶** به **۲۱۷** رسید (`build-reports/audit/inline_persian_audit.py`). باقی‌ماندهٔ پرتراکم: `LessonContentWiring` (۲۴، debug)، `ShomaraCatalog` (۲۱)، `ParentBoundary` (۱۴)، `ShomaraFeedback` (۱۳)، `LaunchGate` (۱۲)، `LessonStageChrome` (۱۰).
- **شواهد:** `ShomaraA11ySweepTest` **۲۸/۲۸** روی `Pixel_6a`؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `020fe6d…`.
- **بازمانده:** `ParentBoundary`/`LaunchGate`/`LessonStageChrome` (و تصمیم دربارهٔ `ShomaraCatalog`/`ShomaraFeedback` که ممکن است canonical باشد)؛ O5 باز؛ قاعدهٔ CTA اصلی؛ instrumented در CI.

## 2026-11-19 — DT-26 — متن مرز والدین canonical شد + state «قفل موقت» در sweep

- **مرز والدین (۱۴ رشته):** پیام‌های شکست دروازه (`NotConfigured` و `WrongPasscode` — همان چیزی که والد دقیقاً وقتی خطا رخ می‌دهد می‌خواند) و همهٔ برچسب‌های صفحه (`GateTitle`, `GatePrompt`, `LockedOutNotice`, `PasscodeLabel`, `Enter`, `Back`, `LockPolicyHint`, `ReportTitle`, `SignOut`, `ScopeNotice`) به `ShomaraParentStrings` منتقل شدند؛ خط پیشرفت به تابع تبدیل شد. متن **بدون تغییر** — `ShomaraParentBoundaryTest` و بقیهٔ تست‌های ماژول والدین سبز.
- **LaunchGate:** کشف مهم برای ممیزی — رشته‌های آن **از قبل** داخل `ShomaraLaunchRecoveryCopy` (منبع canonical، «pure so it is unit-testable») بودند و شمارش من آن‌ها را inline حساب می‌کرد. به‌جای جابه‌جایی بی‌فایده، ۱۰ رشته به `const val`های نام‌دار ارتقا یافتند تا در یک نگاه مرور شوند و تست بتواند به آن‌ها ارجاع دهد.
- **state جدید sweep:** دروازهٔ والدین در حالت **LockedOut** (پس از ۳ تلاش ناموفق) — تأیید می‌شود متن انتظار گفته می‌شود و همان دو کنترل واقعی نام‌دار و ≥۴۸dp می‌مانند. sweep به **۲۹** رسید.
- **اثر اندازه‌گیری‌شده:** ممیزی inline از **۲۱۷** به **۱۹۴**.
- **شواهد:** `ShomaraA11ySweepTest` **۲۹/۲۹** روی `Pixel_6a`؛ `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `84ca1ae…`.
- **بازمانده:** `LessonStageChrome` و بقیهٔ فایل‌های درس؛ O5 باز؛ قاعدهٔ CTA اصلی؛ instrumented در CI.

## 2026-11-19 — DT-27 — گالری کاتالوگ از main به debug + متن مرحلهٔ درس canonical + تفکیک متریک

- **کد مردهٔ اثبات‌شده:** `ShomaraDesignSystemCatalog` (۱۲۴ خط با ۲۱ رشتهٔ نمونه) **صفر مصرف‌کننده** داشت — تنها میزبانش (`DesignSystemGalleryActivity`) در دور ۱ حذف شده بود و فقط اعلان + دو اشاره در اسناد مانده بود. حذف کامل، شواهد N03-06 را از بین می‌برد؛ رهاکردن، UI مرده را در ریلیز می‌فرستاد. راه‌حل: **انتقال کامپوزبل به `src/debug`** (همان الگوی `Previews.kt` در دور ۱) و نگه‌داشتن `ShomaraCatalogMatrix` در main چون تست JVM به آن assert می‌کند.
- **اثبات ساختاری (نه ادعا):** خروجی کلاس‌ها — ریلیز فقط `ShomaraCatalogMatrix.class`؛ دیباگ علاوه بر آن `ShomaraCatalogGalleryKt.class` و `ComposableSingletons$ShomaraCatalogGalleryKt.class`. یعنی گالری دیگر در artifact ریلیز نیست.
- **متن مرحلهٔ درس:** ۱۰ رشتهٔ inline در `ShomaraLessonStageChrome` (پنج نام مرحله، عنوان ایستگاه، fallback شناسهٔ ناشناس، هدر «— مرحلهٔ …»، «برای ادامه، به مسیر برگرد.»، «بازگشت به مسیر») به `ShomaraLessonStageLabels` با `const val` + توابع سازنده منتقل شد. متن **بدون تغییر**؛ تست‌های JVM ماژول درس سبز.
- **تفکیک متریک ممیزی:** اسکریپت اکنون `SUBTOTAL_MAIN` و `SUBTOTAL_DEBUG` جدا می‌دهد: **MAIN=۱۳۲، DEBUG=۵۵، TOTAL=۱۸۷**. این نشان می‌دهد بخش بزرگی از «موارد» باقی‌مانده در MAIN، توابع سازندهٔ قانونی داخل آبجکت‌های `*Strings` هستند (`ShomaraFeedback` ۱۳، `ShomaraPathState` ۸، `ShomaraAudio` ۹) — یعنی متریک به مرز کاربردش رسیده و ادامهٔ کورکورانه‌اش ارزش منفی دارد.
- **بازبینی خودم:** بررسی شد که در فایل‌های اصلاح‌شده (والدین، ایستگاه، مرحلهٔ درس، من، تنظیمات) هیچ رشتهٔ inline جا نمانده باشد — تنها باقی‌مانده‌ها **داخل** همان توابع سازندهٔ canonical هستند. ✓
- **شواهد:** `npm run android:gate` = exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ `android:assemble:debug` exit 0؛ `:core:designsystem` debug+release+JVM سبز؛ APK `a9da074…`. sweep دست‌نخورده ماند (هیچ UI رندرشده‌ای تغییر نکرد) و آخرین اجرای تأییدشده‌اش ۲۹/۲۹ در DT-26 است — این را صریح ثبت می‌کنم.
- **بازمانده:** O5 باز؛ قاعدهٔ CTA اصلی؛ instrumented در CI؛ شواهد دستگاه؛ بدهی Linux parity.

## 2026-11-19 — DT-28 — قاعدهٔ «یک CTA اصلی» از توصیف به قرارداد اجراشدنی تبدیل شد

- **قرارداد جدید در Design System:** `ShomaraPrimaryCta` یک `SemanticsPropertyKey<Boolean>` است و `shomaraPrimaryCta` روی `SemanticsPropertyReceiver`. فقط `ShomaraButtonVariant.Primary` آن را منتشر می‌کند؛ Secondary/Ghost هرگز — تا صفحه نتواند ناخواسته دو عمل اصلی تبلیغ کند. تغییر **افزایشی** است: هیچ label/role/stateDescription عوض نشد.
- **شکاف واقعی که پیدا شد:** Home (Ready) صفر CTA اصلی داشت، چون عمل اصلی Home **گرهٔ ایستگاه فعلی روی مسیر** است نه یک دکمه. پس هر سطحی که تصمیم را می‌گیرد باید بتواند اعلام کند — گرهٔ Current حالا `shomaraPrimaryCta = true` می‌گذارد (به‌همراه `selected`).
- **اندازه‌گیری کامل ۲۹ state روی دستگاه** (logcat `A11Y_SWEEP`): **هیچ سطحی دو CTA اصلی ندارد.** توزیع: یک CTA اصلی در `Home`(گرهٔ Current)، `Home/Error`(تلاش دوباره)، `StationSheet`(شروع)، `Settings`+`Dirty`+`Saving`+`Error`(ذخیره)، `ParentGate`+`LockedOut`(ورود)، `LessonStart`(بررسی)، `OnboardingProfile`(ادامه)؛ صفر در حالت‌های اطلاعاتی (`Me*`, `Practice/*`, `Home/Loading|Empty|Offline`, `ParentHome`, `OnboardingPlacement`) و در `StationSheet/Locked|Offline` که CTA‌شان عمداً Ghost است (تصمیم ثبت‌شده، نه تصمیم‌گیری).
- **دقت در تعریف قاعده:** یک بار تست شکست خورد (`StationSheet: 2 primary CTAs`) و معلوم شد شیت یک پنجرهٔ **Dialog** است (`dialogs=1`) و TalkBack فوکوس را داخل آن نگه می‌دارد؛ شمارش بین‌پنجره‌ای، یک تصمیمِ در دسترس را با یک تصمیمِ غیرقابل‌دسترس مقایسه می‌کرد. قاعده به «حداکثر یک CTA اصلی **در هر پنجره**» اصلاح شد (`hasAnyAncestor(isDialog())`) — سخت‌گیری حفظ شد، نه اینکه assertion حذف شود.
- **تست‌ها:** helper جدید `assertPrimaryCtaCount(screen, expected)` و Home حالا صریحاً **دقیقاً ۱** CTA اصلی را assert می‌کند؛ sweep همان **۲۹/۲۹** روی `Pixel_6a`.
- **شواهد:** `android:gate` exit 0 (`ANDROID_BUILD: PASS`)، ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `d6f482c…`.
- **بازمانده:** O5 باز؛ instrumented در CI؛ شواهد دستگاه فیزیکی؛ بدهی Linux parity.

## 2026-11-19 — DT-29 — سنجش کد تکراری + صفر شدن متن inline در `app` + تست state تب تمرین

- **ادعای «کد تکراری» سنجیده شد، نه حدس:** اسکنر `build-reports/audit/duplicate_scan.py` (بلوک‌های ۸+ خطی نرمال‌شده، فقط source اصلی، بدون `build`/generated/test) → در ۱۵۲ فایل: **صفر** بلوک تکراری ≥۱۲ خط، و فقط **۴ جفت** ۸–۱۱ خطی که همه boilerplate چیدمان‌اند (`Column/Arrangement.spacedBy`, `interactionSource` boilerplate). نتیجهٔ صادقانه: تکرار معنادار باقی نمانده؛ ادغام آن ۴ جفت ریسک ظاهری بدون سود واقعی است.
- **`app` به صفر متن inline رسید:** دو رشتهٔ آخر در `ShomaraChildShellHost` («در حال آماده‌سازی تمرین‌ها» و بدنه‌اش) به `ShomaraPracticeHubStrings.PreparingTitle/PreparingBody` منتقل شدند. اکنون هیچ رشتهٔ فارسی inline در `app/src/main` نیست (فقط در `debug`).
- **متریک:** MAIN ۱۳۲ → **۱۳۰**، DEBUG=۵۵، TOTAL=**۱۸۵**.
- **تست state جدید (۳۰ مورد):** `practiceTabWhileProgressIsUnresolvedExplainsItself` — همان سطحی که کودک در O5 **واقعاً** می‌بیند: تب تمرین با مسیر حل‌نشده. تست تب را می‌زند، متن canonical را تأیید می‌کند و قرارداد a11y را می‌سنجد. (پیش از این فقط خود کامپوزبل تمرین تست می‌شد، نه سطح shell.)
- **شواهد:** `ShomaraA11ySweepTest` **۳۰/۳۰** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `81636ef…`.
- **بازمانده:** O5 (مسدودکنندهٔ واقعی)؛ instrumented در CI؛ شواهد دستگاه فیزیکی؛ بدهی Linux parity 7/29.

## 2026-11-19 — DT-30 — اسکن کامل کد مرده (۵۲۸ اعلان) + پوشش state کشف درس + رفع نقص در helper خودم

- **اسکن کامل، نه ۲۷ کاندید:** `build-reports/audit/dead_decl_scan.py` تمام اعلان‌های top-level در source اصلی (۵۲۸ اعلان) را شمرد و آن‌هایی را که **هیچ ارجاعی بیرون از فایل خودشان** ندارند جدا کرد → **۴۰ کاندید**. اسکنر با grep مستقیم روی ۹ نمونه **اعتبارسنجی شد** (همه واقعاً فقط در محل تعریف ظاهر می‌شوند).
- **دسته‌بندی صادقانهٔ ۴۰ کاندید** (تفکیک مهمی که مانع حذف نادرست می‌شود): ۳۸ مورد **قرارداد مستند** (ارجاع در docs/ADR: `ShomaraStateHolder`, `AudioPolicy`, `ShomaraDialog`, `ShomaraChallengeIntro`, `ShomaraCountersGrid`, …) یا **قابلیت تست‌شدهٔ بدون سیم‌کشی** (`ManifestActivationEngine` ۷ ارجاع تست، `DraftAudioImporter` ۱۱، `ShomaraAssessmentDraw` ۱۶) یا **preview دیباگ**؛ فقط **۲ مورد** کاملاً یتیم بودند: `AssetResolver` و `AudioAssetResolver` (صفر ارجاع کد/تست/سند در کل مخزن).
- **تصمیم دربارهٔ آن ۲ مورد: حذف نکردم** — و دلیلش را ثبت می‌کنم: KDoc آن‌ها را به ADR-0039 §۱ و CONTENT-017 گره می‌زند و مسئلهٔ O2 (قرارداد مسیر پکیج محتوا) باز است؛ این‌ها seamِ آمادهٔ اتصال‌اند نه کد مرده. حذفشان churn می‌ساخت. (این تصمیم مالک است، نه من.)
- **پوشش state درس (عمیق‌ترین صفحه):** با dump درخت semantics معلوم شد درس در **P1 کشف** باز می‌شود و گزینه‌های سرور نیامده‌اند. تست جدید `lessonDiscoverWithoutServerOptionsIsHonestAndNavigable` همان سطح را می‌سنجد: متن صادقانه، قرارداد a11y، و **دقیقاً یک CTA اصلی**. sweep از ۳۰ به **۳۱** رسید.
- **نقص در ابزار خودم پیدا و رفع شد:** `assertTextPresent` برچسبِ spoken (contentDescription) را نمی‌دید و stateِ درست‌رندرشده را «غایب» گزارش می‌کرد؛ helper مکمل `assertDescriptionPresent` اضافه شد (assertion ضعیف نشد، دقیق‌تر شد).
- **متن:** ۶ برچسب ناحیهٔ skeleton در `ShomaraTemplateSkeletons` به `ShomaraTemplateSkeletonStrings` منتقل شد (متن بدون تغییر). متریک: MAIN ۱۳۰ → **۱۲۴**، TOTAL=**۱۷۹**.
- **شواهد:** `ShomaraA11ySweepTest` **۳۱/۳۱** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `ef880a0…`.
- **بازمانده:** O5؛ تصمیم دربارهٔ `AssetResolver`/`AudioAssetResolver`؛ instrumented در CI؛ شواهد دستگاه.

## 2026-11-19 — DT-31 — بازبینی مسیر (منطق قفل) + پوشش state ذخیرهٔ پروفایل

- **بررسی ادعای «گرهٔ قفل‌شده»:** `ShomaraPathGraphLogic.tapEnabled(state)` برای همهٔ stateها `true` برمی‌گرداند — عمدی. یک گرهٔ قفل‌شده **باید** قابل لمس باشد تا شیت در حالت Locked باز شود و به کودک بگوید چرا قفل است (`stateLabelFor(Locked) = «هنوز قفل؛ با ترتیب مسیر باز می‌شود»`). پس این باگ نیست، یک تعامل طراحی‌شده است؛ ثبت شد تا دوباره «رفع» نشود.
- **شکاف واقعی sweep — ذخیرهٔ پروفایل:** صفحهٔ پروفایل `saveState` دارد با بنر شکست (Retry) و بنر موفقیت، اما هیچ state‌ای جز پیش‌فرض سنجیده نمی‌شد. دو case جدید:
  - `onboardingProfileSaveFailureOffersTheWarmRetry` — شکست ذخیره با درفت معتبر: تأیید متن canonical `ShomaraProfileStrings.SaveFailed`، قرارداد a11y، و **دقیقاً یک CTA اصلی**.
  - `onboardingProfileSavingKeepsOnePrimaryAndSaysItIsWorking` — در حال ذخیره: CTA همچنان تنها CTA اصلی است **و** صریحاً `Disabled` است (تأیید شد؛ دوبار‌ارسال ممکن نیست).
- **sweep از ۳۱ به ۳۳** رسید.
- **شواهد:** `ShomaraA11ySweepTest` **۳۳/۳۳** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `ef880a0…` (بدون تغییر کد اصلی در این دور).
- **بازمانده:** O5؛ instrumented در CI؛ شواهد دستگاه؛ بدهی Linux parity.

## 2026-11-19 — DT-32 — بازگشت Home به inset canonical ۲۴dp (با سنجش، نه سلیقه)

- **یافته:** ممیزی ریتم ۱۹ صفحه نشان داد inset کناری متفاوت است: ۲۴dp در اکثر صفحه‌های کامل (Me، Practice، Profile، ParentGate، Placement، Phone)، ۱۶dp در Settings/OnboardingHost/JumpSheet (کاهش تطبیقی **ثبت‌شده** در `STAGE4_IMPLEMENTATION_NOTE`)، و **Home با ۲۰dp که هیچ‌جا ثبت نشده بود**.
- **مسئله:** playbook می‌گوید inset ترجیحی ۲۴dp و هر کاهش باید *مستند* باشد. ۲۰dp در Home یک انحراف مستندنشده بود — یا باید ۲۴ شود یا باید ثبت شود.
- **تست پایه قبل از تغییر (مهم):** `homeStaysUsableAt360dpWithDoubleText` ساخته شد — Home در عرض **۳۶۰dp** با **فونت ۲×** (که AGENTS §6 می‌خواهد و تا حالا هیچ‌وقت سنجیده نشده بود): قرارداد a11y، یک CTA اصلی، و **صفر نود سرریزشده** از viewport. پایه با ۲۰dp **سبز** بود.
- **تغییر با شاهد:** ۲۰dp → **۲۴dp** در `ShomaraHomeScreen`؛ همان تست در باریک‌ترین/بزرگ‌ترین حالت **سبز** ماند → تغییر بدون شکستن چیدمان، با همراستایی canonical.
- **شواهد:** `ShomaraA11ySweepTest` **۳۴/۳۴** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `ca82512…` (**تغییر کرد** — این دور کد تولید عوض شد).
- **بازمانده:** O5؛ تصمیم‌های مالک؛ instrumented در CI؛ شواهد دستگاه.

## 2026-11-19 — DT-33 — عرض ۳۶۰dp با فونت ۲× (خواستهٔ AGENTS §6) و کشف بریدگی متن با مکانیزمش

- **شکاف پوشش:** sweep همیشه روی عرض دستگاه و ۱× اجرا می‌شد؛ AGENTS §6 عرض ۳۶۰/۳۹۰/۴۱۲ **و بزرگ‌نمایی متن** را می‌خواهد. helper مشترک `assertFitsAtNarrowWidth` ساخته شد (نه ۶ نسخهٔ تکراری): رندر داخل `CompositionLocalProvider(LocalDensity provides Density(2.625f, fontScale = 2f))` + `Box(width = 360.dp)`، سپس قرارداد a11y + سنجش سرریز. ۶ صفحه پوشش گرفت: Home, Me, PracticeHub, Settings, ParentHome, OnboardingProfile. sweep ۳۴ → **۳۹**.
- **چک اول بی‌اثر بود:** سنجش با `boundsInRoot` هیچ‌وقت شکست نمی‌خورد، چون Compose متن را **clip** می‌کند و جعبه داخل viewport می‌ماند. جایگزین دقیق: `SemanticsActions.GetTextLayoutResult` → `TextLayoutResult.hasVisualOverflow`.
- **نقص واقعی پیدا شد:** در ۳۶۰dp/۲× متن در **هر ۶ صفحه** بریده می‌شود — مجموعاً **۳۷** گره متنی (Home 8، Settings 11، Me 7، PracticeHub 7، Profile 2، ParentHome 2). این دقیقاً همان کاربری است که به بزرگ‌نمایی سیستم تکیه دارد.
- **مکانیزم با اندازه‌گیری، نه حدس:** تست تشخیصی موقت هر گره بریده را لاگ کرد؛ نتیجه یکدست بود: `didWidth=true`، `didHeight=false`، `lines=1`، `layout.size == node.size`. یعنی ظرف‌های **عرض‌ثابت** در ۲× حتی برای یک کلمه کافی نیستند و متن فرصت شکستن خط ندارد. (هیچ `maxLines`ی در feature/path نیست؛ محدودیت از عرض ظرف می‌آید.)
- **تصمیم:** ratchet به‌جای «صفر یا هیچ». بودجهٔ اندازه‌گیری‌شده per-screen ثبت شد و **فقط می‌تواند کم شود**؛ هر افزایش (= بریدگی بیشتر) تست را می‌شکند. اسامی همهٔ ۳۷ برچسب در KDoc نقشه ثبت شد.
- **اثبات اینکه ratchet بی‌اثر نیست:** بودجهٔ Home موقتاً ۸→۷ شد و تست **شکست** (`8 text node(s) are clipped ... budget is 7`)؛ سپس ۷→۸ و کل suite دوباره سبز. بدون این اثبات، یک assertion «همیشه‌سبز» تحویل داده بودم.
- **شواهد:** `ShomaraA11ySweepTest` **۳۹/۳۹** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK بدون تغییر `ca82512…` (فقط سورس تست).
- **بازمانده:** رفع ساختاری بریدگی ۳۷ برچسب (عرض‌های ثابت مسیر/تنظیمات باید در ۲× بازآرایی شوند)؛ O5؛ instrumented در CI.

## 2026-11-19 — DT-34 — **پس‌گیری یافتهٔ DT-33**: ابزار اندازه‌گیری بریدگی خودش خراب بود

- **چه شد:** برای *رفع* بریدگی ۳۷ برچسب، سه فرضیه را با داده آزمودم:
  1. **عرض ثابت ظرف** → تغییر آزمایشی: شبکهٔ آواتار در Settings در فونت بزرگ ۲ ستونه شد. نتیجه **بدتر**: بریدگی ۱۱ → **۱۲** و لیست برچسب‌ها هم عوض شد. فرضیه رد شد.
  2. **`lineHeight` ثابت که با فونت مقیاس نمی‌گیرد** → توکن‌ها در `sp` هستند (`TypeTitleLineHeight=30.sp`, `TypeBody=26.sp`, `TypeCaption=20.sp`) و با fontScale مقیاس می‌گیرند. فرضیه رد شد.
  3. **خودِ ابزار** → یک **تست کالیبراسیون** نوشتم: یک `Caption` در جعبهٔ ۲۴dp و همان متن بدون هیچ محدودیتی، کنار هم. نتیجه: `hasVisualOverflow` برای **هر دو** `true`.
- **نتیجهٔ قطعی:** `TextLayoutResult.hasVisualOverflow` در این نسخهٔ Compose یک **اوراکل بریدگی نیست**. یعنی عدد «۳۷ گره بریده» و کل ثبت DT-33 یک **مثبت کاذب** بود.
- **اقدام (پس‌گیری، نه وصله):** ratchet و نقشهٔ `CLIPPED_TEXT_BUDGET` **حذف** شدند؛ چک `boundsInRoot` (که ضعیف ولی درست است) بازگشت؛ و تست کالیبراسیون با نام `hasVisualOverflowIsNotAClippingOracle` **نگه داشته شد** تا کسی دوباره روی این flag چک a11y نسازد. اگر روزی این تست شکست، یعنی Compose درست شده و باید پرسش بریدگی از نو و درست باز شود.
- **تغییرات آزمایشی برگشتند:** `ShomaraPathChapter.kt` (badge `size` → `defaultMinSize`) و `ShomaraSettingsScreen.kt` (گرید ۲ ستونه) هر دو `git checkout` شدند؛ هیچ تغییری که اثری اثبات‌شده ندارد در درخت نماند.
- **درس ثبت‌شده:** یک assertion جدید پیش از اعتماد باید **کالیبره** شود (این‌جا: نشان دادن true و false روی دو ورودی کنترل‌شده). در DT-33 فقط «می‌تواند شکست بخورد» را اثبات کرده بودم — که برای بی‌اعتبار بودن هم کافی است.
- **شواهد:** `ShomaraA11ySweepTest` **۴۰/۴۰** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `c1fd2d2…`.
- **بازمانده:** پرسش بریدگی متن در ۲× **باز و بدون ابزار معتبر** است (باید با ابزار درست — مثلاً اسکرین‌شات هم‌اندازه یا مقایسهٔ intrinsic width — دوباره سنجیده شود)؛ O5؛ instrumented در CI.

## 2026-11-19 — DT-35 — اوراکل درست برای تناسب متن + رفع واقعی تنها نقص موجود

- **اوراکل جدید و کالیبره‌شده:** `textThatCannotFit(measurer, node)` خودش **نمی‌پرسد Compose سرریز شد یا نه**؛ متن/استایل/همان constraints واقعی را از `layoutInput` می‌گیرد، با یک `TextMeasurer` واقعی دوباره اندازه می‌گیرد و فضای **نیاز** را با فضای **داده‌شده** مقایسه می‌کند (دو حالت شکست: کلمهٔ نشکستنی پهن‌تر از جای خود؛ یا بلوک چندخطی بلندتر از جای محدود).
- **کالیبراسیون قبل از اعتماد:** `textFitOracleFlagsATightBoxAndClearsAFreeLabel` — یک `Caption` در جعبهٔ ۲۴dp باید علامت بخورد و همان متن آزاد نباید. **سبز شد**، یعنی این ابزار برخلاف flag دور ۳۳ هم true و هم false می‌دهد.
- **نتیجهٔ اندازه‌گیری روی ۶ صفحه با بودجهٔ صفر:** فقط **یک** برچسب در کل ۶ صفحه جا نمی‌شود: «۱» در نشان فصل — `needs 24 x 119, slot 105x105` (یعنی ۴۰dp ثابت در ۲× برای ارتفاع ۱۱۹px کافی نیست). عدد ۳۷ دور ۳۳ به‌طور کامل باطل شد و همان یک مورد هم با شاهد عددی مشخص شد.
- **رفع واقعی و تأییدشده:** در `ShomaraPathChapter` نشان از `size(Space40)` به `defaultMinSize(minWidth/minHeight = Space40)` تغییر کرد (در ۱× هندسهٔ نوار عیناً همان است). نتیجه: اوراکل **۱ → ۰** و بودجهٔ همهٔ صفحه‌ها روی **۰** ماند — یعنی assertion «هیچ برچسبی در ۲× جا نمی‌شود» به‌جای ratchet.
- **چرا دور قبل این رفع «بی‌اثر» دیده شد:** با ابزار خرابِ دور ۳۳ تغییر عدد را جابه‌جا نمی‌کرد؛ ابزار درست نشان داد که همان تغییر، تنها نقص موجود را رفع می‌کند. این تفاوت یک ابزار کالیبره‌شده با یک flag بی‌اعتبار است.
- **شواهد:** `ShomaraA11ySweepTest` **۴۱/۴۱** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `21b1422…` (تغییر کرد: کد تولید عوض شد).
- **بازمانده:** O5؛ تصمیم‌های مالک؛ instrumented در CI؛ شواهد دستگاه.

## 2026-11-19 — DT-36 — گسترش ماتریس ۲× به سه سطح جدید و رفع دومین نقص واقعی

- **گسترش پوشش:** ماتریس ۳۶۰dp/۲× از ۶ صفحه به **۹ سطح** رسید: `StationSheetLocked`، `LessonDiscover` و `ParentGateLockedOut` اضافه شدند (همان اوراکل کالیبره‌شدهٔ DT-35، با بودجهٔ صفر).
- **دشواری واقعی و رفعش:** کلیک روی گرهٔ ایستگاه پایین صفحه در ویوپورت ۳۶۰dp با خطای «Failed to inject touch input» شکست خورد (گره بیرون کادر دید است). تست به‌جای شبیه‌سازی کلیک، همان **کامپوزبل شیت** را مستقیم رندر می‌کند — همان چیزی که شل میزبانی می‌کند.
- **نقص دومی که ماتریس فوراً پیدا کرد:** در شیت ایستگاه، نشان فصل یک مربع ثابت ۴۰dp با رقم `Title` است: `۲ needs 32 x 119, slot 105x105` — دقیقاً همان خانوادهٔ نقص نشان نوار مسیر. یعنی الگو «مربع ثابت + رقم `Title`» در ۲× می‌برد، نه یک مورد تکی.
- **رفع خانواده‌ای:** `ShomaraStationStart` هم مثل `ShomaraPathChapter` از `size(Space40)` به `defaultMinSize(minWidth/minHeight = Space40)` رفت؛ با grep تأیید شد که این تنها `.size(ShomaraTokens.Space40)` باقی‌مانده در همهٔ featureها بود، پس کل خانواده پوشش داده شد.
- **نتیجه:** اوراکل روی هر ۹ سطح **صفر** برچسب جا‌نشده گزارش می‌کند؛ بودجه‌ها روی ۰ ماندند.
- **شواهد:** `ShomaraA11ySweepTest` **۴۴/۴۴** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK `f3c2cb4…`.
- **بازمانده:** O5؛ تصمیم‌های مالک؛ instrumented در CI؛ شواهد دستگاه فیزیکی.

## 2026-11-19 — DT-38 — اجرای lint (gate ای که اجرا نشده بود) و رفع یافته‌های واقعی UI

- **کشف:** `lint` در AGENTS §7 جزو gate بومی است ولی هیچ‌جا در `package.json` نبود و در این جلسه اجرا نشده بود. اجرای `:app:lintDebug` و سپس lint **همهٔ** ماژول‌ها (lint روی app به‌طور پیش‌فرض کتابخانه‌ها را تحلیل نمی‌کند) ۲۱ warning در app و چند مورد واقعی در کد UI داد.
- **رفع‌های واقعی:**
  1. **`DefaultLocale`** در `ShomaraCharacter.labelFor`: `String.format("%02d", poseId)` بدون Locale. این مقدار **کلید مسیر فایل asset** است؛ در localeهایی که `%02d` را با رقم غیر‌ASCII می‌سازند، تصویر شخصیت بی‌صدا گم می‌شد. → `Locale.ROOT`.
  2. **`ComposableNaming`** در Design System: `shomaraBackHandler` (حرف کوچک) کنار `ShomaraTheme`/`ShomaraTokens`. → `ShomaraBackHandler` و هر ۵ نقطهٔ فراخوانی به‌روز شد (هنگام رفع، یک فراخوانی دیگر در `feature:lesson` پیدا شد که build را شکست و همان هم اصلاح شد).
  3. **`ModifierParameter`** در `ShomaraPlacementScreen`: `modifier` بعد از یک پارامتر اختیاری دیگر بود؛ به جایگاه درست (اولین اختیاری) منتقل شد. همهٔ فراخوانی‌ها آرگومان نام‌دار هستند، پس هیچ فراخوانی عوض نشد.
  4. **`MonochromeLauncherIcon` ×۲:** لایهٔ `<monochrome>` به هر دو آیکون adaptive اضافه شد (آیکون تم‌دار اندروید ۱۳+).
- **تقویت تست a11y:** تست `ShomaraFontScaleTest` فقط `didOverflowHeight` را چک می‌کرد — همان خانوادهٔ flag بی‌اعتبارشده در DT-34. حالا ارتفاع واقعی پاراگراف با ارتفاع جعبه مقایسه می‌شود، پس متنی که واقعاً جا نمی‌شود از هر دو مسیر می‌افتد.
- **نتیجهٔ lint:** `core:designsystem` از **۳ → ۰**، `feature:onboarding` از **۱ → ۰**، `feature:lesson` **۰**، `app` از **۲۱ → ۱۹** (باقی‌مانده‌ها dependency/manifest/orientation هستند، نه کد UI).
- **تصمیم‌های واگذارشده به مالک (تغییر ندادم):** `LockedOrientationActivity` + `DiscouragedApi` (قفل جهت صفحه؛ اندروید ۱۶ آن را نادیده می‌گیرد و باز کردنش نیاز به بازبینی چیدمان افقی دارد)، `NotShrinkingResources` (فقط روی build نوع release اثر دارد و ساخت release مجاز/ممکن نیست، پس بدون سنجش تغییر ندادم — هرچند `getIdentifier` صفر است و ریسک پایین).
- **شواهد:** lint همهٔ ماژول‌ها exit 0؛ `ShomaraA11ySweepTest` **۴۸/۴۸** و `ShomaraFontScaleTest` **۱۶/۱۶** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`، ۸۱ suite / ۵۹۱ تست / ۰ خطا)؛ APK `7215284…` (کد تولید عوض شد).
- **بازمانده:** O5؛ تصمیم‌های مالک (جهت صفحه، shrink منابع)؛ instrumented در CI؛ شواهد دستگاه فیزیکی.

## 2026-11-19 — DT-40 — کارت‌های handoff در Home + پاک‌سازی واقعی مخزن

### UI (مطابق بستهٔ `SHOMARA_HOME_UI_HANDOFF_v3`)
- **C04 `ShomaraChapterProgressCard`** و **C05 `ShomaraContinueStationCard`** (فایل جدید `ShomaraHomeCards.kt`) اضافه شدند: فصل واقعی با پیشرفت، و کارت «ادامه» با **یک** CTA اصلی و عمق Featured (fill `ColorAmberSoft`).
- **کارت قهرمان شخصیت‌محور:** `ShomaraHomeHeader` از ردیف متن به کارت با سطح `ColorHomeVioletSoft`، گوشهٔ `RadiusLg` و شخصیت `ComponentNodeCurrent + Space16` تبدیل شد. عمق Featured به کارت داده نشد چون `depthFor(Current) = Featured` و رتبهٔ ایستگاه فعلی حفظ شد.
- **۲۵ وکتور تأییدشدهٔ بسته** به `core/designsystem/src/main/res/drawable` اضافه شد (۷ → ۳۲ = دقیقاً بسته).
- **مالکیت CTA منتقل شد:** `currentNodeClaimsPrimaryCta` تا کارت «ادامه» تنها کنش اصلی Home باشد؛ با snapshot حل‌نشده گره صاحب CTA می‌ماند (هیچ‌وقت صفر CTA).
- **دو باگ واقعی که ابزار گرفت:** کارت‌ها فضای لیست را می‌خوردند (`slot 777x0` → اوراکل تناسب متن)، و لیست با `initialFirstVisibleItemIndex` روی ایستگاه فعلی باز می‌شد و کارت‌ها compose نمی‌شدند. رفع: کارت‌ها به‌عنوان آیتم اول `LazyColumn` + باز شدن از بالا وقتی header هست.

### پاک‌سازی (با شاهد، قابل بازیابی از git)
- **۸۰ سند بدون ارجاع** حذف شد (`MD_FILES: 201 → 141`)؛ ۲۰ سند که `verify:design-pack` لازم داشت با `git checkout HEAD` برگردانده شد (`design/playbook/pages/*` و `MASTER_EXECUTION.md`, `UX_REVIEW_RUBRIC.md`, `ZCODE_MASTER_PROMPT.md`).
- **۳۷ فایل تکراری/بی‌مصرف** حذف شد (۲۲ گروه بایت‌یکسان) و **۱۲ artifact دستگاه** از گیت خارج و به `build-reports/evidence/` منتقل شد (gitignored). `TRACKED: 1742 → 1694`.
- **سه درخت قدیمی حفظ شدند** چون verifierهای `verify-phase*.mjs` و `file-ledger.json` وجودشان را assert می‌کنند: `project-design-v2/`, `docs/archive/`, `prototypes/`.
- **باگ ابزار خودم:** اسکنر «drawable بی‌مصرف» فایل‌های `.xml` را نمی‌خواند و `ic_launcher_foreground.xml` را حذف کرد → `android:gate` با `failed linking references` شکست. فایل برگردانده شد، اسکنر اصلاح شد (`.xml` اضافه)، و gate دوباره سبز شد.

### نقص شاهد (مهم)
`artifacts/p13-device/gallery-ltr.png` و `gallery-rtl.png` **بایت‌به‌بایت یکسان** بودند (`E18ED0F5…97DC09`). یعنی شاهد بصری RTL هرگز وجود نداشته. فایل جعلی حذف شد؛ هر ادعای «RTL بررسی شد» بر آن بی‌اعتبار است.

### شواهد
- `ShomaraA11ySweepTest` **۴۸/۴۸** روی `Pixel_6a` (شامل ۹ سطح در ۳۶۰dp/۲×).
- `android:gate` exit 0 (`ANDROID_BUILD: PASS`).
- `harness validate` + `verify:static:all` + `verify:repository` + `verify:design-governance` + `verify:design-pack` = همه **exit 0** پس از حذف‌ها.
- APK `2478d9f5c3bd43c25bede23556590217a222d8dc7d5cd73bd25ea9a4fa3ec923`.

### محدودیت صادقانه
این عامل نمی‌تواند تصویر بخواند؛ «جذابیت» با چشم مالک داوری می‌شود و اسکرین‌شات واقعی در `build-reports/ui/home-default.png` است.

## 2026-11-19 — DT-39 — کارت قهرمان شخصیت‌محور در Home (کار UX، نه فقط تست)

- **درخواست مالک:** «نقطهٔ ضعف ما UI است؛ اصلا جذاب نیست» + انتخاب «شخصیت‌محور با کارت برجسته». الهام از Duolingo فقط در اصول تعامل مجاز است (AGENTS §6)، پس هیچ ظاهر/دارایی/متن برند کپی نشد.
- **تغییر:** `ShomaraHomeHeader` از یک ردیف متن لخت به **کارت** تبدیل شد: سطح تاکیدی `ColorHomeVioletSoft`، گوشهٔ `RadiusLg`، عمق `Soft`، شخصیت با اندازهٔ `ComponentNodeCurrent + Space16` (به‌جای مربع کوچک ثابت) به‌عنوان لنگر بصری، عنوان `Title` با `heading()`، و زیرنویس با `VioletDark` روی سطح بنفش (کنتراست بهتر از `Muted`).
- **چرا عمق Featured نه:** `depthFor(Current) = Featured` و قانون ADR-0040 می‌گوید حداکثر **یک** Featured در هر ویوپورت. پس برجستگی از **رنگ و مقیاس** آمد، نه از رتبهٔ عمق — و رتبهٔ ایستگاه فعلی دست‌نخورده ماند.
- **بدون متن جدید:** فقط رشته‌های canonical موجود (`Title`/`Subtitle`/`Settings`) استفاده شدند (AGENTS §10).
- **سنجش:** `ShomaraA11ySweepTest` **۴۸/۴۸** روی `Pixel_6a` (شامل ۹ سطح در ۳۶۰dp/۲× با اوراکل تناسب متن و قانون یک CTA اصلی در هر پنجره) — کارت جدید در ۲× هیچ برچسبی را نمی‌برد و ساختار heading/a11y را حفظ می‌کند.
- **محدودیت صادقانه:** من نمی‌توانم تصویر بخوانم (مدل ورودی تصویر ندارد)؛ برای همین یک اسکرین‌شات واقعی از دستگاه گرفتم و به مالک ارائه شد: `build-reports/ui/home-default.png`. داوری «جذابیت» با چشم مالک است، نه ادعای من.
- **شواهد:** `android:gate` (در همین دور) exit 0؛ APK `7a7c0f9…`؛ sweep ۴۸/۴۸.
- **بازمانده:** حذف قفل والدین (تصمیم مالک) که نیاز به اصلاح ADR-0037/ADR-0047 و verifier دارد؛ O5؛ شواهد دستگاه فیزیکی.

## 2026-11-19 — DT-37 — پوشش چهار حالت ورودی Home در ۳۶۰dp/۲× و یک invariant ضد-ساختگی که تست را اصلاح کرد

- **پوشش تازه:** Home تا امروز فقط در حالت مسیر حل‌شده سنجیده می‌شد. حالا هر چهار حالت ورودی جداگانه تست دارند: `HomeLoading`، `HomeError`، `HomeEmpty`، `HomeOffline` — همه با اوراکل کالیبره‌شده و بودجهٔ صفر.
- **ادعای Error بررسی و باطل شد:** فرض اولیه‌ام این بود که `entryState = Error` با `retryAvailable = false` یک بن‌بست می‌سازد (متن «دوباره تلاش کن» بدون دکمه). با خواندن کد مشخص شد مسیر راه‌اندازی (`ShomaraLaunchRecoveryScreen`) recovery واقعی خودش را دارد (retry + شروع از اول) و `ShomaraPathScreen` هم `onRetry` را فقط وقتی می‌دهد که واقعاً قابل retry باشد. پس بن‌بستی وجود ندارد؛ اما چون `retryLabel` متن ثابت است، تست جدید **اتصال** را پین می‌کند: در حالت Error هم `ErrorBody` و هم `Retry` باید دیده شوند.
- **invariant ای که تست من نقض کرد (و درست بود):** نسخهٔ اول تست، `ShomaraPathProgress` حل‌نشده با شناسهٔ ایستگاه می‌ساخت؛ سازندهٔ آن با `require(...)` رد کرد. پیام دقیق: «unresolved progress cannot carry fabricated or partial station state». این همان قاعدهٔ ضد-ساختگی O5 است، پس **تست** اصلاح شد نه کد: Offline تنها حالتی است که دادهٔ واقعی دارد (resolved + offline)، بقیه با `unresolved()` ساخته می‌شوند.
- **محدودیت فنی کشف‌شده:** در Compose test rule هر تست فقط **یک** `setContent` می‌تواند داشته باشد؛ تلاش برای حلقه روی چهار حالت با `IllegalStateException: has already set content` شکست خورد. تست به چهار تست مستقل با یک helper مشترک `HomeInEntryState` شکسته شد.
- **اسکن تکراری‌ها (نتیجهٔ منفی):** اسکنر پنجره‌ای ۸ تا ۱۱ خطی روی ۲۲۱ فایل دست‌نویس اجرا شد؛ ۶۸۷ گروه همسان پیدا شد که تقریباً همه‌شان بلوک `import` و KDoc هستند، نه چیدمان تکراری. یعنی ادغام بیشتری که ارزش ریسک داشته باشد پیدا نشد — این نتیجهٔ منفی ثبت می‌شود تا دوباره دنبالش نگردیم.
- **پاکیزگی خروجی تولیدشده (تأیید):** `git ls-files` صفر فایل `build/` یا `generated/` نشان داد و `git check-ignore` تأیید کرد `apps/android/.gitignore` الگوی `**/build/` را می‌گیرد. یعنی AGENTS §4 در این بخش رعایت می‌شود.
- **شواهد:** `ShomaraA11ySweepTest` **۴۸/۴۸** روی `Pixel_6a`؛ `android:gate` exit 0 (`ANDROID_BUILD: PASS`) با ۸۱ suite / ۵۹۱ تست / ۰ خطا؛ APK بدون تغییر `f3c2cb4…` (فقط تست اضافه شد).
- **بازمانده:** O5؛ تصمیم‌های مالک؛ instrumented در CI؛ شواهد دستگاه فیزیکی.

## DT-46 / DT-47 — حذف بخش والدین و پاکسازی عمیق (2026-11-19)

**DT-46 — والدین (ADR-0050).** ماژول pps/android/feature/parent، ParentPinManager، تست semantics دروازه و ۵ تابع تست sweep حذف شدند؛ include(":feature:parent")، مسیر shell/parent، ردیف «بخش والدین» و پارامتر onOpenParent از همهٔ call siteها برداشته شد. دروازه با erifier = null نصب می‌شد، یعنی درِ قفل‌شده بدون کلید: کودک را می‌بست و محافظتی نمی‌داد. شواهد: ndroid:gate PASS (779 task)، static:all 92/92، harness validate VALID.

**DT-47 — پاکسازی عمیق.** اسکن سطح-نماد (نه نام فایل) سه فایل با صفر ارجاع پیدا کرد: ContentResolvers.kt (AssetResolver/AudioAssetResolver)، FakeAppLogger.kt، ShomaraChallengeIntro.kt. سه فایل که همان اسکن «مرده» می‌خواندشان عمداً نگه داشته شدند: TemplateRegistry.kt (تست ShomaraTemplateAdaptersTest از آن import می‌کند)، فایل‌های @Preview در debug، و تست testDebug. پوشهٔ تکراری previews/ (یک فایل، package ...app.previews) در preview/ ادغام شد. ۳۶ تصویر بستهٔ handoff (۶۱۲KB) هم حذف شد. آمار: ۱۲۷۸ → ۱۲۳۲ فایل، ۱۶٫۹ → ۱۶٫۲MB.

**درس ثبت‌شده:** شمارش «۱۴۳ فایل مردهٔ Kotlin» در دورهای قبل نامعتبر بود، چون نام فایل را می‌گشت نه نماد را. معیار درست، رجوع به اعلان‌های همان فایل است.

## DT-76 — مسیر v3 کامل: تب‌بار آیکون‌دار + کارت featured بنفش + ریشهٔ O5 loading (2026-11-19)

**ریشهٔ اصلی که بسته شد.** شل با `ShomaraPathProgress.unresolved()` صدا می‌شد و هیچ‌چیز آن را resolve نمی‌کرد — صفحهٔ مسیر برای همیشه «در حال آماده‌سازی مسیر» می‌ماند. گره: پروفایل کامل ذخیره‌شده = یادگیرندهٔ محلی واقعی؛ پیشرفت واقعی او در ابتدا خالی است. `ShomaraApp` حالا پروفایل را می‌خواند و `emptyResolved()` می‌دهد. مسیر ۲۵ ایستگاه / ۵ فصل / حالت‌های واقعی Fresh/Locked رندر می‌شود. ذخیرهٔ پیشرفت بین نشست‌ها (Room) همچنان O5 باز است.

**تب‌بار v3 (UI-006).** `ShomaraTab` بدون کامپوننت موازی `activeIconRes/inactiveIconRes` گرفت؛ شل شش VectorDrawable موجود را از `ShomaraShellNavIcons` می‌گیرد؛ pill فعال violetSoft + متن violetDark + آیکون violet، غیرفعال سفید + muted؛ Role.Tab + stateDescription + idempotent reselect (tapGuard موجود) حفظ شد؛ TabBar به رنگ‌های Home (Canvas/Surface/Border) رفت.

**کارت featured v3 (C05).** ContinueStationCard از amber قدیمی به violet رفت — سطح violet، CTA سفید r16 با متن violetDark (4.99:1)، آیکون topic ایستگاه؛ حالت fresh با «اولین ایستگاه آماده است» + «شروع ایستگاه»، resume با «گام بعدی» + «ادامه». با وجود کارت، node دیگر CTA ادعا نمی‌کند — قانون CTA واحد.

**شواهد:** ۱۹۴ JVM تست / ۰ خطا؛ `:app:assembleDebug` exit 0؛ static:all 94/94؛ harness VALID. سفر واقعی امولاتور: placement → «شروع مسیر» → شل؛ متن‌های زندهٔ مسیر (کارت «۰ از ۵» + featured + ایستگاه ۱ «آمادهٔ شروع»)؛ پالت: violet ۱۶٪ (کارت)، canvas ۳۴٪؛ CTA «شروع ایستگاه» شیت واقعی ایستگاه را باز کرد.

**بازمانده:** گام ۳ (تمرین/من/تنظیمات/اسپلش v3)، font-scale 2.0 + TalkBack sweep، O5 کامل (Room projection).

## DT-77 — صفحات دیگر v3: تمرین/من/تنظیمات + دکمهٔ Home + font-scale sweep (2026-11-19)

**Scaffold شل.** کل شل کودک (سه تب + تنظیمات) روی `ColorHomeCanvas` نشست؛ قبل از این، پشت ستون‌های کوتاه من/تنظیمات ۵۴٪ cream قدیمی پیدا می‌شد. سه تب اندازه‌گیری شدند: تمرین canvas ۹۰٪، من canvas ۷۱٪ + violet ۹٪ (کارت هویت بنفش)، تنظیمات canvas ۸۲٪ — legacy-cream همه ۰٪.

**تمرین.** canvas v3، کارت‌های سفید r24 با border خانگی، ردیف قفل quiet pressedSoft، ✓ تاریخچه سبز.

**من.** کارت هویت violet (Featured واحد) با متن onViolet؛ نوار پیشرفت بنفش با پارامتر fillColor جدید روی ShomaraProgressBar (بدون کامپوننت موازی)؛ نام واقعی کودک از همان draft store خوانده شد («SSara — ۰ از ۲۵ ایستگاه کامل شده»)، نه null.

**تنظیمات.** canvas v3، ToggleRow سفید r24، وضعیت روشن violetDark، دکمهٔ ذخیره Home variant بنفش.

**دکمهٔ Home variant.** ShomaraButton بدون کامپوننت موازی variant چهارم (Home) گرفت: violet fill + onViolet (4.99:1)، quiet = violetSoft/muted؛ shomaraPrimaryCta را هم ادعا می‌کند؛ Primary قدیمی برای lesson ها دست‌نخورده. شیت‌های شروع/پرش مسیر هم Home گرفتند.

**اسپلش — ثبت صادقانه.** پکیج v3 asset اسپلش ندارد؛ artwork فعلی cream مالک‌تحویلی است. تا تحویل logo mark v3 توسط مالک، اسپلش دست‌نخورده می‌ماند (اقدام بیهوده ممنوع).

**font-scale sweep.** ۶/۶ PASS: 360/390/412dp × font 1.0/1.3/2.0 — هر سه تب، متن‌های اصلی حاضر، بدون crash؛ RTL پیش‌فرض اپ. شکست اولیهٔ 360dp با re-run Pass شد (cold-start timing، نه layout).

**شواهد:** ۲۴۰ JVM تست / ۰ خطا؛ android:gate PASS (748 task)؛ static:all 94/94؛ harness VALID. Backlog CSV: ردیف‌های UI-006/007/013/015/017 با exit_evidence واقعی به‌روز شد (NATIVE_PENDING ماند — state matrix کامل جارو نشده؛ صادقانه).

**بازمانده:** FeedbackBannerهای خطا/آفلاین هنوز رنگ v1؛ TalkBack sweep دستگاهی؛ O5 کامل (Room projection).

## DT-78 — رفع رگرسیون‌های a11y + race خواندن draft (2026-11-20)

- اولین اجرای کامل instrumented بعد از DT-76/77: **۶۶ تست، ۸ خطا** (۵ رگرسیون DT-76 + ۳ کهنه از DT-40؛ instrumented در CI نیست و بعد از DT-40 اجرا نشده بود).
- رفع: CTA کارت ادامه حالا \shomaraPrimaryCta\ منتشر می‌کند؛ آیکون topic در کارت icon-only شد (لیبل در font 2.0 جا نمی‌شد + تکراری بود)؛ strip جهت‌یابی با \isResolved\ همیشه دیده می‌شود؛ ۳ تست کهنه setupشان scroll به node گرفت (assertion‌ها دست‌نخورده).
- **باگ واقعی first-run**: خواندن draft فقط در شروع process بود → کودکی که onboarding را در همان process تمام می‌کرد به Loading ابدی می‌رسید. رفع: شل هنگام ورود به route دوباره می‌خواند (\ShomaraApp.kt\). روی دستگاه با نصب تازه از صفر تأیید شد.
- شواهد: instrumented 66/66 exit 0؛ \erify:static:all\ 94/94؛ \ndroid:gate\ exit 0؛ \harness validate\ VALID 129؛ پالت Home fresh روی دستگاه \canvas 68.7 / violet 13.8 / greenSoft 11.8 / cream 0\؛ 360dp و 360dp×font2.0 هم پابرجا (فریم‌ها: dt78-*.png).
## DT-79 — رفع connector مسیر (ریشه‌یابی کامل) + تحقیق و گپ‌برداری Duolingo + طرح شخصیت پروفایل (2026-11-20)

**بازخورد مالک:** «خطوط بین ایستگاه‌ها صحیح قرار داده نشدند» + درخواست تحقیق کامل روی Duolingo و طراحی کاراکتر برای پروفایل.

**ریشهٔ connector (سه‌لایه، با اثبات پیکسلی).** روش: نقاط کالیبراسیون رنگی روی Canvas (آمبر/قرمز/سبز/آبی) → اندازه‌گیری مختصات روی دستگاه → استخراج هندسهٔ واقعی. یافته‌ها: (۱) canvas دقیقاً ۱۶۰dp عریض است (BoxWithConstraints دور ستون node می‌پیچد، matchParentSize همان را می‌گیرد)، (۲) رسم LTR است، (۳) **باگ اصلی جهت:** در RTL جعبهٔ node با بزرگ‌شدن مقدار offset به سمت END یعنی چپ حرکت می‌کند ولی محور x محلی canvas راست‌رو است — دلتای افقی به node بعد باید در RTL منفی شود؛ بدون آن، هر connector آینه می‌شد (ST01→ST02 به x=936 می‌رفت در حالی که ST02 در x=446 است). رفع: \directionSign\ + منفی‌کردن دلتا در RTL. همچنین: مارپیچ از ۲ ستون به ۳ ستون (magnitudes 1.0/0.62/0.62) و \connectorBottomDp\ طوری که خط تا مرکز دایرهٔ بعد برسد (فراجهت زیر دایرهٔ بعدی پنهان می‌شود).

**اثبات روی دستگاه (Pixel 6a):** ST02 (446,1730) → ST03 (634,2120): خط در y=1830 در x=473، در y=1970 در x=562، در y=2020 در x=593 اندازه‌گیری شد؛ منحنی cubic مقادیر 478/574/591 را پیش‌بینی می‌کند — خط از مرکز هر دو دایره می‌گذرد. فریم‌ها: dt79-final.png + dt79-final-top.png.

**تحقیق Duolingo (۱۰ منبع رسمی وبلاگ Duolingo):** مسیر به‌جای درخت (یک قدم بعدی روشن)، اصل سختی +1، مرور فاصله‌دار، تب تمرین هدفمند (مرور اشتباهات)، منوی بخش‌ها، cast شخصیت به‌عنوان لایهٔ انگیزشی عاطفی، onboarding با انگیزه/تعیین سطح، توصیهٔ «وقت روی محتوای جدید». خروجی: \docs/notes/duolingo-gap-analysis-dt79.md\ — جدول گپ ۸ردیفهٔ اولویت‌دار: G1 ذخیرهٔ پیشرفت/مرور فاصله‌دار (بزرگ‌ترین، پیش‌نیاز G2/G3)، G4 سیستم شخصیت (همین نوبت)، G8 قدم بعدی در تب‌های دیگر، G5 شیت فصل‌ها؛ streak/XP/جان/لیگ/کپی شخصیت‌های برند صریحاً در ستون رد (§3.8).

**طرح شخصیت پروفایل:** \docs/notes/character-system-profile-dt79.md\ — موجودی دقیق ممیزی شد: enum فقط Main+Number (۴ pose)؛ **فایل Fandogh همین حالا در drawable-nodpi هست ولی whitelist/enum نیست** (پیش‌نیازش ADR رجیستری است)؛ Dana/Roka بدون artwork. طرح سه‌لایه: (۱) کارت هویت با Main ثابت می‌ماند + empty state پروفایل cameo Fandogh (فایل موجود، بدون artwork جدید)، (۲) Number راهنمای مفهومی، (۳) درخواست رسمی artwork مالک برای Dana_01/Roka_15/Fandogh_11. ADR-0051 کامل رعایت شده: هیچ انتخاب آواتاری پیشنهاد نشده. تصمیم‌های باز مالک: ۴ مورد صریح در سند.

**شواهد:** :feature:path:testDebugUnitTest exit 0؛ verify:static:all 94/94؛ android:gate PASS (748 task)؛ harness validate VALID 129؛ سفر کامل fresh-install تا مسیر روی دستگاه؛ commits: 93d8118 (کد connector) + این commit (اسناد).

**بازمانده:** تأیید مالک برای ۴ تصمیم سند شخصیت؛ G1 (O5/Room) همچنان بزرگ‌ترین گپ محصولی.


### DT-80 · 2026-11-20 · ممیزی جزئیات مرحله‌به‌مرحلهٔ ایستگاه‌ها + تألیف کامل ST01

- **پرسش مالک:** آیا جزئیات هر مرحله برای پایهٔ اول موجود است؟ هر ایستگاه باید تعدادی مرحله داشته باشد و هر مرحله اصولی و منحصربه‌فرد باشد.
- **پاسخ صادقانه (audit):** فقط ۱ از ۲۵ ایستگاه محتوای کامل داشت (ST07 پایلوت، درفت). ۲۴ ایستگاه هیچ آیتم authored نداشتند (`curriculum-matrix.json`: 24×NOT_AUTHORED؛ همهٔ ۱۴ فیلد). معماری پنج‌مرحله‌ای، کارت‌های ۲۵ ایستگاه، متن کامل کتاب و ۱۵ الگوی بازی موجود بود؛ چیزِ نبودِ خودِ آیتم‌ها بود. seed سرور ۲۵ ایستگاه + ۶۴ مهارت داشت ولی فقط ۱۲ content_version نازک برای ST01. مستند: `docs/notes/station-step-detail-audit-dt80.md`.
- **اقدام:** نخستین ایستگاه کامل پس از پایلوت تألیف شد: **ST01 · شمارش و الگو** (بخش ۱ کتاب: آشپزخانه) با ۴۹ آیتم یکتا: P1 چهار قدم، P2 هشت آیتم، P3 شش دور بازی «چیدن رومیزی» (T05)، P4 استخر ۲۶تایی چهارخانواده، P5 پنج چالش. قید ویژهٔ ST01: هیچ رقمی نمایش داده نمی‌شود (نماد عدد از ST07 می‌آید)؛ پاسخ‌ها فقط نقطه/تصویر/انگشت.
- **فایل‌ها:** `content-library/authoring/stations/specs/ST01.md` (مشخصات کامل، ۱۵ بخش)، `ST01-audio-manifest.csv` (۶۲ خط درفت، بدون رقم در TTS)، `stations/ST01.json` (transcribe ساختاری، lifecycle MAPPED_TO_REPO از طریق gate واقعی)، `authoring-sources-sha256.json` (رجیستری هش مشخصات تألیف‌شده).
- **pipeline:** اعتبارسنج گسترش یافت: الگوهای مجاز به هر ۱۵ الگوی تعریف‌شدهٔ مرجع؛ رژیم دوم taught-numeral (countableRange برای ایستگاه‌های بدون رقم)؛ رجیستری هش جدا برای منابع authoring (originals دست‌نخورده). مولد matrix به‌جای هاردکد ST07 از ledger+artifacts واقعی مشتق می‌شود: `authoredStations: 2`، `notAuthoredStations: 23`.
- **گیت‌ها:** `verify-content-pipeline` PASS (ST07 + ST01 + ۷ fixture منفی + originals intact)؛ `verify-content-library` PASS؛ `harness validate` VALID (129/13)؛ `verify:static:all` PASS 94/94.
- **باز:** ST02–ST06 (بات A) با همین الگو؛ ۹ تصمیم مالک مرحلهٔ ۵ §۹؛ O1/O2/O7؛ دارایی/صوت واقعی و بازبینی انسانی هر دو ایستگاه.

### DT-81 · 2026-11-20 · بازبینی/رفع باگ ST01 + اعتبارسنج ماشینی مشخصات ایستگاه

- **پرسش مالک:** بازبینی/بهبود/رفع باگ/بهینه‌سازی.
- **ریشهٔ اصلی پیدا شد:** گزارش «۰ خطای اعتبارسنجی» در §۱۳ مشخصات ST01 ادعای بدون ابزار بود (نقض AGENTS §۳.۳: PASS فقط با فرمان اجراشده). قواعد مرحلهٔ ۶ §۵ هیچ اسکریپتی نداشتند.
- **اقدام:** `scripts/verify-station-spec.mjs` ساخته شد — قواعد §۵ ماشینی: بودجهٔ واژه (TTS ≤۱۰/روایت ≤۱۴)، ممنوعیت رقم/لاتین در TTS، واژه‌های ممنوع (غلط/اشتباه)، سیاست عدد نمایشی (ST01–ST06 هیچ رقمی؛ بعد از آن فقط taughtNumerals از JSON تایپ‌شده)، یکتایی شناسه‌ها، ارجاع صوت/دارایی موجود، عناصر هنری ممنوع (جام+دادی=جامدادی مجاز؛ ستارهٔ دریایی صحنه‌ای مجاز)، استخر ≥۱۲، تطابق جدول §۸ با CSV و declaredItemCounts با واقعیت.
- **باگ‌های واقعی که همین ابزار پیدا کرد و رفع شدند:**
  1. `ST01.F1.f3` کپی کامل `P2.i01` بود (ماهی×۳، فقط چیدمان) → تعداد به ۴ تغییر کرد.
  2. `ST01.F1.j1` کپی کامل `ST01.F1.f1` بود (عروس دریایی×۱) → تعداد ۲ + چیدمان ردیفی (جفت آهنگین با خط صوتی مشترک، همان الگوی ST07 w1a/w1b).
  3. دارایی `OBJ.apple2` در جدول §۹ نبود → اضافه شد.
  4. **drift واقعی در ST07.json از فاز P7:** `section5_P4_pool_items: 5` و `section7_S13_S14: 2` در برابر ۲۶ آیتم استخر و ۳ آیتم پرشِ واقعی پایلوت → هر دو اصلاح شد.
  5. باگ خود ابزار هنگام توسعه: دو بار خواندن جدول §۸ (۵۶ خطای تکرار کاذب روی ST07) و ارجاع‌های استِم دارایی (UI.card/UI.hand/CH.guide) → رفع شد؛ ستارهٔ دریایی با نگهبان مرز واژه از جام/تاج ممنوع جدا شد.
- **بهینه‌سازی:** مولد matrix حالا ledger را یک بار می‌خواند (قبلاً ۲۵ بار)؛ `verify-station-spec` به‌صورت پیش‌فرض پایلوت ST07 را هم می‌سنجد؛ به `verify:static:all` اضافه شد (۹۴→۹۵ گیت، همه PASS)؛ نقشهٔ وابستگی بازتولید شد (550 فایل/1845 یال)؛ `scripts/README.md` به‌روز شد (103 فایل).
- **گیت‌ها:** `verify-station-spec` PASS (ST01: 62 صوت/49 آیتم/0 خطا؛ ST07: 53 صوت/49 آیتم/0 خطا)؛ `content-pipeline` PASS؛ `content-library` PASS؛ `structure` PASS؛ `harness` VALID؛ `static:all` **95/95**.

### DT-82 · 2026-11-20 · منشور هدف بخش‌ها + ماتریس هدف ۲۵ ایستگاه + ST02 کامل

- **پرسش مالک:** هدف هر مرحله باید خیلی دقیق و کامل مشخص شود (آموزش/تمرین/بازی/چالش)؛ بعدش فایل‌ها و گرافیک.
- **اقدام ۱ — منشور کانونی:** `content-library/authoring/stage-purpose-charter.md` — تعریف قطعی هفت بخش (P1 آموزش بدون شکست / P2 تمرین هدایت‌شده h1-h3 / P3 بازی بدون نمره / P4 تمرین مستقل ۳از۴ فقط h1 / P5 چالش+مرور مارپیچی / S13 ارزیابی بی‌بازخورد / S14 تمرین تکرارشونده) + قاعدهٔ «این بخش چه چیزی نیست» + بلوک الزامی `هدف_بخش` در مشخصات هر ایستگاه.
- **اقدام ۲ — ماتریس هدف:** `content-library/authoring/matrix/stage-goal-matrix.md` — ۲۵ ایستگاه × ۵ بخش؛ هدف یک‌خطی هر بخش + الگوی بازی P3 + صفحات کتاب منبع؛ رشته‌های مرور مارپیچی (از §۴ مرحلهٔ ۴) مشخص.
- **اقدام ۳ — ST02 کامل تألیف شد:** `specs/ST02.md` (۵۳ آیتم یکتا: ۴ کشف + ۸ هدایت + ۶ دور بازی مربع ۳×۳ + استخر ۳۰تایی چهارخانواده + ۵ چالش)، `ST02-audio-manifest.csv` (۵۳ خط)، `stations/ST02.json` (MAPPED_TO_REPO از gate واقعی). قیدها: هیچ رقمی نمایش داده نمی‌شود؛ زیرشماری flash فقط ST02 (طبق T01)؛ صفر فقط مفهومی (بشقاب خالی)؛ بازی از صفحهٔ مفهومی (کارت: استخر خالی)؛ مرور مارپیچی ST01 (T05، استثنای whitelist فقط مرور).
- **اقدام ۴ — ST01 بازپروری:** بلوک‌های `هدف_بخش` به هر شش بخش اضافه شد (منشور DT-82).
- **اصلاح قرارداد:** `prerequisites` باید آرایهٔ یال `{fromStationId,toStationId}` باشد (content-projection.ts)؛ ST02.json اصلاح و validate PASS شد.
- **گیت‌ها:** `verify-station-spec` PASS (ST01: 62/49/0، ST02: 53/53/0، ST07: 53/49/0)؛ `content-pipeline` PASS؛ `content-library` PASS؛ `harness` VALID؛ `static:all` **95/95**؛ dependency-map بدون drift.
- **وضعیت:** ۳/۲۵ ایستگاه authored (ST01، ST02، ST07). بعد: ST03 تا ST06 (بات A)؛ سپس فاز دارایی/گرافیک پس از قطعی کل محتوا.

### DT-83 · 2026-11-20 · ST03 کامل (بات A) + گیت یکتایی مربع شگفت‌انگیز

- **ST03 «عدد و جمع» (بخش کتاب ۳ «رفتن به مدرسه») تألیف شد:** ۴۷ آیتم یکتا (۴ کشف + ۸ هدایت + ۶ دور بازی ۴×۴ + استخر ۲۴تایی چهارخانواده + ۵ چالش)، ۴۴ خط صوت، JSON → MAPPED_TO_REPO از gate واقعی.
- **چهار مهارت:** افزودن ۱/۲ با ادامهٔ شمارش (نه از یک)؛ انتقال انگشت بین دو دست (هم‌ارزی)؛ شمردن اجزا (بالن‌ها و شکل‌های چوب بستنی)؛ جدول ترکیبی ۲×۲ (سقف×بدنه + جهت معکوس).
- **بازی P3 «پنجره‌های اتوبوس»:** مربع شگفت‌انگیز ۴×۴ چهاررنگ با قید اضافهٔ «هر مربع ۲×۲» (طبق U03-P04) — شش دور ۸→۵ خانهٔ داده + چالش.
- **گیت تازه `scripts/verify-magic-squares.mjs`:** یکتایی راه‌حل هر جدول T08 با حل‌گر پس‌گرد کامل ماشینی اثبات می‌شود (۱۴/۱۴ برای ST02+ST03 PASS). دلیل: یکتایی ۴×۴ با دست قابل اثبات نیست؛ قاعدهٔ مرحلهٔ ۶ «بدون حدس» حالا enforce است. scripts/README ۱۰۴ فایل، dependency-map 551.
- **بازبینی دستی نگاشت بازی (§۸ مرحلهٔ ۴):** کارت ST03 «استخر بازی: P07» را می‌گفت؛ بازی از P04 ساخته شد (گیم‌تر + منطبق پوشش T08)؛ P07 به T15 رفت — ثبت در §۱۴ مشخصات.
- **ایمنی:** چوب کبریت کتاب → چوب بستنی (نکتهٔ کارت).
- **پارامترهای تازهٔ پیشنهادی به مرجع T01/T03/T15:** add/hidden_after/flash_ms، start+move+direction، table+highlight+given_tile.
- **گیت‌ها:** station-spec 4/4 PASS (ST01 62/49، ST02 53/53، ST03 44/47، ST07 53/49 — همگی 0 خطا)؛ magic-squares PASS؛ pipeline PASS؛ library PASS؛ harness VALID؛ static:all **96/96**.
- **وضعیت:** ۴/۲۵ authored. بعد: ST04 (شکل‌ها و ویژگی‌ها)، ST05، ST06.

### DT-84 · 2026-11-20 · ST04 کامل (بات A)

- **ST04 «شکل‌ها و ویژگی‌ها» (بخش کتاب ۴ «رفتن به مهمانی») تألیف شد:** ۴۹ آیتم یکتا (۴ کشف + ۸ هدایت + ۶ دور بازی + استخر ۲۶تایی چهارخانواده + ۵ چالش)، ۵۲ خط صوت، JSON → MAPPED_TO_REPO.
- **چهار مهارت:** گوشه‌شماری (بدون واژهٔ ضلع/رأس)؛ سرشماری با چوب خط (پنجم مورب، دستهٔ ۵)؛ جمع ترکیبی چینه با جملهٔ «… و … می‌شود …» (بدون واژهٔ جمع)؛ تشخیص شکل شابلونی (شکل چرخیده).
- **بازی P3 «برج چینه» (T04):** عدد به‌عنوان طول — ساخت برج ۳/۴/۵ (هر ترکیب رنگی پذیرفته)، دورهای دورنگ، مقایسهٔ بلندترین؛ پایان بدون رتبه‌بندی.
- **بازبینی دستی نگاشت بازی:** کارت «P05 شابلون» را استخر بازی می‌گفت؛ بازی از P07 چینه ساخته شد؛ شابلون به P1+F4؛ مربع ۴×۴ P07 در ST04 نیامد (T08 در پوشش نیست) — نخ هندسه در ST09/ST10 جبران می‌کند؛ ثبت §۱۴.
- **تصمیم‌های تألیف:** شش‌ضلعی فقط در کشف (خارج از محدودهٔ ۱..۵)؛ چالش‌ها = شکل ترکیبی، سرشماری با مزاحم، جزء گمشدهٔ چینه، مرتب‌سازی طول؛ مرور مارپیچی SK-ST03-1 (افزودن) با صندلی‌های صحنه.
- **گیت‌ها:** station-spec 5/5 PASS؛ magic-squares 14/14؛ pipeline/library PASS؛ harness VALID؛ static:all **96/96**. یک count-drift در راه (53→52) گرفته و با واقعیت هم‌راستا شد — ابزار کار می‌کند.
- **وضعیت:** ۵/۲۵ authored. بعد: ST05 (پیک‌نیک — جمع/تفریق با چوب خط و انگشت)، ST06 (جمع با مهره‌ها/چینه + تقارن).

### DT-86 · 2026-11-20 · ST05 کامل (بات A)

- **ST05 «جمع و تفریق» (بخش کتاب ۵ «پیک‌نیک») تألیف شد:** ۴۷ آیتم یکتا (۴ کشف + ۸ هدایت + ۶ دور بازی + استخر ۲۴تایی چهارخانواده + ۵ چالش)، ۴۷ خط صوت، JSON → MAPPED_TO_REPO.
- **چهار مهارت:** مجموع دو دسته با چوب خط **پیوسته** (قاعدهٔ مهم P02 — چوب خط جدا سیگنال تلمتری دارد، نه خطای کودک)؛ باقی‌مانده با بستن انگشت و جملهٔ «… تا از … تا می‌شود … تا» (بدون واژهٔ تفریق)؛ پیدا کردن و انتخاب **واحد تکرار** (ABAB/AAB/ABC)؛ شمردن لبه و گوشه با خط‌کش دیجیتال (قیچی کتاب حذف — ایمنی).
- **بازی P3 «فرش پیک‌نیک» (T05):** ادامهٔ الگو (قرمز/آبی، سبز/سیاه، ABB نارنجی، ABC سه‌رنگ)، یافتن واحد، و دور آزاد «الگوی خودت را بساز» (بدون پاسخ غلط؛ اجرای آهنگین).
- **مربع شگفت‌انگیز ۴×۴ از P06** به چالش رفت (T08 در پوشش ST05 هست)؛ گیت magic-squares یک تناقض واقعیِ گِیوِن گرفت (۴و۳ آبی↔زرد) که اصلاح شد — 15/15 تک‌راه‌حل.
- **مرور مارپیچی:** P5.i05 از SK-ST04-3 (چوب خط + «سه و یک می‌شود چهار» با کلاه/چتر مهمانی ST04).
- **گیت‌ها:** station-spec 6/6 PASS؛ magic-squares 15/15؛ pipeline/library PASS؛ harness VALID؛ static:all **96/96**.
- **وضعیت:** ۶/۲۵ authored. بعد: ST06 (بخش ۶ «بازی با دوستان» — جمع/تفریق با چینه، مسائل داستانی، تقارن) — پایان بات A.

### DT-87 · 2026-11-20 · ST06 کامل — پایان بات A

- **ST06 «جمع با مهره‌ها» (بخش کتاب ۶ «بازی با دوستان») تألیف شد:** ۴۷ آیتم یکتا (۴ کشف + ۸ هدایت + ۶ دور بازی + استخر ۲۴تایی چهارخانواده + ۵ چالش)، ۵۲ خط صوت، JSON → MAPPED_TO_REPO.
- **چهار مهارت:** مجموع دو ستون چینه با رنگ‌کردن ستون (از پایین، دو رنگ)؛ باقی‌مانده با خط‌زدن از بالا و جملهٔ «از … تا برداشتیم، … ماند»؛ داستان کوتاه با کم/زیادشدن (T11 — نخستین کاربرد؛ تا ۵، بعداً دومرحله‌ای)؛ تقارن با تا‌کردن/شابلون (T07 — نخستین کاربرد).
- **بازی P3 «آینهٔ کاغذی» (T07) از P07:** قرینهٔ عمودی/افقی، تشخیص متقارن/نامتقارن، دور شابلون با تا‌کردن؛ بازخورد نهفته = تا‌شدن کاغذ و منطبق‌شدن دو نیمه.
- **تصمیم‌های تألیف:** الگوی P04 به مرور T15 رفت (T05 در پوشش ST06 نیست) — دو نقطهٔ مرور ST05؛ P5 شامل اولین داستان دومرحله‌ای (۳+۱−۲=۲) و قرینهٔ دومحور؛ ارزیابی پرش مثل همهٔ ایستگاه‌ها بی‌صداست (دو خط صوتی زائد PJ حذف شد).
- **گیت‌ها در راه اصلاح شدند:** چهار tts-too-long (≤۱۰ واژه)، UI.column مفقود از §۹، count-drift. نهایی: station-spec 7/7 PASS؛ magic-squares 15/15؛ pipeline/library PASS؛ harness VALID؛ static:all **96/96**.
- **بات A (ST02–ST06) کامل شد. وضعیت: ۷/۲۵ authored.** بعد: بات B (ST08–ST12؛ ST07 پایلوت موجود).

### DT-88 · 2026-11-20 · ST08 کامل (شروع بات B)

- **ST08 «عددهای ۳ و ۴» (بخش کتاب ۸) تألیف شد:** ۴۷ آیتم یکتا (۴ کشف + ۸ هدایت + ۶ دور بازی + استخر ۲۴تایی چهارخانواده + ۵ چالش)، ۵۹ خط صوت، JSON → MAPPED_TO_REPO.
- **چهار مهارت:** ردگیری ۳ و ۴ (T13؛ فقط شکل نماد کتاب برای ۴؛ سطح‌ها: فلش → بدون فلش → فقط خط زمینه → نوشتن از روی صدا)؛ عددِ مناسب مجموعه تا ۴ (کارت شکل → کارت عدد؛ از جمله نماد→نماد و مصداق واقعی سه‌پایه/شبدر)؛ اندازه‌گیری با گیره (شمردن واحد + مقایسهٔ دو شیء)؛ جدول ۴×۴ عددی (T08).
- **بازی P3 «کاشی‌های موجی» (T05) از P04:** الگوی پیوستهٔ موجی ABAB/ABC/AAB + یافتن واحد + دور آزاد «موج‌های خودت».
- **محتوای دینی:** لوحهٔ نماز/قبله در اپ نیامد (تصمیم باز محصول) — ریاضی واحد از P02–P07 کامل پوشش شد؛ داستان‌های میزگرد P02 جایگزین مسئله‌های نماز شد.
- **گسترش ابزار:** verify-magic-squares حالا نمادهای عددی NUM.* را هم می‌پذیرد — نخستین جدول ۴×۴ عددی تک‌راه‌حل شد (16/16).
- **گیت‌ها در راه اصلاح شدند:** سه tts-too-long، num.h2 مفقود، pat.pr بی‌ارجاع، count-drift. نهایی: station-spec 8/8 PASS؛ magic-squares 16/16؛ pipeline/library PASS؛ harness VALID؛ static:all **96/96**.
- **وضعیت: ۸/۲۵ authored.** بعد: ST09 (صفر و ۵).

### DT-89 · 2026-11-20 · نقشهٔ زیرساخت UX ایستگاه + فازبندی ساخت (فرمان مالک: «دکمه خروج جالب نیست؛ UI/UX ضعیف است»)

- **بازرسی شواهدمحور داخل ایستگاه انجام شد** (نه حدس): دکمهٔ خروجِ تمام‌عرض در `ShomaraLessonHost.kt:186` با CTA اصلی رقابت می‌کند؛ تأیید خروج بنر درون اسکرول است؛ رشته‌های فارسی هاردکد در Kotlin؛ صفر ترنزیشن بین مراحل (فقط press-scale موجود)؛ صحنه/مانیپولاتیو hero غایب؛ و سه سند کانونی ارجاع‌شده (`PAGE_UIUX_BLUEPRINT.md`، `MASTER.md`، `INSPIRATION_GUARDRAILS.md`) اصلاً در مخزن نیستند — «V3 lock» به هیچی قفل نبود.
- **دو سند canonical جدید:** `design/playbook/STATION_EXPERIENCE_BLUEPRINT.md` (معماری StationHost V3: TopBar با آیکون ×، SceneCanvas بدون اسکرول، CTA تک‌مhebosa، ExitSheet با «ادامه می‌دهم» primary، ماشین StationFlowStateMachine، سیستم حرکت روایی ۱۰لحظه‌ایِ token-دار با fallback کاهش‌حرکت، قرارداد کامپوننت الگوها) + `design/playbook/STATION_BUILD_PHASES.md` (S0–S6 با معیار پذیرش ماشینی هر فاز؛ محتوا موازی؛ دارایی نهایی همچنان بعد از قطعییت محتوا طبق تصمیم مالک).
- **سیاست حرکت اصلاح و مستند شد:** «هیچ حرکت تزئینی» → «حرکت روایی = اطلاعات» (stageEnter/itemOk/fold/sheetUp/...) — هم‌چنان token-دار، تک‌مالک و کاهش‌حرکت‌پذیر؛ بازنویسی doc-comment ShomaraMotion در S0.
- **Backlog اجرایی:** ۸ ردیف UX-001..UX-008 (S0..S6) به NATIVE_IMPLEMENTATION_BACKLOG.csv اضافه شد؛ validate-pack PASS.
- تصمیم باز برای مالک در پایان S6: شروع فاز دارایی/گرافیک یا هم‌زمانی با آن.

### DT-90 · 2026-11-20 · S0 اجرا شد — بازطراحی خروج + کروم ایستگاه + رشته‌های کانونی (فرمان مالک: «شروع کن»)

- **UX-001 (S0) پیاده شد:** دکمهٔ خروجِ تمام‌عرض درون اسکرول و بنر تأیید جایگزینش **حذف شدند**؛ جای آن‌ها: آیکون × ۴۸dp در TopBar ثابت (بیرون اسکرول) + `ShomaraStationExitSheet` (bottom-sheet روی بازی) با «ادامه می‌دهم» primary و «خروج به نقشه» ثانویه + هشدار ویژهٔ مرحلهٔ ارزیابی. ماشین حالت `ShomaraCloseConfirmLogic` و تست‌های N06-02 دست‌نخورده ماندند — فقط رندر عوض شد؛ بک‌ژست همان شیت را باز می‌کند.
- **StageChips (جای progress حذف‌شدهٔ F-05):** پنج خانهٔ جای‌یاب بدون عدد/درصد؛ کل ردیف یک ایستگاه TalkBack: «مرحلهٔ دوم از پنج: تمرین هدایت‌شده».
- **رشته‌های کانونی (A3):** شیء `ShomaraLessonStrings` — همهٔ کپی فارسی درس در یک فهرست قابل‌بازبینی/تست؛ ~۲۰ literal پراکنده از Host/Guided/Discover/Skeletons/Core به آن منتقل شد (wording بدون تغییر). ممیزی نهایی: فقط اشیای رشته/لیبل کپی دارند.
- **سیاست حرکت (A4):** doc-comment ShomaraMotion بازنویسی شد — «هیچ حرکت تزئینی» → لایهٔ دوم «حرکت روایی = اطلاعات» با ۴ قید: توکن‌دار، تک‌مالک، ≤۴۰۰ms، fallback کاهش‌حرکت.
- **اسناد کانونی غایب (A6) بازسازی شدند:** `design/MASTER.md`، `design/INSPIRATION_GUARDRAILS.md`، `design/playbook/PAGE_UIUX_BLUEPRINT.md` (جدول قفل ۱۷ خانواده: ترکیب/CTA/عمق/حالت‌ها).
- **شواهد:** `:feature:lesson:testDebugUnitTest` سبز (ChromeLogicTest ۵/۵؛ CoreTest به‌روز شد)؛ `:feature:lesson:compileDebugAndroidTestKotlin` سبز (شیت semantics test آمادهٔ دستگاه)؛ `:app:compileDebugKotlin` + `:core:designsystem:testDebugUnitTest` سبز؛ harness VALID؛ validate-pack PASS. backlog UX-001 با شواهد ثبت شد — اجرای on-device + اسکرین‌شات در S6.
- بعد: S1 (StationHost V3 صحنه/گذار) طبق STATION_BUILD_PHASES؛ محتوای ST09 موازی.

### DT-91 · 2026-11-20 · اصلاح صادقانهٔ یافتهٔ A6 + رشد عمدی backlog به ۲۸ ردیف

- **یافتهٔ A6 از DT-89 نادرست بود:** سندهای `PAGE_UIUX_BLUEPRINT/MASTER/INSPIRATION_GUARDRAILS` «گم» نبودند — عمداً در `docs/DESIGN_RULES.md` تجمیع شده بودند (ردیف «منبع» در پایان بخش‌ها تاریخچهٔ جذب است، نه ارجاع زنده). سه فایل موازی که DT-90 ساخت **حذف شدند** (git rm) و ارجاعِ ۱۷ قرارداد صفحه از `../PAGE_UIUX_BLUEPRINT.md` به canonical واقعی `docs/DESIGN_RULES.md § نقشهٔ نهایی UI/UX صفحه‌ها` بازگردانده شد — اعمال قاعدهٔ «یک canonical» (AGENTS §4). STATION_EXPERIENCE_BLUEPRINT §۱/§۷ و STATION_BUILD_PHASES S0 اصلاح شدند.
- **گیت حاکمیتی عمداً به‌روز شد (نه ضعیف‌شد):** شمار پین‌شدهٔ backlog از «header+20» به «header+28» تغییر کرد چون ۸ ردیف اجرایی UX-001..008 (برنامهٔ مصوب مالک، DT-89) به دنبالهٔ UI-001..020 اضافه شدند؛ پینِ دقیق باقی ماند، ردیف‌های باز همچنان باید NATIVE_PENDING باشند و قانون وجود ماژول برای UX هم اعمال می‌شود (feature:lesson/core:designsystem/app موجودند).
- **شواهد:** `verify-design-governance.mjs` PASS (۱۷ خانواده، ۲۸ ردیف)؛ ردیف DT-90 در START_HERE نیز اصلاح شد.
