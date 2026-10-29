# نقشهٔ راه رسمی SHOMARA برای Android Native

نسخه: 1.0 — 2026-10-28
وضعیت جاری فقط در `START_HERE.md` ثبت می‌شود. این سند ترتیب، مرز و gate فازها را تعریف می‌کند.

## 1. نتیجهٔ نهایی

یک اپ Android Native فارسی/RTL با Kotlin و Jetpack Compose که:

- معماری UI/domain/data و جریان دادهٔ یک‌طرفه دارد؛
- server-authoritative learning را بدون engine دوم حفظ می‌کند؛
- offline-first است و وضعیت local/remote را صادقانه نشان می‌دهد؛
- یک Design System canonical دارد؛
- برای هر صفحه stateهای loading/offline/error/empty/content/disabled را پوشش می‌دهد؛
- تست واحد، screenshot، navigation، accessibility، performance و device evidence دارد؛
- آمادهٔ تولید APK/AAB است، ولی artifact انتشار فقط در فاز مجاز ساخته می‌شود.

معماری لایه‌ای، UDF، repository و state holder با راهنمای رسمی Android هم‌راستاست. خواندن‌های حیاتی از local source و همگام‌سازی remote از repository انجام می‌شود. Design System Compose از theme سفارشی و tokenهای canonical استفاده می‌کند. Baseline Profile و Macrobenchmark فقط بعد از پایداری journeyهای اصلی اضافه می‌شوند.

## 2. اصول تجربهٔ یادگیری

الهام از Duolingo، تجربهٔ پروژهٔ AVA، روش design-system-first در UI/UX Pro Max و Claymorphism محدود در سطح اصل است، نه کپی پیاده‌سازی:

- یک هدف آموزشی و یک CTA اصلی در هر state؛
- feedback فوری، کوتاه، گرم و قابل‌اقدام؛
- sessionهای خرد با checkpoint و resume روشن؛
- سختی تدریجی و recovery بدون تنبیه؛
- صوت و محتوای آموزشی data-driven، دارای metadata، نسخه، checksum و fallback؛
- UI مستقل از منبع فایل صوتی تا CMS آینده بتواند محتوا را مدیریت کند؛
- هیچ کد، asset، برند یا شخصیت از AVA/Duolingo وارد SHOMARA نمی‌شود.
- هیچ palette، font، generator یا dependency خارجی صرفاً با استناد به منبع الهام وارد پروژه نمی‌شود؛ ماتریس binding در `design/INSPIRATION_GUARDRAILS.md` است.

## 3. معماری هدف repository

```text
apps/
  android/                  # کلاینت اصلی آینده
    app/
    core/common/
    core/designsystem/
    core/model/
    core/network/
    core/database/
    core/datastore/
    core/testing/
    feature/onboarding/
    feature/path/
    feature/practice/
    feature/profile/
    feature/lesson/
    feature/settings/
    feature/parent/
    sync/
    baselineprofile/
  mobile/                   # Expo legacy تا cutover
  web/                      # demo/admin/API موجود
packages/                   # قرارداد و runtime مشترک موجود
docs/
  adr/ api/ architecture/ product/ qa/ roadmap/ archive/
design/                     # قرارداد برند و playbook صفحه‌ها
content-library/            # originals پژوهش، derived index و integration gates
skills/                     # workflowهای پروژه؛ یک پوشه برای هر Skill
```

قواعد وابستگی:

- `feature:* → core:*` مجاز است؛ implementation یک feature به feature دیگر import نمی‌شود.
- UI فقط state رندر می‌کند و action می‌فرستد؛ repository تنها مسیر data source است.
- domain model از DTO و database entity جداست.
- token source واحد باقی می‌ماند و خروجی TypeScript/Kotlin تولید می‌شود.

## 4. فازها و gateها

| فاز | هدف | خروجی اصلی | Gate خروج |
|---|---|---|---|
| N00 | Repository Reset | baseline، حذف generated artifact، canonical docs، verifier سالم | build/typecheck/test + inventory |
| N01 | Clean & Boundaries | dependency map، docs dedupe، V1/V2 retirement plan، naming rules | zero broken imports + clean gates |
| N02 | Native Foundation | `apps/android`، Gradle convention، CI، core modules، build harness واحد، content provenance و Skill structure | `android:gate` + source/skill gates |
| N03 | Native Design System | token codegen، typography RTL، components، screenshot catalog | screenshot + contrast + 360/390/412 |
| N04 | Entry & Auth | launch/onboarding/OTP/profile/grade placement | navigation + error/offline + security tests |
| N05 | Child Shell | مسیر/تمرین/من، unit/station start، settings/avatar | route parity + TalkBack + state restore |
| N06 | Learning Player | player state machine، سه projection محتوایی، authoring schema و ST07 draft با T01/T05/T13/T15 | server-truth + answer-stripping + ST07 acceptance |
| N07 | Offline, Audio & Content | Room/DataStore/sync، audio script/asset lifecycle، CMS governance و ۲۳۲ metadata row draft | retry/resume/checksum/fallback/RBAC/rollback |
| N08 | UX & Curriculum Completion | همهٔ stateها، پنج batch ایستگاه، scope/mastery calibration، motion/a11y و educational QA | route/content ledger 100% reviewed native |
| N09 | Cutover | feature parity، حذف Expo/V1/verifierهای تاریخی | native default + no legacy consumer |
| N10 | Release Readiness | hardening، performance، privacy، APK/AAB pipeline | device matrix + release checklist |

## 5. جزئیات فازهای Clean

### N00 — Repository Reset

1. baseline روی clone تمیز و ثبت اختلاف سند/کد.
2. حذف `parity-out-expo` و هر generated output track‌شده.
3. `.gitignore` واحد برای Node/Expo/Android/IDE/secrets/artifacts.
4. حذف handoffهای منسوخ و تثبیت `AGENTS.md` + `START_HERE.md`.
5. اصلاح verifierهایی که cache/build output را source تلقی می‌کنند.
6. ثبت inventory فایل/حجم/route/design-system.

### N01 — Clean Architecture & Structure

1. ساخت dependency graph برای `apps/mobile`, `packages`, scripts و docs.
2. برچسب هر فایل: `ACTIVE`, `MIGRATION_REFERENCE`, `GENERATED`, `HISTORICAL`, `DELETE_CANDIDATE`.
3. حذف dead code فقط با zero-consumer evidence و regression gate.
4. ادغام V1/V2: ابتدا consumerهای V1 به سطح canonical منتقل، سپس V1 در commit مستقل حذف شود.
5. docs: سندهای تصمیمی در `adr/architecture/product`؛ evidence در `archive`؛ duplicate/handoff خارج.
6. package naming: feature/domain/data/ui روشن؛ barrelهای مبهم و import عمیق ممنوع.
7. کاهش root docs به README/AGENTS/START_HERE و ledgerهای موقت لازم.

## 6. Route migration matrix

| مسیر فعلی | ماژول Native | فاز | stateهای اجباری |
|---|---|---|---|
| root launch | app/navigation | N04 | restoring/new/recover/error |
| onboarding + OTP | feature:onboarding | N04 | input/loading/invalid/offline/verified |
| profile + grade placement | feature:onboarding | N04 | incomplete/valid/saving/error |
| `(tabs)/index` | feature:path | N05 | loading/content/locked/offline/error |
| `(tabs)/practice` | feature:practice | N05 | empty/recommended/history/offline |
| `(tabs)/profile` | feature:profile | N05 | loading/content/error |
| avatar/settings | feature:profile/settings | N05 | dirty/saving/saved/error |
| parent | feature:parent | N05 | auth-required/loading/content/error |
| unit/jump | feature:path | N05 | available/locked/loading/error |
| station start | feature:lesson | N05 | ready/downloading/offline/error |
| station play | feature:lesson | N06 | teach/question/submitting/feedback/recovery |
| result/challenge | feature:lesson | N06 | result/next/retry/challenge/close-confirm |

هیچ route زمانی `MIGRATED` نیست که فقط screenshot مرورگر داشته باشد. حداقل unit + Compose UI + navigation + screenshot و یک device/emulator journey لازم است.

## 7. Design System V3

- یک token source برای color/type/space/radius/elevation/motion/touch size.
- semantic tokenها (`surface`, `content`, `action`, `feedback`) به‌جای رنگ خام.
- `ShomaraTheme` روی Material 3 سوار می‌شود، ولی هویت بصری SHOMARA را نگه می‌دارد.
- componentهای پایه: Button, TextField, OTP, Card, Choice, FeedbackSheet, Progress, TopBar, TabBar, Dialog, AudioControl.
- هر component state matrix، semantics، minimum touch target و screenshot test دارد.
- motion کوتاه، قابل لغو و تابع reduced-motion است؛ animation پیوسته هنگام حل ممنوع.
- depth چهار سطح flat/hint/soft/featured دارد؛ یک viewport تصمیم حداکثر یک سطح featured دارد و depth روی متن یا به‌عنوان تنها حامل معنا ممنوع است.
- قرارداد کامل خانواده‌ها و evidence در `design/playbook/COMPONENT_READINESS.md` نگه‌داری می‌شود.

## 8. Audio و CMS-ready content

Native نباید URL یا filename صوت را داخل صفحه hardcode کند. مدل پیشنهادی:

```text
AudioAsset(id, locale, purpose, version, checksum, durationMs,
           remoteUrl, localState, rightsStatus, moderationStatus)
```

- محتوا با manifest نسخه‌دار از backend دریافت می‌شود.
- فایل با checksum تأیید، در cache اتمیک ذخیره و با fallback کنترل‌شده پخش می‌شود.
- UI stateهای unavailable/downloading/ready/failed را می‌شناسد.
- CMS آینده فقط asset/metadata/ordering را مدیریت می‌کند؛ correctness و progression را تغییر نمی‌دهد.
- انتشار صوت نیازمند rights + moderation + delivery-ready gate است.
- script metadata از binary asset version جداست؛ voice/rate موجود در CSV فقط provider hint است.
- پنل ادمین باید RBAC، audit actor/time، impact analysis، orphan/missing report، version history و rollback داشته باشد.

پژوهش‌های `content-library/originals/**` مستقیماً runtime نیستند. promotion فقط طبق `content-library/integration/PHASE_INTEGRATION.md` انجام می‌شود. قرارداد سه مدل و lifecycle در `content-library/integration/AUTHORING_CONTRACT_GAPS.md` است. ST07 تنها پایلوت کامل است و ۲۴ ایستگاه دیگر بعد از gate پایلوت در پنج batch author می‌شوند؛ answer/evaluator/threshold فایل‌های authoring هرگز وارد child client نمی‌شود.

## 9. Definition of Done هر صفحه

- همهٔ stateهای مرتبط طراحی و تست شده‌اند.
- یک CTA اصلی و مسیر Back/Close روشن است.
- فارسی، RTL و اعداد فارسی صحیح‌اند؛ نمایش ریاضی بی‌جهت mirror نشده است.
- 360/390/412dp، font scale، keyboard و safe area تست شده‌اند.
- TalkBack label/role/state واقعی است؛ touch target حداقل 48dp.
- fast tap، duplicate submit، offline، timeout و resume رفتار قطعی دارند.
- screenshot قبل/بعد و test log ثبت شده است.
- موارد device/child/educational با برچسب `UNVERIFIED` پنهان نمی‌شوند.

## 10. Definition of Done کل مهاجرت

1. تمام routeهای matrix روی Native به `TESTED_NATIVE` رسیده‌اند.
2. هیچ import یا runtime dependency به Expo child client باقی نمانده است.
3. V1/V2 legacy، goldenها و verifierهای اختصاصی آن‌ها با evidence حذف شده‌اند.
4. API/learning contract tests بین Native و backend سبزند.
5. offline/resume/audio/device/TalkBack/performance/privacy gates ثبت شده‌اند.
6. CI قادر است Debug APK و Release AAB امضاشونشده/مجاز را تکرارپذیر بسازد.
7. release artifact فقط پس از checklist و اجازهٔ صریح مالک تولید می‌شود.
