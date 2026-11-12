# معماری هدف زیرساخت SHOMARA (نسخهٔ Phase 0 — برای تأیید مالک)

- **تاریخ:** 2026-11-12 · **مبنا:** commit `aa2805c` · **وضعیت:** پیشنهاد فنی؛ هر بخشِ وابسته به تصمیم مالک با برچسب `[O?]` مشخص است و تا تأیید، پیاده نمی‌شود.
- **مبنای تصمیم:** ADR-0039 (محصول کاملاً آفلاین؛ پکیج محتوای bundle + ارزیاب محلی؛ UI مدل Duolingo با مرزهای §6). ADR-0003 فقط به‌عنوان تاریخچهٔ دورهٔ سرور معتبر است.
- **آنچه عوض نمی‌شود:** single-activity + Compose + UDF + ViewModel/state immutable + Design System واحد + قواعد child-safe (بدون ستاره/جان/سکه/leaderboard) + مرز CONTENT-008/018.

---

## 1. اصول پنج‌گانهٔ هدف

1. **محتوای درسی فقط از پکیج bundle می‌آید** — نه از کد، نه از شبکه. نسخهٔ پکیج مستقل از نسخهٔ اپ گزارش‌پذیر است (ADR-0039 §1).
2. **حقیقت یادگیری روی دستگاه است و پایدار می‌ماند** — Room برای دادهٔ ساختاریافته؛ DataStore فقط برای تنظیمات سبک `[O4]`.
3. **موتور یادگیری pure و تست‌پذیر بیرون از Compose است** — determinism برای `(packageVersion, item, inputs, config)`.
4. **مرز answer-key نسخهٔ معماری دارد، نه استثنای موردی** — authoring/published/child-projection/evaluator چهار لایهٔ جدا `[O1]`.
5. **شبکه در کلاینت کودک وجود ندارد** — هیچ permission و transport شبکه در مسیر یادگیری؛ fail-closed به‌صورت طراحی‌شده (نه تصادفی).

## 2. نقشهٔ ماژول هدف (Android)

```text
:app                    → composition root، NavHost، shell، launch gate
:core:common            → logger/error taxonomy (موجود)
:core:model             → مدل دامنه (موجود؛ گسترش با محتوای پکیج)
:core:designsystem      → token/theme/component (موجود)
:core:datastore         → فقط settings/checkpoint سبک (تغییر scope)
:core:database          → Room واقعی: progress/packages/attempts/sessions [O4]
:core:contentpackage    → جدید: loader/verifier/activation/registry پکیج [O2]
:core:learning          → جدید: موتور ارزیاب + قواعد نسخه‌دار [O1]
:feature:*              → فقط UI و event؛ هیچ تصمیم mastery
:sync                   → بازنشسته پس از O3/O6 (کد دورهٔ سرور)
:core:network           → بازنشسته پس از O3 (فقط اگر authoring tool جدا نخواستش)
```

قواعد مرز همان `PACKAGE_BOUNDARIES_FA.md` می‌ماند با یک اصلاح: مرز repository دیگر «local/remote» نیست؛ «local/packaged» است (اصلاح متن در گام بازنویسی ledger — G-08).

## 3. لایهٔ داده (پیشنهاد، مشمول O4)

Room (تخمین ۹ جدول؛ نام‌ها قطعی نیستند):

| موجودیت | نقش | نکتهٔ کلیدی |
|---|---|---|
| ChildProfile | نام/آواتار/پایه | پس از O5؛ کلید اصلی پیشرفت |
| ProfilePreferences | تنظیمات هر پروفایل | یا DataStore؛ O4 تعیین می‌کند |
| StationProgress | وضعیت هر ایستگاه (Fresh/Current/…) | منبع unlock engine |
| ChapterProgress | وضعیت فصل | مشتق؛ قابل محاسبه ولی ذخیره برای query |
| SkillMastery | mastery هر skill | نسخهٔ قاعده ذخیره شود |
| LessonSession | نشست هر اجرای درس | resume/restore |
| AttemptHistory | هر attempt با IDs-only | بدون پاسخ/درستیِ خام (CONTENT-018) |
| ContentPackage + ContentPackageVersion | رجیستری پکیج‌ها | نسخه/چک‌سام/وضعیت lifecycle/فعال بودن |
| AudioAsset / VisualAsset | اندیس assetهای پکیج | sha256 + وضعیت |
| LocalEvaluatorVersion | نسخهٔ موتور/قواعد | برای determinism گزارش‌پذیر |
| MigrationMetadata | تاریخچهٔ migration | fail-closed روی downgrade/corrupt |

- transaction برای هر به‌روزرسانی چند-ردیفی progression؛ FK و indexها عمدی؛ concurrent write با Room/WAL.
- **DataStore فقط:** settings (آواتار، reduced motion، زبان اعداد)، checkpoint درس سبک. token/session OTP حذف می‌شود (Phase 2).
- تست پذیرش: Room/SQLite واقعی (Robolectric یا instrumented) — «fake in-memory که JVM تست را پاس کند» proof دوام نیست.

## 4. فرمت پکیج محتوا (منوط به O2)

پیشنهاد پایه = همان ADR-0039 §4، با تکمیل‌های مهندسی زیر:

```text
content-package/
├── manifest.json          # schemaVersion, packageVersion, minAppVersion, voiceProfileId,
│                          # files[] (path+size+sha256), stations[], ENABLED list,
│                          # signature (detached), packageChecksum
├── stations/STxx.json     # پروجکشن کودک — بدون answer/threshold/nextStep/reviewer
├── audio/*.opus           # فقط APPROVED/PUBLISHED؛ duration+checksum در manifest
└── images/*.webp          # بدون متن/عدد/ستاره داخل تصویر
```

- **امضا:** signature منفصل روی کل manifest؛ کلید عمومی پین‌شده در APK؛ پشتیبانی چرخش (زنجیرهٔ کلید با فاصلهٔ اعتبار) `[O2]`.
- **فعال‌سازی اتمیک:** stage روی دایرکتوری موقت → verify کامل (checksum هر فایل + امضا + schemaVersion + minAppVersion) → swap اتمیک (rename) → ثبت در رجیستری Room → در شکست: rollback به نسخهٔ فعال قبلی پایدار.
- **corrupt/missing asset:** سطح خطای صادقانه («محتوای این ایستگاه موجود نیست») — هرگز fallback خاموش (ADR-0039 §1).
- **lifecycle:** فقط stationهای APPROVED وارد پکیج می‌شوند؛ ENABLED یعنی «در APK + checksum تأیید + gate فعال‌سازی اولین اجرا».
- **بودجهٔ حجم:** سقف APK/AAB `[O7]` — هر پکیج در CI اندازه‌گیری و با سقف مقایسه می‌شود؛ در manifest ثبت و در گزارش release می‌آید.
- **چهار لایهٔ جدا:** authoring (با پاسخ — فقط در ابزار authoring/CMS، هرگز وارد APK) → published package (قفل+چک‌سام+امضا) → child projection (بدون پاسخ/آستانه) → local evaluator (لایهٔ چهارم) `[O1]`.

## 5. موتور یادگیری محلی (منوط به O1 و CONTENT-014)

- مسئولیت‌ها: orchestration درس، template registry، ارزیاب محلی، hint policy، attempt policy، قواعد progression، گراف پیش‌نیاز، unlock، mastery، recovery selection، resume، calibration نسخه‌دار.
- **الزامات سخت:** هیچ threshold/attempt/hint/mastery جدید اختراع نشود؛ فقط قواعد نسخه‌دار که در برابر محتوای approved اعتبارسنجی شده‌اند (CALIBRATION_V1 مبنا و فقط با ADR عوض می‌شود)؛ determinism با تست قطعی؛ تست موتور کامل بیرون از Compose (JVM).
- **ارزیابی per-template** طبق گزینهٔ انتخابی O1؛ گزینهٔ 2/3 باید per-template اثبات شود نه کلی.
- snapshot test «پروجکشن کودک بدون answer/evaluator/threshold» برای هر adapter (ادامهٔ N06-11 با مرجع جدید = پکیج محلی).

## 6. هویت، والدین و امنیت `[O5]` (Phase 2)

- profile کودک کاملاً محلی (نام/آواتار/پایه)؛ بدون اکانت/رمز/بازیابی سروری؛ تک یا چند پروفایل = تصمیم O5.
- Parent PIN محلی هش‌شده (هرگز plaintext)؛ ParentGate با verifier محلی fail-closed.
- حذف کامل: OTP/token/session/debug OTP/provider شبیه‌سازی، probe سرور در launch، `LessonGateway` HTTP، transport آن‌لاین outbox، `ShomaraRuntimeConfig` URLs — طبق O3.
- حریم: بدون permission شبکه در کلاینت کودک؛ لاگ بدون مقادیر؛ dataExtractionRule فعلی (allowBackup=false) حفظ؛ بدون آنالیتیکس؛ مسیر حذف دادهٔ محلی (پاک‌سازی پروفایل/پیشرفت) در تنظیمات والد.
- تهدیدهای باقی‌مانده ثبت‌شده در gap register (G-25..G-28) — استخراج APK debug کلیدهای DRAFT دارد و نباید بیرون برود.

## 7. معماری شرطی authoring/CMS (منوط به O6)

دو سناریو — هیچ‌کدام پیاده نمی‌شود تا مالک انتخاب کند:

- **O6-A (حذف):** بازنشستهٔ قابل‌بازبینی `apps/web` (بخش API)، ۷۴ migration، repositories دورهٔ سرور، پنل N08-13؛ نگه‌داشتن فقط ابزار authoring آفلاین کوچک (validator + package builder) در `tools/`؛ export پکیج امضاشده از همان‌جا. تاریخچه در `docs/archive/`.
- **O6-B (نگه‌داشتن به‌عنوان ابزار authoring بدون backend کودک):** حذف کل زنجیرهٔ child-runtime از API (learning/attempts، sync، progression)؛ نگه‌داشتن و تعمیر فقط مسیر authoring: persistent repo برای audio admin، object storage + signed URL، checksum/نسخهٔ صوت، audit trail، RBAC، مهاجرت InMemory→DB، RLS test، rate limit، backup/restore، جداسازی env، observability. هیچ endpoint یادگیری کودک بازنویسی نمی‌شود (خلاف ADR-0039).
- هر دو سناریو: ۷۴ migration تا retirement plan تأییدشده دست نمی‌خورند؛ chain زنجیرهٔ محتوا همان `SOURCE_ONLY→…→ENABLED` است.

## 8. جریان دادهٔ هدف (مسیر کودک)

```text
APK → first-run activation gate → verify(manifest.signature, per-file sha256, schema, minAppVersion)
    → swap اتمیک + رجیستری Room → ENABLED
Path/Station → Repository(Room) → unlock engine(قواعد نسخه‌دار) → stateFor
Lesson Route → ViewModel → UseCase → LocalPackageRepository(stations/*.json)
    → child projection → template adapter → ورودی کودک → LocalLearningEvaluator [O1]
    → Outcome(correct/nextAction/mastery) → Room(progress/session/attempt: IDs-only) → UI فقط رندر
حذف کامل از مسیر: HTTP، OTP، outbox transport، server manifest
```

## 9. مرزهای مهاجرت و cutover

| مرز | از | به | گارد |
|---|---|---|---|
| M1 | LessonGateway HTTP + stub | LocalLessonEvaluator `[O3]` | تست موتور + snapshot بدون answer |
| M2 | DB in-memory | Room `[O4]` | تست integration روی SQLite واقعی + migration preserving |
| M3 | wiring دستی ST07 در debug | loader پکیج `[O2]` | negative control (checksum خراب → rollback) |
| M4 | OTP/token/session | profile محلی + PIN `[O5]` | fail-closed تست‌ها |
| M5 | N06/N07/N09/N10 متن سرور | بازنویسی ledger | یک commit قابل‌بازبینی (G-08) |
| M6 | Expo runtime child | retirement route-by-route | parity جدید = O13 |

**قاعده:** هیچ M بدون gate قبلی‌اش شروع نمی‌شود؛ هیچ حذفی بدون consumer-proof؛ V1/N09 طبق سیاست clean بخش‌به‌بخش بازنشسته می‌شود.

## 10. آنچه در این معماری «ممنوع» است

- هر endpoint یادگیری کودک جدید روی backend (خلاف ADR-0039).
- هر دانلود محتوا در مسیر کودک؛ هر CDN runtime.
- هر threshold/attempt/hint/mastery اختراعی بدون ADR و اعتبارسنجی محتوای approved.
- ورود answer/evaluator/threshold به پروجکشن کودک، DB، لاگ، telemetry (CONTENT-008/018).
- هر اقتصاد انگیزشی (ستاره/سکه/جان/streak تنبیهی/…) بدون ADR مستقل و نسخهٔ child-safe (ADR-0039 §6، O10).
- هر حذف تخریبی backend/migration بدون retirement plan تأییدشده.
