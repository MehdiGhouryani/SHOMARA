# ممیزی و اصلاح Design System نیتیو SHOMARA — N11-04

- تاریخ: 2026-11-17
- شاخهٔ اجرا: `work/shomara-deep-transformation`
- مبنای ممیزی: `infra/p14b-home-ui@6cd0e7ac7e69d6d5a6117f38ccbcb9b2bc69eb8c`
- وضعیت: **کد و تست‌های logic اصلاح شده؛ Android CI در checkpoint قبلی PASS؛ آخرین CI پس از اصلاحات Button هنوز باید دوباره تأیید شود. همهٔ visual/device gates بازند.**
- مراجع: `design/MASTER.md`، `design/INSPIRATION_GUARDRAILS.md`، `skills/shomara-design-system/SKILL.md`، `COMPONENT_READINESS.md`، `NATIVE_IMPLEMENTATION.md`.

## 1. تصمیم‌های کلیدی

| موضوع | وضعیت | تصمیم |
|---|---|---|
| Token source | KEEP | `packages/design-system/src/tokens.json` با schema v2، منبع canonical Android است. |
| Code generation | KEEP | Kotlin و TypeScript از generator تولید می‌شوند؛ فایل generated دستی تغییر نمی‌کند. |
| v1 legacy tokens | KEEP / DEFER RETIRE | تا اثبات consumer-free بودن سطح‌های وب/قدیمی حذف یا merge نمی‌شود. |
| Theme + semantic tokens | KEEP | `ShomaraTheme.kt` و `ShomaraTokens.kt` مسیر واحد هستند. |
| Clay resolver موازی | RETIRE | enum/resolver قدیمی حذف؛ همه consumerها از `ShomaraClayDepth` و `ShomaraClay` استفاده می‌کنند. |
| Clay token mapping | REVISE → source implemented | هر چهار tier تمام propertyها را از v2 token می‌گیرند؛ renderer هنوز همه propertyها را مستقل اعمال نمی‌کند. |
| Card border | REVISE → source implemented | border از depth state resolve می‌شود، نه Soft ثابت. |
| Ghost Button border | REVISE → source implemented | Ghost از نظر shadow Flat است، اما outline یک‌پیکسلی آن از HintBorderWidth تأمین می‌شود. |
| Typography font | OPEN / OWNER INPUT | Theme از `FontFamily.Default` استفاده می‌کند؛ TTF مجاز Vazirmatn در مخزن موجود نیست و دانلود تصادفی ممنوع است. |
| Native validation | NATIVE_PENDING | unit/lint/compile معادل Compose semantics، screenshot یا دستگاه واقعی نیست. |

## 2. قرارداد token

- schemaVersion = 2.0.0؛ v2 دارای color/type/space/radius/shadow/motion/component/clay است.
- spacing canonical: 4، 8، 12، 16، 20، 24، 32 و 40dp.
- حداقل touch target عمومی 48dp؛ manipulative کودک 72–80dp؛ node مسیر 84dp.
- motion durationهای canonical: 120/220/340ms.
- Clay چهار tier دارد: Flat، Hint، Soft، Featured؛ Featured برای بیش از یک focal surface در viewport تصمیم مجاز نیست.
- سطح‌های top-level قدیمی v1 تا زمان مهاجرت وب حفظ می‌شوند؛ generator نیتیو از v2 خروجی می‌دهد.

## 3. ماتریس implementation واقعی

| خانواده | Source | JVM logic tests | Native device |
|---|---|---|---|
| Button | `ShomaraButton.kt` | `ShomaraPrimitives03Test` | NATIVE_PENDING |
| TextField / OTP | `ShomaraTextField.kt`, `ShomaraOtp.kt` | `ShomaraPrimitives03Test` | NATIVE_PENDING |
| Card / Choice | `ShomaraCard.kt` | `ShomaraPrimitives04Test` | NATIVE_PENDING |
| Feedback / Progress | `ShomaraFeedback.kt`, `ShomaraProgress.kt` | `ShomaraPrimitives04Test` | NATIVE_PENDING |
| TopBar / TabBar | `ShomaraNavigation.kt` | `ShomaraPrimitives05Test` | NATIVE_PENDING |
| Dialog / Sheet | `ShomaraDialog.kt` | `ShomaraPrimitives05Test` | NATIVE_PENDING |
| AudioControl | `ShomaraAudio.kt` | `ShomaraPrimitives05Test` | NATIVE_PENDING |
| Manipulative | `ShomaraManipulative.kt` | `ShomaraManipulativeTest` | NATIVE_PENDING |
| Theme / Clay / Motion | `ShomaraTheme.kt`, `ClaySurface.kt`, `ShomaraMotion.kt` | `ShomaraThemeTest`, `ClayContractTest`, `ShomaraMotionTest` | NATIVE_PENDING |

وضعیت Native تمام ردیف‌ها عمداً باز است؛ هیچ screenshot device، Compose UI instrumentation/TalkBack یا physical journey در این checkpoint ارائه نشده است.

## 4. اصلاحات source در این checkpoint

### 4.1 یکپارچه‌سازی Clay
- resolver تکراری `ClayDepth/ClaySpecResolver` از `ClaySurface.kt` حذف شد.
- `ClaySurface`، `PathKit`، `LessonKit`، Previewها و Debug Gallery به `ShomaraClayDepth` مهاجرت کردند.
- چهار tier در `ShomaraClay` اکنون borderWidth، shadowOpacity، shadowRadius، shadowOffsetY، highlightOpacity، highlightThickness و elevation را از generated v2 tokens می‌گیرند.
- تست قدیمی که Hint را معادل Flat با elevation متفاوت فرض می‌کرد اصلاح شد؛ تست‌های Theme و Clay هر چهار tier را property-by-property assert می‌کنند.
- یک ارجاع پنهان در Debug Gallery توسط Android compile کشف و اصلاح شد.

### 4.2 یکسان‌سازی state و border
- Card border در تمام stateها از همان Clay tier محاسبه می‌شود: Disabled=Flat، Pressed=Hint و حالت عادی=Soft.
- Button border از resolver state استفاده می‌کند؛ Ghost به‌صورت خاص shadow Flat دارد اما برای قابل‌دیدن ماندن touch boundary از HintBorderWidth استفاده می‌کند.
- تست‌های Card و Button برای mapping هر state افزوده شده‌اند.

### 4.3 CI و verifier
- تنها فایل generated نیتیو `ShomaraTokens.kt` از raw-token scan معاف است؛ هیچ screen/feature exemption وجود ندارد.
- کامنت منسوخ verifier که `ShomaraHomeUiTokens.kt` را generated/exempt معرفی می‌کرد حذف شد؛ منطق/allowlist/threshold تغییر نکرد.
- در PR CI، گیت مستقیم `node tools/token-codegen/generate.mjs --check` افزوده شد.
- PR CI علاوه بر آن `node tools/harness.mjs validate` و `node tools/harness.mjs next` را اجرا می‌کند.
- wrapper executable check نیز در Native verifier و Node test قفل شده است.

## 5. شواهد اجرا

**Android Native run `44161892815` روی checkpoint code SHA `907a63e`:**
- Environment: READY؛ JDK 17 و Android compile SDK 37.
- فرمان: `./gradlew test lint :app:compileDebugKotlin --stacktrace --no-daemon`.
- نتیجه: Gradle exitCode=0؛ `BUILD SUCCESSFUL` در 2m45s؛ Android lint و app debug Kotlin compile موفق.
- diagnostics artifact: ID `14364890263`؛ فایل `build-reports/android/gate.json` PASS؛ ۸۱ XML suite و ۵۷۶ test، zero failure/error/skip.
- `ci/core`: PASS. `ci/static-core`: PASS، شامل Harness و token drift CLI.
- `verify:static:all`: 93/94؛ تنها parity-run باقی‌مانده است. همان مورد روی `main` در run `43088599553` مورخ 2026-11-11 نیز `practice diff 0.50%` و `PARITY: FAIL (8/29)` داشته؛ threshold/golden دستکاری نشده‌اند.

**محدودیت:** این شواهد برای کد پیش از آخرین اصلاحات Button Border است. اجرای جدید CI پس از SHA `c4fc214` و تغییرات مستندات هنوز باید نتیجه بدهد؛ تا آن زمان کامپایل آخرین branch commit را PASS اعلام نمی‌کنیم.

## 6. محدودیت rendering واقعی

`ShomaraClaySpec` همهٔ tokenها را حمل می‌کند، اما renderer فعلی:
- elevation را با Compose `.shadow()` اعمال می‌کند؛
- borderWidth را با `.border()` اعمال می‌کند؛
- highlightThickness را در geometry/padding دارد؛
- shadowOpacity، shadowRadius، shadowOffsetY و highlightOpacity را هنوز به rendering مستقل map نمی‌کند.

بدون screenshot comparison واقعی در 360/390/412dp و 200% font، Canvas/gradient سفارشی اضافه نمی‌شود. فعلاً این موارد **REVISE / OPEN** هستند، نه completed.

## 7. گیت‌های باز

1. CI جدید پس از اصلاح Border Button باید Android + static-core را PASS کند.
2. screenshot catalog روی 360/390/412dp و font scale 2.0 لازم است.
3. Compose semantics و TalkBack order/role/state/action باید instrumented/device-tested شوند.
4. IME فارسی، focus/keyboard، process restore و reduced-motion باید روی device اجرا شوند.
5. فایل TTF Vazirmatn باید از مالک/منبع تأییدشده برسد؛ fallback نباید Vazirmatn معرفی شود.
6. Shadow renderer token-driven فقط با visual evidence تکمیل شود.

**نتیجه:** بنیاد token/codegen و shared components در source و JVM logic وجود دارد؛ Native visual validation هنوز انجام نشده و release/design mission کامل اعلام نمی‌شود.
