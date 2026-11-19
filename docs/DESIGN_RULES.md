# DESIGN_RULES.md — قواعد طراحی و توکن‌ها، فشرده

> استخراج مکانیکی از 26 سند design/skill.
> برای هر سند: مقادیر عددی/رنگ/توکن و خطوط قاعده‌ای نگه داشته شده، بقیه حذف است.

## SHOMARA inspiration guardrails


- این اعداد requirement بصری نیستند؛ نقطهٔ شروع review هستند و هر انحراف باید دلیل داشته باشد.
- هر decoration، card یا animation را موقتاً حذف کن. اگر task واضح‌تر یا دسترس‌پذیرتر شد، آن عنصر برنمی‌گردد. اگر hierarchy از بین رفت، عنصر باید با token semantic و کمترین شدت لازم بازگردد.

_منبع: `design/INSPIRATION_GUARDRAILS.md`_

## SHOMARA Design Master — Native V3 direction

- Canvas: warm cream `v2.color.canvas` (`#FFF8EF`).
- Keep 24dp preferred screen inset, with adaptive reduction only when verified at 360dp.
- Minimum control target: 48dp; preferred early-grade manipulative: 72–80dp.
- Verify 360/390/412dp, font scale up to 200%, keyboard, landscape risk and long Persian strings.

- SHOMARA is a calm, joyful Persian mathematics garden for children. It should feel tactile and warm without becoming toy-like noise. The child must understand within three seconds:
- 2. what they should do now;
- Duolingo is the UI model (ADR-0039): page layouts, path geometry, lesson loop, feedback and component system are copied, adapted to Persian RTL and SHOMARA v2 tokens; learning-by-doing, one…
- Text never receives decorative depth, and depth is never the only carrier of state or meaning.
- Vazirmatn is the interface typeface. Numeric/math content uses semantic LTR isolation where required.
- Body content may scroll; critical CTA must remain reachable without obscuring content or keyboard.
- Characters support orientation and emotion. They never dominate an assessment or reveal an answer.
- Never expose answer keys, guardian data, internal errors or sensitive identifiers. The answer key lives only in the local evaluator layer (ADR-0039) and never enters the child lesson project…

_منبع: `design/MASTER.md`_

## Component readiness contract — Native Design System V3

- `NATIVE_VALIDATED`: فقط پس از اجرای semantics + screenshot در 360/390/412dp و 200% font + device/TalkBack و ثبت artifact/SHA قابل استفاده است.
- | Button | default/pressed/focused/disabled/loading | action یکتا، target حداقل 48dp، loading بدون پرش | semantics + fast tap |
- | Manipulative | idle/active/dragging/accepted/retry/locked | target ترجیحاً 72–80dp و tap alternative | math/RTL + child QA pending |

- هر component قبل از کدنویسی باید این قرارداد را داشته باشد:
- | خانواده | stateهای الزامی | نکتهٔ آموزشی/دسترس‌پذیری | gate اصلی |
- | tier | کاربرد مجاز | ممنوع |
- pressed state باید depth را کاهش دهد و feedback لمسی بدهد، بدون جابه‌جایی layout یا تأخیر در action. Depth هیچ‌گاه تنها حامل معنا نیست.
- componentی که فقط preview یا source/JVM logic test دارد `NATIVE_PENDING` می‌ماند؛ `TESTED_NATIVE` یا `NATIVE_VALIDATED` بدون instrumentation, screenshot و device evidence ممنوع است.

_منبع: `design/playbook/COMPONENT_READINESS.md`_

## Master Execution Contract — SHOMARA Native learning UX

- Navigation: retain orientation, disable double-trigger, preserve scroll/lesson resume, Android Back predictable, touch targets ≥48dp (ST07 spec may require 72dp targets f…
- Test 360, 390, 412dp minimum, larger system fonts, keyboard and safe areas; minWidth:0 on flex text; verify no overlapping nav/hero/CTA.
- Touch targets generally 48dp minimum; educational active objects per curriculum 72–80dp preferred/required where specified; 16dp separation, 24dp edge inset for ST07 task…

- Canvas calm; hero/educational manipulative prominent; never place everything in a bulky clay container.
- One top-level visual hero, **but never sacrifice question/answer controls** for decoration. For assessment, the math object is the hero, not a character.
- Each task starts with instruction and ends with a natural next action; errors actionable, never punishing.
- C. Slow network/failed audio/offline/retry must preserve state; do not spin forever.
- Touch targets generally 48dp minimum; educational active objects per curriculum 72–80dp preferred/required where specified; 16dp separation, 24dp edge inset for ST07 tasks.
- Review in small batches. Fix P0/P1 before cosmetics. Visual improvement must be observed rather than inferred from `tokens` or passing parity.

_منبع: `design/playbook/MASTER_EXECUTION.md`_

## N08R — Native UI/UX Visual Refinement (Duolingo-level, Clay)

- Soft Amber برای تأکید بصری
- Soft Sky Blue برای اطلاعات
- قرارداد چهار سطح عمق Flat / Hint / Soft / Featured حفظ شود.
- در هر Viewport حداکثر یک سطح Featured داشته باش.
- حداقل اندازه Touch Target برابر 48dp باشد.
- برای اشیای آموزشی پایه‌های پایین، در صورت اقتضای قرارداد صفحه، 72 تا 80dp ترجیح دارد.

- > **محدودهٔ اجرا:** فقط فاز N08R — دو صفحهٔ Splash و Profile Setup محافظت‌شده مطلق؛ منطق دامنه دست‌نخورده؛ متن/asset تازه بدون تصویب مالک ممنوع. این سند جای `AGENTS.md`/`START_HERE.md` را نم…
- تمام تغییرات باید در راستای هویت مستقل SHOMARA انجام شوند.
- محصول باید به این ویژگی‌ها برسد:
- هر صفحه باید طوری طراحی شود که انگار توسط یک تیم حرفه‌ای Product Design برای یک اپلیکیشن آموزشی بین‌المللی طراحی و پیاده‌سازی شده است.
- همچنین باید دستورات زیر اجرا شوند:
- دو قسمت از UI از نظر طراحی و UX تأیید شده‌اند و باید بدون هیچ تغییر بصری حفظ شوند.
- اجزای مشترک این صفحه نباید با تغییرات عمومی Design System ظاهر متفاوتی پیدا کنند.
- نکته: اگر فایل ProfileScreens شامل کامپوننت دیگری برای Placement باشد، ممنوعیت تغییر فقط مربوط به بخش Profile تأییدشده است؛ نه کل فایل.

_منبع: `design/playbook/N08R_MISSION_FA.md`_

## N08R — نقشهٔ محتوایی ST07 · P1 «کشف» (محور ۲ directive مالک)

- | رندر | کاشی‌های ۸۰dp با placeholder هندسی خنثی (assetها تحویل نشده)، تیکِ شمارش روی لمس (انیمیشن=مفهوم)، reveal با تایپوگرافی توکن + Featured واحد؛ reduced-motion = ظهو…

- Idle replay:** ۸ ثانیه بی‌کاری → تکرار صوت آخرین دستور، بدون نمایش خطا (در `CALIBRATION_V1` config است — هاردکد ممنوع).

_منبع: `design/playbook/N08R_ST07_P1_CONTENT_MAP_FA.md`_

## N08R-01 (U0) — ممیزی Design System: کنتراست، Clay، Motion

- | ink #15302B | canvas #FFF8EF | 13.38 | 4.5 | PASS |
- | ink | surface #FFFFFF | 14.10 | 4.5 | PASS |
- | ink | surfaceAlt #FDF3E3 | 12.83 | 4.5 | PASS |
- | ink | splashCream #FDF4E5 | 12.92 | 4.5 | PASS (محافظت‌شده) |
- | ink | primarySoft #DDF2E7 | 12.04 | 4.5 | PASS |
- | ink | skySoft #E1F0FA | 12.12 | 4.5 | PASS |
- | ink | amberSoft #FFF1D6 | 12.62 | 4.5 | PASS |
- | ink | berrySoft #FBE3F0 | 11.65 | 4.5 | PASS |
- | ink2 #44594F | canvas | 7.15 | 4.5 | PASS |
- | muted #5E6F68 | canvas | 5.04 | 4.5 | PASS |
- | white #FFFFFF | primary #0C7A54 | 5.35 | 4.5 | PASS (برچسب CTA) |
- | white | primaryDark #0A5C41 | 8.01 | 4.5 | PASS |

- | fg | bg | نسبت | الزام | حکم |
- حفرهٔ واقعی که ممیزی یافت:** feedback فشردن لمسی **hard-cut** بود — گرهٔ مسیر `if (pressed) 0.96f else 1f` بی‌انیمیشن و دکمه فقط پرش عمق سایه؛ در حالی که مأموریت (§4.D) «Spring animation / P…

_منبع: `design/playbook/N08R_U0_AUDIT_FA.md`_

## Native implementation contract — Kotlin + Jetpack Compose

- 4. Screenshot tests at 360/390/412dp plus large text for representative screens.

- Use a single activity, explicit navigation destinations and public feature APIs. Keep implementation dependencies between feature modules forbidden.
- Never replace a missing device gate with a screenshot-only claim. Record `NATIVE_PENDING` and the exact executable command.

_منبع: `design/playbook/NATIVE_IMPLEMENTATION.md`_

## نقشهٔ نهایی UI/UX صفحه‌ها — Native V3

- حداقل target برابر 48dp است؛ manipulativeهای پایه‌های اول ترجیحاً 72–80dp با فاصلهٔ 16dp و inset کناری 24dp.
- | 07 | Station start · `feature:learning-player` | هدف کوتاه ایستگاه را بداند و شروع/ادامه دهد | lesson aim + character محدود + metadata واقعی | «شروع» یا «ادامه» | یک fe…

- CTA پایین صفحه باید با IME، gesture navigation و 200% font scale برخورد نکند؛ scroll محتوا نباید CTA یا feedback را پنهان کند.
- | ID | خانواده / مقصد Native | outcome کودک | focal object و composition | CTA اصلی | depth | stateهای الزامی | reject مشخص |
- هیچ Batch با screenshot تنها بسته نمی‌شود. Compose source/preview برابر `TESTED_NATIVE` نیست؛ evidence level باید جداگانه در ledger ثبت شود.

_منبع: `design/playbook/PAGE_UIUX_BLUEPRINT.md`_

## Pose-to-Page Mapping — DRAFT (Step Zero)

- | 09 Guided Practice | No character reference; soft-raised, physically responsive objects; preferred touch target >=72dp in early grades |

- Numeric poses are TBD pending an owner decision, and must not be
- | 04 Profile Setup | Exact WebP avatars only if selectable; a giant avatar must not overwhelm the form |
- Characters are always static and small in 01 / 06 / 08 / 16, never
- animated endlessly, never guilt-inducing, never revealing an answer.
- (pointing at manipulatives, never revealing answers).

_منبع: `design/playbook/POSE_TO_PAGE_MAPPING_DRAFT.md`_

## design/playbook — فهرست (index)

- # کاننیکال‌ها
- # یادداشت‌های اجرایی (run-notes — مرجع تصمیم نیستند)
- # زیرپوشه‌ها

_منبع: `design/playbook/README.md`_

## Live route and state registry


- Verified against `apps/mobile/app/**` at N02 preflight. This table is the migration source for Native route families; the CSV ledger retains state-level evidence. Re-run discovery whenever r…
- 4. Map the real route to a Native destination and page contract; never invent functionality.
- `station/play` is one file with multiple behaviorally distinct states and must not be treated as one screenshot-only screen.

_منبع: `design/playbook/ROUTE_REGISTRY.md`_

## Step Zero — Reconciliation Record (SHOMARA, N08)

- launch cream `#FDF4E5` (different from canvas `#FFF8EF`),
- block `v2` (canvas `#FFF8EF`, primary `#0C7A54`); never hand-edit

- artwork 941x1672, never stretched, cropped, or redrawn.
- a touchable locked node must be read as "locked", not as "disabled".
- plus `shomara_splash_artwork.png` (which must stay untouched).
- The current phase is N08. That paragraph must be replaced with a
- `design/playbook/ZCODE_MASTER_PROMPT.md` must be aligned at the same
- is forbidden (ADR-0037).
- Local verification, still required before step zero closes:
- A browser screenshot is never Native proof.

_منبع: `design/playbook/STEP_ZERO_RECONCILIATION.md`_

## UX + Visual Review Rubric (apply to EVERY route and state)

- | Responsiveness | 360/390/412dp, text scale, keyboard | screenshots and overflow probe |
- 1. Capture initial screenshot at 360/390/412dp and a large-text state when the platform is runnable.

_منبع: `design/playbook/UX_REVIEW_RUBRIC.md`_

## SHOMARA — phase-aware execution order

- 3. **Observe** running UI and interactions before editing at 360/390/412dp. Assess clarity, taps, layout, child input, visual softness, Persian readability, states, motio…

- You are the accountable Principal Android/Compose engineer, migration engineer, child UX designer, accessibility QA and curriculum integration engineer for SHOMARA. This is a code-changing a…
- Start at the actual repository root; never assume a machine-specific path.
- Run `node design/playbook/quality/validate-pack.mjs`; if it fails, diagnose package files, never silently ignore.
- 3. **Observe** running UI and interactions before editing at 360/390/412dp. Assess clarity, taps, layout, child input, visual softness, Persian readability, states, motion and asset crop. Ne…
- These are categories, NOT invented file routes. Existing migrated screens must be **re-audited**, not skipped. Existing `docs/ui-v2-migration-ledger.md` may be incomplete. Begin with auth/on…
- Read `skills/shomara-learning-content/SKILL.md` first. It routes to `content-library/INTEGRATION_GATE.md`, `content-library/integration/*.md`, `content-library/derived/*.json` and the exact…
- Run `npm run verify:design-pack`, `npm run verify:project-skills`, `npm run verify:design-governance`, and relevant npm/workspace gates; never fabricate results.
- Minimal Persian progress after a meaningful batch: exact routes changed, actual defects fixed, tests with exit codes, screenshots, known remaining routes, last commit. Avoid 20-page reports;…

_منبع: `design/playbook/ZCODE_MASTER_PROMPT.md`_

## Execution checkpoint — SHOMARA full-application UI/UX mission

- (بدون قاعدهٔ قابل استخراج)

_منبع: `design/playbook/quality/EXECUTION_CHECKPOINT.md`_

## Execution checkpoint (populate in ZCode after each verified batch)

- (بدون قاعدهٔ قابل استخراج)

_منبع: `design/playbook/quality/EXECUTION_CHECKPOINT_TEMPLATE.md`_

## Cross-route journeys — verify after each relevant batch

- 9. 360/390/412dp & larger text; keys, bottom CTA, WebP not cropped; icons loaded.

- 11. ST07 later: only after content approval, dry-run T01/T05/T13/T15 with valid real integration, no narration files required to be claimed created.

_منبع: `design/playbook/quality/QA_JOURNEYS.md`_

## Resume Prompt — checkpoint continuation

- Do not restart the audit and do not repeat verified implementation.** Execute the harness-selected task. For route work, pick the highest-priority unfinished real route,…

- For content, continue only from content `SOURCE_ONLY → MAPPED → STAGED` compatibility steps. Never auto-enable ST07 or import CSV to production. Do not push without authorization. End with c…

_منبع: `design/playbook/quality/RESUME_PROMPT.md`_

## Copy one per actual route / state

- (بدون قاعدهٔ قابل استخراج)

_منبع: `design/playbook/quality/REVIEW_CARD.md`_

## SHOMARA Android build skill


- Produce reproducible evidence; never turn a missing toolchain into a green result.
- `BLOCKED_ENV`: required JDK/SDK is absent or invalid; preserve the blocker.

_منبع: `skills/shomara-android-build/SKILL.md`_

## SHOMARA design system skill

- Preserve 48dp general targets and 72–80dp early-grade manipulatives where the content contract requires them.

- 6. Generate platform outputs from the single canonical token source; never hand-edit generated files.
- Use semantic tokens; never introduce feature-local hex, shadow, radius, spacing, duration or typography scales.
- Apply Clay depth only to clarify hierarchy or tactility. Never use depth on text or as the only state signal.

_منبع: `skills/shomara-design-system/SKILL.md`_

## Design-system review checklist


- Color, depth, sound or motion is never the only signal.
- | visually reviewed | comparable screenshots at required widths/states |
- Mark unavailable device evidence `NATIVE_PENDING`; never infer it from source or browser output.

_منبع: `skills/shomara-design-system/references/review-checklist.md`_

## SHOMARA learning content skill


- description: Analyze, author, validate, stage, or integrate SHOMARA grade-one curriculum, stations, game patterns, Persian narration, audio metadata, offline content packages, or CMS workflo…
- Treat research as evidence and authoring input, never as enabled production content.
- 3. Select only the required originals using the routing table below. Never edit `content-library/originals/**`.
- Keep correctness, evaluator configuration, next step, mastery and pass decisions owned by the authoritative local evaluator layer over the versioned package (ADR-0039; the server-side author…
- Missing audio must not block a lesson; show text, continue safely and emit privacy-safe diagnostics.

_منبع: `skills/shomara-learning-content/SKILL.md`_

## SHOMARA product design skill

- Require 48dp minimum touch targets; prefer 72–80dp for early-grade manipulatives.

- 4. Reconcile the real route/state with `design/playbook/ROUTE_REGISTRY.md`, `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` and `design/playbook/quality/SCREEN_LEDGER.csv`; never…
- 6. For curriculum, audio, CMS metadata or educational content, load `skills/shomara-learning-content/SKILL.md`; never promote an original directly into runtime.
- Keep progression, evaluation, mastery and Station Pass owned by the authoritative local source (bundled content package + versioned local evaluator, ADR-0039) — the UI renders, never decides…

_منبع: `skills/shomara-product-design/SKILL.md`_

## SHOMARA screen execution skill


- If binding sources conflict, record exact paths and resolve safely. Never silently invent a requirement or weaken a verifier.
- Never claim Native QA without an Android build and device/emulator evidence.
- Never create fake audio/art assets, fabricate screenshots or infer PASS from source text.

_منبع: `skills/shomara-screen-execution/SKILL.md`_

