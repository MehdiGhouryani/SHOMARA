# موجودی بازنشستگی `apps/mobile` — DT-67

`apps/mobile` ۲۱۱ فایل از ۱۲۲۴ فایل مخزن است (۱۷٪). هدف اقدام ۲ بازنشستگی آن است. AGENTS.md §1 می‌گوید اپ Expo تا
جایگزینی قابلیت‌ها مرجع رفتاری است، پس اولین قدم حذف نیست؛ **موجودی** است: هر سطح Expo چه معادلی روی Android دارد.

## تطابق مسیرها — ۱۵ مسیر Expo

| مسیر Expo | معادل Android | وضعیت |
|---|---|---|
| `_layout.tsx` (root) | `AppDestination.LAUNCH` + `ShomaraLaunchController` | ✅ جایگزین |
| `(tabs)/_layout.tsx` | `ShomaraChildShell.kt` + `ShomaraChildShellHost.kt` | ✅ جایگزین |
| `(tabs)/index.tsx` (مسیر) | `ShomaraPathGraph.kt` + `ShomaraPathState.kt` | ✅ جایگزین |
| `(tabs)/practice.tsx` | `ShomaraPracticeHub.kt` | ✅ جایگزین |
| `(tabs)/profile.tsx` | `ShomaraMeScreen.kt` | ✅ جایگزین |
| `onboarding.tsx` | `OnboardingHost.kt` + `WelcomePhone.kt` + `ProfileScreens.kt` | ✅ جایگزین |
| `settings.tsx` | `ShomaraSettingsScreen.kt` | ✅ جایگزین |
| `station/[stationId]/index.tsx` | `ShomaraStationStart.kt` | ✅ جایگزین |
| `station/[stationId]/start.tsx` | `ShomaraStationStart.kt` | ✅ جایگزین |
| `station/[stationId]/play.tsx` | `ShomaraLessonHost.kt` + `ShomaraLessonStageChrome.kt` | ✅ جایگزین |
| `unit/[unitId]/jump.tsx` | `ShomaraJumpAssessment.kt` | ✅ جایگزین |
| `avatar.tsx` | — | 🗑 بازنشسته با ADR-0051 (کارگاه آواتار) |
| `parent.tsx` | — | 🗑 بازنشسته با ADR-0050 (سطح والدین) |
| `unit/[unitId].tsx` | `ShomaraPathChapter.kt` (نسبی) | ⚠️ **نیازمند تصمیم** |
| `missions.tsx` | — | ⚠️ **نیازمند تصمیم** |

### دو مورد باقی‌مانده — با شاهد

**`missions.tsx` — تصمیم: نگه داشته می‌شود (دامنهٔ معاف).** در نوشتار اول این سند آن را «جای‌نگهدار بدون
محتوا» خواندم. **غلط بود.** دامنهٔ ماموریت‌ها کامل وجود دارد و فقط سطح کلاینتش معاف شده است:

| جزء | مسیر |
|---|---|
| قرارداد | `packages/contracts/src/missions.ts` + `missions.test.ts` |
| Web API | `apps/web/app/api/v1/missions/hub/route.ts` |
| سطح کلاینت | `apps/mobile/app/missions.tsx` (حالت خالی عمدی) |
| verifier لازم‌داننده | `verify-p06-mission-engine.mjs` فایل mobile را در فهرست الزامی دارد |
| معافیت ثبت‌شده | `verify-ui-v1-path.mjs`: `check('waived-domain:missions-route', ...)` |

حذف این فایل **دو gate را می‌شکند** و یک دامنهٔ قرارداددار را از بین می‌برد. پس می‌ماند. نبودنش روی Android به‌معنای
«معاف‌شده» است، نه «مرده».

**`unit/[unitId].tsx` — تصمیم: جانشین‌شده، پورت نمی‌شود.** صفحهٔ جزئیات یک واحد («واحد»، «ایستگاه‌ها»،
«بازگشت به مسیر»). شاهد: `ShomaraPathChapter.kt` فقط یک **باند عنوان** است (۹۶ خط، `ShomaraChapterBand` با
completed/total)، نه صفحهٔ واحد با فهرست ایستگاه‌ها. یعنی تطابق یک‌به‌یک **وجود ندارد و ساخته هم نمی‌شود**:

مدل ناوبری Android یک **سفر پیوسته** است — `ShomaraPathGraph` همهٔ ایستگاه‌ها را در یک مسیر اسکرول‌شو با باندهای فصل
نشان می‌دهد. یک صفحهٔ drill-down برای واحد، مدل ناوبری تحویل‌شده را نقض می‌کند. مرجع Expo تا حذف پوشه می‌ماند، ولی
تست Android برایش نوشته نمی‌شود.

## ۲۳ assertion متنی که این فایل‌ها را زنده نگه می‌دارد

از ۲۳ assert، **۱۴** روی `apps/mobile` است و **۶** روی `apps/web` (که طبق AGENTS.md §1 مستقل از مهاجرت UI است و
بدون تصمیم ثبت‌شده دست نمی‌خورد)، و ۳ مورد باقی روی فایل‌های مشترک.

| verifier | assert | فایل mobile |
|---|---|---|
| `verify-ui-v1-path.mjs` | `tabs-use-ChildTabBar` | `app/(tabs)/_layout.tsx` |
| `verify-ui-v1-path.mjs` | `notice-bubble-wide` | `src/path/PathNode.tsx` |
| `verify-ui-v1-path.mjs` | `node-hints-from-contract` | `src/path/pathModel.ts` |
| `verify-ui-v1-path.mjs` | `connectors-no-undefined-dash` | `src/path/PathView.tsx` |
| `verify-ui-v1-path.mjs` | `band-uses-world-title` | `src/path/pathModel.ts` |
| `verify-ui-v1-onboarding.mjs` | `parity-specimen-uses:${view}` | `parity/specimens/onboarding.tsx` |
| `verify-ui-v1-onboarding.mjs` | `code-group-labelled` | `src/onboarding/views2/CodeView2.tsx` |
| `verify-ui-v1-onboarding.mjs` | `radios-use-checked-state` | `src/ui/v2/forms.tsx` |
| `verify-ui-v1-onboarding.mjs` | `view-back-labelled` | `src/ui/v2/shell.tsx` |
| `verify-ui-v2-onboarding.mjs` | back-label | `src/ui/v2/shell.tsx` |
| `verify-ui-v1-result.mjs` | `wiring:chrome-has-challenge-fallback` | `src/station/LessonPlayerChrome.tsx` |
| `verify-ui-v2-foundation.mjs` | `toFa(p.done)` | `src/station/views2/LessonViewsV2.tsx` |
| `verify-phase4-challenge-foundation.mjs` | `mobile_boundary_exists` | `src/station/runtimeApi.ts` |
| `verify-phase12-postgres-runtime.mjs` | session key | `src/station/runtimeApi.ts` |
| `verify-uiux-path2.mjs` | `all-stations-route-to-play` | `app/station/[stationId]/start.tsx` |
| `verify-uiux-phase9.mjs` | `no-client-parent-auth-gate` | `app/onboarding.tsx` |

## نتیجهٔ عملی

بازنشستگی `apps/mobile` **ممکن است** ولی یک کار چندمرحله‌ای است، نه یک commit:

1. تصمیم مالک دربارهٔ دو مورد باقی‌مانده (`missions`، `unit/[unitId]`).
2. برای هر ۱۴ assert mobile: یا رفتارش در تست Android موجود است و assert بازنشسته می‌شود، یا تست Android نوشته
   می‌شود و بعد بازنشسته.
3. سپس حذف پوشه در یک commit قابل‌بازبینی با ثبت تعداد/حجم/روش بازیابی (AGENTS.md §4).

تا آن زمان، این سند موجودیِ دقیق است و هیچ ادعای تکمیل نمی‌کند.

## قاعدهٔ ترتیب (مهم — از تضعیف پوشش جلوگیری می‌کند)

وسوسه این است که اول ۱۴ assert متنی را بازنشسته کنیم تا حذف پوشه آسان شود. **این کار ممنوع است** و دلیلش ساده است:

هر assert متنی که موضوعش (فایل mobile) هنوز وجود دارد، **پوشش زنده** است. بازنشسته کردنش پیش از حذف فایل،
تضعیف verifier برای سبز شدن است — همان چیزی که AGENTS.md §3.4 منع می‌کند.

ترتیب درست:

1. فایل حذف می‌شود (با ثبت تعداد/حجم/روش بازیابی).
2. همان commit که فایل را حذف می‌کند، assert مربوطه را هم بازنشسته می‌کند.
3. اگر رفتار آن فایل معادل Android دارد، معادلش از قبل تست شده است؛ اگر ندارد، تصمیم «پورت نمی‌شود» ثبت می‌شود.

یعنی هیچ assertی پیش از مرگ موضوعش نمی‌میرد. این را اینجا می‌نویسم چون در دور بعد وسوسه‌اش وجود دارد.
