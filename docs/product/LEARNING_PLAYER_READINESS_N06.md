# Learning player readiness — N06 (2026-11-01)

وضعیت صادقانهٔ player آموزشی پس از فاز N06. منبع قرارداد: `content-library/integration/AUTHORING_CONTRACT_GAPS.md` + `design/playbook/PAGE_UIUX_BLUEPRINT.md` (خانواده‌های ۰۸–۱۱ و ۱۳).

## قراردادهای حل‌شده (با مجوز مالک؛ originals دست‌نخورده)

| Issue | تصمیم | نقطهٔ اعمال |
|---|---|---|
| CONTENT-001 | خط کرسینگ ۱ بالابه‌پایین canonical؛ traceToleranceDp=28 سروری؛ جایگزین تپ کاملاً هم‌ارز | `T13TraceAdapter` + `ServerLearningConfig` |
| CONTENT-002 | شمارش سؤال پرش از config نسخه‌دار سرور (station=1، chapter=5)؛ کلاینت هرگز hardcode نمی‌کند | `ServerLearningConfig` |
| CONTENT-003 | h1/h2/h3 در P4/P5 ممنوع (validator سخت‌گیر)؛ در P1..P3 به‌عنوان scaffold مجاز | `hintViolations` + guard |
| CONTENT-008 | سه مدل جدا؛ stripper عمیق با throw روی هر آلودگی (answer/evaluator/threshold/reviewer) | `projectForChild`/`projectionViolations` |
| CONTENT-014 | masteryPassThreshold=3/4 سروری؛ recovery غیرتنبیهی؛ next step فقط سرور | `ShomaraResultLogic` |
| CONTENT-015 | behavior ID typed (P{1..5}_*)؛ نگاشت prose Stage-6 به lifecycle ۷مرحله‌ای؛ ۴ نقش بازبینی اجباری | `behaviorIdFor`/`canonicalStageFromLegacy` |
| CONTENT-017 | AudioPolicy.EXPECTED_NEVER_BLOCKING در همهٔ templateها؛ fallback متنی اجباری | `T15StoryAdapter`/`ShomaraTeachLogic` |
| CONTENT-018 | telemetry فقط ID (session/encounter/interaction/choice)؛ پاسخ خام/درستی/PII هرگز | `AttemptTelemetry`/`AttemptSubmission` |

## اثبات‌شده (Gradle/JVM/MockWebServer)

- مرز سه‌لایه‌ای: ۱۳ تست Vitest + ۸ تست JUnit — صفر answer/evaluator/threshold/reviewer در published و child JSON؛ آلودگی عمیق در ساخت throw می‌شود.
- LessonGateway: Idempotency-Key قطعی؛ 201/200/400/5xx/timeout/offline با MockWebServer؛ endpoint پیکربندی‌نشده fail-closed با صفر فراخوانی.
- سفر ST07 (تست E2E سطح منطق): P1→P5 با HTTP واقعی، قطع میانه با checkpoint و resume دقیق، retry با همان key (تأیید FIFO روی سرور)، `nonProductionDraft=true`/`STAGED_PILOT` ثابت و رد شدن در runtime production.
- chrome درس: progress سرور-محور، close-confirm fail-safe، checkpoint واقعی DataStore.

## NATIVE_PENDING (صادقانه)

- اسکرین‌شات واقعی player در ۳۶۰/۳۹۰/۴۱۲ و TalkBack روی دستگاه (پروتکل N03/N04).
- `connectedCheck` (بدون AVD در این ماشین).
- اتصال backend واقعی OTP/lesson (I2) — endpointها تا پیکربندی مالک null و fail-closed هستند.
- صوت واقعی (lifecycle صوت ۷مرحله‌ای تعریف شد؛ assetها با N07 می‌آیند).
