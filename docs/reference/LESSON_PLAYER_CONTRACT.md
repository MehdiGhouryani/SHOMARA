# Lesson Player Contract

این سند قرارداد اجرایی تجربه درس برای Web و Mobile است.

## اصول

- پاسخ آموزشی فقط با نتیجه server-authoritative معتبر می‌شود.
- در assessment شخصیت companion نمایش داده نمی‌شود.
- feedback باید یک action اصلی داشته باشد.
- خطای شبکه نباید به‌عنوان موفقیت آموزشی نمایش داده شود.
- خروج از درس در میانه مسیر نیازمند تأیید است.
- progress صرفاً وضعیت journey را نشان می‌دهد و معادل mastery نیست.
- recovery و recheck stateهای مستقل هستند.

## States

`ENTRY → TEACH → PRACTICE → ASSESSMENT → RECOVERY/RECHECK → RESULT → COMPLETE`

## Shared source

- `packages/contracts/src/lesson.ts`
- Web: `LessonPlayerHeader`, `LessonFeedback`
- Mobile: `LessonPlayerChrome`, `LessonFeedbackCard`
