# شمارا · project-design-v2 (بازسازی شخصیت‌ها)

| مسیر | محتوا |
|---|---|
| `docs/CHARACTER-BIBLE-v2.md` | تشخیص، پژوهش، اصول، cast، حالت‌ها |
| `docs/RIVE-RIG-BRIEF.md` | بریف ریگ Rive برای انیماتور |
| `specs/characters-v2.json` · `specs/motion-v2.json` | قرارداد شخصیت و انیمیشن |
| `source/shomara-cast.mjs` | **منبع واحد** همهٔ هنر شخصیت (SVG لایه‌ای) |
| `source/motion.css` | انیمیشن لایه‌ها (کپی‌شده در `apps/web/app/globals.css`) |
| `source/rebuild.sh` | بازسازی همهٔ خروجی‌ها از منبع |
| `assets/characters/{id}/{state}.svg` | ۲۴ حالت + `bust.svg` + `family-lineup.svg` |
| `assets/png/` · `assets/brand/` | PNG پیش‌نمایش ۵۱۲ و آیکون/اسپلش جدید |
| `concepts/` | کانسپت آرت WebP (lineup + model sheet هر شخصیت؛ فقط مرجع، نه دارایی اپ) |
| `preview/index.html` | پیش‌نمایش تعاملی با انیمیشن (بدون سرور باز می‌شود) |
| `qa/validate-cast.mjs` | بررسی ساختار، idها، حجم و هم‌خوانی فایل‌ها با منبع |

ویرایش هنر: فقط `source/shomara-cast.mjs` را تغییر بدهید و `bash project-design-v2/source/rebuild.sh` بزنید (Node 20+ و `pip install cairosvg`). فایل‌های تولیدی (`apps/web/lib/characterArt.generated.ts`، PNGهای موبایل، آیکون‌ها) دستی ویرایش نشوند.
