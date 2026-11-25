# SHOMARA — دستور شروع مستقل برای هر عامل کدنویسی

اگر هیچ سابقه‌ای از چت در دسترس نیست، از این فایل شروع کن. محصول فعال فقط SHOMARA است؛ AVA بسته شده و نباید تغییر کند.

## شروع اجباری

```bash
git status --short --branch
git log -3 --oneline
cat AGENTS.md
cat START_HERE.md
node tools/harness.mjs validate
node tools/harness.mjs status
node tools/harness.mjs next
node tools/harness.mjs resume
```

سپس فقط task اعلام‌شده توسط `next` را باز کن:

```bash
node tools/harness.mjs task <TASK-ID>
```

مسیر canonical Android در هر مرحله:

```bash
npm run android:doctor
npm run android:gate
```

`BLOCKED_ENV` را با static PASS جایگزین نکن. قرارداد محیط در `docs/notes/ANDROID_BUILD_ENVIRONMENT.md` است.

**وضعیت واقعی هنگام این تحویل (۲۰۲۶-۱۱-۲۵، `main` = `51d18a3`):** `harness next` می‌گوید
`N11-05` و همان task روی **O5 (هویت پایدار محلی)** بلاک است؛ تا تصمیم مالک، مسیر UI جلو نمی‌رود.
جریان مولدی که باز است **تألیف محتوای ایستگاه‌ها** است: ۱۲/۲۵ تألیف شده (تا ST12) و ایستگاه بعدی
**ST13 «نشانهٔ جمع»** با الگوی `content-library/authoring/stations/specs/ST12.md`. برای محتوا فقط
زنجیرهٔ `SOURCE_ONLY → MAPPED_TO_REPO → …` معتبر است و هیچ ایستگاهی بازبینی انسانی نشده است.

برای ادامه از چت جدید، `START_HERE.md` (بخش «ادامه از این نقطه») و `harness/WORKLOG.md` را
بخوان. قرارداد نهایی ۱۷ خانواده صفحه در `design/playbook/PAGE_UIUX_BLUEPRINT.md` و صف اجرای
۲۰ work item در `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` است. هیچ ردیف
`NATIVE_PENDING` به IMPLEMENTED/TESTED تغییر نمی‌کند مگر با شاهد اجراشده روی دستگاه یا تست.

## routing مهارت‌ها

| نوع کار | Skill اجباری |
|---|---|
| SDK، Gradle، CI، build و APK | `docs/DESIGN_RULES.md § build/SKILL.md` |
| hierarchy، journey و UX صفحه | `docs/DESIGN_RULES.md § product design/SKILL.md` |
| token، theme، component و Clay | `docs/DESIGN_RULES.md § design system/SKILL.md` |
| پیاده‌سازی و evidence یک route | `docs/DESIGN_RULES.md § screen execution/SKILL.md` |
| curriculum، audio، CMS و authoring | `docs/DESIGN_RULES.md § content/SKILL.md` |

برای UI، `design/INSPIRATION_GUARDRAILS.md` را پیش از انتخاب style بخوان. هیچ Skill مجاز نیست dependency graph یا gate فعال را دور بزند.

## قوانین اجرا

1. روی `main` کار نکن؛ شاخهٔ فاز را از `harness/roadmap.json` بخوان.
2. فایل dirty کاربر را حفظ کن.
3. فقط مسیرهای مجاز task/phase را تغییر بده.
4. قبل از حذف، مصرف‌کننده را با `rg` و ledger ثابت کن.
5. تست یا verifier را برای سبزشدن ضعیف نکن.
6. هر ادعای PASS باید فرمان، exit code و evidence داشته باشد.
7. task بدون تکمیل acceptance criteria به `DONE` تغییر نمی‌کند.
8. در پایان، `START_HERE.md`، `harness/roadmap.json` و `harness/WORKLOG.md` را هم‌زمان به‌روز کن.
9. APK/AAB، schema migration، production data و secret فقط با task و مجوز صریح انجام می‌شوند.

## پایان checkpoint

```bash
node tools/harness.mjs validate
npm run verify:repository
npm run verify:design-governance
npm run verify:static:all
npm run content:indexes:check
npm run build:packages
npm run typecheck:all
npm run test:unit
git diff --check
git status --short
```

برای کار روی محتوا/ایستگاه، این دو هم اجباری‌اند:

```bash
node scripts/verify-station-spec.mjs      # ساختار ایستگاه‌ها (بدون شناسه = همه)
node scripts/verify-magic-squares.mjs     # یکتایی حل جدول‌های T08
```

تست‌های واحد هر ماژول Android جدا اجرا می‌شوند (مثلاً `gradlew :feature:lesson:testDebugUnitTest`)؛
`npm run android:gate` فقط build است و instrumented را اجرا **نمی‌کند** (اجرا دستی است).

اگر Chromium/Android SDK/device موجود نبود، نتیجه را `BLOCKED_ENV` ثبت کن؛ هرگز browser check را Native QA یا برعکس اعلام نکن.
