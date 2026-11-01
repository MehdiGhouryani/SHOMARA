# Offline / CMS / Audio readiness — N07 (2026-11-01)

وضعیت صادقانهٔ offline-first، sync و خط لولهٔ صوت/CMS پس از فاز N07.

## اثبات‌شده (Gradle JVM + Vitest)

| حوزه | قرارداد | شواهد |
|---|---|---|
| N07-01 | ۴ جدول محلی + migration v1→v2 | `LocalLearningDatabase`: ردیف‌ها حفظ می‌شوند؛ downgrade/corrupt fail-closed؛ فیلدهای ممنوعه قبل از persistence رد می‌شوند (۶ تست) |
| N07-02 | Outbox sync idempotent | FIFO + backoff نمایی + jitter؛ key حفظ می‌شود؛ 4xx → قرنطینه فوری؛ **Server-Wins**: progress محلی به truth سرور reconcile می‌شود (۶ تست) |
| N07-03 | Manifest نسخه‌دار | SHA-256 + schema gate قبل از write؛ mismatch/unsupported → rollback با حفظ نسخه فعال (۶ تست) |
| N07-04 | Audio cache | SHA-256 gate برای ReadyCached؛ خراب → قرنطینه؛ مفقود → fallback متنی غیرمسدود (۴ تست) |
| N07-05/09 | CMS governance | RBAC پنج‌نقشی، audit trail، LISTEN_REVIEW_REQUIRED، reversible publish/rollback با package checksum، reports impact/orphan/missing (۹ تست Vitest) |
| N07-08 | Draft import ۲۳۲ ردیف | 179+53=232 idempotent؛ همه DRAFT/UNPUBLISHED_NO_BINARY؛ voice hint غیرمؤثر؛ صفر binary claim (TS + Kotlin) |

## سفر بحرانی کودک (N07-06/07 — سطح منطق)

`Cold start با manifest کش‌شده → Path → Station Start → Lesson P1..P5 با صوت مفقود/خراب → fallback متنی → تلاش آفلاین در Outbox → process death → restart و restore outbox/checkpoint → شبکه برگشت → drain idempotent → Server-Wins` — همهٔ حلقه‌ها با تست JVM پوشش داده شد (`OfflineJourneyTest`). Corrupt SHA-256 برای manifest و باینری صوت هر دو قرنطینه و fallback می‌شوند.

## NATIVE_PENDING (صادقانه)

- `connectedCheck` و تست device واقعی (بدون AVD در این ماشین).
- اتصال backend واقعی sync/lesson (I2) — transport فعلی همه‌چیز را retriable نگه می‌دارد تا عملیات گم نشود.
- باینری‌های صوتی واقعی وجود ندارند؛ هر ۲۳۲ ردیف DRAFT/UNPUBLISHED_NO_BINARY می‌مانند تا workflow تولید صوت (N07-05) توسط مالک اجرا شود.
- Room/SQLite واقعی به‌جای in-memory tables نیازمند dependency Room — تصمیم dependency با مالک (جدول‌ها همین interface را دارند).
