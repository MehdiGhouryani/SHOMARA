<!-- Snapshot تاریخی N03 (2026-10-31) — canonical: `design/playbook/COMPONENT_READINESS.md`؛ این فایل قرارداد نیست. -->
<!-- Historical N03 snapshot; the component-readiness contract lives in `design/playbook/COMPONENT_READINESS.md`. -->

# Native Design System readiness — N03 snapshot (2026-10-31)

این سند وضعیت صادقانهٔ componentهای N03 را ثبت می‌کند. طبق `design/playbook/COMPONENT_READINESS.md`، وضعیت هر خانواده فقط با شواهد نام‌برده تغییر می‌کند؛ «فقط preview یا source test» یعنی `NATIVE_PENDING`، نه `TESTED_NATIVE`.

## شواهد مشترک (همهٔ خانواده‌ها)

- token source واحد: `packages/design-system/src/tokens.json` (schemaVersion 2.0.0، بلاک v2 canonical طبق ADR-0037 L6) → codegen `tools/token-codegen/generate.mjs` با drift gate (`--check` + تست vitest).
- گیت صفر magic value: `scripts/verify-design-system-native.mjs` — هیچ hex، dp/sp یا FontWeight خام خارج از `ShomaraTokens.kt` در `:core:designsystem` و `:app` مجاز نیست + ممنوعه‌های ایمنی کودک.
- گیت ماژول: `./gradlew :core:designsystem:test :core:designsystem:lint` — ۵۶ تست JVM سبز؛ `npm run android:gate` PASS (test/lint/compile کل پروژه).
- جهت: رابط RTL پیش‌فرض، ریاضی LTR مستقل (`ShomaraDirections`، `LocalShomaraMathDirection`).

## وضعیت خانواده‌ها

| خانواده | پیاده‌سازی | state matrix | تست semantics (JVM) | Catalog fixture | Screenshot/Device |
|---|---|---|---|---|---|
| Button (`ShomaraButton`) | ✓ | 5 حالت × 3 واریانت | ✓ (guard، depth reduction، 48dp) | ✓ | NATIVE_PENDING |
| TextField/OTP (`ShomaraTextField`, `ShomaraOtpInput`) | ✓ | 6 حالت | ✓ (mapping قطعی، LTR progression، error متنی) | ✓ | NATIVE_PENDING |
| Card/Choice (`ShomaraCard`, `ShomaraChoiceTile`) | ✓ | 7 حالت | ✓ (non-color carrier، single-select) | ✓ | NATIVE_PENDING |
| Feedback (`ShomaraFeedbackBanner`) | ✓ | 4 kind | ✓ (warm-neutral تست‌شده، ارتفاع ثابت) | ✓ | NATIVE_PENDING |
| Progress (`ShomaraProgressBar`) | ✓ | 4 حالت | ✓ (reducedMotion، announcement قطعی) | ✓ | NATIVE_PENDING |
| TopBar/TabBar (`ShomaraTopBar`, `ShomaraTabBar`) | ✓ | default/selected/locked/badge-free | ✓ (قرارداد ۳ تب، duplicate-nav) | ✓ | NATIVE_PENDING |
| Dialog/Sheet (`ShomaraDialog`, `ShomaraBottomSheet`) | ✓ | open/busy/error/dismiss-blocked | ✓ (dismiss fail-closed) | logic preview* | NATIVE_PENDING |
| AudioControl (`ShomaraAudioControl`) | ✓ | 6 حالت | ✓ (fallback اجباری، never-locked) | ✓ | NATIVE_PENDING |
| Manipulative (`ShomaraNumberTile` و…) | ✓ | 6 حالت | ✓ (باند ۷۲–۸۰، tap alternative، LTR math) | ✓ | NATIVE_PENDING |

\* Dialog/Sheet برای فیکس قطعی catalog به‌صورت logic preview ثبت شد (open بودن آن‌ها تعاملی است)؛ screenshot بعد از Paparazzi/device.

## چه چیزی در N03 اثبات شد و چه چیزی نه

- **اثبات‌شده**: کامپایل واقعی Gradle، lint سبز، ۵۶ تست JVM رفتاری (state matrix، ابعاد توکنی، معنای جهت، duplicate-action، fallback صوت، باند manipulative)، catalog ماتریس (۹ خانواده × ۳ عرض × ۲ font scale)، گیت صفر raw token، گیت ممنوعه‌های ایمنی کودک.
- **NATIVE_PENDING (مسیر شواهد آینده)**: screenshot واقعی در 360/390/412dp و font scale ۲۰۰٪ (Paparazzi در cache آفلاین موجود نبود؛ plugin اضافه نشد — تصمیم dependency به مالک)، TalkBack واقعی روی دستگاه، لمس واقعی (fast tap)، فونت Vazirmatn (نیازمند asset از مالک — L10 دانلود را منع می‌کند).

## گیت مالک (HG-02)

تأیید نهایی Design System یک human gate است. با توجه به بند بالا، `N03-07` با وضعیت `DONE_WITH_BLOCKER` ثبت شده: همهٔ گیت‌های ماشینی سبزند، اما امضای مالک (HG-02) و شواهد visual/device هنوز Collect نشده‌اند.
