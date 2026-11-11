# جایگذاری دارایی‌های صفحه ۰۲ — پروفایل (ASSET_PLACEMENT_PAGE02)

- مبنا: `main` با شناسهٔ `df23d50711c6c3ef8ca7ccc1f21fb354edb4aead`
- شاخهٔ هدف: `page-02-profile`
- بستهٔ مالک: `complete-ui-assets.zip` (۳ فایل WebP + ۱۶ فایل SVG + ۳ راهنمای فارسی)
- تاریخ: ۲۰۲۶-۱۱-۰۶

## ۱. نقشهٔ WebP (تنها فایل باینری — در نسخهٔ گیت‌هاب کامل است)

فایل‌های باینری با روش snapshot قابل push نیستند (فقط UTF-8). پس WebP با رابط وب گیت‌هاب روی همین شاخه (`page-02-profile`) آپلود شد — نسخهٔ گیت‌هاب کامل است: کد + تصویر با هم. هارنس دیگر چیزی کپی نمی‌کند؛ فقط پس از pull، sha256 فایل را در درخت checkoutشده تایید می‌کند.

| فایل در zip | مقصد در ریپو | اندازهٔ اصلی | sha256 |
|---|---|---|---|
| `01-mascot-with-bow.webp` | `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_profile_mascot_with_bow.webp` | 1536×1024، ۱۰۲٬۷۱۶ بایت | `666d0d3a08c27eda91d5c8f06539a73138f1ad1543b2328805f9c2a160d9f08b` |

شناسهٔ R برای آن در `ShomaraProfileDrawables.MascotWithBow` تعریف شده است. **فایل در ریپو هست؛ کد پس از pull کامپایل می‌شود** — هیچ کپی محلی لازم نیست.

### دستور تایید هارنس (PowerShell — فقط تایید، بدون کپی)

```powershell
$Dst = "D:\Projects\Shomara\SHOMARA\apps\android\core\designsystem\src\main\res\drawable-nodpi\shomara_profile_mascot_with_bow.webp"
if (-not (Test-Path $Dst)) { throw "WebP missing after pull: $Dst" }
$Hash = (Get-FileHash $Dst -Algorithm SHA256).Hash.ToLower()
if ($Hash -ne "666d0d3a08c27eda91d5c8f06539a73138f1ad1543b2328805f9c2a160d9f08b") { throw "sha256 mismatch: $Hash" }
"OK: shomara_profile_mascot_with_bow.webp sha256 verified"
```

پس از تایید sha256: گیت‌ها و اسکرین‌شات دستگاه، بعد ادغام طبق پروتکل هارنس.

### فایل‌های WebP که فرستاده نمی‌شوند

| فایل در zip | اندازهٔ اصلی | sha256 | دلیل عدم ارسال |
|---|---|---|---|
| `02-mascot-without-bow.webp` | 1536×1024، ۷۵٬۶۳۲ بایت | `e87fe40f2484d2555c1df60176ce00b416e1ee4b59ef5e4b04b4b7ac41a8c498` | بدون کاربرد؛ فایل with-bow به‌صورت as-is استفاده می‌شود |
| `03-bow.webp` | 1536×1024، ۷۳٬۶۵۸ بایت | `c4a3d801a562e0729107c6bfb52a96bde61efc9240c595955ed310928b995e43` | فایل‌های جدا لزوماً هم‌تراز نیستند؛ هرگز روی ماسکوت لایه‌بندی نمی‌شود |

## ۲. نقشهٔ SVG به Compose (هیچ فایل برداری فرستاده نمی‌شود)

هر ۱۶ فایل SVG تک‌مسیره با اسکریپت محلی `~/workspace/shomara-page02/gen_shapes.py` به توابع سازندهٔ `Path` در `ShomaraProfileShapes.kt` تبدیل شد (کمان‌ها به بزیهٔ مکعبی). فایل‌های SVG در ریپو نمی‌روند و VectorDrawable ساخته نشد — دلیل: مسیرهای Compose با همان APIهای تاییدشدهٔ ریپو (`drawPath`/`Stroke`) رسم می‌شوند و نیازی به فایل برداری جدا نیست. رندرهای تایید تجزیه در `~/workspace/shomara-page02/renders/` هستند. مقدارهای hex داخل SVG تقریبی‌اند و **هرگز** استفاده نشدند؛ ستون «رنگ توکن» همان چیزی است که در کد می‌آید.

| فایل SVG | viewBox | تابع(های) تولیدشده | رنگ توکن | کاربرد |
|---|---|---|---|---|
| `01-cloud-top-left.svg` | 220×130 | `cloudTopLeftPath` | `ColorSurfaceAlt` | هیرو، بالا-چپ |
| `02-cloud-top-right.svg` | 190×115 | `cloudTopRightPath` | `ColorSurfaceAlt` | هیرو، بالا-راست |
| `03-cloud-bottom-left.svg` | 225×145 | `cloudBottomLeftPath` | `ColorSurfaceAlt` | هیرو پایین-چپ + لایهٔ پایینی (دو بار استفاده) |
| `04-cloud-bottom-right.svg` | 190×115 | `cloudBottomRightPath` | `ColorSurfaceAlt` | هیرو پایین-راست + لایهٔ پایینی (دو بار استفاده) |
| `05-leaves-top-left.svg` | 180×150 | `leavesTopLeft1/2/3Path` | `PrimarySoft` / `Primary@0.35` / `Primary@0.45` | هیرو، برگ‌های بالایی چپ |
| `06-leaves-top-right.svg` | 175×175 | `leavesTopRight1/2/3Path` | همان سه سبز | هیرو، برگ‌های بالایی راست |
| `07-leaves-bottom-left.svg` | 170×215 | `leavesBottomLeft1/2/3Path` | همان سه سبز | لایهٔ پایینی، برگ چپ CTA |
| `08-leaves-bottom-right.svg` | 170×230 | `leavesBottomRight1/2/3Path` | همان سه سبز | لایهٔ پایینی، برگ راست CTA |
| `09-rays.svg` | 90×115 | `raysPath` (خط) | `ColorAmber` | هیرو، پرتوهای زرد |
| `10-hero-hill-back-left.svg` | 320×180 | `heroHillBackLeftPath` | `ColorSurfaceAlt` | هیرو، تپهٔ پشتی چپ |
| `11-hero-hill-back-right.svg` | 320×150 | `heroHillBackRightPath` | `ColorSurfaceAlt` | هیرو، تپهٔ پشتی راست |
| `12-hero-front-curve.svg` | 878×180 | `heroFrontCurve1Path` (پر) + `heroFrontCurve2Path` (خط) | `ColorSurfaceAlt` / `ColorAmberSoft` | هیرو، منحنیٔ جلویی |
| `13-bottom-hills.svg` | 878×195 | `bottomHills1/2/3/4/5Path` | `PrimarySoft` با آلفاهای ۱٫۰/۰٫۸۵/۰٫۷/۰٫۹/۰٫۷۵ | لایهٔ پایینی، تپه‌های ۵ بانده |
| `14-icon-user.svg` | 48×48 | `iconUserPath` | `ColorMuted` | آیکون فیلد نام |
| `15-icon-check.svg` | 48×48 | `iconCheckPath` (خط) | `ColorSurface` روی نشان `ColorPrimary` | تیک کارت انتخاب‌شده |
| `16-icon-arrow.svg` | 48×48 | `iconArrowPath` (خط) | رنگ محتوای دکمه (سفید روی سبز) | فلش CTA «ادامه» |

## ۳. ترتیب اجرای هارنس (پس از push کد)

1. شاخهٔ `page-02-profile` را pull کن؛ HEAD باید برابر شناسهٔ کامیت pushشده باشد.
2. sha256 فایل WebP را در درخت checkoutشده تایید کن (بند ۱) — کپی لازم نیست، فایل در ریپو هست.
3. `npm run verify:static:all` (انتظار ۹۰/۹۰) + `npm run android:gate`.
4. بررسی دستگاه روی `emulator-5554`: اسکرین‌شات صفحهٔ پروفایل در برابر نمونه (۳۶۰/۳۹۰/۴۱۲dp، فونت ۲۰۰٪، TalkBack) — موارد بند ۶ یادداشت پیاده‌سازی.
5. فقط اگر ۳ و ۴ کاملاً سبز بودند: ادغام `--no-ff` به `main`، اجرای دوبارهٔ هر دو گیت روی `main`، و `git push origin main`.
6. اگر قرمز بود: بدون ادغام، گزارش کامل خطا.
