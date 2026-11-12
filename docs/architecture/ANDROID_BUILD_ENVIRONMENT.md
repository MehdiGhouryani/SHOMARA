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

- JDK 17: موجود.
- Android SDK root/platform 37: موجود نیست.
- Gradle wrapper distribution cache: فایل‌های `.part` صفر بایتی؛ شبکه به `services.gradle.org` نمی‌رسد.
- نتیجه: `BLOCKED_ENV`؛ build harness و مسیر APK آماده‌اند، اما فایل APK ساخته نشده و N03 شروع نمی‌شود.

منابع رسمی: [Android command-line SDK manager](https://developer.android.com/tools/sdkmanager) و [GitHub runner images](https://github.com/actions/runner-images).
