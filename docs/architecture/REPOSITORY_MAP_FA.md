# نقشهٔ repository و طبقه‌بندی مسیرها

این سند مرزهای سطح بالا را توضیح می‌دهد؛ وضعیت ماشینی و تصمیم حذف در `harness/file-ledger.json` است.

| مسیر | نقش | وضعیت در مهاجرت |
|---|---|---|
| `apps/mobile` | کلاینت Expo فعلی و baseline رفتاری | `LEGACY_ACTIVE` تا cutover |
| `apps/web` | Web demo، API و سطح بزرگسال | `ACTIVE` |
| `apps/android` | مقصد Android Native | از N02 ایجاد می‌شود |
| `packages/contracts` | قراردادهای مشترک و policy | `ACTIVE_PROTECTED` |
| `packages/*-runtime` | منطق دامنه و runtime | `ACTIVE_PROTECTED` |
| `packages/design-system` | token source فعلی | `ACTIVE_MIGRATION_SOURCE` |
| `supabase` | migration و backend schema | `ACTIVE_PROTECTED` |
| `content` | dev content packs | `ACTIVE_RESTRICTED` |
| `CONTENT_LIBRARY` | مواد پژوهشی/draft؛ نه runtime | `DRAFT_RESTRICTED` |
| `DESIGN/SHOMARA_PLAYBOOK` | قرارداد فرایند UI/UX | `ACTIVE_GUIDANCE` |
| `project-design-v2` | pipeline فعال asset/character | `ACTIVE_GENERATOR` |
| `docs/design-handoff-2026-10` | golden و مرجع V1 | `LEGACY_ACTIVE` تا مهاجرت verifier |
| `docs/archive` | evidence تاریخی | `HISTORICAL` |
| `docs/history` | manifestهای خوانده‌شده توسط verifier | `LEGACY_ACTIVE` |
| `scripts` | gateها و ابزارهای legacy | `ACTIVE_MIXED`؛ مرحله‌ای مهاجرت شود |
| `harness` + `tools/harness.mjs` | ادامه‌پذیری و task graph | `CANONICAL_ACTIVE` |

## فایل‌های canonical ریشه

- `README.md`: معرفی کوتاه.
- `AGENTS.md`: قوانین پایدار عامل‌ها.
- `START_HERE.md`: وضعیت انسانی روز.
- `ZCODE.md`: راه‌اندازی مستقل چت/عامل.
- `ROADMAP_PHASES.md`: ledger تاریخی موقت؛ فقط چون verifierهای legacy مصرفش می‌کنند.

فایل‌های قدیمی نصب ZIP، manifest بسته و master prompt موازی در N01 حذف شدند. تاریخچهٔ Git مرجع بازیابی آن‌هاست.

## سیاست جابه‌جایی

- مسیر active بدون consumer map جابه‌جا نمی‌شود.
- move تاریخی باید import، verifier و لینک مستندات را در همان commit اصلاح کند.
- artifact تولیدی در Git ممنوع است.
- خروجی تحویل در repository commit نمی‌شود؛ از `git archive` ساخته می‌شود.
