# برنامهٔ اقدام بازسازی مسیر — DT-75 (فاز ۳)

> **وضعیت گام ۰ (B1): انجام شد و روی دستگاه اثبات شد** — placement حالا local resolve می‌شود؛
> کودک بدون skip با «شروع مسیر» وارد شل می‌شود؛ شل اندازه‌گیری شد: `canvas#F7F4FF ۸۱٪`.
> جزئیات شواهد در انتهای همین فایل.

مبنای برنامه: `AGENTS.md` §6 (روش UI/UX هر صفحه)، `START_HERE.md` (بند ۶ بازسازی)،
`design/handoff-home-ui-v3/00_START_HERE/IMPLEMENTATION_ORDER_FA.md` (Gate 0–7)،
`design/handoff-home-ui-v3/01_DESIGN/DESIGN_DECISIONS_FA.md` + `HOME_PATH_DESIGN_SPEC_FA.md` +
`STATE_AND_INTERACTION_MATRIX.json`، `design/playbook/pages/06_LEARNING_PATH.md` + `17_NAVIGATION.md` + `16_STATES.md`
و `NATIVE_IMPLEMENTATION_BACKLOG.csv` (۲۱ ردیف — فقط همان ردیف‌ها به‌روز می‌شوند).

## باگ‌های انسداد که اول باید رفع شوند (بدون این‌ها بازسازی دیده نمی‌شود)

| # | باگ | شاهد | رفع |
|---|---|---|---|
| B1 | **بن‌بست placement** — «در حال آماده‌سازی نقطهٔ شروع…» برای همیشه می‌ماند؛ هیچ مسیری به `withServerDecision` در host وجود ندارد؛ در release دکمهٔ «فعلاً رد می‌کنم» هم نیست → کودک هرگز به شل نمی‌رسد | `OnboardingHost.kt:132,256` — تنها تغییر placement فقط `skip()` است | تصمیم مالک لازم: placement در offline-first محصول باید local resolve شود (پایهٔ انتخاب‌شده = نقطهٔ شروع) یا مسیر server درست شود. پیشنهاد من: local resolve با همان پایه‌ای که کودک در profile انتخاب کرده (منبع حقیقت: draft store) |
| B2 | **مسیر رسیدن مالک به شل** فقط از بن‌بست B1 می‌گذرد؛ Home v3 سالم است (canvas ۸۱٪) | DT-74 زنده | با رفع B1 حل می‌شود |

## ترتیب کار (طبق Gate 0–7 خود v3، اقتباس فشرده)

### گام ۰ — رفع B1 (بالا) + تست
- unit test برای resolve محلی placement؛ حذف بن‌بست؛ رد کردن در release هم ممکن می‌شود یا کاملاً حذف صفحهٔ بن‌بست.
- خروجی: کودک با پایهٔ انتخاب‌شده مستقیم وارد شل می‌شود.

### گام ۱ — تب‌بار v3 (قفل UI-006/UI-007 shell)
- آیکون‌های VectorDrawable آماده (۶ فایل: nav path/practice/me × active/inactive) — موجود در res.
- `ShomaraTabBar` به‌روز: active tint violetSoft + icon violet، inactive خاکستری-بنفش، Role.Tab + selected semantics،
  بالای gesture inset با WindowInsets (نه margin ثابت).
- تست: semantics + idempotent reselect + سازگاری 360/390/412dp.

### گام ۲ — مسیر v3 کامل (UI-007)
- Header (عنوان/زیرعنوان/تنظیمات/شخصیت cameo) — موجود `ShomaraHomeHeader`؛ فقط اصلاح.
- ChapterProgressCard + ContinueStationCard — موجود (DT-40)؛ مصرف مستقیم.
- Path nodes با ۵ حالت matrix (fresh/current/completed/perfect/locked) — موجود؛ افزودن:
  - **connector پشت nodeها** (Gate 5 v3): `ShomaraPathGraph` deterministic geometry، draw behind nodes.
  - **PathReturnFab** (DT-72 ساختیم): وصل به scroll واقعی + threshold.
  - **restore-scroll** (UI-007 state): keyed by stationId، restore after measurement.
- Locked: operable بماند + علت کامل در stateDescription (موجود — فقط تأیید).
- §6 همه حالت‌ها: loading/offline/error/empty — موجود از DT-40 sweep؛ فقط تأیید.

### گام ۳ — صفحات دیگر v3 (UI-013/015/017)
- تمرین (Practice hub): تم v3 (canvas بنفش، کارت سفید، بنفش active) — بازسازی visual، حفظ منطق موجود.
- من (Me): تم v3 + کارت پیشرفت واقعی (نه placeholder خالی).
- تنظیمات: تم v3 (منطق Clean/Dirty/Saving/Saved موجود از DT-66).
- اسپلش: تطابق با logo mark v3.

### گام ۴ — Verification (Gate 6 v3)
- unit + semantics tests برای هر تغییر؛ `android:gate`؛
- **device capture زنده** (مثل DT-74): screencap + uiautomator متن‌ها + پالت → اثبات رندر v3 روی امولاتور؛
- font scale 1.0/1.3/2.0 + RTL؛ backlog CSV فقط ردیف‌های UI-006/007/013/015/017 با exit_evidence واقعی.

### گام ۵ — تحویل (Gate 7 v3)
- WORKLOG + START_HERE بند ۶ → «انجام»؛ `NOT VERIFIED` صریح برای شواهد دستگاه فیزیکی (نداریم).
- commit + push + ff-only main.

## چه چیزی ساخته نمی‌شود (ضد اقدام بیهوده)

- کامپوننت موازی Button/TabBar/PathNode/Progress (Gate 3 v3 صریحاً ممنوع).
- حالت synthetic «Upcoming» برای nodeها (matrix v3 ممنوع).
- tab چهارم guardian (تصمیم 5 v3: دقیقاً ۳ تب).
- footer باغچه landscape — تا وقتی screenshot دستگاه واقعی نیاز را ثابت کند (تصمیم 7 v3).
- بازطراحی ۱۷ کامپوننت موجود (absorption table DT-72: ۲۱/۲۶ موجود).

## تصمیم‌های مالک که این برنامه به آن‌ها تکی می‌کند

1. **B1 placement**: پیشنهاد = resolve محلی با پایهٔ انتخابی. اگر بگویید «نه، سرور»، مسیر دیگری لازم است.
2. پالت v3 برای همهٔ صفحات (START_HERE ثبت شده: مجاز).
3. بیش از یک Featured در viewport (START_HERE: مجاز) — ولی spec v3 می‌گوید «حداکثر یک»؛ ترجیح v3.

## شواهد گام ۰ (B1) — رفع بن‌بست placement

| شاهد | مقدار |
|---|---|
| تست JVM `ProfilePlacementTest` | **۹ تست، ۰ خطا** (از جمله ۲ تست جدید DT-75) |
| Gradle `:feature:onboarding:testDebugUnitTest :app:lintDebug :app:assembleDebug` | exit 0 |
| `verify:static:all` | PASS 94/94 |
| سفر واقعی روی امولاتور (fresh boot) | عبور آزمایشی → نام → پایه → placement |
| متن صفحهٔ placement روی دستگاه | «از ابتدای مسیر پایه اول ابتدایی شروع می‌کنیم» + دکمهٔ «شروع مسیر» |
| بعد از «شروع مسیر» | شل کودک با سه تب مسیر/تمرین/من — **بدون هیچ skip** |
| پالت فریم رسیده به Home | `canvas#F7F4FF ۸۱٪` (v3) |
| فریم شاهد | `build-reports/audit/dt75-shell-reached.png` (نشان device، غیر git-tracked) |

تصمیم ثبوت‌شده در کد (کامنت کانونیکال در `ShomaraPlacementState`): مبنای ADR-0039 (offline-first)،
تصمیم سرور اگر روزی بیاید همچنان از `withServerDecision` بر `resolveLocally` مقدم است؛ resolve محلی
idempotent است و هیچ ادعای mastery ندارد (فقط «ابتدای مسیر پایهٔ N»).
