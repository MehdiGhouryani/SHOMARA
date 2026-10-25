# START_HERE.md — تنها فایل وضعیت و برنامهٔ اجرایی پروژه (شمارا / Math App)

```yaml
file_version: 19
last_updated: 2026-10-25
snapshot_id: SNAP-20261025-03
working_dir_for_all_commands: .                 # ریشهٔ ریپو (کنار همین فایل)؛ package.json و node_modules اینجاست
current_scope: فاز 1 تا 3 (زیرساخت، معماری، UI/UX، a11y پایه، performance، امنیت، باگ مهم)
current_stage: Stage A (امنیت و Learning Truth) -> A1/A4/A5/A8 انجام شد؛ A2 (مسیر مرکزی ۴۰۱)، A3/A6/A7 (بخش باقی‌مانده)، persistence واقعی assignment/adult و O-1 باز است
ui_v1_stage: Stage U کامل شد (U0 تا U8؛ U8 = بستن: تب‌بار outlined یکتا شد و صفحات ۰۱ تا ۱۴ همه روی UI v1 هستند؛ SNAP-20261025-01). صفحهٔ ۱۵ راهنمای طراحی است نه صفحهٔ اپ. جزئیات §5 و §6.15
phase_4_final_work: محتوا، APK/AAB، live backend، device/child/educational QA، release  # فعلاً ممنوع
official_roadmap: ROADMAP_PHASES.md  (next_eligible_phase: P12 ؛ هیچ gate رسمی در این ZIP PASS نشد)
```

> **این تنها فایل وضعیت پروژه است.** فایل‌های handoff قبلی (CHAT_HANDOFF، CURRENT_STATE، PHASE_LOG، NEXT_CHAT_PROMPT، MASTER_PROJECT_EXECUTION_PLAN، START_HERE قدیمی، CHANGELOG_v2، HANDOFF_NEXT_CHAT) عمداً حذف و در همین فایل ادغام شده‌اند. اگر جایی به آن‌ها اشاره دیدی، منسوخ است.

---

## 0) پروتکل اجباری برای مدل (قبل از هر کار بخوان)

0. **اول `AGENTS.md`** (قوانین ثابت برای هر عامل کدنویسی) را بخوان؛ پرامپت‌های آمادهٔ تحویل کار در `docs/handoff/PROMPTS.md`. typecheck کامل: `npm run typecheck:all` (دستور ساده `npm run typecheck` فقط contracts و web را می‌سنجد، نه mobile).
1. **این فایل را کامل بخوان**، بعد فقط بخش‌های لازم `ROADMAP_PHASES.md` را (جدول فازها §13، دفتر بدهی §13.5). کل roadmap (۱۱۳KB) را نخوان.
2. **به این فایل کورکورانه اعتماد نکن.** هر ادعا را قبل از عمل با کد/اجرای واقعی تأیید کن. اگر با کد فرق داشت: کد معتبر است، تناقض را در §11 (Changelog) با برچسب `CONFLICT` ثبت کن و تا روشن‌شدن علت هیچ چیز را `PASS` نکن.
3. **قبل از پیاده‌سازی هر task**: بخش «اول تأیید کن» همان task را اجرا کن. اگر نتیجه با «شواهد» نخواند، پیاده‌سازی نکن؛ وضعیت task را به‌روز و دلیل را بنویس.
4. **`PASS` بدون evidence ممنوع.** بررسی‌نشده = `UNVERIFIED`، نیازمند سرویس/دستگاه/مالک = `BLOCKED`.
5. فقط فایل‌های مرتبط را تغییر بده. حدس نزن. هر fix با تست regression یا guard رفتاری.
6. در **Scope** بمان: چیزی از «Phase 4» (§9) را شروع نکن.
7. هر تصمیم محصولی که در §4 نیست و حدس‌بردار است → متوقف شو، در §4 به‌صورت «تصمیم باز» ثبت کن و از مالک بپرس. با **protected decisions** (§2.3) مخالفت نکن.
8. **پایان هر چت**: طبق §10 همین فایل را به‌روز کن و ZIP کامل تحویل بده.

### راه‌اندازی هر چت (دقیقاً به این ترتیب)
```bash
cd <ریشهٔ ریپو، کنار START_HERE.md>
npm install --no-audit --no-fund          # ~45s؛ node_modules داخل ZIP نیست؛ lockfile موجود است
npm run build:packages                    # باید exit 0
for w in contracts design-system learning-runtime challenge-runtime assignment-runtime adult-projections offline-sync web mobile; do
  npm --workspace @math/$w run typecheck || echo "FAIL $w"; done
npx vitest run                            # انتظار: 53 فایل / 406 تست سبز
node scripts/verify-static-all.mjs        # انتظار: PASS (68/68)
npm --workspace @math/web run build       # انتظار: exit 0 (~3 دقیقه؛ در یک فراخوانی با حلقهٔ انتظار اجرا کن)
# گیت‌های UI v1 (Chromium لازم است؛ اگر نسخهٔ Playwright نصب نبود: PARITY_CHROMIUM_PATH=<مسیر chrome>)
npm run parity                            # انتظار: PARITY: PASS (20/20) — مقایسهٔ پیکسلی با صفحه‌های طرح
npm run flow:onboarding                   # انتظار: FLOW: PASS (28/28) — صفحهٔ واقعی ورود در مرورگر
npm run flow:path                         # انتظار: FLOW_PATH: PASS (29/29) — صفحهٔ واقعی مسیر
(cd apps/mobile && EXPO_OFFLINE=1 CI=1 npx expo export --platform android --output-dir /tmp/expo-out)   # انتظار: exit 0 (Hermes ~4.6MB؛ تا ~۴ دقیقه)
```
نتیجه را با جدول §3 مقایسه کن؛ اختلاف = `CONFLICT`.

### تله‌هایی که قبلاً هزینه داشته‌اند
- `cut -c` روی متن فارسی بایت را می‌برد و خروجی را خراب می‌کند → با پایتون کوتاه کن.
- exit code را با `bash -c '...; echo $?'` بگیر (`PIPESTATUS` در `sh` کار نمی‌کند).
- verifierها بیشتر **string-grep** هستند. قبل از «اصلاح» یک verifier، assertion را بخوان؛ اگر قصدش درست است، **کد** را اصلاح کن نه guard را (سیاست D5).
- `exactOptionalPropertyTypes` و `noUncheckedIndexedAccess` فعال‌اند (مثلاً `{x: undefined}` خطاست؛ از spread شرطی استفاده کن).
- `verify-static-all` همهٔ `scripts/verify-*.mjs` را خودکار پیدا می‌کند (حتی اگر در package.json نباشند).
- توکن‌های رنگ: وب `--ds-bg-surface` (نه `--ds-color-bg-*`)، موبایل `DS.color.state.error` (نه `danger`)، `DS.size.touchMin=48`، `touchPrimary=56`.
- ویرایش با اسکریپت پایتون و `assert s.count(old)==1` انجام بده تا جایگزینی اشتباه سکوت نکند.
- فایل‌های `.next`، `dist`، `node_modules` را داخل ZIP نگذار.
- **قبل از ساختن هر فایل یا پوشه با `ls` ببین از قبل هست یا نه.** در یک چت قبلی کار U3 (`src/path/*`) انجام شده بود و ثبت نشده بود؛ نوشتن موازی و بازنویسی کورکورانهٔ توکن‌ها (`ui.path`) آن را خراب کرد و باید بازسازی می‌شد. فایل‌های جدیدتر از آخرین ZIP: `find . -newer <zip> -type f`.
- **پردازش پس‌زمینه با پایان فراخوانی ابزار کشته می‌شود.** کار طولانی (build، Metro) را داخل همان فراخوانی با `nohup ... &` و حلقهٔ `sleep` تا دیدن `EXIT=` اجرا کن.
- **اندازهٔ واقعی را از DOM صفحهٔ طرح بگیر، نه از حدس CSS.** صفحه‌های طرح جاهایی `content-box` هستند (نوار آمار ۶۲ نه ۶۰، پرتره ۹۴ نه ۸۸، تب‌بار ۱۰۶ نه ۸۴). ابزار: `getBoundingClientRect` با Playwright روی `pages-v1/*.html`، بعد توکن را درست کن و `npm run parity` بزن.
- **`react-native-web` (ابزارهای parity/flow):** `<svg>` استاتیک است و زیر `absoluteFill` نقاشی می‌شود (آیکون را در `View` بپیچ)؛ `el.scrollTo({top})` نادیده گرفته می‌شود (از `el.scrollTop = n` استفاده کن)؛ `accessibilityState` به DOM نمی‌رسد؛ `dir="rtl"` را روی ریشه بگذار؛ فقط ویژگی‌های منطقی `start/end` (برای محل فیزیکی-چپ در RTL: `end: x`).
- **توکن‌های `packages/design-system/src/tokens.json` گروه `ui`:** `ui.chapter` (آرایهٔ ۵ تم)، `ui.path` (هندسهٔ مسیر؛ ساختار را کد `src/path/*` می‌خواند، کلیدها را عوض نکن)، `ui.avatar`، `ui.highlight`. مقدار رنگ مستقیم در `src/ui/v1` و `src/path` ممنوع است (verifier قفل می‌کند).

---

## 1) پروژه در یک نگاه

شمارا: پلتفرم یادگیری ریاضی فارسی برای کودک، **Android-first**، **server-authoritative**. TypeScript monorepo: `apps/mobile` (Expo 57 / RN 0.86 / expo-router)، `apps/web` (Next.js، سطح دوم + API)، `packages/*` (contracts، learning-runtime، challenge-runtime، assignment-runtime، adult-projections، offline-sync، content-delivery، design-system)، `supabase/migrations` (0001–0073)، `scripts/` (verifierها)، `docs/` (ADR، API، reference، source specs).

نقشهٔ مستندات باقی‌مانده (چه چیزی را کِی بخوان):
| مسیر | کاربرد |
|---|---|
| `ROADMAP_PHASES.md` | دفتر رسمی gateها و وضعیت P00–P14 (verifierها آن را می‌خوانند؛ حذف نکن) |
| `docs/reference/*.md` | قراردادهای UX/محصول (Path، Practice، Profile، Onboarding، Lesson player…) — قبل از تغییر UI مربوطه بخوان |
| `docs/api/*.md` | قراردادهای API (surface registry، learning، sync، assignment، content…) |
| `docs/adr/*.md` | تصمیم‌های معماری قفل‌شده |
| `docs/source/*.md` | مشخصات محصول/محتوا/انیمیشن (منبع حقیقت محصولی، حجیم؛ فقط بخش لازم) |
| `docs/qa/ANDROID_STORE_RELEASE_CHECKLIST.md`، `B0_STAGING_APPLY_CHECKLIST.md` | برای Phase 4 |
| `docs/qa/phase-logs/P01_product-game-research-design-lock.md` | فقط چون `verify-phase1-product-lock` می‌خواند |
| `docs/archive/evidence/` | لاگ‌های baseline و gateها به تفکیک تاریخ (بدون md) |
| `prototypes/p01-engagement-review/README.md`، `project-design-v2/**` | prototype و طراحی کاراکتر |

## 2) نگاشت فازها، وضعیت رسمی و تصمیم‌های ثابت

### 2.1) نگاشت ۴ فاز کاری به roadmap رسمی
| فاز کاری | محتوا | رابطه با roadmap |
|---|---|---|
| فاز 1 | زیرساخت، baseline | P00–P02 — **انجام شد** (§3) |
| فاز 2 | UI/UX و a11y پایه | P03–P11 در سطح UI موجود — **در جریان** (Stage D) |
| فاز 3 | امنیت، performance، باگ مهم | P02–P13 در سطح کد — **در جریان** (Stage A,B,C,E) |
| فاز 4 | محتوا، APK/AAB، live/device/child QA، release | P10–P14 — **ممنوع تا پایان 1–3** |

### 2.2) وضعیت رسمی roadmap (تغییر نکرده)
P00 `PASS` · P01/P02 `IN_PROGRESS` · P03–P09 `IMPLEMENTED` · P10 `IN_PROGRESS` (25/25 pack playable؛ gate review/device باز) · P11 `IMPLEMENTED` · P12/P13/P14 `PENDING`. دفتر بدهی VD-001…VD-018 همه `OPEN` (یادداشت‌ها در §8).

### 2.3) Protected decisions (تغییر نده)
مسیر ۲۵ایستگاهی zig-zag · navigation کودک «مسیر / تمرین / من» · Phone OTP در production و **نبود ParentGate جداگانه** · Learning Truth/progression/mastery فقط روی server · جدایی Challenge / Mastery / Station Pass · answer key و evaluator خارج از client · RTL/Persian-first · V1 بدون سکه/الماس/فروشگاه/loot box/leaderboard/streak تنبیهی · بدون engine دوم · Android-first · جایزه فقط بعد از Station Pass واقعی و بدون ادعای mastery.

---

## 3) Baseline و آخرین وضعیت اجراشده (evidence در `docs/archive/evidence/`)

| Gate | Baseline (قبل از تغییر) | آخرین نتیجه |
|---|---|---|
| `npm install` | — | exit 0 (609 پکیج) |
| `build:packages` | FAIL | **exit 0** |
| typecheck (۹ workspace) | contracts 16، challenge-runtime 17، web 21، mobile 34 خطا | **همه exit 0** |
| `vitest run` | 275/278 | **406/406** (53 فایل؛ `RevealPrimitives.test.tsx` هنوز در هیچ gate اجرا نمی‌شود چون transform React Native لازم دارد) |
| `verify-static-all` | 50/58 | **68/68** |
| `next build` (web) | FAIL (useSearchParams بدون Suspense) | **exit 0** |

**شمارش‌های اصلاح‌شده (با دستور شمرده شد):** `route.ts` = 43 (نه 46)؛ فایل تست = 50 (49 در vitest، بعد از SNAP-20261014-04)؛ `scripts/verify-*` = 55 فایل؛ `static-all` = 58 جزء. `challenge-runtime` اکنون هم در vitest اجرا می‌شود (shim قدیمی `scripts/test-challenge-runtime.mjs` کد+پیام خطا را با هم می‌سنجید و دو تست واقعی را پنهان می‌کرد).

**اجرای ۲۰۲۶-۱۰-۲۵ (SNAP-20261025-03، P1 ابزار؛ لاگ‌های `p1-*` در `docs/archive/evidence/2026-10-25/`):** Node هدف در `.nvmrc` (22.18.0) و `engines.node` (>=22.18) قفل شد — **نصب Node ≥22.18 روی این ماشین (22.16.0) بلاکِر مالک است**؛ گیت‌های این اجرا با پرچم خودکار `--experimental-strip-types` (اجرای موقت/علامت‌دار) سبزند و CI از `.nvmrc` می‌خواند. دکمهٔ back اندروید در درس با stub واقعی BackHandler در harness اثبات شد (registry واقعی + `__flow.back()`؛ flow:station ۴۸→**۵۰**). اسکن امنیتی باندل ۴٫۶MB صفر یافت (لاگ `p1-bundle-security-scan.log`؛ سه اثر «password» مربوط به string-table هرمس است). app.json فقط INTERNET+ACCESS_NETWORK_STATE؛ بدون cleartext/debuggable؛ eas production = store/app-bundle بدون پرچم دیباگ. PowerShell 5.1 اثبات شد (`p1-12-ps51-check.log`)؛ **PS 7 روی این ماشین نصب نیست** (ثبت شد). سند `docs/testing/GATE_RUN_ORDER.md` نوشته شد. vitest ۴۲۵/۴۲۵، static ۷۴/۷۴، parity ۲۹/۲۹، flowها 28/29/50/14.

**اجرای ۲۰۲۶-۱۰-۲۵ (SNAP-20261025-02، P0 بستن بازبینی؛ لاگ‌های `p0-*` در `docs/archive/evidence/2026-10-25/`):** بازبینی مستقل پذیرفته شد با دو اصلاح اعمال‌شده (R-1: `parity-out-expo` از گیت خارج و ignore شد؛ R-2: انحراف تب‌بار D-011 استثنای پین‌شدهٔ `tabbar-outlined-vs-soft-goldens` شد). بررسی قرارداد D-002: ارسال دوبارهٔ تلاش پس از پاسخ غلط با CONTINUE **مجاز** است (سند `docs/archive/review/D-002-contract-check.md`؛ بدون D-016). R-3: ترکیب ردیف‌های تمرین به تابع خالص `practiceRowGames` رفت + ۵ تست (vitest ۴۲۰→**۴۲۵**). همهٔ گیت‌ها سبز: typecheck ۹/۹، static ۷۴/۷۴، parity ۲۹/۲۹، flowها 28/29/48/14، web build و باندل Metro exit 0. محیط: Node 22.16.0 (زیر ۲۲.18؛ static-all پرچم `--experimental-strip-types` می‌گذارد — نصب Node ≥22.18 کار مالک، بلاکِر ثبت شد).

**اجرای ۲۰۲۶-۱۰-۲۵ (SNAP-20261025-01، بعد از U8؛ لاگ‌ها در `docs/archive/evidence/2026-10-25/`):** typecheck هر ۹ workspace exit 0؛ vitest ۴۲۰/۴۲۰؛ static ۷۴/۷۴؛ parity **۲۹/۲۹** (tabbar-13 حذف شد چون variant soft رفت)؛ flow آنبوردینگ ۲۸/۲۸، مسیر ۲۹/۲۹، ایستگاه ۴۸/۴۸، تب‌ها ۱۴/۱۴؛ web build exit 0؛ bundle واقعی Metro exit 0.

**اجرای ۲۰۲۶-۱۰-۲۴ (SNAP-20261024-05، بعد از U7؛ لاگ‌ها در `docs/archive/evidence/2026-10-24/`):** typecheck هر ۹ workspace exit 0؛ vitest ۴۲۰/۴۲۰؛ static ۷۴/۷۴ (+`verify-ui-v1-tabs` و اسکریپت flow:tabs)؛ parity ۳۰/۳۰ (practice ۰٫۱۹٪ و me ۰٫۱۵٪ روی ناحیهٔ body)؛ `flow:tabs` ۱۴/۱۴؛ web build exit 0؛ bundle واقعی Metro exit 0.

**اجرای ۲۰۲۶-۱۰-۲۴ (SNAP-20261024-04، بعد از U6؛ لاگ‌ها در `docs/archive/evidence/2026-10-24/`):** `build:packages` exit 0؛ typecheck هر ۹ workspace exit 0؛ `vitest run` ۴۱۷/۴۱۷ (۴ تست جدید به‌خاطر فایل‌های U6)؛ `verify-static-all` ۷۲/۷۲ (+`verify-ui-v1-result`)؛ `npm run parity` ۲۸/۲۸ (+stage-intro صفحهٔ ۱۱ ۰٫۰۶٪ و challenge صفحهٔ ۱۲ ۰٫۳۱٪)؛ `flow:station` **۴۸/۴۸** (مسیر کامل شاد: آموزش ← سؤال‌ها ← دو چک ۵سؤالی ← انتقال ← چک نهایی ← مقدمهٔ چالش ← ۳ round چالش ← جشن صفحهٔ ۱۱ با «۱ از ۵» و دستاورد)؛ flow آنبوردینگ ۲۸/۲۸ و مسیر ۲۹/۲۹؛ `next build` exit 0؛ bundle واقعی Metro exit 0.

**اجرای ۲۰۲۶-۱۰-۲۴ (SNAP-20261024-03، بعد از H1 و U5b؛ لاگ‌ها در `docs/archive/evidence/2026-10-24/`):** `build:packages` exit 0؛ typecheck هر ۹ workspace exit 0؛ `vitest run` ۴۱۳/۴۱۳ (۵۳ فایل)؛ `verify-static-all` ۷۱/۷۱ (عنوان H1: پنج رفع قابلیت حمل ویندوز، verifier جدید `verify-parity-goldens-pinned`، generator طلایی‌ها از sweep حذف شد)؛ `npm run parity` ۲۶/۲۶؛ flow آنبوردینگ ۲۸/۲۸، مسیر ۲۹/۲۹، ایستگاه **۳۹/۳۹** (سناریوی سؤال ۰۸ تا ۱۰ با سرور mock یادگیری: انتخاب ← بررسی یک‌تایی ← برگه ← دوباره/ادامه ← پیروی از تصمیم سرور تا بازیابی)؛ `next build` (web) exit 0؛ bundle واقعی Metro اندروید exit 0 (Hermes ~4.6MB). محیط اجرا: ویندوز + Node 22.16.0 (زیر ۲۲.18؛ static-all برای verifierهای importکنندهٔ .ts خودکار `--experimental-strip-types` می‌گذارد).

**اجرای ۲۰۲۶-۱۰-۲۳ (SNAP-20261023-01، بعد از U4؛ لاگ‌ها در `docs/archive/evidence/2026-10-23/`):** `build:packages` exit 0؛ typecheck هر ۹ workspace (از جمله موبایل) exit 0؛ `vitest run` 409/409 (53 فایل)؛ `verify-static-all` 70/70؛ `next build` (web) exit 0؛ `npm run parity` 23/23؛ `npm run flow:onboarding` 28/28؛ `npm run flow:path` 29/29؛ `npm run flow:station` 25/25؛ **bundle واقعی Metro اندروید** exit 0 (Hermes 4.6MB). تغییر عددها نسبت به ۱۰-۱۸: vitest ۴۰۶→۴۰۹ چون `touchTargets.test` یک مورد کم (۲۲→۲۱؛ `start.tsx` دیگر `Pressable` ندارد و دکمه‌ها از `ui/v1` می‌آیند که خودش بررسی می‌شود) و `uiText.test` چهار مورد بیشتر (۶۲→۶۶؛ چهار فایل متن‌دار جدید) دارد؛ static ۶۸→۷۰ چون `flow-station-run.mjs` و `verify-ui-v1-station.mjs` اضافه شدند (static-all هر `.mjs` را اجرا می‌کند)؛ parity ۲۰→۲۳ (`stage-intro`، `lesson`، `tray-07`). خط پایه قبل از تغییر با اعداد ۱۰-۱۸ یکسان بود.

**اجرای ۲۰۲۶-۱۰-۱۸ (SNAP-20261018-01، بعد از U3؛ لاگ‌ها در `docs/archive/evidence/2026-10-18/`):** `build:packages` exit 0؛ `typecheck:all` و typecheck موبایل exit 0؛ `vitest run` 406/406 (53 فایل)؛ `verify-static-all` 68/68؛ `next build` (web) exit 0؛ `npm run parity` 20/20؛ `npm run flow:onboarding` 28/28؛ `npm run flow:path` 29/29؛ **bundle واقعی Metro اندروید** exit 0 (Hermes 4.6MB).

**اجرا نشده (UNVERIFIED/BLOCKED):** `npm run verify:p02:full` · هر چیز live (Supabase، OTP provider، RLS اجرایی) · هر چیز device (TalkBack، large text، cold start، فریم‌ها) · بازبینی بصری در مرورگر/دستگاه برای اصلاح‌های CSS/آیکن.

---

## 4) تصمیم‌های ثبت‌شده

| ID | تصمیم | دلیل/شواهد | وضعیت |
|---|---|---|---|
| D1 | پروفایل موبایل **همهٔ ۵ دستاورد** را نشان می‌دهد | contract پروفایل پایگاه ۵ دستاورد؛ `profileActionDensity` فقط ردیف‌های اکشن را کنترل می‌کند؛ محدودیت قبلی بدون پشتوانه بود | اعمال شد |
| D2 | `TEACHER_SESSION_SECRET` در production اجباری (≥32 کاراکتر)؛ بدون fallback و بدون استفاده از service-role key | fail-closed؛ تغییر secret نشست‌های معلم (TTL 7 روز) را باطل می‌کند | کد اعمال شد؛ **مالک باید env را تنظیم کند** |
| D3 | طراحی R-009 (۴۰۱): کودک وسط درس قطع نشود؛ روی ۴۰۱ با توکن موجود توکن پاک شود، صف sync و پیشرفت محلی دست‌نخورده بماند، وضعیت «نیاز به ورود مجدد» در **یک نقطهٔ مرکزی** ثبت شود، OTP مجدد فقط در مسیر والد/شروع بعدی | ورود فقط با OTP؛ توکن در SecureStore؛ refresh/expiry وجود ندارد؛ عمر توکن سرور UNVERIFIED | پیاده‌سازی نشده (A2) |
| D4 | تناقض handoff با کد → کد معتبر است | UX فازهای A–F واقعاً در کد هست | اعمال شد |
| D5 | verifier باید **رفتار** را قفل کند نه نام متغیر/متن؛ تغییر guard فقط با evidence و بدون تضعیف قصدش | drift در p09/phase15 | سیاست دائمی |
| D6 | **ParentGate اضافه نشود** (protected). ریسک باقی: `/parent` مستقیم از ردیف پروفایل باز می‌شود و «حذف کل داده» دارد (فقط Alert تأیید) | کامنت `parent.tsx` و plan | مالک تصمیم بگیرد که تأیید قوی‌تر (مثلاً تایپ-برای-تأیید) لازم است یا نه؛ gate جداگانه ممنوع |
| D7 | فقط یک فایل وضعیت (همین فایل)؛ بقیهٔ md-ها فقط اگر contract/مرجع‌اند می‌مانند | کاهش ۷۱ → ۴۵ فایل md (شامل همین فایل)؛ gateها بعد از حذف سبز | اعمال شد |
| D8 | آسیب‌پذیری‌های `npm audit --omit=dev` (۲۶ مورد، ۱۵ high، صفر critical) فعلاً پذیرفته: همه در زنجیرهٔ ابزار Expo/Metro؛ fix پیشنهادی npm (بازگشت به expo 44) عملی نیست | بررسی `npm audit --json` | در Phase 4 هنگام ارتقای Expo دوباره بررسی شود |

**تصمیم‌های باز (مالک):** O-1 محل نگه‌داری شمارندهٔ rate limit برای OTP/ورود معلم (پیشنهاد: جدول/RPC در Supabase چون in-memory روی serverless معتبر نیست) · O-2 میزبان CI (GitHub Actions یا غیر) · O-3 سطح تأیید حذف داده (D6).

**تصمیم‌های واگذارشدهٔ UI (۲۰۲۶-۱۰-۲۴، اجرای خودکار طبق پروتکل؛ بازگشت‌پذیر با ویرایش همین جدول + کد مربوطه):**

| ID | پرسش | گزینه‌ها | انتخاب | دلیل (الگوی تعامل، بدون برند) | بازگشت |
|---|---|---|---|---|---|
| D-001 | U-Q20 مدل تعامل سؤال (لمس = پاسخ؟) | (الف) لمس فقط انتخاب کند، «بررسی» ثبت کند، «ادامه» جلو ببرد · (ب) همان لمس فوری | الف | یک سؤال در صفحه، بازخورد فوری در برگهٔ پایین، پیشرفت فقط رو به جلو؛ آنچه سرور می‌گیرد بایت‌به‌بایت همان است، فقط لحظهٔ فراخوانی `answerContent` عوض شد | `QUESTION_ENCOUNTER_IDS` و `advanceAfterAnswer` در StationFlow |
| D-002 | U-Q21 دکمهٔ برگهٔ غلط | (الف) دنبال تصمیم سرور: RECOVERY/RECHECK → «ادامه»، در غیر این صورت «دوباره امتحان کن» · (ب) قرارداد صریح تلاش مجدد | الف | کلاینت درستی و گام بعد را تعیین نمی‌کند؛ هر «دوباره» یک submit صادقانه با `attemptNumber+1` و کلید idempotency تازه است | `questionSheetAllowsRetry` و شاخهٔ redirect در `advanceAfterAnswer` |
| D-003 | U-Q22 متن بازخورد | (الف) عمومی: «درست است!» و «نزدیک بود. دوباره امتحان کنیم؟» · (ب) فیلد متنی در محتوا | الف | فیلد اختیاری محتوا تغییر قرارداد مشترک می‌خواهد؛ متن وابسته به سؤال DEFERRED (فیلد آیندهٔ محتوا) | `S.lesson.correctFeedback/retryFeedback` |
| D-004 | U-Q16 «ستاره» در محتوا در برابر مهره در طرح | (الف) متن محتوای محلی به «مهره» تغییر کند (مهاجرت سرور بعداً) · (ب) شیء ستاره کشیده شود | الف | طرح ۰۷/۰۸ مهره می‌کشد و گزینه‌های E02 عددی شدند؛ مهاجرت محتوای سرور DEFERRED | `localContent` در runtimeApi (و جدول mock در harness) |
| D-005 | U-Q15 «پیشنهاد جلسه» | حذف بماند · برگردد | حذف بماند | طرح ۰۶ آن را ندارد؛ منطق `sessionLengthHintFa` در پروفایل همچنان verify می‌شود | استثنای `station-start-session-hint` |
| D-006 | U-Q17 صدای ضبط‌شده | فقط TTS · فیلد صدا در قرارداد | فقط TTS | پخش فایل = وابستگی بومی جدید + تغییر قرارداد؛ ضبط صدا DEFERRED | `station/speech.ts` |
| D-007 | U-Q18 پخش خودکار | هیچ چیز خودکار · TTS هنگام ورود | هیچ چیز خودکار | فقط دکمهٔ «دوباره بشنو» | — |
| D-008 | E11 (انتقال) و بازی‌های الگو/بازیابی: صفحهٔ طرح ندارند | (الف) رندر قدیمی بماند تا صفحهٔ تأییدشده · (ب) نسخهٔ بدون سینی از QuestionView ساخته شود | الف | ساخت UI بدون صفحهٔ طرح ممنوع است؛ صفحات ۰۸–۱۰ همیشه سینی مهره دارند | `QUESTION_ENCOUNTER_IDS` (افزودن شناسه‌ها وقتی صفحه آمد) |
| D-009 | U-Q5 تعیین سطح/نتیجه/همگام‌سازی بدون طرح | محتوا و منطق فعلی با نوار و cast جدید · بازطراحی حدسی | فعلی بماند | بدون صفحهٔ تأییدشده UI ساخته نمی‌شود؛ بازطراحی DEFERRED تا طرح | — |
| D-010 | U-Q8 جای ماموریت‌ها/آهنگ یادگیری | تب تمرین (پیشنهاد U7) · تب من · هیچ‌جا | ورودی در U7 روی تب تمرین بررسی شود | تمرین طبیعی‌ترین میزبان عادت روزانه است؛ تصمیم نهایی هنگام ساخت صفحهٔ ۱۳ | خنثی تا U7 |
| D-011 | U-Q9 دو تب‌بار در طرح | نسخهٔ outlined (۱۰۶px) همه‌جا · soft برای ۱۳/۱۴ | outlined همه‌جا؛ `soft` در U8 حذف می‌شود | تب‌بار یک کامپوننت است و صفحهٔ مسیر جدیدتر است | `TabBar` variant + استثنای پین‌شدهٔ `tabbar-outlined-vs-soft-goldens` در `tabs-waivers.mjs` (خارج‌شدن ناحیهٔ تب‌بار ۱۳/۱۴ از parity چون طلایی‌ها soft دارند) |
| D-012 | U-Q10 نام فصل‌ها | نام واقعی قرارداد + رنگ به ترتیب فصل طرح · متن طرح | نام واقعی قرارداد | دادهٔ واقعی بر متن نمونهٔ طرح مقدم است | `pathModel/chapterTheme` |
| D-013 | U-Q11 گنج | فقط تزئینی و قفل (مطابق طرح) · قفل‌شونده واقعی | تزئینی قفل | چک‌پوینت قرارداد بعد از ایستگاه ۵ است؛ قفل‌سازی واقعی به موتور وابسته است | — |
| D-014 | U-Q12/U-Q13 رفتارهای مشتق‌شده و متن حباب | حفظ رفتارهای فعلی · حذف | حفظ | حدس جدید ممنوع؛ چیزهایی که طرح تعریف نکرده همان می‌مانند | — |
| D-015 | چیپ «N سؤال» صفحهٔ ۱۲: طرح نمونه ۴ می‌گوید، تعریف واقعی چالش ST01 سه round دارد | متن طرح · شمارش واقعی | شمارش واقعی (`rounds.length`) | دادهٔ واقعی بر متن نمونهٔ طرح مقدم است (همان قاعدهٔ U-Q19)؛ specimen مقایسهٔ پیکسلی متن نمونهٔ طرح را نگه می‌دارد | `ST01_SIGNATURE_CHALLENGE.rounds.length` |

**تصمیم‌های باز طراحی (مالک، از ایمپورت handoff در `docs/design-handoff-2026-10/`):**
- **O-4 cast شخصیت‌ها.** handoff شخصیت‌های Main، Number، Dana، Fandogh و Roka را «قطعی» می‌داند، اما cast فعلی در `project-design-v2` و `docs/reference` (aria / qbo / dana / jiko، با شناسه‌های قفل‌شده در CHARACTER-BIBLE-v2) است. نام Dana در هر دو وجود دارد ولی طرح متفاوت است: در کد سنجاب است و در handoff پرندهٔ فیروزه‌ای. تا تصمیم مالک، هیچ asset شخصیتی از handoff وارد اپ یا `characterArt.generated.ts` نمی‌شود. **→ بسته شد (مالک، ۲۰۲۶-۱۰-۱۴):** cast جدید Main/Number/Dana/Fandogh/Roka در ADR-0035 پذیرفته شد؛ جزئیات نگاشت در `pages-v1/manifest.json`.
- **O-5 پالت و تم.** handoff آبی `#2B5C7A` و تم روشن پیش‌فرض با تیره در تنظیمات دارد. کد فعلی (`packages/design-system/src/tokens.json`، سبز `#287A4A`) با ADR-0004 (آبی `#2563EB`) و PATH_2_CONTRACT (سبز) هم متناقض است. تم تیره در `apps/web` وجود ندارد. handoff خودش می‌گوید پالت کودکانه تأیید نشده. تا تصمیم مالک، tokens کد تغییر نمی‌کند. **→ بسته شد (مالک، ۲۰۲۶-۱۰-۱۴):** توکن‌های راهنمای طراحی (primary `#2B5C7A`، amber `#E3A33B`…) در ADR-0035 پذیرفته شدند؛ تم تیره فعلاً خارج از V1 است.
- **O-6 بستهٔ handoff ناقص.** README به SCREENS.md، COMPONENTS.md، DECISIONS.md، PALETTE.md و RESEARCH_RULES.md ارجاع می‌دهد که در بسته نیستند. فایل‌های S08، S11 و S13 تا S18 هم در `screens/` نیستند. از طراح بستهٔ کامل خواسته شود؛ اگر حذفشان عمدی است، مالک تأیید کند. **→ تا حدی بسته شد:** صفحه‌های ۲۰۲۶-۱۰ جای SCREENS.md را گرفتند و راهنمای طراحی جای PALETTE/COMPONENTS. هنوز DECISIONS.md و RESEARCH_RULES.md نیست؛ غیرحیاتی.
- **O-7 `RiveCompanionMascot`** (`apps/web/components/`) هیچ importی ندارد. حذف شود یا برای P12 نگه داشته شود؟ (D4 در §5)
- **O-8 منطق فقط‌تست موبایل.** `apps/mobile/src/onboarding/flow.ts` و `apps/mobile/src/station/macro.ts` فقط توسط تست‌ها import می‌شوند؛ صفحات درس و آنبوردینگ منطق خودشان را دارند. وصل شوند یا همراه تست‌هایشان حذف شوند؟
- **O-9 مسیر مرجع چالش.** پکیج `packages/challenge-runtime` در مسیر production مصرف نمی‌شود؛ مسیر production از RPC سرور (`apps/web/lib/challenge-runtime-production.ts`) است و پکیج فقط تست و gate فاز P04 را پشتیبانی می‌کند. کدام یک مرجع است؟

**تصمیم‌های مالک ۲۰۲۶-۱۰-۱۴ (UI v1):** ستاره، جان و streak در V1 حذف شدند، از جمله ستاره‌های زیر گره‌ها. پیاده‌سازی دقیقاً مطابق صفحات ارسالی است (ADR-0035). «دوباره بشنو» در V1 می‌ماند. O-4 و O-5 بسته شدند.

**اقدام‌های مالک:** تنظیم `TEACHER_SESSION_SECRET`؛ اطمینان از `NODE_ENV=production` در هر deployment قابل‌دسترس از اینترنت (چون dev-principal فعلاً فقط به این وابسته است — A5)؛ تعیین `AUTH_OTP_PROVIDER_URL`.

---

## 5) برنامهٔ کار مرحله‌بندی‌شده

**ترتیب:** Stage A → B → C → D → E → F. داخل هر stage به ترتیب شماره، مگر وابستگی ذکر شده. فرمت هر task: شواهد (آنچه دیده شد) · **اول تأیید کن** · جهت اصلاح · معیار پذیرش.
وضعیت‌ها: `OPEN` · `PARTIAL` · `DONE` · `BLOCKED`. اولویت: P0 (اول) / P1 / P2.

### Stage A — امنیت و Learning Truth

**A1 — اعتماد به ادعای کلاینت در تکمیل assignment** `P0 · High · DONE (2026-10-09)`
- اصلاح‌شده: endpoint کودک `/outcome` بازنشسته شد (410)؛ `applyLearningOutcome` حذف شد؛ completion فقط با `AssignmentService.recordStationPass` (از route `learning/attempts/submit` و `sync/batch` پس از `stationPass` سرور؛ همهٔ ایستگاه‌های هدف باید pass شوند؛ فقط `completionRule=STATION_PASS` و targetهای `stationIds`؛ targetهای فقط-skill خودکار تکمیل نمی‌شوند)؛ `requestRecheck` روی CANCELLED/EXPIRED/NEEDS_RECHECK رد می‌شود (از COMPLETED مجاز است)؛ `completeRecheck` (فقط معلم، route جدید `POST …/recheck/complete`) تنها راه خروج از NEEDS_RECHECK است؛ `markActive` فقط از PENDING/ACTIVE. تست: `packages/assignment-runtime/src/__tests__/service.test.ts`، `apps/web/lib/__tests__/assignment-routes.test.ts`.
- محدودیت: اتصال station-pass به assignment فقط در مسیر in-memory runtime کار می‌کند (در production تا ساخت repository پایدار gate بسته است؛ بخش «Persistence» پایین). *(متن شواهد/جهت قدیمی زیر برای ردگیری تاریخی مانده)*
- شواهد: `apps/web/app/api/v1/assignment-instances/[instanceId]/outcome/route.ts` بدنهٔ `{completed, needsRecheck, payload}` را از learner می‌گیرد و `packages/assignment-runtime/src/service.ts:104-115` (`applyLearningOutcome`) بدون هیچ evidence سمت سرور وضعیت را `COMPLETED` می‌کند، `needsRecheck:false` می‌تواند درخواست recheck معلم را پاک کند، `payload` دلخواه merge می‌شود (بدون سقف اندازه)، و guard انتقال وضعیت وجود ندارد.
- اول تأیید کن: (۱) `docs/api/API_ASSIGNMENT_CONTRACT.md` را بخوان؛ (۲) همهٔ callerهای `applyLearningOutcome` و نحوهٔ اتصال instance به session/attempt را در repo و migrationها پیدا کن؛ (۳) تأیید کن آیا جای دیگری completion را از evidence سرور تولید می‌کند. اگر قرارداد صراحتاً گزارش کلاینت را می‌خواهد، تصمیم را در §4 ثبت کن و از مالک بپرس.
- جهت اصلاح: completion از attempt/station-pass معتبر سرور استنتاج شود؛ مسیر learner فقط مجاز به گزارش غیرمعتبر نباشد (یا حذف/محدود شود)؛ پاک‌کردن `NEEDS_RECHECK` فقط معلم؛ جدول انتقال مجاز وضعیت؛ whitelist و سقف اندازهٔ payload.
- پذیرش: تست‌های route + service (کودک نمی‌تواند COMPLETED بدهد/recheck را پاک کند/وضعیت را برگرداند)؛ typecheck/vitest/static سبز.

**A2 — مسیر مرکزی ۴۰۱ (R-009)** `P0 · High · PARTIAL`
- انجام‌شده: ۴۰۱/۴۰۳/۴۰۸/۴۲۵/۴۲۹/۵xx در صف آفلاین موبایل و وب دیگر REJECTED دائمی نمی‌شوند (RETRY تا ۱۴ روز)؛ `submitAttempt` موبایل در همین خطاها تلاش را وارد صف می‌کند (نه از دست می‌دهد)؛ سقف ۸ تلاش حذف شد (جایگزین: سقف سن ۱۴ روز، backoff تا ۵ دقیقه). تست: `offline-sync/__tests__/manager.test.ts`، `apps/mobile/src/sync/MobileSyncTransport.test.ts`.
- مانده: listener/state مرکزی «نیاز به ورود مجدد»، پاک‌کردن توکن روی ۴۰۱، نمایش فقط در مسیر والد/شروع بعدی (طراحی D3). عمر توکن همچنان UNVERIFIED. (طراحی: D3)
- شواهد: `apps/mobile/src/station/runtimeApi.ts` تابع `request()` فقط `API_401` پرتاب می‌کند؛ `AuthSession.ts` فقط get/set/clear توکن؛ `MobileSyncManager` مدیریت انقضا ندارد.
- اول تأیید کن: `request()` و callerها، رفتار sync روی خطاهای auth، و جایی که `/onboarding` ورود OTP را نشان می‌دهد؛ طول عمر توکن را در کد سرور/provider پیدا کن (اگر نشد، UNVERIFIED بنویس).
- جهت اصلاح: بر اساس D3 — یک listener/state مرکزی «نیاز به ورود مجدد»؛ پاک‌کردن توکن؛ **حفظ صف و پیشرفت**؛ نمایش فقط در مسیر والد/شروع بعدی؛ هیچ صفحهٔ بن‌بست یا قطع درس.
- پذیرش: تست واحد (۴۰۱ → توکن پاک، صف دست‌نخورده، event منتشر)؛ بدون تغییر رفتار برای ۴۰۱ بدون توکن.

**A3 — پروکسی OTP بدون rate limit/timeout** `P1 · High · PARTIAL` (وابسته به O-1)
- انجام‌شده: timeout ۸ثانیه؛ whitelist پاسخ (`code,message,accessToken,access_token,token,retryAfterSeconds`، بر اساس فیلدهایی که کلاینت موبایل واقعاً می‌خواند)؛ status فقط از {200,400,401,403,429} وگرنه 502؛ limiter در `lib/rate-limit.ts` (start: ۵ بار/شماره و ۲۰/IP در ۱۰ دقیقه؛ verify: ۵/شماره و ۳۰/IP در ۱۵ دقیقه؛ قفل ۱۵ دقیقه)؛ `AUTH_OTP_PROVIDER_URL` در `.env.example`. تست: `lib/__tests__/rate-limit-otp.test.ts`.
- مانده (O-1): limiter در حافظهٔ پردازش است و روی serverless چندنمونه‌ای سراسری نیست → جدول/RPC Supabase لازم است. قرارداد provider (بدنه/پاسخ) تأیید نشده؛ whitelist فرض بر فیلدهای کلاینت موبایل است.
- شواهد: `apps/web/app/api/v1/auth/otp/{start,verify}/route.ts` + `lib/auth-provider.ts` صرفاً پروکسی provider هستند؛ هیچ rate limit/throttle/timeout ندارند و status/پاسخ provider را بدون فیلتر برمی‌گردانند؛ `AUTH_OTP_PROVIDER_URL` در `.env.example` نیست. انقضا/replay کاملاً به provider سپرده شده (UNVERIFIED/BLOCKED).
- اول تأیید کن: `lib/auth-provider.ts` کامل، قرارداد `docs/reference/ONBOARDING_CONTRACT.md`، و اینکه provider خودش throttle دارد یا نه.
- جهت اصلاح: timeout روی fetch؛ whitelist فیلدهای پاسخ؛ throttle به‌ازای شماره و IP/installation (طبق O-1)؛ پیام خطای عمومی؛ مستندسازی env.
- پذیرش: تست route (۴۲۹ بعد از آستانه، timeout → خطای عمومی، فیلدهای اضافه حذف).

**A4 — ورود معلم: brute-force و نشت پیام** `P1 · High · PARTIAL` (وابسته به A3/O-1)
- انجام‌شده: limiter (۵/نام‌کاربری و ۳۰/IP در ۱۵ دقیقه، قفل ۱۵ دقیقه)؛ credential نامعتبر و نبود نقش معلم پاسخ یکسان 401 می‌دهند؛ خطای ناشناخته پیام عمومی دارد و فقط server-side log می‌شود. مانده: همان محدودیت in-memory (O-1).
- شواهد: `apps/web/app/api/v1/teacher/auth/login/route.ts` rate limit/lockout ندارد؛ در شاخهٔ خطای ناشناخته `msg` خام برگردانده می‌شود؛ تفکیک 401 (اعتبار نامعتبر) از 403 (نقش) امکان enumeration می‌دهد. (cookie: httpOnly، secure در production، sameSite=lax، TTL 7 روز — سالم دیده شد.)
- اول تأیید کن: `authenticateTeacher` چه خطاهایی پرتاب می‌کند.
- جهت اصلاح: همان limiter A3؛ پیام و status یکسان برای credential/role ناموفق؛ خطای ناشناخته عمومی + log سمت سرور.
- پذیرش: تست route.

**A5 — dev-principal فقط به NODE_ENV وابسته است** `P1 · High · DONE (2026-10-09)`
- اصلاح‌شده: `devPrincipalAllowed()` = `NODE_ENV!=='production'` **و** `ALLOW_DEV_PRINCIPAL=1` (هر فراخوانی ارزیابی می‌شود)؛ با وجود Bearer هرگز هدر dev استفاده نمی‌شود (قبلاً `requireRequestPrincipal` در non-production توکن را نادیده می‌گرفت)؛ `x-dev-roles` فقط PARENT/TEACHER می‌پذیرد (ADMIN ساخته نمی‌شود). `playwright.config.ts` پرچم را برای e2e ست می‌کند؛ برای `next dev` دستی باید خودت `ALLOW_DEV_PRINCIPAL=1` بگذاری. تست: `lib/__tests__/auth-hardening.test.ts`؛ verifier `verify-phase2-foundation.mjs` به‌روز شد (قصدش حفظ شد).
- شواهد: `apps/web/lib/request-principal.ts`: هدرهای `x-dev-account-id`، `x-dev-learning-identity-id`، `x-dev-roles` هویت و نقش (مثلاً معلم) می‌سازند وقتی `NODE_ENV !== 'production'`. staging با `NODE_ENV=development` روی اینترنت = جعل نقش.
- اول تأیید کن: کل فایل و همهٔ مصرف‌کننده‌های `DEV_ONLY`.
- جهت اصلاح: علاوه بر NODE_ENV، پرچم صریح `ALLOW_DEV_PRINCIPAL=1` لازم باشد؛ مستند در `.env.example`.
- پذیرش: تست (بدون پرچم → رد حتی در non-production).

**A6 — پاک‌سازی مرکزی `error.message`** `P1 · Medium · PARTIAL`
- انجام‌شده: `apiErrorStatus` حالا `error.code` را هم می‌خواند و `INVALID_*_STATUS`→409؛ `publicErrorMessage()` اضافه شد و در `parent/today`، `parent/[id]/today`، `learning-identities/[id]/assignments` استفاده شد؛ ورود معلم اصلاح شد. مانده: بقیهٔ routeها (مثل `teacher/applications*`، `learning/*`، `sync/batch errorCode`) هنوز پیام خام برمی‌گردانند؛ بررسی کامل همهٔ ۴۳ route لازم است.
- شواهد: routeهایی مثل `learning/attempts/submit`، `sync/batch` (`errorCode: message`)، `teacher/*` پیام خام Error را برمی‌گردانند؛ `apps/web/app/parent/page.tsx` همان `body.message` را به کاربر نشان می‌دهد. (supabaseRpc دیگر بدنهٔ خام نمی‌گذارد؛ ولی TypeError/JSON parse و … هنوز می‌توانند نشت کنند.) (تعداد routeها ۴۳ است، نه ۴۶.)
- اول تأیید کن: با grep همهٔ `error.message`/`message:` در `apps/web/app/api`؛ `lib/api-errors.ts`.
- جهت اصلاح: یک `toClientError()` که فقط کدهای شناخته‌شده را با پیام فارسی امن برمی‌گرداند؛ ناشناخته → کد عمومی + `console.error` بدون PII/توکن. قبل از تغییر، مطمئن شو retry در sync به `SUPABASE_RPC_5xx`/`NETWORK`/`HTTP_429` وابسته است و نشکند.
- پذیرش: تست؛ هیچ پیام خام Error در پاسخ.

**A7 — هدرهای امنیتی وب** `P1 · Medium · PARTIAL`
- انجام‌شده: `headers()` با nosniff، X-Frame-Options DENY، Referrer-Policy، Permissions-Policy، HSTS؛ originهای AI Studio/Cloud Run حذف شدند. مانده: CSP (ابتدا Report-Only).
- شواهد: `apps/web/next.config.ts` فاقد `headers()` است (CSP، nosniff، Referrer-Policy، Permissions-Policy، frame-ancestors). `allowedDevOrigins` شامل hostهای Cloud Run/AI Studio باقی‌مانده است.
- جهت اصلاح: ابتدا CSP به‌صورت Report-Only؛ بقیه فعال؛ حذف originهای بی‌مصرف بعد از تأیید. پذیرش: `next build` سبز + تست هدرها.

**A8 — نظافت log** `P2 · Low · DONE (2026-10-09)` — `console.log`های `DuolingoLessonModal` حذف؛ `catch {}`های خالی کامنت‌دار شدند.
- `apps/web/components/DuolingoLessonModal.tsx`: `console.log` های debug (وضعیت solved) در production؛ حذف. بررسی کن هیچ log سرور توکن/PII ندارد (`supabaseRpc` فقط status/pg-code می‌نویسد).

**A9 — RLS: پوشش استاتیک و تست منفی** `P2 · BLOCKED(live) / static OPEN`
- شواهد: static: ۸۳ جدول در migrationها، هر ۸۳ `enable row level security` دارند. درستی policyها و تست مثبت/منفی اجرایی = UNVERIFIED (نیاز به Supabase).
- بکن: یک verifier استاتیک پایدار برای «هر جدول جدید باید RLS داشته باشد» بنویس (نه ادعای live).

**A10 — وابستگی‌ها** `P2 · Accepted` (D8). فقط در Phase 4 دوباره.

### Stage B — تست و CI

**B1 — regression برای fixهای همین پروژه** `P1 · OPEN` — تست‌ها: `teacher-auth` (production بدون secret/کوتاه‌تر از 32 → sign پرتاب، verify → null؛ non-production → dev secret)، `supabaseRpc` (پیام فقط `SUPABASE_RPC_<status>`؛ بدنه به client نمی‌رسد)، `FileSyncQueueStore` (با mock `expo-file-system`: فایل خراب quarantine، tmp recovery، serialize)، `DSSurface` forwards accessibilityLabel. (تست parser صف قبلاً هست.)

**B2 — تست route-level برای API** `P1 · OPEN` — وب ۱۱۷ فایل منبع و فقط ۱ تست دارد. اولویت: guard هویت (۴۶ route؛ فقط OTP و ورود/خروج معلم عمومی‌اند)، ownership (parent/teacher/assignment/outcome)، `sync/batch`، content entitlement.

**B3 — پکیج‌های بدون تست** `P1 · OPEN` — `assignment-runtime`، `adult-projections`، `content-delivery` صفر تست (`api-client` در SNAP-20261014-04 حذف شد).

**B4 — CI** `P2 · OPEN (O-2)` — هیچ CI وجود ندارد. گیت‌ها: install → build:packages → typecheck همه → vitest → static-all → web build.

**B5 — verifierها** `P2 · OPEN` — ثبت `verify-phase-a..f` در `package.json`؛ تبدیل تدریجی guardهای string-grep به تست رفتاری (D5).

**B6 — `npm run verify:p02:full`** `P1 · OPEN` — هرگز اجرا نشده؛ اجرا و ثبت (VD-003). `eas.json` preview هنوز `EAS_NO_FROZEN_LOCKFILE=1` دارد؛ حالا lockfile هست → بعد از اجرای موفق حذف شود.

### Stage C — زیرساخت و تنظیمات

**C1 — `.env.example` ناقص** `P1 · OPEN` — `AUTH_OTP_PROVIDER_URL` (وب) و `ALLOW_DEV_PRINCIPAL` (بعد از A5) مستند نیستند؛ موبایل: `EXPO_PUBLIC_API_BASE_URL` و … در `eas.json` برای profileها تعریف نشده‌اند (Phase 4 باید تعیین شود؛ `isProductionApiSafe` در `config/runtime` مرز را چک می‌کند).

**C2 — تطبیق registry API با routeها** `P2 · OPEN` — `docs/api/API_SURFACE_REGISTRY.md` را با ۴۶ route و تماس‌های `runtimeApi.ts` مقایسه کن؛ routeی که ثبت نشده → ثبت یا حذف. (از برنامهٔ قدیمی B1.)

**C3 — چندپایه (multi-grade) بدون crash** `P2 · OPEN` — تأیید کن gradeهای بدون محتوا `COMING_SOON` می‌شوند و crash نمی‌کنند (از B3 قدیمی؛ فقط بررسی، محتوا نساز).

**C4 — محتوا: invalidation نسخه و شکست امن وقتی package نیست** `P2 · OPEN` — فقط بررسی کد `content-delivery` و `ContentManager` (از B4 قدیمی).

### Stage D — UI/UX و دسترس‌پذیری (فاز 2 باقی‌مانده)

**D0 — فهرست مشکلات UI/UX با اولویت** `P1 · OPEN` — هنوز نوشته نشده. مسیرها را در کد قدم‌به‌قدم بررسی کن: welcome/onboarding، OTP و resume، grade/placement، path، station start/play/result، practice، missions، profile/avatar/achievement، parent، settings، و حالت‌های loading/empty/offline/retry/error. برای هر صفحه: CTA، back/context، بن‌بست/حلقه، متن فارسی کوتاه، feedback درست/غلط، سازگاری با tokens. نتیجه را در جدول «UX Ledger» (§7) بنویس. (بررسی استاتیک ناوبری: همهٔ targetهای literal به routeهای موجود می‌خورند؛ بن‌بست واقعی بررسی نشده.)

**D1 — کنتراست (محاسبه‌شده از tokens)** `P1 · OPEN`
- `DSButton variant="secondary"`: متن سفید روی amber `#F59E0B` = **2.15:1** (FAIL). فعلاً ۰ استفاده؛ قبل از استفاده متن را تیره کن یا پس‌زمینه را `secondaryDark` کن.
- `text.muted #6B7772` روی `bg.subtle` = **4.45:1** (FAIL مرزی؛ روی canvas 4.53 و surface 4.66 مرزی). یا token را تیره‌تر کن یا روی subtle استفاده نشود. تغییر token = بازتولید `design-tokens.generated.css` و بررسی هر دو پلتفرم.
- مرز inputها (`border.default #C8D4CC`/`strong #9EAEA4` روی سفید) احتمالاً زیر 3:1 است → برای inputها بررسی WCAG 1.4.11 کن.
- بقیهٔ جفت‌های اصلی (primary/secondary text، link، brand.primary، error، warning، success) ≥4.5 هستند.

**D2 — متن بزرگ (large text)** `P1 · OPEN` — هیچ `maxFontSizeMultiplier` یا سیاست scaling در موبایل نیست و ۳۷ مورد `height: <عدد>` ثابت دارد. استاتیک: کانتینرهای ارتفاع‌ثابتِ حاوی Text را فهرست کن، `minHeight` یا سقف scaling در کامپوننت پایهٔ متن بگذار. اثبات واقعی = device (Phase 4).

**D3 — reduced motion** `P2 · OPEN` — فقط ۴ فایل موبایل و ۱۱ فایل وب آن را رعایت می‌کنند. فهرست همهٔ animation/Reanimated را بساز و رعایت را تأیید کن.

**D4 — کد مرده** `P2 · PARTIAL (SNAP-20261014-04)` — `apps/mobile/src/components/SemanticAnimationDemo.tsx` و `apps/web/components/RiveCompanionMascot.tsx` هیچ importی ندارند (مورد `div onClick` غیرقابل‌دسترس در Mascot عملاً غیرفعال است). `@rive-app/react-native` فقط در `AnimatedCharacter.tsx` است و هیچ فایل `.riv` وجود ندارد. تأیید کن (P12 ممکن است لازم داشته باشد) و بعد حذف/رها کن. نام `DuolingoLessonModal` به brand مرجع اشاره دارد؛ تغییر نام در نظر گرفته شود. **حذف‌شده:** `learningEngine.ts` و `offlineSync.ts` (وب)، دو barrel بی‌مصرف موبایل، پکیج `api-client`. **باقی (با دلیل):** `SemanticAnimationDemo`، `PlacementFlow`، `runtimeBudget` و `progression.ts` را verifierها با نام می‌خوانند (gate-bound)؛ `RiveCompanionMascot` منتظر O-7 است؛ `flow.ts` و `macro.ts` منتظر O-8.

**D5 — RTL** `P2 · OPEN` — RTL با plugin بومی `withForceRtl` اعمال می‌شود (سالم). ۱۰۴ استفادهٔ literal از `left/right/margin*` هست؛ چون RN در RTL swap می‌کند معمولاً درست است، ولی موارد `textAlign:'left'|'right'` و آیکن‌های جهت‌دار را فهرست و بررسی کن.

**D6 — a11y roles/labels** `P2 · PARTIAL` — اسکن استاتیک موبایل: ۴۴ Pressable، موارد flagشده بررسی‌شده false positive بودند (۲ مورد در Demo حذف‌شدنی). اثبات TalkBack = Phase 4.

**D7 — وب: focus/keyboard** `P2 · OPEN` — focus-visible، ترتیب tab، نبود `<img>` بدون alt (۰ مورد، سالم).

### Stage E — Performance (اول اندازه‌گیری، بعد بهینه‌سازی)

Baseline اندازه‌گیری‌شده: وب = ۲۵ chunk جاوااسکریپت، مجموع ≈ **306KB gzip**، بزرگ‌ترین ≈ 72KB gzip. موبایل: assets ≈ **2.1MB**، بزرگ‌ترین فایل 109KB (آیکن)؛ بدون `.riv`.

**E1** `P1 · OPEN` — First-Load JS به‌ازای route وب (از build manifest) و ثبت عدد.
**E2** `P1 · OPEN` — حجم bundle موبایل با `npx expo export --platform android` (در صورت امکان شبکه) و ثبت عدد.
**E3** `P2 · OPEN` — بازبینی re-render: یک `AppStateContext` بزرگ، لیست‌های Path/Practice (key، memo)، وابستگی‌های `useMemo` (مثلاً `PracticeHubScreen`).
**E4** `P2 · OPEN` — درخواست‌های تکراری و backoff در `flushPendingSync` (روی هر active و بعد از submit).
**E5** `UNVERIFIED` — cold/warm start، dropped frames، memory → device (Phase 4).
قانون: هر ادعای بهبود با قبل/بعد یا دلیل فنی.

### Stage F — نظافت

**F1** `OPEN` — ثبت deltaهای ledger در `ROADMAP_PHASES.md` (§8) با evidence.
**F2** `OPEN` — اگر کدی به‌خاطر کار شما بی‌مصرف شد (dead exports/دموها)، گزارش کن؛ حذف گسترده نکن.

### Stage U — پیاده‌سازی UI v1 از صفحات ۲۰۲۶-۱۰ (ADR-0035)

مرجع: `docs/design-handoff-2026-10/pages-v1/manifest.json`. هر فاز: پیاده‌سازی + مقایسهٔ پیکسلی با اسکرین‌شات طرح (۳۹۰×۸۴۴) + گیت‌ها + START_HERE + ZIP.

**U0** `DONE` — مرجع `pages-v1`، ADR-0035، manifest با نقشهٔ شخصیت‌ها و توکن‌ها، نسخهٔ v1 مسیر، `verify-ui-v1-scope`، یادداشت جایگزینی در CHARACTER-BIBLE.
**U1** `DONE (SNAP-20261014-06)` — زیربنا: توکن‌ها از `:root` راهنما در `packages/design-system` (وب هم می‌گیرد)؛ فونت Vazirmatn ۴۰۰/۶۰۰ از `@expo-google-fonts/vazirmatn` (نصب است؛ الان ۴۰۰/۷۰۰/۹۰۰ لود می‌شود)؛ نسخه‌های SDK 57 (از `bundledNativeModules`): `react-native-svg@15.15.4`، `expo-linear-gradient@~57.0.2`، `expo-speech@~57.0.3`، `react-native-web@~0.21.0` و `react-dom@19.2.3` (برای ابزار مقایسه)؛ کامپوننت‌های پایه: دکمهٔ لبه‌دار، کارت، چیپ، ورودی، حباب راهنما، نوار بالا، نوار پیشرفت، تب‌بار، `Character`، حلقهٔ پیشرفت. پیش از تغییر شناسه‌ها، وابستگی داده به `aria/qbo/dana/jiko` بررسی می‌شود.
**U2** `DONE (SNAP-20261014-07)` — ورود: صفحه‌های ۰۱ تا ۰۴ (`onboarding`)؛ منطق دست‌نخورده. پیش‌نیازها: **اولین کار bundle واقعی Metro** (هنوز اثبات نشده؛ v1 تا U2 در هیچ صفحه‌ای import نشده)؛ کامپوننت‌های `Tile` (آواتار/پایه) و خانه‌های کد OTP با نمونهٔ مقایسه؛ رنگ پیش‌تنظیم آواتارها در `packages/contracts/src/onboarding.ts` (هنوز `#F59E0B`)؛ `NoteInfo` و گزینهٔ `Portrait` بزرگ (۱۳۲).
**U3** `DONE (SNAP-20261018-01)` — مسیر: صفحهٔ ۰۵ نسخهٔ v1 (`(tabs)/index`، `src/path/*`، `ChildTabBar`). `PathView` + مدل خالص `pathModel.ts` (داده‌های واقعی G1) + هندسهٔ `layout.ts` (راستی‌آزمایی‌شده با الگوریتم خود صفحه) + تب‌بار طرح؛ پنج استثنای شفاف در `scripts/lib/path-waivers.mjs`.
**U4** `DONE (SNAP-20261023-01)` — شروع مرحله ۰۶ (`station/[id]/start` روی `StageIntroView`) و بخش اول آموزش ۰۷ (مرحلهٔ LEARN در `StationFlow` روی `TeachView` با «دوباره بشنو»). مرحله‌های بعد از LEARN (راهنمایی‌شده، بازی‌ها، مستقل، چک‌ها، نتیجه، چالش) تا U5 و U6 همچنان با `LessonPlayerChrome` و cast قدیمی رندر می‌شوند؛ ۹ verifier وابسته بدون ضعیف‌شدن سبزند. جزئیات §6.10.
**U5a** `DONE (SNAP-20261024-01)` — نمای خالص سؤال و بازخورد: `QuestionView` (فازهای `choose`=۰۸، `correct`=۰۹، `retry`=۱۰)، `OptionButton`، `FeedbackSheet`، `BeadTray` بدون عدد؛ parity سه صفحه ۰٫۰۶٪.
**U5b** `DONE (SNAP-20261024-03، تصمیم‌های D-001 تا D-003)` — `QuestionView` در `StationFlow` برای سه encounter تک‌انتخابی تأییدشده (E02 راهنمایی‌شده، E04 شمارش، E05 مستقل) وصل شد: لمس فقط انتخاب می‌کند، «بررسی» همان `submitAttempt` قبلی را یک بار می‌فرستد، «ادامه/دوباره امتحان کن» در برگه جلو می‌برد؛ برگهٔ غلط از `selectedStep` سرور پیروی می‌کند (D-002). محتوای محلی «مهره» شد (D-004). سناریوی واقعی با **سرور mock یادگیری** در مرورگر تست شد (§6.12).
**U6** `DONE (SNAP-20261024-04)` — نتیجه و چالش: `StageResultView` (۱۱: کانفتی ثابت، جشن آرام Main، «۱ از ۵ مرحله»، ردیف دستاورد بنفش «دستاورد جدید/شمارش‌گر») و `ChallengeIntroView` (۱۲: روکا، چیپ‌ها، «شروع چالش»؛ تعداد سؤال از تعریف واقعی می‌آید، D-015). دو باگ پنهان گرفته شد (کرش هدر پخش‌کنندهٔ چالش؛ کارت محتوای کهنه زیر چالش). parity ۰٫۰۶٪ و ۰٫۳۱٪؛ flow:station ۴۸ بررسی با مسیر کامل شاد تا جشن.
**U7** `DONE (SNAP-20261024-05)` — تمرین و من: `PracticeView` (۱۳: راهنمای فندق، ردیف‌های بازی از قرارداد تمرین با چیپ «تمرین» و ردیف قفل «بعد از مرحلهٔ n») و `MeView` (۱۴: کارت هویت، نوار «n از ۲۵ ایستگاه»، پنج ردیف دستاورد) + ردیف‌های اقدام قراردادی (تغییر ظاهر/والدین) به‌عنوان حالت مشتق. پنج استثنای قفل‌شده در `scripts/lib/tabs-waivers.mjs`. parity فقط ناحیهٔ body (تب‌بار outlined طبق D-011).
**U8** `DONE (SNAP-20261025-01)` — بستن: variant «soft» تب‌بار حذف شد (طبق U-Q9/D-011؛ همه‌جا outlined)، specimenها و توکن مربوطه پاک شدند و `verify-ui-v1-path` به‌روز شد؛ صفحهٔ ۱۵ (راهنمای طراحی) صفحهٔ اپ نیست و parity آن را از ابتدا مستثنا کرده بود. تست اندروید واقعی = Phase 4 (ممنوع). همهٔ گیت‌ها سبز (§3).

**سؤال‌های باز (منتظر مالک):**
- **U-Q1** گرهٔ «شروع مرحله» (۰۶): طرح Number خوابآلود را نشان می‌دهد ولی alt می‌گوید «با دست اشاره می‌کند». پیش‌فرض: همان تصویر طرح.
- **U-Q2** گرهٔ جاری مسیر: کتاب به‌جای ستاره. پیش‌فرض: کتاب.
- **U-Q3** شناسه‌های شخصیت: پیش‌فرض `main / number / dana / fandogh / roka`؛ شناسه‌های قدیمی بعد از بررسی داده حذف شوند.
- **U-Q5** (حل‌شده با D-009؛ بازطراحی DEFERRED تا صفحهٔ طرح) سه مرحلهٔ ورود طرح تأییدشده ندارند: **تعیین سطح، نتیجه، همگام‌سازی**. فعلاً محتوا و منطق قبلی را با نوار بالای جدید، cast جدید و توکن‌های جدید دارند. برای بازطراحی دقیق طرح لازم است.
- **U-Q6** (منتظر مالک) خط «با ادامه، شرایط استفاده و حریم خصوصی را می‌پذیری.» در صفحهٔ خوش‌آمد طرح نیست ولی ثبت `consentAt` به زدن «بریم!» وابسته است؛ پیش‌فرض: خط می‌ماند.
- **U-Q7** مرحلهٔ `GRADE` در قرارداد مشترک می‌ماند (وب هنوز از آن استفاده می‌کند)؛ موبایل آن را نمی‌بیند. هم‌ترازی وب در U8.
- **U-Q8** (جهت با D-010: ورودی در U7 روی تب تمرین بررسی می‌شود) طرح مسیر کارت‌های «الان اینجا»، «آهنگ یادگیری»، ورودی «ماموریت‌ها»، «تمرین یک‌لمسی» و راهنمای زمان جلسه را ندارد. کد و مسیر `/missions` و منطق‌شان می‌ماند ولی **هیچ ورودی بصری ندارند**. پنج استثنا در `scripts/lib/path-waivers.mjs` ثبت شد (هر کدام با verifier مربوط و مرحلهٔ بازگرداندن). تصمیم لازم: ماموریت‌ها و آهنگ یادگیری کجا دیده شوند (پیشنهاد: تب تمرین یا من در U7)؟
- **U-Q9** (حل‌شده با D-011) تب‌بار: صفحهٔ مسیر (جدیدتر) ۱۰۶ پیکسل با دایرهٔ ۶۸×۴۴ و قاب primary دارد، صفحه‌های ۱۳ و ۱۴ ۸۴ پیکسل و دایرهٔ ساده. چون تب‌بار یک کامپوننت است، نسخهٔ مسیر (`outlined`) برای هر سه تب گرفته شد؛ `soft` فقط برای مقایسهٔ صفحه‌های ۱۳ و ۱۴ نگه داشته شده و در U8 اگر `outlined` تأیید شد حذف می‌شود. در U7 ناحیهٔ تب‌بار صفحه‌های ۱۳ و ۱۴ را از مقایسه جدا کن.
- **U-Q10** (حل‌شده با D-012) نام فصل‌های ۲ تا ۵ در طرح (جنگل الگوها، دشت جمع و تفریق…) با «دنیاهای» واقعی قرارداد (`worlds.ts`: جنگل اندازه‌ها، رودخانهٔ مسئله، قله‌ی زمان، دشت اندازه‌گیری) فرق دارد. اپ نام واقعی را نشان می‌دهد؛ رنگ فصل‌ها به ترتیب فصل از طرح (آبی، سبز، بنفش، سفالی، صورتی). فصل اول («دره‌ی عددها») یکی است.
- **U-Q11** (حل‌شده با D-013) گنج در طرح بعد از ایستگاه چهارم است ولی چک‌پوینت قرارداد بعد از ایستگاه پنجم؛ گنج فعلاً فقط تزئینی و قفل است (مطابق طرح).
- **U-Q12** (حل‌شده با D-014) رفتارهای مشتق‌شده (طرح تعریف نکرده): دکمهٔ راهنمای فصل داستان دنیا را در نوار زیر نوار فصل نشان می‌دهد؛ ضربهٔ چیپ «پایهٔ ۱» پیام «پایه‌های دیگر به‌زودی باز می‌شوند.» می‌دهد؛ ضربه روی ایستگاه قفل اعلان «ایستگاه‌های قبل را جلو ببر.»؛ نوار وضعیت محتوا (بررسی/آفلاین)؛ ردیف پیشنهاد پرش زیر جداکنندهٔ فصل؛ ناحیهٔ لمس چیپ پایه ۴۸ (ظاهر ۴۴).
- **U-Q13** (حل‌شده با D-014) حبابِ گرهٔ جاری در طرح «ادامه بده» است؛ اپ متن `primaryContinueLabelFa(gradeId)` را می‌نویسد (برای G1 «ادامه»).
- **U-Q14** نوار پیشرفت صفحهٔ ۰۶ در طرح به‌خاطر `flex:1` در ستون فلکس یک حباب ۱۶۶ پیکسلی است (CSS خود صفحه `height:10px; max-width:260px` می‌گوید). اپ نوار ۱۰ پیکسلی می‌سازد؛ طلایی `06-fix` همان صفحه با فقط همین قاعده خنثی‌شده است و `06.png` دست‌نخورده می‌ماند. تأیید مالک لازم نیست مگر طرح عوض شود.
- **U-Q15** (حل‌شده با D-005) طرح ۰۶ «پیشنهاد جلسه» و جعبهٔ وضعیت (آماده / نیاز به آماده‌سازی) را ندارد؛ از صفحهٔ شروع ایستگاه حذف شد (استثنای شفاف `station-start-session-hint` در `scripts/lib/station-waivers.mjs`؛ منطق `sessionLengthHintFa` در پروفایل و سطح «من» همچنان verify می‌شود). تصمیم مالک: برگردد؟ کجا؟
- **U-Q16** (حل‌شده با D-004؛ مهاجرت محتوای سرور DEFERRED) محتوای قرارداد E01 می‌گوید «هر ستاره را یکی‌یکی ببین…» ولی طرح ۰۷ مهره می‌کشد و حباب «این سه مهره است.» دارد. اپ فعلاً متن محتوا را با مهره نشان می‌دهد (ناهمخوان). گزینه‌ها: (الف) متن محتوای E01 به «مهره» تغییر کند (مهاجرت محتوا)، (ب) شیء ستاره کشیده شود. تعداد مهره از `visualCount` محتوا، پیش‌فرض ۳ (همان که صحنهٔ قدیمی داشت).
- **U-Q17** (حل‌شده با D-006؛ صدای ضبط‌شده DEFERRED) «دوباره بشنو» فقط TTS (`expo-speech`، `fa-IR`) است. فیلد اختیاری صدای ضبط‌شده در قرارداد محتوا اضافه **نشد** (برخلاف راهنمای قدیمی U4): پخش فایل به وابستگی بومی جدید (`expo-audio`) و تغییر قرارداد مشترک (contracts، web، fixtureها) و فایل‌های صوتی نیاز دارد و فیلدِ بدون پخش‌کننده کد مرده است. تصمیم مالک.
- **U-Q18** (حل‌شده با D-007) طرح پخش خودکار هنگام ورود به ۰۷ را تعریف نکرده؛ هیچ چیز خودکار پخش نمی‌شود (فقط دکمه). فارسی TTS روی دستگاه واقعی اثبات‌نشده است.
- **U-Q19** رفتارهای مشتق‌شده و دادهٔ نمونه (طرح تعریف نکرده): زیرعنوان، «حدود N دقیقه» و عنوان از دادهٔ قرارداد ایستگاه می‌آیند (ST01: ۸ دقیقه؛ طرح نمونه ۱۰ دقیقه و متن دیگری دارد)؛ «۵ بخش» = تعداد بخش‌های کلان (`MACRO_LABELS`)؛ نوار ۰۶ فعلاً همیشه خالی است (منبع resume برای پر شدن وجود ندارد)؛ دکمهٔ اصلی در حالت دانلودنشده «آماده‌سازی» و هنگام دانلود با spinner است؛ خطا و «در حال بررسی» با یک خط کوچک زیر نوار نشان داده می‌شود؛ راهنمای ۰۷ شخصیت Number است (نه cast قدیمی آریا)؛ دکمهٔ ادامه برچسب «ادامه» دارد.
- **U-Q20** (حل‌شده با D-001) مدل تعامل: طرح ۰۸ «انتخاب گزینه ← دکمهٔ بررسی ← برگهٔ بازخورد ← ادامه» است؛ موتور فعلی با لمس گزینه همان لحظه پاسخ را به سرور می‌فرستد و بلافاصله به مرحلهٔ بعد می‌رود (`answerContent` در `StationFlow`). پیشنهاد: لمس فقط انتخاب کند، «بررسی» همان `submitAttempt` را بزند و گذار به مرحلهٔ بعد تا «ادامه» نگه داشته شود؛ نیازمند بازنویسی `answerContent` (۹ verifier به متن آن وابسته‌اند).
- **U-Q21** (حل‌شده با D-002) پاسخ غلط: طرح ۱۰ «دوباره امتحان کن» همان سؤال را نشان می‌دهد، ولی سرور (`selectedStep`: CONTINUE / RECOVERY / RECHECK) تصمیم می‌گیرد و پاسخ غلط معمولاً به محتوای دیگری (RECOVERY) می‌رود و شمارندهٔ `attemptNumber` برای idempotency بالا می‌رود. گزینه‌ها: (الف) دکمهٔ برگهٔ غلط فقط وقتی «دوباره امتحان کن» باشد که سرور تلاش مجدد همان سؤال را اجازه دهد و در غیر این صورت «ادامه»؛ (ب) قرارداد سرور تلاش مجدد را صریح اعلام کند. قاعدهٔ یادگیری: کلاینت درستی را تعیین نمی‌کند.
- **U-Q22** (حل‌شده با D-003؛ متن وابسته به سؤال DEFERRED) متن بازخورد: «درست است! چهار مهره.» و «نزدیک بود. یکی‌یکی بشمار.» وابسته به سؤال‌اند و قرارداد محتوا فیلدی برایشان ندارد. گزینه‌ها: متن عمومی («درست است!»، «نزدیک بود. دوباره امتحان کنیم؟») یا فیلد اختیاری در محتوا. همچنین محتوای E02/E04/E05 از «ستاره» حرف می‌زند ولی طرح مهره می‌کشد (همان U-Q16)، و فقط سؤال‌های تک‌انتخابی (E02، E04، E05، E11) با ۰۸ جور درمی‌آیند؛ بازی الگو، آزمون چندسؤاله و بازیابی صفحهٔ طرح ندارند (ثبت‌شده برای U-Q8 و بعد).
- **U-Q4** تصحیح (U1): دارایی‌های Dana و Fandogh پس‌زمینهٔ پخته دارند، نه بدون پس‌زمینه. طرح از برش ۳۲۰ پیکسلی آن‌ها داخل دایره استفاده می‌کند و اپ همان برش‌ها را به‌کار می‌برد؛ نیازی به تصمیم نیست.

---

## 6) کارهایی که انجام شده‌اند (DONE + شواهد)

- **contracts**: re-export صریح batch B–E در `packages/contracts/src/index.ts` (رفع TS2308) → typecheck 16→0.
- **challenge-runtime** `service.ts`: spread شرطی برای `interactionType` (exactOptionalPropertyTypes).
- **web**: variant `ghost` در `UiButton`؛ narrowing در `JumpAssessmentView`؛ نوع `OtpResult` در `auth-provider.ts`؛ Suspense برای `app/page.tsx` (build)؛ ۲۱ استفادهٔ توکن CSS ناموجود (`--ds-color-bg-*`، `--ds-motion-medium`) به توکن‌های واقعی تبدیل شد.
- **امنیت web**: `teacher-auth.ts` fail-closed (D2) + پاسخ ۵۰۳ `AUTH_NOT_CONFIGURED` در login؛ `supabase-http.ts` بدنهٔ خام backend را نمی‌گذارد (log فقط status + pg code)؛ `.env.example` شامل `TEACHER_SESSION_SECRET`.
- **mobile**: `ContentManager.getManifest` عمومی (قبلاً `bootstrap.ts` متد ناموجود را صدا می‌زد و همیشه به cache می‌افتاد)؛ نوع `unlockGranted` در `jump.tsx`؛ `DSSurface` حالا `accessibilityLabel` را واقعاً منتقل می‌کند؛ رنگ‌ها/توکن‌های ناموجود در `avatar`/`onboarding` اصلاح شد؛ emoji قفل → آیکن Ionicons؛ `minHeight` برای کارت‌ها/دستاوردها/دسته‌ها (۳ تست touch-target)؛ `PracticeHubScreen` null-safety + `accessibilityLabel="دیدن مسیر"`؛ پروفایل همهٔ دستاوردها را نشان می‌دهد (D1).
- **sync**: `FileSyncQueueStore` با serialize، نوشتن temp+move، quarantine فایل خراب؛ `queueParse.ts` + ۴ تست. (رفتار `File.move(overwrite)` روی دستگاه UNVERIFIED.)
- **verifierها**: p09 (pointer فاز ≥ P10)، phase15 (guard رفتاری: `RewardReveal visible={stationPassAchieved}` + `sessionCompleteFeel(` + بدون jargon)؛ دو بررسی وجود فایل منسوخ از `verify-backend-b0-foundation`/`verify-p10-batch-e-depth` حذف شد (فایل‌هایشان حذف شد).
- **مستندات**: ادغام md-ها در همین فایل؛ `src/README.md` اصلاح شد.

---

### 6.17) P1 — ابزار و بهداشت ریپو — SNAP-20261025-03 (شاخهٔ `chore/p1-toolchain`)
- **Node 22.18+:** `.nvmrc` = 22.18.0 و `engines.node` = >=22.18 (هشدار npm بدون engine-strict). اجرای بدون `--experimental-strip-types` روی این ماشین **امکان‌پذیر نیست** (Node 22.16.0 نصب است) → بلاکِر مالک: `nvm install 22.18.0; nvm use 22.18.0` یا نصب‌کنندهٔ LTS؛ تا آن زمان static-all پرچم را خودکار می‌گذارد و لاگ‌ها این را علامت‌دار می‌کنند.
- **back سخت‌افزاری اندروید:** stub خالی BackHandler در harness با registry واقعی عوض شد (`apps/mobile/parity/flow/entry.tsx`: هندلرهای ثبت‌شده نگه داشته می‌شوند و `__flow.back()` آخرین هندلر را مثل دستگاه صدا می‌زند). دو بررسی جدید در flow:station: «back داخل درس همان confirmExit را می‌آورد» و «می‌مانم درس را باز نگه می‌دارد» (48→50).
- **اسکن امنیتی باندل:** خروجی واقعی expo (Hermes 4,609,797 بایت) برای ۱۸ الگوی محرمانگی grep شد: همه صفر (لاگ `p1-bundle-security-scan.log`). سه اثر «password» = نام گلیف Ionicons و ثابت‌های autocomplete ری‌اکت‌نیتیو.
- **app.json/eas.json:** مجوزها فقط INTERNET و ACCESS_NETWORK_STATE؛ بدون `usesCleartextTraffic`/`debuggable`؛ پروفایل production فقط store/app-bundle و `MOBILE_RELEASE_CHANNEL` (بدون پرچم دیباگ).
- **PowerShell:** 5.1 (5.1.22621.2506) با مسیر quoted و هر دستور npm در خط خودش اثبات شد (build:packages exit 0). **PS 7 نصب نیست** — شکاف محیط ثبت شد؛ سند `docs/testing/GATE_RUN_ORDER.md` هر دو را پوشش می‌دهد.
- **اسناد جدید:** `docs/reference/DESIGN_INSPIRATION.md` (الگوهای مجاز/ممنوع الهام، مرجع D-entryها)، `docs/testing/DEVICE_TEST_CHECKLIST.md` (پیش‌نویس؛ تکمیل در P7)، `docs/testing/GATE_RUN_ORDER.md`.
- **گیت‌ها:** vitest ۴۲۵/۴۲۵، static ۷۴/۷۴، parity ۲۹/۲۹، flowها 28/29/**50**/14، web build و باندل Metro exit 0.

### 6.16) P0 — بستن بازبینی مستقل `ui/u8-closing` — SNAP-20261025-02
- **بازبینی مستقل** (read-only در ورک‌تری جدا، گزارش در `docs/archive/review/2026-10-25-stage-u-review.md`): حکم «ACCEPT WITH FIXES»؛ همهٔ اعداد گیت‌ها دوباره تولید شد و یکی بود. دو اصلاح لازم اعمال شد:
  - **R-1:** خروجی بیلد `parity-out-expo/` (۱۲۵ فایل) از گیت خارج و در `.gitignore` رفت (همچنین الگوهای `parity/dist*` و `parity/out`).
  - **R-2:** انحراف عمدی تب‌بار (D-011: طلایی ۱۳/۱۴ soft است، اپ همه‌جا outlined می‌کشد) استثنای نام‌دار و پین‌شدهٔ ششمی شد: `tabbar-outlined-vs-soft-goldens` در `scripts/lib/tabs-waivers.mjs` (فهرست پین در `verify-ui-v1-tabs` به ۶ آی‌دی به‌روز شد؛ ستون بازگشت D-011 ارجاع می‌دهد).
- **بررسی قرارداد D-002** (`docs/archive/review/D-002-contract-check.md`): قرارداد ارسال چند تلاش در هر encounter را مجاز می‌داند (`attemptNumber` مثبت، idempotency به‌ازای کلید، بدون سقف تلاش؛ چالش همین الگو را per-round دارد). سیاست واقعی سرور امروز غلط→RECOVERY می‌دهد، پس شاخهٔ retry فقط با mock تمرین می‌شود — تصمیم سرور است، حدس کلاینت نیست. **بدون تغییر کلاینت، بدون D-016.**
- **R-3 اعمال شد:** ترکیب ردیف‌های تب تمرین به تابع خالص `apps/mobile/src/practice/rows.ts` (`practiceRowGames`) + ۵ تست در `rows.test.ts`؛ دو verifier فقط جابه‌جایی marker گرفتند (قصد حفظ شد: phase-a `PRACTICE_LIMIT` و tabs `practice:wiring-kept` حالا hub+rows را می‌خوانند).
- **R-4:** پوشهٔ `docs/content-spec/` در تاریخ بازبینی در گیت نبود؛ اکنون به‌صورت untracked در کارگاه هست (۹ فایل + README، بدون stage-1) و در فاز P4 روی شاخهٔ content کامیت می‌شود. **R-5:** بدون اقدام؛ تأیید D-001 تا D-015 با مالک باقی است.
- **گیت‌ها (لاگ‌های `p0-*`):** vitest ۴۲۵/۴۲۵ (+۵)، static ۷۴/۷۴، parity ۲۹/۲۹، flowها 28/29/48/14، web build و باندل Metro exit 0.
- **ادغام:** `ui/u8-closing` به‌صورت fast-forward در `main` (محلی، بدون push) و تگ `v1-candidate-ui`.

### 6.15) U8 — بستن Stage U — SNAP-20261025-01
- **تب‌بار یکتا:** `TabBar` فقط outlined شد (variant و `TabBarVariant` حذف؛ توکن soft نبود)، specimen `tabbar-13` و مدخل manifestش حذف شد (parity ۳۰→۲۹) و `verify-ui-v1-path` به‌جای فهرست variantها حالا نبودِ prop variant را قفل می‌کند (D-011).
- **صفحهٔ ۱۵:** راهنمای طراحی است (منبع توکن‌ها از U1)؛ صفحهٔ اپ نیست و چیزی برای ساخت ندارد.
- **فهرست DEFERRED این اجرا:** نصب Node ≥22.18 روی ماشین‌ها (مالک)؛ مهاجرت محتوای سرور برای «مهره» (D-004)؛ متن بازخورد وابسته به سؤال و فیلد صدای ضبط‌شده (D-003/D-006)؛ صفحهٔ بدون سینی برای E11 و بازی‌های الگو/بازیابی و پخش‌کنندهٔ چالش و شیت S18 بازطراحی‌شده و تعیین سطح/نتیجه/همگام‌سازی (D-008/D-009)؛ انیمیشن/صدا/هپتیک/حرکت کانفتی؛ ماموریت‌ها و آهنگ بدون ورودی بصری (D-010 با tabs-waivers)؛ تست دستگاه واقعی/TalkBack/TTS فارسی/سرور production.
- **خلاصهٔ اجرای خودکار (پروتکل واگذاری):** H1 + U5b + U6 + U7 + U8 روی پنج شاخهٔ محلی (main ← ui/h1-toolchain ← ui/u5b-question-wiring ← ui/u6-result-challenge ← ui/u7-practice-me ← ui/u8-closing) بدون push؛ تصمیم‌های D-001 تا D-015 ثبت شدند؛ سه باگ پنهان واقعی گرفته شد (کرش کروم چالش، کارت کهنه زیر چالش، شمارش practiceListLimit)؛ قاعدهٔ طلایی حفظ شد: هیچ verifier ضعیف نشد، هر استثنا نام‌دار و پین‌شده است (path/station/tabs-waivers) و دو verifier جدید (goldens-pinned، ui-v1-tabs) و یک اسکریپت جریان جدید (flow:tabs) اضافه شد.

### 6.14) U7 — تمرین (۱۳) و من (۱۴) — SNAP-20261024-05
- **اجزا/نماها:** `ui/v1/ListRow.tsx` (ردیف `.row` با حالت off، آیکون انتهایی، چیپ از طریق children و ارتفاع کمینهٔ توکنی ۷۲ روی خود Pressable — تست touchTargets مستقیم مسیر `UI.` را می‌خواند)؛ `practice/views/PracticeView.tsx` و `profile/views/MeView.tsx` (خالص)؛ توکن‌های `ui.practice`/`ui.me` از CSS صفحات.
- **کانتینرها همان فایل‌های قبلی** تا verifierها متصل بمانند: `PracticeHubScreen` منطق قرارداد را نگه دارد (پیشنهاد، habit برای صفحه‌خوان، برچسب شروع از قرارداد = «شروع همین حالا» برای G1 — نمونهٔ طرح «شروع تمرین» می‌گفت؛ دادهٔ واقعی مقدم، همان قاعدهٔ D-012)؛ `profile.tsx` نقشهٔ CHILD_ACHIEVEMENTS، شیت جزئیات S18، ردیف‌های والدین/تغییر ظاهر/تنظیمات. شمارش «n از ۲۵» از progress واقعی؛ kicker دستاورد قفل = «ایستگاه n را کامل کن» با شمارهٔ ایستگاه.
- **اصلاح واقعی:** `practiceListLimit` تعداد ردیف‌های «ثانویه» است (۲ برای G1)؛ ردیف پیشنهادی جدا از آن می‌آید → سه ردیف مثل صفحهٔ ۱۳ (کد قبلی cap را کل می‌گرفت).
- **استثناها (۵ مورد، قفل‌شده در `scripts/lib/tabs-waivers.mjs` با stillVerified و restore):** کارت یک‌لمس habit و habitLine (صفحهٔ ۱۳ ندارد)، literalهای DS در تب تمرین (همه از ui/v1)، لینک «دیدن مسیر» (سه تب جایگزینش کردند)، متن شمارندهٔ «دستاورد واقعی» (به a11y و strings رفت)، literal «با پیشرفت مسیر» (به strings رفت). verifierهای phase-d/7/7-5/phase-e الگوی waiver همانند phase-a گرفتند.
- **flow:tabs ۱۴ بررسی:** تمرین (راهنما، سه ردیف با چیپ و قفل «بعد از مرحلهٔ ۳»، دکمهٔ قراردادی، پوش به start ایستگاه) و من (نام/پایه/۰ از ۲۵، پنج دستاورد، شیت S18 باز/بسته، تنظیمات/والدین).
- **اثبات‌نشده:** دستگاه واقعی؛ تب‌بار در parity مقایسه نشد (outlined همه‌جا طبق D-011؛ golden صفحات ۱۳/۱۴ تب‌بار soft دارند — U-Q9).

### 6.13) U6 — نتیجهٔ مرحله (۱۱) و چالش (۱۲) — SNAP-20261024-04
- **توکن‌ها** (`ui.result`، `ui.challenge` از CSS/DOM صفحات): دیسک ۲۶۰/قهرمان ۲۲۰/حاشیهٔ پایین ۱۶/تیتر ۳۶–۴۸/نوار ۱۲ با فاصلهٔ ۶/کانفتی ۱۰×۲۶ در شش موقعیت ثابت با سه رنگ (کهربایی، بنفش، آبی `#9EC3DB`)/ردیف دستاورد (شعاع ۲۰، پدینگ ۱۲/۱۶، آیکون ۴۸ با گلیف ۲۶، سایهٔ `#C9BEF5`، برچسب `#4A3C99`)؛ چالش: دیسک ۲۴۰/قهرمان ۲۳۰/فاصلهٔ چیپ ۸.
- **اجزا:** `ui/v1/Confetti.tsx` (شش قطعهٔ ثابت؛ حرکت DEFERRED)، `ui/v1/AchievementRow.tsx` (حالت `highlight` بنفش صفحهٔ ۱۱ و `plain` برای U7)، `station/views/StageResultView.tsx` و `ChallengeIntroView.tsx` (خالص).
- **اتصال:** COMPLETE فقط با `stationPassAchieved` صفحهٔ ۱۱ را می‌سازد (دیگر انواع COMPLETE کارت قدیمی را نگه می‌دارند؛ `sessionCompleteFeel` و `RewardReveal` و «پیشرفت این جلسه ذخیره شد» در همان شاخهٔ قدیمی می‌مانند و verifierهای phase-c/phase15 سبز ماندند). شمارش «n از ۵ مرحله» از `G1_UNITS` + `progress[].passed` + گذر همین ایستگاه (بدون سوسو). دستاورد از `G1_PATH_ACHIEVEMENTS` (ST01→شمارش‌گر). مقدمهٔ چالش با state `challengeIntroDone`: «شروع چالش» فقط UI را باز می‌کند (run مثل قبل هنگام ورود شروع می‌شود).
- **دو باگ پنهان (از قبل موجود، با تست جدید گرفته شد):** (۱) `LessonPlayerChrome` روی `SIGNATURE_CHALLENGE` کرش می‌کرد (`LESSON_STAGE_META` کلیدش را ندارد؛ هر ایستگاه challenge-first در اپ واقعی هم کرش می‌کرد) → fallback موبایلی با برچسب «چالش» از strings؛ تغییر قرارداد لازم نبود. (۲) در REMOTE، کارت محتوای کهنهٔ درس زیر پخش‌کنندهٔ چالش رندر می‌شد → شرط رندر اصلاح شد.
- **parity:** `stage-result` ۰٫۰۶٪ (رفع: `margin-top: 8` گم‌شدهٔ ردیف دستاورد از DOM صفحه کشف شد)، `challenge-intro` ۰٫۳۱٪ (لبه‌های AA تصویر روکا)؛ سقف ۰٫۵.
- **flow:station ۲۵→۴۸:** سناریوی `play-pass` کل مسیر شاد را می‌راند: آموزش ← E02/E04/E05 (بررسی/برگه/ادامه) ← E03/E06/E11 قدیمی ← E07 و E08 (۵ پاسخ درست هرکدام) ← stationPass ← E12 ← مقدمهٔ چالش (چیپ‌ها، نوار «بخش ۵ از ۵»، بستن با تأیید) ← پخش‌کنندهٔ چالش (۳ round) ← صفحهٔ ۱۱ («آفرین!»، «۱ از ۵ مرحله»، «دستاورد جدید/شمارش‌گر»، «ادامه»=خروج)؛ یکتایی کلیدهای idempotency در کل ایستگاه بررسی می‌شود. mock سرور: کلیدهای چندسؤالی، سیاست ساده‌شدهٔ stationPass (گذر فقط روی چک‌های کامل‌درست؛ سیاست واقعی در learning-runtime است)، API چالش.
- **verifier:** `verify-ui-v1-result` (توکن‌ها، خلوص نماها، گیتِ جشن روی گذر واقعی، مقدمهٔ چالش، fallback کروم، رشته‌ها، parity، پوشش flow). static ۷۲/۷۲.
- **اثبات‌نشده:** حرکت کانفتی و صدای جشن (طرح انیمیشن ندارد؛ استاتیک مثل golden)، دستگاه واقعی، سرور production (سیاست pass واقعی)، پخش‌کنندهٔ چالش هنوز طرح ندارد (فقط مقدمهٔ ۱۲ بازطراحی شد).

### 6.12) H1 (قابلیت حمل ابزار) و U5b (اتصال سؤال به پخش‌کننده) — SNAP-20261024-03

**H1 (شاخهٔ `ui/h1-toolchain`، کامیت cf70961):**
- اجرای همهٔ gateها روی **ویندوز** ممکن شد: `scripts/lib/browser.mjs` حالا Chromium پلی‌رایت ویندوزی و Chrome/Edge نصب‌شده را پیدا می‌کند؛ پنج اسکریپت `file://` را با `pathToFileURL` می‌سازند؛ چهار verifier با `fileURLToPath` (به‌جای `URL.pathname`) ریشهٔ ریپو را می‌گیرند؛ dynamic importهای مسیر مطلق (runtime-tests، independent-verification) file-URL شدند؛ `verify-mobile-release` جداکنندهٔ مسیر را نرمال می‌کند (exemption خودش را در ویندوز می‌گرفت)؛ اسکریپت build وب پیشوند POSIX `NODE_ENV=production` نداشت و حذف شد (`next build` ذاتاً production است)؛ کلید تکراری `typecheck:all` در package.json حذف شد (esbuild هشدار می‌داد).
- **Golden immutability:** `npm run parity:goldens` فقط با `--write` اجرا می‌شود و از sweep استاتیک حذف شد (generator است نه verifier)؛ verifier جدید `verify-parity-goldens-pinned` هش SHA-256 همهٔ طلایی‌ها + rects.json را با `goldens/checksums.json` پین‌شده مقایسه می‌کند. بازتولید عمدی: `npm run parity:goldens` ← diff ← `node scripts/verify-parity-goldens-pinned.mjs --update-pin`. شمار static-all همان ۷۱ ماند.
- Node: این ماشین 22.16.0 دارد (هدف H1: 22.18+). static-all برای Node<22.18 خودکار `--experimental-strip-types` می‌گذارد (verifierهای phase-a/b قرارداد .ts را مستقیم import می‌کنند؛ در 22.18+ بدون پرچم اجرا می‌شوند). **DEFERRED:** نصب Node ≥22.18 روی ماشین‌ها (کار مالک). `.nvmrc` = 22.
- **گیت:** ریپو git نداشت؛ baseline روی `main` کامیت و فازها روی شاخهٔ خودشان (کامیت محلی، بدون push).

**U5b (شاخهٔ `ui/u5b-question-wiring`):**
- **تعامل (D-001):** `StationFlow` برای E02/E04/E05 (`QUESTION_ENCOUNTER_IDS`) `QuestionView` را رندر می‌کند: لمس گزینه فقط انتخاب است، «بررسی» (`S.lesson.check`) همان `answerContent` قبلی را صدا می‌زند — مسیر `submitAttempt`، کلید idempotency و `attemptNumber` بایت‌به‌بایت همان است؛ گذار مرحله به `advanceAfterAnswer` منتقل شد که فقط اکشن برگهٔ بازخورد صدا می‌زندش. زنجیرهٔ بقیهٔ encounterها دست‌نخورده ماند (هر ۱۱ verifier وابسته به StationFlow سبز).
- **برگهٔ غلط (D-002):** `questionSheetAllowsRetry`: غلط با CONTINUE/STATION_PASS → «دوباره امتحان کن» (همان encounter، انتخاب پاک، submit بعدی با attemptNumber تازه)؛ RECOVERY/RECHECK → «ادامه» و `advanceAfterAnswer` مستقیم محتوای بازیابی/بررسی دوباره را باز می‌کند. پاسخ درست → «درست است!» + «ادامه» (E02 حالا مستقیم به بازی الگو می‌رود، نه صفحهٔ نتیجهٔ میانی — همان توالی محتوای قبلی).
- **متن‌ها (D-003/D-004):** `S.lesson.check/correctFeedback/retryFeedback`؛ محتوای محلی از «ستاره» به «مهره» و گزینه‌های E02 عددی شد (بررسی `wiring:bead-copy-in-local-content` قفل می‌کند؛ مهاجرت محتوای سرور DEFERRED).
- **تست جریان واقعی با سرور mock:** سناریوهای `play*` در harness حالا runtime از راه دور را با mock کوچکی از API یادگیری در لبهٔ شبکه اجرا می‌کنند (`flow/stubs/config-runtime.ts`): نصب‌ها، session، encounter (جدول محتوای معتبر) و `attempts/submit` با answer key و سیاست تصمیم (غلط اول → CONTINUE، غلط دوم → RECOVERY). همهٔ submitها در `__flow.submits` ثبت می‌شوند. `flow:station` ۲۵→**۳۹ بررسی**: انتخاب چیزی به سرور نمی‌فرستد؛ «بررسی» دقیقاً یک submit با attemptNumber=1؛ «دوباره» submit دوم با کلید idempotency متفاوت؛ گزینه‌ها هنگام برگه قفل‌اند؛ redirect سرور «ادامه» را نشان می‌دهد و به بازیابی می‌رود؛ بدون خطای runtime. stub سینک `flush` گرفت (اولین submit موفق harness بود).
- **verifier:** `verify-ui-v1-question` هشت بررسی wiring گرفت (رندر، مجموعهٔ encounterها، تفکیک submit/advance، پیروی از تصمیم سرور، رشته‌ها، مهره، دست‌نخوردگی runtimeApi).
- **اثبات‌نشده:** دستگاه واقعی (TTS/TalkBack/لمس)، سرور production (mock سیاست ساده‌شده دارد؛ سیاست واقعی `learning-runtime` است)، انیمیشن/صدا/هپتیک (الگوی الهام‌گرفته: بازخورد فوری کوتاه و آرام — فعلاً فقط متن و حالت بصری).

### 6.11) سؤال و بازخورد روی UI v1 — نمای خالص U5a (SNAP-20261024-01)
- **توکن‌ها** (از DOM صفحه‌های ۰۸ تا ۱۰، با سلکتورهای جدید `.opts/.opt.sel/.fbh/.fbi` در `parity-goldens.mjs`): گروه `ui.question` (فاصلهٔ گزینه‌ها ۱۲، لبهٔ گزینه ۶ و ۴ برای حالت گرم، کدرشدن ۰٫۵، پدینگ برگه ۲۴/۲۴/۳۲، فاصله ۱۶ و ۱۲، آیکون ۴۴ و ۲۶، پدینگ سینی بدون عدد ۲۴). از قبل بودند: `control.optionHeight/optionRadius`، `type.option/feedbackHeading`، `surface.sheetTopRadius`.
- **اجزا:** `OptionButton` (حالت‌ها `idle/selected/soft/dim`)، `FeedbackSheet` (`correct` = کانتینر اصلی و دکمهٔ primary؛ `soft` = کانتینر گرم و دکمهٔ amber؛ غلط هرگز قرمز نیست)، `BeadTray numbered={false}`، `station/views/QuestionView.tsx`.
- **parity:** `question` ۰٫۰۶٪، `correct` ۰٫۰۶٪، `retry` ۰٫۰۶٪ (سقف ۰٫۵).
- **gateها** (لاگ در `docs/archive/evidence/2026-10-24/`): typecheck هر ۹ workspace، vitest ۴۱۳/۴۱۳ (touchTargets ۲۱→۲۲ و uiText ۶۶→۶۹ چون فایل‌های جدید به فهرست اضافه شدند)، static ۷۱/۷۱ (+`verify-ui-v1-question`)، parity ۲۶/۲۶، flow ۲۸ و ۲۹ و ۲۵، web build، bundle واقعی Metro (Hermes ۴٫۶MB).
- **اثبات‌نشده:** اتصال به `StationFlow` انجام نشده (U-Q20 تا U-Q22)، پس تست جریان واقعی این صفحه‌ها وجود ندارد؛ رفتار گزینه/بررسی/برگه فقط ایستا و پیکسلی بررسی شده.

### 6.10) شروع مرحله و آموزش روی UI v1 (SNAP-20261023-01)
- **خط پایه:** قبل از هر تغییر، نصب، `build:packages`، ۹ typecheck، vitest ۴۰۶، static ۶۸، web build، parity ۲۰، دو flow (۲۸ و ۲۹) و bundle Metro (Hermes ۴٫۶MB) با اعداد §3 قبلی یکی بودند. Chromium با `PARITY_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- **توکن‌ها** (اندازه از DOM صفحه‌های ۰۶ و ۰۷ با `parity-goldens.mjs`، نه حدس): `ui.intro` (دیسک ۲۴۰، قهرمان ۲۲۰، نوار ۱۰×حداکثر ۲۶۰، فاصله‌دهندهٔ بالا ۴۸)، `ui.lesson` (فاصلهٔ بدنه ۲۴، تیتر ۱۶، سینی با فاصله ۲۰ و پدینگ ۳۲/۲۴/۱۶) و کلیدهای `ui.bead` (ارتفاع هایلایت ۲، رنگ، فاصلهٔ برچسب ۸).
- **اجزا:** `ui/v1/Bead.tsx` (`Bead`: گرادیان شعاعی ۳۵٪/۲۸٪، لبهٔ ۵ پیکسلی، هلال هایلایت؛ `BeadTray`: سینی ۲۴ شعاع)، `station/views/LessonChrome.tsx` (`LessonTopBar` ✕ + نوار ۱۶ پیکسلی، `LessonCaption` «برچسب · n از ۵»؛ برای U5 هم استفاده می‌شود)، `StageIntroView` (۰۶)، `TeachView` (۰۷)، `station/speech.ts` (پوشش `expo-speech`، `fa-IR`، هیچ‌وقت throw نمی‌کند).
- **اتصال:** `start.tsx` با همان منطق manifest/cache/prepare ولی روی `StageIntroView`؛ مرحلهٔ LEARN در `StationFlow` (نوار و برچسب از `macroFilled`/`macroLabel`، ادامه همان `beginEncounter(guided)`، ✕ همان `confirmExit`، قطع صدا هنگام ادامه و خروج).
- **parity:** `stage-intro` ۰٫۰۶٪، `lesson` ۰٫۰۴٪، `tray-07` ۰٫۰۲٪ (سقف‌ها ۰٫۵ و ۰٫۱۵). طلایی `06-fix` در `parity-goldens.mjs` ساخته می‌شود (U-Q14). بازتولید طلایی‌ها فقط `05.png` را دو بایت عوض کرد؛ parity ۰۵ همچنان ۰٫۰۰٪ است.
- **تست جریان واقعی** (`npm run flow:station`، ۲۵ بررسی، ۵ سناریو): ۰۶ با دادهٔ واقعی ایستگاه، نوار ۱۰×۲۶۰، شروع/بستن/برگشت، دانلودنشده→آماده‌سازی→شروع، خطا (دکمه غیرفعال)؛ ۰۷ با نوار ۱۶ پیکسلی و ۲۰٪ پر، سه مهره، «دوباره بشنو» (متن، `fa-IR`، شروع مجدد با stop)، ✕ با تأیید، ادامه به مرحلهٔ بعد و قطع صدا. harness: `parity-build.mjs` با `FLOW_STATION=1` فقط لبه‌های بومی/شبکه را stub می‌کند (`config/runtime`، auth، sync، `ContentManager`، `expo-speech`، reanimated، rive) و `appStateCore` و runtime محلی واقعی می‌مانند.
- **گاردها:** `verify-phase-a-grade-experience` روی «پیشنهاد جلسه» در `start.tsx` رد شد؛ استثنای شفاف و قفل‌شده (`station-waivers.mjs`، U-Q15) به‌جای ضعیف‌کردن بی‌دلیل. `verify-ui-v1-station` (توکن‌های اندازه‌گیری‌شده، خالص‌بودن نماها، نبود رنگ/ستاره/جان/streak، اتصال کانتینرها، آداپتر صوت، نبود پخش خودکار، parity، فهرست استثنا، اسکریپت‌ها) اضافه شد.
- **اثبات‌نشده:** دستگاه/شبیه‌ساز اندروید (TTS فارسی، TalkBack، `accessibilityValue` که react-native-web به DOM نمی‌رساند)؛ مسیر REMOTE (محتوای authoritative سرور و `visualCount` از سرور) در مرورگر اجرا نشد (harness بدون API base روی محتوای محلی است)؛ مرحله‌های بعد از LEARN و انیمیشن‌های قدیمی (reanimated/rive در harness stub هستند)؛ رندر `Bead` روی Hermes/اندروید فقط از طریق bundle ساخته شد نه اجرا.

### 6.9) مسیر روی UI v1 (SNAP-20261018-01)
- **کشف مهم:** پوشهٔ `src/path/*` (`PathView`، `PathNode`، `NodeFace`، `ChapterBand`، `GoBubble`، `layout.ts` + تست، `chapterTheme.ts`) و تغییرهای `TabBar`/`Portrait`/`icons`/`useReduceMotion` از یک چت قبلی (بعد از ZIP مرحلهٔ U2) وجود داشت و در START_HERE ثبت نشده بود. کار از همان نقطه ادامه یافت. توکن‌های `ui.path` که من بی‌خبر بازنویسی کرده بودم از روی مصرف‌کننده‌ها بازسازی و با مقدارهای دقیق CSS و اندازه‌گیری DOM اصلاح شد؛ نسخهٔ تکراری هندسهٔ خودم حذف شد.
- **اندازه‌گیری از DOM صفحهٔ طرح** (به‌جای حدس): نوار آمار ۶۲، چیپ پایه ۴۴، پرتره راهنما ۹۴، تب‌بار ۱۰۶ با دایرهٔ ۶۸×۴۴ (صفحه `content-box` است). پیش از اصلاح، مقایسهٔ کل صفحه ۲٫۶۶٪ بود؛ بعد از آن ۰٫۰۸٪.
- **باگ رندر واقعی:** آیکون‌های داخل گره‌ها در وب زیر وجه (`absoluteFill`) نقاشی می‌شدند چون `<svg>` استاتیک است؛ آیکون در `View` پیچیده شد.
- **مقایسهٔ پیکسلی:** صفحهٔ ۰۵ در بالا (۰٫۰۸٪) و در چهار موقعیت اسکرول ۹۰۰، ۱۸۰۰، ۲۷۰۰، ۳۶۰۰ (همه ۰٫۰۰٪؛ تم فصل‌های ۲ تا ۵، جداکننده‌ها، گنج‌ها، دکمهٔ پرش) و تب‌بار مسیر (۰٫۰۰٪). تصاویر مرجع اسکرول با خود اسکریپت صفحه ساخته می‌شوند (`parity-goldens.mjs`).
- **هندسه:** `scripts/gen-path-fixture.mjs` الگوریتم خود صفحه را اجرا و فیکسچر می‌سازد (`__fixtures__/design-trail.json`)؛ مدل و هندسه با دادهٔ واقعی G1 تست شدند (پنج فصل × پنج ایستگاه، یک گرهٔ جاری، پرش، حالت‌های دانلود نشده).
- **`pathModel.ts`:** نگاشت وضعیت قرارداد به گره‌ها (`COMPLETED→done`، تمرکز→`cur`، `NOT_DOWNLOADED→download`، قفل→`lock`)، برچسب و راهنمای دسترسی‌پذیری هر گره از `PATH_NODE_LABELS` و `PATH_NODE_STATUS_HINT`، قاعدهٔ پیشنهاد پرش (همان قاعدهٔ قبلی)، حلقهٔ پیشرفت از مرحلهٔ ادامهٔ ایستگاه.
- **تست جریان واقعی صفحهٔ مسیر** (`npm run flow:path`، ۲۹ بررسی، ۴ سناریو): شروع تازه، میانهٔ مسیر با resume، پیشنهاد پرش، آفلاین؛ شامل باز شدن ایستگاه، اعلان قفل، اسکرول و تغییر نوار فصل، دکمهٔ پرش به مرحلهٔ فعلی. اعلان قفل بریده می‌شد؛ حباب عریض‌تر شد (حباب «ادامه» بدون تغییر).
- **گاردهای واقعی:** `touchTargets.test.ts` چهار `Pressable` را رد کرد؛ ارتفاع‌ها روی خودشان اعلام شد (ناحیهٔ لمس چیپ پایه ۴۸) و محافظ فقط resolver برای مسیر توکن تو در تو گرفت (آستانه ۴۸ بدون تغییر). ده verifier مسیر قدیمی رد شدند: پنج مورد با جابه‌جایی کد (جست‌وجو به `layout.ts`/`pathModel.ts`/`TabBar.tsx` منتقل شد؛ قصد حفظ شد) و پنج مورد با **استثنای شفاف و قفل‌شده** (`path-waivers.mjs`؛ ویژگی‌هایی که طرح ندارد؛ منطق دامنه همچنان verify می‌شود).
- **تب‌ها:** `(tabs)/_layout.tsx` با `ChildTabBar` (آداپتور expo-router → `TabBar` v1، نوع props از `Tabs` استخراج شد؛ `@react-navigation` جدا نصب نیست).
- **verifier:** `verify-ui-v1-path` (توکن‌های اندازه‌گیری‌شده، ساختار صفحه، فهرست استثناها و بقای کد دامنه). static-all ۶۵ → ۶۸.
- **اثبات‌نشده:** دستگاه/شبیه‌ساز اندروید (اسکرول و عملکرد ۳۰ ردیف SVG، حرکت حباب با «کاهش حرکت»، TalkBack)؛ `useGradeExperience` اکنون فقط توسط verifier استفاده می‌شود (قانون D5: بدون تغییر gate حذف نشود).

### 6.8) ورود روی UI v1 (SNAP-20261014-07)
- **نماهای واقعی:** `src/onboarding/views/` شامل `WelcomeView`، `PhoneView`، `CodeView`، `ProfileView` و `StepBar`؛ هم اپ و هم ابزار مقایسه همین نماها را رندر می‌کنند. مقایسهٔ پیکسلی با صفحه‌های ۰۱ تا ۰۴: welcome 0.12٪، phone 0.07٪، code 0.23٪، profile 0.18٪ (سقف ۰٫۵٪).
- **کامپوننت‌های جدید:** `TextButton`، `Tile`، `GradeCell`، `CodeInput` (TextInput شفاف با `oneTimeCode`/`sms-otp` + شش خانه)، `IconBadge`؛ `Body` اسکرول‌پذیر برای گوشی‌های کوچک؛ حالت‌های مشتق‌شده: خطای فیلد و کد، `loading` دکمه، بازخورد فشردن کاشی‌ها.
- **`onboarding.tsx`:** ۶۹۱ → ۳۸۶ خط؛ منطق (state، effectها، handlerها) نگه داشته شد. مرحلهٔ پایه ادغام صفحهٔ پروفایل شد؛ نوار پیشرفت «x از ۶» (۳۳٪، ۵۰٪، ۶۷٪ مطابق طرح)؛ سه مرحلهٔ بی‌طرح با نوار بالای جدید و Main.
- **تست جریان واقعی** (`npm run flow:onboarding`، ۲۸ بررسی در دو سناریو): خود صفحه در مرورگر با stubهای ثبت‌کنندهٔ router و شبکه اجرا و کلیک و تایپ می‌شود: ورود تا ذخیره و رفتن به تب‌ها، کد نادرست، برگشت، تغییر شماره، رد کردن تعیین سطح، ثبت `consentAt`.
- **باگ قدیمی واقعی که فقط این تست گرفت:** `placementIndex` از `-1` شروع می‌شد و `continueChild` هم آن را `-1` می‌گذاشت؛ بعد از صفحهٔ پروفایل مرحلهٔ تعیین سطح یک صفحهٔ خالی بدون راه جلو بود. اکنون از سؤال اول شروع می‌شود و verifier جدید جلوی بازگشتش را می‌گیرد.
- **تغییرهای رفتاری عمدی (طبق طرح):** قالب شماره روی صفحهٔ کد `۰۹۱۲***۶۷۸۹` (قبلاً `۰۹۱۲ ••• •۵۶۷`؛ تست `phone.test.ts` همراه تابع تغییر کرد)؛ رنگ پیش‌تنظیم آواتارها در قرارداد مشترک؛ رادیوها `checked` گزارش می‌کنند (نه `selected`)؛ فیلدها `outlineWidth: 0`.
- **حذف:** `authComponents.tsx` (`PhoneInput` و `OtpBoxes`؛ بدون هیچ کاربر). شخصیت‌های قدیمی (`aria`/`jiko`) از این جریان خارج شدند.
- **verifier:** `verify-ui-v1-onboarding` (استاتیک ۶۳ → ۶۵ با اسکریپت `flow-run`).
- **اثبات‌نشده:** اجرا روی دستگاه یا شبیه‌ساز اندروید (جابه‌جایی کیبورد روی صفحهٔ پروفایل، autofill پیامک، معنای TalkBack رادیوها: react-native-web `accessibilityState` را به DOM نمی‌رساند)؛ `CharacterAvatar`، `CharacterSays`، `ChildAvatar` هنوز در `StationFlow`، `avatar.tsx` و تب پروفایل استفاده می‌شوند و در U4 تا U7 جایگزین می‌شوند.

### 6.7) زیربنای UI v1 (SNAP-20261014-06)
- **وابستگی‌ها** (نسخهٔ SDK 57 مطابق `bundledNativeModules`): `react-native-svg@15.15.4`، `expo-linear-gradient@~57.0.2`، `expo-speech@~57.0.3`؛ فقط برای ابزار مقایسه (devDependencies): `react-native-web@~0.21.0`، `react-dom@19.2.3`؛ ابزار تصویر: `pixelmatch`، `pngjs`.
- **توکن‌ها** (`packages/design-system/src/tokens.json`، نسخهٔ 2.0.0): همان ساختار قدیمی با مقدارهای پالت ADR-0035 (خانوادهٔ teal/emerald → primary، coral → error، success → primary طبق طرح) به‌علاوهٔ گروه `ui` با مقدارهای دقیق CSS صفحه‌ها. CSS وب بازتولید شد و `next build` سبز است. صفحه‌های قدیمی موبایل و وب خودکار رنگ جدید گرفتند. کنتراست همهٔ جفت‌رنگ‌های متنی ≥ 4.5 است (استثنا: متن «قفل» ۳٫۶۹ که طرح مشخص کرده و عنصر غیرفعال است).
- **قفل پالت** (`verify-uiux-path2`، `verify-uiux-phase3`، `verify-mobile-release`) روی مقادیر ADR-0035 به‌روز شد؛ قصد قفل حفظ شد. پس‌زمینهٔ splash و آیکون `#FBFCF9` → `#F5F7F8`.
- **فونت:** فقط Vazirmatn ۴۰۰ و ۶۰۰ لود می‌شود؛ `FONT.bold` و `FONT.black` برای سه جای قدیمی نام مستعار ۶۰۰ شدند.
- **کامپوننت‌ها** (`apps/mobile/src/ui/v1/`، مستند در README همان پوشه): `Button` (amber/primary/secondary/disabled/compact)، `IconButton`، `TopBar`، `ProgressBar`، `Card`، `Chip`، `TextField`، `GuideBubble`، `Portrait`، `Character`، `TabBar`، `Screen/Body/Foot/H1/Sub/Cap/Note`، `Icon` (۲۳ آیکون استخراج‌شده از SVG طرح‌ها) و `EdgeBox` برای لبهٔ ۳بعدی. فقط ویژگی‌های منطقی (`start/end`)؛ هیچ رنگ مستقیمی در کامپوننت‌ها نیست (verifier قفل می‌کند).
- **دارایی‌های شخصیت:** ۹ تصویر در `apps/mobile/assets/characters-v1/` با نام معنایی و `PROVENANCE.json`. شخصیت‌ها از `_app_800` اصلی بریده‌شده تا کادر آلفا (همان برش طرح؛ نسبت ابعاد با تصویر طرح تا ۰٫۳٪ یکی است)؛ Dana و Fandogh همان برش ۳۲۰ پیکسلی طرح.
- **ابزار مقایسهٔ پیکسلی:** `npm run parity:goldens` (۱۴ تصویر مرجع ۳۹۰×۸۴۴ + مختصات المان‌ها در `pages-v1/goldens/`) و `npm run parity` (رندر هر نمونه با react-native-web و مقایسهٔ ناحیه‌ای با pixelmatch). ۱۲ نمونه: welcome 0.12٪، phone 0.02٪، portrait-04 0.10٪ و بقیه 0.00٪؛ سقف مجاز ۰٫۱۵ تا ۰٫۵٪. این گیت Chromium می‌خواهد (`PARITY_CHROMIUM_PATH` اگر نسخهٔ Playwright پیش‌فرض نصب نیست).
- **یافته‌های طرح (عمداً بازتولید شد):** دکمه مطابق CSS صفحه‌ها ۵۸ با لبهٔ ۶ است نه ۵۶/۴ متن راهنما؛ `button` مرورگر `line-height: normal` دارد (متن ۱۶ پیکسلی ارتفاع ۲۵)؛ پرتره عرض‌به‌عرض دایره و لنگر بالا است (سر و شانه دیده می‌شود)؛ ارتفاع آیتم تب ۶۲ است (۸۴ منهای بوردر و پدینگ).
- **گاردهای گرفته‌شده در همین فاز:** (۱) `touchTargets.test.ts` سه کامپوننت جدید را رد کرد؛ ارتفاع روی خود `Pressable` اعلام شد و تست فقط یک resolver برای `UI.group.key` گرفت (آستانهٔ ۴۸ بدون تغییر). (۲) ابزار پیکسلی یک پسرفت واقعی (توکن `tabItemHeight` اشتباه ۶۴ به‌جای ۶۲؛ تب‌بار ۰٫۷۰٪) را گرفت و رفع شد.
- **verifier:** `verify-ui-v1-foundation` (وابستگی‌ها، فونت‌ها، توکن‌ها، قوانین کامپوننت، دارایی‌ها و سازگاری manifest مقایسه). static-all از ۵۹ به ۶۳ رسید (+ verifier جدید و سه اسکریپت ابزار که در syntax-check شمرده می‌شوند).
- **باقی‌مانده و اثبات‌نشده:** bundle واقعی Metro و اجرای روی دستگاه (v1 هنوز در هیچ صفحه‌ای import نشده)؛ رنگ‌های قدیمی `#F59E0B` در `contracts/onboarding.ts` و سه جای وب (`persian.ts`، `WonderGrid`، `ComparisonScale`)؛ آیکون اپ و splash هنوز طرح قدیمی برند هستند؛ انحراف‌های قدیمی از SDK (`react-native` 0.86.0 به‌جای 0.86.3، `expo-router` ~57.0.22 به‌جای ~57.0.24، `@expo/vector-icons`، `expo-font`) که با `npx expo install --fix` و تأیید جدا بسته می‌شود.

### 6.6) مرجع UI v1 و ADR-0035 (SNAP-20261014-05)
- ۱۵ صفحهٔ ارسالی بررسی و بازتولید شد. نسخهٔ `00-all-pages-original-bundle` با ۱۵ صفحهٔ جداگانه یکسان است (۱۵/۱۵).
- مسیر v1 از `05-path-NEW` ساخته شد: ۳ مورد نوار آمار (streak، ستاره، جان)، ۳ ستاره روی گره‌های کامل، ثابت `STAR` و CSS مربوط حذف شد؛ شمارش‌ها با انتظار برابر بودند. گرهٔ جاری کتاب شد. بدون خطای runtime؛ تفاوت پیکسلی فقط در نوار بالا و ردیف گره‌ها است (۲۲۹۰ پیکسل).
- نقشهٔ شخصیت‌ها با تطابق محتوای تصویر: ۷ تصویر با فاصلهٔ ۰٫۳ تا ۱٫۵ (تطابق قطعی)؛ Dana در مسیر و Fandogh در تمرین با بررسی بصری تأیید شدند.
- توکن‌های رنگ (۲۱ مورد) از `:root` راهنما استخراج و در manifest ثبت شدند.
- آمادگی U1: `npm install --dry-run` برای پکیج‌های بالا در `@math/mobile` بدون خطای peer انجام شد (۴۳ بسته اضافه می‌شود؛ هیچ فایلی تغییر نکرد). Expo ~57.0.24، React Native 0.86.0، React 19.2.3.
- ADR-0035 نوشته شد؛ CHARACTER-BIBLE-v2 یادداشت جایگزینی گرفت؛ `verify-ui-v1-scope` اضافه شد (استاتیک ۵۹/۵۹).

### 6.5) حذف کد مرده و یکسان‌سازی (SNAP-20261014-04)
- **حذف شد:** `apps/web/lib/learningEngine.ts` و `apps/web/lib/offlineSync.ts` (هیچ importی یا ارجاعی نداشتند)؛ `apps/mobile/src/sync/index.ts` و `apps/mobile/src/content/index.ts` (barrelهای بی‌مصرف؛ همهٔ importها به فایل‌های داخلی می‌روند)؛ پکیج `packages/api-client` (بدون مصرف‌کننده؛ aliasها، `transpilePackages` و لینک lockfile هم حذف شدند).
- **یکسان‌سازی:** توابع اعداد فارسی سه پیاده‌سازی داشتند (`apps/web/lib/persian.ts`، `apps/mobile/src/ui/digits.ts` و یک `toFa` محلی در `PracticeHubScreen.tsx`). حالا یک پیاده‌سازی در `packages/design-system/src/digits.ts` است و بقیه re-export یا alias هستند. تنها تفاوت رفتاری: در مسیر نمایش وب، ارقام عربی‌هندی هم به فارسی تبدیل می‌شوند (قبلاً فقط در موبایل).
- **یادداشت تصحیح:** در بررسی قبلی گفته شد توکن‌ها در چهار جا تعریف شده‌اند؛ بررسی دقیق‌تر نشان داد تعریف توکن‌ها یک منبع دارد (`tokens.json`) و بقیه مشتق‌اند. آیکون‌ها و تصاویر شخصیت هم با `export-png.py` و `build-all.mjs` تولید می‌شوند و کپی دستی نیستند.
- **نگه داشته شد با دلیل:** موارد gate-bound، فقط‌تست و تصمیم‌های O-7 تا O-9 (بالا در §4 و D4 در §5). فایل‌های پیکربندی (`babel.config.js`، `metro.config.js`، `withForceRtl.js`، `next.config.ts`) بارگذاری توسط ابزار می‌شوند و کد مرده نیستند.
- **تست:** `packages/design-system/src/digits.test.ts` اضافه شد و مسیرش به vitest اضافه شد. نتیجه: ۴۹ فایل / ۳۳۵ تست (قبلاً ۴۸ / ۳۲۷).
- **گیت‌ها:** `build:packages` exit 0؛ `typecheck:all` و موبایل exit 0؛ `verify-static-all` ۵۸/۵۸؛ `vitest run` ۳۳۵/۳۳۵؛ `next build` exit 0.

### 6.4) فاز ۳: حذف لایهٔ `src/` (SNAP-20261014-03)
- محتوای `src/` به ریشهٔ ریپو منتقل شد (شامل فایل‌های پنهان، `node_modules` و لینک‌های workspace که نسبی ماندند). ریشه اکنون همان ریشهٔ پروژه است و `ROADMAP_PHASES.md` و `README.md` کنار `START_HERE.md` هستند.
- verifierها و تست‌ها مسیرها را نسبت به محل خودشان می‌خوانند، پس نیازی به تغییر نبود. فقط ارجاع‌های زندهٔ مستندات به‌روز شد (`work/src` و پیشوند `src/` در بخش‌های زنده).
- گیت‌ها بعد از جابه‌جایی: `build:packages` exit 0؛ typecheck همه و موبایل exit 0؛ `vitest run` ۴۸ فایل / ۳۲۷ تست؛ `verify-static-all` ۵۸/۵۸؛ `next build` exit 0.

### 6.3) سازمان‌دهی ساختار، فازهای ۰ تا ۲ (SNAP-20261014-02)
- **فاز ۰:** `.gitignore`، `.editorconfig` و `.nvmrc` (نسخهٔ ۲۰، هم‌راستا با `engines`) اضافه شد. `src/app.json` و `src/eas.json` حذف شدند؛ کد فقط `apps/mobile/app.json` و `apps/mobile/eas.json` را می‌خواند و نسخه‌های ریشه یتیم بودند.
- **فاز ۱:** `docs/evidence-2026-10-07` و `docs/evidence-2026-10-09` به `docs/archive/evidence/` منتقل شدند (صفر ارجاع در کد). `docs/history` عمداً جابه‌جا نشد: سه verifier (`phase5`، `phase9`، `phase10`) مسیرهایش را با نام می‌خوانند؛ به فاز ۶ موکول شد.
- **فاز ۲:** ADRها به الگوی `ADR-NNNN-slug.md` رسیدند (چهار فایل `ADR_000N_*`). ارجاع‌ها در `verify-phase2/4/5`، ROADMAP و START_HERE به‌روز شد؛ guardها فقط مسیر را عوض کردند و قصدشان حفظ شد. `docs/source` عمداً تغییر نکرد: نام‌هایش در migrationهای `0017` و `0035` به‌عنوان داده ذخیره شده و تغییرشان نیازمند migration جدید است.

### 6.2) ایمپورت بستهٔ Figma (۲۰۲۶-۱۰-۱۴)
- بستهٔ `figma-handoff` بدون تغییر در `src/docs/design-handoff-2026-10/` قرار گرفت (۱۵۵ فایل، ۶٫۰ MB؛ diff با zip مبدأ: یکسان). هیچ کد، asset، token یا package اپ تغییر نکرد. evidence: `verify-static-all` بعد از ایمپورت ۵۸/۵۸ PASS.

### 6.1) اصلاحات ۲۰۲۶-۱۰-۰۹ (SNAP-20261009-01) — بازتولید + رفع

بازتولیدشده با اجرا قبل از اصلاح، و حالا با تست دائمی قفل شده‌اند:
- **Persistence (بحرانی):** repository برای assignment و adult-projections فقط `InMemory…` است؛ پرچم‌های `MATH_*_REPO=supabase-rest-v1` فقط gate متنی بودند. حالا production fail-closed است (`*_BACKEND_NOT_CONFIGURED`) مگر `ALLOW_EPHEMERAL_ADULT_STORE=1` (فقط دموی staging). **repository واقعی Supabase هنوز ساخته نشده → OPEN.**
- **A1/A5/صف آفلاین/batch/OTP/معلم:** طبق ردیف‌های A1–A8 بالا.
- `sync/batch`: عملیات `EVENT_INGEST`/`SESSION_RESUME` دیگر ACK دروغ نمی‌شوند (REJECTED `SYNC_OPERATION_NOT_IMPLEMENTED`؛ هیچ کلاینتی آن‌ها را enqueue نمی‌کند)؛ مسیر dev هویت را از principal می‌گیرد نه از payload.
- route قدیمی `GET/POST /api/v1/sync` (in-memory، بدون caller، ستاره از کلاینت) حذف شد.
- یافتهٔ تازه: `apps/mobile/app/parent.tsx` ۲۸ مقدار `'DS.color…'` به‌صورت رشتهٔ literal داشت (رنگ نامعتبر) → اصلاح + تست `noQuotedTokens.test.ts`.
- یافتهٔ تازه: `apiErrorStatus` فقط `error.message` را می‌خواند؛ خطاهای تایپ‌شده (`AssignmentRuntimeError`، `ChallengeRuntimeError`) اشتباه 400 می‌شدند. `ChallengeRuntimeError.message` حالا با کد شروع می‌شود.
- D6/O-3: تأیید حذف داده = تایپ کلمهٔ «حذف» در Modal (بدون ParentGate).
- verifierها (طبق D5 فقط با evidence، بدون تضعیف قصد): `verify-phase2-foundation.mjs` و `verify-phase7.mjs`.

**تصمیم‌های این snapshot (به §4 اضافه شود):** completion فقط server-authoritative؛ recheck از COMPLETED مجاز (قصد معلم)؛ سقف سن صف آفلاین ۱۴ روز؛ مقادیر limiter بالا؛ ۴۰۳ نیز transient در صف است.

**عمداً دست‌نخورده / مانده:** `EAS_NO_FROZEN_LOCKFILE` در `apps/mobile/eas.json` (بدون build واقعی EAS قابل تأیید نیست)؛ D1 کنتراست (تغییر token → بازتولید CSS و بررسی دو پلتفرم)؛ D4 (`SemanticAnimationDemo` را `verify-phase4.mjs` اجباری می‌داند؛ Rive برای P12 مبهم)؛ والد با چند فرزند هنوز 404 `MULTIPLE_CHILDREN_UNSUPPORTED_IN_V1_SCREEN` می‌گیرد (تصمیم محصولی)؛ `RevealPrimitives.test.tsx` اجرا نمی‌شود؛ CSP؛ A2 مرکزی؛ تکمیل A6؛ A9.

## 7) UX Ledger (پر کن هنگام D0)

| Screen/route | مشکل | شدت | وضعیت | evidence |
|---|---|---|---|---|
| (هنوز بررسی نشده) | | | | |

---

## 8) یادداشت‌های ledger roadmap (هنوز در ROADMAP_PHASES.md نوشته نشده)

- **VD-003**: install و lockfile انجام شد؛ `verify:p02:full` هنوز نه → `PARTIAL`.
- **VD-007** (drift verifierها): `static-all` 58/58 با guardهای رفتاری؛ کاندید بستن بعد از تأیید مالک.
- بقیهٔ VD-001/002/004/005/006/008…018 دست‌نخورده `OPEN` (live/device/child/educational).

## 9) Phase 4 (فعلاً انجام نده)

محتوای آموزشی P10 و بازبینی کیفیتش · live Supabase (migrations 0001–0073، Auth، RLS مثبت/منفی، RPC smoke؛ `B0_STAGING_APPLY_CHECKLIST.md`) · تست کامل Android (TalkBack، large text، reduced motion، RTL) · offline/reconnect و انقضای توکن روی دستگاه · child/educational review · preview APK و production AAB (`ANDROID_STORE_RELEASE_CHECKLIST.md`) · clean install/upgrade · Google Play Families، privacy، data safety · pilot، monitoring، rollback · بستن همهٔ VD-ها با evidence واقعی · ارتقای Expo و بازبینی audit (D8).

## 10) پروتکل به‌روزرسانی این فایل (پایان هر چت)

1. `last_updated`، `snapshot_id` (SNAP-YYYYMMDD-NN)، `current_stage` و `file_version` (+1) را به‌روز کن.
2. جدول §3 را با اجرای **واقعی** بازنویسی کن (اعداد را حدس نزن). لاگ‌های جدید را در `docs/archive/evidence/<تاریخ>/` بگذار (فقط لاگ، بدون md).
3. هر task انجام‌شده: وضعیت → `DONE`، یک خط evidence در §6، و در صورت لزوم تصمیم جدید در §4. task ناقص → `PARTIAL` + دقیقاً چه مانده.
4. یافتهٔ جدید → task با ID بعدی در stage مناسب، با شواهد و «اول تأیید کن».
5. یک سطر به §11 اضافه کن. فایل md جدید نساز (مگر contract/مرجع واقعی).
6. بعد از حذف/تغییر هر md یا فایل، `node scripts/verify-static-all.mjs` را اجرا کن.
7. ZIP کامل بساز بدون `node_modules`، `.next`، `dist`، `.env*`، `*.tsbuildinfo`.

## 11) Changelog (فقط اضافه کن؛ مختصر)

| تاریخ | snapshot | خلاصه |
|---|---|---|
| 2026-10-06 | — | برنامهٔ ۴ فاز؛ handoffهای قدیمی |
| 2026-10-07 | SNAP-20261007-01 | baseline + اصلاح typecheck/build/امنیت اولیه/touch-target (جزئیات §6) |
| 2026-10-07 | SNAP-20261007-02 | بازبینی عمیق دوم: یافته‌های A1،A3–A7، D1–D2 و غیره؛ ادغام md-ها در این فایل؛ gateها بعد از حذف md: static 58/58، vitest 282/282 |
| 2026-10-09 | SNAP-20261009-01 | بازتولید باگ‌ها با اجرا؛ اصلاح A1/A5/A8 و بخش‌های A2–A4/A6/A7؛ gate persistence fail-closed؛ صف آفلاین بدون حذف تلاش؛ tokenهای quoted در parent.tsx؛ vitest 327/327، static 58/58 |
| 2026-10-14 | SNAP-20261014-01 | ایمپورت بستهٔ Figma در `src/docs/design-handoff-2026-10/` (بدون تغییر محتوا، بدون اتصال به کد)؛ تناقض‌های cast، پالت و بستهٔ ناقص به‌صورت O-4 تا O-6 ثبت شد؛ static 58/58 |
| 2026-10-14 | SNAP-20261014-02 | سازمان‌دهی فاز ۰–۲: `.gitignore`/`.editorconfig`/`.nvmrc`؛ حذف `app.json`/`eas.json` یتیم ریشه؛ archive شدن evidence؛ نام‌گذاری ADR؛ همهٔ gateها سبز (§3) |
| 2026-10-14 | SNAP-20261014-03 | فاز ۳: حذف لایهٔ `src/`، ریشهٔ ریپو = ریشهٔ پروژه؛ ارجاع‌های زندهٔ مستندات بدون پیشوند `src/`؛ ردیف‌های قبلی همچنان مسیرهای قدیمی را نشان می‌دهند |
| 2026-10-14 | SNAP-20261014-04 | فاز ۴: حذف کد مرده (دو فایل وب، دو barrel موبایل، پکیج `api-client`)؛ یکسان‌سازی توابع اعداد فارسی در `design-system`؛ D4 جزئی؛ تصمیم‌های O-7 تا O-9؛ ۳۳۵/۳۳۵ تست، static 58/58 |
| 2026-10-14 | SNAP-20261014-05 | U0: مرجع UI v1 در `pages-v1` (۱۴ صفحه + راهنما)، ADR-0035، نسخهٔ v1 مسیر بدون streak/ستاره/جان، verifier جدید (استاتیک ۵۹)، O-4 و O-5 بسته شد |
| 2026-10-14 | SNAP-20261014-06 | U1: توکن‌های ADR-0035 (2.0.0)، فونت ۴۰۰/۶۰۰، ۱۴ کامپوننت v1 + ۲۳ آیکون + ۹ تصویر شخصیت، ابزار مقایسهٔ پیکسلی (۱۲ نمونه، همه زیر ۰٫۱۲٪)، verifier جدید؛ ۳۵۹/۳۵۹ تست، static 63/63 |
| 2026-10-14 | SNAP-20261014-07 | U2: ورود روی UI v1 (۴ نما، ۵ کامپوننت جدید، تست جریان واقعی ۲۸ بررسی)؛ رفع باگ صفحهٔ خالی تعیین سطح؛ قالب ماسک شماره طبق طرح؛ bundle واقعی Metro موفق؛ ۳۷۸/۳۷۸ تست، static 65/65، parity 14/14 |
| 2026-10-18 | SNAP-20261018-01 | U3: مسیر روی UI v1 (ادامهٔ کار چت قبلی `src/path/*`)، `pathModel` + تست جریان واقعی ۲۹ بررسی، parity ۲۰ نمونه شامل چهار موقعیت اسکرول، تب‌بار طرح، پنج استثنای شفاف verifier، تصمیم‌های U-Q8 تا U-Q13؛ ۴۰۶/۴۰۶ تست، static 68/68، bundle واقعی Metro موفق |
| 2026-10-23 | SNAP-20261023-01 | U4: شروع مرحله ۰۶ و بخش اول آموزش ۰۷ روی UI v1 با «دوباره بشنو» (TTS)، `Bead`/`BeadTray`، `LessonChrome`، تست جریان واقعی ۲۵ بررسی (`flow:station`)، parity ۲۳ نمونه، استثنای شفاف `station-start-session-hint`، `verify-ui-v1-station`، سؤال‌های U-Q14 تا U-Q19؛ ۴۰۹/۴۰۹ تست، static 70/70، bundle واقعی Metro موفق |
| 2026-10-24 | SNAP-20261024-01 | U5a: نمای خالص سؤال و بازخورد ۰۸ تا ۱۰ (`QuestionView`، `OptionButton`، `FeedbackSheet`)، parity ۲۶ نمونه، `verify-ui-v1-question`، سؤال‌های U-Q20 تا U-Q22 برای اتصال (U5b)؛ ۴۱۳/۴۱۳ تست، static 71/71، bundle واقعی Metro موفق |
| 2026-10-25 | SNAP-20261025-01 | U8: بستن Stage U — تب‌بار outlined یکتا (حذف soft طبق D-011)، صفحهٔ ۱۵ = راهنما نه اپ؛ parity ۲۹/۲۹، static ۷۴/۷۴، همهٔ flowها سبز؛ فهرست کامل DEFERRED در §6.15 |
| 2026-10-25 | SNAP-20261025-02 | P0: بستن بازبینی مستقل (ACCEPT WITH FIXES) — R-1 ignore خروجی بیلد، R-2 استثنای پین‌شدهٔ تب‌بار D-011، بررسی قرارداد D-002 (ارسال دوباره مجاز، بدون D-016)، R-3 تابع خالص ردیف‌های تمرین + ۵ تست؛ ff-merge به main + تگ v1-candidate-ui |
| 2026-10-25 | SNAP-20261025-03 | P1: ابزار — Node 22.18 در .nvmrc/engines (نصب روی ماشین = بلاکِر مالک)، back سخت‌افزاری با stub واقعی (flow:station ۵۰)، اسکن امنیتی باندل صفر، app.json/eas پاک، PS 5.1 اثبات/PS7 غایب، DESIGN_INSPIRATION + DEVICE_TEST_CHECKLIST (پیش‌نویس) + GATE_RUN_ORDER |
| 2026-10-24 | SNAP-20261024-05 | U7: تب تمرین (۱۳) و من (۱۴) روی UI v1 با ListRow/PracticeView/MeView؛ ردیف‌های قراردادی حفظ و پنج استثنای tabs-waivers؛ رفع شمارش practiceListLimit؛ parity ۳۰/۳۰ (body)، flow:tabs ۱۴/۱۴، static ۷۴/۷۴، vitest ۴۲۰/۴۲۰ |
| 2026-10-24 | SNAP-20261024-04 | U6: صفحهٔ ۱۱ (جشن پایان مرحله با کانفتی/دستاورد/۱از۵) و ۱۲ (مقدمهٔ چالش با روکا) روی UI v1؛ `Confetti`/`AchievementRow`/`StageResultView`/`ChallengeIntroView`؛ رفع دو باگ پنهان (کرش کروم چالش، کارت کهنه)؛ parity ۲۸/۲۸، flow:station ۴۸/۴۸، static ۷۲/۷۲، vitest ۴۱۷/۴۱۷، D-015 |
| 2026-10-24 | SNAP-20261024-03 | H1: قابلیت حمل ویندوز (کروم، file-URL، جداکننده‌ها، dynamic import، build وب)، golden immutability (پین SHA-256 + verifier، parity:goldens فقط عمدی)، git local. U5b: اتصال QuestionView به StationFlow با D-001 تا D-003 (بررسی یک‌تایی، برگه دنبال تصمیم سرور، متن عمومی، مهره در محتوای محلی)، سرور mock یادگیری در harness، flow:station ۳۹/۳۹؛ static ۷۱/۷۱، vitest ۴۱۳/۴۱۳، parity ۲۶/۲۶ |
| 2026-10-24 | SNAP-20261024-02 | بستهٔ تحویل: `AGENTS.md`، `docs/handoff/PROMPTS.md` (پرامپت‌های بازنگری و فاز)، `.gitattributes`، `.github` (CI و قالب PR)، اسکریپت `typecheck:all`، اصلاح README؛ ممیزی clone تمیز: `npm ci` ۶۴۹ بسته، build:packages، ۹ typecheck، vitest 413/413، static 71/71 |

## 12) Prompt آمادهٔ چت بعدی

```
ریپوی شمارا (same checkout). START_HERE.md را کامل بخوان (پروتکل §0) و AGENTS.md.binding. الان روی شاخهٔ chore/p1-toolchain هستیم (P0 و P1 تمام؛ main = ui/u8-closing با تگ v1-candidate-ui؛ بلاکِر مالک: نصب Node ≥22.18).

مأموریت فعلی (به ترتیب): P2 ماتریس حالت‌ها (docs/testing/STATE_MATRIX.md) و تست‌های جریانِ خانه‌های تست‌نشده + a11y/متن‌بزرگ/حرکت‌کم → P3 صدا/لرزش/جشن طبق بخش‌های ۲–۵ grade1/shomara-stage5-shared-references.md (فقط همین بخش‌ها؛ محتوای spec پیشنهاد است نه منبع تصمیم) → P4 خط محتوا (verify-content-spec.mjs با ۱۱ قاعدهٔ stage6 §5، DIN negative fixtures، آداپتر ST07 dev-pack پشت پرچم بیلد) → P5 بستن DEFERRED های UI → P6 مسدود (نویسندگی ایستگاه) → P7 چک‌لیست دستگاه → P8 READINESS.

گیت‌های پایه (§3): vitest ۴۲۵/۴۲۵، static ۷۴/۷۴، parity ۲۹/۲۹، flowها 28/29/48/14. شش استثنای tabs-waivers پین است. حدس نزن؛ تصمیم تازه = ردیف D جدید در §4؛ DEFERRED با دلیل. نصب Node ≥22.18 روی ماشین، کار مالک است (بلاکِر ثبت شده).
```
