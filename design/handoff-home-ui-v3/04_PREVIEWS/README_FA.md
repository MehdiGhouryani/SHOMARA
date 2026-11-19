# راهنمای پیش‌نمایش‌ها

| فایل | حالت | هدف بررسی |
|---|---|---|
| `home_path_360dp.png` | مسیر در حال ادامه | فشردگی layout و خوانایی در عرض کوچک |
| `home_path_412dp.png` | مسیر در حال ادامه | composition پایه و مسیر RTL |
| `home_path_fresh_360dp.png` | ورود تازه | بدون completed/current مصنوعی؛ CTA شروع |
| `home_path_fresh_412dp.png` | ورود تازه | حالت اولیه در اندازهٔ استاندارد |
| `component_sheet.png` | کتابخانهٔ بصری | ناوبری، node stateها، کارت‌ها و موضوع درس |

این تصاویر mockup پیکسلی هستند، نه screenshot واقعی Jetpack Compose یا emulator. فونت محلی برای preview از Noto Sans Arabic استفاده کرده و باید در خروجی Native با فونت Vazirmatn موجود پروژه جایگزین شود. نشان دایره‌ای بنفش در Header فقط placeholder محل Main است؛ در implementation حتماً pose رسمی `shomara_char_main_01.webp`/`ShomaraCharacterImage` را وصل کنید. آیکون مسیر در این نسخه یک مسیر پیوسته با نقاط milestone و نشان مقصد است، نه نماد share.

محتوای درصد/تعداد و عنوان‌های این موکاپ صرفاً نمونهٔ نمایشی هستند. در اپ باید تمام مقادیر از ViewModel و content package واقعی بیایند.
