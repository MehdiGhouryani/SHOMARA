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
