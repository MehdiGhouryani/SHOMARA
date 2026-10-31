# A0 — ممیزی ایستا صفحه‌ها (مبنا `a25d257`)

| | |
|---|---|
| تاریخ | 2026-10-31 |
| مبنا | `origin/main` = `a25d257` (merge PR #2). درخت آن با `1182313` یکسان است. |
| شاخهٔ کار | `docs/phase-a0-audit-apk` (از `origin/main` ساخته شده؛ commit نشده) |
| نوع | ممیزی ایستا: بدون اجرای APK و بدون تغییر کد اپ |
| مجوز | فاز A0 در `START_HERE.md` §۱۱ |

## خلاصه

- ۱۵ فایل route داریم: ۱۳ صفحه و ۲ layout. بیشتر منطق در `src/` است؛ مثلاً `StationFlow.tsx` با ۹۵۴ خط زیر مسیر `play` است.
- در APK محلی (local-content)، مرحلهٔ AUTH/OTP رد می‌شود و شروع ایستگاه به وضعیت `error` می‌رود. بنابراین حالت‌های OTP و ایستگاه فقط با backend یا دستگاه قابل تأیید هستند.
- یک نقض شناخته‌شدهٔ قاعدهٔ ۸ وجود دارد: کپی «ستاره» در `characters.ts:99` و نمایش آن در `StationFlow.tsx:751`. اصلاح در فاز ۱ است.
- `missions` مصرف‌کننده دارد (ثبت route و API)، پس شرط صفر-مصرف L8 برقرار نیست.
- `views/ChallengeIntroView.tsx` هیچ importer ندارد؛ کاندید کد مرده است و هنوز حذف نشده.

## ۱. روش و حدود

- شمارش‌ها با `grep -cE` روی `apps/mobile/app` و فایل‌های تفویضی `apps/mobile/src` در یک worktree موقت از `a25d257` انجام شد. الگوها در بخش ۸ آمده‌اند تا قابل بازتولید باشند.
- هر عدد نشانهٔ حضور یک واژه است، نه تأیید رفتار. مثلاً `error` می‌تواند نام یک style باشد. حکم رفتاری فقط با اجرای APK و اسکرین‌شات معتبر ثبت می‌شود.
- ستون `<48` کاندید هدف لمسی است و بررسی دستی لازم دارد (بخش ۶، مورد ۵).
- ستون `child` واژه‌های کاندید قاعدهٔ ۸ است: ستاره، سکه، الماس، streak، coin، leaderboard، loot، قلب، جان. صفر یعنی واژه‌ای در همان فایل نیست؛ متن ستاره می‌تواند از فایل دیگری import شود (بخش ۶، مورد ۱).
- `hex` (رنگ hex مستقیم) در هیچ‌یک از ۱۵ فایل route صفر است.

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
| UI-002 | onboarding flow | `app/onboarding.tsx` (مراحل از جمله AUTH، OTP، CHILD، PLACEMENT) | بخشی | AUTH و OTP در حالت محلی رد می‌شوند (`onboarding.tsx:101`، `:109`) |
| UI-003 | phone & OTP | `onboarding.tsx` + `views2/PhoneView2`، `views2/CodeView2` + `auth/authApi.ts` | قابل تست نیست | حالت‌های ارسال، خطا و cooldown فقط با backend (I2) دیده می‌شوند |
| UI-004 | profile setup | `onboarding.tsx` (مرحلهٔ CHILD) + `views2/ProfileView2` | بخشی | |
| UI-005 | grade & placement | `onboarding.tsx` (مرحلهٔ PLACEMENT، حدود خط ۲۹۵) | بخشی | `prepareGradeContent` در حالت محلی اجرا نمی‌شود (`:196`) |
| UI-006 | child tab shell | `app/(tabs)/_layout.tsx` + `navigation/ChildTabBar` | قابل مشاهده | |
| UI-007 | learning path | `app/(tabs)/index.tsx` + `path/PathView2` + `path/pathModel` | بخشی | بنر حالت محلی در `index.tsx:132` |
| UI-008 | station start | `app/station/[stationId]/start.tsx` + `views2/StationStartV2` | خطا در حالت محلی | `start.tsx:30–31` بدون استثنای preview به `error` می‌رود |
| UI-009 تا UI-012 | teach، guided practice، assessment، result | `station/[stationId]/play.tsx` (۷ خط) → `StationFlow.tsx` (۹۵۴ خط) + `LessonPlayerChrome` + `views2/LessonViewsV2` | وابسته به UI-008 | چون start به `error` می‌رود، مسیر عادی به play نمی‌رسد؛ روی دستگاه تأیید شود |
| UI-013 | practice tab | `app/(tabs)/practice.tsx` → `ui/PracticeHubScreen` (۷۷ خط) | قابل مشاهده | |
| UI-014 | challenge | `StationFlow` → `ChallengeIntroView2` (`views2/LessonViewsV2.tsx:213`) و `SignatureChallengeView` (۲۸۸ خط) | وابسته به ایستگاه | `station/views/ChallengeIntroView` (۵۴ خط) importer ندارد (بخش ۶، مورد ۲) |
| UI-015 | profile & me | `app/(tabs)/profile.tsx` → `profile/views2/MeView2` | قابل مشاهده | |
| UI-016 | avatar workshop | `app/avatar.tsx` (۲۲۶ خط) + `components/ChildAvatar` | قابل مشاهده | ۱۴ نشانهٔ `error`: بررسی دستی |
| UI-017 | settings | `app/settings.tsx` (۹۱ خط) | قابل مشاهده | بدون ارجاع سرور؛ ردیف‌های لمسی ۷۸dp هستند (`settings.tsx:80`) |
| UI-018 | guardian surface | `app/parent.tsx` (۱۷۹ خط) | قابل مشاهده | بدون ارجاع سرور؛ حذف داده‌های والدین روی سرور هنوز باز است (`START_HERE.md` §۱۱، کار ۳.۱۱) |
| UI-019 | system states | پراکنده در فایل‌های بالا | — | در A0 جدا ممیزی نشد |
| UI-020 | full child journey | — | — | نیازمند backend و دستگاه (I2، I4) |
| بدون ردیف | `app/missions.tsx` (۶۰ خط) | ثبت در `_layout.tsx:60`؛ API در `runtimeApi.ts:406–407` | — | ارجاع UI پیدا نشد، ولی مصرف‌کننده وجود دارد؛ شرط صفر-مصرف L8 برقرار نیست |
| بدون ردیف | `app/unit/[unitId].tsx` و `app/unit/[unitId]/jump.tsx` | نزدیک‌ترین ردیف UI-007 | — | تأیید با مالک |

## ۵. رفتار حالت local-content (شواهد کد)

- `src/config/runtime.ts:28–29`: `isLocalContentPreview()` یعنی کانال `preview` + release + نبودن `EXPO_PUBLIC_API_BASE_URL`.
- `runtime.ts:41–44`: در release بدون API، `productionConfigError()` این متن را برمی‌گرداند: «اتصال سرویس یادگیری برای این نسخه تنظیم نشده است.» این متن فنی است و برای کودک مناسب نیست (بخش ۶، مورد ۳).
- استثنا شده و در حالت محلی عبور می‌کند: `(tabs)/index.tsx:61` و `:132`، `onboarding.tsx:101`، `:109`، `:196`، `StationFlow.tsx:446`.
- استثنا نشده: `station/[stationId]/start.tsx:30–31` (به `error`)، `unit/[unitId]/jump.tsx:34–36` (متن پیکربندی را در `setError` می‌گذارد)، و `src/content/bootstrap.ts:36–37` (پرتاب `CONTENT_CONFIG_ERROR`). مسیر خطای فراخواننده‌ها در A0 کامل بررسی نشد.
- `app/missions.tsx:17` و `:23`: خطای بارگذاری این متن را نشان می‌دهد: «ماموریت‌ها فعلاً آماده نیستند. مسیرت همچنان ذخیره است.» در حالت محلی سروری وجود ندارد، پس «ذخیره است» ممکن است چیزی را ادعا کند که رخ نداده است. کامنت ابتدایی `runtime.ts` همین را ممنوع کرده است. روی دستگاه بررسی شود.

## ۶. یافته‌ها برای بازبینی (در A0 اصلاح نشده‌اند)

1. **کپی ستاره (کار ۱.۷ و قاعدهٔ ۸):** `src/characters/characters.ts:99` متن «جشن بگیریم! ستاره‌ی جدید مال توست!» دارد و `src/station/StationFlow.tsx:751` همان را نمایش می‌دهد. این با قاعدهٔ ۸ ناسازگار است. اصلاح در فاز ۱ است، نه A0. (`characters.ts:38` متن شخصیت است و پاداش نیست.)
2. **`station/views/ChallengeIntroView.tsx`:** هیچ importer در `app` و `src` ندارد، از جمله تست‌ها. کاندید کد مرده است؛ قبل از حذف، طبق AGENTS §۴ مصرف‌کننده‌ها و تست‌ها با `rg` بررسی شوند.
3. **متن پیکربندی برای کودک:** `runtime.ts:43` و `jump.tsx` متن فنی را به کودک نشان می‌دهند. نسخهٔ کودک باید بازنویسی شود.
4. **`missions`:** L8 شرط صفر-مصرف را برآورده نمی‌کند، چون route ثبت شده و API موجود است. تصمیم حذف یا نگه‌داری با مالک است. کپی پاداش (`rewardPreviewFa` و `pendingReveals`) هم باید با قاعدهٔ ۸ سنجیده شود.
5. **هدف لمسی کمتر از ۴۸dp:** نتیجهٔ بررسی کاندیدها:
   - `settings.tsx:86`: کلید سوئیچ ۳۰dp است، ولی هدف لمسی `Pressable` کل ردیف ۷۸dp است (`:63`، `:80`). غلط مثبت.
   - `parent.tsx:158`: `focusMark` مارک تزئینی `View` است (`:72`). غلط مثبت.
   - `jump.tsx:139` و `missions.tsx:57`: نوار پیشرفت. غلط مثبت.
   - `PathView2.tsx:269` و `:294`، `LessonPlayerChrome.tsx:89` و `:98`: بنر، برچسب و آیکون بازخورد؛ به‌احتمال زیاد لمسی نیستند، اما بررسی دستی لازم است.
   - `StationFlow.tsx:936` و `:940` (`patternDot` و `countObject`، ۳۴×۳۴): اگر لمسی باشند، زیر ۴۸dp هستند و برای اشیای کودک باید ۷۲–۸۰dp باشند (AGENTS §۶، کار ۳.۵). روی دستگاه بررسی شوند.
   - `onboarding.tsx:391` (`resultBadge` با minHeight 40): بررسی دستی.
6. **مقادیر جادویی:** بیشترین شمارش در `parent.tsx` (۳۵)، `StationFlow.tsx` (۳۳)، `jump.tsx` (۲۶) و `PathView2.tsx` (۱۴) است. این‌ها عددهای مستقیم استایل‌اند و با AGENTS §۳.۱۰ و کار ۳.۷ مغایرند.
7. **dev identity در release:** `runtimeApi.ts:7–8` شناسهٔ `dev-child-001` را فقط وقتی `__DEV__` است استفاده می‌کند، پس در release کلاینت آن را نمی‌فرستد. ریسک سمت کلاینت کم است؛ guard سرور (کار ۱.۶) همچنان باز است.
8. **هشدارهای prebuild:** Expo نسخهٔ `react-native@0.86.3` را به‌جای `0.86.0` پیشنهاد کرد، و `expo-system-ui` نصب نیست در حالی که `userInterfaceStyle` در `app.json` است. در A0 تغییر داده نمی‌شوند (L9).
9. **`.gitignore`:** `apps/mobile/android/` و `apps/mobile/ios/` پوشانده نمی‌شدند. در این شاخه اضافه شده‌اند.
10. **`parent.tsx` local-only:** صفحهٔ والدین ارجاع سرور ندارد؛ حذف داده‌ها فقط محلی است (کار ۳.۱۱).

## ۷. دستور ساخت و نصب (مالک)

```powershell
# ریشهٔ مخزن محلی شما؛ main یا شاخهٔ فعلی دست‌نخورده می‌ماند
git fetch origin
git worktree add --detach ..\shomara-audit-a25d257 origin/main
cd ..\shomara-audit-a25d257
npm ci
npm run build:packages

# هیچ API URL نباید تنظیم شده باشد
Remove-Item Env:EXPO_PUBLIC_API_BASE_URL -ErrorAction SilentlyContinue
# و در apps\mobile\.env* هیچ EXPO_PUBLIC_API_BASE_URL نباشد

# حالت preview محلی (همان متغیرهای eas.json)
$env:EXPO_PUBLIC_RELEASE_CHANNEL = "preview"
$env:MOBILE_RELEASE_CHANNEL = "preview"

cd apps\mobile
npx expo prebuild --platform android --clean --no-install
cd android
.\gradlew.bat --stop
.\gradlew.bat assembleRelease
```

خروجی: `apps\mobile\android\app\build\outputs\apk\release\app-release.apk`

```powershell
adb install -r app-release.apk
adb logcat -c
# مسیرها را در دستگاه باز کنید و اسکرین‌شات بگیرید
adb logcat -d | Out-File -Encoding utf8 a0-logcat.txt
```

- `JAVA_HOME` را روی JDK داخلی Android Studio (`jbr`) بگذارید.
- `ANDROID_HOME` یا `local.properties` باید به SDK اشاره کند.
- اگر crash در راه‌اندازی دیده شد، logcat را ذخیره کنید و در همان‌جا بایستید (L9).
- `android/` را commit نکنید؛ پس از ممیزی می‌توانید آن را پاک کنید.
- ایجنت این دستورها را اجرا نمی‌کند و به credential دسترسی ندارد.

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

برای importerها: `rg -n "ChallengeIntroView|views/ChallengeIntroView" apps/mobile/app apps/mobile/src`.
