# تصمیم‌های بصری و دامنهٔ طراحی

## تصمیم‌های تثبیت‌شده در این handoff

1. زبان بصری نرم و شاد تصویر مرجع اقتباس می‌شود: زمینهٔ lavender mist، کارت سفید، radius بزرگ و depth ظریف.
2. بنفش برای active/selection و سبز برای تکمیل واقعی استفاده می‌شود؛ زرد فقط برای شروع/تأکید کوچک.
3. صفحه به‌عنوان مسیر یادگیری طراحی شده، نه dashboard با چندین موضوع و reward box.
4. ساختار مسیر از کد `ShomaraPathGraph` پروژه استفاده می‌کند؛ مسیر جدیدی جدا از domain نمی‌سازیم.
5. Bottom navigation دقیقاً سه مقصد کودک دارد و icon SVG + VectorDrawable برای هر دو حالت ساخته شده است.
6. Character assets از checkout رسمی پروژه استفاده می‌شوند؛ Main و Number دوباره بسته‌بندی نمی‌شوند، Fandogh نصب‌کنندهٔ native دارد.
7. Footer landscape یک تزئین اختیاری است؛ اگر به عملکرد/خوانایی لطمه زد، حذف می‌شود.

## مواردی که Harness باید با شواهد بررسی کند

- آیا Header در app shell فعلی واقعاً به settings نیاز دارد یا action باید حذف شود؟
- آیا Continue card باید جای current node را بگیرد یا CTA در خود node موجود بماند؟ دو CTA با event مشابه نمایش داده نشود.
- آیا chapter ribbon در data فعلی boundary واقعی دارد؟ فقط بر اساس مرز chapter render شود.
- آیا FAB برگشت به ایستگاه فعلی لازم است؟ در scroll کوتاه و 360dp نباید هم‌پوشانی کند.
- آیا زمینهٔ باغچه در صفحهٔ واقعی به‌دلیل overdraw یا شلوغی حذف شود؟ تصمیم با screenshot دستگاه واقعی.
- آیا بنفش محلی باید پس از design-owner approval به semantic token مشترک تبدیل شود؟ تا آن زمان global tokens تغییر نکنند.

## مواردی که از تصویر مرجع عمداً اقتباس نشده‌اند

- سکه/امتیاز/تروفی/Badge economy
- streak و شمارش روزهای از دست رفته
- hearts/lives، random gift و loot box
- recommendation tiles نامرتبط با مسیر فعلی
- نوارهای tab اضافی برای Stories/Games/Rewards

این عناصر با محدوده و اصول محصول فعلی شمارا سازگار نیستند.
