# یادداشت اجرای صفحهٔ ۱۶ — System states (خانوادهٔ 16 — shared)

شاخه: `page-16-system-states` (زنجیره از `page-15-settings-parent`). تاریخ: ۲۰۲۶-۱۱-۰۷.

## AUDIT این دور: بدون تغییر کد

`ShomaraStateSurface` (Loading/Error/Empty مشترک) در صفحه‌های مسیر/placement دیده و تأیید شد:
- مسیر: Loading/Error/Empty سه سطح (ShomaraPathGraph.kt:298-319) — متن‌های گرم، بدون ترس.
- Placement: pending «در حال آماده‌سازی…» + ‏liveRegion تازه (page-05).
- بنرها: ‏liveRegion Polite، آیکن‌ها decorative، kind با متن سفر می‌کند (R-13).
- آفلاین: بنر Recovery در مسیر + پیام‌های شبکهٔ گرم (`ShomaraNetworkFailure.userMessage`).

## ثبت برای مالک (بدون تغییر)

- Empty surface مسیر هنوز محتوای واقعی ندارد (۲۵ ایستگاه همیشه هست) — عملاً دست‌نیافتنی؛ با ADR-0039 (محتوای آفلاین) معنا می‌گیرد.
- State ها همه متن‌محورند؛ افزودن تصویر state = asset تازه (DECISFRED).
