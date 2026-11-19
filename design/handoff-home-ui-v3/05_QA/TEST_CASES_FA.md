# سناریوهای تست مورد انتظار صفحهٔ مسیر

| ID | پیش‌شرط | اقدام | نتیجهٔ مورد انتظار |
|---|---|---|---|
| T01 | کودک تازه‌وارد با placement واقعی | ورود به مسیر | state Fresh واقعی؛ هیچ پیشرفت یا station فرضی نمایش داده نشود |
| T02 | current station معتبر | زدن CTA اصلی | دقیقاً یک بار route شروع/ادامه همان station باز شود |
| T03 | station تکمیل‌شده | بازکردن node | فقط اگر review route وجود دارد وارد شود؛ status تغییر نکند |
| T04 | perfect ثبت‌شده | نمایش مسیر | ring ثانویه و semantics perfect فقط برای همان station |
| T05 | locked با guide action | لمس node | راهنمای علت قفل باز شود؛ disabled state اعلام نشود |
| T06 | locked بدون action | لمس node | هیچ route/عمل جعلی و هیچ crash رخ ندهد |
| T07 | progress total نامشخص | نمایش Chapter card | determinate fraction جعلی یا 0% نمایشی نشان داده نشود |
| T08 | اینترنت خاموش | ورود به مسیر | محتوای بستهٔ محلی در دسترس؛ offline banner سراسری بی‌دلیل نمایش داده نشود |
| T09 | asset محلی مفقود | بازکردن station | پیام محلیِ درست + retry/back واقعی؛ station دیگری جایگزین نشود |
| T10 | tap سریع روی CTA | چند لمس متوالی | single in-flight action/guard؛ route یا answer action دوبار اجرا نشود |
| T11 | tab فعلی انتخاب‌شده | لمس مجدد همان tab | stack اضافی ایجاد نشود و screen state/scroll بی‌دلیل reset نشود |
| T12 | مسیر چند فصل | scroll و خروج/بازگشت | anchor معتبر برگردد؛ اگر anchor حذف شده، fallback مشخص و stable |
| T13 | 360dp + font scale 200% | نمایش متن بلند | title، CTA، lock reason، tab label بریده یا overlap نشود |
| T14 | TalkBack | traversal مسیر | label، role، selected، current/completed/locked و reason درست خوانده شود |
| T15 | Reduced Motion روشن | تغییر tab/حالت/بارگذاری | animation محدود یا حذف؛ نتیجه و feedback همچنان واضح |
| T16 | gesture navigation | scroll تا انتهای مسیر | آخرین node و CTA زیر bottom bar/gesture handle مخفی نشوند |
