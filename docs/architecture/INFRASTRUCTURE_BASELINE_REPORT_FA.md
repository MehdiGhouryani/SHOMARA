# گزارش baseline فنی SHOMARA — ارزیابی اجرایی ممیزی زیرساخت (Phase 0)

- **تاریخ اجرا:** 2026-11-12 · **HEAD:** `aa2805c` (`merge: native UI/UX chain — page-02..page-17 audit ledgers + N08R Duolingo-level refinement`)
- **شاخهٔ ممیزی:** `audit/infrastructure-phase0` (ایجادشده از `main` تمیز) · **حجم مخزن فعال:** ~۱.۴k فایل (بدون .git/node_modules)
- **حاکمیت:** `harness: validate` = HARNESS_VALID (118 tasks, 12 phases)؛ وضعیت فعلی harness = N08R/N08R-10؛ مأموریت این نشست بر مبنای دستور مستقیم مالک (ممیزی زیرساخت) اجرا شد و N08R-02/10 را جلو نمی‌زند.

## 1. محیط و نسخه‌ها

| مؤلفه | مقدار |
|---|---|
| OS | Windows 10.0.22631 (win32) · Git Bash |
| Node محلی | v24.22.1 — **خارج از پین engines `<23`** (هشدار؛ CI پین `.nvmrc` = 22.22.0 را می‌گیرد) |
| JDK | 17 (Temurin 17.0.20.1+1) |
| Android SDK | `D:\SDK` — پکیج `android-37.0` در پوشه‌ای به نام `android-37` (هشدار sdkmanager: inconsistent location؛ ریشهٔ تفاوت محلی/CI در G-01) |
| Gradle | wrapper 9.6.0 با SHA-256 پین‌شده · AGP 9.4.0 · Kotlin 2.4.10 |
| UI | Jetpack Compose BOM 2026.08.00 · ۱۶ ماژول Gradle در `apps/android` · 175 فایل Kotlin (~23,870 خط) |
| TypeScript | 9 workspace · 73 فایل vitest / 564 تست · 90 verifier static |

## 2. فرمان‌های baseline — exit code دقیق (اجرای 2026-11-12)

| فرمان | exit | نتیجه |
|---|---:|---|
| `node tools/harness.mjs validate` | 0 | HARNESS_VALID (118 tasks, 12 phases) |
| `node tools/harness.mjs status` / `next` / `resume` | 0 | current: N08R / N08R-10؛ next → N08R-02 |
| `npm run build:packages` | 0 | PASS |
| `npm run typecheck:all` | 0 | هر ۹ workspace PASS |
| `npx vitest run` | 0 | 73 فایل / 564 تست PASS (فایل ۷۴م یتیم — G-04) |
| `npm run verify:static:all` | 0 | STATIC_ALL: PASS (90/90) شامل هر ۷ gate مرورگری |
| `npm run verify:content-library` | 0 | PASS (10 protected originals, 25 stations, 15 patterns, 232 draft audio rows, 18 audited issues) |
| `npm run verify:migrations` | 0 | PASS (74 migrations, latest=0074_audio_cms_tables.sql) |
| `npm run verify:repository` | 0 | PASS (118 tasks, 60 ledger entries, 1880 dependency edges) |
| `npm run android:doctor` | 0 | ANDROID_BUILD: READY |
| `npm run android:gate` | 0 | BUILD SUCCESSFUL در 1m46s (671 tasks) — test+lint+compileDebugKotlin PASS |

اجرای مکمل (عامل gatekeeper، همان HEAD): `verify:android-foundation` = 0 (16 ماژول) · `verify:android-build-harness` = 0 · `node --test tools/tests/android-build.test.mjs` = 0 (6 تست) · `android:preflight` = 0 READY.

**وضعیت CI:** `android-native.yml` روی GitHub در گام «Install compile SDK 37» قرمز است (ادعای ثبت‌شده — امروز root-cause شد: پکیج `platforms;android-37` در اندیس رسمی وجود ندارد؛ G-01). وضعیت لحظه‌ای اجراهای GitHub در این نشست استعلام نشد (دسترسی API نبود) — UNVERIFIED، اما تشخیص static+deterministic است. `ci.yml`: job `core` required؛ job `visual-and-static` با `continue-on-error: true` کلاً informational (G-02).

## 3. ارزیابی اجرایی فنی (Executive Assessment)

**حقیقت مرکزی:** SHOMARA امروز **دو معماری در یک مخزن** دارد: (الف) معماری ثبت‌شدهٔ دورهٔ سرور (AGENTS/START_HERE/roadmap/ADR-0003/۴۰+ API route/۷۴ migration/CMS) و (ب) معماری executable فعلی که عملاً بی‌سرور است (URLها null، بدون permission INTERNET، release بدون محتوا) و مالک با ADR-0039 آن را به‌صورت رسمی آفلاین اعلام کرده. شکاف واقعی این نیست که «آفلاین کار نمی‌کند» — این است که **زیرساخت آفلاین هنوز ساخته نشده**: فروشگاه داده in-memory است (G-10)، پکیج‌انجین وجود ندارد (G-13)، موتور ارزیاب فقط یک draft evaluator دیباگ است (G-16)، و release عملاً shell است (G-12). در مقابل، پایه‌های مهندسی خوب‌اند: gate محلی کامل سبز، toolchain پین‌شده، مرز CONTENT-008/018 از کد رعایت می‌شود، allowBackup=false، لاگ بدون مقادیر، تست‌های رفتاری واقعی و verifierهای سخت‌گیر.

**سه مسیر بحرانی:** (1) CI را اعتمادپذیر کن (G-01/G-02 — بدون تصمیم مالک، فوری)، (2) ستون‌های آفلاین را پس از O1/O2/O4 بساز (پکیج/Room/ارزیاب)، (3) حاکمیت اسناد را یک‌باره با ADR-0039 هم‌راستا کن (G-08) تا هر عامل بعدی همان معماری را بسازد.

## 4. تناقض‌های معماری (فهرست کامل برای گام بازنویسی)

| منبع | متن فعلی | تعارض با |
|---|---|---|
| `AGENTS.md` §3-5/6, §5 | «server-authoritative»، «answer key/evaluator خارج از child client»، repository هماهنگی local/remote | ADR-0039 §2 (حقیقت محلی) — نکته: قاعدهٔ «answer key خارج از پروجکشن کودک» به‌صورت مفهومی حفظ می‌شود؛ فقط «سرور» به «ارزیاب محلی» تغییر می‌کند |
| `START_HERE.md` §7 | «Learning Truth، progression، mastery و Station Pass سروری» | ADR-0039 §2 |
| `docs/adr/ADR-0003` | status فعال بدون یادداشت | ADR-0039 «supersedes in part» — نیاز به status line |
| `docs/architecture/PACKAGE_BOUNDARIES_FA.md` | «repository تنها مرز هماهنگی local/remote» | مدل local/packaged جدید |
| `harness/roadmap.json` N06/N07/N09/N10 | contract test بک‌اند، parity سرور، CMS panel، «web/API unaffected» | ADR-0039 §5/§7 — بازثبت پس از O6/O13 |
| `design/MASTER.md` §5/§7/§8 + skillها | «server truth» | ADR-0039 §Consequences (فهرست رسمی همان‌جا) |

هر ۶ ردیف در ADR-0039 همین فهرست را داده‌اند؛ ADR-0039 گفته «بازنویسی در گام ledger بعدی» — این همان گام است (P0-5/P1-0).

## 5. ماتریس تصمیم O6 (Backend/Supabase/CMS)

**ورودی‌های واقعی:** ~۴۰+ API route در `apps/web/app/api/v1/**` (auth/otp، learning sessions/attempts، assignments، challenges، content packages/manifest/entitlements، progression/jump، sync/batch، missions، parent، teacher، admin-audio ۶ route)؛ ۷۴ migration (آخرین: audio CMS)؛ RLS+RPC؛ چند repository InMemory؛ پنل صوت N08-13 با `PERSISTENT_AUDIO_ADMIN_REPO_IMPLEMENTED=false` (`apps/web/lib/admin-audio.ts:88`) و گارد production در :91؛ Expo همچنان به authApi/runtimeApi/MobileSyncManager متصل است.

| سناریو | کار لازم | ریسک | نتیجه |
|---|---|---|---|
| **O6-A حذف** | بازنشستگی route-by-route با consumer-proof؛ آرشیو migrationها و `apps/web` به `docs/archive/`؛ ابزار authoring آفلاین جدید در `tools/` (validator + package builder + امضا) | حذف اشتباه مصرف‌کنندهٔ زندهٔ Expo (تا cutover مرجع رفتاری است) — نیاز به بازتعریف parity (O13) | مخزن تک-معماری؛ نگه‌داری کم؛ authoring در همان repo |
| **O6-B نگه‌داشتن به‌عنوان authoring/CMS** | حذف مسیر child-runtime از API؛ تعمیر فقط مسیر authoring: persistent repo صوت، object storage + signed URL، checksum، audit trail، RBAC، RLS test، rate limit، backup/restore، env separation، observability | نگه‌داری دو-استک دائمی؛ tempatation بازگشت به مدل سرور؛ هزینهٔ امنیتی سطح بزرگسال | ابزار authoring سازمان‌یافته با review workflow واقعی |

هیچ‌کدام پیاده نمی‌شود تا مالک انتخاب کند؛ ۷۴ migration تا retirement plan دست نمی‌خورند.

## 6. برنامهٔ اصلاح تست و CI (خلاصهٔ عملیاتی)

1. G-01: نصب `platforms;android-37.0` + قرارداد preflight برای `android-37/37.x` (بدون تغییر compileSdk=37 — با AGP 9.4 مجاز).
2. G-02: تفکیک required static-core از informational مرورگری؛ حذف continue-on-error از required.
3. G-03/G-04/G-05/G-06: artifact upload؛ تست یتیم vitest + verifier شمارش؛ dependabot+audit job؛ (بعداً) job instrumented.
4. G-10/G-13/G-16: تست integration SQLite واقعی، negative-control تست‌های پکیج، تست determinism موتور — بخش فازهای 1–3.
5. G-07: پس از HG-05 — job اعتبارسنجی release (بدون انتشار).

## 7. صریحاً «اکنون پیاده نشود» (ممنوعیت‌های این فاز)

- هر تغییر در Home/Path/Station Start/هر صفحهٔ کودک (مأموریت بصری جدا است — N08R).
- هر پیاده‌سازی پکیج/Room/ارزیاب قبل از O1/O2/O3/O4 و CONTENT-014.
- هر بازنویسی اسناد حاکمیتی قبل از تصمیم O6/O13 برای بخش‌های وابسته (فهرست آماده است).
- هر حذف/retirement از backend/Supabase/CMS/migrationها (O6) و هر migration روی production.
- هر انتخاب گزینه به‌جای مالک در O1–O13؛ هر threshold/hint/mastery اختراقی.
- هر انتشار/امضا/keystore (HG-05)؛ هر asset/صوت ساختگی؛ هر تضعیف verifier/threshold؛ هر کار مستقیم روی main.
- ساخت emulator جدید (از امولاتور موجود استفاده شود اگر evidence دستگاه لازم شد).

## 8. شواهد ممیزی کد (نمونه‌های مرجع)

- `apps/android/core/database/.../LocalLearningDatabase.kt:77-80` — چهار MutableList حافظه‌ای (G-10)
- `apps/android/sync/.../ManifestActivation.kt:44-89` — فعال‌سازی in-memory تک-ایستگاهی (G-13)
- `apps/android/app/src/debug/.../LessonContentWiring.kt:30-135,92-108` — دادهٔ ST07 + کلیدهای DRAFT فقط در debug (G-12, G-26)
- `apps/android/app/src/release/.../LessonContentWiring.kt:15-20` — release خالی (G-12)
- `apps/android/app/src/main/.../di/AppContainer.kt:70-76,95-98,144-153` — URLها null، DataStore واحد، DB in-memory، transport همیشه Retriable (G-09, G-10)
- `apps/android/app/src/main/AndroidManifest.xml:5-6,30-39` — allowBackup=false؛ ۵ host deep link (G-25, G-28)
- `apps/web/lib/admin-audio.ts:88,91,96,234` — persistent=false (G-23)
- `.github/workflows/android-native.yml:49-56` و `.github/workflows/ci.yml:27,37-48` (G-01, G-02)

## 9. وضعیت نهایی این فاز

- **DONE:** baseline کامل با exit code؛ ممیزی CI/CD root-caused؛ ممیزی data/package/learning/content/backend/security در حد شواهد کد؛ ۵ سند تحویل‌دادنی روی شاخهٔ audit.
- **OPEN برای مالک:** تأیید اسناد؛ پاسخ O1–O13 (اولویت §جدول در owner-decisions).
- **UNVERIFIED/BLOCKED:** وضعیت لحظهٔ اجراهای GitHub Actions (دسترسی نشد)؛ رفتار دقیق AGP با compileSdk=37 روی پکیج 37.x در CI (پس از رفع G-01 با یک اجرای CI اثبات شود)؛ هر اندازه‌گیری کارایی (فاز 6).
