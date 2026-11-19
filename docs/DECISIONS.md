# DECISIONS — فشردهٔ ۱۹ ADR

این فایل جایگزین فایل‌های per-ADR است؛ هر بلوک شناسهٔ اصلی ADR را نگه می‌دارد و متن کامل/شواهد از history گیت (`docs/adr/`) قابل بازیابی است.
وضعیت‌ها همان‌گونه که در اصل نوشته شده نقل می‌شوند و تصمیم‌های OPEN حذف نشده‌اند.

| id | title | status |
|---|---|---|
| ADR-0001 | No Unity in V1 | LOCKED |
| ADR-0002 | Semantic Animation Events | ثبت‌نشده در فایل اصلی (بدون خط Status) |
| ADR-0003 | Server-Authoritative Learning Runtime | SUPERSEDED-IN-PART by ADR-0039 (2026-11-13) |
| ADR-0004 | Persian-First Primary Math Design System & Grade 1-6 Architecture | Accepted & Locked (2026-09-25) |
| ADR-0032 | Engagement V1 Foundation | Accepted for implementation after P01 human review |
| ADR-0033 | Android-First Runtime Foundation | Accepted for P02 implementation |
| ADR-0034 | Shared Game-Feel Feedback Contract | Accepted for P03 implementation |
| ADR-0035 | UI v1 بر پایهٔ صفحات طراحی ۲۰۲۶-۱۰ | Accepted (owner decision, 2026-10-14) |
| ADR-0036 | Android Native foundation | Accepted for N02 |
| ADR-0037 | Installable beta track and locked Phase-0 decisions | Accepted (owner instruction, 2026-10-30) |
| ADR-0038 | Splash, launch-state wiring and DEBUG-only simulated OTP (N08-15) | Accepted (owner splash artwork + temporary DEBUG-only OTP simulation, 2026-11-04) |
| ADR-0039 | Fully offline content (bundled package + local evaluator) and Duolingo-copy UI model | Accepted (owner decisions, 2026-11-05: product fully offline, no server; copy Duolingo UI structure) |
| ADR-0040 | UI rule amendments from Duolingo screenshot evidence | Accepted (owner allowed amending rules that block the best UI/UX, 2026-11-05; child-safety economy rules NOT amended — §5) |
| ADR-0041 | Native infrastructure contracts (AppGraph, scopes, startup, error model, state holders) | Accepted (owner-ordered program phase P3) |
| ADR-0042 | Durable learning database (Room/SQLite + DataStore split) — O4 APPROVED | Accepted — O4 APPROVED |
| ADR-0043 | Content Package Engine: trust chain, PROPOSED schema, security report | Engine ACCEPTED as infrastructure; manifest schema = PROPOSED (DRAFT), pending O2 + O7 |
| ADR-0044 | Local learning engine: API, state machine, decision seams (P6) | Engine infrastructure ACCEPTED; learning decisions GATED (O1, O3, CONTENT-014 OPEN) |
| ADR-0047 | Local identity, Parent PIN, and privacy foundation (P10) — **Parent PIN superseded by ADR-0050** | Contracts/backup policy accepted for P10; as-built 2026-11-18: foundation only — identity, durable Parent PIN, ParentGate, full erasure NOT wired |
| ADR-0049 | Design System Library: ClaySurface, LessonKit, PathKit, preview gallery (P13) | ACCEPTED as library infrastructure; superseded in part 2026-11-19 (Home/Path rebuild) |
| ADR-0050 | حذف کامل بخش والدین و قفل والدین | Accepted (2026-11-19) |
| ADR-0051 | حذف presetهای آواتار کودک | Accepted (2026-11-19) |

---

### ADR-0001 — No Unity in V1

**Status:** LOCKED

- V1 هیچ Unity ندارد: نه پروژه، نه runtime، نه content pipeline، نه dependency در repo.
- stack کودک: React Native + Expo + TypeScript، New Architecture + Hermes، Reanimated، Rive (شخصیت و state machine دوبعدی)، Skia فقط برای mini-game با canvas سفارشی.
- محصول exercise-first و game-like است نه اپ بازی مستقل: Learning Objective → Encounter → Game-like interaction → Attempt/Answer → Evaluator → Evidence → Learning State.
- mini-game فقط Experience Form حول encounter واقعی است و engine یادگیری دوم نمی‌شود.

**Rejected / trade-off:** engine بازی سنگین و repo دوم Unity رد شد تا معماری به RN نزدیک بماند و Learning Truth در shared learning platform بماند (Duolingo/Rive فقط الگوی معماری، نه کپی).

### ADR-0002 — Semantic Animation Events

**Status:** ثبت‌نشده در فایل اصلی (بدون خط Status)

- Learning Engine رویداد semantic منتشر می‌کند؛ animation runtime آن را به رفتار بصری map می‌کند.
- قواعد یادگیری renderer-independent می‌مانند؛ نام state machineهای Rive بدون تغییر کد عوض می‌شود.
- fallback دسترس‌پذیری همان outcome را بدون انیمیشن رندر می‌کند و تست‌ها رویداد را بدون گرافیک می‌سنجند.
- ADR کوتاه است: فقط decision + consequences، بدون context/alternative.

### ADR-0003 — Server-Authoritative Learning Runtime

**Status:** SUPERSEDED-IN-PART by ADR-0039 (2026-11-13, P2 reconciliation)

- Learning Truth و گذارها مال Platform runtime است نه کلاینت کودک؛ موبایل فقط state موقت دارد و Learning State/Mastery/Station Pass/دسترسی را نهایی نمی‌کند.
- پیامدها: submit با idempotency key، ارزیابی سمت سرور، Evidence فقط append-only، UI تصمیم را رندر می‌کند نه می‌سازد.
- offline queue فقط transport است؛ reconciliation همچنان server-authoritative و game mechanicها با همان contract قابل تعویض‌اند.

**Rejected / trade-off:** کلاینت به‌عنوان مرجع نهایی رد شد؛ هزینه: شروع station وابسته به backend/canonical content. سرنوشت Backend/Sessions (authoring-CMS یا بازنشستگی) تصمیم باز **O6**.

### ADR-0004 — Persian-First Primary Math Design System & Grade 1-6 Architecture

**Status:** Accepted & Locked (2026-09-25)

- UI کودک فارسی و RTL؛ اعداد آموزشی با ارقام فارسی (۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹)؛ برچسب‌های «ادامه/شروع/تمرین/بررسی کن/دوباره تلاش کن»؛ Vazirmatn (Body 500، Button 600، Heading 700، Hero/Reward 800)؛ پورتال والد و معلم Lite فارسی و غیرقضاوتی.
- Shell پایه ۱ تا ۶؛ تمرکز V1 روی پایه اول با 25 Station و 64 Skill؛ Station 01 («شمارش و الگوها ۰ تا ۱۰») benchmark slice؛ پیچیدگی با سن مقیاس می‌گیرد.
- چهار شخصیت: آریا (Aria)، کیوبو (Qbo)، جیکو (Jiko)، دانا (Dana)؛ هرگز پاسخ/امتیاز/mastery را تعیین نمی‌کنند و فقط به `ANSWER_CORRECT`, `ANSWER_WRONG`, `HINT_OPENED`, `RECOVERY`, `STATION_PASS`, `NEW_LEVEL` واکنش می‌دهند.
- بصری: `#F8FAFC`/`#FFFDF9`، primary `#2563EB`، تن‌های amber/emerald/coral/violet، کارت `rounded-3xl`، دکمهٔ 3D `rounded-2xl`.

**Rejected / trade-off:** anti-distraction — یک visual hero در هر صفحه، بدون رقابت هم‌زمان شخصیت/سوال/گزینه/پیشرفت (هزینه: محدودیت چیدمان). پالت و cast بعداً در ADR-0035 جزئاً supersede شدند.

### ADR-0032 — Engagement V1 Foundation

**Status:** Accepted for implementation after P01 human review

- Learning Runtime مرجع skill evidence/mastery/station pass/progression؛ Engagement downstream: Learning Event → Quest Progress → Reward/Milestone projection.
- V1 بدون leaderboard کودک، currency پولی/قابل معاوضه، streak تنبیهی، reward فقط-login/فقط-time؛ اقتصاد اول earn-only و collection-focused؛ Mission Hub تب اصلی نیست (Path/Practice/Profile).
- Daily Quest = سه، به ترتیب Easy Start / Skill Builder / Meaningful Progress؛ reward روی `(learning_identity, source_type, source_ref, reward_definition)` idempotent.
- Reward Games پیش‌فرض evidence نمی‌سازند؛ Mastery Check تایمر سخت ندارد؛ Mini Game باید Skill target و policy ارزیابی نسخه‌دار را نام ببرد.

**Rejected / trade-off:** هر پیشنهاد ناقض این قواعد `PLAN_REVISION` در roadmap لازم دارد.

### ADR-0033 — Android-First Runtime Foundation

**Status:** Accepted for P02 implementation

- اقتدار: Supabase Auth / PostgreSQL RPCs → state معتبر learning/session/progression → محتوای child-safe → projection محلی + SecureStore + cache.
- production fail-closed (Supabase + bearer)؛ UUID تصادفی در SecureStore، binding سمت سرور، write مستقیم جدول revoke؛ resume = RPC تراکنشی با ownership/provenance.
- Jump Assessment سمت سرور، append-only، idempotent، prerequisite-gated و unlock در همان تراکنش؛ بستهٔ production checksum-verified و بدون answer key.
- StationFlow فقط remote در production؛ محلی فقط fallback غیرمعتبر dev؛ بستهٔ canonical قبل از session کش می‌شود.

**Rejected / trade-off:** شروع station وابسته به backend احراز‌شده + محتوای canonical (جز resume از کش)؛ P02 بدون Supabase زنده و device فیزیکی PASS نمی‌شود.

### ADR-0034 — Shared Game-Feel Feedback Contract

**Status:** Accepted for P03 implementation

- contract مشترک `packages/contracts/src/game-feel.ts`: outcome معتبر → semantic event → character + feedback policy؛ تعامل renderer-local (tap/drag/reveal) فقط feedback.
- semantic: `ANSWER_CORRECT`, `NEAR_MISS`, `ANSWER_WRONG`, `RECOVERY`, `STATION_PASS`, `MILESTONE`, `REWARD_GRANTED` (companion را به‌روز می‌کنند، truth را نه)؛ interaction events هرگز companion/mastery را تغییر نمی‌دهند.
- `semanticEventForOutcome`: correct→`ANSWER_CORRECT`، partial→`NEAR_MISS`، else→`ANSWER_WRONG` (همان در Android StationFlow و Web)؛ `resolveFeedbackPresentation` + بودجه feedback + cue slot haptic/audio + announcement؛ reduced motion پیام را نگه می‌دارد؛ asset صوتی به P12.
- Android: `GameFeelController`, `TactileChoice`, `DraggableToken`, `FeedbackBurst`, `RevealPrimitives`, `ProgressFill`؛ drop بخشنده + `NEAR_MISS` بدون verdict؛ هدف لمسی 48dp × 48dp.

**Rejected / trade-off:** رد شد — fork انیمیشن per-screen، verdict در renderer، تئاتر خطا، feedback فقط صوتی، buzz تنبیهی.

### ADR-0035 — UI v1 بر پایهٔ صفحات طراحی ۲۰۲۶-۱۰

**Status:** Accepted (owner decision, 2026-10-14)

- صفحات `pages-v1` (۱۵ صفحه، `shomara-all-pages.zip`، manifest: `design/handoff-2026-10/pages-v1/manifest.json`) مرجع Child Shell v1؛ ADR جزئاً ADR-0004 (پالت) و CHARACTER-BIBLE-v2 (cast) را supersede می‌کند.
- رنگ از `:root` در `15-design-guide.html`: primary `#2B5C7A`، amber `#E3A33B`، canvas `#F5F7F8` (جایگزین پالت سبز `tokens.json` و مقادیر ADR-0004)؛ فونت Vazirmatn.
- V1 بدون ستاره/جان/streak؛ نوار مسیر فقط «پایهٔ ۱»؛ گرهٔ جاری آیکون کتاب (قابل بازگشت)؛ «دوباره بشنو» با TTS می‌ماند.
- cast نمایشی: Main، Number، Dana، Fandogh، Roka؛ شناسه‌های `aria/qbo/dana/jiko` بعد از بررسی وابستگی حذف؛ صفحه‌های بدون طرح فقط توکن جدید می‌گیرند.

**Rejected / trade-off:** ~۲۶ verifier به UI/رنگ سبز وابسته‌اند و فقط با دلیل به‌روز می‌شوند (D5، گارد ضعیف نمی‌شود)؛ cast قدیمی تا فاز ۸ legacy. Addenda: grade در profile ادغام، کد `۰۹۱۲***۶۷۸۹`، tab bar `outlined` (106px، pill 68x44، border 2px)، waiverهای `scripts/lib/path-waivers.mjs`.

### ADR-0036 — Android Native foundation

**Status:** Accepted for N02

- `applicationId` و namespace = `com.mathlearning.app`؛ min SDK 24، compile 37، target 36، JDK 17، AGP 9.4.0، Gradle 9.6.0 (checksum pin)، Compose BOM 2026.08.00.
- بدون پلاگین `org.jetbrains.kotlin.android` (Kotlin داخلی AGP 9)؛ Compose compiler روی Kotlin 2.4.10؛ نسخه‌های dynamic ممنوع.
- تک activity + Compose navigation، UDF، UI state immutable؛ `app` فقط composition/navigation؛ `core:common`/`core:model`/`core:testing`؛ DI دستی تا ADR بعدی در صورت نیاز.
- Progression/correctness/mastery/Station Pass همچنان server-authoritative.

**Rejected / trade-off:** API 23 و قدیم‌تر پشتیبانی نمی‌شود؛ edge-to-edge و predictive-back اندروید 16 از صفحهٔ اول؛ بدون SDK 37 شواهد build/device BLOCKED (verify ساختاری جایگزین نیست).

### ADR-0037 — Installable beta track and locked Phase-0 decisions

**Status:** Accepted (owner instruction, 2026-10-30: proceed with the suggested path and principles, and lock the chosen path and choices)

- L1–L4: دو track (A: اکسپو beta فقط P0/P1 + parity؛ B: Native هدف)؛ baseline `main@6063c55`، branchهای remote فقط مرجع بدون merge/rebase؛ پورت evidence-first مینیمال با تست؛ حذف ستاره از UI کودک (Phase 1.7).
- L5–L9: `apps/web` تا Phase 1.1 عمومی deploy نمی‌شود؛ پالت canonical design-system v2 (`packages/design-system/src/tokens.json`) با مهاجرت route-by-route؛ ParentGate (START_HERE §7) تا M3؛ حذف `missions` فقط با zero-consumer؛ ارتقا RN ≥ 0.86.2 / Expo ≥ 57.0.9 در Phase 2.2.
- L10–L17: بدون کامیت API URL/Supabase key/keystore/EAS credential (API base = EAS secret)؛ APK فقط با task مجاز و توسط مالک؛ توزیع داخلی تا M3 (بدون `production`/`market-apk`)؛ بدون release APK/AAB قبل N10 و HG-05؛ هر فاز branch + PASS با command/exit code/evidence؛ Phase 0 فقط docs؛ checklist از `chore/p8-closing` کپی؛ Track A تا ثبت در roadmap در `harness next` نمی‌آید (تا آن زمان `N02-07`).
- زمینه و شواهد: 15 route بی‌معادل Native، 20 ردیف backlog همه `NATIVE_PENDING`، 17 branch بی‌تاریخ مشترک (merge-base exit 1)، 648 package، 65 file/502 test، `HARNESS_VALID (99 tasks, 11 phases)`، `verify-apk-preview` 21 checks، `verify:static:all` 86/87، `expectedIndex:1` در chunk web.

**Rejected / trade-off:** Track A تا N09 نگهداری اکسپو اضافه می‌کند؛ I1–I6 (Actions/branch protection، backend، EAS build، دستگاه، seed content، `baseline_commit`) قفل نشده و M1–M3 به آن‌ها گره خورده‌اند.

### ADR-0038 — Splash, launch-state wiring and DEBUG-only simulated OTP (N08-15)

**Status:** Accepted (owner-supplied splash artwork + owner instruction to enable a temporary DEBUG-only OTP simulation, 2026-11-04)

- `SPLASH.png` (941×1672) بایت‌به‌بایت در `core:designsystem/src/main/res/drawable-nodpi/shomara_splash_artwork.png` (sha256 `00e771ad6857e1a0bd97bc15e17440cb7f318905fd3317ca9edf6314162ffbc2`، 1 490 549 bytes) با `ContentScale.Fit` در نسبت 941/1672؛ متن زنده (wordmark «شمارا»، `Body`، `ShomaraProgressBar` 220 dp)؛ cream به token رفت: `v2.color.splashCream` = `#FDF4E5` (نه canvas `#FFF8EF`).
- system splash هم‌رنگ (windowBackground/colorBackground/windowSplashScreenBackground/windowSplashScreenIconBackgroundColor) بدون `core-splashscreen`؛ `ShomaraLaunchController`+`ShomaraLaunchGate` و gate = `AppDestination.LAUNCH`: Resolving→splash، NewUser/RecoverIncompleteProfile→onboarding، RestoringSession→shell، Offline/Error→recovery.
- بدون موفقیت جعلی: `RestoreOutcome.BackendUnavailable` (نه accepted نه refused) و credential حفظ؛ `ServerRejected` پاک می‌شود؛ `NewUserHandoffMs = 600 ms` فقط برای NewUser.
- OTP شبیه‌سازی فقط `src/debug/kotlin` در `:feature:onboarding` + `AuthProviderWiring.kt` (release: `IsDebugBuild = false`، `simulatedProviderFactory = null`)؛ credential `sim-dev-session.<uuid>` رد می‌شود؛ `DevelopmentCode = "1234"` با banner توسعه؛ صفر network call.

**Rejected / trade-off:** ماندن simulation بعد از I2 و حفظ 600 ms باز است؛ شاهد اسکرین‌شات splash نیست؛ `testImplementation(libs.kotlinx.coroutines.test)` (1.8.1) و `RestoreOutcome.BackendUnavailable` طبق rule 11 ثبت شد.

### ADR-0039 — Fully offline content (bundled package + local evaluator) and Duolingo-copy UI model

**Status:** Accepted (owner decisions, 2026-11-05: product fully offline, no server; copy Duolingo UI structure) — supersedes ADR-0003 in part

- محتوا کامل در APK bundle، بدون download/سرور؛ آپدیت فقط با release؛ نسخهٔ package مستقل از app (1.3.0 در 2.1.0)؛ چرخه authoring→review→APPROVED→bundling→release→activation (checksum/atomic/rollback)؛ بدون fallback خاموش؛ «آفلاین» حالت عادی است.
- source of truth = بستهٔ نسخه‌دار/checksum/امضاشدهٔ APK + evaluator محلی (correctness، `nextAction`، mastery، unlock)؛ UI mastery را تصمیم نمی‌گیرد؛ answer key فقط در evaluator، هرگز در projection کودک/DB/log/telemetry (CONTENT-008/018)؛ telemetry فقط ID.
- answer key **OPEN** (سه گزینه: کلید در APK در لایهٔ جدا؛ بدون کلید قابل استخراج با اثبات per-template؛ از پارامتر آیتم)؛ فرمت بسته O2 فقط پیشنهاد: `manifest.json` + `stations/*.json` + `audio/*.opus` + `images/*.webp`.
- کپی ساختاری Duolingo: path تک‌گره مارپیچ، stateهای Fresh/Current/Completed/Perfect/Locked، Current 84dp با ring، node 72dp، نوار 14dp، یک task per card، CTA ثابت، بدون auto-advance/timer؛ RTL فارسی و توکن‌های v2 (canvas `#FFF8EF`، primary `#0C7A54`، amber `#FFB020`).

**Rejected / trade-off:** progress محلی tamperable و شاهد یادگیری نیست؛ بدون sync/recovery؛ حجم APK نامعلوم (متن ~1.2 MB، تخمین صدا ~1.4 MB با Opus 24 kbps)؛ 24 station بی‌نوشته، 232+ خط صدا و 41+ asset ST07 تحویل‌نشده. رد شد: برند/دارایی Duolingo و اقتصاد فشار (جان/streak/لیگ/سکه/shop/chest/quest تایمردار/badge/daily-goal ring) — O10 بدون ADR جدا ممنوع.

### ADR-0040 — UI rule amendments from Duolingo screenshot evidence

**Status:** Accepted (owner granted freedom to amend project rules where they block the best UI/UX, 2026-11-05; the child-safety economy rules are explicitly NOT amended — §5)

- amendment ADR-0039: R1–R3 قاعده را عوض می‌کنند و R4 فقط تأیید شواهد است.
- R1: clay depth روی هر سطح لمسی رندر می‌شود: path node Soft، Current Featured؛ دکمه Soft / Hint (pressed) / Flat (disabled, loading)؛ Ghost Flat؛ فقط از `ShomaraClay.specFor(depth).elevation` + `ClaySoftElevation`/`ClayFeaturedElevation`.
- R2: پیشرفت TalkBack با کلمه: 0 «هنوز شروع نشده»، (0,0.25) «در ابتدای راه»، [0.25,0.5) «یک‌چهارم راه»، [0.5,0.75) «نصف راه»، [0.75,1) «سه‌چهارم راه»، 1 «کامل شد»؛ تست قفل می‌کند که هیچ announcement «درصد» ندارد.
- R3: بازخورد غلط ↺ است نه ×؛ بدون قرمز و بدون تنهایی، کنار جملهٔ کامل.

**Rejected / trade-off:** R4 بدون تغییر (ring ثابت، بدون pulse/reduced-motion gate)؛ اقتصاد کودک (heart/streak/gem/shop/chest/quest/badge/leaderboard/NUDGE/GIFT/countdown) رد است و فقط goal card «X از Y» مجاز؛ checklist 284 (12 تیک، 272 باز)؛ `14.dp`/`8.dp` → `Space12`/`Space8`.

### ADR-0041 — Native infrastructure contracts (AppGraph, scopes, startup, error model, state holders)

**Status:** Accepted (owner-ordered engineering program phase P3 — native infrastructure; no UI redesign; no O1–O13-dependent component)

- `AppGraph : AppContainer`: `applicationScope` (SupervisorJob+Default+CoroutineName از `ShomaraScopes.applicationScope()`) و `dataStoreScope` (SupervisorJob+IO)؛ مالکیت: Application=graph، Screen=`rememberCoroutineScope()`، feature-global ممنوع، `Dispatchers.Main` بیرون `:app` verifier-banned.
- `ShomaraAppStartup`: essential در `onCreate` فقط wire/log (بدون file/network/content/audio/CMS)؛ deferred با id و lazy؛ خطای essential لاگ `startup.essential.failed` و swallow؛ امروز 1 essential (`log-runtime-mode`)، 0 deferred.
- `ShomaraErrorModel`: `AppError` برگ canonical؛ `ShomaraError` سه لایه Domain/Data/Presentation (incident id)؛ `ShomaraRetryPolicy.decide` با اعداد OutboxSyncEngine (750ms base، 300s cap، 8 attempts)؛ لاگ فقط شناسه.
- `ShomaraStateHolder<S>` + `SingleFlightExecutor`؛ `scripts/verify-android-module-graph.mjs` در `verify:static:all` (92 gate): بدون GlobalScope، بدون okhttp3/datastore/core:database/:sync در feature، بدون feature-to-feature، allowlist 6-entry کاهشی.

**Rejected / trade-off:** بدون ViewModel سراسری (per-screen adoption = debt)؛ adoption `AppError`/`ShomaraError`، استخراج interface به `core:model` و یکسان‌سازی ثابت‌های retry = debt باز.

### ADR-0042 — Durable learning database (Room/SQLite + DataStore split) — O4 APPROVED

**Status:** Accepted — owner decision O4 APPROVED (Room/SQLite for structured data; DataStore for light settings; media binaries in app-private storage; Keystore only where a key/secret genuinely requires it)

- Room `:core:database` برای packages/progress/outbox/audio metadata/migration history؛ DataStore برای settings/draft/checkpoint/token؛ media در app-private files (DB فقط `localFileRef`+sha256)؛ Keystore فقط در صورت نیاز (امروز هیچ).
- Schema v1: `station_packages`، `progress_projections`، `outbox_operations`، `audio_assets`، `migration_metadata`؛ FK عمداً حذف (رجیستری مستقل با شناسهٔ خارجی)؛ deferred: Profile (O5)، SkillMastery (O1/CONTENT-014)، Session/Encounter/Attempt (P5).
- `ForbiddenFieldGuard` کلیدهای answer/answerKey/evaluatorConfig/passThreshold/nextStep/reviewer را در هر payload رد می‌کند؛ interface در `:core:model`، پیاده‌سازی `Room*Repository`؛ `activatePackage` و `completeAccepted` تراکنشی؛ `LocalLearningDatabase` (چهار MutableList) حذف.
- fail-closed: بدون `fallbackToDestructiveMigration`، downgrade → `IllegalStateException`، schema بیگانه رد، corrupt → open fail + فایل حفظ؛ Room 2.8.5، KSP 2.3.13، Robolectric 4.17 (SDK 34)، androidx.test:core 1.6.1.

**Rejected / trade-off:** uninstall/clear data بدون recovery (ADR-0039 §5)؛ media خراب → quarantine + text fallback (CONTENT-017)؛ اثبات corruption روی device به فاز instrumented موکول.

### ADR-0043 — Content Package Engine: trust chain, PROPOSED schema, security report

**Status:** Engine ACCEPTED as infrastructure; manifest schema = PROPOSED (DRAFT) — field names NOT final until owner decision O2 (format) and O7 (size budget)

- trust chain: `manifest.sig` (ECDSA P-256/SHA-256، keyId ∈ `TrustedPackageKeys`) بایت‌های `manifest.json` → اعلام هر فایل (path/sizeBytes/sha256) → verify بایت‌به‌بایت (size+SHA-256+بدون فایل اضافه) → activation با re-verify STAGED + atomic pointer flip + registry commit → بستهٔ قبلی برای rollback.
- SHA-256=integrity و signature=authenticity بدون conflate؛ `TrustedPackageKeys.production()` خالی (fail-closed)؛ کلید خصوصی هرگز در APK/Git/log؛ R8: `java.net`/`okhttp3`/`javax.net` ممنوع در `:core:contentpackage`.
- manifest v1 PROPOSED: `packageId` `^[a-z0-9][a-z0-9.-]{1,63}$`، `packageVersion`، `schemaVersion` (فقط 1)، `minAppVersion`، `stations` `^ST[0-9]{2}$`، roots `stations/ audio/ images/`؛ guard: ≤256 KiB، ≤10,000 file، ≤8 MiB هر فایل، ≤64 MiB کل.
- 33 تست: parse امن/سقف‌ها، schema، signature (wrong/unknown keyId/tampered)، hash+length، references، compatibility، stage، flip، rollback، typed exception.

**Rejected / trade-off:** بدون بستهٔ واقعی (asset صفر، fixture in-test)؛ schema وابسته به O2/O7؛ بدون answer-key storage (O1) و بدون wiring به startup؛ staging cleanup / key rotation / corruption proof موکول.

### ADR-0044 — Local learning engine: API, state machine, decision seams (P6)

**Status:** Engine infrastructure ACCEPTED; learning decisions GATED — O1 (evaluator model), O3 (gateway removal) and CONTENT-014 (mastery/unlock/jump policy) remain OPEN, so the engine ships with fail-closed seams and NO invented thresholds

- `:core:learning` (Android-free): `LocalLessonEngine`، `LocalLessonEvaluator` SPI با `UnconfiguredEvaluator` fail-closed، `TemplateRegistry` (version mismatch=fail-closed)، `ProgressionEngine`، `MasteryEngine`، `PrerequisiteGraph`، `HintPolicyEngine` (P4/P5 ممنوع)، `RecoverySelector`، `SessionCheckpointManager`، `VersionedLearningConfigRepository`.
- state: Session CREATED→ACTIVE⇄INTERRUPTED→COMPLETED|ABANDONED؛ Stage P1_DISCOVER→P2_GUIDED→P3_GAME→P4_ASSESSMENT→P5_TRANSFER (advance دستی)؛ resume با checkpoint و gate نسخهٔ قاعده.
- Room v3: `lesson_sessions`+`lesson_attempts` (unique `attemptKey`)، فقط IDs+outcome، `MIGRATION_2_3` + `3.json`؛ `recordAttempt` یک تراکنش و duplicate = idempotent no-op.
- seam: correctness→O1، gateway→O3، mastery/unlock/jump→CONTENT-014 (+CONTENT-011)، hint→CONTENT-003؛ refusal: `UnconfiguredEvaluator`/`PolicyNotApprovedException`؛ determinism روی engine، اثبات per-template وظیفهٔ O1.

**Rejected / trade-off:** بدون evaluator/threshold مصوب/Stage-pass policy/jump policy/app wiring؛ T01 tray، T13 stroke و T05 match نیازمند per-template proof (N08R-09)؛ T11 منتظر O12.

### ADR-0047 — Local identity, Parent PIN, and privacy foundation (P10)

**Status:** Infrastructure contracts / backup policy were accepted for P10; As-built correction (2026-11-18): foundation only — production identity, durable Parent PIN, ParentGate and full erasure are NOT wired

- `ParentPinManager`: PBKDF2WithHmacSHA256، salt 16 بایتی per-record، 210,000 iteration (baseline P10/v1)، constant-time compare، lockout counter، پاک‌سازی buffer، policy `parent-pin-policy:v1`؛ `PinRecord` = salt/hash/counter بدون plaintext.
- NOT WIRED: `ShomaraParentGate(verifier = null)` fail-closed؛ `PinStore` فقط interface (`InMemoryPinStore` در تست)؛ `LocalProfileManager`/`ProfileSlotStore` موجود نیست (O5 OPEN)؛ `PrivacyDataController.deleteAllChildData()` بدون aggregator واقعی Room/DataStore/دایرکتوری و بدون journey حذف.
- backup: `allowBackup=false`، `fullBackupContent=false`، data-extraction rules API-31+؛ `SafeAppLogger` + `SafeDiagnostics.containsPii/scan`؛ debug/release separation + R10 guard.
- KDF: 210,000 حد OWASP نیست — Argon2id (19 MiB، t=2، p=1) یا FIPS PBKDF2 با 600,000؛ انتخاب صریح + benchmark روی ضعیف‌ترین دستگاه + record format/version و migration.

**Rejected / trade-off:** ادعای «حذف کامل داده توسط والد» در privacy declaration مجاز نیست؛ بدون Keystore/pepper؛ HG-05 باز؛ شواهد فقط JVM (run `44308240426` روی `bc9c1b8`: 81 suite/583 test).

### ADR-0049 — Design System Library: ClaySurface, LessonKit, PathKit, preview gallery (P13)

**Status:** ACCEPTED as library infrastructure. No full page redesigned. Home visual remains BLOCKED (handoff not in repo — P12 declaration stands)

- کتابخانه: `ClaySurface`/`shomaraClayAnimated` (Flat/Hint/Soft/Featured، press=scale+sink، shadow فقط سطح، reduced-motion=snap)، `ShomaraIconButton` (48dp)، `OptionCard`، `UnitHeader`/`LessonProgressHeader`، `LessonActionBar`، `HintCard`/`GuideBubble`، `ResultSummary`/`RecoveryCard`.
- `v2.clay.hint` و `v2.clay.flat` به `tokens.json` اضافه و با codegen بازتولید شد؛ resolver هر چهار tier token-driven؛ 6 clay contract test (وزن tier، برابری token، flat بدون shadow، redundant encoding، فقط CURRENT=FEATURED).
- 2026-11-19: PathKit (`ShomaraPathNode`/`ShomaraPathConnector`/`ShomaraPathNodeVisuals`) بازنشسته (renderer دوم با emoji `▶ ★ ✓ ✓✓ 🔒` و Current کهربایی)؛ قراردادش به `ShomaraPathGraphLogic.depthFor` و `ShomaraPathGraphTest` منتقل شد.
- `DesignSystemGalleryActivity` بازنشسته (هرگز در manifest نبود) و `Previews.kt` به source set `debug`؛ شاهد اسکرین‌شات از instrumented Compose test در `:app`.

**Rejected / trade-off:** Paparazzi نیست (CI screenshot gate = gap)؛ Home handoff در repo نیست (BLOCKED)؛ بدون asset/رنگ/فونت Duolingo (همه از `tokens.json`)؛ static:all 94/94.

### ADR-0050 — حذف کامل بخش والدین و قفل والدین

- **Status:** Accepted (owner instruction, 2026-11-19) — supersedes ADR-0037 §parent-area and ADR-0047 §Parent PIN
- تصمیم: هیچ بخش والدین، دروازهٔ والدین (parent gate) یا PIN والدینی در محصول وجود ندارد. اپ فرزند یک سطح واحد است و مسیر `shell/parent` حذف شده است.
- پیامد فنی: ماژول `apps/android/feature:parent`، کلاس `ShomaraParentBoundary`، `ParentPinManager` (PBKDF2) و تست‌های آن‌ها حذف شدند؛ ورودی «بخش والدین» از صفحهٔ «من» و مسیر آن از shell فرزند برداشته شد؛ assertionهای verifier که فقط همین دروازه را می‌سنجیدند بازنشسته شدند (با یادداشت، نه با تضعیف بقیهٔ بررسی‌ها).
- هزینهٔ پذیرفته‌شده: دیگر هیچ دروازهٔ بزرگسال در دستگاه وجود ندارد، پس تنظیمات و گزارش پیشرفت بدون تأیید بزرگ‌تر باز می‌شوند. این ریسک آگاهانه پذیرفته شد تا UI کودک ساده بماند.
- **Rejected / trade-off:** نگه‌داشتن gate به‌صورت fail-closed رد شد؛ همان حالت «قفل بی‌کلید» بود که تجربه را می‌بست بدون آنکه امنیتی اضافه کند.

### ADR-0051 — حذف presetهای آواتار کودک

- **Status:** Accepted (owner instruction, 2026-11-19)
- تصمیم: هیچ مجموعهٔ آواتار انتخابی (خورشیدی/برگ/ابری/ماه) وجود ندارد. کودک یک شخصیت ثابت دارد و صفحهٔ تنظیمات/من هیچ انتخاب آواتاری نشان نمی‌دهد.
- پیامد فنی: `ShomaraAvatarCatalog` و `ShomaraAvatarOption` از مدل حذف شدند، `avatarId` از لایهٔ ذخیره‌سازی و وضعیت تنظیمات برداشته شد، گرید انتخاب در Settings، ردیف «آواتار من» و `ShomaraMeAvatarWiring` در صفحهٔ من حذف شدند، و تست‌هایی که تنها موضوعشان آواتار بود حذف شدند.
- آنچه حذف نشد: تصویر شخصیت در کارت قهرمان صفحهٔ خانه (cameo شخصیت «Main») — این تصویرسازی شخصیت است، نه انتخاب آواتار.
- هزینهٔ پذیرفته‌شده: کودک دیگر نمی‌تواند نمای شخصی خود را عوض کند؛ در عوض سطح انتخاب بی‌محتوا حذف می‌شود و UI خلوت‌تر می‌ماند.
- **Rejected / trade-off:** نگه‌داشتن چهار preset با یک انتخاب پیش‌فرض رد شد؛ همان پیچیدگی را نگه می‌داشت بدون آنکه ارزش محصولی اضافه کند.

## ADR-0052 — ماموریت‌ها معاف می‌مانند و صفحهٔ «واحد» پورت نمی‌شود

**تاریخ:** 2026-11-19 · **وضعیت:** پذیرفته · **تصمیم مالک:** «تصمیمات صحیح را بگیر و ادامه بده»

### زمینه

برای بازنشستگی `apps/mobile` (۲۱۱ فایل، ۱۷٪ مخزن) هر ۱۵ مسیر Expo با Android تطبیق داده شد. ۱۳ مورد معادل داشت یا
با ADR بازنشسته شده بود؛ دو مورد باقی ماند و تصمیم می‌خواست.

### تصمیم ۱ — `missions` می‌ماند (دامنهٔ معاف)

نوشتار اول موجودی، این صفحه را «جای‌نگهدار بدون محتوا» خواند. **غلط بود.** دامنهٔ ماموریت‌ها کامل وجود دارد:

- `packages/contracts/src/missions.ts` + تست
- `apps/web/app/api/v1/missions/hub/route.ts`
- `verify-p06-mission-engine.mjs` فایل `apps/mobile/app/missions.tsx` را در فهرست **الزامی** دارد
- `verify-ui-v1-path.mjs` معافیت را صریح ثبت کرده: `check('waived-domain:missions-route', ...)`

حذف این فایل دو gate را می‌شکند و یک دامنهٔ قرارداددار را از بین می‌برد. نبودنش روی Android یعنی **معاف‌شده**، نه مرده.

### تصمیم ۲ — `unit/[unitId]` پورت نمی‌شود

`ShomaraPathChapter.kt` فقط `ShomaraChapterBand` است (باند عنوان با completed/total)، نه صفحهٔ واحد با فهرست
ایستگاه‌ها. مدل ناوبری Android یک **سفر پیوسته** است: `ShomaraPathGraph` همهٔ ایستگاه‌ها را در یک مسیر اسکرول‌شو با
باندهای فصل نشان می‌دهد. صفحهٔ drill-down برای واحد، مدل تحویل‌شده را نقض می‌کند.

پس تست Android برایش نوشته نمی‌شود؛ مرجع Expo تا لحظهٔ حذف پوشه می‌ماند.

### قاعدهٔ ترتیب که این ADR الزام می‌کند

assert متنی که موضوعش هنوز زنده است، **پوشش زنده** است. بازنشسته کردنش پیش از حذف فایل = تضعیف verifier برای سبز
شدن (AGENTS.md §3.4). پس:

**فایل اول حذف می‌شود، assert در همان commit می‌میرد — هرگز پیش از آن.**

### پیامد

`apps/mobile` هنوز بازنشسته نشده و این ADR آن را مجاز نمی‌کند. کاری که می‌کند بستن لایهٔ تصمیم است تا حذف پوشه
بعداً یک عملیات مکانیکی باشد، نه یک بحث دوباره.
