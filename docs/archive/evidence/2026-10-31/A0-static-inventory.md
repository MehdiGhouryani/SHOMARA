# A0 — ممیزی ایستا صفحه‌ها (مبنا `a25d257`، نسخهٔ ۲)

| | |
|---|---|
| تاریخ | 2026-10-31 |
| مبنا | `origin/main` = `a25d257` (merge PR #2). درخت آن با `1182313` یکسان است. کد اپ در `3aab18a` با `a25d257` یکسان است (`apps`، `packages`، `scripts`). |
| شاخهٔ سند | `docs/phase-a0-audit-apk`: نسخهٔ ۱ در `3aab18a`، نسخهٔ ۲ (این سند) در commit بعدی همین شاخه |
| مبنای ساخت APK | همین شاخه؛ شامل قاعدهٔ `.gitignore` برای `apps/mobile/android` و `apps/mobile/ios` |
| وضعیت APK | ساخته و نصب نشده. شاهد دستگاه: صفر |
| نوع | ممیزی ایستا؛ بدون اجرای APK؛ بدون تغییر کد اپ |
| مجوز | فاز A0 در `START_HERE.md` §۱۱ |

## خلاصه

- ۱۵ فایل route داریم: ۱۳ صفحه و ۲ layout. `station/[stationId]/index.tsx` فقط به `start` redirect می‌کند. [کد]
- در release بدون `EXPO_PUBLIC_API_BASE_URL`، `productionConfigError()` خطا برمی‌گرداند (`runtime.ts:41–43`) و `station/[stationId]/start.tsx:30–31` به `error` می‌رود. [کد] پیش‌بینی: در APK محلی، دکمهٔ شروع ایستگاه غیرفعال و پیام «آماده‌سازی محتوا کامل نشد» دیده می‌شود. [پیش‌بینی]
- ورود به ایستگاه از واحد (`unit/[unitId].tsx:31`)، جامپ (`unit/[unitId]/jump.tsx:118`) و تمرین (`PracticeHubScreen.tsx:63`) همیشه از `start` می‌گذرد. مسیر اصلی (`(tabs)/index.tsx:102–103`) فقط وقتی `getResume` برای ایستگاه مقدار ندارد از `start` می‌گذرد؛ اگر مقدار داشته باشد مستقیم به `play` می‌رود. انتظار می‌رود در نصب تازه resume خالی باشد (تأیید نشده). [نشانگر] پس تدریس، تمرین، ارزیابی و نتیجه در APK محلی از مسیر عادی دیده نمی‌شوند؛ این تصمیم مالک است و A0 کد را تغییر نمی‌دهد.
- AUTH و OTP در حالت محلی رد می‌شوند (`onboarding.tsx:101`، `:109`). [کد] پس تست OTP فقط با backend (I2) ممکن است.
- کپی «ستاره» در `characters.ts:99` و نمایش آن در `StationFlow.tsx:751` با قاعدهٔ ۸ ناسازگار است. اصلاح در فاز ۱ است. [کد]
- ناوبری داخلی به `missions` پیدا نشد؛ route هنوز ثبت است و API آن فقط از همان صفحه صدا زده می‌شود. اثبات صفر-مصرف (L8) کامل نیست؛ حذف فقط با تصمیم مالک. [نشانگر]
- `views/ChallengeIntroView.tsx` در `app` و `src` importer ندارد، اما `parity/specimens/station.tsx` و `scripts/verify-ui-v1-result.mjs` از آن استفاده می‌کنند؛ پس کد مرده نیست. نسخهٔ ۱ این را «کاندید کد مرده» نوشته بود؛ اصلاح شد. [نشانگر]
- متغیرهای محیط: طبق کد نصب‌شدهٔ Expo، هر متغیر `EXPO_PUBLIC_*` که در محیط سازنده باشد وارد bundle می‌شود، حتی اگر کد آن را نخواند. بخش ۷ برای همین بررسی نام‌ها دارد. [کد نصب‌شده]

## ۱. روش، برچسب شاهد و حدود

برچسب هر ادعا یکی از این‌هاست:

- `[کد]`: خط کد در این شاخه خوانده شد.
- `[کد نصب‌شده]`: کد داخل `node_modules` نسخهٔ قفل‌شده خوانده شد؛ اثرش روی APK هنوز تأیید نشده.
- `[نشانگر]`: خروجی `git grep` است؛ حکم رفتاری نیست.
- `[سند]`: متن ADR یا مستند ریپو است؛ اجرا نشده.
- `[ابزار]`: فرمان اجرا شد؛ خروجی و exit code در شاهد ایجنت آمده است.
- `[پیش‌بینی]`: از کد استنتاج شده؛ تا شاهد دستگاه نیاید حکم نیست.
- `[دستگاه]`: هنوز شاهدی وجود ندارد.

نسخهٔ ۲ این کارها را انجام داد: بازخوانی ارجاع‌های کد؛ `git grep` برای `ChallengeIntroView`، `missions`/`getMissionHub`، `/start`، `isLocalContentPreview()`، `productionConfigError()`، کلیدهای `EXPO_PUBLIC_*` و `MOBILE_RELEASE_CHANNEL`؛ بررسی نسخه‌ها در `package-lock.json`؛ خواندن ADR-0037 (L7 تا L17) و `docs/release/APK_PREVIEW.md` §4b؛ بررسی `babel-preset-expo`، `@expo/metro-config` و `@expo/env` نصب‌شده.

انجام نشد: اجرای Gradle، نصب، اسکرین‌شات، دیدن Hermes روی دستگاه، تست deep link و تست OTP.

- شمارش‌ها با `grep -cE` روی `apps/mobile/app` و فایل‌های تفویضی `apps/mobile/src` در یک worktree موقت از `a25d257` انجام شد. الگوها در بخش ۸ آمده‌اند.
- هر عدد نشانهٔ حضور یک واژه است، نه تأیید رفتار. مثلاً `error` می‌تواند نام یک style باشد.
- ستون `<48` کاندید هدف لمسی است. نتیجهٔ بررسی کاندیدها در بخش ۶، مورد ۵ است.
- ستون `child` واژه‌های کاندید قاعدهٔ ۸ است. صفر یعنی واژه‌ای در همان فایل نیست؛ متن ستاره می‌تواند از فایل دیگری import شود.
- `hex` در هیچ‌یک از ۱۵ فایل route صفر است.
- A0 در `harness/roadmap.json` ثبت نشده (L17). `harness next` بدون تغییر است.

## ۲. ۱۵ فایل route (۱۳ صفحه و ۲ layout)

| file | LOC | load | err | offline | empty | retry | resume | server | cfg | child | hex | magic | <48 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `(tabs)/_layout.tsx` | 18 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `(tabs)/index.tsx` | 170 | 3 | 0 | 5 | 0 | 0 | 5 | 2 | 0 | 0 | 0 | 0 | 0 |
| `(tabs)/practice.tsx` | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `(tabs)/profile.tsx` | 146 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| `_layout.tsx` | 73 | 3 | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| `avatar.tsx` | 226 | 0 | 14 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 5 | 0 |
| `missions.tsx` | 60 | 0 | 4 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 13 | 1 |
| `onboarding.tsx` | 397 | 13 | 27 | 1 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 5 | 1 |
| `parent.tsx` | 179 | 0 | 3 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 35 | 1 |
| `settings.tsx` | 91 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 2 |
| `station/[stationId]/index.tsx` | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `station/[stationId]/play.tsx` | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `station/[stationId]/start.tsx` | 118 | 7 | 13 | 0 | 0 | 0 | 0 | 6 | 3 | 0 | 0 | 0 | 0 |
| `unit/[unitId].tsx` | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 |
| `unit/[unitId]/jump.tsx` | 162 | 5 | 17 | 0 | 0 | 7 | 0 | 3 | 4 | 0 | 0 | 26 | 1 |

## ۳. پیاده‌سازی تفویضی (فایل‌های زیر صفحه‌ها)

| file | LOC | load | err | offline | empty | retry | resume | server | cfg | child | hex | magic | <48 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `src/station/StationFlow.tsx` | 954 | 16 | 18 | 1 | 0 | 11 | 26 | 27 | 2 | 0 | 0 | 33 | 3 |
| `src/station/LessonPlayerChrome.tsx` | 106 | 0 | 4 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 12 | 4 |
| `src/station/SignatureChallengeView.tsx` | 288 | 5 | 8 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 11 | 0 |
| `src/station/views/ChallengeIntroView.tsx` | 54 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `src/station/views2/StationStartV2.tsx` | 102 | 2 | 4 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| `src/station/views2/LessonViewsV2.tsx` | 257 | 5 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0 | 4 | 0 |
| `src/station/runtimeApi.ts` | 610 | 5 | 16 | 4 | 0 | 2 | 2 | 10 | 0 | 0 | 0 | 0 | 0 |
| `src/path/PathView2.tsx` | 321 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 6 |
| `src/path/pathModel.ts` | 99 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `src/ui/PracticeHubScreen.tsx` | 77 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `src/profile/views2/MeView2.tsx` | 99 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| `src/components/ChildAvatar.tsx` | 42 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| `src/onboarding/views2/PhoneView2.tsx` | 58 | 3 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `src/onboarding/views2/CodeView2.tsx` | 57 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `src/onboarding/views2/ProfileView2.tsx` | 112 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| `src/onboarding/views2/WelcomeView2.tsx` | 44 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| `src/navigation/ChildTabBar.tsx` | 40 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `src/content/bootstrap.ts` | 62 | 0 | 5 | 0 | 0 | 0 | 0 | 6 | 3 | 0 | 0 | 0 | 0 |
| `src/auth/authApi.ts` | 59 | 0 | 3 | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 0 | 0 |
| `src/config/runtime.ts` | 46 | 0 | 1 | 0 | 0 | 0 | 0 | 7 | 1 | 0 | 0 | 0 | 0 |

## ۴. نگاشت به ردیف‌های backlog

منبع: `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` (۲۰ ردیف، همه `NATIVE_PENDING`). ستون «پیش‌بینی» از روی کد است و تا روی دستگاه تأیید نشود، حکم نیست.

| ردیف | خانواده | پیاده‌سازی Expo | پیش‌بینی در APK محلی | یادداشت |
|---|---|---|---|---|
| UI-001 | root launch/session | `app/_layout.tsx`، `auth/AuthSession`، `auth/ClientInstallation` | قابل مشاهده | |
| UI-002 | onboarding flow | `app/onboarding.tsx` (مراحل AUTH، OTP، CHILD، PLACEMENT) | بخشی | [کد] AUTH و OTP در حالت محلی رد می‌شوند (`:101`، `:109`) |
| UI-003 | phone & OTP | `onboarding.tsx` + `views2/PhoneView2`، `views2/CodeView2` + `auth/authApi.ts` | قابل تست نیست | [کد] در حالت محلی به این مرحله نمی‌رسد؛ حالت‌های ارسال، خطا و cooldown فقط با backend (I2) دیده می‌شوند |
| UI-004 | profile setup | `onboarding.tsx` (مرحلهٔ CHILD) + `views2/ProfileView2` | بخشی | |
| UI-005 | grade & placement | `onboarding.tsx` (مرحلهٔ PLACEMENT، حدود خط ۲۹۵) | بخشی | [کد] `prepareGradeContent` در حالت محلی اجرا نمی‌شود (`:196`) |
| UI-006 | child tab shell | `app/(tabs)/_layout.tsx` + `navigation/ChildTabBar` | قابل مشاهده | |
| UI-007 | learning path | `app/(tabs)/index.tsx` + `path/PathView2` + `path/pathModel` | بخشی | [کد] بنر حالت محلی در `:132`؛ ورود به ایستگاه در `:102–103` (بدون resume به `start`، با resume به `play`) |
| UI-008 | station start | `app/station/[stationId]/start.tsx` + `views2/StationStartV2` | [پیش‌بینی] خطا | [کد] `start.tsx:30–31` بدون استثنای preview به `error` می‌رود؛ دکمه با `startDisabled` (`:107`) غیرفعال می‌شود |
| UI-009 تا UI-012 | teach، guided practice، assessment، result | `station/[stationId]/play.tsx` (۷ خط) → `StationFlow.tsx` (۹۵۴ خط) + `LessonPlayerChrome` + `views2/LessonViewsV2` | وابسته به UI-008 | [نشانگر] ورود عادی از `start` است؛ روی دستگاه تأیید نشده |
| UI-013 | practice tab | `app/(tabs)/practice.tsx` → `ui/PracticeHubScreen` (۷۷ خط) | قابل مشاهده | ورود به ایستگاه از `PracticeHubScreen.tsx:63` |
| UI-014 | challenge | `StationFlow` → `ChallengeIntroView2` (`views2/LessonViewsV2.tsx:213`) و `SignatureChallengeView` (۲۸۸ خط) | وابسته به ایستگاه | [نشانگر] `views/ChallengeIntroView` در parity و `verify-ui-v1-result` استفاده می‌شود (بخش ۶، مورد ۲) |
| UI-015 | profile & me | `app/(tabs)/profile.tsx` → `profile/views2/MeView2` | قابل مشاهده | |
| UI-016 | avatar workshop | `app/avatar.tsx` (۲۲۶ خط) + `components/ChildAvatar` | قابل مشاهده | ۱۴ نشانهٔ `error`: بررسی دستی |
| UI-017 | settings | `app/settings.tsx` (۹۱ خط) | قابل مشاهده | [کد] ردیف‌های لمسی ۷۸dp (`:80`)؛ دو سوئیچ `motion` (`:33`، `:51`) |
| UI-018 | guardian surface | `app/parent.tsx` (۱۷۹ خط) | قابل مشاهده | [کد] بدون ارجاع سرور؛ حذف محلی با تایپ عبارت (`:36`)؛ حذف روی سرور (کار ۳.۱۱) باز است |
| UI-019 | system states | پراکنده در فایل‌های بالا | — | در A0 جدا ممیزی نشد |
| UI-020 | full child journey | — | — | نیازمند backend و دستگاه (I2، I4) |
| بدون ردیف | `app/missions.tsx` (۶۰ خط) | ثبت در `_layout.tsx:60`؛ API در `runtimeApi.ts:406–407` | — | [نشانگر] ناوبری داخلی ندارد؛ فقط خود صفحه `getMissionHub` را صدا می‌زند؛ صفر-مصرف کامل اثبات نشده (L8) |
| بدون ردیف | `app/unit/[unitId].tsx` و `app/unit/[unitId]/jump.tsx` | نزدیک‌ترین ردیف UI-007 | — | تأیید با مالک |

## ۵. رفتار حالت local-content (شواهد کد)

- `src/config/runtime.ts:6–9`: قرارداد. نسخهٔ preview بدون API به سرور وصل نمی‌شود و نباید وضعیت سروری، همگام‌سازی یا پیشرفتی نشان دهد که رخ نداده. [کد]
- `runtime.ts:28–29`: `isLocalContentPreview()` یعنی کانال `preview` + release + نبودن `EXPO_PUBLIC_API_BASE_URL`. [کد]
- `runtime.ts:41–43`: در release بدون API، `productionConfigError()` متن «اتصال سرویس یادگیری برای این نسخه تنظیم نشده است.» را برمی‌گرداند. هیچ استثنای preview در این تابع نیست. این متن فنی است و برای کودک مناسب نیست. [کد]
- استثنا شده و در حالت محلی عبور می‌کند: `(tabs)/index.tsx:61` و `:132`، `onboarding.tsx:101`، `:109`، `:196`، `StationFlow.tsx:446`. [کد]
- استثنا نشده: `station/[stationId]/start.tsx:30–31` (به `error`)، `unit/[unitId]/jump.tsx:34–36` (متن پیکربندی را در `setError` می‌گذارد)، `src/content/bootstrap.ts:36–37` (پرتاب `CONTENT_CONFIG_ERROR`)، و `src/auth/authApi.ts:16`. مسیر خطای فراخواننده‌ها در A0 کامل بررسی نشد. [کد]
- ناهمگونی: `StationFlow.tsx:446` حالت محلی را استثنا می‌کند ولی `start.tsx` نمی‌کند. این ناهمگونی به یک منطق مشترک نیاز دارد؛ اصلاح در فاز ۱ یا ۲ است، نه A0. [کد]
- `app/missions.tsx:17` و `:23`: خطای بارگذاری «ماموریت‌ها فعلاً آماده نیستند. مسیرت همچنان ذخیره است.» را نشان می‌دهد. در حالت محلی سروری وجود ندارد، پس «ذخیره است» ممکن است ادعایی باشد که رخ نداده. کامنت `runtime.ts` همین را ممنوع کرده است. [کد] [پیش‌بینی]

## ۶. یافته‌ها برای بازبینی (در A0 اصلاح نشده‌اند)

1. **کپی ستاره (کار ۱.۷، قاعدهٔ ۸).** [کد] `src/characters/characters.ts:99` متن «جشن بگیریم! ستاره‌ی جدید مال توست!» دارد و `src/station/StationFlow.tsx:751` در مرحلهٔ `COMPLETE` آن را نشان می‌دهد. اصلاح در فاز ۱ است، نه A0. (`characters.ts:38` متن شخصیت است و پاداش نیست.)

2. **`views/ChallengeIntroView.tsx` (اصلاح نسخهٔ ۱).** [نشانگر] در `app` و `src` importer ندارد، ولی `apps/mobile/parity/specimens/station.tsx:1` و `:93` آن را برای parity استفاده می‌کنند، `apps/mobile/parity/manifest.json:252` به آن ارجاع دارد، و `scripts/verify-ui-v1-result.mjs:24` و `:39` آن را برای بررسی wiring می‌خوانند. پس کد مرده نیست. حذف آن فقط با بازنویسی parity و verifier و تصمیم مالک ممکن است؛ AGENTS §۳ بند ۴ اجازه نمی‌دهد verifier برای سبز شدن ضعیف شود.

3. **متن فنی و گمراه‌کننده برای کودک.** [کد] + [پیش‌بینی]
   - الف) `runtime.ts:43` و `jump.tsx:34–36` (`setError(configError)`) متن فنی «اتصال سرویس یادگیری برای این نسخه تنظیم نشده است.» را به صفحه می‌دهند.
   - ب) `strings.fa.ts:46` (`prepareFailed`، فقط در `start.tsx:91` مصرف می‌شود) می‌گوید «اتصال را بررسی کن». در حالت محلی اتصالی وجود ندارد؛ پیام گمراه‌کننده است.
   - نسخهٔ کودک باید بازنویسی شود (فاز ۱ یا ۳).

4. **`missions`.** [نشانگر] + [کد] جست‌وجوی `/missions` فقط مسیر API را پیدا کرد (`runtimeApi.ts:407`). `getMissionHub` (`runtimeApi.ts:406`) تنها در `missions.tsx:9` وارد و در `:17` صدا زده می‌شود. route در `_layout.tsx:60` ثبت است و با آدرس یا deep link قابل باز شدن است (تست نشد). متن خطای آن (`:23`) در حالت محلی «مسیرت همچنان ذخیره است» می‌گوید. L8 حذف را فقط با اثبات صفر-مصرف مجاز می‌داند؛ این اثبات کامل نیست. تصمیم با مالک است.

5. **هدف لمسی (۴۸dp).** [کد] `packages/design-system/src/tokens.json:95` مقدار `touchMin` را ۴۸ تعریف می‌کند. هیچ مورد زیر ۴۸dp به‌عنوان هدف لمسی ثابت نشد:
   - `settings.tsx:86`: کلید ۳۰dp است، اما هدف لمسی `Pressable` ردیف `minHeight: 78` دارد (`:63`، `:80`). غلط مثبت.
   - `parent.tsx:158` (`focusMark` ۴۴×۴۴): داخل کارت (`:72`) یک `Text` تزئینی «+» است و `Pressable` نیست. غلط مثبت.
   - `PathView2.tsx:269` (`gradeChip` ۴۴): داخل `View` است؛ هدف لمسی `gradeHit` (`:113`، `:264`) با `minHeight: K2.touchMin` یعنی ۴۸ است. غلط مثبت.
   - `LessonPlayerChrome.tsx:89` (`safeBadge` ۳۲) و `:98` (`feedbackIcon` ۴۰×۴۰): هر دو در `View` (خطوط ۴۰ و ۶۱). غلط مثبت.
   - `onboarding.tsx:391` (`resultBadge` ۴۰): در `View` (خط ۳۳۲). غلط مثبت.
   - `PathView2.tsx:286`، `:294`، `:295` و `missions.tsx:57` (بنر و نوار پیشرفت): غیرلمسی. غلط مثبت.
   - `StationFlow.tsx:936` (`patternDot` ۳۴×۳۴) و `:940` (`countObject` ۳۴×۳۴): در `View` استفاده می‌شوند (`PatternGame` خط ۸۸۱، `CountGame` خط ۸۸۴، `RecoveryGame` خط ۹۱۰). غیرلمسی‌اند، پس نقض ۴۸dp نیستند. اما کار ۳.۵ برای مهره‌ها ۷۲–۸۰dp می‌خواهد و این‌ها ۳۴dp هستند. این گپ اندازه است، نه گپ لمس.

6. **مقادیر جادویی.** [نشانگر] بیشترین شمارش در `parent.tsx` (۳۵)، `StationFlow.tsx` (۳۳)، `jump.tsx` (۲۶) و `PathView2.tsx` (۱۴) است. این عددهای مستقیم استایل‌اند و با AGENTS §۳ بند ۱۰ و کار ۳.۷ مغایرند.

7. **شناسهٔ توسعه.** [کد] `runtimeApi.ts:7–8`: `DEV_LEARNING_ID` فقط در `__DEV__` مقدار دارد، پس کلاینت release آن را نمی‌فرستد. guard سرور (کار ۱.۶) همچنان باز است. `runtimeApi.ts:10–12` برای سه کلید دیگر پیش‌فرض دارد (`platform`، `g1-build-001`، `g1-canonical-v1.0`).

8. **Hermes و نسخه‌ها.** [سند] + [نشانگر] `APK_PREVIEW.md` §4b ریسک regression در Hermes را برای RN `0.86.0` ثبت کرده و «crash عجیب JS» را مظنون اول می‌داند. `app.json:8` موتور `hermes` را تنظیم می‌کند. lock همین نسخه‌ها را دارد: RN `0.86.0` (`package-lock.json:8162`) و Expo `57.0.26` (`:5496`)؛ بازهٔ `package.json:27` ‏`~57.0.24` است. ارتقای RN به ≥ ۰.۸۶.۲ طبق L9 در فاز ۲.۲ با gate کامل انجام می‌شود، نه در A0. اثر این ریسک روی این APK تکرار نشده است.

9. **هشدارهای prebuild.** [ابزار] (شاهد ایجنت، نسخهٔ ۱) prebuild هشدار داد که `react-native@0.86.0` در برابر نسخهٔ مورد انتظار `0.86.3` است و درباره `expo-system-ui` (در ارتباط با `userInterfaceStyle`) هشدار داد. `app.json:7` مقدار `light` دارد. A0 هیچ‌کدام را تغییر نداد (L9).

10. **`.gitignore`.** [ابزار] `apps/mobile/android/` و `apps/mobile/ios/` در این شاخه پوشیده شده‌اند (`.gitignore:46–47`). این تغییر کد اپ نیست، اما L15 می‌گوید فاز صفر فقط مستند است؛ مالک می‌تواند این دو خط را جدا برگرداند. مسیر Track B یعنی `apps/android` تحت‌تأثیر قرار نمی‌گیرد.

11. **صفحهٔ والدین.** [کد] ارجاع سرور ندارد. حذف محلی با تایپ عبارت تأیید می‌شود (`parent.tsx:36`، `:44`) و پس از موفقیت توکن پاک و به `/onboarding` می‌رود (`:47`). تطبیق با تصمیم ParentGate (L7، START_HERE §۷) در A0 بررسی نشد. حذف روی سرور (کار ۳.۱۱) باز است.

12. **دو سوئیچ برای یک تنظیم.** [کد] `settings.tsx:33` و `:51` هر دو `update('motion')` را صدا می‌زنند؛ دومی مقدار معکوس نشان می‌دهد. رفتار سازگار است، ولی تکراری و احتمالاً گیج‌کننده. اولویت پایین.

13. **متغیرهای محیط ساخت.** [کد] + [کد نصب‌شده] + [نشانگر]
   - کد اپ `EXPO_PUBLIC_API_BASE_URL` و `EXPO_PUBLIC_RELEASE_CHANNEL` را در `runtime.ts:12` و `:16` می‌خواند. `EXPO_PUBLIC_DEV_LEARNING_ID`، `EXPO_PUBLIC_RELATIONSHIP_CONTEXT_ID`، `EXPO_PUBLIC_CURRICULUM_VERSION` و `EXPO_PUBLIC_SKILL_GRAPH_VERSION` را در `runtimeApi.ts:7–12` می‌خواند.
   - `@expo/metro-config/build/serializer/environmentVariableSerializerPlugin.js:17–25` همهٔ متغیرهای محیط با پیشوند `EXPO_PUBLIC_` را جمع می‌کند، حتی اگر کد آن‌ها را نخواند. پس هر `EXPO_PUBLIC_*` غیرمنتظره در shell سازنده می‌تواند وارد bundle شود. این نتیجهٔ کد است؛ اثرش روی APK ساخته‌شده هنوز تأیید نشده.
   - `MOBILE_RELEASE_CHANNEL` پیشوند `EXPO_PUBLIC_` ندارد؛ با همین مکانیزم وارد bundle نمی‌شود، و کد اپ هم آن را نمی‌خواند.
   - `EXPO_PUBLIC_SUPABASE_URL` و `EXPO_PUBLIC_SUPABASE_ANON_KEY` در `.env.example` هستند، ولی کد اپ آن‌ها را نمی‌خواند.

14. **`.env.example` و فایل‌های `.env`.** [کد نصب‌شده] + [نشانگر] `@expo/env/build/index.js:155` فایل‌هایی مانند `.env` و `.env.local` را بارگذاری می‌کند؛ `.env.example` در فهرست‌های دیده‌شده نیست. `.env.example` ریشه، `EXPO_PUBLIC_API_BASE_URL=` را خالی و `MOBILE_RELEASE_CHANNEL=preview` را دارد. اگر کسی آن را به `apps/mobile/.env` کپی کند، مقادیرش وارد ساخت می‌شوند. در شاخهٔ ایجنت `apps/mobile/.env*` وجود ندارد.

## ۷. دستور ساخت و نصب (مالک، محلی)

ایجنت این فرمان‌ها را اجرا نکرده و به credential دسترسی ندارد. فرمان‌ها برای PowerShell‌اند، از ریشهٔ مخزن شما شروع می‌شوند و شاخهٔ فعلی شما را تغییر نمی‌دهند.

```powershell
# 0) مبنا: شاخهٔ ممیزی (شامل .gitignore)
git fetch origin '+refs/heads/docs/phase-a0-audit-apk:refs/remotes/origin/docs/phase-a0-audit-apk'
git worktree add --detach ..\shomara-a0-audit origin/docs/phase-a0-audit-apk
cd ..\shomara-a0-audit
git status --short          # باید خالی باشد
git rev-parse --short HEAD  # در گزارش ثبت شود

# 1) محیط: فقط نام متغیرهای EXPO_PUBLIC_ (مقدار چاپ نمی‌شود)
Get-ChildItem Env: | Where-Object { $_.Name -like 'EXPO_PUBLIC_*' } | ForEach-Object { $_.Name }
#   هر نامی که در این ساخت لازم نیست را پاک کنید: Remove-Item "Env:<NAME>"
Remove-Item Env:EXPO_PUBLIC_API_BASE_URL -ErrorAction SilentlyContinue
#   فایل‌های .env در پوشهٔ اپ: فقط نام کلیدها. انتظار: فایلی نیست یا EXPO_PUBLIC_API_BASE_URL در آن نیست
Get-ChildItem -Force apps\mobile -Filter '.env*' | ForEach-Object { $_.Name; Get-Content $_.FullName | ForEach-Object { ($_ -split '=', 2)[0] } }

# 2) ابزار: JDK 17 یا بالاتر (همان پین N02؛ wrapper: Gradle 9.3.1)، Android SDK Platform 36 نصب، adb در PATH
java -version
$env:JAVA_HOME      # پوشهٔ JDK؛ JBR داخلی Android Studio هم قابل قبول است
$env:ANDROID_HOME   # پوشهٔ SDK؛ Platform 36 باید نصب باشد (compileSdk در gradle.properties)
adb version

# 3) بسته‌ها و prebuild (همان شاهد ایجنت)
npm ci
npm run build:packages
cd apps\mobile
npx expo prebuild --platform android --clean --no-install

# 4) متغیرهای ساخت: فقط preview و بدون API
$env:EXPO_PUBLIC_RELEASE_CHANNEL = 'preview'
$env:MOBILE_RELEASE_CHANNEL = 'preview'
cd android
.\gradlew.bat --stop
.\gradlew.bat assembleRelease
#   -PreactNativeArchitectures=x86_64 را نزنید: APK فقط x86_64 برای گوشی ARM مناسب نیست.
#   ABIهای پیش‌فرض gradle.properties (شامل x86_64 برای AVD) را نگه دارید.

# 5) hash و نام‌های EXPO_PUBLIC_ داخل bundle (فقط نام، نه مقدار)
cd app\build\outputs\apk\release
Get-FileHash -Algorithm SHA256 .\app-release.apk
Copy-Item .\app-release.apk "$env:TEMP\a0-check.zip" -Force
Expand-Archive "$env:TEMP\a0-check.zip" -DestinationPath "$env:TEMP\a0-check" -Force
(Select-String -Path "$env:TEMP\a0-check\assets\index.android.bundle" -Pattern 'EXPO_PUBLIC_[A-Z0-9_]+' -AllMatches).Matches.Value | Sort-Object -Unique
Remove-Item "$env:TEMP\a0-check*" -Recurse -Force

# 6) نصب و نسخه (AVD یا گوشی مالک)
adb devices
adb install -r .\app-release.apk
adb shell dumpsys package com.mathlearning.app | Select-String 'versionName|versionCode'
#   انتظار: versionName=0.1.0 و versionCode=1 (android/app/build.gradle)

# 7) لاگ: قبل از اجرا پاک، بعد از اجرا ذخیره، و پیش از ارسال بررسی
adb logcat -c
#   ... مسیرها را طی کنید و اسکرین‌شات بگیرید ...
adb logcat -d > a0-logcat.txt
(Select-String -Path a0-logcat.txt -Pattern 'Bearer|token|otp|password|phone' -AllMatches | Measure-Object).Count
#   عدد بزرگ‌تر از صفر یعنی پیش از ارسال بازبینی و redact کنید؛ خطوط را در گفتگو نچسبانید (AGENTS §۳ بند ۱۲)
```

خروجی انتظاری فایل: `apps\mobile\android\app\build\outputs\apk\release\app-release.apk` (مسیر معمول Gradle؛ در محیط ایجنت ساخته نشده است).

- اگر `JAVA_HOME` یا SDK تنظیم نیست، Gradle خطا می‌دهد. این خطا `BLOCKED_ENV` است، نه شکست APK؛ عیناً در گزارش بنویسید.
- `android/` را commit نکنید. بعد از ممیزی، worktree را با `git worktree remove ..\shomara-a0-audit` حذف کنید.
- اگر crash در راه‌اندازی دیده شد، logcat را ذخیره کنید و متوقف شوید (L9). ارتقای RN/Expo در A0 ممنوع است.

## ۸. الگوهای grep (قابل بازتولید)

```text
load    loading|Loading|pending|Pending|ActivityIndicator|Skeleton|isBusy|busy|saving|Saving
err     error|Error|failed|Failed|reject|Reject
offline offline|Offline|NetInfo|network|Network
empty   empty|Empty
retry   retry|Retry|تلاش دوباره
resume  resume|Resume|restore|Restore
server  API_BASE_URL|apiClient|runtimeApi|authApi|prepareGrade|bootstrap|fetch\(|submit|content-delivery|learning-runtime|offline-sync
cfg     productionConfigError|CONTENT_CONFIG_ERROR|configError
child   ستاره|سکه|الماس|[Ss]treak|[Cc]oin|[Ll]eaderboard|[Ll]oot|[Ss]tars?\b|[Hh]eart|جان
hex     #[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b
magic   (fontSize|height|width|minHeight|minWidth|padding|margin|gap|borderRadius|borderWidth)\s*:\s*[0-9]
<48     (minHeight|height|minWidth|width)\s*:\s*([0-3]?[0-9]|4[0-7])([^0-9]|$)
```

برای importerها: `rg -n "ChallengeIntroView" apps scripts` (شامل parity و verifierها).

## ۹. انتظارهای حالت محلی (برای مقایسه با دستگاه)

این جدول مورد انتظار است، نه نتیجه. هر مورد بعد از مشاهدهٔ دستگاه PASS، FAIL یا NOT_OBSERVED می‌شود.

| # | مورد انتظار | شاهد کد | برچسب |
|---|---|---|---|
| E1 | بدون شمارهٔ تلفن و OTP؛ onboarding مستقیم به CHILD می‌رود | `onboarding.tsx:101`، `:109` | [پیش‌بینی] |
| E2 | هیچ صفحه‌ای ادعای اتصال، همگام‌سازی یا پیشرفت سروری نکند | `runtime.ts:6–9` | [پیش‌بینی] |
| E3 | شروع ایستگاه: پیام «آماده‌سازی محتوا کامل نشد…» و دکمهٔ غیرفعال | `start.tsx:30–31`، `:88–92`، `:107` | [پیش‌بینی] |
| E4 | جامپ واحد: متن فنی «اتصال سرویس یادگیری…» دیده می‌شود | `jump.tsx:34–36`، `runtime.ts:43` | [پیش‌بینی] |
| E5 | اگر `missions` با آدرس باز شود: «ماموریت‌ها فعلاً آماده نیستند. مسیرت همچنان ذخیره است.» | `missions.tsx:23` | [پیش‌بینی] |
| E6 | تم روشن، نه تیره | `app.json:7` (`userInterfaceStyle`) | [سند] |
| E7 | دو سوئیچ «حرکت» هم‌زمان یک تنظیم را تغییر می‌دهند | `settings.tsx:33`، `:51` | [کد] |
| E8 | گزینه‌ها و دکمه‌ها ≥ ۴۸dp؛ شمارش‌ها (۳۴dp) غیرلمسی و کوچک‌تر از هدف کار ۳.۵ | `StationFlow.tsx:881`، `:884`، `:936`، `:940` | [کد]؛ [دستگاه] |
| E9 | پایان ایستگاه (در صورت رسیدن) متن ستاره نشان می‌دهد؛ نقض قاعدهٔ ۸ | `characters.ts:99`، `StationFlow.tsx:751` | [کد]؛ [دستگاه] |
| E10 | اگر کرش راه‌اندازی رخ دهد: logcat ثبت و Hermes مظنون اول (ارتقا ممنوع) | `APK_PREVIEW.md` §4b | [سند] |
| E11 | حذف داده در والدین فقط محلی؛ پس از حذف به `/onboarding` | `parent.tsx:36`، `:44`، `:47` | [کد] |
| E12 | نام‌های `EXPO_PUBLIC_*` داخل bundle فقط `EXPO_PUBLIC_RELEASE_CHANNEL` باشد | `environmentVariableSerializerPlugin.js:17–25` | [کد نصب‌شده]؛ [پیش‌بینی] |

## ۱۰. قالب گزارش دستگاه

```text
تاریخ و ساعت:
commit (git rev-parse --short HEAD):
SHA-256 فایل APK:
مدل دستگاه / نسخهٔ Android / API / AVD یا گوشی:
نام‌های EXPO_PUBLIC_ داخل bundle (E12):
خروجی adb install:
versionName / versionCode (انتظار 0.1.0 / 1):
مسیر طی‌شده تا هر صفحه:
صفحه | اسکرین‌شات (نام فایل) | انتظار (E#) | مشاهده‌شده | حکم PASS/FAIL/NOT_OBSERVED
logcat: نام فایل | تعداد مطابقت بررسی داده‌های حساس | کرش (بله/خیر)
صفحه‌های مشاهده‌نشده و علت:
ابعاد و فونت (360/390/412dp، فونت بزرگ) و دستگاه هر کدام:
یادداشت مالک:
```

این سند ممیزی ایستا است؛ هیچ حکم رفتاری نهایی نیست تا شاهد دستگاه ثبت شود.
