# شمارا — SHOMARA

SHOMARA یک محصول یادگیری ریاضی فارسی و RTL برای کودک است؛ Android-first و server-authoritative.

## وضعیت فعلی

کلاینت موجود با Expo/React Native ساخته شده و به‌عنوان baseline رفتاری نگه‌داری می‌شود. مسیر فعال پروژه، پاک‌سازی repository و مهاجرت مرحله‌ای به Android Native با Kotlin و Jetpack Compose است.

- وضعیت و کار بعدی: `START_HERE.md`
- قوانین عامل‌های کدنویسی: `AGENTS.md`
- roadmap مهاجرت: `docs/roadmap/SHOMARA_NATIVE_ROADMAP_FA.md`
- قراردادهای محصول و API: `docs/reference/` و `docs/api/`
- تصمیم‌های معماری: `docs/adr/`
- طراحی و معیارهای الهام: `design/MASTER.md` و `design/INSPIRATION_GUARDRAILS.md`
- workflowهای عامل‌ها: `skills/`؛ انتخاب Skill از جدول `ZCODE.md`
- پژوهش و promotion محتوا: `content-library/`

`ROADMAP_PHASES.md` یک ledger تاریخی است و فعلاً برای سازگاری verifierهای legacy باقی مانده؛ منبع برنامه‌ریزی جدید نیست.

## مرزهای محصول

- Phone OTP مسیر ورود production است.
- shell کودک «مسیر / تمرین / من» است.
- تصمیم پاسخ و پیشرفت فقط از backend معتبر می‌آید.
- Challenge، Mastery و Station Pass با هم ادغام نمی‌شوند.
- هیچ ستاره، جان، streak تنبیهی، سکه/الماس، loot box، فروشگاه یا leaderboard در UI کودک وجود ندارد.
- الهام از Duolingo فقط در اصول تعامل و یادگیری است، نه کپی برند یا دارایی.
- AVA فقط منبع درس‌آموختهٔ فرایندی/معماری است؛ UI/UX Pro Max روش تصمیم‌گیری و Claymorphism زبان عمق محدود را فراهم می‌کنند، نه palette یا framework جدید.

## ترتیب امن ادامه

هر عامل ابتدا `AGENTS.md`، سپس `START_HERE.md` و خروجی `node tools/harness.mjs resume` را می‌خواند. اگر task مسدود باشد، وضعیت را صادقانه حفظ می‌کند و فقط کار foundation صریحاً مجاز را انجام می‌دهد؛ از روی ظاهر roadmap وارد فاز وابسته نمی‌شود.

برای Android Native، مسیر واحد build این است:

```bash
npm run android:doctor          # JDK/SDK readiness
npm run android:gate            # unit + lint + compile
npm run android:assemble:debug  # gate + debug APK + SHA-256 report
```

راهنمای کامل در `skills/shomara-android-build/SKILL.md` و `docs/architecture/ANDROID_BUILD_ENVIRONMENT.md` است. debug APK معادل release یا device approval نیست.

## baseline کلاینت فعلی

```bash
npm ci --no-audit --no-fund
npm run build:packages
npm run typecheck:all
npx vitest run
npm run verify:static:all
```

اعداد مورد انتظار و blockerهای محیط در `START_HERE.md` ثبت می‌شوند. هیچ نتیجه‌ای بدون اجرای واقعی PASS اعلام نمی‌شود.
