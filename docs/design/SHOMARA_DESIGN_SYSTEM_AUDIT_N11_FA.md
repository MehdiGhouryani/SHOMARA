# ممیزی Design System نیتیو SHOMARA — N11-04

- تاریخ: 2026-11-17
- شاخه: `work/shomara-deep-transformation`
- وضعیت: **ممیزی پایه تکمیل؛ اصلاح سند verifier ثبت شده؛ پیاده‌سازی token/component جدید هنوز انجام نشده است.**
- منبع تصمیم بصری: `design/MASTER.md`، `design/INSPIRATION_GUARDRAILS.md` و `packages/design-system/src/tokens.json`.
- مهارت‌های بررسی‌شده: `skills/shomara-design-system/SKILL.md` و `references/review-checklist.md`.

## 1. تصمیم‌های معماری و بصری

| موضوع | وضعیت | دلیل / مرز |
|---|---|---|
| یک منبع token | KEEP | `packages/design-system/src/tokens.json` تنها JSON canonical است؛ بلوک `v2` مرجع Android Native طبق ADR-0037 L6 است. |
| خروجی Kotlin و TypeScript | KEEP | `tools/token-codegen/generate.mjs` هر دو خروجی را از v2 تولید می‌کند؛ فایل‌های generated دستی ویرایش نمی‌شوند. |
| ویرایش generated token | RETIRE | تغییر مستقیم `ShomaraTokens.kt` ممنوع؛ فقط tokens.json و codegen مجازند. |
| Home-specific semantic tokens | KEEP / REVISE | رنگ‌های Home در همان v2 token source قرار دارند؛ token JSON یا سیستم موازی جدید ساخته نمی‌شود. |
| theme و semantic mapping | KEEP | `ShomaraTheme.kt` رنگ، typography، shape، Clay و direction را از `ShomaraTokens` resolve می‌کند. |
| فونت Vazirmatn | OPEN / OWNER INPUT | Theme فعلاً `FontFamily.Default` دارد؛ TTF تأییدشده در repo نیست و دانلود تصادفی ممنوع است (ADR-0037). |
| Claymorphism | KEEP / REVISE → implemented, CI pending | یک enum و resolver canonical (`ShomaraClayDepth` / `ShomaraClay`)؛ هر ۴ tier تمام propertyها را از v2 tokens می‌گیرند. renderer هنوز همهٔ shadow sub-tokenها را اعمال نمی‌کند؛ screenshot/device review باز است. |
| جهت رابط و ریاضی | KEEP | پیش‌فرض UI فارسی RTL و محتوای ریاضی LTR است؛ هر component باید مرز را صریح کند. |
| Screen-local exemptions | RETIRE | فقط فایل generated canonical از raw-token guard معاف است؛ هیچ صفحه/feature مستثنا نیست. |
| screenshot/TalkBack/physical review | OPEN / NATIVE_PENDING | تست JVM جای آزمون Compose semantics، screenshot یا دستگاه واقعی را نمی‌گیرد. |

## 2. قرارداد canonical token

شِمای خوانده‌شده:
- schemaVersion = 2.0.0؛ بلوک v2 شامل color/type/space/radius/shadow/motion/component/clay است.
- ۳۷ رنگ semantic در v2؛ شامل رنگ‌های پایه و رنگ‌های semantic Home که با همان generator تولید می‌شوند.
- پنج scale تایپوگرافی: display، title، body، caption، bignum.
- spacing canonical: 4، 8، 12، 16، 20، 24، 32 و 40dp.
- touch floor = 48dp؛ manipulative کودک = 72–80dp؛ node فعلی مسیر = 84dp.
- motion duration از tokenهای 120/220/340ms و springهای canonical می‌آید.
- Clay چهار tier دارد و تنها یک سطح featured در viewport تصمیم مجاز است.

**ملاحظه:** گروه‌های top-level قدیمی v1 همچنان برای سطح‌های وبِ مهاجرت‌نکرده در JSON وجود دارند؛ generator نیتیو فقط v2 را emit می‌کند. این دو را بدون migration مصرف‌کننده‌ها ادغام یا حذف نکنید.

## 3. اجزای موجود و شواهد تست

| بخش | پیاده‌سازی موجود | تست/شواهد موجود | محدودیت |
|---|---|---|---|
| Theme | `ShomaraTheme.kt` | `ShomaraThemeTest`؛ color slot، typography، clay، shape و RTL/LTR | font binary تأییدشده غایب |
| Button | `ShomaraButton.kt` | `ShomaraPrimitives03Test`؛ state، target، press depth، disabled/loading، token colors | TalkBack و screenshot واقعی همچنان لازم |
| TextField | `ShomaraTextField.kt` | `ShomaraPrimitives03Test`؛ empty/focused/filled/invalid/disabled/loading و جهت متن | IME/IME فارسی و font-scale دستگاه نیازمند QA |
| State surface | `ShomaraStateSurface.kt` | در primitive/shell test suites پوشش logic و state؛ قابل‌اعلام به‌عنوان device-tested نیست | آزمون real navigation و announcement دستگاه |
| Clay | `ShomaraTheme.kt` + `ClaySurface.kt` روی یک resolver | `ClayContractTest` و `ShomaraThemeTest` اکنون هر چهار tier را property-by-property به tokenها assert می‌کنند؛ debug gallery هم به enum canonical مهاجرت کرده | renderer فعلی shadow را با Compose elevation می‌سازد؛ opacity/radius/offset tokenها هنوز به rendering وصل نیستند؛ screenshot/device proof لازم است |
| Motion | `ShomaraMotion.kt` و reduced-motion primitives | `ShomaraMotionTest` | تست واقعی system animator/TalkBack هنوز لازم |
| Path/Navigation/Dialog/Audio | shared primitives و feature path | `ShomaraPrimitives05Test` و catalog tests | state/route journey end-to-end هنوز لازم |
| Token generation | `tools/token-codegen/generate.mjs` | `packages/design-system/src/codegen.drift.test.ts`؛ schema، determinism، key coverage و byte-for-byte drift | در هر تغییر token باید generate + drift اجرا شود |

Android CI run `44158203235` روی checkpoint persistence شامل Android unit tests، lint و app compile با exit code صفر بود. پس از Refactor Clay، run تازه `44161390378` روی HEAD `6b948e4` در حال اجراست؛ نتیجه باید قبل از بستن N11-04 ثبت شود. این گیت معادل screenshot، TalkBack یا device journey نیست.

## 4. اصلاحات اجراشده در این checkpoint

### 4.1 حذف resolver موازی Clay
- enum قدیمی `ClayDepth` و `ClaySpecResolver` از `ClaySurface.kt` حذف شدند.
- `ClaySurface`، `PathKit`، `LessonKit`، Previewها و Debug Gallery اکنون از `ShomaraClayDepth` و `ShomaraClay.specFor` استفاده می‌کنند.
- Referenceهای قدیمی با CI واقعی کشف شدند: `DesignSystemGalleryActivity.kt` زیر sourceSet debug هنوز enum حذف‌شده را import می‌کرد؛ این فایل هم مهاجرت کرد.
- `ShomaraClay` در `ShomaraTheme.kt` اکنون Flat/Hint/Soft/Featured را به‌صورت کامل از تمام propertyهای generated v2 token resolve می‌کند. قبلاً Hint عملاً فقط elevation متفاوت داشت و بقیهٔ visual properties را از Flat به ارث می‌برد.
- `ShomaraThemeTest` و `ClayContractTest` هر چهار tier را property-by-property بررسی می‌کنند؛ انتظار قدیمی «Hint همان Flat با elevation متفاوت» بازنویسی شد.
- هیچ token JSON یا خروجی generated دستی تغییر نکرده؛ فقط source resolver و مصرف‌کننده‌ها تغییر کرده‌اند.

### 4.2 CI guards
- توضیحات اشتباه verifier دربارهٔ `ShomaraHomeUiTokens.kt` و exemption صفحه‌ای حذف شد؛ تنها generated file واقعی `ShomaraTokens.kt` است.
- CI در `static-core` اکنون `node tools/token-codegen/generate.mjs --check` را به‌عنوان گیت مستقل اجرا می‌کند؛ drift صرفاً به Vitest واگذار نشده است.
- wrapper executable guard و Harness validate/next نیز در همان PR CI باقی هستند.

### 4.3 محدودیت rendering که باز مانده است
- `ShomaraClaySpec` همهٔ tokenها را نگه می‌دارد، اما `ClaySurface` فعلاً فقط `elevation` را به Compose `.shadow()`، `borderWidth` را به `.border()` و `highlightThickness` را به `.padding()` می‌دهد.
- `shadowOpacity`، `shadowRadius`، `shadowOffsetY` و `highlightOpacity` هنوز در modifier اثر بصری مستقیم ندارند. این یک REVISE/OPEN فنی است؛ نباید ادعا شود که rendering دقیق tokenهای shadow کامل شده است.
- بدون screenshot واقعی و تطبیق روی 360/390/412dp و font scale=2.0، implementation سفارشی Canvas/gradient برای shadow اضافه نمی‌شود؛ تغییر ظاهری بدون evidence می‌تواند regression بسازد.

**منطق verifier، allowlist، threshold و goldenهای تصویری تغییر نکرده‌اند.** اصلاح verifier فقط متن مستندکنندهٔ رفتار واقعی را هم‌راستا کرد.

## 5. گام‌های مجاز بعدی N11-04

1. اجرای `node tools/token-codegen/generate.mjs --check` در CI اجباری است؛ نتیجهٔ آخرین SHA باید PASS باشد.
2. اجرای `npm run verify:design-governance`، `npm run verify:design-pack` و `npm run verify:project-skills` روی همین شاخه.
3. نگاشت component API/state/semantics به `COMPONENT_READINESS.md` و مشخص‌کردن rowهایی که واقعاً Compose semantics یا screenshot می‌خواهند.
4. تکمیل تصمیم renderer shadow فقط بعد از screenshot comparison و device evidence؛ opacity/radius/offset نباید بلااستفاده و بی‌توضیح باقی بمانند.
5. ثبت وضعیت فونت Vazirmatn به‌عنوان وابستگی ورودی مالک؛ fallback را بی‌صدا «Vazirmatn» اعلام نکنید.

## 6. گیت‌های باز

- NATIVE_PENDING: screenshot در 360/390/412dp و 200% font.
- NATIVE_PENDING: TalkBack order/role/state/action و announcementهای dynamic.
- NATIVE_PENDING: IME فارسی، focus/keyboard، reduced motion روی دستگاه.
- OWNER INPUT: فایل TTF مجاز Vazirmatn.
- O5 و progress identity مانع تصمیم visual نمی‌شوند، اما هر componentی که completion/mastery یا قفل آموزشی را نشان می‌دهد باید از domain state واقعی بیاید.
- **N11-04 هنوز DONE نیست:** آخرین Android Native run باید پس از enum migration و چهار-tier test refactor موفق شود؛ static-core باید token drift CLI را هم اجرا و تأیید کند.
## 5. گام‌های مجاز بعدی N11-04

1. اجرای `node tools/token-codegen/generate.mjs --check` و ثبت drift result مستقل از Vitest.
2. اجرای `npm run verify:design-governance`، `npm run verify:design-pack` و `npm run verify:project-skills` روی همین شاخه.
3. نگاشت component API/state/semantics به `COMPONENT_READINESS.md` و مشخص‌کردن rowهایی که واقعاً Compose semantics یا screenshot می‌خواهند.
4. بازبینی contrast رنگ‌ها و touch/typography بر اساس tokenها؛ هیچ پالت یا فونت جدید بدون تصمیم/منبع تأییدشده.
5. ثبت وضعیت فونت Vazirmatn به‌عنوان وابستگی ورودی مالک؛ fallback را بی‌صدا «Vazirmatn» اعلام نکنید.

## 6. گیت‌های باز

- NATIVE_PENDING: screenshot در 360/390/412dp و 200% font.
- NATIVE_PENDING: TalkBack order/role/state/action و announcementهای dynamic.
- NATIVE_PENDING: IME فارسی، focus/keyboard، reduced motion روی دستگاه.
- OWNER INPUT: فایل TTF مجاز Vazirmatn.
- O5 و progress identity مانع تصمیم visual نمی‌شوند، اما هر componentی که completion/mastery یا قفل آموزشی را نشان می‌دهد باید از domain state واقعی بیاید.
- هیچ token جدید، تغییر پالت، حذف legacy یا ادعای visual redesign در این checkpoint انجام نشده است.
