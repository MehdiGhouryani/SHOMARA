# START_HERE.md — وضعیت canonical پروژهٔ SHOMARA
| 2026-11-14 | SNAP-20261114-IPA-P13-DESIGN-LIBRARY | برنامهٔ زیرساخت مالک — P13 بسته شد روی `infra/p13-design-library`: **Design System واقعی Clay** — token gap پر شد (clay.hint/flat specs به tokens.json + codegen بازتولید؛ چهار tier کاملاً token-driven)، **ClaySurface/shomaraClayAnimated** (press=scale+sink+shadow با spring token؛ shadow فقط سطح، متن هرگز)، **ShomaraIconButton/OptionCard**، **LessonKit** (UnitHeader/LessonProgressHeader/ActionBar/HintCard/GuideBubble/ResultSummary/RecoveryCard)، **PathKit** (PathNode redundant encoding + PathConnector؛ extracted از feature:path)، **Previews light+RTL** برای همه، **DesignSystemGalleryActivity** debug + device screenshots (artifacts/p13-device/، LTR+RTL). Design Guard: همهٔ dp خام → Space tokens (NATIVE_DESIGN_GUARD PASS، raw=0). **ClayContractTest ۶/۶**: ascending tiers، generated-token equality، redundant encoding، CURRENT-only FEATURED. شواهد: gate PASS، static 94/94، repo PASS، ADR-0049. Home دست‌نخورده (BLOCKED). |
| 2026-11-14 | SNAP-20261114-IPA-P12-UX-ARCHITECTURE | برنامهٔ زیرساخت مالک — P12 بسته شد روی `infra/p12-ux-architecture` (docs-only؛ بدون بازطراحی Home و بدون تغییر کد): **ADR-0048 / UX_ARCHITECTURE_MAP_FA.md** — UX Architecture Map (shell سه‌تب + سه جریان)، journey diagram کامل (onboarding→calibration→first lesson→Path→Station→P1..P5→Result/Recovery→Review→Path؛ Me/Avatar/Settings/Guardian)، **Screen contract matrix ۱۷ خانواده × ۱۰ فیلد** (entry/exit، CTA per state، states، Back/Resume، data، ViewModel UiState/Events، a11y focus، motion)، State/Event catalog درس، Navigation/Back/Resume contract هشت‌سطحی، **Home visual = BLOCKED** (handoff نهایی در repo نیست؛ فقط قرارداد data/interaction/state)، Gap list ۹ مورد (engine→UI wiring صفر، Family 03 حذف Phase 2، P4/P5 transcribe نشده و…). منبع: ۱۷ خانواده blueprint + ledger + backlog + ROUTE_REGISTRY. شواهد: static 94/94 بدون تغییر، repo PASS. |
| 2026-11-14 | SNAP-20261114-IPA-P11-O6-PACK | برنامهٔ زیرساخت مالک — P11 بسته شد (فقط Decision Pack؛ O6 هنوز OPEN): **هیچ حذف/گسترشی اجرا نشد**. Inventory ماشین‌خوان از repo واقعی (`tools/o6-inventory.mjs` → `docs/architecture/o6-pack/inventory.json`): **۴۹ API route endpoint-by-endpoint · ۷۴ migration · ۸ InMemory repo**. Decision Pack سه‌گانه در `O6_DECISION_PACK_FA.md`: A=Retain authoring service (persistent repos/storage/RBAC/RLS/rate-limit/local-supabase/backup — بزرگ‌ترین)، **B=⭐ توصیهٔ فنی: authoring محلی + پکیج امضاشده (زیرساختش از P7 آماده؛ retire ترتیبی با archive)**، C=Retire کامل. ماتریس ۵ معیاره + قانون اجرا پس از تصمیم (verifier R11 با اولین commit). Runtime کودک در هر سه گزینه بدون Backend. شواهد: static 94/94، gate PASS، repo PASS. |
| 2026-11-14 | SNAP-20261114-IPA-P10-IDENTITY-PRIVACY | برنامهٔ زیرساخت مالک — P10 بسته شد روی `infra/p10-identity-privacy`: ماژول جدید `:core:profile` — **ParentPinManager** (PBKDF2-HMAC-SHA256×210k + salt + constant-time verify + **lockout نسخه‌دار پایدار**: ۵ خطا → ۳۰s تا ۱۵min؛ process death نمی‌تواند دور بزند)، **LocalProfileManager** (single slot؛ createSecondProfile تا O5 throw)، **PrivacyDataController** (wipe fail-safe همهٔ storeها+dirs)، **BackupPolicyController** (backup-policy:v1-none)، **SafeDiagnostics** (scan PII value-side)، **DeviceKeyManager ارزیابی: لازم نیست** (Keystore با O1/O2). Manifest: dataExtractionRules API-31+ (cloud+transfer همه exclude) + verifierهای privacy (allowBackup=false/صفر permission در foundation). **O5 باز ماند — بدون schema/flow چندپروفایلی.** ۱۲ تست سبز (PIN hashed/lockout persisted/boundary؛ deletion fail-safe؛ backup v1؛ no-PII). شواهد: gate PASS، static 94/94، foundation PASS (18 modules)، repo PASS. ADR-0047. |
| 2026-11-14 | SNAP-20261114-IPA-P9-MEDIA-CURRICULUM | برنامهٔ زیرساخت مالک — P9 بسته شد: **بازبینی آمار با validator جاری — همه تأیید و تغییری نکرده** (۲۵ ایستگاه، ST07 تنها pilot، ۲۳۲ ردیف صوت DRAFT، صفر باینری، صفر asset ایستگاهی — ۷۵ تصویر موجود برند/کاراکترند). تحویل: **Asset Registry + Metadata Validator** (sniff هدر؛ silence=reject با RMS؛ hash/placeholder/missing reject؛ provenance الزامی؛ registry واقعی=۰ asset)، **Missing/Orphan/Impact Reporter** (ST07: ۵۳ صوت + ۳۶ تصویر missing؛ impact سه gate)، **Curriculum Matrix نسخه‌دار** (۲۵×۱۴ فیلد صادقانه + batches A–E طبق ADR-0039 §7 با ۴ نقش review)، **ST07→VALIDATED روی ledger واقعی** (machine gates؛ HUMAN_REVIEWED صادقانه refuse)، media verifier (۹۴مِ static:all) با WAV fixtures واقعی (sine قبول، silence رد). بودجهٔ O7 فقط پس از اندازه‌گیری media واقعی (عدد فرضی ممنوع). گپ‌ها: تألیف ۲۴ ایستگاه، دارایی‌ها، O1/O2/O7، review انسانی. شواهد: gate/static 94/94/repo PASS. |
| 2026-11-13 | SNAP-20261113-IPA-P8-VERTICAL-SLICE | برنامهٔ زیرساخت مالک — P8 بسته شد: **ST07 Vertical Slice** — زنجیرهٔ کامل اثبات شد (debug-only): draft package روی دستگاه ساخته/امضا (EC ephemeral؛ debug trust؛ release trust خالی=fail-closed و reject حتی با leak) → Activator اتمیک → Loader → projection (8 آیتم P2+2 گام P1) → LocalLessonEngine P1..P5 → DebugSt07Evaluator (پاسخ T15 فقط در لایهٔ debug؛ T13/T01=AWAIT_POLICY صادقانه؛ T05=PatternRule قطعی) → Room v3 (11 attempt: 8+3 retry؛ 4 correct) → checkpoint resume. سناریوها سبز: Robolectric full-chain/force-stop-reopen/corrupt/version-mismatch/release-fail-closed/audio-fallback + **airplane cold start روی دستگاه** (connectedDebugAndroidTest BUILD SUCCESSFUL؛ screenshots 01-03). اصلاحات: compose BOM در :app androidTest + جایگزینی assertDoesNotExist حذف‌شده با assertCountEquals در ۵ فایل. **عنوان: PILOT/DRAFT — نه Production-ready** (بدون O1/O2/O7/Human review؛ preview UI هنوز hardcoded؛ P4/P5 transcribe نشده). شواهد: gate PASS، static 93/93، repo PASS، ST07_VERTICAL_SLICE_REPORT_FA.md. |
| 2026-11-13 | SNAP-20261113-IPA-P7-CONTENT-PIPELINE | برنامهٔ زیرساخت مالک — P7 بسته شد روی `infra/p7-content-pipeline`: **خط تولید محتوا** در `tools/content-pipeline/` حول قرارداد سه‌لایهٔ موجود (packages/contracts/content-projection.ts — N06-01/09/11) — AuthoringStation ST07 (پاسخ‌ها با anchor به originals بایت‌محافظت‌شده؛ هیچ کپی)، ContentValidator با ۱۳ خانواده rule، **ContentPromotionGate با lifecycle ۷مرحله‌ای sequential + ledger append-only + دو گیت انسانی که ابزار نمی‌تواند دور بزند** (review evidence ۴ نقش + marker امضای مالک)، AssetManifestBuilder/PackageBuilder (UNSIGNED)/ContentDiffReporter، CLI چهارفرمانه + `gradlew contentPipelineValidate`. **۷ fixture منفی + leaked-projection همه reject شدند**؛ گیت استاتیک جدید (۹۳م). Gap report: O1/O2/O7 + CONTENT-009/010/014 + stage-mapping + review evidence + rights + signed release. شواهد: android:gate PASS، static:all 93/93، repository PASS، gradle task PASS، CONTENT_PIPELINE PASS. فقط ST07 prototype؛ originals دست‌نخورده. |
| 2026-11-13 | SNAP-20261113-IPA-P6-LEARNING-ENGINE | برنامهٔ زیرساخت مالک — P6 بسته شد روی `infra/p6-local-learning-engine`: **موتور یادگیری محلی decision-neutral** در ماژول جدید `:core:learning` — LocalLessonEngine (lifecycle session/encounter/stage، duplicate=no-op با کلید قطعی، manual advance فقط، suspend/resume)، **Evaluator SPI = درز O1** (UnconfiguredEvaluator fail-closed)، TemplateRegistry نسخه‌دار، ProgressionEngine/MasteryEngine/PolicyGate (**PolicyNotApprovedException تا CONTENT-014**)، PrerequisiteGraph (cycle/missing در ساخت)، HintPolicyEngine (ممنوعیت ثبت‌شدهٔ P4/P5)، RecoverySelector، SessionCheckpointManager (resume با version-mismatch رد می‌شود)، DefaultLearningConfigRepository. **Room v3**: lesson_sessions+lesson_attempts (فقط IDs+outcome — CONTENT-018) با MIGRATION_2_3 و recordAttempt در یک transaction (idempotent). **پیش‌نیازها صادقانه ثبت شدند: O1/O3/O2-final هنوز OPEN — هیچ threshold/policy جعل نشد؛ ارزیابی واقعی، golden fixtures واقعی و wiring به UI منتظر O1/O3/CONTENT-014.** ۱۴ تست engine/policy + تست‌های DB همه سبز. شواهد: android:gate PASS، static:all 92/92، repository PASS، schema 3.json. ADR-0044 (API+diagram+seams+uncovered templates). |
| 2026-11-13 | SNAP-20261113-IPA-P5-PACKAGE-ENGINE | برنامهٔ زیرساخت مالک — P5 بسته شد روی `infra/p5-content-package-engine`: **موتور پکیج محتوا** در ماژول جدید `:core:contentpackage` — trust chain منفصل (ECDSA P-256/SHA-256 روی بایت‌های manifest؛ SHA-256 فقط integrity؛ **کلید خصوصی هرگز در APK/Git/Log**؛ production slot خالی و fail-closed)، manifest parser با محدودیت‌های امنیتی، PackageIntegrityVerifier، Validator (schema/minAppVersion)، Loader بدون شبکه (R8 استاتیک)، Activator اتمیک (stage→verify→pointer rename→registry transaction)، RollbackManager، Resolvers با Absent صادقانه. **Room v2 با اولین migration واقعی** (content_packages؛ تست مهاجرت با بازسازی v1 از schema 1.json و validate در برابر entityهای v2 — روش builder مستقیم). **۳۳ تست سبز** شامل ماتریس امنیتی کامل (wrong-key/unknown-keyId/tampered/missing/duplicate/traversal/oversize/unsupported-schema/crash-rollback/airplane/deterministic). **مرز صادقانه: O2/O7 هنوز OPEN — schema فقط PROPOSED (ADR-0043 §2)؛ هیچ پکیجی در release/debug نیست؛ fixtureها فقط در تست با کلید ephemeral.** شواهد: android:gate PASS، static:all 92/92، repository PASS، schemas/2.json committed. فاز متوقف شد تا تصمیم O2/O7 مالک. |
| 2026-11-13 | SNAP-20261113-IPA-P4-ROOM | برنامهٔ زیرساخت مالک — P4 بسته شد روی `infra/p4-room-persistence`: **O4 APPROVED** و LocalLearningDatabase in-memory با consumer-proof حذف و با **Room 2.8.5 واقعی** (KSP 2.3.13) جایگزین شد — ۵ جدول real-need (station_packages/progress_projections/outbox_operations/audio_assets/migration_metadata)، FKها عمداً غایب (توجیه ADR-0042)، schema 1.0.json committed، قراردادها در core:model و پیاده‌سازی در core:database، دو transaction اتمیک (activatePackage + completeAccepted/Server-Wins)، CONTENT-008 در لبهٔ persistence (guard مشترک core:common). Rewire کامل: sync engines فقط core:model، AudioCache از allowlist خارج شد (۶→۵)، AppContainer دیتابیس واقعی. **تست‌های Robolectric 9/9 روی SQLite واقعی**: process-death reopen، downgrade reject، foreign-schema reject، concurrency ۶۰ نویسنده، اتمیک epilogue، guard. دو یافتهٔ پژوهی: WAL در Robolectric/Windows شکست connection دوم (تست‌ها TRUNCATE؛ production WAL) و فایل corrupt بی‌صدا init می‌شود (اثبات device به instrumented موکول؛ گیت استاتیک R7 جایگزین). زیرساخت میزبان: mirror aliyun-gradle-plugin خراب حذف و proxy Hiddify خاموش کامنت شد (هر دو با backup). شواهد: android:gate PASS (3m)، static:all 92/92، foundation/repository PASS. |
| 2026-11-13 | SNAP-20261113-IPA-P3-NATIVE-INFRA | برنامهٔ زیرساخت مالک — P3 بسته شد روی `infra/p3-native-infra` (زیرساخت Native؛ بدون بازطراحی UI): **AppGraph** = composition root صریح (applicationScope با SupervisorJob + dataStoreScope مالک‌دار؛ scope بی‌نام DataStore حذف)، **ShomaraAppStartup** (essential در onCreate؛ deferred فقط-id و lazy — هیچ انتظار روی محتوا/صوت/CMS)، **ShomaraErrorModel** سه‌لایه (Domain/Data/Presentation روی AppError کاننیکال؛ ShomaraRetryPolicy با اعداد موجود sync؛ فقط identifier در لاگ)، **ShomaraStateHolder + SingleFlightExecutor** (استخراج single-flight اد-هوک lesson host) با تست‌های JVM قطعی (duplicate/cancel/independence/supervisor — یافته: advanceUntilIdle در coroutines-test 1.8.1 باک‌گراونداسکوپ را تخلیه نمی‌کند؛ با probe اثبات و با اسکوپ مالک‌دار حل شد)، **verify-android-module-graph.mjs** = گیت ۹۲م static:all (بدون GlobalScope؛ Dispatchers.Main فقط :app؛ feature بدون infra/storage/sync؛ allowlist dated فقط-co shrinking با ۶ entry). سند: ADR-0041 + Module Graph به‌روز + ۶ debt ثبت‌شده. شواهد: android:gate PASS، static:all 92/92، foundation/harness/repository PASS — همگی exit 0. UI دست‌نخورده. |
| 2026-11-13 | SNAP-20261113-IPA-P2-DECISION-PACK | برنامهٔ زیرساخت مالک — P2 بسته شد روی `infra/p2-adr-reconciliation` (فاز معماری؛ بدون بازنویسی کد): **ADR Reconciliation Map** (۲۲ اثر: ADR-0003 SUPERSEDED-IN-PART با یادداشت؛ AGENTS ق5/ق6/§5، START_HERE §7، README، PACKAGE_BOUNDARIES و ۴ خط skill با ارجاع ADR-0039 اصلاح حداقلی شدند؛ roadmap N05-N07 تاریخی حفظ؛ N08-06..12/N09/N10 + ADR-0037-backend قفل اجرا تا O6/O13/O11؛ Duolingo-guardrail به ledger N08R موکول)، **Owner Decision Register v2** (O1–O13 همگی OPEN با trade-off/ریسک چهارگانه/پیشنهاد غیرمصوب + CONTENT-001…018؛ حکمرانی: وضعیت فقط با بیانیهٔ مالک)، Diagram به‌روز (as-built+هدف شرطی)، Phase Gate Matrix (P0 DONE، P1 DONE_WITH_CI_PENDING، P3..P11 BLOCKED با مسدودکنندهٔ صریح)، **۱۶ Forbidden Assumption**. گیت‌ها: static 91/91، repository PASS، harness VALID، diff-check 0 — همگی exit 0. برنامه به‌عنوان Decision Pack متوقف شد؛ فازهای 3–6 تا تصویب O1/O2/O3/O4 اجرا نمی‌شوند. |
| 2026-11-13 | SNAP-20261113-IPA-P1B-BUILD-CHAIN | برنامهٔ زیرساخت مالک — P1b (سخت‌سازی Build/CI) بسته شد روی `infra/p1-ci-stabilization`: پین پلتفرم حالا بر **Package ID در package.xml** است (`platforms;android-37.0` rev2 — با `sdkmanager --list --channel=0` زنده اثبات شد؛ bare android-37 در stable فهرست نمی‌شود)؛ تست‌های رفتاری پین 7/7؛ cacheهای CI با keyهای صریح (OS+wrapper+JDK+SDK+lockfile) و حذف کش مضاعف؛ artifact شامل test-results XML؛ ci.yml concurrency+timeout؛ بنر بلند `NODE_VERSION_MISMATCH` در verify:repository (انحراف محلی v24.22.1 ثبت — رفع با مالک: nvm use 22.22.0)؛ سیاست target API (الزام Play ≥36 از 2026-08-31؛ targetSdk=36 منطبق) و مسیر ارتقای minor در سند. شواهد: gate BUILD SUCCESSFUL 14s، static:all 91/91، vitest 74/565، foundation/harness/repository/preflight/doctor همگی exit 0. اجرای Actions و Run URL تا push مالک BLOCKED (gh نصب نیست). فاز P2 بدون go-ahead شروع نمی‌شود. |
| 2026-11-12 | SNAP-20261112-IPA-P1-CI-STABILIZATION | برنامهٔ زیرساخت مالک (IPA) — فاز P1 بسته شد روی شاخهٔ `infra/p1-ci-stabilization` (از audit/infrastructure-phase0@f0b6823): ریشهٔ قرمزی CI اندروید رفع شد (نصب پکیج upstream `platforms;android-37.0`؛ پکیج bare `android-37` در اندیس گوگل وجود ندارد) + قرارداد preflight دو-چیدمانی (android-37 | android-37.x، همیشه android.jar معتبر)، job required جدید `static-core` در ci.yml (بدون continue-on-error؛ ۶ verifier مرورگری در کد پین‌شده)، artifact diagnostics (فقط گزارش؛ ban دقیق APK/signing در verifier)، تعمیر و فعال‌سازی تست یتیم vitest (۷۴/۵۶۵ سبز)، dependabot + dependency-audit زمان‌بندی‌شده. شواهد: preflight READY، build-tests 7/7، foundation/harness PASS، static:core 85/85، static:all 91/91، repository PASS، doctor READY — همگی exit 0. اجرای واقعی Actions منتظر push مالک است؛ G-06 (emulator CI) به P10 موکول شد. فاز P2 (reconciliation + تصمیم‌های مالک) بدون go-ahead شروع نمی‌شود. |
| M13 | 2026-11-04 | N08-02 blocker بسته شد: TalkBack REAL gesture walkthrough روی امولاتور | da7589f..HEAD | تارگت: تصمیم مالک N08-08 |
| M11 | 2026-11-04 | N08 ممیزی UI/UX کامل + تکمیل تمرین/تنظیمات | ede95ba..d0fd774 | تارگت: تصمیم مالک برای N08-08 |
| 2026-11-04 | SNAP-20261104-N08-05-DONE | N08-05 DONE و **دومین P0 روی دستگاه**: تمام deep linkهای اپ مرده بودند — `ShomaraApp` برای onboarding/shell/lesson الگوی `navDeepLink` ثبت می‌کرد ولی manifest فقط `mathlearning://foundation` را اعلام کرده بود، پس adb می‌گفت «unable to resolve Intent». حالا هر چهار host اعلام شده و `DeepLinkManifestTest` (با negative control) drift را می‌شکند. همچنین **BackHandler صفر بود**: back سیستمی درس را فوراً می‌بست در حالی که دکمهٔ خروج تأیید می‌گرفت؛ حالا هر دو یک مسیر دارند (bar #1 می‌پرسد، bar #2 می‌ماند) و روی دستگاه اثبات شد. tap سریع single-flight شد، `choiceId="opt-1"` قلابی حذف شد، و باگ «مرحلهٔ آخر بی‌نهایت تکرار می‌شد» بسته شد. ۱۳ تست جدید؛ P0 باقی‌ماندهٔ roadmap: هیچ task اجرایی نمانده — بقیهٔ N08 منتظر تصمیم محتوایی مالک است. |
| 2026-11-04 | SNAP-20261104-N08-04-DONE | N08-04 DONE و یک **P0 واقعی که فقط با نصب APK پیدا شد**: اپ اصلاً باز نمی‌شد — `IllegalArgumentException: Navigation destination that matches route onboarding/welcome ...` چون هر مرحلهٔ آنبوردینگ به یک route جدا navigate می‌شد ولی گراف فقط `onboarding` را ثبت کرده بود (ROUTE_REGISTRY: onboarding یک route با مراحل داخلی است). حالا با `AppNavigationRoutes` + `RegisteredRoutesTest` مکانیکی قفل شده و روی دستگاه تأیید شد (pid زنده، بدون FATAL). reduced motion واقعی شد (پس‌زمینهٔ سیستمی + انتخاب کودک، هر یک کافی)، celebration gate «بدون هم‌زمانی» را می‌بندد، و **پایداری تنظیمات دیگر قلابی نیست**: قبلاً `onSave` پیام «ذخیره شد» می‌داد بدون هیچ نوشتن؛ حالا DataStore واقعی است. ۳۰ تست instrumented و ۷۰ تست واحد سبز، negative control گرفته شد، APK ساخته/نصب/اجرا شد. |
| 2026-11-04 | SNAP-20261104-N08-03-DONE | N08-03 DONE: نقص برش ۲۰۰٪ رفع شد و روی امولاتور واقعی اثبات شد (۲۶ تست instrumented، failures=0) — و **یک P0 واقعی که ممیزی قبلی اشتباه گفته بود**: `ShomaraTheme` هرگز `LocalLayoutDirection` را Rtl نمی‌کرد، پس روی دستگاه en-US کل رابط LTR رندر می‌شد؛ حالا ریشه RTL است و ریاضی LTR می‌ماند. دو negative control ثابت می‌کند تست‌ها توخالی نیستند. |
| 2026-11-04 | SNAP-20261104-N08-03-PREP | N08-03 آماده‌سازی (بدون تغییر کد): نقص ۲۰۰٪ با اندازه‌گیری واقعی اثبات شد — ShomaraButton در DeviceConfigurationOverride.FontScale(2.0) مقدار didOverflowHeight=true می‌دهد (line0bottom=155px در جعبهٔ 56dp)، یعنی برچسب بریده می‌شود؛ جهت‌دهی ریاضی/RTL از قبل درست و مستند است. |
| 2026-11-04 | SNAP-20261104-N08-02-A11Y-INSTRUMENTED | N08-02 DONE_WITH_BLOCKER: ۱۰ تست instrumented Compose semantics روی امولاتور واقعی سبز شد (Pixel_6a/API37، failures=0)؛ دو باگ دسترسی‌پذیری واقعی در ShomaraButton/ShomaraCard پیدا و رفع شد؛ gesture path واقعی TalkBack صادقانه هنوز NATIVE_PENDING. |
| 2026-11-03 | SNAP-20261103-N08-02-A11Y-STATIC | N08-02 بخش ماشینی: تست جدید a11yRoles — هر کنترل تعاملی V2 باید role+label واقعی داشته باشد (۵۶۴/۵۶۴)؛ gesture path واقعی TalkBack صادقانه NATIVE_PENDING (نیازمند دستگاه). |
| 2026-11-03 | SNAP-20261103-N08-01-LEDGER-AUDIT | N08-13 بسته شد با DONE_WITH_BLOCKER (آپلود UI + rollback در پنل)؛ N08-01 DONE: ممیزی ledger route/state با verifier جدید — ۱۵ route اکسپو + ۱۶ صفحه وب = ۱۰۰٪ طبقه‌بندی در SCREEN_LEDGER.csv (۳۴ ردیف)؛ static 89/89. |
| 2026-11-03 | SNAP-20261103-N08-13-CMS-AUDIO-PANEL | پنل CMS صوت ادمین شروع شد: seed idempotent ۲۳۲ ردیف، ۶ API route با RBAC ادمین، migration 0074 با RLS، UI فارسی RTL، ۸ تست جدید؛ production persistence و TTS واقعی owner-gated. |
| 2026-11-03 | SNAP-20261103-N08-08-LEDGER | فاز N08 شروع شد: ledger کامل ۱۸ disposition در dispositions.ts (۱۴ بسته، ۴ تصمیم مالک باز) + CALIBRATION_V1 نسخه‌دار با rollback؛ verify-phase5 بدون وابستگی به grep سیستم؛ ۱۲ تست جدید؛ n08Resolutions در source-audit ثبت شد. |
| 2026-11-01 | SNAP-20261101-N05-PHASE-CLOSED | فاز N05 بسته شد (۹/۹): shell سه‌تب، گراف مسیر، شروع/پرش ایستگاه، practice hub، Me/settings، مرز والدین؛ ۸ commit اتمی؛ connectedCheck/screenshot/device صادقانه NATIVE_PENDING. |
| 2026-11-01 | SNAP-20261101-N06-PHASE-CLOSED | فاز N06 بسته شد (۱۱/۱۱): مرز سه‌لایه‌ای محتوا، gateway idempotent، player P1..P5، adapters T01/T05/T13/T15، سفر E2E دروازهٔ ST07؛ ۸ disposition CONTENT؛ :app سیم‌کشی شد. |
| 2026-11-01 | SNAP-20261101-N07-PHASE-CLOSED | فاز N07 بسته شد (۹/۹): database/sync واقعی، sync idempotent Server-Wins، manifest اتمی، audio cache، import ۲۳۲ ردیف DRAFT، CMS governance با HG-03؛ connectedCheck/device صادقانه NATIVE_PENDING. |
| 2026-10-31 | SNAP-20261031-N04-PHASE-CLOSED | فاز N04 بسته شد: سه ماژول واقعی network/datastore/onboarding، OTP با مسیرهای منفی MockWebServer، DataStore امن، restore/expiry fail-closed، سیم‌کشی واقعی launch؛ ۷۲ تست جدید؛ connectedCheck بدون device ثبت صادقانه. |

```yaml
file_version: 58
last_updated: 2026-11-07
snapshot_id: SNAP-20261107-N08R-00-START
baseline_commit: ef35ce24fb8023ce0d247d1281cf0166bffb2140
working_branch: native/n08r-ui-polish
working_branch_pushed: false
active_product: SHOMARA
closed_product: AVA
target_client: Android Native (Kotlin + Jetpack Compose)
current_phase: N08R
current_task: N08R-10
phase_status: N08R_GUIDED_DONE__NEXT_ASSESSMENT_PER_OWNER_ORDER
apk_status: DEBUG_APK_BUILT_INSTALLED__LAUNCH_AND_DEEPLINK_VERIFIED
blocked_note: N08-06..12 remain blocked on N08-08 (OWNER_DECISION_PENDING for CONTENT-005/006/007/016). Parallel owner-authorized phase N08R (Duolingo-level UI/UX refinement, mission: design/playbook/N08R_MISSION_FA.md) registered on branch native/n08r-ui-polish from page-17-nav; it must not bypass N08-08 or touch protected screens (Splash, Profile Setup).
```

## 0. تصمیم مالک و مرز کار

- از این snapshot به بعد فقط SHOMARA توسعه می‌یابد.
- AVA بسته است؛ فقط الگوهای مفید معماری/فرایندی آن قابل الهام‌اند و هیچ تغییری در آن انجام نمی‌شود.
- هدف، تبدیل مرحله‌ای کلاینت کودک به Android Native با UI/UX یکپارچه، کد مرتب و gateهای قابل اثبات است.
- Expo فعلی تا cutover حذف نمی‌شود؛ در فازهای Clean کوچک و قابل اجرا نگه‌داری می‌شود و بعد route-by-route جایگزین خواهد شد.

## 1. ترتیب مطالعه

1. `AGENTS.md`
2. همین فایل
3. `node tools/harness.mjs validate`
4. `node tools/harness.mjs next`
5. `docs/roadmap/SHOMARA_NATIVE_ROADMAP_FA.md`
6. فقط قراردادها و کد task اعلام‌شده

برای build/SDK/Gradle/APK از `shomara-android-build`، برای تصمیم UI از `shomara-product-design`، برای token/theme/component از `shomara-design-system`، برای اجرای route از `shomara-screen-execution` و برای curriculum/audio/CMS از `shomara-learning-content` استفاده شود. نام Skillها به مسیرهای `skills/<name>/SKILL.md` نگاشت می‌شود.

انتقال این گفت‌وگو در `docs/delivery/SHOMARA_FINAL_CHAT_HANDOFF.md` مستقل شده است. قرارداد ۱۷ خانواده صفحه در `design/playbook/PAGE_UIUX_BLUEPRINT.md` و وضعیت/وابستگی ۲۰ work item در `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` است.

فایل `ROADMAP_PHASES.md` و goldenهای V1 تاریخی‌اند و هنوز توسط verifierهای legacy خوانده می‌شوند؛ تا مهاجرت verifierها حذف نشوند.

## 2. وضعیت واقعی baseline

بازبینی نهایی: source checkpoint `76e4cf7` از ZIP با SHA-256 تأییدشده بازیابی شد؛ تاریخچهٔ Git بسته نبود و یک baseline محلی جدید برای ثبت اصلاحات ساخته شد. شش تست رفتاری build، verifierهای Android/build/repository/skills/content/design و diff check دوباره PASS شدند. سه فرمان doctor/gate/assemble-debug همچنان `BLOCKED_ENV` هستند. اعداد build/typecheck/Vitest/static جدول زیر شواهد checkpoint پیشین‌اند و در محیط بازیابی‌شده دوباره اجرا نشده‌اند.

مبنای بررسی clone تمیز GitHub در commit `ef35ce2` است.

| بررسی | نتیجهٔ واقعی | وضعیت |
|---|---:|---|
| `npm ci --no-audit --no-fund` | 648 package، exit 0 | PASS |
| `npm run build:packages` | exit 0 | PASS |
| `npm run typecheck:all` | هر 9 workspace، exit 0 | PASS |
| `npx vitest run` | 65 file / 502 test | PASS |
| `npm run verify:static:all` | 75/80؛ تمام 75 gate غیرمرورگری سبز | BLOCKED_ENV |
| N02 static suite | 82/87؛ تمام 82 gate غیرمرورگری از جمله Native/build/content/skill/design governance سبز | BLOCKED_ENV |
| Chromium flows + parity | مرورگر در runner موجود نیست | BLOCKED_ENV |
| Node 22.22 build/typecheck | exit 0 | PASS |
| Node 22.22 Vitest | 65 file / 502 test | PASS |
| Android Native static foundation | ۴ ماژول، wrapper/checksum، CI، navigation، logging/error | PASS |
| Android Native compile/lint/unit | Android SDK 37 موجود نیست؛ Java/Gradle به proxy runner دسترسی ندارد | BLOCKED_ENV |
| Android build harness | doctor/gate/assemble-debug + CI واحد + JSON/SHA-256 report | PASS |

پنج failure باقیمانده فقط verifierهای مرورگری‌اند. تلاش نصب Playwright Chromium به‌علت پاسخ دانلود 0-byte/ZIP ناقص شکست خورد. اشکال release verifier که `apps/mobile/parity/dist-flow` را source تلقی می‌کرد اصلاح شد و اکنون مستقل PASS است.

> **Annotation 2026-10-31 (ZCode run):** اعداد تاریخی ۵۱۸ فایل/۱۷۸۰ یال در این سند و `harness/roadmap.json` (N01-05) مال checkpoint 2026-10-28 هستند و بازنویسی نشدند. شمار فعلی `harness/dependency-map.json` در بازتولید بازبینی‌شدهٔ همین تاریخ به‌روز شد (شواهد خارج از repo: `/tmp/shomara-evidence-2026-10-31`). در همان اجرا: `android:gate` با نصب موجود platform 37 روی ماشین محلی PASS شد (رفع خطای lint واقعی themes.xml با qualifier values-v27) و `verify:static:all` با parity کامل 87/87 PASS شد؛ سپس N02-07 و فاز N02 طبق شواهد همان اجرا DONE شدند.

## 3. موجودی تأییدشده

| بخش | فایل | حجم تقریبی | تصمیم |
|---|---:|---:|---|
| کل repository بدون `.git/node_modules` | 1399 | 30.5 MB | مبنا |
| `parity-out-expo/` | 125 | 8.35 MB | generated؛ حذف از Git در N00 |
| `docs/` | 367 | 11.8 MB | دسته‌بندی و dedupe در N01 |
| `docs/design-handoff-2026-10/` | 192 | 10.7 MB | legacy reference؛ تا مهاجرت verifier حفظ |
| `project-design-v2/` | 91 | 3.32 MB | asset pipeline فعال؛ حذف نشود |
| `apps/mobile/src/ui/v1` | 31 | 63 KB | مصرف‌کنندهٔ زنده؛ بازنشستگی در N01/N09 |
| `apps/mobile/src/ui/v2` | 10 | 45 KB | مرجع رفتاری موقت؛ منبع نهایی Native نیست |

## 4. چک‌لیست فاز تکمیل‌شده N00

- [x] clone مخزن اصلی و ثبت commit/branch
- [x] نصب تمیز و baseline build/typecheck/test
- [x] inventory حجم، routeها، V1/V2 و اسناد
- [x] حذف `parity-out-expo/` از Git: 125 فایل / حدود 8.35 MB؛ قابل بازیابی از history یا build
- [x] تقویت و dedupe `.gitignore`
- [x] حذف handoff منسوخ V1 و اصلاح تمام ارجاع‌های فعال
- [x] اصلاح release verifier برای نادیده‌گرفتن generated parity output
- [x] ایزوله‌کردن تست OTP؛ صفر درخواست شبکهٔ واقعی در unit test
- [x] ایجاد roadmap رسمی Native و route migration matrix
- [x] اجرای دوبارهٔ build/typecheck/Vitest/release gates
- [x] اجرای Node 22: build/typecheck و 503/503 تست PASS
- [ ] Chromium flows/parity — `BLOCKED_ENV` با خطای دانلود ثبت‌شده

**نتیجهٔ N00:** `DONE_WITH_BROWSER_ENV_BLOCKER`. artifact تولیدی track نیست؛ فایل‌های canonical یک‌مسیره‌اند؛ build/typecheck/503 تست و هر 75 gate غیرمرورگری PASS است؛ پنج gate مرورگری صادقانه BLOCKED مانده‌اند.

## 5. فاز تکمیل‌شده N01 — Clean Architecture & Repository Structure

- [x] `N01-01` حذف چهار root artifact بدون مصرف
- [x] `N01-02` pin کردن Node 22.22 و هم‌راستاسازی package/lockfile
- [x] `N01-03` ایجاد harness، schema، file ledger، worklog و `ZCODE.md`
- [x] `N01-04` ثبت repository map و package boundaries
- [x] `N01-05` تولید consumer/dependency map: ۵۱۸ فایل، ۱۷۸۰ یال، ۲۲ مصرف‌کنندهٔ خارجی برای هر یک از V1/V2، صفر deep workspace import
- [x] `N01-06` ایجاد index اسناد و طبقه‌بندی current/legacy/history
- [x] `N01-07` ثبت token source موقت واحد، codegen مقصد و ترتیب بازنشستگی V1/V2
- [x] `N01-08` حذف `PathBanner.tsx` با zero-consumer proof؛ حفظ چهار candidate مصرف‌شده توسط verifier
- [ ] `N01-09` بازنشستگی کامل V1/goldens — `BLOCKED` تا مهاجرت consumer و Chromium
- [x] `N01-10` گیت نهایی و package checkpoint — `DONE_WITH_BROWSER_ENV_BLOCKER`

فهرست taskها، dependencyها، مسیرهای مجاز و acceptance criteria در `harness/roadmap.json` است. خروجی `node tools/harness.mjs next` بر حدس مدل اولویت دارد.

**نتیجهٔ N01:** `DONE_WITH_BLOCKER`. build/typecheck و ۶۵ فایل/۵۰۲ تست با Node 22.22 PASS؛ repository/release/dependency gateها PASS؛ static برابر ۷۶/۸۱ است و پنج gate مرورگری به‌علت نبود Chromium مسدود مانده‌اند.

## 6. فاز جاری N02 — Android Native Foundation

- [x] `N02-01` ADR-0036 و HG-01: حفظ `com.mathlearning.app`، حداقل Android 7.0 / API 24
- [x] `N02-02` Gradle 9.6 wrapper با SHA-256، AGP 9.4.0 و version catalog بدون نسخهٔ dynamic
- [x] `N02-03` ساخت `app`، `core:common`، `core:model` و `core:testing` با مرزهای مستند
- [x] `N02-04` composition root دستی، error taxonomy و logger با حذف کلیدهای حساس؛ source test اضافه شد
- [x] `N02-05` single-activity Compose، placeholder route، deep link و source test بازیابی navigation
- [x] `N02-06` CI کم‌دسترسی روی Ubuntu 24.04، نصب صریح SDK 37، preflight، wrapper validation و test/lint/compile؛ بدون signing یا انتشار artifact
- [x] `N02-08` ممیزی کامل content originals و ۱۸ conflict/decision/boundary، ادغام در فازها، استانداردسازی `design/`، `content-library/` و `skills/`
- [x] `N02-09` تبدیل الهام Duolingo/AVA/UIUXProMax/Clay به guardrail، ایجاد Design System Skill و component readiness contract
- [x] `N02-10` بازخوانی عمیق هر ۱۰ original، ثبت `CONTENT-013..018` و تثبیت authoring/published/client و audio/CMS lifecycle
- [x] `N02-11` قفل UI/UX تمام ۱۷ خانواده صفحه، ترتیب U0–U6، backlog بیست‌ردیفی و بستهٔ انتقال مستقل
- [x] `N02-12` build harness واحد، Skill تخصصی Android، CI هم‌مسیر، گزارش ماشینی و debug APK با hash
- [x] `N02-07` اجرای واقعی compile/lint/unit — `DONE` در 2026-10-31: نخستین اجرای واقعی Gradle روی ماشین مالک (JDK 17 + `D:\SDK` با platform 37)؛ lint خطای واقعی `themes.xml` را گرفت که با qualifier `values-v27` رفع شد و `npm run android:gate` = PASS (exit 0)؛ debug APK عمداً ساخته نشد (task صراحتاً مجوز نداد)؛ instrumentation همچنان به فاز دارای emulator/device موکول است.

پنج Skill پروژه فقط در `skills/<name>/` قرار دارند و `agents/openai.yaml` معتبر دارند: چهار Skill طراحی/اجرا/محتوا و یک Skill مستقل build. `design/MASTER.md` قرارداد برند/UX V3، `INSPIRATION_GUARDRAILS.md` مرز adopt/adapt/reject و `COMPONENT_READINESS.md` قرارداد componentهای N03 را تعریف می‌کند. ۱۵ route زنده در `design/playbook/ROUTE_REGISTRY.md` ثبت شده‌اند. هر ۱۷ خانوادهٔ صفحه outcome/focal/CTA/depth/state اختصاصی دارد و ۲۰ work item Native با dependencies/evidence صریح، تا اجرای واقعی در وضعیت `NATIVE_PENDING` نگه داشته شده‌اند.

محیط Android اکنون build harness قابل‌تکرار دارد: `npm run android:doctor` برای readiness، `npm run android:gate` برای test/lint/compile و `npm run android:assemble:debug` برای gate + APK. workflow روی `ubuntu-24.04` و Node 22 پین شده، `platforms;android-37` را صریح نصب می‌کند و همان gate محلی را اجرا می‌کند. گزارش‌ها generated و خارج از Git هستند؛ APK موفق فقط با مسیر/اندازه/SHA-256 پذیرفته می‌شود. در runner ممیزی قبلی JDK 17 سبز بود اما SDK root/platform 37 وجود نداشت؛ در 2026-10-31 همین harness روی ماشین مالک (با SDK موجود) به PASS واقعی رسید.

`content-library/originals/**` شامل ۱۰ فایل byte-protected است: مطالعهٔ ۲۵ بخش/۱۵۰ صفحه، معماری ۱۰۰ مهارت، ۱۵ pattern و ۲۳۲ ردیف metadata صوت. فقط ST07 spec کامل دارد؛ ۲۴ ایستگاه دیگر هنوز باید تولید شوند. ممیزی canonical در `content-library/integration/SOURCE_AUDIT.md`، مرز سه مدل/lifecycle در `AUTHORING_CONTRACT_GAPS.md` و مالکیت فازها در `PHASE_INTEGRATION.md` است. هیچ original، صوت واقعی یا محتوای production فعال نشده است.

**نتیجهٔ نهایی N02 (2026-10-31):** هر ۱۲ task پیاده‌سازی شد. `N02-07` با نخستین اجرای واقعی Gradle بسته شد: doctor = READY و gate (test/lint/compile) = PASS با exit 0 روی ماشین مالک (JDK 17 Temurin + `D:\SDK` با platform 37)؛ lint در همان اجرا یک خطای واقعی (`themes.xml`، نیازمند API 27) را آشکار کرد که با qualifier `values-v27` رفع شد. debug APK عمداً ساخته نشد (task صراحتاً مجوز نداد) و instrumentation/emulator به فازهای بعدی موکول است. N03 فقط با go-ahead صریح مالک و از `N03-01` شروع می‌شود.

## 6b. فاز جاری N03 — Native Design System V3 (U0 انجام شد)

- [x] `N03-01` Token schema و codegen TypeScript/Kotlin — `DONE` در 2026-10-31: codegen تک‌منبعی `tools/token-codegen/generate.mjs` که فقط بلاک canonical `v2` از `packages/design-system/src/tokens.json` را می‌خواند (ADR-0037 L6)؛ خروجی‌های generated: `packages/design-system/src/tokens.generated.ts` و `apps/android/core/designsystem/src/main/kotlin/com/mathlearning/core/designsystem/ShomaraTokens.kt` (مقادیر خام Compose؛ اتصال ماژول Gradle در `N03-02`)؛ drift gate با `--check` (TOKEN_DRIFT: PASS) و تست `packages/design-system/src/codegen.drift.test.ts` (۶ تست). هیچ مقدار v1 یا کپی JSON دومی وارد Native نشد.
- [x] `N03-02` ShomaraTheme و typography RTL — `DONE` در 2026-10-31: ماژول `:core:designsystem` در Gradle سیم‌کشی شد (library + compose compiler، compileSdk 37/minSdk 24/JDK 17) و به لیست verify-android-foundation (۵ ماژول) افزوده شد؛ `ShomaraTheme.kt` با نگاشت slot-by-slot از ShomaraTokens (colorScheme، Typography با وزن‌های v2، Shapes از radius، clay چهار سطحی، و معنای جهت: پیش‌فرض RTL رابط در برابر LTR ریاضی)؛ هر مقدار از token می‌آید، صفر magic value؛ `FontFamily.Default` موقت است چون فایل‌های Vazirmatn در repo نیست و دانلود ممنوع (L10) — منتظر asset مالک؛ `:core:designsystem:test` و `lint` = PASS با ۷/۷ تست.
- [x] `N03-03` Button/Input/OTP primitives — `DONE` در 2026-10-31: سه primitive با state matrix کامل، duplicate-tap guard، کاهش عمق clay در pressed، خطای متنی actionable، و OTP با پیشرفت LTR صریح در صفحهٔ RTL؛ ۱۴ تست JVM جدید (مجموع ۲۱).
**نتیجهٔ نهایی N03 (2026-10-31):** هر ۸ task اجرا شد (۷ DONE + N03-07 با DONE_WITH_BLOCKER). گیت‌های ماشینی همه سبزند (۵۶ تست JVM ماژول، android:gate، static 87/87 با verifier جدید صفر-raw-token). HG-02 با دستور مستقیم مالک تأیید شد؛ شواهد screenshot/device (Paparazzi در cache آفلاین نیست) و asset فونت Vazirmatn به‌عنوان ورودی باز باقی‌اند. ثبت کامل: `docs/design/NATIVE_COMPONENT_READINESS_N03.md`.

## 6c. فاز جاری N04 — Auth & Onboarding (Native)

- [x] `N04-01` قرارداد state و route onboarding — `DONE` در 2026-10-31: سه ماژول واقعی Gradle سیم‌کشی شد (:core:network با okhttp/mockwebserver، :core:datastore با datastore-preferences، :feature:onboarding با compose)؛ قرارداد حالت‌ها (New/Restoring/Recover/Error)، مسیرهای canonical و ماشین AuthSession با تست (۷/۷)؛ ورود مهمان در production با ثابت قراردادی ممکن نیست؛ restore با وضعیت Authenticated fail-closed می‌شود.
- [x] `N04-02` Welcome و phone input — `DONE` در 2026-10-31 (اعتبارسنجی فارسی با نرمال‌سازی ارقام و پیشوندها، back map قطعی، ۶ تست جدید).
**نتیجهٔ نهایی N04 (2026-10-31):** هر ۷ task با ۶ commit اتمی بسته شد. سه ماژول واقعی Gradle (:core:network با OkHttp/MockWebServer، :core:datastore با DataStore واقعی، :feature:onboarding با Compose) و مسیر launch واقعی (NavHost از ONBOARDING با deep link؛ ورود موفق به FOUNDATION). ۷۲ تست سه‌ماژوله (network 11، datastore 6، feature 40) + تست navigation اپ. `connectedCheck` اجرا نشد (بدون AVD) — ثبت صادقانه؛ شواهد device در فاز بعد. مسیرهای منفی شبکه با MockWebServer پوشش کامل دارند.

## 6d. فاز جاری N05 — Child Shell, Path, Practice & Profile

- [x] `N05-01` Child shell و tab navigation — `DONE` در 2026-11-01: shell سه‌تب canonical در `:app` با حفظ state واقعی هر تب (saveState/restoreState)، re-select بی‌اثر، Back قطعی، deep link هر تب؛ پنج ماژول واقعی Gradle سیم‌کشی شد (13 ماژول در verifier).
- [x] `N05-02` Path graph و chapter bands — `DONE` در 2026-11-01 (نگاشت state فقط از progress سرور، یک Current واحد، برچسب TalkBack صریح، ۵ باند فصل؛ ۹ تست).
- [x] `N05-09` Station/chapter metadata — `DONE` در 2026-11-01 (ST01..ST25 ثابت از stations-index، عنوان‌ها provisional و بدون ادعا، برچسب ساختاری فصل‌ها؛ CONTENT-004 برای UI بسته شد — تغییر نام نهایی ورودی غیرمسدودساز مالک می‌ماند).
**نتیجهٔ نهایی N05 (2026-11-01):** هر ۹ task با ۸ commit اتمی بسته شد. پنج ماژول واقعی Gradle (path/practice/profile/settings/parent)، shell سه‌تب با حفظ state واقعی، گراف مسیر ۲۵ ایستگاه/۵ فصل از کاتالوگ canonical (CONTENT-004 برای UI بسته — IDs ثابت، عنوان‌ها provisional)، شروع ایستگاه/پرش با CTA واحد، practice hub بدون دادهٔ ساختگی، Me/avatar/settings با lifecycle واقعی، مرز والدین با re-auth fail-closed. ۱۱۰+ تست JVM جدید در کل فاز؛ screenshot/device همچنان NATIVE_PENDING (پروتکل readiness).

## 6e. فاز جاری N06 — Learning Player & Server Truth

- [x] `N06-01` تطبیق API/contract player و schema — `DONE` در 2026-11-01 (مرز سه‌لایه‌ای authoring→published→child با stripper و snapshot tests؛ ۱۳ تست Vitest).
- [x] `N06-09` Typed authoring staging schema و validator — `DONE` در 2026-11-01 (review-role/DAG/hint-ban validators؛ publish فقط با APPROVED+۴ نقش).
- [x] `N06-11` Authoring/published/client projection boundary — `DONE` در 2026-11-01 (آینهٔ Kotlin با ۸ تست؛ telemetry حداقلی؛ behavior ID typed).
- [x] `N06-02` Lesson chrome و lifecycle — `DONE` در 2026-11-01 (progress سرور-محور، close confirm fail-safe، checkpoint واقعی DataStore؛ ۸ تست).
- [x] `N06-03` Teach و guided practice — `DONE` در 2026-11-01 (P1 بدون فشار؛ P2/P3 با submit محدود و hint محدود؛ نتیجه فقط از سرور).
**نتیجهٔ نهایی N06 (2026-11-01):** هر ۱۱ task با ۵ commit اتمی بسته شد. مرز سه‌لایه‌ای authoring→published→child با stripper و snapshot tests (۱۳ Vitest + ۸ JUnit)، LessonGateway با idempotency قطعی و MockWebServer، سفر ST07 از teach تا result با قطع میانه و resume دقیق، `nonProductionDraft=true` ثابت، ۸ disposition CONTENT در source-audit.json، و سیم‌کشی واقعی :app (مسیر lesson با deep link). ۵۶ تست lesson+app؛ connectedCheck/screenshot/device همچنان NATIVE_PENDING.

## 6f. فاز جاری N07 — Offline, Sync, Audio & CMS-ready Content

- [x] `N07-01` Room/DataStore schema و migration policy — `DONE` در 2026-11-01 (۴ جدول محلی، مهاجرت v1→v2 با حفظ ردیف‌ها، downgrade/corrupt fail-closed، رد فیلدهای ممنوعه قبل از persistence؛ ۶ تست).
- [x] `N07-02` Offline repository و sync queue — `DONE` در 2026-11-01 (backoff نمایی + jitter، حفظ key، قرنطینه 4xx، Server-Wins با تست؛ ۶ تست).
- [x] `N07-03` Versioned content manifest — `DONE` در 2026-11-01 (SHA-256 + schema gate قبل از نوشتن، rollback با حفظ نسخه فعال؛ ۶ تست جدید).
**نتیجهٔ نهایی N07 (2026-11-01):** هر ۹ task با ۴ commit اتمی بسته شد. ماژول‌های واقعی :core:database و :sync (۱۶ ماژول)، sync idempotent با Server-Wins، manifest اتمی SHA-256، audio cache با fallback متنی، importer ۲۳۲ ردیف DRAFT، CMS governance با HG-03 APPROVED و ۸+۳ disposition CONTENT در source-audit.json. ۵۶+ تست JVM جدید و ۹ تست Vitest. connectedCheck/device/real-backend همچنان NATIVE_PENDING.

## 7. تصمیم‌های محافظت‌شده

- فارسی/RTL و Android-first.
- shell کودک: «مسیر / تمرین / من» تا تصمیم صریح دیگر.
- Phone OTP تنها onboarding production؛ ParentGate مستقل اضافه نمی‌شود.
- Learning Truth، progression، mastery و Station Pass از پکیج bundle + ارزیاب محلی نسخه‌دار (ADR-0039)؛ جزئیات evaluator تا تصویب O1 و CONTENT-014 باز است.
- Challenge / Mastery / Station Pass مفاهیم جدا.
- answer key/evaluator خارج از child client.
- بدون stars/lives/punitive streak/coin/loot box/store/leaderboard.
- یک Design System canonical و یک learning engine.

## 8. Blockerها و موارد تأییدنشده

- Chromium در runner فعلی نصب نیست.
- Node 22.22 با runner موقت اجرا و تأیید شد؛ Node پیش‌فرض میزبان همچنان 24 است.
- Android preflight (runner ممیزی 2026-10-28): JDK 17 `PASS`؛ Android SDK root و platform 37 `FAIL`. — **رفع شد در 2026-10-31**: روی ماشین مالک `D:\SDK` با platform 37 موجود است و gate واقعی PASS شد.
- Gradle wrapper در runner ممیزی distribution را نگرفت (`Network is unreachable`). — **رفع شد در 2026-10-31**: روی ماشین مالک distribution 9.6.0 با checksum پین‌شده دانلود و gate کامل اجرا شد.
- تست دستگاه واقعی، TalkBack، font scaling و child/educational QA انجام نشده است.
- مسئله‌های `CONTENT-001` تا `CONTENT-018` طبق source audit باز/محافظت‌شده‌اند؛ به‌ویژه جهت نوشتن ۱، jump/hint policy، mastery/unlock، schema typed، audio lifecycle، curriculum scope و telemetry باید در فاز مالک حل شوند.
- هیچ ادعای APK/AAB یا production readiness وجود ندارد.
- debug APK ساخته نشده — نه به‌علت blocker محیطی، بلکه چون متن task صراحتاً مجوزش را نداده است؛ release/signing همچنان N10/HG-05 است.

## 9. تاریخچهٔ کوتاه مسیر جدید

| تاریخ | snapshot | نتیجه |
|---|---|---|
| 2026-10-28 | SNAP-20261028-NATIVE-P00-01 | AVA بسته شد؛ SHOMARA تنها scope؛ N00 با حذف 125 artifact، canonical docs، اصلاح release verifier و تست OTP ایزوله تکمیل شد؛ 503/503 تست PASS؛ Chromium blocked. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-01 | N01 checkpoint 1: چهار root artifact حذف؛ Node pin؛ harness با 11 فاز و task graph؛ file ledger، repository map و package boundaries اضافه شد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-02 | N01 checkpoint 2: dependency map تکرارپذیر، docs index، phase checklist، Design System migration plan و نخستین dead-code batch تکمیل شد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N01-FINAL | N01 بسته شد؛ تمام gateهای غیرمرورگری سبز، ۵ browser gate مسدود؛ بستهٔ source checkpoint آماده؛ N02 منتظر HG-01 است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-FOUNDATION | DESIGN Native-ready شد؛ ۴ ماژول Native، toolchain pin، CI، logging/error، navigation/deep link و تست‌های پایه ایجاد شد؛ گیت کامل Android به SDK/proxy محیط مسدود است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-CONTENT-FOUNDATION | ده original با checksum حفظ شد؛ content source audit و phase integration ثبت شد؛ سه Skill مستقل و نام‌گذاری lowercase/kebab-case ایجاد شد؛ N02 فقط به gate واقعی Android مسدود است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-DESIGN-GOVERNANCE | Skill چهارم برای Design System، metadata چهار Skill، guardrail الهام و readiness matrix پیاده شد؛ N03 همچنان تا gate واقعی Android شروع نشده است. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-CONTENT-CONTRACTS | هر ۱۰ original دوباره ممیزی شد؛ سه مدل محتوایی، دو lifecycle و شش issue جدید به چهار task اجرایی N02/N06/N07/N08 تبدیل شد؛ originalها دست‌نخورده و N03 بسته ماند. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-ENVIRONMENT-HARDENING | preflight fail-closed، نصب صریح SDK 37 و runner پین‌شده به CI افزوده شد؛ blocker با evidence دقیق SDK/cache/network ثبت و N03 عمداً شروع نشد. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-FINAL-UIUX-HANDOFF | قرارداد اختصاصی ۱۷ خانواده صفحه، ترتیب U0–U6 و ۲۰ work item Native قفل شد؛ Skill/route/verifier/harness متصل و handoff مستقل ساخته شد؛ N03 همچنان عمداً پشت N02-07 ماند. |
| 2026-10-28 | SNAP-20261028-NATIVE-N02-BUILD-HARNESS | build محلی و CI به doctor/gate/assemble-debug واحد منتقل شد؛ گزارش JSON و SHA-256، Skill تخصصی و resume report اضافه شد؛ SDK 37 تنها blocker باقی ماند. |

| 2026-10-28 | SNAP-20261028-NATIVE-N02-BUILD-HARNESS | build محلی و CI به doctor/gate/assemble-debug واحد منتقل شد؛ گزارش JSON و SHA-256، Skill تخصصی و resume report اضافه شد؛ SDK 37 تنها blocker باقی ماند. |
| 2026-10-31 | SNAP-20261031-N02-CLOSED | N02 با PASS واقعی `android:gate` بسته شد (رفع خطای lint واقعی themes.xml با values-v27)؛ چهار فیکس P0 فاز ۱ Track A (allowlist answer-key، lifecycle provenance، fail-closed dev identity، حذف کپی ستاره) و هاردنینگ verifierها؛ Vitest 67/514، static 87/87، parity 29/29. |
| 2026-10-31 | SNAP-20261031-N03-U0-01 | checkpoint N02/P0 با commit `0ca03ea` ثبت شد؛ debug APK واقعی ساخته و تأیید شد (PASS، 12,030,634 bytes، SHA-256 06007f6a…)؛ شاخهٔ `native/n03-design-system` ساخته شد و U0/`N03-01` (token codegen TS/Kotlin + drift gate) با تست و گیت سبز بسته شد. |
| 2026-10-31 | SNAP-20261031-N03-DS-02 | commit `26f0de5` (N03-01)؛ `:core:designsystem` سیم‌کشی و کامپایل شد؛ ShomaraTheme/typography/clay/direction با صفر magic value پیاده و ۷ تست JVM سبز شد؛ گیت ماژول، android:gate و کل سوئیت PASS؛ N03-02 به‌صورت DIFF_READY. |
| 2026-10-31 | SNAP-20261031-N03-PHASE-CLOSED | فاز N03 با ۶ commit اتمی بسته شد (ShomaraTheme، Button/OTP، Card/Feedback، Navigation/Dialog/Audio، Manipulatives، Catalog + گیت صفر-raw-token)؛ ۵۶ تست JVM؛ دو blocker صادقانه: HG-02 و screenshot/device (NATIVE_PENDING). |

## 10. کار بعدی دقیق

`N02-07` و فاز `N02` در 2026-10-31 با شواهد PASS واقعی بسته شدند (اینجا و `harness/WORKLOG.md`). N03 با go-ahead مالک از `N03-01` (U0) شروع شد و همان task با شواهد بسته شد؛ N03-02 (ShomaraTheme و typography RTL) با شواهد بسته شد؛ تغییرات آن DIFF_READY و بدون commit است؛ فاز N04 نیز بسته شد (۷/۷)؛ گام بعدی `N05-01` است و فقط با go-ahead مالک شروع می‌شود. برای ادامه از چت جدید: `node tools/harness.mjs validate` و سپس `node tools/harness.mjs next` (اکنون `N03-01 [TODO]` را نشان می‌دهد) و `node tools/harness.mjs task N03-01`. اگر debug APK خواسته شد، فقط `npm run android:assemble:debug` معتبر است؛ release/AAB/signing تا N10/HG-05 ممنوع می‌ماند.

## 11. قفل مسیر Track A (ADR-0037، ۲۰۲۶-۱۰-۳۰)

این بخش مسیر موازی بتای قابل‌نصب را ثبت می‌کند. تا وقتی Track A در harness ثبت نشده (L17)، خروجی `node tools/harness.mjs next` پس از بسته‌شدن N02 اکنون `N03-01` را نشان می‌دهد و کار Track A فقط مطابق ADR-0037 انجام می‌شود.

**تصمیم‌های قفل‌شده (L1 تا L17):** در `docs/adr/ADR-0037-installable-beta-track-lock.md`.

- دو مسیر موازی: Track A (Expo beta با backend، فقط P0/P1 و parity) و Track B (Native طبق roadmap).
- مبنای خط کاری: `main@6063c55`. شاخه‌های remote فقط مرجع‌اند؛ تاریخچه‌شان با main نامرتبط است و merge یا rebase روی آن‌ها انجام نمی‌شود.
- اصلاح از شاخه‌ها فقط پس از بازتولید خطا یا نبود قابلیت روی main، با تست و diff جدا.
- ستاره‌ها از UI کودک حذف می‌شوند (قاعدهٔ ۸ AGENTS مقدم بر MASTER §5).
- `apps/web` تا پایان ۱.۱ عمومی منتشر نمی‌شود.
- palette canonical = v2.
- هیچ URL، کلید، keystore یا credential در repo نیست؛ API base از EAS secret تزریق می‌شود.
- APK فقط با مجوز صریح فاز و توسط مالک ساخته می‌شود؛ انتشار داخلی تا M3؛ release تا N10/HG-05 ممنوع است.
- هر فاز شاخهٔ جدا دارد و PASS فقط با فرمان، exit code و evidence معتبر است.

**ورودی‌های باز (I1 تا I6):**

- I1: وضعیت GitHub Actions و branch protection (API در این نشست 403 داد).
- I2: backend با HTTPS، پروژهٔ Supabase، provider OTP و محل نگه‌داری secrets.
- I3: اجرای EAS preview توسط مالک.
- I4: مدل گوشی و نسخهٔ Android.
- I5: تأیید محتوای seed `0035_grade1_staging_seed.sql`.
- I6: اصلاح `baseline_commit` (`ef35ce2` در repo وجود ندارد).

**Milestones:**

- M1: APK متصل به backend روی گوشی مالک. gate: 0.5، 1.1، 1.6 و 2.1 تا 2.4.
- M2: بتای پایدار. gate: فاز ۱ کامل، 2.5، 3.1 تا 3.4، 3.9، 3.10 و I1.
- M3: آماده برای کودکان واقعی. gate: فازهای ۴ و ۶، بازبینی L7 و تأیید مالک.

**چک‌لیست فعال Track A** (وضعیت هر آیتم فقط با evidence تغییر می‌کند):

- فاز ۰ (مستندات): 0.1 ثبت ADR-0037 — انجام شد روی شاخهٔ `docs/phase0-lock-beta-track` · 0.2 وضعیت CI و branch protection — باز (I1) · 0.3 نگاشت شاخه‌ها — انجام شد (ADR-0037، بخش Context) · 0.4 ثبت Track A در harness — پس از بازبینی · 0.5 تعیین backend — باز (I2) · 0.6 عدم انتشار عمومی `apps/web` — فعال (L5)
- فاز ۱ (P0، امنیت و محتوا): 1.1 حذف `expectedIndex` از bundle کلاینت · 1.2 جایگزینی denylist با allowlist در `learning-client-content.ts` · 1.3 یک منبع approval برای TS و SQL · 1.4 محتوای p10 با `DRAFT_*` و `status=ACTIVE` · 1.5 تست یکپارچگی دیتابیس در CI · 1.6 guard برای dev identity در production · 1.7 حذف کپی ستاره و افزودن دو فایل به verifier · 1.8 بازبینی seed (I5)
- فاز ۲ (APK): 2.1 EAS secret برای API base · 2.2 ارتقای RN به ≥ 0.86.2 · 2.3 بیلد توسط مالک (I3) · 2.4 preflight روی بیلد · 2.5 چک‌لیست دستگاه، کپی از `chore/p8-closing` (I4)
- فاز ۳ (پایداری Expo، بدون قابلیت جدید): 3.1 شروع آفلاین ایستگاه · 3.2 نمایش پاسخ صف‌شده · 3.3 resume بر اساس snapshot سرور · 3.4 `normalizeAuthoritativeContent` · 3.5 اندازهٔ مهره‌ها (۷۲ تا ۸۰dp) · 3.6 کنتراست مرز کنترل‌ها · 3.7 مقادیر جادویی `jump.tsx` · 3.8 انتقال v1 به v2 · 3.9 اجرای تست‌های `.tsx` · 3.10 علت شکست parity · 3.11 حذف داده والدین روی سرور · 3.12 حذف `missions` · 3.13 کامنت‌های قدیمی · 3.14 کد مرده
- فاز ۴ (gate و CI): 4.1 `core` به‌عنوان required · 4.2 حذف `continue-on-error` از `visual-and-static` · 4.3 ESLint · 4.4 job بیلد APK دستی · 4.5 تبدیل DoD به verifier و ledger · 4.6 verifierها و parity به بخش required
- فاز ۵ (Native، موازی): 5.1 N02-07 روی runner با SDK 37 · 5.2 ماژول `:core:designsystem` · 5.3 screenshot harness · 5.4 job با emulator · 5.5 DTO و contract tests · 5.6 لایهٔ network، cache و sync · 5.7 U0 تا U6 · 5.8 cutover و release
- فاز ۶ (پیش از کودکان واقعی): 6.1 سیاست حریم و متن پذیرش · 6.2 حذف داده در سرور · 6.3 تصمیم crash reporting و analytics · 6.4 keystore و secrets · 6.5 سیاست نسخه · 6.6 QA کودک، TalkBack، فونت ۲۰۰٪ و process death · 6.7 فقط محتوای approved در production
