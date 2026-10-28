# START_HERE.md — وضعیت canonical پروژهٔ SHOMARA

```yaml
file_version: 27
last_updated: 2026-10-28
snapshot_id: SNAP-20261028-NATIVE-N01-FINAL
baseline_commit: ef35ce24fb8023ce0d247d1281cf0166bffb2140
working_branch: chore/n01-clean-architecture
active_product: SHOMARA
closed_product: AVA
target_client: Android Native (Kotlin + Jetpack Compose)
current_phase: N02
current_task: N02-01
phase_status: BLOCKED_HG-01_OWNER_DECISION
apk_status: NOT_REQUESTED_IN_THIS_PHASE
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

فایل `ROADMAP_PHASES.md` و goldenهای V1 تاریخی‌اند و هنوز توسط verifierهای legacy خوانده می‌شوند؛ تا مهاجرت verifierها حذف نشوند.

## 2. وضعیت واقعی baseline

مبنای بررسی clone تمیز GitHub در commit `ef35ce2` است.

| بررسی | نتیجهٔ واقعی | وضعیت |
|---|---:|---|
| `npm ci --no-audit --no-fund` | 648 package، exit 0 | PASS |
| `npm run build:packages` | exit 0 | PASS |
| `npm run typecheck:all` | هر 9 workspace، exit 0 | PASS |
| `npx vitest run` | 65 file / 503 test | PASS |
| `npm run verify:static:all` | 75/80؛ تمام 75 gate غیرمرورگری سبز | BLOCKED_ENV |
| Chromium flows + parity | مرورگر در runner موجود نیست | BLOCKED_ENV |
| Node 22.22 build/typecheck | exit 0 | PASS |
| Node 22.22 Vitest | 65 file / 503 test | PASS |
| Android Native build | پروژهٔ Native هنوز ایجاد نشده | NOT_STARTED |

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

## 6. تصمیم‌های محافظت‌شده

- فارسی/RTL و Android-first.
- shell کودک: «مسیر / تمرین / من» تا تصمیم صریح دیگر.
- Phone OTP تنها onboarding production؛ ParentGate مستقل اضافه نمی‌شود.
- Learning Truth، progression، mastery و Station Pass سروری.
- Challenge / Mastery / Station Pass مفاهیم جدا.
- answer key/evaluator خارج از child client.
- بدون stars/lives/punitive streak/coin/loot box/store/leaderboard.
- یک Design System canonical و یک learning engine.

## 7. Blockerها و موارد تأییدنشده

- Chromium در runner فعلی نصب نیست.
- Node 22.22 با runner موقت اجرا و تأیید شد؛ Node پیش‌فرض میزبان همچنان 24 است.
- Android SDK/Gradle toolchain برای Native هنوز baseline نشده است.
- تست دستگاه واقعی، TalkBack، font scaling و child/educational QA انجام نشده است.
- هیچ ادعای APK/AAB یا production readiness وجود ندارد.

## 8. تاریخچهٔ کوتاه مسیر جدید

| تاریخ | snapshot | نتیجه |
|---|---|---|
| 2026-10-28 | SNAP-20261028-NATIVE-P00-01 | AVA بسته شد؛ SHOMARA تنها scope؛ N00 با حذف 125 artifact، canonical docs، اصلاح release verifier و تست OTP ایزوله تکمیل شد؛ 503/503 تست PASS؛ Chromium blocked. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-01 | N01 checkpoint 1: چهار root artifact حذف؛ Node pin؛ harness با 11 فاز و task graph؛ file ledger، repository map و package boundaries اضافه شد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-02 | N01 checkpoint 2: dependency map تکرارپذیر، docs index، phase checklist، Design System migration plan و نخستین dead-code batch تکمیل شد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-FINAL | N01 بسته شد؛ تمام gateهای غیرمرورگری سبز، ۵ browser gate مسدود؛ بستهٔ source checkpoint آماده؛ N02 منتظر HG-01 است. |

## 9. کار بعدی دقیق

`node tools/harness.mjs task N02-01` را بخوان. پیش از ساخت Android Native، مالک باید در HG-01 مقدار نهایی `applicationId` و `minSdk` را تأیید کند. پیشنهاد اولیه برای بررسی: حفظ `com.mathlearning.app` و انتخاب minSdk متناسب با device matrix هدف؛ بدون تأیید، Gradle skeleton ساخته نشود.
