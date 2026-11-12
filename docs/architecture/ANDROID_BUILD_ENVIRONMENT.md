# Android build environment contract

این سند runbook قابل‌تکرار `N02-07` است. static source checks جای compile/lint/unit واقعی را نمی‌گیرند.

## حداقل محیط

| جزء | مقدار الزام‌شده | روش تشخیص |
|---|---:|---|
| JDK | 17 | `java -version` |
| Android SDK root | `ANDROID_SDK_ROOT` یا `ANDROID_HOME` | مسیر موجود |
| Compile platform | `platforms;android-37.0` (نام پکیج upstream) | `platforms/android-37/android.jar` یا `platforms/android-37.<minor>/android.jar` با signature معتبر ZIP/JAR |
| Gradle | wrapper 9.6.0 با checksum پین‌شده | فقط `apps/android/gradlew` |
| Repository access | Google Maven، Maven Central و Gradle distribution | resolve واقعی dependency |

> **P1 (2026-11-12):** اندیس رسمی SDK گوگل دیگر پکیج `platforms;android-37` را منتشر نمی‌کند — پکیج‌های API 37 به‌صورت `android-37.0`/`37.1`/`37.2` هستند؛ همین ناهماهنگی نام، gate کاتلین در CI را unreachable کرده بود (ثبت شکاف G-01). قرارداد preflight هر دو چیدمان `android-37` و `android-37.<minor>` را می‌پذیرد و همیشه یک `android.jar` معتبر (ZIP/JAR) لازم دارد؛ `compileSdk = 37` عددی با AGP 9.4 مجاز است.

تمام buildهای Native از root و از harness واحد اجرا می‌شوند:

```bash
npm run android:doctor
```

خروجی فقط یکی از `READY` یا `BLOCKED_ENV` است. برای ثبت گزارش تشخیصی بدون تبدیل blocker به موفقیت:

```bash
npm run android:doctor -- --allow-blocked
```

گزارش ماشینی در `build-reports/android/doctor.json` تولید و به‌عنوان generated output از Git خارج می‌شود.

`JAVA_HOME` در صورت تنظیم، هم برای بررسی Java و هم برای wrapper استفاده می‌شود. مسیر SDK صریح در environment اولویت دارد؛ در discovery خودکار، نصب دارای platform 37 بر پوشهٔ ناقص اولویت می‌گیرد. harness مسیر SDK تأییدشده را به Gradle منتقل می‌کند. گزارش هر اجرا از `RUNNING` شروع می‌شود تا crash نتواند PASS قدیمی را معتبر جلوه دهد؛ خطای preflight نیز گزارش `FAILED` می‌سازد. تست رفتار این مرزها: `npm run test:android-build`.

## نصب compile platform در CI

workflow مستقیماً `sdkmanager` رسمی را روی stable channel فرمان می‌دهد و package دقیق `platforms;android-37.0` را نصب می‌کند (P1 2026-11-12؛ نام قدیمی `platforms;android-37` در اندیس upstream وجود ندارد). NDK و emulator در این gate نصب نمی‌شوند؛ signing هرگز؛ و تنها upload مجاز، گزارش‌های diagnostic (lint/unit/gate.json) است — هیچ APK/AAB یا خروجی امضاشده منتشر نمی‌شود (assertion در `verify-android-foundation.mjs`).

## پین پلتفرم — Package ID دقیق و یکسان در همهٔ محیط‌ها

- **پین ثابت (تاریخ مبنا 2026-11-13):** `platforms;android-37.0` — revision `2`، نام نمایشی «Android SDK Platform 37.0».
- **اثبات زنده:** `sdkmanager --list --channel=0` با cmdline-tools `22.0` اجرا شد (exit 0): خروجی شامل `platforms;android-36 | 2` و `platforms;android-37.0 | 2` است و **هیچ `platforms;android-37` یا 37.1/37.2 در stable channel فهرست نشده**. پیش‌تر fetch مستقیم `repository2-3.xml` هم همین را نشان می‌داد (37.0/37.1/37.2 beta).
- **هویت، نه نام پوشه:** preflight پکیج را از `package.xml` داخل پوشهٔ platform تأیید می‌کند (`path="platforms;android-37.0"`) — چیدمان legacy «inconsistent location» (پکیج 37.0 در پوشهٔ `android-37`، همان حالت موجود روی ماشین مالک با Warning صریح sdkmanager) نیز فقط وقتی می‌پذیرده که package.xml همان پین را declare کند. پوشه‌ای بدون package.xml یا با پکیج دیگر (مثلاً 37.1 یا android-36) هرگز READY نمی‌شود.
- **compileSdk:** عدد صحیح `37` می‌ماند (AGP 9.4 حداکثر API 37)؛ نسخهٔ minor نصب‌شده مستقل از compileSdk است و در یک ثابت (`PINNED_PLATFORM_PACKAGE`) و یک env واریبل workflow پین شده است.
- **مسیر ارتقا (فقط stable):** ارتقای minor (مثلاً به 37.1 در آینده) = تغییر عمدی در **یک commit** شامل: ثابت `PINNED_PLATFORM_PACKAGE` در `scripts/verify-android-environment.mjs`، گام install و env در `android-native.yml`، assertionهای `verify-android-foundation.mjs`، این سند و تست‌های `tools/tests/android-build.test.mjs` — همراه با یک اجرای سبز CI. **Preview/Canary/beta ممنوع**؛ ریسک آن (ناپایداری ABI/API بین betaها و drift اندیس) فقط برای مستندسازی ثبت شده و پذیرفته نمی‌شود.
- **cache:** پکیج platform در CI کش می‌شود (key شامل OS و شناسهٔ پکیج)؛ گام install همیشه اجرا می‌شود و در برابر اندیس زنده، نسخهٔ stale را ارتقا می‌دهد — invalidation بدون دستکار دستی.

## سیاست target API (جدا از compileSdk)

| فیلد | مقدار | استدلال |
|---|---|---|
| compileSdk | 37 (عدد) | پلتفرم پین‌شدهٔ کامپایل — فقط toolchain، رفتار runtime را عوض نمی‌کند |
| targetSdk | **36** | الزام رسمی Google Play: از **2026-08-31** اپ‌های جدید و آپدیت‌ها باید target API **36** (Android 16) یا بالاتر داشته باشند؛ targetSdk=36 دقیقاً برابر حداقل است. bump آیندهٔ targetSdk تغییر رفتار runtime است و فقط با ADR/تست رفتاری جدا انجام می‌شود، هرگز هم‌زمان با کار زیرساخت. |
| minSdk | 24 | ADR-0036 — دست‌نخورده |

منبع الزام (استخراج 2026-11-13): [Google Play Help — Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878) و [Android Developers — Target SDK](https://developer.android.com/google/play/requirements/target-sdk).

## gate بستن N02

```bash
npm run android:gate
```

این فرمان پس از preflight، wrapper پین‌شده را با `test lint :app:compileDebugKotlin --stacktrace --no-daemon` اجرا و گزارش `build-reports/android/gate.json` را می‌سازد. بستن N02 نیازمند status برابر `PASS` و exit code صفر است. instrumentation/device evidence در فازهایی که emulator/device صریح دارند ثبت می‌شود و نبود آن نباید به‌اشتباه به‌عنوان compile موفق گزارش شود.

## ساخت debug APK

فقط هنگامی که مالک یا task فعال debug APK خواسته باشد:

```bash
npm run android:assemble:debug
```

این مسیر همان test/lint/compile را اجرا می‌کند و سپس `:app:assembleDebug` را می‌افزاید. موفقیت فقط وقتی ثبت می‌شود که `app-debug.apk` غیرخالی باشد؛ مسیر، اندازه و SHA-256 در `build-reports/android/assemble-debug.json` نوشته می‌شود. این APK unsigned-for-release است و معادل store/release/device approval نیست.

| فرمان | هدف | خروجی معتبر |
|---|---|---|
| `npm run android:doctor` | JDK/SDK readiness | `READY`؛ compile هنوز اثبات نشده |
| `npm run android:gate` | unit + lint + compile | `PASS` |
| `npm run android:assemble:debug` | gate + debug APK | `PASS` + مسیر و SHA-256 |

## وضعیت runner فعلی

> یادداشت N02-07 (runner ممیزی 2026-10-28، `BLOCKED_ENV` برای platform 37) **منقضی است**: از 2026-10-31 روی ماشین مالک gate واقعی PASS شده و وضعیت روز با جدول هم‌راستایی زیر و خروجی `npm run android:doctor` معتبر است — این بخش فقط به‌عنوان سابقهٔ تاریخی نگه داشته می‌شود.

## هم‌راستایی نسخه‌ها — CI در برابر Local (P1، 2026-11-13)

| مؤلفه | CI (`android-native.yml`) | Local ماشین مالک | وضعیت |
|---|---|---|---|
| Node | **22.22.0** دقیق (`.nvmrc` از طریق setup-node) | **v24.22.1** — خارج از پین؛ با بنر `NODE_VERSION_MISMATCH` در `verify:repository` بلند اعلام می‌شود، هرگز پنهان نیست | ✗ انحراف ثبت‌شده — رفع با مالک: `nvm use 22.22.0` یا نصب Node 22.22.0 |
| JDK | temurin **17** (pinned) | Temurin 17.0.20.1+1 | ✓ |
| Gradle | wrapper **9.6.0** با SHA-256 پین‌شده | همان wrapper | ✓ |
| cmdline-tools | runner image | **22.0** (`cmdline-tools/latest`) | ✓ |
| Platform package | `platforms;android-37.0` (install در workflow) | همان پکیج — تأیید با package.xml هر دو پوشه (`android-37` legacy + `android-37.0`) | ✓ |
| targetSdk | 36 | 36 | ✓ (الزام Play 2026-08-31: ≥36) |
| AGP / Kotlin / Compose BOM | 9.4.0 / 2.4.10 / 2026.08.00 (version catalog پین‌شده) | همان catalog | ✓ |

Cacheهای CI (keyهای صریح): npm → از `package-lock.json` (setup-node)؛ Gradle → `OS + JDK + hash(wrapper.properties, libs.versions.toml, gradle.properties)` با restore-key؛ SDK platform → `OS + platforms-android-37.0`. گزارش‌ها و test-resultهای XML در failure به‌عنوان artifact (۷ روز) نگه‌داری می‌شوند.

منابع رسمی: [Android command-line SDK manager](https://developer.android.com/tools/sdkmanager) و [GitHub runner images](https://github.com/actions/runner-images).
