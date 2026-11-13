# گزارش ST07 Vertical Slice — اثبات زنجیرهٔ کامل (P8)

- **تاریخ:** 2026-11-13 · **شاخه:** `infra/p7-content-pipeline` · **وضعیت:** **PILOT/DRAFT** (نه Production-ready — O1/O2/O7 و Human Review هنوز بازند؛ طبق مأموریت عنوان Production-ready فقط با Content Approval واقعی مجاز است)
- **زنجیرهٔ اثبات‌شده:** draft package (ساخت+امضای روی دستگاه با کلید ephemeral debug) → ContentPackageActivator (stage/verify/pointer اتمیک) → ContentPackageLoader → Child projection → LocalLessonEngine (P1..P5) → interaction states → Debug evaluator (O1 option-1، فقط debug) → Room v3 attempts → checkpoint suspend/resume

## 1. Flow diagram (واقعیِ اجراشده)

```text
[debug assets: content/stations/ST07.json + audio/ST07-audio-index.json]
   ↓ buildDraftPackage (sizes+sha256 on-device; EC ephemeral sign)
manifest.json + manifest.sig  ← debug-ephemeral trust (release: trust خالی = reject)
   ↓ Activator.stage(candidate)  → re-verify staged bytes
   ↓ Activator.activate          → atomic pointer rename + Room registry ACTIVE
   ↓ Loader.loadFromDirectory(pointer/staging dir)  → VerifiedPackage
   ↓ projection (8 guided items: 4×T15 + 2×T13 + 2×T01; discover 2 steps; T05 game)
   ↓ LocalLessonEngine P1→P2 walk (manual advance)
interaction: T15 = tap choice → DebugSt07Evaluator (pilot answers، فقط همین لایه)
             T13/T01 = AWAIT_POLICY (honest gap — O1)  ·  T05 = ShomaraPatternRule.accepts (deterministic)
   ↓ RoomLessonRecordRepository.recordAttempt (one tx/session+attempt، unique attemptKey)
   ↓ 11 attempts: 8 first-try (child-like: first option) + 3 retry-after-feedback
   ← resume: SessionCheckpointManager + FileCheckpointStore (version-gated)
   ← audio missing → Persian text fallback (audio index)  ·  asset missing → Absent (no fake image)
```

## 2. سناریوها و نتیجه

| سناریو | نتیجه | شواهد |
|---|---|---|
| Robolectric: full chain (11 attempts، 4 correct-اول+3 retry، 4 honest gap) | PASS | `St07VerticalSliceTest.the full chain…` |
| correct/wrong/retry | PASS — تلاش اول گزینهٔ اول (کودک‌وار)؛ INCORRECT → retry با پاسخ درست (بازخورد فوری §6) | همان تست (attempts=11) |
| duplicate submission | PASS — no-op، ارزیابی تکراری ندارد | `LocalLessonEngineTest` |
| **force-stop و resume** | PASS — close→reopen کامل DB؛ ۱۱ attempt و session record سالم | `slice-resume.db` reopen test |
| corrupted package | PASS — loader fail-closed، state قبلی جعل نمی‌شود | corrupt test |
| unsupported content version (schemaVersion=9) | PASS — validation reject | version test |
| release fail-closed | PASS — trust set خالی production، draft package را reject می‌کند حتی اگر leak شود؛ pointer ساخته نمی‌شود | release test |
| migration discipline | PASS — v1→v2→v3 (تست‌های ADR-0042/44)؛ DB باز‌شده با هر دو migration اعتبارسنجی شد | migration tests |
| **airplane mode cold start** | PASS روی دستگاه — force-stop + airplane ON + cold start → MainActivity focus، بدون هیچ مسیر شبکه (R8 + بدون INTERNET permission) | `artifacts/p8-device/03-airplane-cold-start.png` |
| missing optional audio | PASS — متن فارسی fallback از audio index؛ هیچ پخش جعل نشد | slice step audio-fallback |
| asset missing | PASS — resolver → Absent صادقانه؛ تصویر نامرتبط نشان داده نمی‌شود | resolver tests |

## 3. Device evidence (emulator-5554، Pixel_6a AVD موجود — بدون نصب/ساخت emulator جدید)

- APK debug ساخته/نصب/اجرا شد: SHA-256 `7b88b37e…`، `artifacts/p8-device/01-launch.png`
- deep link `mathlearning://lesson/ST07` → صفحهٔ درس: `02-lesson-ST07.png`
- airplane ON → force-stop → cold start → اجرای سالم: `03-airplane-cold-start.png`
- **زنجیرهٔ slice واقعاً روی دستگاه اجرا شد** (connectedDebugAndroidTest `St07VerticalSliceDeviceTest` — BUILD SUCCESSFUL): 11 attempts/4 correct/4 gap روی SQLite واقعی دستگاه. بعد از تست AGP اپ را uninstall می‌کند (رفتار استاندارد) — از این رو run-as بعدها «unknown package» است؛ اثبات پایداری داخل خود تست (خواندن Room پس از reopen) انجام شد.

## 4. تأیید Templateها — «صرفاً از روی نام» ممنوع

| Template | بررسی قرارداد/ارزیاب | نتیجه در slice |
|---|---|---|
| T15 (numeral/picture choice) | گزینه‌ها + `correctOptionId` از pilot (i01.opt1/i02.opt2/i05.opt2/i06.opt2)؛ ارزیابی در لایهٔ debug evaluator | فعال — ۴ آیتم، correct/wrong/retry |
| T05 (pattern game) | `ShomaraPatternRule.accepts` — **قاعدهٔ قطعی موجود** (بدون O1 secret) | فعال — round r01 accepted=true |
| T13 (trace stroke) | ارزیابی stroke **وجود ندارد** (gap ثبت‌شده N08R-09؛ نیازمند proof per-template در O1) | AWAIT_POLICY صادقانه |
| T01 (tray placement) | ارزیابی placement **وجود ندارد** (همان gap) | AWAIT_POLICY صادقانه |

## 5. Blockerهای انسانی/تصمیمی (مسیر Production-ready)

1. **O1** — مدل answer-key/ارزیاب: T13 stroke و T01 tray اصلاً ارزیاب ندارند؛ T15 فعلاً فقط debug-layer.
2. **O2/O7** — schema نهایی پکیج و بودجهٔ حجم؛ تا آن‌زمان manifest PROPOSED است.
3. **CONTENT-009/010** — صفر تصویر/باینری صوت؛ asset-manifest فقط «not delivered» اعلام می‌کند.
4. **CONTENT-014/011** — mastery/unlock policy و calibration values تأیید نشده (PolicyGate refuse).
5. **Human Review** — فایل evidence ۴ نقش وجود ندارد → HUMAN_REVIEWED/APPROVED/ENABLED مسدود.
6. **UI wiring کامل** — P1/P2 preview فعلی هنوز از LessonContentWiring hardcoded می‌خواند؛ اتصال UI به package-driven slice = کار باقیمانده (این فاز زنجیرهٔ زیرساخت را اثبات کرد؛ جایگزینی منبع preview کار فاز بصری/فنی بعدی است).
7. **Release** — assets release خالی و trust خالی: release صادقانه fail-closed است تا اولین Approved package امضاشده.

## 6. شواهد اجرا (exit code)

`android:gate` PASS · `connectedDebugAndroidTest` PASS (BUILD SUCCESSFUL) · `verify:static:all` 93/93 · `verify-android-module-graph` PASS (222 فایل) · `verify:repository` PASS (552/1891) · APK debug SHA-256 `7b88b37e…` (17,275,031 bytes).
