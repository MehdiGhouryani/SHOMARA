# برنامهٔ یکپارچه‌سازی Design System در مهاجرت Native

## وضعیت کشف‌شده

- token source فعلی: `packages/design-system/src/tokens.json`.
- UI V1: 22 مصرف‌کنندهٔ خارجی باقی‌مانده و مجموعهٔ parity/golden وابسته.
- UI V2: 22 مصرف‌کنندهٔ خارجی و routeهای فعال Expo.
- `ui/v2/Character.tsx` هنوز به asset mapping در V1 وابسته است؛ بنابراین V1 را نمی‌توان پوشه‌ای حذف کرد.
- هیچ deep import از workspaceهای `@math/*` کشف نشد؛ مرز package فعلی سالم است.

اعداد authoritative در `harness/dependency-map.json` و audit تکرارپذیر در `tools/dependency-audit.mjs` قرار دارند.

## مقصد V3

ورودی تصمیم N03 از `skills/shomara-design-system/SKILL.md` و قرارداد componentها از `design/playbook/COMPONENT_READINESS.md` می‌آید. انتخاب‌های الهامی فقط پس از فیلتر `design/INSPIRATION_GUARDRAILS.md` معتبرند.

1. `packages/design-system/src/tokens.json` موقتاً canonical می‌ماند.
2. schema مستقل برای color/type/space/radius/elevation/motion/touch/illustration ساخته می‌شود.
3. codegen دو خروجی می‌دهد:
   - TypeScript برای Web/Expo legacy؛
   - Kotlin برای `apps/android/core/designsystem`.
4. فایل generated دستی ویرایش نمی‌شود و drift verifier دارد.
5. tokenها semantic هستند؛ نام V1/V2 وارد API دائمی نمی‌شود.

## ترتیب مهاجرت

### موج A — تثبیت منبع

- schema و validation برای JSON موجود؛
- ثبت raw/missing/duplicate tokenها؛
- بدون تغییر بصری route.

### موج B — Compose primitives

- `ShomaraTheme` و component catalog؛
- state matrix و چهار depth tier برای هر component طبق readiness contract؛
- screenshot/a11y tests؛
- سه صفحهٔ نماینده: Auth، Path، Lesson.

### موج C — جداسازی V1 از V2 Expo

- asset/character mapping مشترک از `ui/v1` به مسیر neutral منتقل شود؛
- routeهای فعال فقط V2/neutral import کنند؛
- parity V1 تا وجود آخرین consumer حفظ شود.

### موج D — بازنشستگی

- صفر import خارجی V1؛
- معادل Native/V3 برای assertionهای رفتاری وجود داشته باشد؛
- Chromium parity و flow قبل از حذف سبز باشد؛
- V1، goldenها و verifierهای اختصاصی در یک commit مستقل حذف شوند.

## معیار توقف

- افزایش threshold یا حذف assertion برای عبور ممنوع است.
- اگر token جدید معنای محصولی دارد، ابتدا ADR/owner decision.
- browser screenshot جای device/TalkBack evidence را نمی‌گیرد.
- تا پایان N09، V2 Expo مرجع موقت رفتار است؛ منبع معماری Native نیست.
