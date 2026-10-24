# Progression Contract

این فایل قرارداد اجرایی تجربه `Path → Unit → Station Start → Station` است. منبع executable آن `packages/contracts/src/progression.ts` است.

## Status semantics

| وضعیت | معنی |
|---|---|
| COMPLETED | ایستگاه طبق truth معتبر کامل شده است. |
| CURRENT | قدم اصلی فعلی کودک است. |
| AVAILABLE | در صورت وجود محتوا آماده شروع است. |
| LOCKED | پیش‌نیاز یادگیری کامل نشده؛ با دانلود اشتباه نشود. |
| NOT_DOWNLOADED | پیش‌نیاز باز است اما بسته محتوا روی دستگاه آماده نیست. |
| SYNC_PENDING | نتیجه محلی هنوز authoritative sync نشده است. |

`LOCKED`, `NOT_DOWNLOADED` و `SYNC_PENDING` فقط با تغییر رنگ نمایش داده نمی‌شوند؛ متن وضعیت باید همراه آنها وجود داشته باشد.

## Canonical flow

`S07 Path → S08 Unit → S09 Station Start → S10 Lesson`

پرش از S08/S07 فقط به S13 می‌رود و خودش هیچ unlock جعلی انجام نمی‌دهد. تصمیم بازشدن باید از learning runtime معتبر بیاید.
