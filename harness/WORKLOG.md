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
