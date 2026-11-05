# Stage 3 Implementation Note — Player for ST07 only (families 08-11, intro 13)

Branch: `step-zero/n08-reconciliation`, draft PR #3. This note is not a
ledger and changes no status. No local or device gate was run here, so
no PASS is claimed; gates below are for the owner's later single local
report round, when the owner decides to act (the owner currently takes
no action).

## What was read first, in full

Skills: shomara-product-design, shomara-design-system,
shomara-screen-execution, shomara-android-build, shomara-learning-content.
`design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md`,
`STEP_ZERO_RECONCILIATION.md`, `POSE_TO_PAGE_MAPPING_DRAFT.md`,
`STAGE1_IMPLEMENTATION_NOTE.md`, `STAGE2_IMPLEMENTATION_NOTE.md`,
`content-library/integration/ST07_PILOT_IMPLEMENTATION.md`, and page
contracts 08_TEACH_DISCOVER, 09_GUIDED_PRACTICE, 10_ASSESSMENT,
11_RECOVERY_RESULT, 13_CHALLENGE. Player files read in full:
`ShomaraLessonHost.kt`, `ShomaraLessonCore.kt`,
`ShomaraLessonJourney.kt`, `ShomaraTemplateAdapters.kt`,
`ShomaraAssessmentResultChallenge.kt`, `ShomaraLessonRobustness.kt`,
`ShomaraAudioCache.kt`, plus designsystem `ShomaraManipulative.kt`,
`ShomaraFeedback.kt`, `ShomaraCharacter.kt`,
`ShomaraCharacterDrawables.kt`, `ShomaraStateSurface.kt`,
`ShomaraButton.kt`, `ShomaraCard.kt`.

Key honest finding: the host renders only chrome. `ShomaraLessonOptions`
returns `emptyList()` for all five macro stages, so no server option is
ever rendered and the honest "options not yet from server" banner is the
real state. Template adapters (T01/T05/T13/T15) are pure state machines
with no host-wired renderers, and there was no Native challenge-intro
composable — `ChallengeIntroView2` exists only in Expo V2. Inventing
lesson items, hint content, or manipulative content to fill those gaps
would have been fake content, so it was not done (see §Open).

## Changes, with commits

1. New `ShomaraLessonStageChrome.kt` — commit `e48f120`
   - Persian stage labels (P1 کشف, P2 تمرین هدایت‌شده, P3 بازی,
     P4 ارزیابی, P5 انتقال), replacing the raw Latin enum name.
   - Guide character only in P1 discovery: Number pose 1, Inline slot,
     static, decorative. No character in guided practice (P2/P3) or
     assessment (P4), per the pose-to-page draft.
   - Restrained result surface (family 11): Main pose 1, Lesson slot,
     static; the existing server-owned headline from
     `ShomaraResultLogic`; no score, no star, no celebration sound,
     no second progress layer; one primary CTA "بازگشت به مسیر".
2. New `ShomaraChallengeIntro.kt` — commit `558b95a`
   - First Native equivalent of Expo `ChallengeIntroView2`, family 13:
     question priority, total rounds in Persian digits, one primary
     CTA "شروع چالش". Renders only in the Intro state; no character,
     no reward artwork, no timer in intro (the round timer belongs to
     the Round state and is already hidden under reduced motion).
     It changes nothing about mastery: a challenge result never
     changes station mastery.
3. `ShomaraLessonHost.kt` — commit `62d19a6` (display only)
   - Uses the new stage header; on a server CompletePass /
     CompleteNeedsPractice result it now shows the result surface
     instead of exiting silently to the shell. The result CTA and the
     existing close-confirm path both return to the shell, and the
     exit ghost button is suppressed while the result is shown so
     there is no duplicate exit action. All other surfaces keep the
     existing stage-walk behaviour. No adapter, journey, submit-gate,
     back, or banner logic changed.

## Guardrails applied

Tokens v2 only; no magic values; generated files untouched. Minimum
touch 48dp; manipulative band 72-80dp already enforced by
`ShomaraManipulativeRules` / `ShomaraNumberTile` and unchanged here.
Contrast from token pairs; reduced motion honoured (no new animation
was added); RTL root with LTR maths, never mirroring digit order or
number lines. No mastery / unlock / Station Pass / correctness logic
in UI; no answer key in the child client. Assessment (P4) stays the
quietest family (dial 2/2/3): no character, no hint, no celebration
cue, flat chrome. Duolingo, filtered: ADOPT linear one-task lesson,
manual no-timer progression in the lesson itself, one bottom primary
CTA, kind immediate feedback showing the maths step, small skippable
summary with no score; ADAPT short finite lessons, point-of-need
visual hints (not rendered here — see §Open), spiral review; REJECT
lives, punitive streaks, stars-as-currency, coins/gems, shops, loot
boxes, leaderboards, quests, expiring timers, child badges, and any
reskinned version of them. Server is the sole truth for curriculum
order, next item, review timing, difficulty, and unlock; offline never
silently falls back to a local curriculum. Missing audio shows text
and continues (CONTENT-017, already in `ShomaraAudioCache` /
`T15StoryAdapter`); no audio binary was created or faked, and the 41
described ST07 visual assets were not invented.

## Deliberately not changed

- `ShomaraTemplateAdapters.kt`, `ShomaraLessonCore.kt`,
  `ShomaraLessonJourney.kt`, `ShomaraAssessmentResultChallenge.kt`,
  `ShomaraLessonRobustness.kt`, `ShomaraAudioCache.kt`: logic
  untouched, so existing JVM tests for the adapters, guided session,
  assessment session, challenge session, submit gate, back logic,
  stage walk, and banner policy are not disturbed by this batch.
- No hint button: `ShomaraGuidedSession` allows a hint ladder in
  P2/P3, but there is no server hint content to render; a button with
  no content would be a dead end. The h2/h3 assisted-marking rule
  (assisted work is recorded, never counted toward mastery) is a
  server rule and was not changed.
- No manipulative tiles rendered in the host: T01/T05 renderers would
  need real server items (counts, numerals, patterns); with options
  empty, rendering invented items would be fake content.
- No file deleted; no drawable moved or renamed; no edit to
  `START_HERE.md`, `harness/roadmap.json`, `harness/WORKLOG.md`, or
  any backlog/ledger; no row moved to `TESTED_NATIVE`; no station
  other than ST07 touched; N08-09 not started.

## Open items (for an owner decision or a later local report round)

- Owner decisions N08-08 (CONTENT-005/006/007/016); P4 threshold 3 of
  4 remains draft under CONTENT-014 and was not finalised; drawing
  tolerance remains blocked on CONTENT-001/011, and no static magic
  tolerance was put in main UI (the adapter reads
  `config.traceToleranceDp`).
- Server lesson options for all five stages (currently empty), server
  hint content for P2/P3, and the 41 ST07 visual assets (described,
  not delivered) — these are the real blockers for rendering lesson
  content, not UI polish.
- Vazirmatn TTF (owner-supplied); real transparent output for
  Main/Number/Roka; numeric pose assignments beyond pose 1.
- Step-zero ledger edits (START_HERE / roadmap / WORKLOG) and the
  `native/n08-ux-completion` vs `main` comparison, still pending
  from `STEP_ZERO_RECONCILIATION.md`.

## Gates still to run (later, in one round, not claimed here)

`git status --short --branch`, `git log -3 --oneline`,
`node tools/harness.mjs validate/status/next/resume`,
`npm run verify:static:all`, `build:packages`, `typecheck:all`,
`vitest run`, `npm run android:doctor`, `npm run android:gate`
(unit/lint/compile with exit codes), Native screenshots at
360/390/412dp plus 200% font for: P1 teach header, P4 assessment
quiet chrome, result surface (CompletePass / CompleteNeedsPractice),
challenge intro, and the honest options-unavailable state; TalkBack
walkthrough (assessment reads no character/hint, result CTA is the
single primary action); reduced-motion and process-recreation checks.
