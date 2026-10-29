# راهنمای مستندات SHOMARA

وضعیت پروژه در این فایل نگه‌داری نمی‌شود. برای وضعیت روز `START_HERE.md` و برای task بعدی `node tools/harness.mjs next` را ببینید.

## مطالعهٔ اجباری

1. `AGENTS.md`
2. `START_HERE.md`
3. `ZCODE.md` در چت/عامل جدید
4. `harness/roadmap.json`
5. فقط سندهای مربوط به task فعال

## طبقه‌بندی پوشه‌ها

| مسیر | طبقه | کاربرد |
|---|---|---|
| `roadmap/` | canonical | برنامهٔ فازها و checklist انسانی |
| `architecture/` | canonical | مرز repository/package/design system |
| `adr/` | active protected | تصمیم معماری؛ تغییر با review |
| `api/` | active protected | قرارداد API |
| `reference/` | active protected | قرارداد محصول و UX |
| `source/` | active protected | مشخصات دامنهٔ موجود |
| `qa/` | active | checklist و phase evidence لازم verifier |
| `release/` | active legacy | قرارداد release فعلی Expo تا cutover |
| `delivery/` | canonical checkpoints | manifest تحویل‌های نسخه‌دار و نتیجهٔ gateها |
| `design-handoff-2026-10/` | legacy active | goldenهای V1؛ حذف فقط بعد از مهاجرت verifier |
| `history/` | legacy active | manifestهای خوانده‌شده توسط verifierهای قدیمی |
| `archive/` | historical | شواهد گذشته؛ منبع تصمیم جاری نیست |

`docs/ui-v2-migration-ledger.md` تا پایان مهاجرت consumerهای Expo در جای فعلی می‌ماند، چون Playbook جاری به آن ارجاع دارد.

برای اجرای Native gate ابتدا `skills/shomara-android-build/SKILL.md` و `architecture/ANDROID_BUILD_ENVIRONMENT.md` را بخوان، سپس `npm run android:doctor` و `npm run android:gate` را اجرا کن؛ static verifier جای SDK/Gradle واقعی نیست. debug APK فقط از `npm run android:assemble:debug` و با hash report ساخته می‌شود.

راهنمای UI/UX خارج از `docs/` و در `design/` نگه‌داری می‌شود: از `skills/shomara-product-design/SKILL.md` شروع کنید، سپس `design/MASTER.md`، `design/INSPIRATION_GUARDRAILS.md`، نقشهٔ همهٔ صفحه‌ها در `design/playbook/PAGE_UIUX_BLUEPRINT.md` و صفحهٔ مرتبط در `design/playbook/pages/` را بخوانید. token/theme/component از `skills/shomara-design-system/SKILL.md` و `design/playbook/COMPONENT_READINESS.md` عبور می‌کند. برای پیاده‌سازی route روی Android، `skills/shomara-screen-execution/SKILL.md`، `design/playbook/NATIVE_IMPLEMENTATION.md`، `ROUTE_REGISTRY.md` و backlog اجرایی `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` اجباری‌اند. پژوهش/محتوا در `content-library/` محافظت می‌شود و کار روی آن از `skills/shomara-learning-content/SKILL.md` شروع می‌شود؛ مرز authoring/CMS در `content-library/integration/AUTHORING_CONTRACT_GAPS.md` canonical است.

## قوانین سند

- یک موضوع فقط یک سند canonical دارد.
- status و next task فقط در START_HERE/harness تغییر می‌کند.
- evidence تاریخی بازنویسی نمی‌شود.
- سند legacy با banner یا index از canonical جدا می‌شود؛ حذف آن نیازمند consumer map است.
- لینک به فایل حذف‌شده باید در همان commit اصلاح شود.
- سند جدید فقط برای contract، architecture، QA یا roadmap واقعی ساخته می‌شود؛ handoff موازی ممنوع است.
- جزئیات اجرایی مختص عامل در `skills/<name>/references/` می‌رود؛ قرارداد محصول/طراحی در `design/` می‌ماند و بین Skillها کپی نمی‌شود.
