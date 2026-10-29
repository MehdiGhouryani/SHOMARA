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

اگر task جاری `N02-07` بود، از مسیر canonical اجرا کن:

```bash
npm run android:doctor
npm run android:gate
```

`BLOCKED_ENV` را با static PASS جایگزین نکن. قرارداد محیط در `docs/architecture/ANDROID_BUILD_ENVIRONMENT.md` است.

برای ادامه از چت جدید، ابتدا `docs/delivery/SHOMARA_FINAL_CHAT_HANDOFF.md` را بخوان. قرارداد نهایی ۱۷ خانواده صفحه در `design/playbook/PAGE_UIUX_BLUEPRINT.md` و صف اجرای ۲۰ work item در `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` است. تا سبزشدن واقعی `N02-07` هیچ ردیف `NATIVE_PENDING` را به IMPLEMENTED/TESTED تغییر نده و N03 را شروع نکن.

## routing مهارت‌ها

| نوع کار | Skill اجباری |
|---|---|
| SDK، Gradle، CI، build و APK | `skills/shomara-android-build/SKILL.md` |
| hierarchy، journey و UX صفحه | `skills/shomara-product-design/SKILL.md` |
| token، theme، component و Clay | `skills/shomara-design-system/SKILL.md` |
| پیاده‌سازی و evidence یک route | `skills/shomara-screen-execution/SKILL.md` |
| curriculum، audio، CMS و authoring | `skills/shomara-learning-content/SKILL.md` |

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
npm run verify:project-skills
npm run verify:design-governance
npm run build:packages
npm run typecheck:all
npm run test:unit
git diff --check
git status --short
```

اگر Chromium/Android SDK/device موجود نبود، نتیجه را `BLOCKED_ENV` ثبت کن؛ هرگز browser check را Native QA یا برعکس اعلام نکن.
