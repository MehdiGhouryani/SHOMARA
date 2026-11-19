# ARCHITECTURE.md — معماری، مرزها و قراردادها

> این فایل جای 34 سند در سه خانوادهٔ `docs/architecture`, `docs/reference`, `docs/api` را گرفته است.
> هر بخش از یک سند اصلی آمده و نام آن را دارد؛ متن کامل در تاریخ گیت قابل بازیابی است.

## ADR Reconciliation — Phase P2 (فاز معماری و تصمیم‌ها؛ بدون بازنویسی کد)

**ADR Reconciliation — Phase P2 (فاز معماری و تصمیم‌ها؛ بدون بازنویسی کد)**
- - **تاریخ:** 2026-11-13 · **شاخه:** `infra/p2-adr-reconciliation` (از `infra/p1-ci-stabilization@d0da740`)
- - **مأموریت مالک:** هم‌آشتی کامل معماری حول ADR-0039 (محصول کودک کاملاً آفلاین)؛ هیچ بازنویسی بزرگ کد؛ هیچ اجرای فازهای 3–6 تا تصویب O1/O2/O3/O4.
- - **تأیید ورودی‌ها (بدون تکرار ممیزی):** commit ادعاشدهٔ `f0b6823` **موجود و ancestor of HEAD است** (merge-base check) و هر پنج سند Phase 0 در clone فعال حاضرند: `INFRASTRUCTURE_{GAP_REGISTER,TARGET_ARCHITECTURE,EXECUTION_ROADMAP,OWNER_DECISIONS,BASELINE_REPORT}_FA.md`. مبنا = همین اسناد + کد فعلی.
- - **همراه این سند:** Register زندهٔ تصمیم‌ها در `INFRASTRUCTURE_OWNER_DECISIONS_FA.md` (v2 با وضعیت OPEN/PROPOSED/APPROVED/REJECTED).
**1. ADR Reconciliation Map**
- وضعیت‌ها: **GOVERNING** (قانون حاکم) · **AMENDED** (در این فاز حداقلی اصلاح شد) · **STATUS-NOTE** (یادداشت Superseded-by، متن تاریخی دست‌نخورده) · **ALREADY-RECONCILED** · **FROZEN-PENDING** (قانون قدیمی می‌ماند ولی اجرای آن تا تصمیم مالک مسدود است) · **HISTORICAL-KEEP** · **COMPATIBLE**.
- | اثر / سند | قانون قبل از P2 | تعارض با ADR-0039 | اقدام P2 | وضعیت باقی‌مانده |
- | ADR-0039 (2026-11-05) | — | — | مرجع | GOVERNING |
- | ADR-0003 Server-Authoritative | Learning truth = Platform runtime | کامل خلاف §2 ADR-0039 | یادداشت Status با ارجاع SUPERSEDED-IN-PART→ADR-0039؛ متن تاریخی حفظ؛ سرنوشت استک سرور → O6 | STATUS-NOTE |
- | ADR-0036 (identity/minSdk 24) | app id + API 24 | ندارد | — | COMPATIBLE |
- | ADR-0037 (Track A beta lock) | milestones متصل به backend، OTP، sync | Track A کلاینت اکسپوی متصل به سرور است؛ فازهای backend آن با ADR-0039 جمع‌شدنی نیست | **ویرایش نشد**؛ آیتم‌های امنیتی P0 خودش معتبر می‌ماند؛ هر اجرای فاز backendِ Track A → O6/O13 | FROZEN-PENDING-O6/O13 |
- | ADR-0038 (splash/launch/DEBUG OTP N08-15) | مسیر OTP در launch | OTP در Phase 2 برنامه (پس از O5) حذف می‌شود | — | COMPATIBLE (تا آن‌هنگام fail-closed فعلی معتبر) |
- | ADR-0040 (UI amendments) | قواعد Clay/TalkBack/× | ندارد (هم‌راستا با §6 ADR-0039) | — | COMPATIBLE |
- | AGENTS.md §3-ق5 | «فقط server-authoritative می‌ماند» | خلاف §2 | **AMENDED:** «فقط از منبع حقیقت محصول (پکیج bundle + ارزیاب محلی نسخه‌دار — ADR-0039)…» | باز: جزئیات evaluator = O1 |
- | AGENTS.md §3-ق6 | «answer key و evaluator وارد کلاینت کودک نمی‌شود» | سازگار ولی مبهم در مدل جدید | **AMENDED:** کلید هرگز وارد پروجکشن/DB/لاگ/telemetry؛ فقط در لایهٔ ارزیاب محلی (CONTENT-008/018) | بسته به‌عنوان مرز |
- | AGENTS.md §5 | «repository هماهنگی local/remote؛ sync قابل retry» | مسیر کودک شبکه ندارد | **AMENDED:** هماهنگی local/packaged؛ صفر وابستگی شبکه | — |
- | AGENTS.md §6 (سطر الهام Duolingo) | «الهام محدود به اصول» | §6 ADR-0039 مدل ساختاری Duolingo را مصوب کرده | **ویرایش نشد** — به ledger UI فاز موازی N08R موکول (جلوگیری از تصادم با فاز بصری فعال مالک) | DEFERRED-UI-LEDGER |
- | START_HERE.md §7 | «Learning Truth… سروری» | خلاف §2 | **AMENDED** (۱ سطر با ارجاع ADR-0039 + O1) | — |
- | START_HERE.md §6e (عناوین فازهای بستهٔ N06/N07) | «Server Truth» در عنوان‌های تاریخی | رکورد فازهای بسته | حفظ به‌عنوان تاریخ | HISTORICAL-KEEP |
- | README.md | «server-authoritative» | خلاف §1 | **AMENDED** (۱ سطر) | — |
- | ZCODE.md | flow harness | ندارد | — | KEEP |
- | PACKAGE_BOUNDARIES_FA.md:26 | «repository مرز local/remote» | خلاف مدل آفلاین | **AMENDED:** هماهنگی Room/DataStore ↔ پکیج bundle | — |
- | skills/shomara-product-design:27 | «server-authoritative» | خلاف §2 | **AMENDED** (local source authoritative) | — |

_منبع: `docs/notes/ADR_RECONCILIATION_P2_FA.md`_

## Android build environment contract

**Android build environment contract**
- این سند runbook قابل‌تکرار `N02-07` است. static source checks جای compile/lint/unit واقعی را نمی‌گیرند.
**حداقل محیط**
- | جزء | مقدار الزام‌شده | روش تشخیص |
- |---|---:|---|
- | JDK | 17 | `java -version` |
- | Android SDK root | `ANDROID_SDK_ROOT` یا `ANDROID_HOME` | مسیر موجود |
- | Compile platform | `platforms;android-37.0` (نام پکیج upstream) | `platforms/android-37/android.jar` یا `platforms/android-37.<minor>/android.jar` با signature معتبر ZIP/JAR |
- | Gradle | wrapper 9.6.0 با checksum پین‌شده | فقط `apps/android/gradlew` |
- | Repository access | Google Maven، Maven Central و Gradle distribution | resolve واقعی dependency |
- > **P1 (2026-11-12):** اندیس رسمی SDK گوگل دیگر پکیج `platforms;android-37` را منتشر نمی‌کند — پکیج‌های API 37 به‌صورت `android-37.0`/`37.1`/`37.2` هستند؛ همین ناهماهنگی نام، gate کاتلین در CI را unreachable کرده بود (ثبت شکاف G-01). قرارداد preflight هر دو چیدمان `android-37` و `android-37.<minor>` را می‌پذیرد و همیشه…
- تمام buildهای Native از root و از harness واحد اجرا می‌شوند:
- npm run android:doctor
- خروجی فقط یکی از `READY` یا `BLOCKED_ENV` است. برای ثبت گزارش تشخیصی بدون تبدیل blocker به موفقیت:
- npm run android:doctor -- --allow-blocked
- گزارش ماشینی در `build-reports/android/doctor.json` تولید و به‌عنوان generated output از Git خارج می‌شود.
- `JAVA_HOME` در صورت تنظیم، هم برای بررسی Java و هم برای wrapper استفاده می‌شود. مسیر SDK صریح در environment اولویت دارد؛ در discovery خودکار، نصب دارای platform 37 بر پوشهٔ ناقص اولویت می‌گیرد. harness مسیر SDK تأییدشده را به Gradle منتقل می‌کند. گزارش هر اجرا از `RUNNING` شروع می‌شود تا crash نتواند PASS قدیمی را معت…
**نصب compile platform در CI**
- workflow مستقیماً `sdkmanager` رسمی را روی stable channel فرمان می‌دهد و package دقیق `platforms;android-37.0` را نصب می‌کند (P1 2026-11-12؛ نام قدیمی `platforms;android-37` در اندیس upstream وجود ندارد). NDK و emulator در این gate نصب نمی‌شوند؛ signing هرگز؛ و تنها upload مجاز، گزارش‌های diagnostic (lint/unit/gate.jso…
**پین پلتفرم — Package ID دقیق و یکسان در همهٔ محیط‌ها**
- - **پین ثابت (تاریخ مبنا 2026-11-13):** `platforms;android-37.0` — revision `2`، نام نمایشی «Android SDK Platform 37.0».
- - **اثبات زنده:** `sdkmanager --list --channel=0` با cmdline-tools `22.0` اجرا شد (exit 0): خروجی شامل `platforms;android-36 | 2` و `platforms;android-37.0 | 2` است و **هیچ `platforms;android-37` یا 37.1/37.2 در stable channel فهرست نشده**. پیش‌تر fetch مستقیم `repository2-3.xml` هم همین را نشان می‌داد (37.0/37.1/37.2…
- - **هویت، نه نام پوشه:** preflight پکیج را از `package.xml` داخل پوشهٔ platform تأیید می‌کند (`path="platforms;android-37.0"`) — چیدمان legacy «inconsistent location» (پکیج 37.0 در پوشهٔ `android-37`، همان حالت موجود روی ماشین مالک با Warning صریح sdkmanager) نیز فقط وقتی می‌پذیرده که package.xml همان پین را declare کن…
- - **compileSdk:** عدد صحیح `37` می‌ماند (AGP 9.4 حداکثر API 37)؛ نسخهٔ minor نصب‌شده مستقل از compileSdk است و در یک ثابت (`PINNED_PLATFORM_PACKAGE`) و یک env واریبل workflow پین شده است.

_منبع: `docs/notes/ANDROID_BUILD_ENVIRONMENT.md`_

## Android Native module graph — N07 offline content foundation · به‌روزرسانی P3 (ADR-0041, 2026-11-13)

**Android Native module graph — N07 offline content foundation · به‌روزرسانی P3 (ADR-0041, 2026-11-13)**
- ├─ core:common
- ├─ core:model
- ├─ core:designsystem
- ├─ core:network
- ├─ core:datastore
- ├─ core:database
- ├─ feature:onboarding
- │    ├─ core:common
- └─ core:datastore
- core:testing
- └─ core:model
- No feature-to-feature imports exist; `:app` is the composition root (`AppGraph`, ADR-0041) and
- wires every module. These rules are machine-checked by `scripts/verify-android-module-graph.mjs`
- (part of `verify:static:all`): no `GlobalScope` in main sources; `Dispatchers.Main` banned outside
- `:app`; features must not import `okhttp3`/`androidx.datastore`/`core:database`/`:sync`; `:sync`
- importable only by `:app`/`:sync`; no feature-to-feature imports; feature imports of
- `core:network`/`core:datastore` are limited to a dated, shrink-only allowlist (6 entries).
**Scope ownership (ADR-0041)**
- | Scope | Owner | Lifecycle | Notes |

_منبع: `docs/notes/ANDROID_MODULE_GRAPH.md`_

## برنامهٔ یکپارچه‌سازی Design System در مهاجرت Native

**برنامهٔ یکپارچه‌سازی Design System در مهاجرت Native**
**وضعیت کشف‌شده**
- - token source فعلی: `packages/design-system/src/tokens.json`.
- - UI V1: 22 مصرف‌کنندهٔ خارجی باقی‌مانده و مجموعهٔ parity/golden وابسته.
- - UI V2: 22 مصرف‌کنندهٔ خارجی و routeهای فعال Expo.
- - `ui/v2/Character.tsx` هنوز به asset mapping در V1 وابسته است؛ بنابراین V1 را نمی‌توان پوشه‌ای حذف کرد.
- - هیچ deep import از workspaceهای `@math/*` کشف نشد؛ مرز package فعلی سالم است.
- اعداد authoritative در `harness/dependency-map.json` و audit تکرارپذیر در `tools/dependency-audit.mjs` قرار دارند.
**مقصد V3**
- ورودی تصمیم N03 از `skills/shomara-design-system/SKILL.md` و قرارداد componentها از `design/playbook/COMPONENT_READINESS.md` می‌آید. انتخاب‌های الهامی فقط پس از فیلتر `design/INSPIRATION_GUARDRAILS.md` معتبرند.
- 1. `packages/design-system/src/tokens.json` موقتاً canonical می‌ماند.
- 2. schema مستقل برای color/type/space/radius/elevation/motion/touch/illustration ساخته می‌شود.
- 3. codegen دو خروجی می‌دهد:
- - TypeScript برای Web/Expo legacy؛
- - Kotlin برای `apps/android/core/designsystem`.
- 4. فایل generated دستی ویرایش نمی‌شود و drift verifier دارد.
- 5. tokenها semantic هستند؛ نام V1/V2 وارد API دائمی نمی‌شود.
**ترتیب مهاجرت**
**موج A — تثبیت منبع**
- - schema و validation برای JSON موجود؛
- - ثبت raw/missing/duplicate tokenها؛
- - بدون تغییر بصری route.
**موج B — Compose primitives**
- - `ShomaraTheme` و component catalog؛

_منبع: `docs/notes/DESIGN_SYSTEM_MIGRATION_FA.md`_

## گزارش baseline فنی SHOMARA — ارزیابی اجرایی ممیزی زیرساخت (Phase 0)

**گزارش baseline فنی SHOMARA — ارزیابی اجرایی ممیزی زیرساخت (Phase 0)**
- - **تاریخ اجرا:** 2026-11-12 · **HEAD:** `aa2805c` (`merge: native UI/UX chain — page-02..page-17 audit ledgers + N08R Duolingo-level refinement`)
- - **شاخهٔ ممیزی:** `audit/infrastructure-phase0` (ایجادشده از `main` تمیز) · **حجم مخزن فعال:** ~۱.۴k فایل (بدون .git/node_modules)
- - **حاکمیت:** `harness: validate` = HARNESS_VALID (118 tasks, 12 phases)؛ وضعیت فعلی harness = N08R/N08R-10؛ مأموریت این نشست بر مبنای دستور مستقیم مالک (ممیزی زیرساخت) اجرا شد و N08R-02/10 را جلو نمی‌زند.
**1. محیط و نسخه‌ها**
- | مؤلفه | مقدار |
- | OS | Windows 10.0.22631 (win32) · Git Bash |
- | Node محلی | v24.22.1 — **خارج از پین engines `<23`** (هشدار؛ CI پین `.nvmrc` = 22.22.0 را می‌گیرد) |
- | JDK | 17 (Temurin 17.0.20.1+1) |
- | Android SDK | `D:\SDK` — پکیج `android-37.0` در پوشه‌ای به نام `android-37` (هشدار sdkmanager: inconsistent location؛ ریشهٔ تفاوت محلی/CI در G-01) |
- | Gradle | wrapper 9.6.0 با SHA-256 پین‌شده · AGP 9.4.0 · Kotlin 2.4.10 |
- | UI | Jetpack Compose BOM 2026.08.00 · ۱۶ ماژول Gradle در `apps/android` · 175 فایل Kotlin (~23,870 خط) |
- | TypeScript | 9 workspace · 73 فایل vitest / 564 تست · 90 verifier static |
**2. فرمان‌های baseline — exit code دقیق (اجرای 2026-11-12)**
- | فرمان | exit | نتیجه |
- |---|---:|---|
- | `node tools/harness.mjs validate` | 0 | HARNESS_VALID (118 tasks, 12 phases) |
- | `node tools/harness.mjs status` / `next` / `resume` | 0 | current: N08R / N08R-10؛ next → N08R-02 |
- | `npm run build:packages` | 0 | PASS |
- | `npm run typecheck:all` | 0 | هر ۹ workspace PASS |
- | `npx vitest run` | 0 | 73 فایل / 564 تست PASS (فایل ۷۴م یتیم — G-04) |
- | `npm run verify:static:all` | 0 | STATIC_ALL: PASS (90/90) شامل هر ۷ gate مرورگری |
- | `npm run verify:content-library` | 0 | PASS (10 protected originals, 25 stations, 15 patterns, 232 draft audio rows, 18 audited issues) |
- | `npm run verify:migrations` | 0 | PASS (74 migrations, latest=0074_audio_cms_tables.sql) |

_منبع: `docs/notes/INFRASTRUCTURE_BASELINE_REPORT_FA.md`_

## نقشهٔ راه اجرای زیرساخت SHOMARA — Phase 0 تا 6 (وابستگی‌آگاه)

**نقشهٔ راه اجرای زیرساخت SHOMARA — Phase 0 تا 6 (وابستگی‌آگاه)**
- - **تاریخ:** 2026-11-12 · **مبنا:** commit `aa2805c` · **وضعیت:** نقشهٔ پیشنهادی؛ هر فاز فقط با gate فاز قبل شروع می‌شود.
- - **هماهنگی با ADR-0039 §7:** نقشهٔ فازها همان ترتیب ADR-0039 است با تفکیک مهندسی ریزتر. هیچ فاز بدون gate قبلی و تصمیم‌های مسدودکنندهٔ خودش شروع نمی‌شود.
- - **قواعد ثابت:** شاخهٔ مستقل هر فاز؛ کار مستقیم روی main ممنوع؛ PASS فقط با فرمان+exit code+evidence؛ حذف فقط با consumer-proof؛ بازنویسی اسناد canonical فقط یک نسخهٔ یکتا.
**Phase 0 — عمومی‌سازی ممیزی، رفع P0 مکانیکی و هم‌راستاسازی حاکمیت (فوری؛ بدون تصمیم مالک)**
- | # | کار | خروجی/گیت |
- | P0-1 | ثبت ۵ سند ممیزی این مجموعه روی شاخهٔ audit و بازبینی مالک | همین اسناد؛ بدون تغییر کد |
- | P0-2 | رفع G-01: نصب `platforms;android-37.0` در `android-native.yml` + گسترش قرارداد preflight به `android-37/37.x` (`verify-android-environment.mjs`) + هم‌راستاسازی ADR-0036/`ANDROID_BUILD_ENVIRONMENT.md` | یک اجرای CI تا `android:gate` PASS؛ preflight محلی READY |
- | P0-3 | رفع G-02: تفکیک job required «static-core» از job اطلاعاتی مرورگری در `ci.yml`؛ حذف continue-on-error از بخش required | شکست عمدی verifier غیرمرورگری → CI قرمز (negative control) |
- | P0-4 | G-03: upload artifact گزارش‌های gate/lint/test؛ G-04: repair تست یتیم vitest + verifier شمارش فایل‌ها؛ G-05: dependabot + یک job audit زمان‌بندی‌شده | CI green با artifact |
- | P0-5 | آماده‌سازی گام بازنویسی ledger (G-08): فهرست دقیق ردیف‌های server-authoritative در AGENTS/START_HERE/PACKAGE_BOUNDARIES/ADR-0003/roadmap به‌عنوان پیوست این سند — اجرای متن پس از تصمیم O6/O13 تا متن جدید یک‌باره و بدون تناقض نوشته شود | پیوست در baseline report؛ commit بازنویسی در P1-0 |
**DoD فاز 0:** CI دو workflow با gate required واقعاً green؛ اسناد ممیزی تأیید مالک؛ هیچ تغییر معماری انجام نشده.
**Phase 1 — اسکلت آفلاین (ST07 pilot) — مسدودکننده: O1، O2، O4، CONTENT-014، (O7 برای بودجهٔ حجم)**
- | # | کار | گیت/تست |
- | P1-0 | گام بازنویسی ledger (G-08/P0-5) — هم‌زمان با شروع P1 | یک commit؛ verifierهای static سبز |
- | P1-1 | `:core:contentpackage` — فرمت O2: manifest schema نسخه‌دار، امضای منفصل + کلید پین‌شده + چرخش، verify کامل، فعال‌سازی اتمیک فایل‌سیستم، rollback پایدار، corruption/missing-asset fail-closed، بودجهٔ حجم O7 | negative control: checksum خراب/امضای نادرست/schema ناشناخته → rollback؛ تست JVM |
- | P1-2 | `:core:database` Room واقعی `[O4]`: اسکیمای سند هدف §3، migration پایدار، FK/index، transaction، downgrade/corrupt fail-closed روی دیسک | تست Robolectric/instrumented روی SQLite واقعی؛ ردیف‌ها پس از upgrade حفظ |
- | P1-3 | `:core:learning` موتور محلی `[O1]` + قواعد نسخه‌دار (CONTENT-014/CALIBRATION_V1): ارزیاب per-template، hint/attempt policy، determinism | تست قطعی determinism؛ snapshot «پروجکشن بدون answer» برای هر adapter؛ T13/T01 evaluation مسیر اثبات per-template |
- | P1-4 | cutover M1/M2/M3: جایگزینی gateway stub با ارزیاب محلی `[O3]`؛ path stateFor از پیشرفت Room؛ حذف wiring دستی ST07 از debug به پکیج واقعی | journey تست ST07 آفلاین از teach تا result با قطع میانه و resume |
- | P1-5 | gate فاز: `android:gate` + تست‌های جدید + یک اجرای روی دستگاه/امولاتور موجود (بدون ساخت emulator جدید) + به‌روزرسانی START_HERE/WORKLOG با evidence | DoD: ST07 کاملاً آفلاین قابل‌اجرای روی build debug؛ release هنوز بدون محتوا (فقط پس از APPROVED) |
**Phase 2 — حذف سرور و هویت محلی — مسدودکننده: Phase 1 + O5**
- - P2-1 حذف زنجیرهٔ OTP/token/session/debug OTP + probe سرور launch (`ShomaraOtpApi`, `ShomaraRealOtpProvider`, `ShomaraDebugOtpProvider`, `PreferencesTokenStore`)؛ کوتاه‌شدن onboarding به مدل محلی (خانوادهٔ 03 حذف در UI طبق ADR-0039 §7).
- - P2-2 profile محلی + چند/تک پروفایل `[O5]` + Parent PIN هش‌شده fail-closed + ParentGate با verifier محلی.
- - P2-3 حذف `:sync` و transport آن‌لاین + `ShomaraRuntimeConfig` + `LessonGateway` HTTP `[O3-b]`؛ بازنشستهٔ `:core:network` (یا نگاه‌داشت صفر-استفاده با ADR).

_منبع: `docs/notes/INFRASTRUCTURE_EXECUTION_ROADMAP_FA.md`_

## ثبت شکاف‌های زیرساخت SHOMARA (Phase 0 — ممیزی فنی)

**ثبت شکاف‌های زیرساخت SHOMARA (Phase 0 — ممیزی فنی)**
- - **تاریخ:** 2026-11-12 · **مبنا:** commit `aa2805c` روی شاخهٔ `audit/infrastructure-phase0` (از `main`)
- - **نوع مأموریت:** ممیزی زیرساخت غیر-بصری و نقشهٔ راه اجرا؛ بدون بازطراحی UI
- - **مرجع تصمیم مالک:** `docs/adr/ADR-0039-fully-offline-content-and-duolingo-copy-ui.md` (محصول کاملاً آفلاین؛ پکیج محتوای bundle + ارزیاب محلی)
- - **قاعده:** هیچ شکافی بدون شواهد `file:line` ثبت نشده؛ هیچ تصمیم مالکی جعل نشده؛ وضعیت‌ها فقط با evidence عوض می‌شوند.
- - **همراهان این سند:** `INFRASTRUCTURE_TARGET_ARCHITECTURE_FA.md`، `INFRASTRUCTURE_EXECUTION_ROADMAP_FA.md`، `INFRASTRUCTURE_OWNER_DECISIONS_FA.md`، `INFRASTRUCTURE_BASELINE_REPORT_FA.md`
- راهنمای شدت:
- - **P0** = مسدودکنندهٔ فوری؛ بدون رفعش هیچ gate قابل‌اعتماد یا محصول قابل‌اجرا وجود ندارد.
- - **P1** = ریسک معماری/امنیتی/حاکمیتی جدی؛ قبل از Phase 1 باید مسیرش مشخص شود.
- - **P2** = شکاف واقعی با برنامهٔ اجرای مشخص در فازهای بعدی.
- - **P3** = بهبود کیفی/پاکسازی.
**A. CI/CD و Release Engineering**
**G-01 · P0 · gate کاتلین در GitHub Actions هرگز اجرا نمی‌شود (نصب SDK ناموجود)**
- - **شواهد:** `.github/workflows/android-native.yml:49-56` گام «Install compile SDK 37» فرمان `sdkmanager --channel=0 "platforms;android-37"` را اجرا می‌کند. اندیس رسمی SDK گوگل (`repository2-3.xml`) پکیجی به نام `platforms;android-37` ندارد؛ فقط `android-37.0`، `android-37.1`، `android-37.2` (و betaها) وجود دارند. sdkm…
- - **چرا محلی سبز است:** روی ماشین مالک `D:\SDK\platforms\android-37\android.jar` وجود دارد (پکیج `android-37.0` در پوشه‌ای به نام `android-37`؛ sdkmanager هشدار «inconsistent location» می‌دهد) — پس preflight محلی پاس می‌شود ولی CI نمی‌تواند همان پکیج را نصب کند.
- - **ناسازگاری نرم‌افزاری ruled-out:** AGP 9.4.0 حداکثر API 37 را پشتیبانی می‌کند، Gradle حداقل 9.6.0 و JDK حداقل 17 — هر سه با پین‌های repo (`apps/android/gradle/libs.versions.toml:5-7`، wrapper 9.6.0، JDK 17 در workflow) منطبق‌اند. مشکل فقط نام پکیج است.
- - **اثر کاربر/محصول:** هیچ اجرای CI از gate کاتلین (تست/lint/compile) عبور نکرده است؛ «سبز بودن» Android CI اثبات‌ناپذیر است؛ PRهای Android بدون gate واقعی merge می‌شوند (یا همیشه قرمزند).
- - **راه‌حل (مکانیکی، بدون تصمیم مالک):** در workflow نصب `platforms;android-37.0` (یا جدیدترین 37.x پایدار)؛ همزمان قرارداد preflight در `scripts/verify-android-environment.mjs:60,70` از `platforms/android-37/android.jar` به پذیرش `android-37` یا `android-37.*` گسترش یابد (این تضعیف verifier نیست — تصحیح انتظارِ نادرست…
- - **وابستگی:** G-12 (upload artifact برای evidence). **معیار پذیرش:** یک اجرای GitHub Actions که تا `android:gate` برود و PASS ثبت کند؛ preflight محلی و CI هر دو READY.
- - **تصمیم مالک لازم:** خیر. **وضعیت:** OPEN (دستور صریح §10 مأموریت: diagnose & fix).
**G-02 · P1 · شکست static gate در CI به «سبز» تبدیل می‌شود**
- - **شواهد:** `.github/workflows/ci.yml:27` روی کل job `visual-and-static` ‏`continue-on-error: true` است. این job علاوه بر مرورگری‌ها `npm run verify:static:all` (ci.yml:37-38) را اجرا می‌کند که **90 verifier** از جمله موارد امنیتی را می‌دود: `verify-answer-key-boundary`، `verify-demo-auth-isolation`، `verify-content-l…
- - **اثر:** شکست هر verifier امنیتی/معماری در check-run سبز دیده می‌شود؛ مرز «required» فقط job `core` (build/typecheck/vitest) است.
- - **راه‌حل:** تفکیک: یک job required «static-core» برای verifierهای غیرمرورگری، و فقط gateهای Chromium/parity در job اطلاعاتی بمانند تا وقتی runner سبز شود؛ سپس حذف `continue-on-error`.

_منبع: `docs/notes/INFRASTRUCTURE_GAP_REGISTER_FA.md`_

## Owner Decision Register — SHOMARA (v2، زنده — فاز P2)

**Owner Decision Register — SHOMARA (v2، زنده — فاز P2)**
- - **تاریخ بازنگری:** 2026-11-13 · **شاخه:** `infra/p2-adr-reconciliation`
- - **منبع تصمیم حاکم:** ADR-0039 (محصول کودک کاملاً آفلاین). **همراه:** `ADR_RECONCILIATION_P2_FA.md`.
- - **حکمرانی وضعیت:** `OPEN` = منتظر شروع تصمیم · `PROPOSED` = بستهٔ پیشنهاد مهندسی ثبت شده و منتظر مالک · `APPROVED/REJECTED` فقط با بیانیهٔ صریح مالک + تاریخ + evidence (ADR یا START_HERE) تغییر می‌کند. هیچ عامل/مدلی اجازه ندارد وضعیت را به‌جز مالک تغییر دهد یا گزینه‌ای را «مصوب» جلوه دهد.
- - **ریسک‌ها در هر بلوک:** 🔒 امنیت · 🛠 نگهداری · 🚢 انتشار · 🧒 تجربهٔ کودک.
**O1 — مدل Answer Key / ارزیاب محلی — **STATE: OPEN** (پیشنهاد مهندسی ثبت شد؛ مسدودکنندهٔ P5)**
- - **گزینه‌ها:** (1) کلید در APK داخل لایهٔ ارزیاب جدا — ساده‌ترین؛ پاسخ قابل استخراج از APK است. (2) ارزیاب بدون کلید قابل‌استخراج — اثبات per-template (T01/T05/T13 ممکن؛ T15 فقط اگر گزینهٔ درست از پارامتر مشتق شود). (3) ارزیاب از پارامتر آیتم در runtime (بدون ذخیرهٔ «answer») — برای T15 مشروط.
- - **Trade-off:** (1) سریع‌ترین مسیر release ولی بیشترین سطح مواجهه؛ (2) امن‌ترین ولی هزینهٔ اثبات و محدودیت template؛ (3) میانه — نیازمند schema پارامترمحور در O2.
- - **ریسک:** 🔒 (1) استخراج پاسخ از APK debug/release با obfuscation ناقص · 🛠 (2) دو مسیر ارزیابی per-template تست بیشتری می‌خواهد · 🚢 (3) schema پارامتری باید در O2 قفل شود وگرنه دو بار migration می‌شود · 🧒 هیچ‌کدام تأثیر مستقیم UI ندارد؛ همه باید determinism را تضمین کنند.
- - **پیشنهاد مهندسی (غیرمصوب):** (3)+(2) ترکیبی — هر جا درستی از پارامتر مشتق‌پذیر است از پارامتر؛ وگرنه کلید فقط در لایهٔ ارزیاب جدا با snapshot-test «پروجکشن بدون answer» برای هر adapter.
- - **باز می‌کند:** P5 (موتور)، P4 (schema پارامتری) · **بسته:** CONTENT-008 به‌عنوان مرز اجرایی.
- - **سابقهٔ وضعیت:** OPEN از Phase 0.
**O2 — فرمت/اسکیمای پکیج محتوا و مدل امضا — **STATE: OPEN — PROPOSED** (اسکیمای DRAFT در ADR-0043 §2 ثبت شد؛ مکانیک engine مستقل از فرمت ساخته و ۳۳ تست **
- - **گزینه‌ها:** (a) تأیید پیشنهاد ADR-0039 §4 (manifest + stations/audio/images + SHA-256 هر فایل + checksum کل) + امضای منفصل روی manifest با کلید عمومی پین‌شده در APK و چرخش کلید؛ (b) امضای کانتینر کل پکیج (single blob) — اعتبارسنجی یکجا ولی آپدیت جزئی ناممکن؛ (c) بدون امضا (فقط checksum) — سریع، بی‌دفاع در برابر دست…
- - **Trade-off:** (a) استاندارد و مرحله‌به‌مرحله قابل‌توسعه؛ (b) ساده در verify ولی سنگین در build؛ (c) رد — در محصول آفلاین تنها مرز اعتماد است.
- - **ریسک:** 🔒 (c) دستکاری محتوا قابل‌کشف نیست · 🛠 (a) چرخش کلید و نگه‌داری pinned key در repo مرز دارد · 🚢 (a/b) هر دو باید از اجرای CI با پکیج واقعی عبور کنند · 🧒 corruption/missing asset باید سطح خطای صادقانه بدهد نه fallback خاموش (ADR-0039 §1).
- - **پیشنهاد مهندسی (غیرمصوب):** (a) — امضای منفصل + پین کلید + چرخش؛ پین پلتفرم P1 الگوی «هویت ثابت» را نشان داده.
- - **باز می‌کند:** P4 و schema پارامتری O1(3) · **بسته:** G-13/G-14.
**O3 — سرنوشت LessonGateway — **STATE: OPEN** (مسدودکنندهٔ cutover ارزیاب)**
- - **گزینه‌ها:** (a) نگه‌داشتن interface با پیاده‌سازی محلی — تغییر حداقلی host/journey، نام گمراه‌کننده می‌ماند؛ (b) حذف و `LocalLessonEvaluator` صریح — تمیزتر، تغییر بزرگ‌تر در host.
- - **Trade-off:** (a) کم‌ریسک برای N08R فعال؛ (b) با معماری هدف §2 و سطح ذهنی موتور P5 هم‌خوان‌تر.
- - **ریسک:** 🛠 (a) دو معنای «Gateway» در کد برای یک سال آینده · 🚢 هر دو بی‌اثر بر release تا محتوا (P4/P7) بیاید · 🔒 مرز answer-key در هر دو باید snapshot-test شود · 🧒 بی‌اثر.
- - **پیشنهاد مهندسی (غیرمصوب):** (b) مطابق مطالعهٔ آفلاین؛ idempotency-key قطعی برای هویت attempt حفظ شود.

_منبع: `docs/notes/INFRASTRUCTURE_OWNER_DECISIONS_FA.md`_

## معماری هدف زیرساخت SHOMARA (نسخهٔ Phase 0 — برای تأیید مالک)

**معماری هدف زیرساخت SHOMARA (نسخهٔ Phase 0 — برای تأیید مالک)**
- - **تاریخ:** 2026-11-12 · **مبنا:** commit `aa2805c` · **وضعیت:** پیشنهاد فنی؛ هر بخشِ وابسته به تصمیم مالک با برچسب `[O?]` مشخص است و تا تأیید، پیاده نمی‌شود.
- - **مبنای تصمیم:** ADR-0039 (محصول کاملاً آفلاین؛ پکیج محتوای bundle + ارزیاب محلی؛ UI مدل Duolingo با مرزهای §6). ADR-0003 فقط به‌عنوان تاریخچهٔ دورهٔ سرور معتبر است.
- - **آنچه عوض نمی‌شود:** single-activity + Compose + UDF + ViewModel/state immutable + Design System واحد + قواعد child-safe (بدون ستاره/جان/سکه/leaderboard) + مرز CONTENT-008/018.
**1. اصول پنج‌گانهٔ هدف**
- 1. **محتوای درسی فقط از پکیج bundle می‌آید** — نه از کد، نه از شبکه. نسخهٔ پکیج مستقل از نسخهٔ اپ گزارش‌پذیر است (ADR-0039 §1).
- 2. **حقیقت یادگیری روی دستگاه است و پایدار می‌ماند** — Room برای دادهٔ ساختاریافته؛ DataStore فقط برای تنظیمات سبک `[O4]`.
- 3. **موتور یادگیری pure و تست‌پذیر بیرون از Compose است** — determinism برای `(packageVersion, item, inputs, config)`.
- 4. **مرز answer-key نسخهٔ معماری دارد، نه استثنای موردی** — authoring/published/child-projection/evaluator چهار لایهٔ جدا `[O1]`.
- 5. **شبکه در کلاینت کودک وجود ندارد** — هیچ permission و transport شبکه در مسیر یادگیری؛ fail-closed به‌صورت طراحی‌شده (نه تصادفی).
**2. نقشهٔ ماژول هدف (Android)**
- :app                    → composition root، NavHost، shell، launch gate
- :core:common            → logger/error taxonomy (موجود)
- :core:model             → مدل دامنه (موجود؛ گسترش با محتوای پکیج)
- :core:designsystem      → token/theme/component (موجود)
- :core:datastore         → فقط settings/checkpoint سبک (تغییر scope)
- :core:database          → Room واقعی: progress/packages/attempts/sessions [O4]
- :core:contentpackage    → جدید: loader/verifier/activation/registry پکیج [O2]
- :core:learning          → جدید: موتور ارزیاب + قواعد نسخه‌دار [O1]
- :feature:*              → فقط UI و event؛ هیچ تصمیم mastery
- :sync                   → بازنشسته پس از O3/O6 (کد دورهٔ سرور)
- :core:network           → بازنشسته پس از O3 (فقط اگر authoring tool جدا نخواستش)
- قواعد مرز همان `PACKAGE_BOUNDARIES_FA.md` می‌ماند با یک اصلاح: مرز repository دیگر «local/remote» نیست؛ «local/packaged» است (اصلاح متن در گام بازنویسی ledger — G-08).
**3. لایهٔ داده (پیشنهاد، مشمول O4)**
- Room (تخمین ۹ جدول؛ نام‌ها قطعی نیستند):

_منبع: `docs/notes/INFRASTRUCTURE_TARGET_ARCHITECTURE_FA.md`_

## O6 Decision Pack — سرنوشت Backend/Supabase/apps-web (P11)

**O6 Decision Pack — سرنوشت Backend/Supabase/apps-web (P11)**
- - **تاریخ:** 2026-11-14 · **وضعیت O6:** **OPEN** — طبق مأموریت صریح مالک، **فقط این Decision Pack تهیه شد؛ هیچ حذف، هیچ گسترش production و هیچ تغییری در runtime کودک انجام نشده**.
- - **وضعیت child runtime (بی‌تغییر در هر سه گزینه):** کلاینت کودک صفر وابستگی Backend دارد (URLها null، بدون INTERNET permission، موتور + پکیج‌انجین آفلاین در P5/P6/P8 اثبات شدند). این Decision Pack فقط سمت authoring/server را تعیین تکلیف می‌کند.
- - **Inventory ماشین‌خوان:** `docs/notes/o6-pack/inventory.json` — **۴۹ API route · ۷۴ migration · ۸ فایل InMemory repo** (تولید با `node tools/o6-inventory.mjs`).
**گزینهٔ A — Retain Backend/CMS as independent authoring service**
**مفهوم:** Supabase + apps/web به‌عنوان سرویس authoring/مدیریت بزرگسال زنده می‌مانند؛ child runtime کاملاً مستقل می‌ماند (آماده است).
**کارهای لازم (endpoint-by-endpoint / migration-by-migration):**
- 1. **Persistence:** جایگزینی ۸ فایل InMemory repo (adult-projections/assignment-runtime/challenge-runtime/offline-sync/admin-audio/learning-runtime/teacher-applications) با repoهای persistent روی Supabase — با Integration test روی Local Supabase.
- 2. **Audio admin:** جداسازی audio metadata/versions/audit trail از باینری؛ Object Storage واقعی + signed upload/download + size/type validation + checksum verification (الگوی sha256 آماده در P5/P7).
- 3. **امنیت سراسری:** RBAC (۴ نقش موجود در contracts) + RLS برای هر جدول + session expiry + CSRF + rate limit سراسری + audit logging — با Integration test برای Admin/Teacher/Parent/Child.
- 4. **Migrations:** اجرای ۷۴ migration روی Local Supabase (migration-by-migration) سپس Staging/Prod با deploy separation.
- 5. **Backup/Restore** + محیط‌های Dev/Staging/Prod جدا.
- 6. **حفظ مشروط:** APIهای child learning فقط به‌عنوان ابزار بزرگسال/مدیریت حفظ می‌شوند؛ **استفاده در lesson runtime ممنوع می‌ماند** (ADR-0039).
**برآورد واقعی:** بزرگ‌ترین گزینه — یک برنامهٔ backend کامل (معادل چند فاز). برای محصولِ کاملاً آفلاینِ کودک، value کمتر از هزینه است مگر CMS سازمانی/چند-مدرسه‌ای هدف باشد.
**گزینهٔ B — Authoring محلی/offline + پکیج امضاشدهٔ exportable؛ بازنشستگی مسیرهای runtime سرور  ⭐ پیشنهاد فنی**
**مفهوم:** Supabase/apps/web runtime مسیر بازنشسته می‌شوند؛ authoring محلی با خروجی پکیج امضاشده — **زیرساختش از P7 آماده است**: `tools/content-pipeline` (typed ST07 artifact + validator ۱۳ rule + promotion gate ۷ مرحله‌ای با ledger + PackageBuilder).
**کارهای باقی‌مانده برای تکمیل B:**
- 1. Authoring Workflow UI حداقلی (CLI فعلی کافی برای مراحل ماشین؛ فرم انسانی برای review evidence).
- 2. **Export Package** با امضا: PackageBuilder موجود خروجی می‌دهد؛ گام امضا = مالک با کلید خصوصی خارج از repo (ADR-0043 §1) — ابزار `sign` CLI اضافه می‌شود (کلید فقط محیط مالک).
- 3. Archive: `apps/web` + `packages/*-runtime` runtime paths + `supabase/migrations` به `archive/backend-2026/` (git mv؛ بدون حذف) + deprecation README per item.
- 4. Dependency map: `tools/o6-inventory.mjs` هر اجرا به‌روز می‌شود؛ verifier R11 اضافه می‌شود: هیچ import از archive/** در کد زنده.
- 5. Retire ترتیبی (فقط پس از تأیید مالک، هر گام یک commit قابل بازبینی): auth/otp → learning/* → sync/batch → missions/worlds/collection → teacher/* → admin/audio → content packages (نگه‌داشت اگر authoring به آن‌ها سوخت‌رسانی می‌کند).
- 6. ۷۴ migration: archive + نگه‌داشت در repo (هیچ SQL پاک نمی‌شود)؛ retirement plan per-table در همین pack.
**ریسک:** نگه‌داری دو استک موقت تا اتمام retire؛ تیم authoring باید با CLI کار کند.

_منبع: `docs/notes/O6_DECISION_PACK_FA.md`_

## بستهٔ تصمیم مالک — O5: هویت محلی تک‌پروفایل یا چندپروفایل

**بستهٔ تصمیم مالک — O5: هویت محلی تک‌پروفایل یا چندپروفایل**
- - تاریخ تهیه: 2026-11-18
- - وضعیت: **برای تصمیم مالک؛ هیچ گزینه‌ای در این سند تصویب نشده است.**
- - حاکم: `docs/notes/INFRASTRUCTURE_OWNER_DECISIONS_FA.md`، بخش O5.
- - قرارداد محصول: ADR-0039 (Accepted, 2026-11-05) — کاملاً آفلاین، بدون حساب/سرور؛ هویت کودک و PIN والد کاملاً محلی.
- - هدف: جلوگیری از migration سنگین progress و حفظ privacy و جداسازی دادهٔ کودکان.
**1. تصمیم موردنیاز**
- O5 می‌پرسد launch اپ برای یک کودک محلی است یا چند کودک با انتخاب پروفایل در launch.
- | گزینه | تجربه | مزیت | هزینه/ریسک |
- | A — تک‌پروفایل در نسخهٔ اول | یک پروفایل محلی فعال؛ بدون صفحهٔ انتخاب پروفایل در launch | ساده‌ترین onboarding، کمترین احتمال ورود به دادهٔ کودک دیگر، مسیر کوتاه‌تر برای cutover آفلاین | خانوادهٔ چندکودکی باید در یک پروفایل مشترک بماند یا تا پشتیبانی چندپروفایل صبر کند |
- | B — چندپروفایل با انتخاب در launch | فهرست نام/آواتار؛ انتخاب کودک پیش از نمایش Home و هر progress | مناسب مدرسه/خانوادهٔ چندکودکی، جداسازی درست پیشرفت و تنظیمات | صفحهٔ انتخاب و مدیریت پروفایل، switch/reset/delete flows و تست‌های cross-profile لازم؛ انتخاب اشتباه می‌تواند دادهٔ کودک دیگری را نمایش دهد |
**متن منبع O5:** پیشنهاد مهندسی موجود برای نسخهٔ اول گزینهٔ A است، با schema دارای `childProfileId` از روز اول تا B بعداً بدون migration تخریبی باز بماند. این پیشنهاد مالکانه تصویب نشده است.
**2. شواهد فعلی مخزن**
- | محل | وضعیت فعلی | پیامد |
- | `PreferencesProfileDraftStore` | DataStore draft شامل name/avatarId/gradeId؛ فقط برای resume فرم ناقص | این draft، پروفایل واقعی/فعال نیست و identity پایدار تولید نمی‌کند |
- | `progress_projections` | Room PK = (learningIdentityId, stationId)؛ مدل دامنه آن را آخرین projection تأییدشده تعریف می‌کند | هنوز identity محلی کودک به آن متصل نیست؛ استفاده از token یا نام کودک به‌عنوان ID مجاز نیست |
- | `LearningEntities.kt` | comment و schema صریحاً جدول profile را به O5 موکول کرده‌اند | افزودن جدول پیش از رأی O5 برخلاف قرارداد فعلی schema است |
- | `ParentPinManager` | PBKDF2-HMAC-SHA256 + salt و lockout روی interface | concrete local profile store و ParentGate wiring هنوز اثبات نشده |
- | `ShomaraChildShellHost` | progress default به حالت unresolved fail-closed تغییر کرده؛ Path و Practice تا resolve شدن snapshot، Loading می‌مانند | این guard مانع نمایش Fresh/Locked ساختگی است، اما local identity/progress هنوز تولید نمی‌کند |
**3. توصیهٔ مهندسی غیرمصوب**
**گزینه A برای release اول، با قابلیت مهاجرت به B از طریق شناسهٔ پروفایل در schema.**
- 1. تصمیم صریح محصول ADR-0039، local-only است؛ حساب یا بازیابی سروری راه‌حل نیست.
- 2. ساده‌سازی اولین اجرا برای کودک و والد مهم‌تر از ورود زودهنگام به مدیریت خانوادهٔ چندپروفایلی است.
- 3. schema باید از ابتدا هر ردیف progress/session/attempt را به یک `childProfileId` پایدار نسبت دهد؛ در آینده می‌توان چند ردیف پروفایل را بدون انتقال progress از شناسه‌های مبهم وارد کرد.

_منبع: `docs/notes/OWNER_DECISION_BRIEF_O5_LOCAL_PROFILE_FA.md`_

## مرز package و module در SHOMARA

**مرز package و module در SHOMARA**
**وضعیت فعلی TypeScript**
- - `contracts`: type/schema/policy مشترک؛ بدون UI، network client یا secret.
- - `learning-runtime`: orchestration یادگیری؛ تصمیم نهایی سرور را جعل نمی‌کند.
- - `challenge-runtime`: منطق challenge جدا از mastery/station pass.
- - `assignment-runtime` و `adult-projections`: سطح بزرگسال؛ وارد child UI نمی‌شوند.
- - `offline-sync`: queue/retry/idempotency؛ بدون وابستگی به React/Expo.
- - `content-delivery`: manifest/asset delivery؛ بدون تصمیم correctness.
- - `design-system`: token، اعداد فارسی و primitiveهای مستقل از feature.
- - `apps/mobile`: adapter و UI legacy؛ source of truth دامنه نیست.
- - `apps/web`: API/adult surface؛ از internals کلاینت import نمی‌کند.
**قواعد Native از N02**
- feature:* -> core:model, core:designsystem, core:common
- feature:* -> domain use cases (public API only)
- data:*    -> core:network, core:database, core:datastore
- ui        -X-> network/database implementation
- feature:A -X-> feature:B implementation
- - DTO، entity و domain model سه مفهوم جدا هستند.
- - repository تنها مرز هماهنگی داده است؛ در مدل آفلاین (ADR-0039) بین local (Room/DataStore) و پکیج محتوای bundle — بدون remote در مسیر کودک.
- - ViewModel state immutable و eventها explicit هستند.
- - navigation argument فقط ID پایدار است، نه object بزرگ یا answer key.
- - tokenهای Kotlin و TypeScript از یک JSON canonical تولید می‌شوند.
- - شناسهٔ Android در ADR-0036 روی `com.mathlearning.app` تثبیت شد تا هویت نصب فعلی حفظ شود؛ namespace ماژول‌ها زیر `com.mathlearning.*` قرار می‌گیرد.
**Naming**
- - فایل component/view با PascalCase، utility با camelCase و test کنار source.

_منبع: `docs/notes/PACKAGE_BOUNDARIES_FA.md`_

## نقشهٔ repository و طبقه‌بندی مسیرها

**نقشهٔ repository و طبقه‌بندی مسیرها**
- این سند مرزهای سطح بالا را توضیح می‌دهد؛ وضعیت ماشینی و تصمیم حذف در `harness/file-ledger.json` است.
- | مسیر | نقش | وضعیت در مهاجرت |
- | `apps/mobile` | کلاینت Expo فعلی و baseline رفتاری | `LEGACY_ACTIVE` تا cutover |
- | `apps/web` | Web demo، API و سطح بزرگسال | `ACTIVE` |
- | `apps/android` | مقصد Android Native | از N02 ایجاد می‌شود |
- | `packages/contracts` | قراردادهای مشترک و policy | `ACTIVE_PROTECTED` |
- | `packages/*-runtime` | منطق دامنه و runtime | `ACTIVE_PROTECTED` |
- | `packages/design-system` | token source فعلی | `ACTIVE_MIGRATION_SOURCE` |
- | `supabase` | migration و backend schema | `ACTIVE_PROTECTED` |
- | `content` | dev content packs | `ACTIVE_RESTRICTED` |
- | `content-library` | originals محافظت‌شده، index مشتق و integration gate؛ نه runtime | `DRAFT_RESTRICTED` |
- | `design` | قرارداد برند، فیلتر الهام، component readiness و playbook اجرای UI/UX | `ACTIVE_GUIDANCE` |
- | `skills` | چهار workflow مستقل و triggerپذیر با agent metadata | `CANONICAL_ACTIVE` |
- | `project-design-v2` | pipeline فعال asset/character | `ACTIVE_GENERATOR` |
- | `docs/design-handoff-2026-10` | golden و مرجع V1 | `LEGACY_ACTIVE` تا مهاجرت verifier |
- | `docs/archive` | evidence تاریخی | `HISTORICAL` |
- | `docs/history` | manifestهای خوانده‌شده توسط verifier | `LEGACY_ACTIVE` |
- | `scripts` | gateها و ابزارهای legacy | `ACTIVE_MIXED`؛ مرحله‌ای مهاجرت شود |
- | `harness` + `tools/harness.mjs` | ادامه‌پذیری و task graph | `CANONICAL_ACTIVE` |
**فایل‌های canonical ریشه**
- - `README.md`: معرفی کوتاه.
- - `AGENTS.md`: قوانین پایدار عامل‌ها.
- - `START_HERE.md`: وضعیت انسانی روز.

_منبع: `docs/notes/REPOSITORY_MAP_FA.md`_

## SHOMARA — Deep Transformation Decision Register

**SHOMARA — Deep Transformation Decision Register**
- - تاریخ مبنا: 2026-11-17
- - شاخهٔ اجرا: `work/shomara-deep-transformation`
- - مبنای ثابت: `infra/p14b-home-ui@6cd0e7ac7e69d6d5a6117f38ccbcb9b2bc69eb8c`
- - وضعیت: **در حال اجرا؛ این سند جایگزین ADRهای مصوب یا تصمیم مالک نیست.**
- - قاعده: وضعیت `OPEN` فقط با تصمیم صریح مالک تغییر می‌کند. توصیهٔ فنی، تصمیم مصوب محسوب نمی‌شود.
**1. خلاصهٔ تصمیم‌ها**
- | حوزه | وضعیت | تصمیم فعلی |
- | Kotlin + Jetpack Compose / single activity | KEEP | مسیر Native حفظ شود؛ تغییر framework/replatform در این مأموریت لازم نیست. |
- | Room برای دادهٔ ساختاریافته + DataStore برای تنظیمات سبک | KEEP | با O4 مصوب و ADR-0042 همسو است. |
- | منبع حقیقت یادگیری آفلاین: پکیج نسخه‌دار + evaluator محلی | KEEP / OPEN | مرز معماری حفظ؛ O1/O2 هنوز تصمیم مالک می‌خواهد و release package واقعی موجود نیست. |
- | Home: grade/chapter ثابت و شمارش صفر | REVISE | از Host حذف شد؛ بدون identity/progress واقعی نباید نمایش داده شود. |
- | Home: Continue Card در کنار Current node | REVISE | از Host حذف شد؛ هر دو یک Station Start Sheet را باز می‌کردند و CTA تکراری بودند. |
- | گراف مسیر و Station Start Sheet | KEEP | گراف/قفل/برگهٔ شروع حفظ شده‌اند؛ مسیر اصلی Home است. |
- | ثبت Lesson Attempt در Room | REVISE → IMPLEMENTED, UNVERIFIED | اکنون session + attempt در یک transaction و با idempotency اتمیک ثبت می‌شوند؛ تست جدید نوشته شده ولی هنوز اجرا نشده است. |
- | تزریق LessonRecordRepository در composition root | REVISE → IMPLEMENTED, UNVERIFIED | از container واقعی به `MainActivity → ShomaraApp → LessonHost` تزریق شد؛ compile/device هنوز تأیید نشده. |
- | محصول کاملاً آفلاین / no server | KEEP (OWNER-APPROVED, ADR-0039) | تصمیم 2026-11-05: محتوای bundle + evaluator محلی + پروفایل محلی؛ Phone/OTP در محصول نهایی وجود ندارد و در Phase 2 پس از O5 حذف می‌شود. |
- | O1 evaluator / O2 package schema / O3 LessonGateway | OPEN | تصمیم یا تأیید قبلی مالک لازم است؛ UI حق دور زدن آن را ندارد. |
- | O5 local identity / single vs multi profile | OPEN | تا تعیین identity نمی‌توان ProgressRepository را به Home وصل کرد یا از token به‌عنوان identity استفاده کرد. |
- | O6 CMS/backend | OPEN | retirement/retain بدون رأی مالک ممنوع است. |
- | O7 package/media budget | OPEN | سقف نهایی بدون اندازه‌گیری assetهای واقعی جعل نمی‌شود. |
- | محتوای ۲۴ ایستگاه + media انسانی/دارای حق | BLOCKED_EXTERNAL | تألیف، صوت/تصویر واقعی، حقوق و بازبینی انسانی خارج از توان تغییر کد خودکار است. |
- | حذف V1/Expo و verifierهای legacy | DEFERRED | فقط بعد از parity route-by-route و اثبات consumer-free. |
- | HomePathScreen / HomeUiState موازی | OPEN | استفادهٔ زندهٔ آن‌ها باید با reference scan کامل اثبات شود؛ حذف عجولانه ممنوع. |

_منبع: `docs/notes/SHOMARA_DEEP_TRANSFORMATION_DECISIONS_FA.md`_

## Adult Surface

**Adult Surface**
**Status**
- Current supporting adult-surface contract; child onboarding authentication remains phone OTP only.
**Purpose**
- The adult surface exists to help a parent understand and support learning. It is not a second learner dashboard.
**Child shell rule**
- The child product exposes exactly three primary destinations: مسیر / تمرین / من.
- Teacher login, teacher portal, assignments, leaderboard, friends, and learning currencies do not appear in the child shell.
**Parent report sections**
- 2. Current progress
- 3. Skills needing attention / building / strength
- 4. Recent learning
- 5. One simple activity for home
**Deliberate removals**
- The parent report does not expose teacher workflows, assignment management, ranking, social feed, or controls that directly change learning truth.
**Authorization**
- Parent access is a UX boundary, not a second authentication mechanism in the child onboarding flow. Server endpoints must authorize the parent account and child relationship independently.
**Settings**
- Settings are child-secondary and contain only learning and accessibility preferences. Account/teacher/subscription/product-management surfaces are not mixed into the child Settings page.
**Teacher**
- Teacher authentication and teacher workflow are not part of the child product or the current parent report. Existing teacher APIs are preserved for a possible separate Teacher product.

_منبع: `docs/reference/ADULT_SURFACE.md`_

## Child Product Surface

**Child Product Surface**
**Status:** Current supporting contract
**Date:** 2026-10-03
**Scope:** learner-facing Web + Mobile UI
**Product rule**
- The child experience should answer three questions immediately:
- 1. Where do I learn next? → **مسیر**
- 2. Where do I practise? → **تمرین**
- 3. What have I earned and who am I? → **من**
- Primary navigation is intentionally limited to three destinations.
- | Primary destination | Purpose | Active screens |
- | مسیر | guided learning path, unit, station and lesson | S07–S13 |
- | تمرین | short repeatable practice grounded in the path | S14 |
- | من | identity, real progress, achievements, appearance, settings and parent access | S17–S21 |
**Profile surface**
- Profile is a compact identity surface with exactly four groups:
- - Identity: avatar, name, grade.
- - Progress: completed stations and unlocked achievements.
- - Achievements: the current five-item milestone baseline; the authoritative achievement registry expands in roadmap P07.
- - Actions: `تغییر ظاهر`, `تنظیمات` and protected `والدین`.
- Achievement detail (S18) is secondary and uses a dialog/sheet from Profile. Appearance (S20) is a secondary child route entered from Profile.
**Secondary / embedded learning surfaces**
- - **دستاوردها (S17)** stays on Profile; it is not a primary tab.
- - **دستاورد جزئیات (S18)** is a secondary detail dialog/sheet.
- - **مهارت‌ها (S15)** is learning evidence, not a separate navigation destination.
- - **مرور مفهومی (S16)** belongs inside learning/practice context, not a parallel curriculum.
- - **تنظیمات (S21)** is a secondary child surface. **والدین** remains outside the child screen taxonomy and stays behind an adult gate.
**Removed from the child product shell**
- These must not create learner-facing navigation entries:
- - Teacher login / teacher portal
- - Leaderboards / leagues / rankings
- - School assignments
- - Friends feed / social gallery
- - Companion gallery
- - Animation lab / developer demos
- - Persistent streak, XP, gems or daily-goal widgets
- - Spendable reward currency
- - Standalone Treasure/Backpack surface
- Backend services for adult/teacher workflows may remain. Their existence must never create a child-visible entry.
**Achievements**
- Achievements are meaningful learning milestones. The current Profile implementation exposes a five-item baseline. Roadmap P07 will replace this limited registry with the authoritative achievement registry while preserving Profile as the primary collection surface.
- | ID | Title | Unlocks when |
- | A01 | شمارش‌گر | ST01 complete |
- | A02 | جهت‌یاب | ST02 complete |
- | A03 | عددساز | ST03 complete |
- | A04 | شکل‌شناس | ST04 complete |
- | A05 | حسابگر | ST05 complete |
- No XP, gems, streak, league, rank, mastery tier, or fabricated percentage is displayed.
**Avatar**
- S20 is a secondary route from Profile. It intentionally stays small:
- `Preview → choose preset → save / cancel`
- Avatar identity is separate from the Companion cast.
**Station naming / header**
- Learner-facing names are fixed:
- | ID | Name |
- | ST01 | شمارش و الگو |
- | ST02 | جایگاه و جهت |
- | ST03 | عدد و جمع |
- | ST04 | شکل‌ها و ویژگی‌ها |
- | ST05 | جمع و تفریق |

_منبع: `docs/reference/CHILD_PRODUCT_SURFACE.md`_

## Current Dependency & Architecture Matrix

**Current Dependency & Architecture Matrix**
**Status:** Current supporting reference
**Authority:** `ROADMAP_PHASES.md` for execution order; ADR/contracts for locked architecture.
- | Area | Current decision | Verification/source |
- | Backend | Modular monolith with Supabase/PostgreSQL boundary | ADR-0003 + current code/migrations |
- | Web | Next.js + React + TypeScript; secondary validation surface | workspace manifests + current routes |
- | Mobile | React Native + Expo + Expo Router + TypeScript; Android-first | mobile manifest + Expo config |
- | Animation | Rive for production character motion where approved; Reanimated for UI motion | ADR-0002 + animation runtime source spec |
- | Database | PostgreSQL via Supabase migrations | `supabase/migrations/` |
- | Auth | Supabase Auth with production phone OTP onboarding | onboarding contract + auth runtime |
- | Content delivery | Manifest + versioned package + checksum + CURRENT/NEXT/RECENT/FUTURE cache policy | content contract + content-delivery package |
- | Learning truth | Server-authoritative Learning Runtime | ADR-0003 + learning-runtime package + migrations |
- | Assignments | Adult/teacher projection and assignment services remain outside the child shell | adult/assignment contracts + server routes |
- | Offline sync | At-least-once client queue with idempotent server handling; no second learning authority | offline-sync package + offline API contract |
- | Cache authority | Local cache state is disposable; entitlement/content access remains server-authoritative | content contract + mobile content manager |
- | Performance | 60 FPS target for standard child interactions; low-end Android profiling required before pilot | animation runtime + release QA |
- | Accessibility | RTL-first, explicit reduced-motion support, large-text/device QA, non-color-only state communication | design system + onboarding/path contracts |
- | Engine boundary | No Unity/Unreal/Godot; reusable React Native/Web game templates on top of Learning Runtime | ADR-0001 + game/engagement source |
**Rule**
- Do not add a dependency because a benchmark product uses it. Add it only when the product requirement, current platform constraints, and maintenance cost are documented in the active roadmap/ADR/contract set.

_منبع: `docs/reference/DEPENDENCY_MATRIX.md`_

## شمارا — Design System Reference

**شمارا — Design System Reference**
- این فایل مرجع انسانی Design System است. منبع اجرایی tokenها در `packages/design-system/src/tokens.json` قرار دارد.
**Repository layout**
- packages/design-system/
- src/tokens.json              # Source of truth
- src/index.ts                 # Typed exports + legacy bridge
- apps/web/app/design-tokens.generated.css
**Generated Web CSS variables — do not edit directly**
- apps/web/components/ui/
**Web primitives**
- apps/mobile/src/ui/design-system/
**Native adapter + primitives**
- docs/reference/DESIGN_SYSTEM.md
**Human-readable contract**
**Non-negotiable rules**
- - New colors, spacing, radii, sizes and type scales MUST come from Design System tokens.
- - Child-facing UI remains Persian-first and RTL.
- - Vazirmatn is the product UI font.
- - Interactive controls target at least 48px/dp.
- - Amber is used for reward/secondary emphasis; error semantics use explicit error tokens and text, not color alone.
- - Reduced motion follows both OS preference and explicit app setting.
- - Existing legacy aliases in `apps/web/app/globals.css` are migration-only.
**Change process**
- 1. Change `packages/design-system/src/tokens.json`.
- 2. Run `npm run design-system:generate`.
- 3. Run `npm run verify:uiux:p3`.
- 4. Update component consumers and evidence documents in the same change.

_منبع: `docs/reference/DESIGN_SYSTEM.md`_

## Lesson Player Contract

**Lesson Player Contract**
- این سند قرارداد اجرایی تجربه درس برای Web و Mobile است.
**اصول**
- - پاسخ آموزشی فقط با نتیجه server-authoritative معتبر می‌شود.
- - در assessment شخصیت companion نمایش داده نمی‌شود.
- - feedback باید یک action اصلی داشته باشد.
- - خطای شبکه نباید به‌عنوان موفقیت آموزشی نمایش داده شود.
- - خروج از درس در میانه مسیر نیازمند تأیید است.
- - progress صرفاً وضعیت journey را نشان می‌دهد و معادل mastery نیست.
- - recovery و recheck stateهای مستقل هستند.
**States**
- `ENTRY → TEACH → PRACTICE → ASSESSMENT → RECOVERY/RECHECK → RESULT → COMPLETE`
**Shared source**
- - `packages/contracts/src/lesson.ts`
- - Web: `LessonPlayerHeader`, `LessonFeedback`
- - Mobile: `LessonPlayerChrome`, `LessonFeedbackCard`

_منبع: `docs/reference/LESSON_PLAYER_CONTRACT.md`_

## Mobile Local State Contract

**Mobile Local State Contract**
- The Android app stores a device-local projection for onboarding, resume, avatar and UI preferences.
**Schema**
- `apps/mobile/src/state/appStateCore.ts` is the source of truth. The current local schema is `3`.
- Schema 3 adds:
- preferences.sound
- preferences.motion
- preferences.largeText
- When a schema 1/2 file is read, missing preferences migrate in memory to the safe defaults:
- - motion: on
- - large text: off
- The app then persists the next state write at schema 3.
**Security boundary**
- Authentication tokens are not stored in this document. Access tokens are persisted with Expo SecureStore. Learning truth, station pass and Jump authorization remain server-authoritative; the local document is only a UI/progress projection.
**Recovery**
- Unknown future schema versions are preserved as a backup and put through the recovery/first-run path. Corrupt documents are also backed up before reset.

_منبع: `docs/reference/MOBILE_LOCAL_STATE.md`_

## Onboarding Contract — S01–S07

**Onboarding Contract — S01–S07**
**Canonical sequence**
- `S01 Welcome → S02 Phone → S03 OTP → S04 Grade → S05 Child Profile → S06 Optional Placement → S07 Path`
- Phone OTP is the only authentication method in the current mobile-first release. There is no separate parent/adult authentication gate in onboarding.
- The placement result is a starting-point suggestion only. It does not grant stars, mastery, or other rewards.
**Data boundary**
- No child profile field is durably persisted before phone verification and completion of onboarding. The short-lived form/session state may remain in memory or session scope only. `consentAt` is retained for compatibility as a timestamp for onboarding terms acceptance; it is not evidence of parent authentication.
**Authentication truth**
- Phone OTP is provider-backed. The UI must never accept a locally invented OTP or report success when the provider is unavailable. Guest, Google, and email are not part of the current onboarding UI.
**Grade truth**
- The onboarding catalog currently exposes only grades with published content in the staged environment. At the current baseline that is G1. Future grade selection is visibly unavailable rather than navigable to empty content.
**Avatar truth**
- The child avatar is an identity preset owned by the child profile. It is not a companion character. Companion characters (Aria, Qbo, Dana, Jiko) remain contextual learning guides.
**Accessibility**
- RTL is mandatory. Phone/OTP fields are LTR. Primary actions are at least 52dp/56px depending on platform. Selected state is not communicated by color alone. Reduced motion must not block access to any action.
**Required states**
- `default, loading, invalid, provider unavailable, expired OTP, rate limit, offline, retry, empty, save failure, returning, recover`

_منبع: `docs/reference/ONBOARDING_CONTRACT.md`_

## Package Delivery Standard

**Package Delivery Standard**
- Every project handoff is a **complete snapshot**, not a delta-only patch.
- Each snapshot must include:
- 1. All implementation files accumulated so far.
- 2. All source/design/spec MD files already accepted into the project.
- 3. All migrations and seeds accumulated so far.
- 4. All shared contracts and API client code.
- 5. All new files from the current phase.
- 6. Verification scripts/tests for completed phases.
- 7. A phase revision note.
- 8. A snapshot manifest stating what was included and what was not runtime-verified.
- A later snapshot supersedes the previous snapshot as the working handoff, but previous ZIPs remain useful historical checkpoints.

_منبع: `docs/reference/PACKAGE_DELIVERY_STANDARD.md`_

## Path 2.1 Visual Rules

**Path 2.1 Visual Rules**
**Status:** Canonical
**Scope:** Learner-facing Path on Web + Mobile
**Visual hierarchy**
- The Path is the primary learning surface. It is one continuous scroll, grouped into Units, with a single current position.
**Unit header**
- - short Unit title
- - completed/total count
- Do not place long learning objectives or explanatory paragraphs in the header.
**Station node kinds**
- The station identity is communicated by the icon shape, while status is communicated by state treatment.
- | Kind | Meaning | Icon treatment |
- | LESSON | core learning step | book |
- | PRACTICE | repeatable practice | sparkles |
- | CHALLENGE | unit-end challenge | trophy |
- | REVIEW | review step | refresh |
- State wins over kind for the semantic status: completed = check, locked = lock, not-downloaded = download, sync-pending = sync.
**Path geometry**
- Station rows alternate right/left through the whole 25-station path. Connectors are diagonal/curved and there is no central vertical spine.
**Jump**
- Jump appears at a Unit boundary, not between arbitrary stations. It opens a five-question assessment. The server scores it. Four correct answers are required to open the target Unit's first station. Failed assessment returns the learner to the Path.
- Successful jump does not mark skipped stations complete. Skipped stations remain revisit-able.
**Primary actions**
- Only the current station gets an inline `ادامه بده` action. Other accessible stations are opened directly; locked stations explain the prerequisite without exposing technical identifiers.
**Responsive rule**
- The same semantic Path is rendered on Web and Mobile. Layout may change, but order, statuses, Unit grouping, Jump rules, and station titles do not.

_منبع: `docs/reference/PATH_2_1_VISUAL_RULES.md`_

## Path 2.1 Contract

**Path 2.1 Contract**
- Date: 2026-10-03
- Status: Frozen current path contract
**Child navigation**
- Primary destinations are exactly:
- No teacher, social, currency, shop, leaderboard, or backpack surfaces may appear in the child shell.
**Continuous path**
- - The Grade 1 path contains 25 learner stations grouped into 5 units.
- - Units are rendered in one continuously scrollable surface.
- - Station nodes alternate left/right across the complete 25-station sequence (the alternation does not reset at a unit boundary).
- - A unit header is the visual anchor for each five-station group.
- - A checkpoint appears between units.
- - Current, completed, available, locked, not-downloaded, and sync-pending states are distinct.
- - A skipped station remains revisit-able after a successful jump.
- - Completing a jump target moves the learner cursor forward; skipped earlier stations remain available for review.
**Jump**
- - Jump is offered at a unit boundary after the previous unit is completed.
- - Every jump is a distinct 5-question assessment.
- - Passing requires at least 4/5.
- - The client does not contain the answer key.
- - Server validation is authoritative.
- - Passing opens only the first station of the next unit.
- - Failing does not change learning progress and returns the learner to the path.
- - Jump has no XP/gems/streak currency reward.
**Station presentation**
- Stations also have a visual kind contract exported from `packages/contracts/src/path2.ts`; Web and Mobile use the same mapping for lesson, practice, review and challenge node iconography.
- Header is intentionally compact:
- ایستگاه {number}
- {station.title}
- {minutes} دقیقه
- Long explanatory copy belongs inside the lesson, not in navigation chrome.
**Login / entry**
- - The child-facing shell does not expose teacher login.
- - Login presents only working authentication methods.
- - Disabled providers are not rendered as interactive choices.
- - Technical screen IDs are never visible to the learner.
- - Guest entry, when present, is tertiary and still uses the adult gate.
**Profile / settings**
- `من` contains identity, real progress, achievements, appearance, settings, and adult access. Settings is secondary, not a primary tab.
- Current child settings are limited to sound, motion, and text size; future notification controls must not be rendered until they are implemented.
**Visual direction**
- The product uses a Persian-first neutral canvas with a green primary identity and semantic secondary accents. The palette is owned by `packages/design-system/src/tokens.json`; screen-specific hardcoded brand colors are prohibited.

_منبع: `docs/reference/PATH_2_CONTRACT.md`_

## Practice Hub Contract

**Practice Hub Contract**
**Purpose**
- Practice is a supporting learning surface, not a second progression system.
**Canonical visible surface**
- - S14 — Practice / short games
- Skills (S15) and concept review (S16) remain curriculum data and may be rendered inside learning/progress experiences later. They are not primary child navigation surfaces in the current product shell.
**Visible layout**
- 1. One recommended practice action.
- 2. A small list of short games.
- 3. One secondary action back to Path.
**Rules**
- 1. Practice may expose opportunities already grounded in the current curriculum/path.
- 2. Practice must not unlock or bypass locked stations.
- 3. Practice must not infer mastery, percentages, streaks, or rewards from local UI state.
- 4. Practice must not create a second navigation hierarchy for skills/concepts.
- 5. Interactive controls use shared Design System touch targets.
- 6. Web and Mobile consume the same contract.
**Path grounding**
- `canOpenPracticeStation()` allows:
- - stations already completed;
- - the first uncompleted station.
- Everything later in the sequence returns the learner to Path. This is a UX guard, not a security boundary; authoritative learning remains server-side.

_منبع: `docs/reference/PRACTICE_HUB_CONTRACT.md`_

## Profile / Achievement / Avatar Contract

**Profile / Achievement / Avatar Contract**
**Status:** Current supporting contract
**Date:** 2026-10-03
**Scope:** learner-facing Web + Mobile
**Profile hierarchy**
- `من` is the identity and progress surface. It contains exactly four visual groups:
- 1. Identity — avatar, name, grade.
- 2. Progress — completed stations and unlocked achievements.
- 3. Achievements — the current five-item milestone baseline; the authoritative achievement registry expands in roadmap P07.
- 4. Actions — `تغییر ظاهر` and protected `والدین`.
- No teacher, social, companion, currency, league, assignment, or developer surface belongs here.
**Achievements**
- Achievements are milestone trophies earned from completed learning stations. They remain on Profile rather than becoming a primary navigation destination. Each item can open a secondary detail sheet/dialog (S18) without introducing a new navigation branch.
- | ID | Title | Station | Icon |
- | A01 | شمارش‌گر | ST01 | count |
- | A02 | جهت‌یاب | ST02 | direction |
- | A03 | عددساز | ST03 | number |
- | A04 | شکل‌شناس | ST04 | shape |
- | A05 | حسابگر | ST05 | calculation |
- The UI does not invent XP, gems, streaks, leagues, ranking, tiers, or percentage mastery.
**Avatar Workshop**
- S20 is a secondary child route entered from Profile. It is intentionally small:
- `Preview → choose preset → save / cancel`
- The current implementation provides four canonical presets. Selection is a child profile projection and does not change learning truth.
**Visual direction**
- The design borrows broad principles from Duolingo's documented product craft work: consistent headers, a small intentional type hierarchy, purposeful whitespace, simplified navigation, and achievement collections presented as milestone rewards on the learner profile. It does **not** reuse Duolingo's branded artwork, copy, or proprietary assets.

_منبع: `docs/reference/PROFILE_ACHIEVEMENT_AVATAR_CONTRACT.md`_

## Progression Contract

**Progression Contract**
- این فایل قرارداد اجرایی تجربه `Path → Unit → Station Start → Station` است. منبع executable آن `packages/contracts/src/progression.ts` است.
**Status semantics**
- | وضعیت | معنی |
- | COMPLETED | ایستگاه طبق truth معتبر کامل شده است. |
- | CURRENT | قدم اصلی فعلی کودک است. |
- | AVAILABLE | در صورت وجود محتوا آماده شروع است. |
- | LOCKED | پیش‌نیاز یادگیری کامل نشده؛ با دانلود اشتباه نشود. |
- | NOT_DOWNLOADED | پیش‌نیاز باز است اما بسته محتوا روی دستگاه آماده نیست. |
- | SYNC_PENDING | نتیجه محلی هنوز authoritative sync نشده است. |
- `LOCKED`, `NOT_DOWNLOADED` و `SYNC_PENDING` فقط با تغییر رنگ نمایش داده نمی‌شوند؛ متن وضعیت باید همراه آنها وجود داشته باشد.
**Canonical flow**
- `S07 Path → S08 Unit → S09 Station Start → S10 Lesson`
- پرش از S08/S07 فقط به S13 می‌رود و خودش هیچ unlock جعلی انجام نمی‌دهد. تصمیم بازشدن باید از learning runtime معتبر بیاید.

_منبع: `docs/reference/PROGRESSION_CONTRACT.md`_

## Adult Projection API Contract

**Adult Projection API Contract**
**Parent**
- GET /api/v1/parent/:parentAccountId/children
- GET /api/v1/parent/:parentAccountId/today
**Teacher**
- GET /api/v1/teacher/:teacherAccountId/classes
- GET /api/v1/teacher/:teacherAccountId/classes/:classId
- GET /api/v1/teacher/:teacherAccountId/students/:learningIdentityId
- GET /api/v1/teacher/:teacherAccountId/needs-attention
- GET /api/v1/teacher/:teacherAccountId/recheck-queue
- POST /api/v1/teacher/students/:learningIdentityId/observations
**Authorization**
- Development adapter checks the same boundaries expected in production:
- - Parent → related child only.
- - Teacher → own class learners only.
- Production implementation must enforce via Supabase Auth + server-side authorization + RLS.
**Projection fields**
- Parent Today:
- - today summary
- - current station
- - skills snapshot
- - recent learning
- - simple home activity
- - assignment status
- Teacher Student Snapshot:
- - recent evidence summary
- - current decision
- - recommended next action
- - recent interventions
**Observation**
- Observation payload is append-only source data with explicit provenance:
- "teacherAccountId": "...",
- "classId": "...",
- "observation": "..."

_منبع: `docs/api/API_ADULT_PROJECTION_CONTRACT.md`_

## Assignment API Contract

**Assignment API Contract**
**Create Assignment**
- `POST /api/v1/assignments`
- "id": "assignment_...",
- "classId": "...",
- "authorAccountId": "...",
- "learnerIds": ["...", "..."],
- "sharedObjective": "...",
- "sharedOutcome": "...",
- "stationIds": ["ST01"],
- "adaptationMode": "BOUNDED_ADAPTIVE",
- "startsAt": "2026-09-24T18:00:00.000Z",
- "dueAt": null,
- "completionRule": "STATION_PASS"
**Publish**
- `POST /api/v1/assignments/:assignmentId`
- "action": "PUBLISH",
- "learnerIds": ["child-01", "child-02"]
**Recheck**
- `POST /api/v1/assignment-instances/:instanceId/recheck`
- "requestedByAccountId": "teacher-01",
- "reason": "یک بار دیگر بررسی شود"
**Recheck completion (teacher only)**
- `POST /api/v1/assignment-instances/:instanceId/recheck/complete` — body `{ "recheckId": "..." }`. Only the assignment author or a teacher of its class. This is the only way an instance leaves `NEEDS_RECHECK` (→ `COMPLETED` if every target station was passed, else `ACTIVE`). Recheck cannot be requested for `CANCELLED`/`EXPIRED` instances or when one is already pending (HTTP 409).
**Completion is server-authoritative**
- `POST /api/v1/assignment-instances/:instanceId/outcome` is **retired (HTTP 410)**. A learner can never report completion. The server marks an instance `COMPLETED` only after its own verified station pass (`completionRule: STATION_PASS`, every station in `target.stationIds` passed). Skill-only targets are not auto-completed.
**Child Assignment View**
- `GET /api/v1/learning-identities/:learningIdentityId/assignments`
- Returns assignment metadata plus the child-specific instance. It does not expose raw class-wide learning data.

_منبع: `docs/api/API_ASSIGNMENT_CONTRACT.md`_

## Content Delivery API Contract

**Content Delivery API Contract**
**Manifest**
- `GET /api/v1/content/manifest?gradeId={gradeId}`
- Response: `ContentManifest`
**Package**
- `GET /api/v1/content/packages/{packageId}`
- The route returns package bytes. Response headers include package ID and SHA-256 checksum.
**Entitlement**
- `GET /api/v1/content/entitlements/{packageId}`
- Header: `x-learning-identity-id`.
- Production implementation must use authenticated identity plus server-side authorization/RLS. Development uses `DEV_GRANT` only outside production.
**Assignment content requirement**
- `GET /api/v1/assignments/{assignmentId}/content`
- Production implementation resolves `assignment_required_packages`; the current development route is intentionally a non-authoritative fixture.
**Client rules**
- - Never trust a package URL without a manifest record.
- - Never mark a package usable before checksum verification.
- - Never download future content by default.
- - Never treat entitlement as equivalent to local cache presence.
- - Package cache is disposable; canonical content access is server authoritative.

_منبع: `docs/api/API_CONTENT_DELIVERY_CONTRACT.md`_

## E2E / Release API Contract

**E2E / Release API Contract**
**Critical endpoints under E2E**
- | Endpoint | Method | Purpose |
- | `/api/v1/content/manifest?gradeId=G1` | GET | Independent manifest retrieval |
- | `/api/v1/learning/sessions` | POST | Start version-pinned session |
- | `/api/v1/assignments` | POST | Create bounded teacher assignment |
- | `/api/v1/assignments/:id` | POST | Publish assignment to learners |
- | `/api/v1/sync/batch` | POST | Idempotent offline action sync |
- | `/api/v1/parent/:id/today` | GET | Parent projection |
- | `/api/v1/teacher/:id/classes` | GET | Teacher class projection |
**E2E invariants**
- 1. Manifest does not require full-grade content download.
- 2. Session pins Grade + Curriculum + Skill Graph versions.
- 3. Assignment does not duplicate content packages.
- 4. Sync batch is capped at 20 actions.
- 5. Duplicate idempotency keys do not create duplicate learning records.
- 6. Parent/Teacher responses are projections, not new learning truths.
- 7. Client cannot directly set Mastery, Station Pass or Learning State.

_منبع: `docs/api/API_E2E_RELEASE_CONTRACT.md`_

## Learning Runtime API Contract

**Learning Runtime API Contract**
**1. Start Session**
- `POST /api/v1/learning/sessions`
- Development body:
- "learningIdentityId": "child-1",
- "relationshipContextId": "platform",
- "gradeId": "G1",
- "curriculumVersionId": "G1-CV1",
- "skillGraphVersionId": "G1-SG1",
- "sessionType": "LEARNING"
- Server returns a canonical Session with pinned versions.
**2. Create Encounter**
- `POST /api/v1/learning/sessions/{sessionId}/encounters`
- "contentVersionId": "G1-ST01-CHECK-001",
- "stationId": "G1-ST01",
- "skillId": "G1-SK001",
- "learningRole": "MASTERY_CHECK",
- "experienceForm": "CHALLENGE",
- "sequence": 1
- Server validates Session version pins and Content Version integrity.
**3. Submit Attempt**
- `POST /api/v1/learning/attempts/submit`
- "sessionId": "session-id",
- "encounterId": "encounter-id",
- "attemptNumber": 1,
- "clientIdempotencyKey": "installation-id:attempt-id",
- "answers": [
- { "answerIndex": 0, "answerPayload": 3 }
- Response contains:
- - Attempt + evaluation
- - Evidence reference/data
- - current Learning State
- - Learning Decision
- - Learning Plan
- - Station Pass status
- - Recheck flag
- - semantic event for animation/UI
**Authorization boundary**
- These development routes intentionally use a dev-only identity adapter. Production authentication/authorization must be connected to Supabase Auth + server-side relationship authorization before release.

_منبع: `docs/api/API_LEARNING_RUNTIME_CONTRACT.md`_

## Offline Sync API Contract

**Offline Sync API Contract**
**POST /api/v1/sync/batch**
- - `X-Client-Installation-Id` required.
- "actions": [
- "id": "local-action-id",
- "clientInstallationId": "installation-id",
- "learningIdentityId": "learning-id",
- "operationType": "SUBMIT_ATTEMPT",
- "idempotencyKey": "unique-operation-key",
- "payload": {},
- "status": "PENDING",
- "attemptCount": 0,
- "createdAt": "2026-09-24T00:00:00.000Z",
- "updatedAt": "2026-09-24T00:00:00.000Z"
- "results": [
- "status": "ACKED",
- "response": {}
**Result semantics**
- - `ACKED`: canonical server processing accepted the operation.
- - `DUPLICATE`: operation already accepted; client may safely remove local copy.
- - `RETRY`: transient condition; keep local action.
- - `REJECTED`: permanent contract/auth/content error; keep auditable failure state and do not loop forever.
**Content cache semantics**
- `CURRENT / NEXT / RECENT / FUTURE` remain a local delivery policy. Cache state is not Learning Truth.

_منبع: `docs/api/API_OFFLINE_SYNC_CONTRACT.md`_

## API Surface Registry (Mobile ↔ Backend)

**API Surface Registry (Mobile ↔ Backend)**
**Phase:** B1 (draft, living document)
**Date:** 2026-10-06
**Rule:** Mobile learning path must only call routes listed here (or Supabase RPC equivalents documented below).
- Client entrypoint: `apps/mobile/src/station/runtimeApi.ts`
- Contracts: `packages/contracts`, `packages/learning-runtime`, `packages/challenge-runtime`
**1. Auth & installation**
- | Client capability | Method / path (HTTP) | Notes |
- | Request OTP | auth API module | Iran mobile |
- | Verify OTP | auth API module | Issues access token |
- | Hydrate token | local secure store | Not learning truth |
- | Register installation | `POST /api/v1/client/installations` | Device binding |
**2. Learning runtime**
- | Client capability | Method / path | Server authority |
- | Start station session | `POST /api/v1/learning/sessions` | Pins grade / curriculum / graph versions |
- | Resume session | runtime resume (RPC / HTTP) | Snapshot + latest encounter |
- | Create encounter | `POST /api/v1/learning/sessions/{id}/encounters` | Content version integrity |
- | Submit attempt | `POST /api/v1/learning/attempts/submit` | Evaluation + evidence + decision |
- | Progression snapshot | progression endpoint / `runtime_get_progression_snapshot` | completed + jump unlocks |
- Detailed shapes: `API_LEARNING_RUNTIME_CONTRACT.md`
**3. Signature challenge**
- | Client capability | Preferred server surface | Notes |
- | Start challenge | `runtime_start_challenge` | sessionId + definitionId + idempotency |
- | Submit round | `runtime_submit_challenge_round` | answers fingerprint; no client grading |
- | Request hint | `runtime_request_challenge_hint` | Level-aware |
- | Finish / exit | `runtime_finish_challenge` | Does **not** set station pass |
- | Read run | `runtime_get_challenge_run` / `challenge_run_view` | Presentation only (0072) |
**Guardrail:** Challenge results are practice evidence, never mastery/station completion.
- SQL foundations: `0055`, `0056`, `0072`
**4. Content delivery**
- | Client capability | Path area | Notes |
- | Manifest | content API | Per grade |
- | Entitlement | ` /api/v1/content/entitlements/{packageId}` | |
- | Download package | content manager | Checksum / channel |
- See `API_CONTENT_DELIVERY_CONTRACT.md`
**5. Engagement (infra only)**
- | Client capability | Area | Notes |
- | Mission hub | mission RPC / API | P06 |
- | Achievements | collection projection | P07 |
- | Avatar workshop | avatar save / get | P08 |

_منبع: `docs/api/API_SURFACE_REGISTRY.md`_

