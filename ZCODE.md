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
```

سپس فقط task اعلام‌شده توسط `next` را باز کن:

```bash
node tools/harness.mjs task <TASK-ID>
```

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
npm run build:packages
npm run typecheck:all
npm run test:unit
git diff --check
git status --short
```

اگر Chromium/Android SDK/device موجود نبود، نتیجه را `BLOCKED_ENV` ثبت کن؛ هرگز browser check را Native QA یا برعکس اعلام نکن.
