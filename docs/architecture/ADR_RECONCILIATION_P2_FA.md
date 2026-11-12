# ADR Reconciliation — Phase P2 (فاز معماری و تصمیم‌ها؛ بدون بازنویسی کد)

- **تاریخ:** 2026-11-13 · **شاخه:** `infra/p2-adr-reconciliation` (از `infra/p1-ci-stabilization@d0da740`)
- **مأموریت مالک:** هم‌آشتی کامل معماری حول ADR-0039 (محصول کودک کاملاً آفلاین)؛ هیچ بازنویسی بزرگ کد؛ هیچ اجرای فازهای 3–6 تا تصویب O1/O2/O3/O4.
- **تأیید ورودی‌ها (بدون تکرار ممیزی):** commit ادعاشدهٔ `f0b6823` **موجود و ancestor of HEAD است** (merge-base check) و هر پنج سند Phase 0 در clone فعال حاضرند: `INFRASTRUCTURE_{GAP_REGISTER,TARGET_ARCHITECTURE,EXECUTION_ROADMAP,OWNER_DECISIONS,BASELINE_REPORT}_FA.md`. مبنا = همین اسناد + کد فعلی.
- **همراه این سند:** Register زندهٔ تصمیم‌ها در `INFRASTRUCTURE_OWNER_DECISIONS_FA.md` (v2 با وضعیت OPEN/PROPOSED/APPROVED/REJECTED).

---

## 1. ADR Reconciliation Map

وضعیت‌ها: **GOVERNING** (قانون حاکم) · **AMENDED** (در این فاز حداقلی اصلاح شد) · **STATUS-NOTE** (یادداشت Superseded-by، متن تاریخی دست‌نخورده) · **ALREADY-RECONCILED** · **FROZEN-PENDING** (قانون قدیمی می‌ماند ولی اجرای آن تا تصمیم مالک مسدود است) · **HISTORICAL-KEEP** · **COMPATIBLE**.

| اثر / سند | قانون قبل از P2 | تعارض با ADR-0039 | اقدام P2 | وضعیت باقی‌مانده |
|---|---|---|---|---|
| ADR-0039 (2026-11-05) | — | — | مرجع | GOVERNING |
| ADR-0003 Server-Authoritative | Learning truth = Platform runtime | کامل خلاف §2 ADR-0039 | یادداشت Status با ارجاع SUPERSEDED-IN-PART→ADR-0039؛ متن تاریخی حفظ؛ سرنوشت استک سرور → O6 | STATUS-NOTE |
| ADR-0036 (identity/minSdk 24) | app id + API 24 | ندارد | — | COMPATIBLE |
| ADR-0037 (Track A beta lock) | milestones متصل به backend، OTP، sync | Track A کلاینت اکسپوی متصل به سرور است؛ فازهای backend آن با ADR-0039 جمع‌شدنی نیست | **ویرایش نشد**؛ آیتم‌های امنیتی P0 خودش معتبر می‌ماند؛ هر اجرای فاز backendِ Track A → O6/O13 | FROZEN-PENDING-O6/O13 |
| ADR-0038 (splash/launch/DEBUG OTP N08-15) | مسیر OTP در launch | OTP در Phase 2 برنامه (پس از O5) حذف می‌شود | — | COMPATIBLE (تا آن‌هنگام fail-closed فعلی معتبر) |
| ADR-0040 (UI amendments) | قواعد Clay/TalkBack/× | ندارد (هم‌راستا با §6 ADR-0039) | — | COMPATIBLE |
| AGENTS.md §3-ق5 | «فقط server-authoritative می‌ماند» | خلاف §2 | **AMENDED:** «فقط از منبع حقیقت محصول (پکیج bundle + ارزیاب محلی نسخه‌دار — ADR-0039)…» | باز: جزئیات evaluator = O1 |
| AGENTS.md §3-ق6 | «answer key و evaluator وارد کلاینت کودک نمی‌شود» | سازگار ولی مبهم در مدل جدید | **AMENDED:** کلید هرگز وارد پروجکشن/DB/لاگ/telemetry؛ فقط در لایهٔ ارزیاب محلی (CONTENT-008/018) | بسته به‌عنوان مرز |
| AGENTS.md §5 | «repository هماهنگی local/remote؛ sync قابل retry» | مسیر کودک شبکه ندارد | **AMENDED:** هماهنگی local/packaged؛ صفر وابستگی شبکه | — |
| AGENTS.md §6 (سطر الهام Duolingo) | «الهام محدود به اصول» | §6 ADR-0039 مدل ساختاری Duolingo را مصوب کرده | **ویرایش نشد** — به ledger UI فاز موازی N08R موکول (جلوگیری از تصادم با فاز بصری فعال مالک) | DEFERRED-UI-LEDGER |
| START_HERE.md §7 | «Learning Truth… سروری» | خلاف §2 | **AMENDED** (۱ سطر با ارجاع ADR-0039 + O1) | — |
| START_HERE.md §6e (عناوین فازهای بستهٔ N06/N07) | «Server Truth» در عنوان‌های تاریخی | رکورد فازهای بسته | حفظ به‌عنوان تاریخ | HISTORICAL-KEEP |
| README.md | «server-authoritative» | خلاف §1 | **AMENDED** (۱ سطر) | — |
| ZCODE.md | flow harness | ندارد | — | KEEP |
| PACKAGE_BOUNDARIES_FA.md:26 | «repository مرز local/remote» | خلاف مدل آفلاین | **AMENDED:** هماهنگی Room/DataStore ↔ پکیج bundle | — |
| skills/shomara-product-design:27 | «server-authoritative» | خلاف §2 | **AMENDED** (local source authoritative) | — |
| skills/shomara-screen-execution:21,41 | «server truth / server-authoritative» | خلاف §2 | **AMENDED** (۲ سطر) | — |
| skills/shomara-learning-content:32 | «decisions server-authoritative» | خلاف §2 | **AMENDED** (+ سرنوشت استک authoring → O6) | — |
| skills/shomara-learning-content:15,45 | «server contracts / server boundary» در authoring | متعلق به استک authoring | **ویرایش نشد** — معتبر فقط در سناریوی نگه‌داشتن authoring | FROZEN-PENDING-O6 |
| design/MASTER.md:70 | (بازنویسی‌شده قبلی) ارزیاب محلی | ندارد | — | ALREADY-RECONCILED |
| design/INSPIRATION_GUARDRAILS.md | زنجیرهٔ اولویت «server truth» (طبق فهرست Consequences در ADR-0039) | با ledger UI حل می‌شود | **ویرایش نشد** — فاز N08R | DEFERRED-UI-LEDGER |
| harness/roadmap.json N05:1004 / N06:1268 / N07:1575 | متن‌های server-authoritative در taskهای فازهای **بسته** | رکورد تاریخی با evidence خودشان | **ویرایش نشد**؛ law جدید فقط AGENTS/START_HERE/skillهاست | HISTORICAL-KEEP |
| harness/roadmap.json N08-06..12 + N09 + N10 | parity، contract test بک‌اند، «web/API unaffected»، CMS panel | به O6/O13/O11 وابسته | **قفل اجرا** — هیچ task از این گروه بدون تصمیم مالک و بازنویسی متن اجرا نشود | FROZEN-PENDING-O6/O13/O11 |
| ROADMAP_PHASES.md | ledger تاریخی verifierهای legacy | AGENTS §2 همین را تاریخی اعلام کرده | — | HISTORICAL-KEEP |
| content-library/integration (PHASE_INTEGRATION، AUTHORING_CONTRACT_GAPS) | مدل سه‌لایهٔ authoring با lifecycle سروری | لایهٔ authoring تحت O6 معتبر می‌ماند | **ویرایش نشد**؛ فقط مسیر runtime آفلاین الزام جدید دارد | FROZEN-PENDING-O6 |

**اصل P2:** قانون متناقض دیگر از AGENTS/START_HERE/README/PACKAGE_BOUNDARIES/skillها منتقل نمی‌شود؛ هر چیز دیگری یا تاریخی است یا با یادداشت قفل شده — هیچ متن تاریخی حذف یا بازنویسی نشد.

## 2. Module / Data Flow Diagram (به‌روز — پس از P1، با شاخه‌های شرطی)

```text
【وضعیت as-built امروز — پس از P1】
APK (release: R8 minify، بدون signingConfig، بدون INTERNET permission)
 ├─ ShomaraApplication → DefaultAppContainer (DI دستی؛ scope اپ)
 │    ├─ logger (SafeAppLogger — فقط کلید attribute، بدون مقادیر)
 │    ├─ DataStore واحد (shomara_auth.preferences_pb): token | profileDraft | lessonCheckpoint | settings
 │    ├─ LocalLearningDatabase (in-memory MutableList×4 — G-10، می‌رود به Room با O4)
 │    ├─ LessonGateway HTTP (URL null → همیشه Failed) — سرنوشت O3
 │    ├─ OutboxSyncEngine (transport همیشه Retriable) — سرنوشت O3/O6
 │    ├─ LessonContentWiring: debug = ST07 DRAFT + کلیدها hardwired؛ release = خالی fail-closed
 │    └─ (P1) preflight پین platforms;android-37.0 با package.xml
 ├─ NavHost single-activity؛ deep link ۵ host fail-closed؛ RTL ریشه
 └─ feature:* → core:designsystem/model/common فقط (قواعد PACKAGE_BOUNDARIES)

【هدف — شرطی به تصمیم‌ها؛ هیچ شاخه‌ای بدون تصویب پیاده نمی‌شود】
first-run: verify(manifest.signature[O2] + per-file sha256 + schema + minAppVersion[O2/O7])
   → swap اتمیک روی فایل‌سیستم → رجیستری Room[O4] → ENABLED
Path/Station → Repository(Room)[O4] → unlock engine (قواعد نسخه‌دار CONTENT-014) → stateFor
Lesson → ViewModel → UseCase → LocalPackageRepository(stations/*.json)[O2]
   → child projection (بدون answer/threshold) → template adapter → ورودی کودک
   → LocalLearningEvaluator[O1] → Outcome → Room(progress/session/attempt IDs-only) → UI رندر
identity: profile محلی + Parent PIN هش‌شده[O5] — OTP/token/session حذف (Phase 2 پس از O3/O5)
حذف‌شده از مسیر کودک برای همیشه: HTTP، OTP، outbox transport، server manifest
استک authoring/CMS (Supabase، apps/web، 74 migration): دست‌نخورده تا O6؛ سناریوهای A/B در Register
```

## 3. Phase Gate Matrix (ترتیب مأموریت مالک P0..P11)

| فاز | خروجی | تصمیم لازم (مسدودکننده) | gate اثبات | وضعیت |
|---|---|---|---|---|
| P0 ممیزی | ۵ سند ممیزی + ثبت شکاف | — | اسناد + baseline exit 0 | **DONE** (`f0b6823`) |
| P1 CI/Build | gate CI قابل‌اعتماد، پین پکیج، cache، ماتریس نسخه | — | همهٔ gateهای محلی exit 0؛ **CI واقعی = BLOCKED تا push مالک** | **DONE_WITH_CI_PENDING** (`abc6f1f`+`d0da740`) |
| P2 معماری و تصمیم‌ها | Reconciliation Map + Register + Diagram + Gate Matrix + Forbidden Assumptions؛ اصلاح حداقلی قانون | — | `verify:static:all` 91/91 + `verify:repository` + `harness validate` | **این فاز = Decision Pack** |
| P3 Room و repositoryهای پایدار | اسکیمای سند هدف §3 + integration واقعی | **O4** | تست Robolectric/instrumented روی SQLite؛ migration preserving | BLOCKED-O4 |
| P4 پکیج امضاشده | loader/verifier/activation/rollback | **O2 (+O7 بودجهٔ حجم)** | negative control (checksum/امضا/schema خراب) | BLOCKED-O2 |
| P5 موتور ارزیاب محلی | evaluator نسخه‌دار + determinism | **O1 (+CONTENT-014)** | تست قطعی determinism + snapshot بدون answer | BLOCKED-O1 |
| P6 schema/validator/authoring pipeline | validator اجرایی + artifact typed ST07 | **O11/O12 (+CONTENT-015)** | validator صفر خطا روی pilot | BLOCKED-O11/O12 |
| P7 محتوا و رسانه | ۲۴ ایستگاه در ۵ بچ + صوت/تصویر | **O8/O9 + CONTENT-004/005/006/007/009/010/012/016** | هر بچ: validator + بازبینی انسانی + پکیج gate | BLOCKED |
| P8 هویت/Parent PIN/حریم | profile محلی + PIN هش‌شده + حذف OTP | **O5 (+O3)** | fail-closed تست‌ها + process death | BLOCKED-O5 |
| P9 سرنوشت Backend/CMS | retirement plan یا تعمیر authoring stack | **O6** | plan مکتوب + مصرف‌کننده‌ها | BLOCKED-O6 |
| P10 Integration/QA/کارایی | E2E آفلاین، baseline اندازه‌گیری، emulator CI (G-06) | فازهای 3–8 | before/after measures | BLOCKED-P3..P8 |
| P11 Release/cutover | signing، AAB، parity جدید، بازنشستگی Expo | **HG-05 + O13 (+O6)** | airplane-mode E2E + store checklist | BLOCKED |

## 4. ممنوعیت‌های مفروض (Forbidden Assumptions) — هیچ عامل/فازی حق ندارد این‌ها را فرض کند

1. هیچ‌کس حق ندارد **O1–O13 را approved فرض کند** — پیشنهادهای مهندسی Register مصوبه نیستند؛ تغییر وضعیت فقط با بیانیهٔ صریح مالک + evidence ثبت می‌شود.
2. قبل از **O1**: هیچ answer-key model، ارزیابی درستی، mastery/unlock یا threshold در کاتلین پیاده نشود؛ هیچ bundling محتوای authoring انجام نشود.
3. قبل از **O2**: هیچ فرمت پکیج، امضا، pinned key یا activation روی فایل‌سیستم پیاده نشود.
4. قبل از **O3**: `LessonGateway`/`OutboxSyncEngine` نه حذف شود نه «جایگزین محلی» بگیرد (فقط می‌توانند dead-but-present بمانند).
5. قبل از **O4**: هیچ Room entity/migration یا ادعای persistence پایدار ساخته نشود؛ «in-memory که JVM تست پاس شود» proof دوام نیست.
6. قبل از **O5**: هیچ profile محلی یا Parent PIN پیاده نشود؛ OTP حذف نشود.
7. قبل از **O6**: هیچ حذف/retirement از Supabase/74 migration/apps/web/CMS و هیچ تعمیر persistent-repo انجام نشود.
8. قبل از **O7**: هیچ بودجهٔ حجم یا gate اندازه تعیین نشود؛ ادعای «سایز منطقی» بدون عدد ممنوع.
9. قبل از **O8**: هیچ فونت دانلود یا جاسازی نشود (`FontFamily.Default` می‌ماند).
10. قبل از **O9**: هیچ asset شخصیت جدید ساخته/انتخاب نشود؛ Main بنفش تصمیم‌نشده باقی است.
11. قبل از **O10**: هیچ عنصر اقتصاد انگیزشی (ستاره/سکه/جان/streak/…) ساخته نشود — حتی «نسخهٔ قشنگ‌تر».
12. قبل از **O13**: parity و «web/API unaffected» بازتعریف نشوند؛ cutover Expo شروع نشود.
13. **CONTENT-014**: هیچ mastery/unlock/jump/hint policy اختراع نشود — فقط قواعد نسخه‌دار مصوب.
14. **HG-05**: بدون مجوز صریح، release/AAB/signing/keystore وجود نداشته باشد؛ Debug APK هیچ‌وقت معادل release approval نیست.
15. متن‌های قدیمی FROZEN-PENDING (roadmap N08-06..12/N09/N10، ADR-0037 backend phases، authoring server-boundary) **به‌صورت نوشته‌شده اجرا نشوند**.
16. این برنامهٔ زیرساخت UI کودک را بازطراحی نمی‌کند (Home/Path/Station Start = فاز N08R مالک).

## 5. وضعیت پایان P2 و توقف

- تحویل این فاز = **Decision Pack**: Register v2 + این سند + اصلاح حداقلی قانون (۱۲ سایت در ۹ فایل + یادداشت ADR-0003). هیچ کد محصولی تغییر نکرد؛ هیچ فاز 3–6 اجرا نشد.
- گیت‌های فاز: `verify:static:all` = 91/91، `verify:repository` = PASS، `harness validate` = HARNESS_VALID (ثبت در WORKLOG).
- **توقف تا پاسخ مالک به Register** (اولویت پیشنهادی: O1 → O2 → O4 → O3 → O7 → O5 → O6 → O11/O12 → O8/O9 → O13).
