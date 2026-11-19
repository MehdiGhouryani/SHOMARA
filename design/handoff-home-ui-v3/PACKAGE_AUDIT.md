# ممیزی نهایی تحویل SHOMARA Home UI — نسخهٔ ۳ (بازبینی‌شده)

تاریخ بازبینی: 2026-11-13

## دامنهٔ تحویل

این بسته Design + Asset + Native Implementation Handoff برای تب کودک «مسیر یادگیری» در Android/Kotlin/Jetpack Compose است. هدف آن دادن ورودی مهندسی‌شده به Harness است؛ این ZIP به‌تنهایی تغییر در GitHub، APK آماده یا پیاده‌سازی production را ادعا نمی‌کند.

## تغییرات انجام‌شده در بازبینی نهایی

1. مسیر بصری RTL در پیش‌نمایش‌ها اصلاح شد تا از سمت راست شروع کند و به چپ و سپس راست برگردد؛ در هر دو عرض 360 و 412dp بررسی شد.
2. دو حالت جداگانهٔ صفحه اضافه شد: `Fresh` برای ورود تازه و `Resume` برای ادامهٔ مسیر. متن CTA/eyebrow در حالت Fresh دیگر عبارت «از آخرین نقطه ادامه بده» را نشان نمی‌دهد.
3. آیکون تب «مسیر» از نماد شبیه Share به مسیر واحد مارپیچ با milestone و پرچم مقصد تغییر کرد؛ SVG و VectorDrawable آن به‌روزرسانی شدند.
4. برای سه SVG عمومی Arrow/Bookmark/Close، Android VectorDrawable متناظر اضافه شد.
5. Reference implementation کارت Continue اصلاح شد: slot تصویری در سمت فیزیکی چپ RTL قرار می‌گیرد، label از state واقعی resume/fresh می‌آید، دکمهٔ روی سطح بنفش کنتراست مناسب دارد، Loading و Reduced Motion و TapGuard دارد.
6. دکمهٔ Settings در Header دارای content description پیش‌فرض قابل‌خواندن شد.
7. رنگ‌های متن فرعی و متن روی کارت بنفش اصلاح شدند تا زوج‌های اصلی متن در آزمون ایستای WCAG AA به حداقل 4.5:1 برسند.
8. ابزار validator اصلاح شد تا تصویرهای preview را اشتباهاً به‌عنوان app asset داخل Asset Manifest نشمارد.

## موجودی بستهٔ بازبینی‌شده

- 112 فایل محتوایی در گزارش validation (به‌جز report/index/checksum metadata)
- 36 فایل SVG منبع
- 32 Android VectorDrawable XML
- 5 فایل JSON معتبر
- 69 دارایی runtime/design در Asset Manifest: 36 SVG + 32 VectorDrawable + 1 WebP اختیاری
- 6 تصویر raster (پنج preview PNG + یک footer WebP اختیاری) از نظر خوانایی/ابعاد/alpha بررسی شدند
- 26 کامپوننت در کاتالوگ C01 تا C26
- 4 preview صفحه در دو عرض 360/412dp و دو حالت Fresh/Resume، به‌علاوهٔ Component Sheet
- 117 کنترل استاتیک قراردادها موفق؛ 0 خطا
- 7 زوج کنتراست متن اصلی، همگی حداقل 4.5:1

## تطبیق با repository

- stateهای رسمی node دقیقاً `Fresh`, `Current`, `Completed`, `Perfect`, `Locked` هستند؛ `Upcoming` به عنوان state دامنه اضافه نشده است.
- Main و Number از drawable-nodpi رسمی Native در repo استفاده می‌شوند و در APK duplicate نمی‌شوند.
- Fandogh از asset رسمی handoff در repository می‌آید؛ اسکریپت فقط در صورت نبود drawable مقصد آن را کپی می‌کند.
- سه مقصد tab کودک فقط مسیر/تمرین/من هستند؛ Settings و Guardian در این navigation قرار نمی‌گیرند.
- رنگ بنفش و یاسی screen-local proposal هستند و token source سراسری SHOMARA را تغییر نمی‌دهند.
- مکانیک‌های XP، coin، streak تنبیهی، lives، loot box، leaderboard و random reward وارد UI نشده‌اند.

## شواهد و محدودیت‌های تست

`PACKAGE_VALIDATION_REPORT.md` syntax/structure/bitmap validation را گزارش می‌کند. `PACKAGE_CONTRACT_AUDIT.md` قرارداد state، resource references، تعداد componentها، navigation tabs و کنتراست متن را بررسی می‌کند.

موارد زیر در این محیط اجرا نشده و Harness باید در checkout واقعی ثبت کند:

- Android AAPT/Gradle resource compile و Kotlin/Compose compile/lint
- emulator/device screenshot واقعی و pixel diff
- TalkBack واقعی، font scale 1.0/1.3/2.0 و reduced motion روی دستگاه
- process recreation، predictive Back، runtime performance، memory و jank

پیش‌نمایش‌ها mockup پیکسلی‌اند، نه screenshot Compose. در mockup از فونت fallback محلی استفاده شده؛ اپ باید Vazirmatn موجود پروژه را مصرف کند. نشان بنفش دایره‌ای Header در preview فقط placeholder جایگاه Main است و باید با `ShomaraCharacterImage` و pose رسمی Main جایگزین شود.

## نتیجه

از نظر موجودی فایل‌ها، syntax SVG/XML/JSON، bitmap sanity، ارجاع resourceهای نمونه، قرارداد state، inventory و زوج‌های اصلی contrast، بسته بازبینی‌شده بدون خطای ایستا گزارش شده است. آماده‌بودن production فقط پس از reconciliation در checkout، Gradle/device gates و evidence واقعی قابل اعلام است.
