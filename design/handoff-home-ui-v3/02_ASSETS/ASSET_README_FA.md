# راهنمای پوشهٔ Assetها

- `svg/` نسخه‌های source و قابل ویرایش طراحی‌اند.
- `android/drawable/` معادل Android VectorDrawable است و در runtime مصرف می‌شود.
- `backgrounds/garden_path_footer.webp` زمینهٔ تزئینی شفاف و اختیاری است؛ استفادهٔ آن اجباری نیست.
- تصویر شخصیت‌های Main/Number/Fandogh عمداً دوباره بسته‌بندی نشده‌اند؛ منبع، نسخه و مسیر آن‌ها در `03_ANDROID/kotlin/CHARACTER_ASSET_INTEGRATION_FA.md` است.
- Android نباید SVG را مستقیماً با parser جداگانه render کند. resource XML مناسب را در ماژول design system اضافه کنید.
- هیچ متن یا وضعیت پیشرفت واقعی در bitmap/asset تزریق نشده؛ تمام متن باید از data و Compose بیاید.
