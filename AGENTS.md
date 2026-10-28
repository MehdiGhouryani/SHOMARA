# AGENTS.md — قرارداد اجرایی SHOMARA

این فایل راهنمای ثابت تمام عامل‌های کدنویسی است. وضعیت روز، چک‌لیست فعال و کار بعدی فقط در `START_HERE.md` نگه‌داری می‌شود؛ برنامهٔ کامل در `docs/roadmap/SHOMARA_NATIVE_ROADMAP_FA.md` است.

## 1. محدودهٔ قطعی

- تنها محصول فعال این مخزن **SHOMARA** است.
- پروژهٔ AVA بسته شده است. می‌توان فقط از آموخته‌های معماری و فرایندی آن الهام گرفت؛ تغییر، ادغام یا کپی مستقیم کد AVA ممنوع است.
- هدف نهایی، اپ Android کاملاً Native با Kotlin و Jetpack Compose است.
- اپ Expo فعلی تا زمان جایگزینی قابلیت‌ها مرجع رفتاری و fallback قابل اجراست؛ قابلیت جدید بلندمدت به آن اضافه نکن، مگر برای رفع P0/P1 یا حفظ parity در مهاجرت.
- Web/API، قراردادهای دامنه و backend مستقل از مهاجرت UI هستند و بدون تصمیم ثبت‌شده بازنویسی نمی‌شوند.

## 2. ترتیب شروع هر کار

1. `AGENTS.md`
2. `START_HERE.md`
3. `node tools/harness.mjs validate` و سپس `node tools/harness.mjs next`
4. بخش مرتبط `docs/roadmap/SHOMARA_NATIVE_ROADMAP_FA.md`
5. کد، تست و قراردادهای همان task
6. برای UI: `DESIGN/SHOMARA_PLAYBOOK/SKILL.md` و قرارداد صفحهٔ مرتبط

`ROADMAP_PHASES.md` یک ledger تاریخی و ورودی verifierهای قدیمی است؛ تا زمان مهاجرت verifierها حذف یا منبع برنامه‌ریزی جاری تلقی نشود.

## 3. قواعد غیرقابل مذاکره

1. مستقیم روی `main` کار نکن؛ هر فاز شاخهٔ مستقل دارد.
2. تغییر موجود کاربر را حفظ کن؛ reset/force-push ممنوع است.
3. `PASS` فقط با فرمان اجراشده، exit code و evidence ثبت‌شده مجاز است.
4. verifier، assertion، threshold و golden برای سبزشدن ظاهری ضعیف نمی‌شود.
5. منطق پاسخ، پیشرفت، mastery و Station Pass فقط server-authoritative می‌ماند.
6. answer key و evaluator وارد کلاینت کودک نمی‌شود.
7. محصول فارسی و RTL است؛ جهت رابط با جهت ریاضی یکی فرض نمی‌شود.
8. UI کودک ستاره، جان، streak تنبیهی، سکه/الماس، loot box، فروشگاه یا leaderboard ندارد.
9. پاسخ غلط ترسناک یا تنبیهی نیست؛ بازخورد گرم، قابل‌اقدام و بدون تحقیر است.
10. متن UI از منبع string canonical و رنگ/فاصله/شکل از Design System canonical می‌آید؛ magic value در صفحه ممنوع است.
11. وابستگی Native، migration دیتابیس و تغییر shared contract باید در roadmap/ADR ثبت و قبل از merge بازبینی شود.
12. secret، دادهٔ واقعی کودک، keystore و فایل محیطی واقعی هرگز commit یا در لاگ چاپ نمی‌شود.

## 4. سیاست Clean و حذف فایل

- ابتدا مصرف‌کننده‌ها با `rg`/dependency map پیدا می‌شوند؛ سپس فایل حذف می‌شود.
- generated output، cache و artifact قابل بازتولید نباید track شوند.
- V1 تا وقتی مصرف‌کنندهٔ زنده دارد یک‌باره حذف نمی‌شود. مهاجرت باید route-by-route باشد و در پایان، V1 و verifierهای اختصاصی آن با یک commit قابل بازبینی بازنشسته شوند.
- اسناد جاری فقط یک canonical دارند؛ سند تاریخی به `docs/archive/` می‌رود و از مسیر مطالعهٔ فعال خارج می‌شود.
- حذف حجیم باید در گزارش فاز با تعداد فایل، حجم و روش بازیابی ثبت شود.

## 5. معماری هدف Android

- Kotlin + Jetpack Compose، single-activity، UDF، ViewModel و state immutable.
- لایه‌های UI / domain / data؛ UI مستقیماً به network/database دسترسی ندارد.
- local source برای خواندن‌های حیاتی، repository برای هماهنگی local/remote، sync قابل retry و idempotent.
- ماژول feature فقط از API عمومی `core` و domain وابستگی می‌گیرد؛ import مستقیم بین implementation دو feature ممنوع است.
- Design System واحد است و خروجی Kotlin/TypeScript از یک token source تولید می‌شود.
- تست واحد، screenshot، navigation، accessibility و device gate جزو تعریف انجام است؛ browser-only معادل Native نیست.

## 6. روش UI/UX هر صفحه

`DISCOVER → OBSERVE → AUDIT → DESIGN → IMPLEMENT → TEST → CAPTURE → LEDGER`

- در هر state کودک باید بداند کجاست، چه کاری انجام دهد و بعد چه می‌شود.
- در هر state تصمیم‌گیری فقط یک CTA اصلی واضح وجود دارد.
- loading/offline/error/empty/disabled/correct/retry/back/resume برای صفحه‌های مرتبط طراحی و تست می‌شوند.
- حداقل عرض‌های 360/390/412dp، بزرگ‌نمایی متن، safe area، keyboard و TalkBack بررسی می‌شوند.
- touch target حداقل 48dp و برای اشیای آموزشی کودک ترجیحاً 72–80dp است.
- الهام از Duolingo محدود به اصول تعامل و یادگیری است؛ کپی ظاهر، دارایی، شخصیت، متن یا هویت برند ممنوع است.

## 7. Gate هر فاز

- Clean/legacy: `npm ci`, `build:packages`, `typecheck:all`, `vitest`, static gates و بررسی working tree.
- Native: Gradle checks، unit tests، lint، Compose screenshot/semantics و build Debug.
- UI route: تست رفتار + screenshot هم‌اندازه + a11y + ledger.
- پایان فاز: `START_HERE.md`، evidence و لیست `UNVERIFIED/BLOCKED` به‌روز می‌شود.

ساخت APK/AAB فقط وقتی task همان فاز صریحاً اجازه داده باشد انجام می‌شود.

## 8. پروتکل ادامه در چت جدید

- `ZCODE.md` پرامپت/راهنمای شروع مستقل است.
- `harness/roadmap.json` وضعیت ماشینی taskها و dependencyها را نگه می‌دارد.
- `harness/WORKLOG.md` فقط append می‌شود و شواهد هر checkpoint را خلاصه می‌کند.
- مدل حق ندارد task بعدی را حدس بزند؛ خروجی `node tools/harness.mjs next` مبناست.
- وضعیت task فقط همراه با evidence و در همان commit به‌روزرسانی می‌شود.
