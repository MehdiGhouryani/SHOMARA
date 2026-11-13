# Production Readiness Report — SHOMARA Android (P15)

- **تاریخ:** 2026-11-14 · **Commit:** HEAD of `infra/p14-lesson-experiences` · **نتیجه:** **BLOCKED**
- **عنوان Production-ready ممنوع است:** هنوز یک یا چند P0/P1 باز است — طبق مأموریت صریح مالک.

## 1. معیارهای Release — وضعیت دقیق

| معیار | وضعیت | شواهد |
|---|---|---|
| targetSdk = 36 (الزام Play از 2026-08-31) | ✓ 36 | `app/build.gradle.kts:13` |
| compileSdk = 37 + platforms;android-37.0 pinned | ✓ | `PINNED_SDK_PACKAGE` در workflow + package.xml pin |
| Zero permissions | ✓ صفر uses-permission | foundation verifier |
| allowBackup=false + dataExtractionRules | ✓ هر دو | manifest + foundation verifier |
| Debug content در Release | ✓ صفر — compile-time src/debug separation | compileReleaseKotlin PASS |
| R8/minify در release | ✓ isMinifyEnabled=true | `app/build.gradle.kts:22` |
| Room migrations v1→v2→v3 | ✓ هر دو تست شده | Robolectric real SQLite |
| Offline journey | ✓ بدون INTERNET permission | R8 network-free rule |
| No-PII logging | ✓ SafeAppLogger + SafeDiagnostics | P10 tests |
| Debug-only wiring در Release | ✓ compile-time src/debug | R10 static rule |
| **Signed AAB** | **BLOCKED** — HG-05 نه داده شده، keystore نه ساخته | — |
| **Approved content** | **BLOCKED** — ST07 فقط VALIDATED؛ ۲۴ ایستگاه NOT_AUTHORED | — |
| **O1 evaluator** | **BLOCKED** — T13/T01 ارزیاب ندارند | — |
| **O2 schema نهایی** | **BLOCKED** — manifest PROPOSED فقط | — |
| **O5 multi-profile** | **BLOCKED** — single slot فقط | — |
| **O6 backend** | **BLOCKED** — Decision Pack آماده؛ انتخاب نشده | — |
| **UI wiring کامل** | **BLOCKED** — فقط guided stage به engine وصل است؛ discover/game/result renderers مستقل‌اند | — |
| **TalkBack real gesture** | **BLOCKED** — static semantics فقط؛ device TalkBack walkthrough pending | — |
| **Physical device benchmarks** | **BLOCKED** — emulator timing فقط (mission rule: emulator ≠ production claim) | — |

## 2. آنچه اندازه‌گیری شد (emulator-5554، Pixel_6a AVD، debug build — نه production claim)

| معیار | مقدار | روش |
|---|---|---|
| Cold start (force-stop→start) | 2741 ms TotalTime | `adb shell am start -W` |
| Warm start (force-stop→start بدون cold) | 2574 ms | همان |
| Memory PSS | 91,337 KB | `dumpsys meminfo` |
| Debug APK size | 17,755,264 bytes (~16.9 MB) | `ls` |
| Release compile | PASS (R8/minify فعال) | `compileReleaseKotlin` |

**این اعداد فقط emulator-only evidence هستند و جای physical device measurement را نمی‌گیرند.** Baseline Profile/Macrobenchmark روی دستگاه فیزیکی در فاز Release واقعی (پس از HG-05) اجرا می‌شود.

## 3. P0/P1 فهرست — چرا BLOCKED

| # | شدت | شرط بسته‌شدن |
|---|---|---|
| P0-1 | **O1 نهایی نشده** — T13/T01 ارزیاب ندارند؛ T15 فقط debug | مالک O1 را انتخاب کند |
| P0-2 | **محتوا APPROVED نشده** — ST07 در VALIDATED؛ ۲۴ ایستگاه NOT_AUTHORED | تألیف + ۴ review انسانی |
| P0-3 | **Signed package نه** — HG-05 نه داده شده؛ keystore نه ساخته | مالک HG-05 بدهد |
| P1-1 | **O2/O7 نهایی نشده** — schema/budget PROPOSED فقط | مالک |
| P1-2 | **O5 نشده** — single slot فقط؛ multi-profile سکما ممنوع | مالک |
| P1-3 | **O6 نشده** — Decision Pack آماده؛ انتخاب نشده | مالک |
| P1-4 | **UI wiring ناقص** — فقط guided stage به engine وصل است؛ discover/game/result مستقل‌اند | بعد از O1/O2 |
| P1-5 | **TalkBack real walkthrough** — static فقط | دستگاه فیزیکی + TalkBack فعال |
| P1-6 | **Physical device benchmarks** — emulator فقط | دستگاه فیزیکی |
| P1-7 | **assetهای واقعی** — ۵۳ صوت + ۳۶ تصویر ST07 تحویل نشده | تولید media |
| P2-1 | Home visual | handoff نهایی از چت جداگانه |
| P2-2 | CI screenshot gate | Paparazzi/Robolectric screenshot در CI |
| P3-1 | Paparazzi baseline profile | بعد از HG-05 |

## 4. آنچه این فاز اثبات کرد (مثبت)

- compileReleaseKotlin PASS — R8/minify واقعاً compile می‌شود؛ کد release-ready از نظر ساختاری است.
- ui-tooling-preview به implementation اضافه شد — @Preview annotations حالا در release هم compile می‌شوند (compile-time only، صفر runtime overhead).
- Debug isolation compile-time اثبات شد — src/debug types در release compile وجود ندارند.
- zero permissions + allowBackup=false + dataExtractionRules — manifest privacy contract کامل.
- ۹۴/۹۴ static gates سبز — شامل security/privacy/pipeline/accessibility guards.
- Room v1→v2→v3 migrations تست‌شده روی SQLite واقعی.

## 5. برای رسیدن به PASS

1. مالک O1/O2/O5/O6/O7/HG-05 را تصمیم بگیرد (از Register).
2. تیم محتوا ۲۴ ایستگاه را تألیف و ۴ review انسانی بگیرد.
3. تیم هنری ۳۶ تصویر + ۵۳ صوت واقعی تحویل دهد.
4. signing keystore خارج از repo ساخته شود؛ signed AAB تولید شود.
5. Physical device benchmark + TalkBack walkthrough + 200% font + child QA اجرا شود.
6. Data Safety/Families declarations مطابق ADR-0047 §4 پر شود.
7. CI signed build gate فعال شود.

## 6. Security Closure (static review)

- **Zero permissions** — offline by construction، no attack surface از network.
- **allowBackup=false** + dataExtractionRules — صفر child data در cloud/transfer.
- **Debug isolation compile-time** — src/debug variant: release binary فاقد debug code (build system guarantees).
- **R8/minify** — release code obfuscated (proguard rules موجود).
- **No PII logging** — SafeAppLogger key-guard + SafeDiagnostics value-scan، تست‌شده.
- **PBKDF2 PIN** — 210k iterations، salt، constant-time verify، persisted lockout.
- **Content package** — signed (ECDSA P-256) + SHA-256 per-file + traversal-proof + size caps.
- **CONTENT-008** — ForbiddenFieldGuard + projectionViolations + no-PII bridge.

## 7. Accessibility Status (static audit)

- TalkBack semantics: `contentDescription` در همهٔ interactive elements؛ `mergeDescendants` در path node؛ `Role.Button` در tiles؛ `LiveRegion` در feedback banners.
- Touch targets: `ComponentTouchMin=48dp`؛ manipulatives 72–80dp.
- Font scaling: token-driven typography؛ 200% font test pending device evidence.
- Contrast: ColorInk on ColorSurface (teal-on-cream)؛ ColorInk on ColorAmberSoft؛ WCAG contrast ratios recorded.
- RTL: RTL is the root direction؛ math/OTP LTR exceptions.
- Reduced motion: `LocalShomaraReducedMotion` → snap/0-duration؛ tested.

**TalkBack real gesture walkthrough: BLOCKED** — needs physical device with TalkBack enabled.
