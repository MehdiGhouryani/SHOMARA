# چک‌لیست انسانی فازهای SHOMARA Native

وضعیت دقیق taskها در `harness/roadmap.json` است. این سند معیارهای انسانی هر فاز را توضیح می‌دهد و جایگزین status ماشینی نیست.

## قاعدهٔ عمومی هر checkpoint

- [ ] `git status` و branch بررسی شد.
- [ ] `harness validate/status/next` اجرا شد.
- [ ] فقط task و مسیرهای مجاز تغییر کردند.
- [ ] هیچ verifier/threshold برای عبور ظاهری ضعیف نشد.
- [ ] تست‌های متناسب با ریسک اجرا و exit code ثبت شد.
- [ ] START_HERE، roadmap و WORKLOG هم‌زمان به‌روز شدند.
- [ ] `UNVERIFIED/BLOCKED` صریح ماند.
- [ ] ZIP از commit تمیز ساخته و checksum ثبت شد.

## N00 — Repository Reset

- [x] clone و baseline commit ثبت شد.
- [x] artifact تولیدی از Git حذف شد.
- [x] canonical docs تثبیت شد.
- [x] release verifier و OTP test ایزوله شدند.
- [x] Node 22 build/typecheck/503 tests پاس شد.
- [ ] Chromium gates؛ محیط فعلی مسدود است.

## N01 — Clean Architecture & Structure

- [x] root artifactهای بدون مصرف حذف شدند.
- [x] Node/package metadata استاندارد شد.
- [x] harness، schema، ledger و resume protocol ساخته شد.
- [x] repository/package map ثبت شد.
- [x] consumer graph V1/V2 و workspaceها ثبت شد.
- [x] docs index و طبقه‌بندی current/legacy/history ساخته شد.
- [x] Design System migration plan ثبت شد.
- [x] اولین dead-code batch فقط با zero-consumer proof حذف شد.
- [ ] بازنشستگی کامل V1؛ تا browser gate و consumer migration مسدود.
- [ ] final N01 gates و package checkpoint.

## N02 — Native Foundation

- [ ] `applicationId`, minSdk, targetSdk و namespace تصویب شود.
- [ ] Kotlin/AGP/Gradle/JDK در version catalog و wrapper پین شود.
- [ ] `app`, `core:common`, `core:model`, `core:testing` ایجاد شود.
- [ ] single-activity/navigation/error model/DI تعریف شود.
- [ ] هیچ feature business logic وارد `app` نشود.
- [ ] unit/lint/compile روی clean clone و CI پاس شود.
- [ ] هیچ APK نهایی یا signing secret وارد repository نشود.

## N03 — Design System V3

- [ ] یک token JSON canonical و schema معتبر وجود داشته باشد.
- [ ] codegen خروجی Kotlin/TypeScript و drift gate داشته باشد.
- [ ] فونت Vazirmatn، RTL، semantic color/type/shape تعریف شود.
- [ ] component state matrix برای button/input/OTP/card/choice/feedback/progress/navigation/audio کامل شود.
- [ ] touch target، contrast، reduced motion و semantics تست شود.
- [ ] screenshotهای 360/390/412 و font scale بازبینی شود.
- [ ] مالک سه صفحهٔ نماینده را تصویب کند.

## N04 — Entry, Onboarding & Auth

- [ ] launch stateهای restoring/new/recover/error داشته باشد.
- [ ] phone/OTP validation فارسی و rate-limit/timeout/offline پوشش داده شود.
- [ ] token فقط در storage امن نگه‌داری شود.
- [ ] production هیچ guest/dev mock قابل دسترس نداشته باشد.
- [ ] profile/grade save retry و incomplete state داشته باشد.
- [ ] back/keyboard/process recreation تست شود.
- [ ] journey کامل با TalkBack و screenshot ثبت شود.

## N05 — Child Shell

- [ ] سه تب «مسیر/تمرین/من» و state مستقل تب‌ها.
- [ ] path stateهای locked/current/completed/loading/offline/error.
- [ ] unit/jump/station start با CTA و علت قفل روشن.
- [ ] practice empty/recommended/history بدون تنبیه.
- [ ] profile/avatar/settings با dirty/saving/error.
- [ ] parent surface خارج از shell کودک بماند.
- [ ] deep link/back/resume و 360/390/412 تست شود.

## N06 — Learning Player

- [ ] API mapping بدون answer key در کلاینت.
- [ ] teach/guided/assessment/recovery/result/challenge state machine.
- [ ] submit تکی، idempotency و fast-tap guard.
- [ ] next step فقط از پاسخ سرور.
- [ ] feedback اشتباه گرم و غیرتنبیهی.
- [ ] close-confirm/resume/offline interruption.
- [ ] station journey کامل با تست contract/navigation/a11y.

## N07 — Offline, Audio & CMS-ready Content

- [ ] Room/DataStore migration tests.
- [ ] local source مبنای read و repository مسئول sync.
- [ ] queue retry/idempotency/conflict policy.
- [ ] content manifest نسخه‌دار و activation اتمیک.
- [ ] audio checksum/cache/fallback و stateهای پخش.
- [ ] CMS rights/moderation/delivery-ready gates.
- [ ] corrupt file/network loss/process death تست شود.

## N08 — UX Completion

- [ ] تمام route/state ledger به TESTED_NATIVE برسد.
- [ ] TalkBack traversal و state semantics واقعی باشد.
- [ ] font scale 200%، RTL و جهت ریاضی صحیح باشد.
- [ ] motion/haptic قابل لغو و reduced-motion compliant باشد.
- [ ] fast tap/offline/process death هیچ dead end نسازد.
- [ ] QA آموزشی و کودک به‌شکل privacy-safe ثبت شود.
- [ ] صفر P0/P1 و rubric critical dimensions حداقل 3.

## N09 — Cutover

- [ ] feature parity و contract diff تصویب شود.
- [ ] Native کلاینت و CI پیش‌فرض شود.
- [ ] Expo فقط پس از zero-consumer proof حذف شود.
- [ ] V1/V2/goldens/verifierهای قدیمی با replacement gate حذف شوند.
- [ ] ROADMAP legacy و اسناد تاریخی از root خارج شوند.
- [ ] clean clone بدون Expo runtime پاس شود.

## N10 — Release Readiness

- [ ] security/privacy/secret/log/storage audit.
- [ ] Macrobenchmark و Baseline Profile روی دستگاه ثبت شود.
- [ ] device matrix برای low/mid/high Android کامل شود.
- [ ] TalkBack/audio/offline/crash/ANR gates ثبت شود.
- [ ] versioning/signing/checksum/provenance مستند شود.
- [ ] مالک release checklist و ساخت artifact را صریحاً تأیید کند.
- [ ] APK/AAB واقعی نصب و smoke-test شود.
- [ ] source ZIP و hash همراه artifact تحویل شود.
