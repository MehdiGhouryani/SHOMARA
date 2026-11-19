# سیاست منابع، کیفیت تصویر و حجم APK

## اولویت فرمت
1. **SVG:** source قابل ویرایش و handoff طراحی.
2. **Android VectorDrawable XML:** runtime Android برای icon، state glyph، nav و lesson icon.
3. **WebP:** فقط character art/illustration یا زمینهٔ تصویری پیچیده.
4. **Compose Canvas:** connector و شکل‌هایی که از data/layout تولید می‌شوند.
5. **PNG:** فقط در مواردی که transparency/decoder/format ضرورت واقعی دارد؛ نه برای آیکون ساده.

## بودجه و کنترل حجم
- تمام SVG/VectorDrawableهای این بسته باید فقط path/shape داشته باشند و متن در خود icon قرار نگیرد.
- WebP تزئینی باید از عرض/ارتفاع واقعی و alpha مناسب استفاده کند؛ در فشرده‌سازی مجدد مراقب fringe دور alpha باشید.
- از تولید densityهای mdpi/hdpi/xhdpi برای یک بردار خودداری کنید.
- Character art موجود را دوباره encode نکنید مگر نیاز دستگاه و owner تایید کند؛ کیفیت و provenance حفظ شود.
- هر bitmap جدید باید در asset manifest اندازه، dimensions، format، alpha و مقصد را ثبت کند.
- `res/drawable-nodpi` فقط برای art با اندازهٔ طراحی‌شده و مدیریت‌شده؛ برای بردارها `res/drawable`.

## پذیرش visual asset
- شکل باید در light canvas و card سفید قابل تمایز باشد.
- stroke width در اندازهٔ 24–32dp ناپدید نشود.
- آیکون active/inactive باید در silhouette هم قابل تشخیص باشد؛ صرفاً تغییر رنگ کافی نیست.
- وضعیت‌های completed/current/locked با color-only ارائه نشوند.
- فایل SVG با XML parser و Android VectorDrawable با XML parser بررسی شود؛ AAPT/Gradle resource linking نیز در repo تست شود.
- نام‌ها snake_case، prefix `shomara_` و بدون حروف بزرگ باشند.
