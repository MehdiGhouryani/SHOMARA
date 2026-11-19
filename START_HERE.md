# START_HERE.md — وضعیت جاری SHOMARA

current_phase: N11
current_task: N11-05

> این فایل تنها سند وضعیت است و عمداً کوتاه نگه داشته می‌شود. تاریخ کامل و شواهد هر دور در
> `harness/WORKLOG.md` است (append-only). جدول ۳۲۵ خطی قبلی حذف شد چون خواندنش برای انسان و
> عامل هزینه داشت بدون آنکه تصمیمی به آن اضافه کند.

## وضعیت

| مورد | مقدار |
|---|---|
| شاخهٔ کار | `work/shomara-deep-transformation` |
| آخرین commit | `99f6e8c` |
| `origin/main` | `aa2805c` (دست‌نخورده) |
| sweep دسترس‌پذیری | **۴۸/۴۸** روی `Pixel_6a` |
| `android:gate` | exit 0 (`ANDROID_BUILD: PASS`) |
| `harness validate` | VALID (۱۲۹ task) |
| `verify:static:all` · `verify:repository` · `verify:design-governance` · `verify:design-pack` | همه exit 0 |
| APK | `2478d9f5…3ec923` |

## آخرین کارها

- **DT-39** کارت قهرمان شخصیت‌محور در Home (سطح `ColorHomeVioletSoft`، شخصیت `ComponentNodeCurrent + Space16`).
- **DT-40** پیاده‌سازی کامل دو کامپوننت جاافتادهٔ handoff: `ShomaraChapterProgressCard` (C04) و `ShomaraContinueStationCard` (C05) با **یک** CTA اصلی؛ ۲۵ وکتور تأییدشدهٔ بسته به design system اضافه شد؛ مالکیت CTA از گرهٔ مسیر به کارت منتقل شد.
- **پاک‌سازی:** ۸۰ سند بی‌ارجاع (۲۰۱→۱۴۱ سند) + ۳۷ فایل تکراری/بی‌مصرف؛ ۱۲ artifact از گیت خارج شد (۱۷۴۲→۱۶۹۴ فایل).
- **شاهد جعلی حذف شد:** `gallery-ltr.png` و `gallery-rtl.png` بایت‌یکسان بودند؛ شاهد بصری RTL هرگز وجود نداشت.

## باز و تأییدنشده (صادقانه)

1. **O5** — هویت/پیشرفت واقعی کودک؛ تا حل‌نشدنش Home و Practice با snapshot حل‌نشده کار می‌کنند.
2. **قفل والدین** — تصمیم مالک: حذف کامل بدون تأیید. نیاز به اصلاح `ADR-0037`/`ADR-0047` و verifierها دارد (اجرا نشده).
3. **شواهد دستگاه فیزیکی** — اسکرین‌شات/TalkBack/دیپ‌لینک روی دستگاه واقعی گرفته نشده.
4. **instrumented در CI** — `android:gate` تست‌های instrumented را اجرا نمی‌کند؛ اجرا دستی است.
5. **دو قرارداد بی‌مصرف** — `AssetResolver` و `AudioAssetResolver` (seam آمادهٔ اتصال، تصمیم مالک).
6. **بازسازی UI بقیهٔ صفحات** — Home انجام شد؛ Practice/Me/Settings/Onboarding باید با همین معیار handoff بازبینی شوند.

## تصمیم‌های مالک (۲۰۲۶-۱۱-۱۹)

متن inline در صفحه مجاز · تولید متن جدید مجاز · بیش از یک Featured در ویوپورت مجاز · الزام ledger
کاهش یافت · پالت = همان پالت handoff (violet `#7256E8`، amber `#FFC15A`، canvas `#F7F4FF`).

## مسیر خواندن

1. `AGENTS.md` — قرارداد اجرایی
2. همین فایل — وضعیت
3. `harness/roadmap.json` — وضعیت ماشینی taskها
4. `harness/WORKLOG.md` — تاریخ کامل با شواهد
