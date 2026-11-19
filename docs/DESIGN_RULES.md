## قاعدهٔ حاکم (ADR-0050 / ADR-0051) — بدون بخش والدین و بدون آواتار انتخابی

- هیچ صفحه، مسیر، دکمه یا قفل والدینی وجود ندارد؛ هیچ صفحه‌ای با «تأیید بزرگ‌ترها» باز نمی‌شود.
- هر جا سند قدیمی‌تر gate/PIN والدین را الزام کرده، این قاعده آن را باطل می‌کند.
- صفحهٔ «من» فقط: نام کودک، پیشرفت، تنظیمات. بدون ردیف «بخش والدین» و بدون ردیف آواتار.
- بدون preset آواتار: هیچ گرید انتخاب آواتار، هیچ شناسهٔ آواتار ذخیره‌شده و هیچ ردیف «آواتار من» وجود ندارد (ADR-0051).
- تصویر شخصیت در کارت قهرمان مجاز است؛ آن تصویرسازی شخصیت است، نه انتخاب آواتار.


# DESIGN_RULES.md — قواعد طراحی، توکن‌ها و چک‌لیست صفحه

> این فایل جای 21 سند design/skill را گرفته است. هر بخش از یک سند اصلی آمده و نام آن را دارد.
> تراکم: تکرار و قالب خالی حذف، مقادیر توکن و خطوط قاعده‌ای حفظ شده‌اند.

## SHOMARA inspiration guardrails

**SHOMARA inspiration guardrails**
- این سند ترجمهٔ منابع الهام به تصمیم‌های قابل اجراست. منبع حقیقت بصری همچنان `design/MASTER.md` و tokenهای canonical هستند؛ هیچ منبع بیرونی به runtime یا build وابستگی ایجاد نمی‌کند.
**تقدم تصمیم‌ها**
- ایمنی کودک، قرارداد محصول و بستهٔ محتوای نسخه‌دار محلی + ارزیاب محلی (ADR-0039) ← محتوای تأییدشده ← Design System SHOMARA ← اصول الهام (کپی ساختار دولینگو، نه برند) ← سلیقهٔ صفحه.
- اگر الهام با دسترس‌پذیری، وضوح آموزشی، فارسی/RTL یا قرارداد دامنه تعارض داشت، کنار گذاشته می‌شود.
- > هم‌گام‌سازی با ADR-0039 (۲۰۲۶-۱۱-۰۵): مرجع حقیقت، بستهٔ محتوای نسخه‌دار، checksumدار و امضاشده داخل APK + ارزیاب محلی است؛ ساختار و رفتار دولینگو مدل UI است، برند کپی نمی‌شود. تصمیم‌های باز مالک (اینجا انتخاب نشده‌اند): O1 مدل answer key — (۱) کلید در APK داخل لایهٔ ارزیاب جداگانه؛ (۲) ارزیاب بدون کلید قابل‌استخراج، اثبات‌شده برای هر قالب؛ (۳) ارزیاب از پارامترهای آیتم در زما…
**ماتریس adopt / adapt / reject**
- | منبع | می‌پذیریم | برای SHOMARA تطبیق می‌دهیم | رد می‌کنیم |
- | Duolingo | learning-by-doing، micro-loop، feedback فوری، hierarchy روشن، craft و consistency | کپی ساختار و رفتار (مسیر مارپیچ، حلقهٔ درس، بازخورد فوری) با تطبیق RTL فارسی؛ جلسهٔ کوتاه بدون اقتصاد اعتیادآور؛ assessment آرام‌تر از teaching | کپی برند (لوگو، جغد، رنگ/فونت/متن برند، asset)، lives، streak تنبیهی، leaderboard و currency |
- | AVA | درس‌آموخته‌های معماری، فرایند QA و تفکیک محتوا از runtime | فقط پس از تطبیق با قراردادهای SHOMARA | کد، asset، هویت، نام‌گذاری یا رفتار ناسازگار با SHOMARA |
- | UI/UX Pro Max | design-system-first، انتخاب آگاهانهٔ pattern/style/type/motion، ثبت anti-pattern و pre-delivery review | جست‌وجوی گزینه‌ها به decision record داخلی و tokenهای موجود محدود می‌شود | نصب generator، palette/font تصادفی، dependency یا override منبع canonical |
- | Claymorphism | عمق برای hierarchy، سطح لمسی، press feedback و focus | clay محدود و semantic؛ assessment تخت‌تر و آرام‌تر | blur فراگیر، سایهٔ کم‌کنتراست، depth روی متن، container برای همه‌چیز |
**design dials پیش‌فرض**
- این اعداد requirement بصری نیستند؛ نقطهٔ شروع review هستند و هر انحراف باید دلیل داشته باشد.
- | سطح | Variance | Motion | Density | توضیح |
- |---|---:|---:|---:|---|
- | teaching/discovery | 5/10 | 4/10 | 3/10 | یک manipulative برجسته، حرکت کوتاه و فضای تنفس زیاد |
- | guided practice | 4/10 | 3/10 | 4/10 | تمرکز روی task و feedback، decoration محدود |
- | assessment | 2/10 | 2/10 | 3/10 | کمترین حواس‌پرتی؛ object ریاضی hero است |
- | child shell/path | 4/10 | 3/10 | 4/10 | مسیر قابل فهم، hierarchy ثابت، وضعیت قفل روشن |
- | parent/settings | 2/10 | 2/10 | 5/10 | کاربردی، متنی‌تر و بدون clay تزئینی |
**تصمیم اجباری قبل از UI**
- برای هر route یا component موارد زیر را در review card ثبت کن:
- 1. outcome کودک و state دقیق؛
- 2. focal object و تنها CTA اصلی؛
- 3. اطلاعاتی که با type، color، shape و depth منتقل می‌شوند؛
- 4. stateهای loading/offline/error/empty/disabled/pressed/selected؛
- 5. نقش Clay و دلیل وجود هر depth tier؛
- 6. anti-patternهای مختص صفحه؛
- 7. اثر فارسی/RTL، math direction، TalkBack و font scale؛
- 8. evidence لازم برای ادعای پیاده‌سازی یا آزمون.
**آزمون «حذف کن و ببین»**
- هر decoration، card یا animation را موقتاً حذف کن. اگر task واضح‌تر یا دسترس‌پذیرتر شد، آن عنصر برنمی‌گردد. اگر hierarchy از بین رفت، عنصر باید با token semantic و کمترین شدت لازم بازگردد.
**منابع پژوهشی، نه dependency**
- - UI/UX Pro Max: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
- - Duolingo design craft: `https://blog.duolingo.com/core-tabs-redesign/`
- - W3C accessibility guidance: `https://www.w3.org/TR/wcag3/`
- هیچ نسخه، آمار، palette یا snippet خارجی در این سند قرارداد runtime محسوب نمی‌شود.

_منبع: `design/INSPIRATION_GUARDRAILS.md`_

## SHOMARA Design Master — Native V3 direction

**SHOMARA Design Master — Native V3 direction**
- This is the canonical brand and experience contract. Machine-readable values remain canonical in `packages/design-system/src/tokens.json`; this document explains how to apply them.
**1. Product character**
- SHOMARA is a calm, joyful Persian mathematics garden for children. It should feel tactile and warm without becoming toy-like noise. The child must understand within three seconds:
- 1. where they are;
- 2. what they should do now;
- 3. what happens after the action.
- Duolingo is the UI model (ADR-0039): page layouts, path geometry, lesson loop, feedback and component system are copied, adapted to Persian RTL and SHOMARA v2 tokens; learning-by-doing, one clear task, immediate feedback, multiple representations, gradual difficulty and system-level craft carry over. AVA contributes only verified architecture/process lessons. UI/UX Pro Max cont…
- Sync with ADR-0039 (2026-11-05): the source of truth is the versioned, checksummed, signed content package inside the APK + the local evaluator; Duolingo structure/behaviour is the UI model, brand is not copied. Open owner decisions (not decided here): O1 answer-key model — (1) key in the APK inside a separate evaluator layer; (2) evaluator without an extractable key, proven pe…
**2. Visual language**
- - Canvas: warm cream `v2.color.canvas` (`#FFF8EF`).
- - Primary action and progress: garden green `v2.color.primary` with `primaryDark` for tactile depth.
- - Support accents: amber for attention/featured action, berry for personality, sky for information.
- - Text: `ink`/`ink2`/`muted`; danger is reserved for actual destructive/error meaning.
- - Depth has four semantic levels: flat, hint, soft and featured. A screen normally has at most one featured surface.
- - Clay is a behavior and hierarchy tool, not a blur filter. Pressed controls move without shifting neighboring layout.
- - Text never receives decorative depth, and depth is never the only carrier of state or meaning.
- - Vazirmatn is the interface typeface. Numeric/math content uses semantic LTR isolation where required.
- Do not duplicate these values in Compose or page code. N03 codegen will produce Kotlin and TypeScript outputs from the token source.
**3. Layout and hierarchy**
- - Use one focal learning object or hero, followed by the task and one primary CTA.
- - Keep 24dp preferred screen inset, with adaptive reduction only when verified at 360dp.
- - Respect system bars, display cutouts, IME and edge-to-edge layout.
- - Body content may scroll; critical CTA must remain reachable without obscuring content or keyboard.
- - Characters support orientation and emotion. They never dominate an assessment or reveal an answer.
- - Maintain geometry of the five existing WebP characters until Native asset ownership is approved.
**4. Interaction states**
- Every interactive component defines: default, pressed, focused, selected, disabled, loading and error where applicable. Learning choices additionally define checked/correct/retry states without relying on color alone.
- - Prevent double navigation and duplicate submit.
- - Keep layout stable when feedback appears.
- - Preserve work through retry, offline transitions and process recreation where the feature contract requires it.
- - Motion is short, cancelable and reduced-motion aware. Celebration follows authoritative success only.
- - Haptics and audio are enhancements; the task remains understandable when either is unavailable.
**5. Learning and child-safety rules**
- - No lives, punitive streaks, stars as currency, coins, loot boxes, stores or leaderboards.
- - Wrong answers receive warm, actionable recovery—not shame, violent motion or loss framing.
- - Assessment is visually quieter than teaching and practice.
- - Provide tap/select alternatives for drag interactions.
- - Never expose answer keys, guardian data, internal errors or sensitive identifiers. The answer key lives only in the local evaluator layer (ADR-0039) and never enters the child lesson projection, the database, logs, or telemetry.
- - Apply curriculum rules through `docs/DESIGN_RULES.md § content/SKILL.md`; a draft never overrides the versioned local content package or becomes enabled merely because UI references it.
**6. Accessibility and RTL**
- - Minimum control target: 48dp; preferred early-grade manipulative: 72–80dp.
- - Normal text contrast: at least 4.5:1; large text/control boundaries: at least 3:1.
- - Verify TalkBack role, label, state, traversal and announcements against real behavior.
- - Verify 360/390/412dp, font scale up to 200%, keyboard, landscape risk and long Persian strings.
- - A locked item that opens an explanation remains operable and is announced as locked, not disabled.
- - Do not mirror number lines, inequalities, arithmetic order or meaningful geometry merely because the UI is RTL.
**7. Native architecture boundary**
- Compose screens render immutable state and emit intents. ViewModels coordinate use cases; repositories own local data (bundled content package, Room/DataStore). UI code never decides mastery, station completion or answer correctness; those decisions come from the local evaluator over the versioned bundled content package (ADR-0039), not from a server, and the UI renders what th…
**8. Audio and CMS-ready surfaces**
- Audio UI must expose unavailable, loading, playing, paused, failed and cached/offline states. Runtime receives versioned content/audio descriptors from the bundled local package; it does not hardcode administrator-controlled URLs or copy. Authoring and publishing require provenance, rights, moderation, checksum and activation gates defined in N07. "Offline" is the normal state…
- The current source inventory proposes 25 stations and 15 interaction patterns, but only ST07 is a complete draft pilot. Do not generalize ST07 numeral visibility, timing or assets to every station.
**9. Definition of acceptable screen work**
- A screen advances only when its real route and states are inventoried, critical dimensions score at least 3 in the review rubric, no P0/P1 remains, relevant tests pass, and unresolved device/content decisions are recorded honestly. A browser screenshot is never Native proof.
- Before implementation, record the outcome, focal object, design dials, anti-patterns and permitted depth tiers. `design/playbook/PAGE_UIUX_BLUEPRINT.md` locks these decisions and the Native batch order for all 17 page families; `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` tracks their honest evidence status. Shared components must satisfy `design/playbook/COMPONE…

_منبع: `design/MASTER.md`_

## Component readiness contract — Native Design System V3

**Component readiness contract — Native Design System V3**
- این سند قرارداد state/API و acceptance خانواده‌های Native است؛ وضعیت implementation را با gate validation اشتباه نگیرید.
**واژگان وضعیت**
- - `SPECIFIED`: قرارداد/API/state matrix ثبت شده است.
- - `SOURCE_IMPLEMENTED`: کد Compose/logic مربوط در مخزن وجود دارد.
- - `LOGIC_TESTED`: تست JVM یا domain logic سبز است؛ به معنی Compose semantics یا device pass نیست.
- - `NATIVE_PENDING`: semantics/instrumentation، screenshot و device/TalkBack evidence هنوز ثبت نشده است.
- - `NATIVE_VALIDATED`: فقط پس از اجرای semantics + screenshot در 360/390/412dp و 200% font + device/TalkBack و ثبت artifact/SHA قابل استفاده است.
**نکتهٔ جاری:** چند خانواده در کد و تست JVM پیاده‌سازی شده‌اند؛ هیچ‌کدام صرفاً با وجود کد یا preview، `NATIVE_VALIDATED` نمی‌شوند. گیت Android Native روی branch در حال حاضر فقط Unit + Lint + app debug compile است، نه instrumented/device UI validation.
**وضعیت واقعی خانواده‌ها در baseline نیتیو (2026-11-17)**
- | خانواده | Source | Logic tests | وضعیت Native | مسیرهای اصلی |
- | Button | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraButton.kt`, `ShomaraPrimitives03Test.kt` |
- | TextField/OTP | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraTextField.kt`, `ShomaraOtp.kt`, `ShomaraPrimitives03Test.kt` |
- | Card/Choice | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraCard.kt`, `ShomaraPrimitives04Test.kt` |
- | Feedback | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraFeedback.kt`, `ShomaraPrimitives04Test.kt` |
- | Progress | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraProgress.kt`, `ShomaraPrimitives04Test.kt` |
- | TopBar/TabBar | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraNavigation.kt`, `ShomaraPrimitives05Test.kt` |
- | Dialog/Sheet | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraDialog.kt`, `ShomaraPrimitives05Test.kt` |
- | AudioControl | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraAudio.kt`, `ShomaraPrimitives05Test.kt` |
- | Manipulative | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraManipulative.kt`, `ShomaraManipulativeTest.kt` |
- | Theme / Clay | SOURCE_IMPLEMENTED | LOGIC_TESTED | NATIVE_PENDING | `ShomaraTheme.kt`, `ClaySurface.kt`, `ShomaraThemeTest.kt`, `ClayContractTest.kt` |
- این ماتریس وضعیت implementation و JVM test را ثبت می‌کند؛ تمام سلول‌های Native عمداً `NATIVE_PENDING` هستند تا شواهد دستگاهی واقعی ضمیمه شود.
**قرارداد مشترک هر component**
- هر component قبل از کدنویسی باید این قرارداد را داشته باشد:
- - purpose و موارد عدم استفاده؛
- - API semantic و slotهای مجاز؛
- - state matrix و transitionهای معتبر؛
- - geometry از token canonical، بدون magic value؛
- - role/label/state/action و ترتیب TalkBack؛
- - رفتار RTL و math-direction؛
- - reduced-motion، audio/haptic fallback؛
- - loading/error/disabled و duplicate-action policy؛
- - preview fixture قطعی؛
- - unit/semantics/screenshot/device evidence متناسب.
**ماتریس componentهای N03**
- | خانواده | stateهای الزامی | نکتهٔ آموزشی/دسترس‌پذیری | gate اصلی |
- | Button | default/pressed/focused/disabled/loading | action یکتا، target حداقل 48dp، loading بدون پرش | semantics + fast tap |
- | TextField/OTP | empty/focused/filled/invalid/disabled/loading | label پایدار، خطای متنی، keyboard/IME فارسی | input + font scale |
- | Card/Choice | default/pressed/selected/checked/correct/retry/disabled | status فقط با رنگ منتقل نشود | state screenshot |
- | Feedback | correct/retry/recovery/error | layout ثابت و متن قابل‌اقدام؛ بدون سرزنش | server-result mapping |
- | Progress | determinate/indeterminate/paused/offline | mastery را حدس نزند؛ announcement کنترل‌شده | state source test |
- | TopBar/TabBar | default/selected/locked/badge-free | Back واقعی، route ثابت، بدون duplicate navigation | navigation semantics |
- | Dialog/Sheet | open/busy/error/dismiss-blocked | focus trap، close policy و state restoration | back/process test |
- | AudioControl | unavailable/loading/playing/paused/failed/cached | text fallback؛ lesson هرگز با نبود صوت قفل نشود | missing/offline test |
- | Manipulative | idle/active/dragging/accepted/retry/locked | target ترجیحاً 72–80dp و tap alternative | math/RTL + child QA pending |
**depth contract برای Clay**
- | tier | کاربرد مجاز | ممنوع |
- | flat | canvas، متن، assessment background | سایه برای متن |
- | hint | grouping ملایم یا وضعیت غیرتعاملی | وانمودکردن به clickable بودن |
- | soft | کنترل یا card تعاملی | چند سطح تو در تو |
- | featured | فقط focal object یا CTA همان state | بیش از یک featured surface در viewport تصمیم |
- pressed state باید depth را کاهش دهد و feedback لمسی بدهد، بدون جابه‌جایی layout یا تأخیر در action. Depth هیچ‌گاه تنها حامل معنا نیست.
**ترتیب پیاده‌سازی N03**
- 1. schema و codegen token با drift gate؛
- 2. theme، type و math-direction primitives؛
- 3. Button/Input/OTP؛
- 4. Card/Choice/Feedback/Progress؛
- 5. Navigation/Dialog/Audio؛
- 6. manipulativeهای content-aware؛
- 7. screenshot catalog و owner gate.
- componentی که فقط preview یا source/JVM logic test دارد `NATIVE_PENDING` می‌ماند؛ `TESTED_NATIVE` یا `NATIVE_VALIDATED` بدون instrumentation, screenshot و device evidence ممنوع است.

_منبع: `design/playbook/COMPONENT_READINESS.md`_

## Master Execution Contract — SHOMARA Native learning UX

**Master Execution Contract — SHOMARA Native learning UX**
**1. Goal and aesthetic**
- A joyful Persian mathematics playground with **restrained soft Claymorphism** (plump, gently illuminated surfaces, readable elevation, subtle materials) and **clear, tactile Duolingo-inspired learning interactions** (one purpose per activity, immediate action feedback, progressive challenges). This is *not* a clone of protected Duolingo artwork, exact screens, characters or bra…
**Visual recipe:** warm cream canonical canvas; garden green primary; berry/sky/amber semantic accents; one obvious CTA; rounded volumetric hero and interactive objects; crisp high-contrast type; tiny purposeful motion; tangible correct/selection states. Read `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and `packages/design-system/src/tokens.json`—**do not replace the…
**2. Structure**
- - Canvas calm; hero/educational manipulative prominent; never place everything in a bulky clay container.
- - 3 depth tiers: flat text/canvas; raised clickable object/card; hero/featured. Fixed press lip on primary button remains visually distinct. No globally layered blurs.
- - One top-level visual hero, **but never sacrifice question/answer controls** for decoration. For assessment, the math object is the hero, not a character.
- - Smaller grades 1–2: fewer words, more illustrations, obvious targets; 3–4: structured visuals; 5–6: restrained decoration + more dense problems. Respect `grade-experience.ts`; only active content may be shown.
- - 5 current WebP characters: use exact repo-mapped identifiers, roles, crops and aspect ratio verified from `characters.ts`/assets. Do not assume artwork exists for every emotional pose. During Native migration, preserve verified aspect ratios and semantics; do not invent Compose assets.
**3. Softness as behavior, not a glow filter**
- - Buttons: press movement, lip collapses, release with small spring; no delayed onPress.
- - Answer choices: clear selected state; loading lock; single submit; stable layout when feedback appears.
- - Navigation: retain orientation, disable double-trigger, preserve scroll/lesson resume, Android Back predictable, touch targets ≥48dp (ST07 spec may require 72dp targets for child activities).
- - Transition durations defined by canonical tokens, reduced motion respecting OS/app settings, no continuous loops during solving, avoid simultaneous celebration + screen transition.
- - Each task starts with instruction and ends with a natural next action; errors actionable, never punishing.
**4. UX invariants**
- A. The child always knows *where they are, what to do, and what happens next*.
- B. Only one obvious primary CTA per decision state. Avoid implicit taps on decorative cards.
- C. Slow network/failed audio/offline/retry must preserve state; do not spin forever.
- D. Screenreader semantics reflect **true behavior**: tappable locked node that opens explanation is not marked `disabled`; it is labeled as locked and accessible.
- E. RTL is the interface direction, **not** an instruction to mirror number lines, inequality relations, shapes or arithmetic operation order.
- F. Answer decisions remain on validated domain/server path. Clayed objects are visual input representations, not sources of mastery truth.
- G. Avoid invisible controls, success indicated by color alone, unreadable pale text, ambiguous icon-only buttons.
**5. Typography/contrast/responsiveness**
- - Vazirmatn weights registered and visually verified; canonical type scale; avoid text cut-off from long Persian strings.
- - Body usually ≥16–18 for young child. Contrast ≥4.5:1 normal text, ≥3:1 large; inspect disabled/control edge cases. Use semantic tokens and a contrast calculator, not a trust statement.
- - Test 360, 390, 412dp minimum, larger system fonts, keyboard and safe areas; minWidth:0 on flex text; verify no overlapping nav/hero/CTA.
- - Touch targets generally 48dp minimum; educational active objects per curriculum 72–80dp preferred/required where specified; 16dp separation, 24dp edge inset for ST07 tasks.
**6. Content integration boundary**
- UI audit and curriculum import are **separate workstreams**. `content-library/` documents are draft content references. Stage4 has a proposed station-to-book mapping. Stage5 defines sound/motion/15 templates. Stage6 defines an authoring format. Stage7 provides a complete ST07 pilot, **not ST01**. The proposed 5-part P1–P5 model may not equal current StationFlow; mapping require…
- No content promotion to production without explicit compatibility/validation decisions. Follow `docs/DESIGN_RULES.md § content/SKILL.md`, `content-library/INTEGRATION_GATE.md` and `content-library/integration/SOURCE_AUDIT.md`.
**7. Engineering quality and stop criteria**
- - Preserve git dirty/untracked including current `design/`, `content-library/`, `skills/` and user plan. Read `git status` prior to modifications, use the phase branch; no force-push.
- - Per-route changed paths + behavior test + screenshot + verify source; ledger status values `DISCOVERED`, `AUDITED`, `IMPLEMENTED`, `TESTED_WEB`, `TESTED_NATIVE`, `BLOCKED` (not `DONE` on browser-only claims).
- - Review in small batches. Fix P0/P1 before cosmetics. Visual improvement must be observed rather than inferred from `tokens` or passing parity.
- - Device QA cannot be automatically waved away when SDK unavailable; leave `NATIVE_PENDING`, document precise commands for owner to run.
- - No need to stop for approval on safe UI fixes; do stop before production data mutations, schema/contract semantics, purchasing/licensing or unsupported curriculum changes.
**8. Native migration gate**
- - Read `NATIVE_IMPLEMENTATION.md` for Compose/UDF/module rules.
- - Lock the real Expo behavior and contract before implementing a Native route family.
- - A Native screen needs immutable state, explicit events, previews, unit/semantics tests and device-pending evidence.
- - Verify Android edge-to-edge, predictive back, process recreation, IME and TalkBack; browser parity cannot close these gates.
- - Update the route ledger with separate behavioral parity, visual review and Native device status.
**9. Shared component gate**
- - Load `docs/DESIGN_RULES.md § design system/SKILL.md` for any token, theme or shared primitive change.
- - Use `COMPONENT_READINESS.md` to define purpose, non-use cases, states, semantics and evidence before code.
- - Do not solve a page inconsistency by creating a local component when the behavior belongs in the shared system.
- - Do not generalize a one-page visual experiment into the Design System without at least two valid consumers or an explicit foundation requirement.

_منبع: `design/playbook/MASTER_EXECUTION.md`_

## N08R — Native UI/UX Visual Refinement (Duolingo-level, Clay)

**N08R — Native UI/UX Visual Refinement (Duolingo-level, Clay)**
- > **وضعیت:** سند canonical مأموریت فاز N08R. ثبت‌شده در `harness/roadmap.json` (فاز N08R، 2026-11-07).
- > **منبع:** دستور مستقیم مالک پروژه (متن کامل، بدون تغییر، در بخش بعد). ثبت‌کننده: ZCode در شاخهٔ `native/n08r-ui-polish`.
- > **محدودهٔ اجرا:** فقط فاز N08R — دو صفحهٔ Splash و Profile Setup محافظت‌شده مطلق؛ منطق دامنه دست‌نخورده؛ متن/asset تازه بدون تصویب مالک ممنوع. این سند جای `AGENTS.md`/`START_HERE.md` را نمی‌گیرد.
**SHOMARA — Native UI/UX Transformation Mission**
**Duolingo-Level Product Experience & Premium Native Implementation**
- تو در این مأموریت نقش یک تیم ارشد متشکل از افراد زیر را بر عهده داری:
- - Principal Product Designer
- - Senior Mobile UI/UX Designer
- - Staff Android Engineer
- - Jetpack Compose Specialist
- - Design System Architect
- - Mobile Interaction & Motion Designer
- - Accessibility Engineer
- - Senior QA Engineer
- هدف، صرفاً زیباتر کردن چند صفحه نیست.
- هدف، تبدیل تجربه کاربری SHOMARA به یک محصول آموزشی کودکانه در سطح کیفی Duolingo است؛ محصولی که از نظر ساختار صفحات، روان بودن تعاملات، جذابیت بصری، جزئیات طراحی، بازخوردهای تعاملی و کیفیت اجرای Native، حرفه‌ای و یکپارچه باشد.
- تمام تغییرات باید در راستای هویت مستقل SHOMARA انجام شوند.
**1. MISSION OBJECTIVE**
- محصول باید به این ویژگی‌ها برسد:
- 1. UI کاملاً مدرن، حرفه‌ای، جذاب و کودک‌پسند باشد.
- 2. تجربه کاربری بسیار روان، سریع و قابل فهم باشد.
- 3. تعامل با تمام اجزای صفحه حس Native و طبیعی داشته باشد.
- 4. انیمیشن‌ها نرم، هدفمند و بدون لگ باشند.
- 5. رنگ‌ها هویت مشخص و هماهنگ داشته باشند.
- 6. مسیر یادگیری و پیشرفت کودک انگیزه‌بخش و قابل فهم باشد.
- 7. تمام صفحات از یک Design System واحد استفاده کنند.
- 8. هیچ صفحه‌ای حس یک صفحه وب معمولی یا یک نمونه اولیه ناقص نداشته باشد.
- 9. تمام صفحات در دستگاه واقعی Android با Jetpack Compose کیفیت مطلوب داشته باشند.
- 10. کیفیت نهایی در سطح یک اپلیکیشن تجاری قابل انتشار باشد.
**اصل اساسی:**
- هر صفحه باید طوری طراحی شود که انگار توسط یک تیم حرفه‌ای Product Design برای یک اپلیکیشن آموزشی بین‌المللی طراحی و پیاده‌سازی شده است.
- فقط ظاهر را تغییر نده. تجربه را متحول کن.
**2. FIRST: READ THE PROJECT, DO NOT GUESS**
- پیش از هر تغییری، ساختار واقعی پروژه را مطالعه کن.
- ترتیب اجباری:
- 1. AGENTS.md
- 2. START_HERE.md
- 4. docs/notes/SHOMARA_FINAL_CHAT_HANDOFF.md
- 5. design/MASTER.md
- 6. design/INSPIRATION_GUARDRAILS.md
- 7. design/playbook/PAGE_UIUX_BLUEPRINT.md
- 8. design/playbook/ROUTE_REGISTRY.md
- 9. design/playbook/COMPONENT_READINESS.md
- 10. design/playbook/NATIVE_IMPLEMENTATION.md
- 11. design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv
- 12. design/playbook/quality/SCREEN_LEDGER.csv
- 13. Skillهای زیر:
- - docs/DESIGN_RULES.md § product design/SKILL.md
- - docs/DESIGN_RULES.md § design system/SKILL.md
- - docs/DESIGN_RULES.md § screen execution/SKILL.md
- همچنین باید دستورات زیر اجرا شوند:
- git status --short --branch
- git log -5 --oneline
- node tools/harness.mjs validate
- node tools/harness.mjs status
- node tools/harness.mjs next
- node tools/harness.mjs resume
- تمام تغییرات فعلی Git را حفظ کن.
- مستقیماً روی main کار نکن.
- از معماری، قراردادها، تست‌ها و تصمیم‌های قبلی پروژه تخطی نکن.
**3. STRICTLY PROTECTED SCREENS — DO NOT REDESIGN**
- این مهم‌ترین محدودیت کل مأموریت است.
- دو قسمت از UI از نظر طراحی و UX تأیید شده‌اند و باید بدون هیچ تغییر بصری حفظ شوند.
**Protected Screen A — Splash / Loading**
- صفحه Splash و تجربه Loading ابتدایی SHOMARA تکمیل شده است.
- مرجع Native:
- `apps/android/core/designsystem/src/main/kotlin/com/mathlearning/core/designsystem/ShomaraSplashScreen.kt`
- همراه با فایل‌های Spec و Drawable مربوط به Splash.
- - ترکیب‌بندی صفحه تغییر نکند.
- - رنگ‌ها تغییر نکنند.
- - اندازه و جایگاه تصاویر تغییر نکند.
- - تایپوگرافی تغییر نکند.
- - لوگو و هویت بصری تغییر نکند.
- - انیمیشن و رفتار Loading تغییر نکند.
- - فاصله‌ها، حاشیه‌ها و نسبت تصویر تغییر نکنند.
- - صرفاً برای هماهنگی با صفحات دیگر، این صفحه را بازطراحی نکن.
**Protected Screen B — Child Profile Setup**
- صفحه‌ای که کودک نام و پایه تحصیلی خود را وارد می‌کند، از نظر UI/UX تأیید شده است.
- مرجع Expo V2:
- `apps/mobile/src/onboarding/views2/ProfileView2.tsx`
- معادل Native:
- `apps/android/feature/onboarding/src/main/kotlin/com/mathlearning/feature/onboarding/ProfileScreens.kt`
- در Native، محدوده حفاظت شامل Composable مربوط به `ShomaraProfileScreen` است.
- - Layout فعلی حفظ شود.
- - ترتیب فیلدها و بخش‌ها تغییر نکند.
- - طراحی انتخاب آواتار حذف شده است (ADR-0051)؛ این بند منسوخ است.
- - طراحی انتخاب پایه تغییر نکند.
- - متن‌ها و محتوای صفحه دست‌کاری نشوند.
- - اندازه‌ها، فاصله‌ها، رنگ‌ها و انیمیشن‌های این صفحه تغییر نکنند.

_منبع: `design/playbook/N08R_MISSION_FA.md`_

## N08R — نقشهٔ محتوایی ST07 · P1 «کشف» (محور ۲ directive مالک)

**N08R — نقشهٔ محتوایی ST07 · P1 «کشف» (محور ۲ directive مالک)**
- > **تاریخ:** ۲۰۲۶-۱۱-۰۷ · **منبع:** `content-library/originals/shomara-stage7-pilot-ST07.md` §2 (DRAFT، SOURCE_ONLY — byte-protected، فقط خوانده شد) + `derived/game-patterns-index.json` + قرارداد ADR-0039 §2 (مرز projection کودک).
- > **وضعیت:** نقشهٔ محتوایی برای طراحی مرحلهٔ Teach/Discover؛ هیچ محتوایی از این سند وارد runtime نمی‌شود (زنجیرهٔ `SOURCE_ONLY→…→ENABLED` باز است و O1/O2 تصمیم مالک‌اند).
**۱) نقشهٔ مرحلهٔ P1 (۴ قدم)**
- | قدم | kind | محتوای واقعی | تعامل کودک | ارزیابی | بازخورد | صوت (ID) | advance |
- | s00 | intro | راهنما pose `CH.guide.encourage` بزرگ | فقط تماشا | **ندارد** (P1 بی‌نمره) | — | `ST07.P1.s00.pr` | پایان صدا |
- | s01 | discover T01 | کارت‌های `OBJ.sun/house/tree` + برچسب‌های صوتی `a/b/c`، reveal ‏`GLYPH.1` | لمس هر کارت → برجسته + پخش برچسب؛ پس از هر سه → ظهور نماد «۱» با انیمیشن نوشتن | **ندارد** — کشف آزاد | مثبتِ ضمنی (برجسته‌شدن + صوت) | `…s01.pr` + `…s01.done` | پایان صدای done |
- | s02 | discover T01 | کارت‌های `OBJ.eyes/shoes/wheels` (گروه‌های دوتایی)، reveal ‏`GLYPH.2` | مانند s01 با شمارش ۲ | **ندارد** | مانند s01 | `…s02.pr`/`…s02.done` | پایان صدای done |
- | s03 | transition | راهنما encourage بزرگ | فقط تماشا | **ندارد** | — | `ST07.P1.s03.pr` | پایان صدا |
- - **هدف آموزشی:** «هر چیز یک‌تایی با نماد ۱ شمرده می‌شود؛ گروهِ دوتایی با نماد ۲» (ارقام ۱ و ۲ — `numerals_taught: [1,2]`).
- - **Idle replay:** ۸ ثانیه بی‌کاری → تکرار صوت آخرین دستور، بدون نمایش خطا (در `CALIBRATION_V1` config است — هاردکد ممنوع).
- - **راهنما:** poseهای `CH.guide.think/encourage` — از پنج شخصیت cast تأییدشده (CONTENT-006 برای چهره/صدا باز).
**۲) تطبیق با معماری Android (اجراشده در N08R-08)**
- | لایه | مصوبه | فایل |
- | مدل کودک-امن (projection) | فقط `assetId/labelAudioId/countPerCard/revealGlyphAssetId/promptAudioId/doneAudioId` — **بدون هیچ فیلد answer/correct/threshold** (گارد تست) | `feature/lesson/ShomaraLessonDiscover.kt` |
- | منطق جریان | لمس idempotent، گیت reveal، advance درون‌فهرست — بدون قضاوت | همان فایل (`ShomaraDiscoverLogic`) |
- | رندر | کاشی‌های ۸۰dp با placeholder هندسی خنثی (assetها تحویل نشده)، تیکِ شمارش روی لمس (انیمیشن=مفهوم)، reveal با تایپوگرافی توکن + Featured واحد؛ reduced-motion = ظهور ایستا | همان فایل |
- | تغذیه | `ShomaraLessonHost(discoverSteps=…)` ← `ShomaraApp` ← `AppContainer.lessonDiscoverSteps` ← `LessonContentWiring` دو-واریانتی (debug = ساختار DRAFT برای بازبینی طراحی؛ **release = لیست خالی، fail-closed**) | `app/src/debug|release/.../LessonContentWiring.kt` |
- | اتصال به ارزیاب | `onAllStepsComplete` — عمداً no-op تا O1/O2 و فاز ۱ (بستهٔ محلی + ارزیاب) بسته شوند | `ShomaraLessonHost` |
**۳) Gapهای ثبت‌شده (جعل ممنوع)**
- 1. **O1/O2 باز** → ارزیاب محلی و بستهٔ باندل وجود ندارند؛ advance واقعی P1→P2 به ارزیاب وابسته است.
- 2. **۴۱ asset ST07 (OBJ.*/GLYPH.*/UI.*/PAT.*)** فقط توصیف‌اند → placeholder هندسی؛ انیمیشن «نوشتن نماد» منتظر GLYPH.1/2.
- 3. **صوت ۲۳۲ ردیف DRAFT، صفر باینری** → صدا ساکت و هرگز مسدودکننده نیست (CONTENT-017)؛ idle-replay 8s هنوز به config نسخه‌دار وصل نشده.
- 4. **چهرهٔ راهنما/poseها** (CONTENT-006) → فقط cameo استاتیک Main/Number pose 1 موجود.
- 5. عنوان‌های ایستگاه provisional (CONTENT-004) — هیچ متن هدفی اختراع نشد؛ محتوای روی صفحه = کارت‌ها + نماد.
- 6. پیش‌نمایش DEBUG ساختار ST07 را برای هر ایستگاهی که ورود شود نشان می‌دهد (برچسب «پیش‌نمایش طراحی») — در release این مسیر وجود ندارد.

_منبع: `design/playbook/N08R_ST07_P1_CONTENT_MAP_FA.md`_

## N08R-01 (U0) — ممیزی Design System: کنتراست، Clay، Motion

**N08R-01 (U0) — ممیزی Design System: کنتراست، Clay، Motion**
- > **تاریخ:** ۲۰۲۶-۱۱-۰۷ · **شاخه:** `native/n08r-ui-polish` · **task:** N08R-01
- > **مبنای عددی:** `packages/design-system/src/tokens.json` بلاک canonical v2 (دقیقاً همان مقادیری که `ShomaraTokens.kt` تولیدی و `design/MASTER.md` §2 اعلام می‌کنند — ممیزی تطبیق hex انجام شد، **مغایرتی بین MASTER و v2 وجود ندارد**؛ تنها drift تاریخی، بلوک کهنهٔ v1/`ui.path` است که در PAGE-06 ثبت شده و تولید نمی‌شود).
- > **روش:** محاسبهٔ نسبت کنتراست WCAG (نسبت لومینانس) روی ۳۱ جفت مصرفی واقعی کد + بازخوانی `ShomaraClay`/`ShomaraMotion` + تصمیم‌های ثبت‌شدهٔ ADR-0040.
**۱. نتیجهٔ ممیزی کنتراست**
**هر ۱۸ جفت متنی با آستانهٔ 4.5:1 سبزند** (اکثراً بالای ۵:۱ — ۷ جفت بالای ۱۱:۱). جدول کامل:
- | fg | bg | نسبت | الزام | حکم |
- |---|---|---:|---|---|
- | ink #15302B | canvas #FFF8EF | 13.38 | 4.5 | PASS |
- | ink | surface #FFFFFF | 14.10 | 4.5 | PASS |
- | ink | surfaceAlt #FDF3E3 | 12.83 | 4.5 | PASS |
- | ink | splashCream #FDF4E5 | 12.92 | 4.5 | PASS (محافظت‌شده) |
- | ink | primarySoft #DDF2E7 | 12.04 | 4.5 | PASS |
- | ink | skySoft #E1F0FA | 12.12 | 4.5 | PASS |
- | ink | amberSoft #FFF1D6 | 12.62 | 4.5 | PASS |
- | ink | berrySoft #FBE3F0 | 11.65 | 4.5 | PASS |
- | ink2 #44594F | canvas | 7.15 | 4.5 | PASS |
- | ink2 | surface | 7.53 | 4.5 | PASS |
- | muted #5E6F68 | canvas | 5.04 | 4.5 | PASS |
- | muted | surface | 5.32 | 4.5 | PASS |
- | white #FFFFFF | primary #0C7A54 | 5.35 | 4.5 | PASS (برچسب CTA) |
- | white | primaryDark #0A5C41 | 8.01 | 4.5 | PASS |
- | amberInk #4A2E00 | amberSoft | 11.18 | 4.5 | PASS |
- | danger #B3402F | canvas | 5.40 | 4.5 | PASS |
- | danger | surface | 5.69 | 4.5 | PASS |
- | danger | dangerSoft #FBE7E2 | 4.78 | 4.5 | PASS |
**پنج مورد زیر-۳:۱ غیرمتنی و حکم هرکدام**
- | جفت | نسبت | مصرف | حکم |
- |---|---:|---|---|
- | primaryDark روی primary | 1.50 | لبهٔ سه‌بعدی دکمهٔ سبز | **معاف — تزئینی.** مرز شناسایی کنترل، خودِ دکمه در برابر بوم است (5.07:1 ✓). لبهٔ تیره، عمق Clay است نه مرز (معافیت تزئینی WCAG 1.4.11)؛ الگوی دولینگو هم همین است. تغییر نمی‌کند. |
- | amber روی amberSoft | 1.64 | نوار accent بنر فصل ۳ | **رفع شد.** چهار accent دیگر همه ≥3:1 بودند و فصل ۳ فقط-رنگیِ محو مانده بود → accent فصل ۳ به `amberInk` (11.18:1) تغییر کرد — همان الگوی dark-accent که فصل ۵ با `ink2` دارد. تست رگرسیون WCAG≥3 برای هر ۵ فصل اضافه شد (`ShomaraPathGraphTest`). |
- | amber روی canvas | 1.74 | سووش/جرقه‌های خوش‌آمد | **معاف — تزئینی** و روی صفحهٔ **محافظت‌شده** است؛ هرگز تغییر نمی‌کند. |
- | line روی canvas | 1.26 | hairline جداکننده‌ها | **معاف — جداکننده.** WCAG جداکننده‌ها و مرزهای تزئینی را مستثنا می‌کند؛ شناسایی فیلد/کارت با fill+سایهٔ Clay+برچسب انجام می‌شود. تغییر نمی‌کند (توکن `line` توسط صفحهٔ محافظت‌شده مصرف می‌شود). |
- | line2 روی surface | 1.59 | hairline روی کارت‌ها | **معاف — جداکننده.** همان حکم بالا. |
**جمع‌بندی پالت:** پالت v2 از نظر کنتراست متنی «حرفه‌ای و سالم» است؛ هیچ بازطراحی پالت لازم نیست و هیچ مقدار توکن تغییری نکرد. تنها تغییر رنگ، انتخاب accent موجود (`amberInk`) برای یک بنر فصل بود — بدون توکن تازه، بدون hex خام.
**۲. تصمیم Clay — آیتم C-16 چک‌لیست دولینگو (هایلایت مورب روی دایرهٔ آیکون)**
**تصمیم: رد می‌شود (REJECT).** دلایل:
- 1. spec فعلی `ShomaraClay` یک هایلایت بالا‌ی ۱dp با alpha 0.68 دارد — پاسخ نوری لمسی از قبل در سیستم هست.
- 2. براقیت مورب (gloss) با جهت ثبت‌شدهٔ «Claymorphism نرم و خوددار» (`MASTER_EXECUTION.md`) و آنتی‌پترن‌های rubric (blur/براقیت بی‌جا، متن کم‌کنتراست روی clay) در تعارض است.
- 3. ADR-0040 R1 پاسخ لمسی را با «لبهٔ سه‌بعدی همهٔ سطوح» حل کرده؛ افزودن gloss یک لایهٔ بصری چهارم می‌سازد.
- قاعدهٔ چهار سطح عمق + «حداکثر یک Featured در viewport» + «متن هرگز depth نمی‌گیرد» + «فشرده‌شدن در press» بدون تغییر حفظ شد.
**۳. ممیزی و ارتقای Motion**
- - **قرارداد موجود سالم است:** دو سیگنال مستقل reduced-motion (تنظیم کاربر + مقیاس انیماتور سیستم=0)، `durationMs` از توکن، `ShomaraCelebrationGate` ضدهم‌زمانی، صفر انیمیشن تزئینی.
- - **حفرهٔ واقعی که ممیزی یافت:** feedback فشردن لمسی **hard-cut** بود — گرهٔ مسیر `if (pressed) 0.96f else 1f` بی‌انیمیشن و دکمه فقط پرش عمق سایه؛ در حالی که مأموریت (§4.D) «Spring animation / Press feedback / Subtle scale» را صریحاً می‌خواهد و اصول دولینگو (اسکیل duo-design/juicy-motion) می‌گوید میکرو-تعامل باید spring باشد نه linear/قطع‌شدنی.
- - **رفع شد:** `Modifier.shomaraPressScale(pressed, reducedMotion)` در designsystem — پارامترهای spring کاملاً از توکن‌های motion مشتق می‌شوند (`dampingRatio = c/2√(k·m) ≈ 0.47` از 14/220/1؛ stiffness=220؛ target=0.96) — هیچ عدد خامی وارد کد نشد. تحت reduced-motion همان تغییر state با `snap` (برش آنی) اعمال می‌شود؛ «اطلاعات می‌ماند، حرکت حذف می‌شود».
- - **مصرف‌کننده‌ها:** `ShomaraButton` (همهٔ keypad OTP/دکمه‌ها) و گرهٔ مسیر (`ShomaraPathNodeItem`). کامنت N08-04 که ادعا می‌کرد «هیچ animate*AsState در apps/android نیست» صادقانه به‌روز شد (motion تعاملی ≠ motion تزئینی).
- - **محمایت‌شده‌ها:** `ShomaraSplashScreen` و `ShomaraProfileScreen` از `ShomaraButton` استفاده نمی‌کنند (پروفایل عمداً CTA صفحه‌محلی دارد) و هیچ مقدار توکنی تغییر نکرد → صفر اثر بصری، حتی در press.
**۴. شواهد**
- - ممیزی: ۳۱ جفت، ۲۳ PASS، ۵ تزئینی/جداکننده (معاف)، ۱ رفع‌شده.
- - تست‌های تازه: `press spring stiffness is the motion token verbatim`، `press damping ratio derives from the physical token spring`، `press scale target is the motion press token`، `every chapter accent meets the 3 to 1 non-text contrast floor on its band`، `chapter accents stay pairwise distinct`.
- - گیت‌ها در همان commit ثبت می‌شوند (android:gate / vitest / harness:validate).

_منبع: `design/playbook/N08R_U0_AUDIT_FA.md`_

## Native implementation contract — Kotlin + Jetpack Compose

**Native implementation contract — Kotlin + Jetpack Compose**
- Read this file for N02–N10 Android work after `design/MASTER.md` and the relevant page contract.
- For theme, token or shared component work, `docs/DESIGN_RULES.md § design system/SKILL.md` and `COMPONENT_READINESS.md` are also mandatory.
**Screen structure**
- Each feature exposes immutable `UiState`, sealed user `Action`/`Intent`, a ViewModel or presenter, and a stateless route-level composable. Composables render state and emit events; they do not call network/database clients or calculate learning truth.
- Route → ViewModel → UseCase → Repository → local/remote source
- └──── immutable UiState ←───────────────┘
- Use a single activity, explicit navigation destinations and public feature APIs. Keep implementation dependencies between feature modules forbidden.
**Required foundations**
- - Edge-to-edge from the first activity; consume insets deliberately.
- - Predictive-back-compatible navigation; no raw back-key interception.
- - Saved state only for reconstructable UI/navigation values; domain progress comes from repository/server truth.
- - Structured error types mapped to child-safe UI messages; internal detail stays in privacy-safe logs.
- - Dependency injection at module boundaries; no service locator inside composables.
- - All dependency and plugin versions pinned in the version catalog; no dynamic versions.
**Compose rules**
- - Use Material semantics and SHOMARA tokens, not Material defaults as the visible brand.
- - Hoist state; use stable keys for lists; avoid side effects during composition.
- - Represent one-off navigation/messages through explicit effect handling, not booleans that replay after recreation.
- - Add previews for meaningful normal/error/large-text/RTL states using deterministic fixtures.
- - Keep animation cancelable and driven by state; respect system animator/reduced-motion preference.
**Test layers**
- 1. Pure unit tests for reducers/use cases/error mapping.
- 2. ViewModel tests with deterministic dispatchers and fake repositories.
- 3. Compose semantics tests for label/role/state/action and critical navigation.
- 4. Screenshot tests at 360/390/412dp plus large text for representative screens.
- 5. Instrumented/device journeys for IME, process recreation, TalkBack, predictive back, audio/haptics and performance.
- Never replace a missing device gate with a screenshot-only claim. Record `NATIVE_PENDING` and the exact executable command.
**Migration rule**
- Migrate one route family at a time. First lock the Expo behavior/contract, then implement Native state and UI, compare critical states, run gates and update the ledger. Retire Expo/V1/V2 only after zero-consumer proof and a replacement gate.

_منبع: `design/playbook/NATIVE_IMPLEMENTATION.md`_

## نقشهٔ نهایی UI/UX صفحه‌ها — Native V3

**نقشهٔ نهایی UI/UX صفحه‌ها — Native V3**
- این سند قرارداد اجرایی همهٔ خانواده‌های صفحه است. هدف آن حذف تصمیم‌گیری تکراری در زمان مهاجرت Compose است؛ **evidence پیاده‌سازی Native نیست**. تا عبور واقعی `N02-07` همهٔ ردیف‌ها `NATIVE_PENDING` می‌مانند.
**قواعد سراسری چیدمان**
- - صفحه از بالا به پایین: orientation کوتاه → focal object یا task → کنترل‌های تصمیم → یک CTA اصلی → feedback/system state.
- - canvas و متن `flat`، گروه‌بندی غیرتعاملی `hint`، کنترل تعاملی `soft` و فقط یک focal/CTA در viewport تصمیم `featured` است.
- - CTA پایین صفحه باید با IME، gesture navigation و 200% font scale برخورد نکند؛ scroll محتوا نباید CTA یا feedback را پنهان کند.
- - فارسی/RTL جهت shell است؛ شماره، OTP، عبارت ریاضی، محور و ترتیب عملیات جهت معنایی مستقل دارند.
- - حداقل target برابر 48dp است؛ manipulativeهای پایه‌های اول ترجیحاً 72–80dp با فاصلهٔ 16dp و inset کناری 24dp.
- - هر state تصمیم فقط یک CTA اصلی دارد. CTA در `loading` قفل و idempotent است، اما layout جابه‌جا نمی‌شود.
- - animation کوتاه، هدفمند و قابل لغو است؛ reduced-motion نسخهٔ بدون حرکت دارد. feedback معنایی فقط رنگ/سایه نیست.
- - پاسخ، mastery، unlock و Station Pass از ارزیاب محلی روی بستهٔ محتوای نسخه‌دارِ باندل‌شده می‌آید (ADR-0039)؛ UI هیچ answer key یا ارزیابی تازه‌ای نمی‌سازد و کلید پاسخ فقط در لایهٔ ارزیاب محلی زندگی می‌کند. O1 (مدل answer key) و O2 (فرمت بسته) باز — تصمیم مالک.
- > هم‌گام‌سازی با ADR-0039 (۲۰۲۶-۱۱-۰۵): O1 (مدل answer key) و O2 (فرمت بسته) باز — تصمیم مالک. گزینه‌های O1: (۱) کلید در APK داخل لایهٔ ارزیاب جداگانه؛ (۲) ارزیاب بدون کلید قابل‌استخراج، اثبات‌شده برای هر قالب؛ (۳) ارزیاب از پارامترهای آیتم در زمان اجرا. گزینهٔ O2: پیشنهاد ADR-0039 §۴ (manifest.json + stations/*.json + audio/*.opus + images/*.webp؛ سه مدل + لایهٔ ارزیاب جداگانه…
**طرح خانواده‌های صفحه**
- | ID | خانواده / مقصد Native | outcome کودک | focal object و composition | CTA اصلی | depth | stateهای الزامی | reject مشخص |
- | 01 | Launch/Welcome · `feature:onboarding` | بفهمد ورود جدید است یا ادامهٔ امن | hero گرم و کوتاه؛ character کوچک؛ ابتدا session resolution | «شروع» یا «ادامه» متناسب با session | flat + یک featured | resolving/new/returning/offline/error | flash ورود، splash حلقه‌ای، ادعای جایزه |
- | 02 | Onboarding · `feature:onboarding` | هر بار یک مفهوم و جایگاه مرحله را بفهمد | illustration محدود + عنوان یک‌خطی + progress متنی/دیداری | «ادامه»؛ skip فقط با مجوز محصول | hint + soft CTA | first/resume/back/save/loading/error | carousel شلوغ، چند CTA هم‌وزن، dark pattern |
- | 03 | Phone/OTP · `feature:auth` — در مدل آفلاین حذف می‌شود (فاز ۲، ADR-0039) | شماره یا کد را بدون ابهام وارد کند | label پایدار، input LTR و error نزدیک فیلد | «دریافت کد» / «تأیید» | flat form + soft CTA | empty/focused/invalid/sending/code/paste/expired/cooldown/offline | log کد، error صرفاً قرمز، CTA زیر keyboard |
- | 04 | Profile setup · `feature:onboarding` | حداقل اطلاعات لازم را بسازد | یک پرسش در هر view؛ avatar کوچک و واقعی | «ذخیره و ادامه» | hint + soft controls | empty/invalid/saving/save-fail/resume | پروفایل اجتماعی، دادهٔ اضافه، avatar غالب |
- | 05 | Grade/Placement · `feature:placement` | پایهٔ قابل‌دسترسی را انتخاب و تعیین‌سطح را بفهمد | cardهای پایه با locked/unavailable صریح؛ assessment آرام | «ادامه» / «شروع تعیین‌سطح» | soft cards؛ assessment flat | selected/locked/unavailable/loading/exit/resume/error | نمایش پایهٔ غیرفعال به‌عنوان موجود، تصمیم mastery در UI |
- | 06 | Learning path · `feature:path` | جای فعلی و گام بعدی را در مسیر ببیند | ribbon فصل + current node واحد + tooltip انتخابی | CTA همان node انتخاب‌شده | canvas flat؛ current featured؛ nodes soft | fresh/current/completed/perfect/locked/offline/error/restore-scroll | glow همهٔ nodeها، disabled غلط برای locked tappable |
- | 07 | Station start · `feature:learning-player` | هدف کوتاه ایستگاه را بداند و شروع/ادامه دهد | lesson aim + character محدود + metadata واقعی | «شروع» یا «ادامه» | یک featured hero/CTA | loading/ready/resume/locked/offline/error/starting | CTA تکراری، success جعلی، hero مزاحم در 360dp |
- | 08 | Teach/Discover · `feature:learning-player` | مفهوم را با مشاهده/تعامل کشف کند | manipulative ریاضی hero؛ متن کوتاه؛ audio اختیاری | «ادامه» پس از شرط معتبر | focal featured؛ chrome flat | ready/interactive/audio-unavailable/loading/playing/failed/reduced-motion | character بزرگ‌تر از مفهوم، قفل‌شدن به صوت، animation پیوسته |
- | 09 | Guided practice · `feature:learning-player` | با راهنمایی پاسخ دهد و راه بعدی را بفهمد | objectهای بزرگ + انتخاب واضح + feedback پایدار | «بررسی» سپس «ادامه/دوباره» | choices soft؛ feedback hint | idle/selected/submitting/correct/retry/recovery/offline/error | drag بدون tap alternative، submit دوگانه، hint ساختگی |
- | 10 | Assessment · `feature:learning-player` / `feature:placement` | مستقل و بدون افشای پاسخ مسئله را حل کند | صورت مسئله dominant؛ decoration حداقلی؛ choiceها جدا | «بررسی پاسخ» | canvas flat؛ choices soft | idle/selected/submitting/result/disconnect/resume/expired | hint/audio افشاگر، celebration پیش از نتیجهٔ معتبر، grade در UI |
- | 11 | Recovery/Result · `feature:learning-player` | بدون شرم بداند چگونه اصلاح کند یا بعد کجاست | feedback sheet ثابت؛ celebration فقط پس از success معتبر (ارزیاب محلی) | «دوباره تلاش کن» / «ادامه مسیر» | sheet soft؛ success featured محدود | correct/retry/recovery/pass/fail/offline/resume | shake خشن، دوباره‌شماری progress، اجبار تماشای مجدد |
- | 12 | Practice tab · `feature:practice` | تمرین واقعاً موجود را پیدا و ادامه دهد | recent/topic rows واقعی؛ empty state راهنما | «شروع/ادامه تمرین» | rows soft؛ shell flat | loading/list/empty/locked/offline/error/history | grid placeholder، mission پنهان را زنده‌کردن، دادهٔ ساختگی |
- | 13 | Challenge · `feature:learning-player` | قانون چالش و round جاری را روشن بفهمد | intro کوتاه؛ در round سؤال همیشه focal | «شروع چالش» / «ثبت پاسخ» | intro featured؛ round flat/soft | unavailable/intro/round/submitting/retry/result/offline | casino reward، answer leak، player قدیمی داخل shell جدید |
- | 14 | Profile/Me · `feature:profile` | هویت و پیشرفت واقعی خود را ساده ببیند | header گرم + آواتار واقعی + facts قابل‌فهم | action متناسب با row؛ بدون CTA مصنوعی | header hint؛ rows soft | loading/ready/empty/offline/error/edit-return | dashboard تاریک، badge/streak ساختگی، log دادهٔ کودک |
- | 15 | Avatar/Settings/Guardian · `feature:profile/settings/guardian` | ظاهر و preference واقعی را امن تغییر دهد | grid پنج asset واقعی؛ setting rows سبک؛ guardian جدا از shell | «ذخیره» فقط در صورت نیاز | selected soft؛ dialog featured محدود | owned/equipped/locked/saving/toggle-fail/restart/re-auth/error | avatar خیالی، toggle جعلی، پاک‌کردن بدون confirm، guardian داخل tab کو…
- | 16 | System states · shared | علت توقف و اقدام بعدی را بفهمد | layout پایدار + پیام کوتاه + action واقعی | «تلاش دوباره» یا fallback معتبر | flat/hint؛ CTA soft | loading/empty/offline/error/permission/missing-asset | spinner بی‌انتها، متن فنی برای کودک، retry بی‌اثر |
- | 17 | Navigation · app shell | همیشه بداند کجاست و Back چه می‌کند | سه tab ثابت «مسیر/تمرین/من»؛ active marker روشن | destination tap؛ بدون CTA محتوایی جدید | shell flat؛ selected hint | selected/reselect/deep-link/nested/back/modal/IME/restoration | tab چهارم پنهان، duplicate navigation، overlay روی کنترل |
**ترتیب اجرایی وابسته به ریسک**
- | Batch | بعد از gate | خروجی | صفحات | شرط خروج |
- | U0 | `N02-07` سبز | token codegen، Theme، type/math direction، primitives و fixtureها | مشترک | drift صفر؛ component contract و semantics test |
- | U1 | U0 | root coordinator، onboarding/auth/profile setup | 01–05, 16 | fresh/returning/OTP/IME/process recreation؛ screenshot 360/390/412 |
- | U2 | U0 + navigation primitives | shell و مسیر تا start ایستگاه | 06, 07, 17 | deep link/Back/scroll restore/locked semantics |
- | U3 | U2 + content schema boundary | player state machine: teach → guided → assessment → recovery/result | 08–11 | reducer/use-case test؛ single-submit؛ offline/resume؛ بدون answer key در projection کودک (کلید فقط در لایهٔ ارزیاب، ADR-0039) |
- | U4 | U3 | challenge و practice | 12–13 | round recovery و empty/offline واقعی؛ `missions` همچنان unreachable |
- | U5 | U1/U2 | profile، avatar، settings و guardian | 14–15 | persistence/re-auth/privacy؛ asset crop device check |
- | U6 | همه | hardening cross-route | 01–17 | TalkBack، 200% font، predictive Back، process death، performance و child/education QA |
- هیچ Batch با screenshot تنها بسته نمی‌شود. Compose source/preview برابر `TESTED_NATIVE` نیست؛ evidence level باید جداگانه در ledger ثبت شود.
**Definition of Ready هر route**
- 1. route/data owner و state machine فعلی از Expo/API کشف و در `ROUTE_REGISTRY.md` قفل شده باشد.
- 2. contract همین خانواده و `COMPONENT_READINESS.md` خوانده شده باشد؛ outcome/focal/CTA/depth/anti-pattern ثبت شود.
- 3. stateهای قابل‌اعمال در `NATIVE_IMPLEMENTATION_BACKLOG.csv` بدون `TBD` مشخص باشند.
- 4. نیازمندی content/audio از staged contract بیاید؛ نبود صوت lesson را مسدود نکند.
- 5. reducer/use-case و navigation acceptance پیش از جزئیات بصری نوشته شود.
**Definition of Done هر route**
- - immutable `UiState` + explicit `Action/Effect`، state restoration و idempotency؛
- - unit/ViewModel/semantics tests و screenshotهای 360/390/412 + large text؛
- - بررسی RTL/math direction، IME/safe area، offline/error/resume و rapid taps؛
- - device evidence برای predictive Back، TalkBack، audio/haptic و process recreation؛
- - امتیازهای بحرانی rubric حداقل 3، P0/P1 صفر، ledger و backlog به‌روز؛
- - zero-consumer proof پیش از حذف implementation قبلی.

_منبع: `design/playbook/PAGE_UIUX_BLUEPRINT.md`_

## Pose-to-Page Mapping — DRAFT (Step Zero)

**Pose-to-Page Mapping — DRAFT (Step Zero)**
- Status: DRAFT. No numeric pose is assigned in this draft, because no
- page file in `design/playbook/pages/*.md` assigns a numeric pose.
- Numeric poses are TBD pending an owner decision, and must not be
- invented. This draft records only the family rules that the page
- files actually state, plus the current runtime whitelist.
- Correct page files: `11_RECOVERY_RESULT.md` and `12_PRACTICE_TAB.md`
- (not SESSION_SUMMARY / PRACTICE_HUB).
**Family rules (from the page files)**
- | Family | Character rule |
- | 01 Welcome / Launch | One warm hero with one small, static character WebP; one clear next action; no dense text, no fake achievement |
- | 02 Onboarding | Large character / image, one idea per step; back / skip only when the product allows |
- | 03 Auth / OTP | No character reference; calm form, label above the field, six-box OTP only if the backend really wants six digits |
- | 04 Profile Setup | Exact WebP avatars only if selectable; a giant avatar must not overwhelm the form |
- | 05 Grade / Placement | No character reference; tactile grade cards that do not look like answers; grades 2-6 are not announced as available |
- | 06 Learning Path | Static character cameos; one chosen hero; not every node shines |
- | 07 Station Start | Character in a frame, concise lesson goal, only one primary Start / Continue CTA |
- | 08 Teach / Discover | The maths manipulative is the hero; small character guide only when allowed; no endless character animation while focusing |
- | 09 Guided Practice | No character reference; soft-raised, physically responsive objects; preferred touch target >=72dp in early grades |
- | 10 Assessment | CHARACTER REMOVED: cleanest visual state, maths goal dominant, non-essential characters and celebration cues that could leak an answer are hidden |
- | 11 Recovery / Result | Restrained celebration after a valid success, with a static character WebP; feedback without shame, no harsh shake |
- | 12 Practice Tab | No character reference; only recent practice or topics that really exist, no placeholder grid |
- | 13 Challenge | Visual priority is the question; no casino-style reward artwork; reuse ChallengeIntroView2 and V2 answer / sheet primitives |
- | 14 Profile / Me | One real character WebP, if useful; real, explicit progress data; no dark dashboard, no fake badge / star / streak |
- | 15 Avatar / Settings | "Use the five real character WebPs; do not invent a new avatar"; distinct selected state |
- | 16 States | Small optional character, if not distracting; no raw developer error page, no endless spinner |
- | 17 Navigation | No character reference; V2 TabBar with consistent label / touch space / active indicator |
**Numeric pose assignment — TBD**
- | Family | Allowed families | Numeric pose | Status |
- | 01, 02, 06, 07, 08, 11, 14, 16 | Main / Number only, until owner decides Dana / Fandogh / Roka roles | TBD | OWNER DECISION PENDING |
- | 03, 05, 09, 10, 12, 17 | None | — | EXCLUDED by page contract |
- | 04, 15 | Only poses that are actually selectable / shipped | TBD | OWNER DECISION PENDING |
- Rules for the future assignment, when the owner decides:
- - Characters are always static and small in 01 / 06 / 08 / 16, never
- animated endlessly, never guilt-inducing, never revealing an answer.
- - Assessment (10) stays character-free, even after poses are assigned.
- - A pose is only assigned if its WebP is actually shipped in the
- runtime whitelist below, or is added to it by an approved transfer.
- - Main = proposed main guide; Number = proposed maths companion
- (pointing at manipulatives, never revealing answers).
- Dana / Fandogh / Roka = reserved, not shipped, until role and real
- transparent output are approved.
**Current runtime whitelist (do not rename in step zero)**
- `apps/android/core/designsystem/src/main/res/drawable-nodpi/`:
- - `shomara_char_main_01.webp`
- - `shomara_char_main_10.webp`
- - `shomara_char_number_01.webp`
- - `shomara_char_number_17.webp`
- - plus `shomara_splash_artwork.png` (splash only, untouched)
- Handoff source (not runtime): 90 WebP in
- `design/handoff-2026-10/assets/characters/`, 5 families x 18.

_منبع: `design/playbook/POSE_TO_PAGE_MAPPING_DRAFT.md`_

## design/playbook — فهرست (index)

**design/playbook — فهرست (index)**
- این پوشه، دفترچهٔ راهنمای اجرایی SHOMARA است. **کاننیکال‌ها** قراردادند؛ **یادداشت‌های اجرایی**
- (run-notes) فقط گزارشِ یک مرحله‌اند و مرجع تصمیم نیستند.
**کاننیکال‌ها**
- | فایل | چیست |
- | `../MASTER.md` | قرارداد طراحی (توکن‌ها، dialها، قوانین ایمنی کودک) — هم‌گام با ADR-0039 |
- | `../INSPIRATION_GUARDRAILS.md` | زنجیرهٔ تقدم + مرزهای کپی دولینگو — هم‌گام با ADR-0039 |
- | `MASTER_EXECUTION.md` | ترتیب اجرای کار |
- | `PAGE_UIUX_BLUEPRINT.md` | قرارداد ۱۷ خانوادهٔ صفحه — هم‌گام با ADR-0039 |
- | `COMPONENT_READINESS.md` | آمادگی کامپوننت‌ها (canonical؛ snapshotهای `docs/design/` قرارداد نیستند) |
- | `ROUTE_REGISTRY.md` | نگاشت route ↔ خانوادهٔ صفحه |
- | `IMAGE_REGISTRY.md` | فهرست تصاویرِ در انتظار مالک (P1–P8 + S1 NOT NEEDED) |
- | `DUOLINGO_COPY_CHECKLIST_FA.md` | چک‌لیست کپی دقیق UI/UX دولینگو — ۲۶۹ آیتم قابل‌تیک، خانواده‌ها ۰۱–۱۷ + کامپوننت‌های مشترک |
- | `ASSET_AND_COMPONENT_PROMPTS_FA.md` | پرامپت طراحی هر تصویر/جزء بصری (۲۱ ردیف: P1–P8، S1، N1–N12) |
- ADR کاننیکال: `../../docs/adr/ADR-0039-fully-offline-content-and-duolingo-copy-ui.md`
- (محتوای کاملاً آفلاین + کپی ساختار دولینگو؛ O1–O13 باز). فایل `ADR-0039-…md` در همین پوشه
- فقط یک stub ارجاعی به آن نسخه است.
**یادداشت‌های اجرایی (run-notes — مرجع تصمیم نیستند)**
- | `STEP_ZERO_RECONCILIATION.md` | قدم صفر: مغایرت شمارش N08، تعارض TalkBack، سه لایهٔ شخصیت |
- | `POSE_TO_PAGE_MAPPING_DRAFT.md` | نگاشت pose به صفحه — پیش‌نویس؛ pose عددی TBD |
- | `STAGE1_IMPLEMENTATION_NOTE.md` تا `STAGE5_IMPLEMENTATION_NOTE.md` | گزارش مراحل ۱ تا ۵ |
- | `PHASE_A_PATH_IMPLEMENTATION_NOTE.md` | گزارش فاز A (مسیر دولینگو) |
- | `PHASE_D_READINESS_ASSESSMENT.md` | حکم آمادگی هر خانوادهٔ فاز D |
- | `COPY_CHECKLIST_APPLICATION_NOTE.md` | به‌کارگیری چک‌لیست کپی روی صفحه‌ها: چه انجام شد، چه نشد و چرا |
**زیرپوشه‌ها**
- - `pages/` — قرارداد ۱۷ خانوادهٔ صفحه (فایل‌به‌فایل).
- - `quality/` — ledger صفحه‌ها (`SCREEN_LEDGER.csv` و…)؛ وضعیت Native فقط با شواهد دستگاهی تغییر می‌کند.

_منبع: `design/playbook/README.md`_

## Live route and state registry

**Live route and state registry**
- Verified against `apps/mobile/app/**` at N02 preflight. This table is the migration source for Native route families; the CSV ledger retains state-level evidence. Re-run discovery whenever route files or navigation calls change.
- The composition, CTA, depth and complete state contract for all page families is canonical in `PAGE_UIUX_BLUEPRINT.md`. Execution status and dependency order are machine-readable in `quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`; neither file is Native implementation evidence.
- | Expo route | Current surface | Page contract | Native destination family |
- | `_layout` | root/session/loading/error | 01, 16, 17 | `RootRoute` / app state coordinator |
- | `onboarding` | welcome, phone, OTP, profile, grade | 01–05 | `feature:onboarding` + `feature:auth` |
- | `(tabs)/_layout` | child three-tab shell | 17 | `feature:child-shell` |
- | `(tabs)/index` | learning path | 06 | `feature:path` |
- | `(tabs)/practice` | practice list/empty/history | 12 | `feature:practice` |
- | `(tabs)/profile` | child profile/me | 14 | `feature:profile` |
- | `station/[stationId]/index` | redirect/entry | 07, 16 | typed station entry destination |
- | `station/[stationId]/start` | station intro/prepare/resume | 07 | `feature:learning-player` start |
- | `station/[stationId]/play` | teach, guided, assessment, recovery, result, challenge | 08–11, 13 | `feature:learning-player` state machine |
- | `unit/[unitId]` | unit summary | 06 | `feature:path` unit detail |
- | `unit/[unitId]/jump` | placement/jump assessment | 05, 10 | `feature:placement` |
- | `avatar` | avatar workshop | 15 | `feature:profile` avatar |
- | `settings` | child preferences | 15 | `feature:settings` |
- | `parent` | guardian surface/re-auth | 15, 16 | `feature:guardian` outside child shell |
- | `missions` | legacy unreachable | 12 | no Native route until owner decision |
**Mandatory discovery on every migration batch**
- 1. Enumerate route files plus `router.push`, `replace`, `Link`, deep links and conditionally mounted modes.
- 2. Traverse fresh/returning/offline/error paths and server-driven learning slices.
- 3. Reconcile `quality/SCREEN_LEDGER.csv` and `docs/ui-v2-migration-ledger.md`.
- 4. Map the real route to a Native destination and page contract; never invent functionality.
- 5. Add a concise page override only when no existing family fits.
- 6. Keep browser parity historical; Native evidence requires Compose/device gates.
**Known migration constraints**
- - `missions` remains unreachable by product decision; do not surface it accidentally.
- - `station/play` is one file with multiple behaviorally distinct states and must not be treated as one screenshot-only screen.
- - Guardian routes remain outside the child tab shell.
- - V1/V2 files stay until dependency map proves zero consumers and Native replacement tests exist.

_منبع: `design/playbook/ROUTE_REGISTRY.md`_

## Step Zero — Reconciliation Record (SHOMARA, N08)

**Step Zero — Reconciliation Record (SHOMARA, N08)**
- Status: RECORD ONLY. This file does not change any ledger status, does not
- close any task, and does not move, rename, or delete any file.
- No UI code, no drawable, and no deletion is included in this step-zero branch.
- Base: `main` at `8f4411185ecd43581f19074d88c5b986633a82fc`
- Working branch in roadmap: `native/n08-ux-completion`
- Current task in roadmap: `N08-06`
**1. Counting rule for N08 — must be recorded, not assumed**
- - `harness/roadmap.json` (live read, 2026-11-05) for N08:
- 5 DONE (N08-01, N08-02, N08-03, N08-04, N08-05)
- + 1 DONE_WITH_BLOCKER (N08-13)
- + 1 IN_PROGRESS (N08-08)
- + 6 TODO (N08-06, N08-07, N08-09, N08-10, N08-11, N08-12)
- = 13 tasks in total.
- - `START_HERE.md` says `N08_7_OF_13_DONE`.
- - The seventh item is only explained if N08-15 is counted:
- N08-15 (splash / launch state / DEBUG-only simulated OTP) exists in code
- and in `harness/WORKLOG.md` as IN_PROGRESS, but it is absent from
- `harness/roadmap.json` and from `START_HERE.md`.
- - Rule to apply when the ledger is next updated (not yet applied here):
- register N08-15 in `roadmap.json` with its real status, then make
- `START_HERE.md` and `roadmap.json` show the same number. Until then,
- neither "6 of 13" nor "7 of 13" is quoted as the verified count.
- - A task being DONE is not the same as a backlog row being TESTED_NATIVE.
- A row in `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`
- changes only with evidence for that row.
**2. N08-15 — real status, not guessed**
- - Implemented in debug: splash artwork via `ShomaraSplashDrawables`,
- launch cream `#FDF4E5` (different from canvas `#FFF8EF`),
- artwork 941x1672, never stretched, cropped, or redrawn.
- - DEBUG OTP provider is compiler-isolated: it lives only in the debug
- source set, the release wiring reports a null factory, and the
- simulated `sim-dev-session` token is rejected in production.
- - Verifier `scripts/verify-demo-auth-isolation.mjs` explains the
- `verify:static:all` count moving from 89 to 90. That is a count change,
- not a contradiction — but the current count still needs a local run
- to be confirmed (see §9).
**3. TalkBack — conflict recorded as unresolved**
- - `START_HERE.md` top table, row M13 (2026-11-04), says the N08-02
- TalkBack REAL gesture walkthrough blocker was closed on an emulator.
- - Snapshot entries in the same file say the real TalkBack gesture path
- is honestly still `NATIVE_PENDING` and only semantics tests exist.
- - This step-zero record does NOT claim TalkBack PASS.
- TalkBack is a device gate, not a semantics gate. Its status stays
- `UNVERIFIED` / `NATIVE_PENDING` until a device run is reported.
- - Invariant to check in that device run (from MASTER_EXECUTION):
- a touchable locked node must be read as "locked", not as "disabled".
**4. Characters — three layers, kept separate**
- - Handoff source: 5 families x 18 files = 90 WebP in
- `design/handoff-2026-10/assets/characters/` (Dana, Fandogh,
- Main, Number, Roka), 800x800 with alpha, under 70KB.
- - Runtime today: only 4 drawables in
- `apps/android/core/designsystem/src/main/res/drawable-nodpi/`
- (`shomara_char_main_01.webp`, `shomara_char_main_10.webp`,
- `shomara_char_number_01.webp`, `shomara_char_number_17.webp`),
- plus `shomara_splash_artwork.png` (which must stay untouched).
- - Enum today (`ShomaraCharacter.kt`): only Main and Number, poses 1-18.
- Dana, Fandogh, and Roka are in the ADR-0035 cast but not in the enum.
- - Proposed canonical runtime path (NOT applied yet):
- `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_<family>_<NN>.webp`
- with the whitelist in `ShomaraCharacterDrawables.kt`.
- Existing 4 files are not renamed in step zero.
- - Runtime-vs-handoff sha256 / dimensions / alpha were not compared
- here; the word "lossless" in code comments is not repeated as fact
- until that comparison is done locally or from the repo files.
- - Main / Number / Roka background-removal artefacts (faint foot shadow;
- Roka also a faint piece near the tail and a pink shadow under the
- foot) are a format issue for the designer, not a design change.
- Use the current files meanwhile, only where the page contract allows.
**5. Me avatar — separate system, pending owner decision**
- - `ShomaraMeScreen` default avatar comes from an abstract preset
- catalog (sun / leaf / cloud / moon; default = sun), not from a
- character WebP. The catalog mirrors `CHILD_AVATAR_PRESETS`.
- - The preset system and the character system stay separate until the
- owner decides whether Me migrates to character poses. No character
- pose is presented as an avatar preset in step zero.
**6. Stale text in ZCODE.md — to be replaced, not silently ignored**
- - `ZCODE.md` still says: until N02-07 is really green, do not change
- any `NATIVE_PENDING` row and do not start N03.
- - The current phase is N08. That paragraph must be replaced with a
- reference to the current N08 status when the ledger update is made.
- `design/playbook/ZCODE_MASTER_PROMPT.md` must be aligned at the same
- time, or a later agent will return to N02.
**7. Font and splash — resolved facts, open supply**
- - Expo Vazirmatn is an npm dependency loaded via expo-font
- (400 / 600 only), not a committed TTF. The Native font gap remains:
- Native needs an owner-approved TTF in `res/font`; a random download
- is forbidden (ADR-0037).
- - Splash artwork usage is confirmed (see §2). The P1 Welcome hero
- image prompt is a separate image; it does not replace the splash file.

_منبع: `design/playbook/STEP_ZERO_RECONCILIATION.md`_

## UX + Visual Review Rubric (apply to EVERY route and state)

**UX + Visual Review Rubric (apply to EVERY route and state)**
- Evaluate each dimension 0–4 (0 broken, 1 weak, 2 usable but deficient, 3 good, 4 excellent), with a concrete source path or screenshot for each number. Scores guide work, **not** a substitute for actual acceptance tests.
- | Dimension | To examine | Evidence that counts |
- | Orientation | Where am I / what do I do / what next? | 3-second first-glance review, label + CTA |
- | Task clarity | Instructions understandable for target age | user flow, readable Persian copy |
- | Flow friction | unnecessary taps, repeated confirmations, dead ends | end-to-end interaction trace |
- | Feedback | success/retry/loading/offline states | visual states + functional tests |
- | Visual composition | focal point, consistency, breathing room | before/after screenshots |
- | Inspiration fit | adopt/adapt/reject rationale, purpose over fashion, page anti-patterns | completed review card + guardrail reference |
- | Clay craft | semantic flat/hint/soft/featured depth without blur clutter | screenshots in normal/pressed state + depth reason |
- | Motion & haptics | purposeful, immediate, cancelable, reduced motion | on-device or explicit limited browser test |
- | Accessibility | labels, touch sizes, focus, TalkBack semantic | a11y tree and real-device test when possible |
- | Responsiveness | 360/390/412dp, text scale, keyboard | screenshots and overflow probe |
- | Curriculum integrity | correct math representations and answer evaluation | contract tests + station content source |
- | Robustness | resume, fast taps, offline, errors, images unavailable | negative-path tests |
**Acceptance for each route:** all critical dimensions ≥3 where verified; zero P0/P1; blockers remain open; visual judgement based on inspected screenshots. Record evidence level separately: `SOURCE_ONLY`, `TESTED_BROWSER`, `TESTED_COMPOSE`, `TESTED_DEVICE`, `TESTED_WITH_TALKBACK`. Do not fake a number for untested Native or children-in-the-loop UX. `UNVERIFIED` is permitted.
**Screen observation protocol**
- 1. Capture initial screenshot at 360/390/412dp and a large-text state when the platform is runnable.
- 2. Describe top 3 observed issues and rank P0–P3.
- 3. Record outcome, focal object, design dials, anti-patterns and permitted depth tier; inspect actual JSX/styles/tokens/data flow and the relevant page contract.
- 4. Modify the *screen and reusable components* without blindly wrapping V1 in ClaySurface.
- 5. Capture after (same viewport/state); compare visually, fix overlaps and visual hierarchy.
- 6. Exercise every meaningful state: loading, disabled, correct/retry, back, offline, empty and error **as applicable**.
- 7. Test touch, semantics/a11y, state persistence, process recreation and one full journey. Run platform-appropriate gates.
- 8. Update `SCREEN_LEDGER.csv`, record evidence level and keep Android device gates open until genuinely run.
**Clay anti-pattern reject list**
- - Single large embossed panel swallowing every item; excessive blur/elevation everywhere.
- - Low-contrast text atop milky clay; icon-only CTA without label.
- - Character larger than math objective; too many bouncing elements.
- - Mixed icon stroke weights; flat CTAs beside raised CTAs without semantic intent.
- - Press lip animation that displaces neighboring layout; slow/hard-to-cancel motion.
- - Decorations representing mathematical shapes incorrectly.
- - Legacy appearance leaking through navigation to a V2 page.

_منبع: `design/playbook/UX_REVIEW_RUBRIC.md`_

## SHOMARA — phase-aware execution order

**SHOMARA — phase-aware execution order**
- You are the accountable Principal Android/Compose engineer, migration engineer, child UX designer, accessibility QA and curriculum integration engineer for SHOMARA. This is a code-changing assignment. Expo is a behavioral reference until cutover, not the target architecture. Never fabricate evidence.
**Target**
- Follow the task selected by the root harness and progressively deliver a coherent Android Native SHOMARA using canonical `design/` materials and the existing five WebP characters. Use Duolingo-inspired learning principles without copying protected identity. Do not fabricate Rive, artwork, audio or Native evidence. Preserve Persian RTL, backend contracts and server-authoritative…
**Mandatory source load**
- Start at the actual repository root; never assume a machine-specific path.
- Read repo `AGENTS.md`, `START_HERE.md` and `ZCODE.md`; inspect Git state; run `node tools/harness.mjs validate` and `node tools/harness.mjs next`.
- Read `docs/DESIGN_RULES.md § product design/SKILL.md`, `docs/DESIGN_RULES.md § screen execution/SKILL.md`, `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and relevant page contracts. For token/theme/component work read `docs/DESIGN_RULES.md § design system/SKILL.md` and `design/playbook/COMPONENT_READINESS.md`. For content/audio/CMS work read `docs/DESIGN_RULES.md § content/SKILL.md`. For Nat…
- Run `node design/playbook/quality/validate-pack.mjs`; if it fails, diagnose package files, never silently ignore.
**The canonical Design Master and tokens beat illustrative examples.** Do not create a parallel design system. Expo V2 components provide behavior and migration evidence; Compose primitives become the final implementation. Historical V1 parity is not the target. Previous commits are not proof of quality.
**Nonstop bounded delivery loop**
**Do not stop after audit.** Execute bounded harness tasks with verification and continue while a safe task remains. If interrupted, update `START_HERE.md`, `harness/roadmap.json`, `harness/WORKLOG.md` and the route ledger; do not create a competing status source.
- For EACH actual screen (including distinct modes, modals and critical error/loading states), always:
- 1. **Discover** real route ID, component, caller, data contract, available paths and states. Reconcile `ROUTE_REGISTRY.md`, `docs/ui-v2-migration-ledger.md` and the screen ledger without inventing routes.
- 2. **Read** the exact `design/playbook/pages/*.md` family contract and canonical `design/MASTER.md`. If no family matches, create a short page override following Master; do not invent functionality.
- 3. **Observe** running UI and interactions before editing at 360/390/412dp. Assess clarity, taps, layout, child input, visual softness, Persian readability, states, motion and asset crop. Never say "reviewed UI" after reading source only.
- 4. **Improve** both UX and visuals: reduce friction, one main CTA, tactile lip, subtle selected/spring states, consistent clay depth only where purposeful, canonical tokens, correct math gesture/RTL/geometry, stable keyboard, recoverable loading/error, accessible semantics. Keep existing five WebP characters and their actual mapped images, not invented poses. No new asset depen…
- 5. **Verify** actual navigation, answer/submission/idempotency, correct progress, offline/retry, back/resume, selected/disabled/loading, TalkBack semantics, reduction of motion and touch sizing. Add meaningful tests; do not weaken old ones to pass.
- 6. **Visually inspect after** screenshot under identical conditions, fix P0/P1 and material P2 defects; log evidence. Don't mark browser screenshots as Native QA.
- 7. **Ledger** write route status, a11y, tests, evidence and blockers. Separate Expo/browser evidence from Native/device evidence. Handle shared bugs once and rerun affected screens.
**Family assignments (read each page file in turn)**
- 01 Welcome & launch → 02 Onboarding → 03 Auth/OTP/TextField2/CodeInput2 → 04 Profile setup → 05 Grade/placement → 06 Path/chapter → 07 Station start → 08 Teach/discover → 09 Guided practice/math tools → 10 Assessment → 11 Recovery/feedback/result → 12 Practice tab → 13 Challenge intro/player → 14 Me/profile → 15 Avatar/settings → 16 Offline/loading/empty/error → 17 Navigation/t…
- These are categories, NOT invented file routes. Existing migrated screens must be **re-audited**, not skipped. Existing `docs/ui-v2-migration-ledger.md` may be incomplete. Begin with auth/onboarding and practice/me or any P0/P1 found; do not ignore already V2 pages when doing cross-route visual coherence.
**Priority rules**
- - P0 crashes, misleading score, security/data corruption, broken flows → fix first.
- - P1 RTL, overflow, tap targets, focus, missing error handling, inappropriate feedback, clipped WebP → fix next.
- - P2 coherent clay depth, layout, character balance, motion/smoothness, weak hierarchy → then fix.
- - P3 micro-polish after functional gates.
- No cosmetic redesign may break existing learning flows. No new `lives/hearts/stars/streaks`. No inaccessible drag-only math tasks: allow tap/select alternative. ST07 curriculum-specific UI not to be applied indiscriminately to ST01. Avoid repetitive confetti/loops during solving.
**CONTENT LIBRARY — separate staged integration, not automatic**
- Read `docs/DESIGN_RULES.md § content/SKILL.md` first. It routes to `content-library/INTEGRATION_GATE.md`, `content-library/integration/*.md`, `content-library/derived/*.json` and the exact original source required by the task.
- Import educational material progressively and safely:
- - Phase C0: exact provenance/metadata validation, check actual repo API schema/authoritative stages, write compatibility matrix.
- - Phase C1: draft-only typed fixture for one compatible ST07 step/item, feature flag OFF; do not touch production. ST07 pilot ≠ current ST01.
- - Phase C2: prototype one T01/T05/T13/T15 interactive task through existing V2 components, test semantic math and Tap alternative.
- - Phase C3: full pilot only after proper mapping; no fake graphics/audio.
- - Phase C4: validate and optionally stage CSV **metadata** into existing authorized admin pipeline, after code schema check. These are NOT playable audio files.
- - Phase C5: explicit owner review of new curriculum and production enablement. Leave on HOLD when approval absent; don't block safe UI migration.
- Documents contain proposals/unfinished owner decisions; authoritative backend/approved grade behavior wins. Ask owner only for materially consequential product/content choices (e.g., changing grading thresholds or enabling draft station). This does not excuse delaying unrelated UI fixes.
**Verification mandate**
- - Run `npm run verify:design-pack`, `npm run verify:project-skills`, `npm run verify:design-governance`, and relevant npm/workspace gates; never fabricate results.
- - Test route-level real behavior, not only string presence. Cover journey scripts in `quality/QA_JOURNEYS.md`.
- - Capture before/after at multiple widths and review visual impact (not just save files).
- - Preserve 5 WebP assets' geometry; no cropped limbs; inspect actual images.
- - Native Android: when emulator or device exists, check real presses, back, keyboard, TalkBack and haptic. If not available, mark `NATIVE_PENDING`, give executable instructions for owner; Metro export or Chromium aren't Native QA.
- - Review tests for false positives; protect security, server-authoritative, offline-sync, idempotency, user data.
- - Update root repo migration ledger and checkpoint per batch. Keep code changes bounded and testable. No mass deletion or forced git resets.
**Source control**
- Stay on the phase branch, preserve user changes, and do not overwrite repository files without comparing. Make focused commits after verification. Do not push or merge without permission and do not modify production data.
**Done rule**
- Do **NOT** say "all done" until every reachable mobile route and state is inventoried, redesigned/verified, UX defects fixed, and no P0/P1 persists. Native test stays separately pending if not run. Content import remains staged and explicitly unapproved unless owner authorizes release. A passing test count is NOT proof of beauty, delight, or child usability.
**Response**
- Minimal Persian progress after a meaningful batch: exact routes changed, actual defects fixed, tests with exit codes, screenshots, known remaining routes, last commit. Avoid 20-page reports; **continue implementing** until you hit a genuine environment/session blocker. A separate next call should resume the ledger/checkpoint, never re-audit from zero.
- START NOW: run the harness and design-pack integrity checks, execute the selected phase task, and update canonical evidence before advancing.

_منبع: `design/playbook/ZCODE_MASTER_PROMPT.md`_

## SHOMARA Android build skill

- name: shomara-android-build
- description: Diagnose, verify, build, or prepare SHOMARA Android Native artifacts. Use for Android SDK/JDK/Gradle setup, CI build failures, N02 foundation gates, debug APK requests, build reports, checksums, signing boundaries, or release-readiness handoff.
**SHOMARA Android build skill**
- Produce reproducible evidence; never turn a missing toolchain into a green result.
**Required workflow**
- 1. Read `AGENTS.md`, `START_HERE.md`, run `node tools/harness.mjs validate` and `node tools/harness.mjs resume`.
- 2. Read `docs/notes/ANDROID_BUILD_ENVIRONMENT.md` and the active roadmap task.
- 3. Run `npm run android:doctor`. If it reports `BLOCKED_ENV`, fix only the named JDK/SDK requirement and rerun.
- 4. Run `npm run android:gate` for unit/lint/compile evidence.
- 5. Run `npm run android:assemble:debug` only when a debug APK is requested or the active task permits it.
- 6. Record command, exit code, generated report path, APK SHA-256 when present, and all unverified device/signing gates.
**Hard boundaries**
- - Use the checked-in Gradle wrapper and pinned catalog; do not substitute a global Gradle for evidence.
- - Do not skip preflight, tests, lint or compile to obtain an APK.
- - Do not add secrets, keystores, production config, release signing or publication before N10 and HG-05.
- - A debug APK is not store-ready, production-ready or device-tested.
- - Do not claim Native success from static source checks, browser tests, previews or a report whose status is `BLOCKED_ENV`/`FAILED`.
- - Keep `build-reports/`, `build/`, APK/AAB and local SDK paths generated and untracked.
**Result interpretation**
- - `READY`: environment only; compilation has not yet passed.
- - `PASS`: requested Gradle task set exited zero.
- - `BLOCKED_ENV`: required JDK/SDK is absent or invalid; preserve the blocker.
- - `FAILED`: toolchain was ready but Gradle or APK verification failed; fix the first real failure.

_منبع: `docs/DESIGN_RULES.md § build/SKILL.md`_

## SHOMARA design system skill

- name: shomara-design-system
- description: Define, implement, generate, migrate, or review SHOMARA design tokens, Jetpack Compose theme, components, Claymorphism depth, typography, motion, semantics, screenshots, and component APIs. Use for N03 design-system work, token codegen, shared UI primitives, component state matrices, accessibility, or visual consistency.
**SHOMARA design system skill**
- Build one accessible cross-platform system; do not design isolated page-local styles.
**Required workflow**
- 1. Read `AGENTS.md`, `START_HERE.md`, run harness `validate` and `next`, and obey the active task dependency graph.
- 2. Read `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and `design/playbook/COMPONENT_READINESS.md`.
- 3. For Compose, read `design/playbook/NATIVE_IMPLEMENTATION.md`; for a route, also load `docs/DESIGN_RULES.md § screen execution/SKILL.md` and its page contract.
- 4. Inventory existing token consumers before changing schema or generated output.
- 5. Define purpose, API, state matrix, semantics, RTL/math direction, motion fallback and evidence before implementation.
- 6. Generate platform outputs from the single canonical token source; never hand-edit generated files.
- 7. Run the gates routed by `references/review-checklist.md` and record device-only checks as `NATIVE_PENDING`.
**Hard boundaries**
- - Keep `packages/design-system/src/tokens.json` canonical until an approved migration explicitly replaces it.
- - Use semantic tokens; never introduce feature-local hex, shadow, radius, spacing, duration or typography scales.
- - Apply Clay depth only to clarify hierarchy or tactility. Never use depth on text or as the only state signal.
- - Keep one featured surface per decision viewport and make assessment quieter than teaching.
- - Preserve 48dp general targets and 72–80dp early-grade manipulatives where the content contract requires them.
- - Respect reduced motion, 200% font scale, TalkBack and semantic math direction.
- - Do not adopt external palettes, fonts, dependencies or copied screen recipes. Inspiration is filtered through SHOMARA contracts.
- - Do not claim `TESTED_NATIVE` without a real build plus emulator/device evidence.
**Evidence**
- Record token diff, generated drift result, state coverage, semantics result, 360/390/412 screenshots, large-text/RTL evidence and remaining human/device approvals. A visually pleasing preview alone is not a gate.

_منبع: `docs/DESIGN_RULES.md § design system/SKILL.md`_

## Design-system review checklist

**Design-system review checklist**
- Load this reference only for component/token implementation or review.
**Before code**
- - Confirm active harness task permits the changed paths.
- - List current consumers and migration impact.
- - Link the canonical token(s) and component readiness row.
- - Declare purpose, non-use cases, states and source of truth.
**Static review**
- - No raw visual values in feature code.
- - No duplicated semantic token with a different name.
- - State is immutable; component emits events and does not decide learning truth.
- - Pressed/disabled/loading keep layout stable.
- - Color, depth, sound or motion is never the only signal.
- - RTL does not mirror semantic mathematics.
**Evidence routing**
- | claim | minimum evidence |
- | generated | schema validation + drift check |
- | implemented | compile + focused unit/semantics tests |
- | visually reviewed | comparable screenshots at required widths/states |
- | accessible | semantics checks plus pending/real TalkBack evidence |
- | tested native | emulator/device journey and exact command |
- Mark unavailable device evidence `NATIVE_PENDING`; never infer it from source or browser output.

_منبع: `docs/DESIGN_RULES.md § design system/references/review-checklist.md`_

## SHOMARA learning content skill

- name: shomara-learning-content
- description: Analyze, author, validate, stage, or integrate SHOMARA grade-one curriculum, stations, game patterns, Persian narration, audio metadata, offline content packages, or CMS workflows. Use whenever work touches content-library, ST01–ST25, T01–T15, skills/mastery content, ST07, textbook mapping, TTS, audio approval, or educational QA.
**SHOMARA learning content skill**
- Treat research as evidence and authoring input, never as enabled production content.
**Required workflow**
- 1. Read `AGENTS.md`, `START_HERE.md`, run harness `validate` and `next`, and stay within the active task.
- 2. Read `content-library/INTEGRATION_GATE.md`, `content-library/integration/SOURCE_AUDIT.md` and, for schema/audio/CMS work, `content-library/integration/AUTHORING_CONTRACT_GAPS.md`.
- 3. Select only the required originals using the routing table below. Never edit `content-library/originals/**`.
- 4. Reconcile the proposal with server contracts and `content-library/integration/REPO_COMPATIBILITY.md`.
- 5. Advance content one state at a time: `SOURCE_ONLY → MAPPED_TO_REPO → STAGED → VALIDATED → HUMAN_REVIEWED → APPROVED → ENABLED`.
- 6. Run `npm run verify:content-library` and record unresolved issue IDs. A green static validator is not curriculum approval.
**Reference routing**
- - Curriculum sequence and book pages: `content-library/originals/shomara-stage1-study.md`.
- - Evidence and child interaction: `content-library/originals/shomara-external-research.md` and `content-library/originals/shomara-stage2-research.md`.
- - Station/skill map: `content-library/originals/shomara-stage4-architecture.md`.
- - Audio, feedback, motion and T01–T15: `content-library/originals/shomara-stage5-shared-references.md`.
- - Authoring schema and validation: `content-library/originals/shomara-stage6-spec-format.md`.
- - Only complete pilot: `content-library/originals/shomara-stage7-pilot-ST07.md` plus its CSV manifest.
- - Phase ownership and promotion gates: `content-library/integration/PHASE_INTEGRATION.md`.
- - Authoring/published/client split, lifecycle mapping and CMS gaps: `content-library/integration/AUTHORING_CONTRACT_GAPS.md`.
**Hard boundaries**
- - Keep correctness, evaluator configuration, next step, mastery and pass decisions owned by the authoritative local evaluator layer over the versioned package (ADR-0039; the server-side authoring stack’s fate is owner decision O6); authoring answers never enter the child client.
- - Maintain separate authoring, published-package and child-projection models; snapshot-test answer/evaluator/threshold stripping for every adapter.
- - Preserve stable station/audio IDs and source provenance. Renaming is a reviewed contract migration.
- - Audio CSV rows are draft metadata, not audio files. Only `approved` assets with checksum, duration and rights may ship.
- - Treat `voice`/`rate` CSV fields as provider hints until human approval; store generated/uploaded binary versions in a separate asset lifecycle with RBAC/audit/rollback.
- - Missing audio must not block a lesson; show text, continue safely and emit privacy-safe diagnostics.
- - Do not copy textbook imagery. Use new coded or licensed assets and retain rights evidence.
- - Do not resolve `OPEN_DECISION` or `SOURCE_CONFLICT` silently. Reference its audit ID in the ADR, content review or task evidence.
- - Do not claim child, educator, pronunciation, device or accessibility approval without corresponding human/device evidence.
- - Minimize child telemetry: do not log answer keys or raw answers by default; require an explicit privacy/retention decision for any response payload.
**Implementation order**
- Validate the authoring schema and server boundary first. Implement ST07 as a nonproduction draft pilot using T01, T05, T13 and T15. Only after its acceptance gate may the remaining 24 station specifications be produced in the roadmap batches.

_منبع: `docs/DESIGN_RULES.md § content/SKILL.md`_

## SHOMARA product design skill

- name: shomara-product-design
- description: Design, audit, migrate, or review SHOMARA Android/Expo screens and learning interactions. Use for every SHOMARA product UI/UX, route hierarchy, child journey, accessibility review, responsive/RTL decision, character usage, audio/CMS surface, or Duolingo-, AVA-, Claymorphism-, or UI/UX-Pro-Max-inspired learning-flow task.
**SHOMARA product design skill**
- Build a Persian, Android-first mathematics learning product. Filter every external inspiration through SHOMARA safety, curriculum, accessibility and brand constraints.
**Start every task**
- 1. Read `AGENTS.md`, `START_HERE.md`, then run `node tools/harness.mjs validate` and `node tools/harness.mjs next`.
- 2. Read `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and `docs/DESIGN_RULES.md § screen execution/SKILL.md`.
- 3. Read `design/playbook/PAGE_UIUX_BLUEPRINT.md`, then only the matching page contract in `design/playbook/pages/` plus its direct dependencies.
- 4. Reconcile the real route/state with `design/playbook/ROUTE_REGISTRY.md`, `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` and `design/playbook/quality/SCREEN_LEDGER.csv`; never invent a route or implementation status.
- 5. For tokens, shared components, Clay depth or Compose theme, load `docs/DESIGN_RULES.md § design system/SKILL.md`; for Native route work also read `design/playbook/NATIVE_IMPLEMENTATION.md`.
- 6. For curriculum, audio, CMS metadata or educational content, load `docs/DESIGN_RULES.md § content/SKILL.md`; never promote an original directly into runtime.
**Binding workflow**
- `DISCOVER → OBSERVE → AUDIT → DESIGN → IMPLEMENT → TEST → CAPTURE → LEDGER`
- - Treat current Expo V2 as behavioral/migration reference, not the final Native architecture.
- - Record the page's outcome, focal object, design dials, anti-patterns and reason for every depth tier before decoration.
- - Keep one primary action per decision state and preserve loading, offline, empty, error, disabled, correct, retry, back and resume states where relevant.
- - Use canonical tokens from `packages/design-system/src/tokens.json`; do not add page-local hex, spacing or radius values.
- - Keep progression, evaluation, mastery and Station Pass owned by the authoritative local source (bundled content package + versioned local evaluator, ADR-0039) — the UI renders, never decides. Never ship answer keys in the child client.
- - RTL controls interface flow; mathematical direction and geometry keep their semantic direction.
- - Require 48dp minimum touch targets; prefer 72–80dp for early-grade manipulatives.
- - Do not mark Native as tested without a real Android build/device or emulator run.
- - Do not install or import an external UI generator, palette, font or framework merely because it appears in an inspiration source.
**Evidence rule**
- Record exact source paths, state, command/exit code, before/after evidence and open blockers. Use `UNVERIFIED`, `NATIVE_PENDING` or `BLOCKED` instead of optimistic claims. Update the route ledger and canonical harness in the same checkpoint.
**Stop and ask**
- Pause only for product decisions that materially change identity, curriculum, grading, privacy, production data, licensing or release/signing. Safe consistency fixes and implementation inside an approved task do not require another confirmation.

_منبع: `docs/DESIGN_RULES.md § product design/SKILL.md`_

## SHOMARA screen execution skill

- name: shomara-screen-execution
- description: Execute route-by-route SHOMARA UX implementation and migration with evidence. Use for Android Native or Expo screen work, page audits, route/state inventory, visual consistency, accessibility, responsive RTL, learning interactions, route migration, screenshots, QA ledgers, and Design System adoption.
**SHOMARA screen execution skill**
- Implement a Persian, Android-first mathematics product—not a concept mockup. Expo V2 is a temporary behavioral reference; Kotlin/Jetpack Compose is the target.
**Mandatory read order**
- 1. Read repository `AGENTS.md`, `START_HERE.md`; inspect branch/dirty files; run harness `validate` and `next`.
- 2. Read `docs/DESIGN_RULES.md § product design/SKILL.md`, `design/MASTER.md` and `design/INSPIRATION_GUARDRAILS.md` for brand and product invariants.
- 3. Read `design/playbook/MASTER_EXECUTION.md`, `design/playbook/UX_REVIEW_RUBRIC.md`, `design/playbook/PAGE_UIUX_BLUEPRINT.md` and `design/playbook/ROUTE_REGISTRY.md` for execution policy.
- 4. Read only the matching contract(s) in `design/playbook/pages/`.
- 5. For Compose work read `design/playbook/NATIVE_IMPLEMENTATION.md`; for token/component/theme work load `docs/DESIGN_RULES.md § design system/SKILL.md` and `design/playbook/COMPONENT_READINESS.md`.
- 6. For educational content/audio/CMS changes read `docs/DESIGN_RULES.md § content/SKILL.md` and only the references it routes to.
**Precedence**
- Safety, approved product decisions, domain contracts and the authoritative local source (bundled package + local evaluator, ADR-0039) > `design/MASTER.md` and canonical tokens > this execution process > page-family layout guidance > content drafts > examples.
- If binding sources conflict, record exact paths and resolve safely. Never silently invent a requirement or weaken a verifier.
**Non-optional route loop**
- `DISCOVER → READ → OBSERVE → AUDIT → DESIGN → IMPLEMENT → TEST → CAPTURE → LEDGER`
- - Discover the exact route, callers, owner data, entry/exit and reachable states.
- - Observe the actual UI before editing; source reading alone is not visual review.
- - Fix behavior and hierarchy before decoration. Keep one obvious primary CTA.
- - Record the focal object, permitted depth tier and page-specific anti-patterns; Clay is not a default container treatment.
- - Test real navigation, duplicate actions, offline/retry/back/resume, RTL/math direction and accessibility.
- - Capture comparable evidence and update `quality/SCREEN_LEDGER.csv` plus the root harness checkpoint.
**Hard rules**
- - Never claim Native QA without an Android build and device/emulator evidence.
- - Never create fake audio/art assets, fabricate screenshots or infer PASS from source text.
- - Use `packages/design-system/src/tokens.json`; no random page-local visual constants.
- - Preserve authoritative answers, progression, mastery and Station Pass produced only by the local evaluator layer (ADR-0039).
- - Keep answer keys/evaluators out of the child client.
- - No lives, punitive streaks, currency, loot boxes, store or leaderboard.
- - V1/V2 and historical goldens remain until zero consumers and replacement gates exist.
- - Make bounded, committed checkpoints; preserve unrelated user changes.
**Load-on-demand references**
- - Page behavior: `design/playbook/pages/01_*.md` through `design/playbook/pages/17_*.md`.
- - Compose patterns and gates: `design/playbook/NATIVE_IMPLEMENTATION.md`.
- - Full-journey regression: `design/playbook/quality/QA_JOURNEYS.md`.
- - Per-route evidence: `design/playbook/quality/REVIEW_CARD.md` and `design/playbook/quality/SCREEN_LEDGER.csv`.
- - Native order/status: `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`; keep it `NATIVE_PENDING` until its named evidence exists.
- - Interrupted session: root `ZCODE.md` and canonical `START_HERE.md`; `quality/EXECUTION_CHECKPOINT.md` is historical evidence only.
- Stop only before a material product/curriculum/privacy/licensing/production/release decision. Continue safe implementation while a relevant task remains executable.

_منبع: `docs/DESIGN_RULES.md § screen execution/SKILL.md`_

