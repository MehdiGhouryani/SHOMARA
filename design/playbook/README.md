# design/playbook — فهرست (index)

این پوشه، دفترچهٔ راهنمای اجرایی SHOMARA است. **کاننیکال‌ها** قراردادند؛ **یادداشت‌های اجرایی**
(run-notes) فقط گزارشِ یک مرحله‌اند و مرجع تصمیم نیستند.

## کاننیکال‌ها

| فایل | چیست |
|---|---|
| `../MASTER.md` | قرارداد طراحی (توکن‌ها، dialها، قوانین ایمنی کودک) — هم‌گام با ADR-0039 |
| `../INSPIRATION_GUARDRAILS.md` | زنجیرهٔ تقدم + مرزهای کپی دولینگو — هم‌گام با ADR-0039 |
| `MASTER_EXECUTION.md` | ترتیب اجرای کار |
| `PAGE_UIUX_BLUEPRINT.md` | قرارداد ۱۷ خانوادهٔ صفحه — هم‌گام با ADR-0039 |
| `COMPONENT_READINESS.md` | آمادگی کامپوننت‌ها (canonical؛ snapshotهای `docs/design/` قرارداد نیستند) |
| `ROUTE_REGISTRY.md` | نگاشت route ↔ خانوادهٔ صفحه |
| `IMAGE_REGISTRY.md` | فهرست تصاویرِ در انتظار مالک (P1–P8 + S1 NOT NEEDED) |
| `DUOLINGO_COPY_CHECKLIST_FA.md` | چک‌لیست کپی دقیق UI/UX دولینگو — ۲۶۹ آیتم قابل‌تیک، خانواده‌ها ۰۱–۱۷ + کامپوننت‌های مشترک |
| `ASSET_AND_COMPONENT_PROMPTS_FA.md` | پرامپت طراحی هر تصویر/جزء بصری (۲۱ ردیف: P1–P8، S1، N1–N12) |

ADR کاننیکال: `../../docs/adr/ADR-0039-fully-offline-content-and-duolingo-copy-ui.md`
(محتوای کاملاً آفلاین + کپی ساختار دولینگو؛ O1–O13 باز). فایل `ADR-0039-…md` در همین پوشه
فقط یک stub ارجاعی به آن نسخه است.

## یادداشت‌های اجرایی (run-notes — مرجع تصمیم نیستند)

| فایل | چیست |
|---|---|
| `STEP_ZERO_RECONCILIATION.md` | قدم صفر: مغایرت شمارش N08، تعارض TalkBack، سه لایهٔ شخصیت |
| `POSE_TO_PAGE_MAPPING_DRAFT.md` | نگاشت pose به صفحه — پیش‌نویس؛ pose عددی TBD |
| `STAGE1_IMPLEMENTATION_NOTE.md` تا `STAGE5_IMPLEMENTATION_NOTE.md` | گزارش مراحل ۱ تا ۵ |
| `PHASE_A_PATH_IMPLEMENTATION_NOTE.md` | گزارش فاز A (مسیر دولینگو) |
| `PHASE_D_READINESS_ASSESSMENT.md` | حکم آمادگی هر خانوادهٔ فاز D |
| `COPY_CHECKLIST_APPLICATION_NOTE.md` | به‌کارگیری چک‌لیست کپی روی صفحه‌ها: چه انجام شد، چه نشد و چرا |

## زیرپوشه‌ها

- `pages/` — قرارداد ۱۷ خانوادهٔ صفحه (فایل‌به‌فایل).
- `quality/` — ledger صفحه‌ها (`SCREEN_LEDGER.csv` و…)؛ وضعیت Native فقط با شواهد دستگاهی تغییر می‌کند.
