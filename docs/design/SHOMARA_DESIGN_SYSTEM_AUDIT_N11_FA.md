# ممیزی و اصلاح Design System نیتیو SHOMARA — N11-04

- تاریخ: 2026-11-17
- شاخهٔ اجرا: `work/shomara-deep-transformation`
- مبنای ممیزی: `infra/p14b-home-ui@6cd0e7ac7e69d6d5a6117f38ccbcb9b2bc69eb8c`
- وضعیت: **منشأ هر ۷ شکست Parity در 2026-11-19 با artifact والد/HEAD و تحلیل پیکسلی تعیین شد؛ هیچ Regression جدیدی در این شاخه اثبات نشد. `STATIC_ALL` محلی 94/94 PASS است، اما Linux CI همچنان 7/29 FAIL و Native/device gates بازند.**
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

**Android Native run `44191580216` روی branch head `7dd835a80f0cde920b34f24a6b06932f5d6942b9`:**
- Environment: READY؛ JDK 17 و Android compile SDK 37.
- فرمان: `./gradlew test lint :app:compileDebugKotlin :app:compileDebugAndroidTestKotlin --stacktrace --no-daemon`.
- نتیجه: Gradle exitCode=0؛ `BUILD SUCCESSFUL` در 3m08s؛ 822 actionable tasks، 533 اجرا و 289 از cache؛ lint، app debug compile و instrumentation-test source compile موفق.
- Diagnostics artifact: ID `14377826064`؛ `build-reports/android/gate.json` PASS؛ preflight exit 0؛ Gradle exit 0.
- چهار warning deprecation برای `createComposeRule` در چهار فایل instrumentation source وجود دارد؛ کامپایل آن‌ها pass است. این Gate `connectedDebugAndroidTest` یا physical device test اجرا نکرد و APK نساخت.

**Web/core CI run `44191579879` روی همان head:**
- `core`: PASS — package build، `typecheck:all` و Vitest.
- `static-core`: PASS — Harness validate/next، `token-codegen --check` و `verify:static:core`.
- `visual-and-static`: FAIL تنها در parity؛ `PARITY: FAIL (7/29)` و `STATIC_ALL: FAIL (93/94)`.
- Parity artifact: ID `14375744795`; Practice پس از حذف قفل تکراری PASS شد: 0.4683% (1388/296400). Compact replay source تک‌خطی شده اما diff آن هنوز 0.7994% (88/11008) است.
- failureهای دیگر در همین report: phone 0.5052%; button-amber 0.3246% (حد 0.15); guide-07 0.9209% (حد 0.15); chip-06 2.6282% (حد 0.15); chip-icon-clock-06 0.6655%; profile 0.5402%. Goldens و maxDiffPercent تغییر نکرده‌اند.

**Baseline:** main CI run `40687075654` (2026-10-28) و `43088599553` (2026-11-11) هر دو parity total `8/29` داشته‌اند؛ در هر دو log، Practice در 0.50% fail بود. Current branch total به `7/29` کاهش یافته است. لاگ‌های تاریخی identity کامل تمام failureها را حفظ نکرده‌اند، بنابراین نمی‌توان همهٔ هفت failure فعلی را با قطعیت همان نمونه‌های تاریخی دانست.

**محدودیت Native:** source/JVM/Gradle success جایگزین screenshot catalog، Compose semantics، TalkBack، Persian IME یا physical device validation نیست. NATIVE_PENDING باقی می‌ماند.

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
7. اختلاف raster در compact replay و پنج نمونهٔ کوچک دیگر را با بررسی glyph/font/icon source تحلیل کنید؛ threshold یا golden را برای سبزکردن مصنوعی تغییر ندهید.
8. `createComposeRule` instrumentation tests را پس از مطالعهٔ Migration Guide به v2 ارتقا دهید؛ رفتار coroutine scheduling را حفظ و compile + device tests اجرا کنید.

**نتیجه:** بنیاد token/codegen و shared components در source/JVM logic و Android Gradle Gate تأیید شده؛ Native visual validation هنوز انجام نشده و parity 7/29 fail است؛ release/design mission کامل اعلام نمی‌شود.


## 8. تأیید Gate بعد از آخرین Refactor (2026-11-18)

- Android Native run `44308240426` روی SHA `bc9c1b8`: PASS؛ 81 XML suites / 583 tests؛ zero failure/error/skip؛ lint + `:app:compileDebugKotlin` + `:app:compileDebugAndroidTestKotlin` PASS.
- `core` و `static-core` CI نیز PASS؛ `token-codegen --check` و Harness validate/next موفق‌اند.
- آخرین parity artifact مربوط به run `44309817949`: 22/29 PASS، 7/29 FAIL؛ موارد: phone 0.5052%, button-amber 0.3246% (limit 0.15), guide-07 0.9209% (limit 0.15), chip-06 2.6282% (limit 0.15), chip-icon-clock-06 0.6655%, button-replay-07 0.7994%, profile 0.5402%. تحلیل ماشینی actual/golden/diff و مقایسهٔ SHA-256 با والدِ تغییر Button در §9 ثبت شده است؛ Golden، threshold و rendering code برای سبزشدن تغییر نکرده‌اند.
- Compose test sourceها compile می‌شوند؛ `connectedDebugAndroidTest` و اجرای فیزیکی، screenshot در 360/390/412dp، font scale=2.0، TalkBack و Persian IME هنوز انجام نشده‌اند.
- بنابراین **SOURCE/JVM + Android compile gate PASS**؛ اما **NATIVE_VALIDATED نه** و release/design acceptance هنوز باز است.

## 9. PR4 — تعیین منشأ هفت شکست Parity (2026-11-19)

### 9.1 زنجیرهٔ evidence

- HEAD ممیزی: `4cb576f88837d54b07cab8c798c903e6e42d2cfd`؛ CI run: `44309817949`. Artifact فعلی `14429966821` با SHA-256 `3777b100060b57f5211d98fd74df4c22e9d7896d0806b365f00bab8e072c9434` تأیید شد. از 94 check فقط `parity-run.mjs` قرمز است؛ خطای static پنهان یا مستقل دیگری وجود ندارد.
- Artifact والدِ مستقیم commit تغییر Button (`3b1889f537402633824e90eead0c9f22933112b6`، run `44190147820`) نیز با SHA-256 `3ecad0b7bdf71891e8817bd08848ecae127bbbc678f2dad85f8319f6e2b097c5` تأیید شد. در شش مورد غیر replay، فایل‌های actual و golden و diff والد/HEAD **byte-for-byte یکسان**‌اند. Golden هر هفت مورد بین والد و HEAD یکسان است.
- از `origin/main..HEAD` در مسیرهای مرتبط فقط `Button.tsx` تغییر rendering دارد؛ Specimenها، Phone/Profile/Chip/GuideBubble، Goldenها و `maxDiffPercent` تغییر نکرده‌اند. tokenهای افزوده‌شده Home/flat/hint در این Specimenها مصرف نمی‌شوند. بنابراین نسبت‌دادن شش مورد یکسان به تغییر Button یا tokenهای جدید ممکن نیست.
- تحلیل PNG با NumPy/Pillow انجام شد، نه مشاهدهٔ چشمی: mask قرمز diff دقیقاً با `badPixels` برابر است؛ نواحی اختلاف، جفت‌رنگ‌ها و بهترین shift استخراج شدند. در شش مورد غیر replay، نتیجهٔ والد و HEAD حتی در سطح hash تصویر یکسان است؛ در replay تغییر geometry/text wrap قابل اندازه‌گیری است.

### 9.2 نتیجهٔ موردبه‌مورد

| Specimen | Linux CI؛ bad pixels | ناحیهٔ اختلاف و کد مستقیم | منشأ و طبقه‌بندی |
|---|---:|---|---|
| `phone` | 0.5052%؛ 1663/329160 | ردیف‌های متنی y=241..521 و footer y=779..789 در `PhoneView.tsx` و `AppText.tsx`؛ مسیر non-compact `Button.tsx` | **قدیمی از main / اثر محیط rendering**؛ actual/golden/diff والد و HEAD یکسان‌اند. هیچ تغییر layout یا Regression جدیدی دیده نشد. |
| `button-amber` | 0.3246%؛ 86/26492 | glyph برچسب «بریم!»، x=163..196 و y=29..45؛ `Button.tsx` و Specimen در `parity/specimens/index.tsx` | **قدیمی از main / اثر محیط rendering**؛ مسیر non-compact و تصویر والد/HEAD بدون تغییر، border/gradient مسئلهٔ شکست جدید نیستند. |
| `guide-07` | 0.9209%؛ 326/35400 | متن حباب، x=89..292 و y=42..62؛ `GuideBubble.tsx` و `AppText.tsx` | **قدیمی از main / اثر محیط text shaping/rasterization**؛ والد و HEAD کاملاً یکسان‌اند و هیچ کد مرتبطی در شاخه عوض نشده است. |
| `chip-06` | 2.6282%؛ 82/3120 | glyph برچسب، x=20..57 و y=14..23؛ `Chip.tsx` | **قدیمی از main / اثر محیط text shaping/rasterization**؛ اختلاف در pill/border نیست و تصویر والد/HEAD یکسان است. |
| `chip-icon-clock-06` | 0.6655%؛ 37/5560 | ناحیهٔ label، x=39..94 و y=14..24؛ `Chip.tsx`، `Icon.tsx` و `AppText.tsx` | **قدیمی از main / اثر محیط rendering**؛ والد/HEAD یکسان‌اند. شکست، evidence برای تغییر اندازه یا جای icon در این شاخه نیست. |
| `button-replay-07` | 0.7994%؛ 88/11008 | والد: 748 پیکسل در x=35..136 و y=15..54؛ HEAD: 88 پیکسل در x=35..97 و y=25..38؛ `Button.tsx` compact path | **شکست از قبل در main بوده؛ تغییر شاخه یک اصلاح واقعی UI است، نه Regression.** `numberOfLines=1` و `flexShrink=0` متن را از حالت wrap به یک خط نزدیک‌تر به Golden برده و diff را از 6.7951% به 0.7994% کاهش داده است. 88 پیکسل باقی‌مانده glyph/anti-alias محیطی است؛ اصلاح بیشتر بدون Regression اثبات‌شده مجاز نیست. |
| `profile` | 0.5402%؛ 1778/329160 | چند ردیف glyph در y=102..598 و footer y=775..785؛ `ProfileView.tsx`، `GuideBubble.tsx` و `AppText.tsx` | **قدیمی از main / اثر محیط rendering**؛ actual/golden/diff والد و HEAD یکسان‌اند و هیچ layout change جدیدی ثابت نشده است. |

`main` در run `43088599553` نیز 8/29 شکست داشت؛ `practice` با 0.50% شکست اضافه بود و در شاخه با حذف lock تکراری به 0.4683% PASS رسید. والدِ تغییر Button همان هفت ID فعلی را دارد. بنابراین «7/29 فعلی» مجموعه‌ای از بدهی قدیمی است، نه هفت Regression تازه.

### 9.3 کنترل محیط و gate اجراشده

- `node scripts/parity-run.mjs phone button-amber guide-07 chip-06 chip-icon-clock-06 button-replay-07 profile` روی همان HEAD در Windows: **exit 0، PASS 7/7**. bad pixels به ترتیب 206، 2، 18، 3، 15، 1 و 505 شد؛ replay فقط 1 پیکسل در برابر 88 پیکسل CI دارد.
- `npm run verify:static:all` روی همان HEAD در Windows: **exit 0، STATIC_ALL PASS (94/94)**، شامل Parity کامل 29/29.
- Goldenهای CI و local byte-for-byte برابرند؛ Playwright هر دو 1.63.0 است. محیط محلی Windows/Node 24.22.1 و محیط CI Ubuntu/Node 22.22.0 است؛ اختلاف Node پنهان نشده و این نتیجه جایگزین CI نمی‌شود. نتیجهٔ متفاوت با کد/Golden یکسان و تمرکز شکست‌ها روی glyphها، بدهی **environment-sensitive text/raster rendering** را ثابت می‌کند؛ دقیق‌تر از این، subsystem جدا نشده و ادعا نمی‌شود.
- هیچ فایل Android در این ممیزی تغییر نکرده است؛ Android Gate تکرار نشد. Run مستقل `44309817994` از قبل PASS است.
- تا سبزشدن همان gate لینوکس، تغییر Base PR4 به `main` آماده نیست. بازتولید Golden یا عوض‌کردن runner باید در task مستقل با مبنای تصویب‌شده انجام شود؛ تضعیف threshold، حذف assertion یا پنهان‌کردن failure راه‌حل نیست.
