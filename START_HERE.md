# START_HERE.md — وضعیت canonical پروژهٔ SHOMARA

```yaml
file_version: 35
last_updated: 2026-10-28
snapshot_id: SNAP-20261028-NATIVE-N02-FINAL-REVIEW
baseline_commit: ef35ce24fb8023ce0d247d1281cf0166bffb2140
working_branch: native/n02-foundation
active_product: SHOMARA
closed_product: AVA
target_client: Android Native (Kotlin + Jetpack Compose)
current_phase: N02
current_task: N02-07
phase_status: IN_PROGRESS_11_OF_12_BLOCKED_ENV
apk_status: DEBUG_PIPELINE_READY__NOT_BUILT_SDK37_MISSING
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
- [ ] `N02-07` اجرای واقعی compile/lint/unit — `BLOCKED_ENV`؛ instrumentation در فاز دارای emulator/device

پنج Skill پروژه فقط در `skills/<name>/` قرار دارند و `agents/openai.yaml` معتبر دارند: چهار Skill طراحی/اجرا/محتوا و یک Skill مستقل build. `design/MASTER.md` قرارداد برند/UX V3، `INSPIRATION_GUARDRAILS.md` مرز adopt/adapt/reject و `COMPONENT_READINESS.md` قرارداد componentهای N03 را تعریف می‌کند. ۱۵ route زنده در `design/playbook/ROUTE_REGISTRY.md` ثبت شده‌اند. هر ۱۷ خانوادهٔ صفحه outcome/focal/CTA/depth/state اختصاصی دارد و ۲۰ work item Native با dependencies/evidence صریح، تا اجرای واقعی در وضعیت `NATIVE_PENDING` نگه داشته شده‌اند.

محیط Android اکنون build harness قابل‌تکرار دارد: `npm run android:doctor` برای readiness، `npm run android:gate` برای test/lint/compile و `npm run android:assemble:debug` برای gate + APK. workflow روی `ubuntu-24.04` و Node 22 پین شده، `platforms;android-37` را صریح نصب می‌کند و همان gate محلی را اجرا می‌کند. گزارش‌ها generated و خارج از Git هستند؛ APK موفق فقط با مسیر/اندازه/SHA-256 پذیرفته می‌شود. در runner فعلی JDK 17 سبز است، اما SDK root/platform 37 وجود ندارد.

`content-library/originals/**` شامل ۱۰ فایل byte-protected است: مطالعهٔ ۲۵ بخش/۱۵۰ صفحه، معماری ۱۰۰ مهارت، ۱۵ pattern و ۲۳۲ ردیف metadata صوت. فقط ST07 spec کامل دارد؛ ۲۴ ایستگاه دیگر هنوز باید تولید شوند. ممیزی canonical در `content-library/integration/SOURCE_AUDIT.md`، مرز سه مدل/lifecycle در `AUTHORING_CONTRACT_GAPS.md` و مالکیت فازها در `PHASE_INTEGRATION.md` است. هیچ original، صوت واقعی یا محتوای production فعال نشده است.

**نتیجهٔ فعلی N02:** یازده task از دوازده task پیاده‌سازی شده‌اند. gateهای Native static/build-harness، content provenance/contract، project skills، design governance و design pack سبزند، اما N02 تا اجرای واقعی Gradle و Android SDK بسته نمی‌شود. N03 نباید پیش از رفع یا اجرای `N02-07` شروع شود.

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
- Android preflight: JDK 17 `PASS`؛ Android SDK root و platform 37 `FAIL`.
- Gradle wrapper نتوانست distribution را بگیرد؛ cacheهای 9.6/8.11 فقط `.part` صفر بایتی‌اند و `services.gradle.org` در این runner `Network is unreachable` است؛ بنابراین compile/lint/unit ادعا نشده است.
- تست دستگاه واقعی، TalkBack، font scaling و child/educational QA انجام نشده است.
- مسئله‌های `CONTENT-001` تا `CONTENT-018` طبق source audit باز/محافظت‌شده‌اند؛ به‌ویژه جهت نوشتن ۱، jump/hint policy، mastery/unlock، schema typed، audio lifecycle، curriculum scope و telemetry باید در فاز مالک حل شوند.
- هیچ ادعای APK/AAB یا production readiness وجود ندارد.
- مسیر ساخت debug APK کاملاً آماده است، اما خود APK به‌علت نبود SDK 37 ساخته نشده است؛ release/signing همچنان N10/HG-05 است.

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

## 10. کار بعدی دقیق

ابتدا `node tools/harness.mjs resume` و `node tools/harness.mjs task N02-07` را بخوان؛ `npm run android:doctor` و سپس `npm run android:gate` را اجرا کن. پس از status برابر `PASS`، N02 بسته و N03 از U0/`N03-01` شروع شود. اگر debug APK خواسته شد، فقط `npm run android:assemble:debug` معتبر است؛ release/AAB/signing در N02 ممنوع می‌ماند.

## 11. قفل مسیر Track A (ADR-0037، ۲۰۲۶-۱۰-۳۰)

این بخش مسیر موازی بتای قابل‌نصب را ثبت می‌کند. تا وقتی Track A در harness ثبت نشده (L17)، خروجی `node tools/harness.mjs next` همچنان `N02-07` است و کار Track A فقط مطابق ADR-0037 انجام می‌شود.

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

**فاز A0 — ممیزی قابل‌نصب با APK محلی (مجاز؛ ۲۰۲۶-۱۰-۳۱)**

- **مجوز:** مالک به پیشنهاد سه تصمیم با «ادامه» موافقت کرد: (۱) اجرای ZCode پس از گزارش گراندینگ و baseline متوقف شود؛ (۲) فاز A0 مجاز باشد و APK ممیزی را مالک به‌صورت محلی بسازد؛ (۳) SDK ۳۷ را مالک از SDK Manager نصب کند. SDK ۳۷ برای N02-07 است؛ APK ممیزی به Android SDK Platform ۳۶ نیاز دارد (`android.compileSdkVersion=36` در `gradle.properties` پس از prebuild). این مجوز فقط همین فاز را پوشش می‌دهد (AGENTS §۷).
- **مسیر ساخت:** Gradle محلی با `assembleRelease`، نه فرمان‌های EAS. ADR-0037 L11 فرمان‌های EAS را ذکر می‌کند؛ این مسیر فقط با مجوز صریح مالک پوشش می‌یابد و I3 (اجرای EAS preview) را نمی‌بندد.
- **مبنا:** `origin/main` = `a25d257` (merge PR #2). شاخهٔ `docs/phase0-lock-beta-track` و شاخه‌های remote مبنا نیستند. کد اپ در `docs/phase-a0-audit-apk` با `a25d257` یکسان است و این شاخه قاعدهٔ `.gitignore` را هم دارد.
- **نوع APK:** Expo با حالت local-content، `assembleRelease` و امضای debug قالب Expo. متغیرهای `EXPO_PUBLIC_RELEASE_CHANNEL=preview` و `MOBILE_RELEASE_CHANNEL=preview` ست می‌شوند؛ `EXPO_PUBLIC_API_BASE_URL` ست نمی‌شود. با `assembleDebug` این حالت ساخته نمی‌شود، چون `__DEV__` درست است و API به localhost اشاره می‌کند (`runtime.ts:14`، `:19–21`). کد اپ فقط `EXPO_PUBLIC_RELEASE_CHANNEL` را می‌خواند؛ `MOBILE_RELEASE_CHANNEL` برچسب پروفایل است.
- **سازنده و توزیع:** مالک، روی ماشین خودش. ایجنت APK نمی‌سازد و credential ندارد (L11). توزیع داخلی تا M3 است (L12)؛ نصب روی AVD یا گوشی مالک در برنامهٔ A0 است.
- **شاهد ایجنت:** در worktree موقت از `a25d257`: `npm ci` (۶۴۸ package)، `npm run build:packages` و `npx expo prebuild --platform android --clean --no-install` همگی exit 0؛ `package.json` تغییر نکرد. این شاهد ساخت APK نیست.
- **خروجی مورد انتظار:** اسکرین‌شات هر صفحهٔ قابل‌رسیدن در ۳۶۰/۳۹۰/۴۱۲dp و با فونت بزرگ، مسیر رسیدن به هر صفحه، logcat پس از بررسی داده‌های حساس، و گزارش دستگاه. جزئیات فرمان‌ها و قالب گزارش در `docs/archive/evidence/2026-10-31/A0-static-inventory.md` (بخش‌های ۷ و ۱۰) است. layoutها و redirectها جدا ثبت می‌شوند.
- **محدودیت شناخته‌شده:** `APK_PREVIEW.md` §4b ریسک regression در Hermes را برای RN `0.86.0` ثبت کرده است و lock همین نسخه را دارد. اثر آن روی این APK تکرار نشده است. اگر crash در راه‌اندازی دیده شد ثبت می‌شود؛ ارتقای RN/Expo در A0 ممنوع است (L9).
- **خارج از A0:** هر تغییر کد، اصلاح P0/P1، و commit/merge/push جداگانه با مجوز صریح همان فاز است (L15). `.gitignore` در این شاخه تغییر کد نیست، اما L15 تغییرات فاز صفر را فقط مستندات تعریف کرده؛ اگر مالک بخواهد، این دو خط جدا برمی‌گردد.
- **ثبت در harness:** A0 در `harness/roadmap.json` ثبت نشده (L17). `harness next` بدون تغییر است و `file_version` و `current_task` دست‌نخورده‌اند.
