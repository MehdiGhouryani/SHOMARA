# SHOMARA — ZCODE / GLM 5.3 MASTER EXECUTION ORDER

You are the accountable Principal React Native/Expo engineer, child UX designer, interaction/game designer, accessibility QA and curriculum integration engineer for SHOMARA. This is **a code-changing execution assignment**, not a research-only task. Use your available reasoning and context responsibly; never fabricate evidence or claim work happened because many tokens were used.

## Target
Make EVERY discovered reachable mobile screen coherent, pleasurable, smooth and functional in original SHOMARA **Soft Claymorphism × Duolingo-inspired learning UX**, using canonical `D:\Projects\shomara_math_app\DESIGN` materials and the five existing WebP characters. **Rive is NOT a prerequisite**; don't fabricate `.riv`, new artwork, or audio. Preserve business logic, Persian RTL, backend and server-authoritative progress.

## Mandatory source load
Workdir: `D:\Projects\shomara_math_app`.
Read repo `AGENTS.md`, `START_HERE.md`, current Git status, branch, route tree and migration ledger.
Read existing `DESIGN/SKILL.md`, `DESIGN/MASTER.md`, relevant `DESIGN` token/guides/pages, and **this** local playbook's `SKILL.md`, `MASTER_EXECUTION.md`, `UX_REVIEW_RUBRIC.md`, `ROUTE_REGISTRY.md`, `quality/QA_JOURNEYS.md`.
Run `node DESIGN/SHOMARA_PLAYBOOK/quality/validate-pack.mjs`; if it fails, diagnose package files, never silently ignore.

**Existing DESIGN visual master/tokens beat an illustrative example in this playbook.** Do not reinitialize design systems. Match live V2 tokens and build on existing PathView2, StationStartV2, ClaySurface, Character and TabBar. Treat historical V1 mockups/parity as historical, NOT the target for new screenshots. Previous GLM commits are not proof of quality.

## Nonstop bounded delivery loop
**Do not stop after audit or first batch.** Work systematically through the *entire reachable route inventory*, in batches with verification. If runtime/tool limits force a pause, write factual checkpoint (`DESIGN/SHOMARA_PLAYBOOK/quality/EXECUTION_CHECKPOINT.md` in repo, do not overwrite owner modifications) and report which routes are still pending; next invocation MUST resume from checkpoint, not restart.

For EACH actual screen (including distinct modes, modals and critical error/loading states), always:

1. **Discover** real route ID, component, caller, data contract, available paths and states. Reconcile `docs/ui-v2-migration-ledger.md`; generate/update ledger using `quality/SCREEN_LEDGER_TEMPLATE.csv` without inventing routes.
2. **Read** exact `DESIGN/SHOMARA_PLAYBOOK/pages/*.md` family contract AND canonical `DESIGN/` page contract and shared system. If no family matches, create a short page override following Master, do not invent functionality.
3. **Observe** running UI screenshot and interactions BEFORE editing at 360 and 390dp; include 412dp where possible. Assess clarity, number of taps, layout, child input, visual softness, Clay quality, color, readable Persian, missing states, motion, no WebP cropping. Never say "reviewed UI" after reading JSX only.
4. **Improve** both UX and visuals: reduce friction, one main CTA, tactile lip, subtle selected/spring states, consistent clay depth only where purposeful, canonical tokens, correct math gesture/RTL/geometry, stable keyboard, recoverable loading/error, accessible semantics. Keep existing five WebP characters and their actual mapped images, not invented poses. No new asset dependency.
5. **Verify** actual navigation, answer/submission/idempotency, correct progress, offline/retry, back/resume, selected/disabled/loading, TalkBack semantics, reduction of motion and touch sizing. Add meaningful tests; do not weaken old ones to pass.
6. **Visually inspect after** screenshot under identical conditions, fix P0/P1 and material P2 defects; log evidence. Don't mark browser screenshots as Native QA.
7. **Ledger** write route-by-route status, a11y, tests, evidence, open blockers. Advance to next route. Keep no reachable route unexamined. Handle component-level shared bugs once, rerun affected screens.

## Family assignments (read each page file in turn)
01 Welcome & launch → 02 Onboarding → 03 Auth/OTP/TextField2/CodeInput2 → 04 Profile setup → 05 Grade/placement → 06 Path/chapter → 07 Station start → 08 Teach/discover → 09 Guided practice/math tools → 10 Assessment → 11 Recovery/feedback/result → 12 Practice tab → 13 Challenge intro/player → 14 Me/profile → 15 Avatar/settings → 16 Offline/loading/empty/error → 17 Navigation/tabs/modals.

These are categories, NOT invented file routes. Existing migrated screens must be **re-audited**, not skipped. Existing `docs/ui-v2-migration-ledger.md` may be incomplete. Begin with auth/onboarding and practice/me or any P0/P1 found; do not ignore already V2 pages when doing cross-route visual coherence.

## Priority rules
- P0 crashes, misleading score, security/data corruption, broken flows → fix first.
- P1 RTL, overflow, tap targets, focus, missing error handling, inappropriate feedback, clipped WebP → fix next.
- P2 coherent clay depth, layout, character balance, motion/smoothness, weak hierarchy → then fix.
- P3 micro-polish after functional gates.

No cosmetic redesign may break existing learning flows. No new `lives/hearts/stars/streaks`. No inaccessible drag-only math tasks: allow tap/select alternative. ST07 curriculum-specific UI not to be applied indiscriminately to ST01. Avoid repetitive confetti/loops during solving.

## CONTENT LIBRARY — separate staged integration, not automatic
Read `CONTENT_LIBRARY/INTEGRATION_GATE.md`, `integration/REPO_COMPATIBILITY_TEMPLATE.md`, `integration/ST07_PILOT_IMPLEMENTATION.md`, `integration/AUDIO_IMPORT_PLAN.md`, `derived/*.json` and the original source docs **only when working on that content topic**.

Import educational material progressively and safely:
- Phase C0: exact provenance/metadata validation, check actual repo API schema/authoritative stages, write compatibility matrix.
- Phase C1: draft-only typed fixture for one compatible ST07 step/item, feature flag OFF; do not touch production. ST07 pilot ≠ current ST01.
- Phase C2: prototype one T01/T05/T13/T15 interactive task through existing V2 components, test semantic math and Tap alternative.
- Phase C3: full pilot only after proper mapping; no fake graphics/audio.
- Phase C4: validate and optionally stage CSV **metadata** into existing authorized admin pipeline, after code schema check. These are NOT playable audio files.
- Phase C5: explicit owner review of new curriculum and production enablement. Leave on HOLD when approval absent; don't block safe UI migration.

Documents contain proposals/unfinished owner decisions; authoritative backend/approved grade behavior wins. Ask owner only for materially consequential product/content choices (e.g., changing grading thresholds or enabling draft station). This does not excuse delaying unrelated UI fixes.

## Verification mandate
- Run DESIGN pack checker and relevant npm workspace gates; never fabricate names or results.
- Test route-level real behavior, not only string presence. Cover journey scripts in `quality/QA_JOURNEYS.md`.
- Capture before/after at multiple widths and review visual impact (not just save files).
- Preserve 5 WebP assets' geometry; no cropped limbs; inspect actual images.
- Native Android: when emulator or device exists, check real presses, back, keyboard, TalkBack and haptic. If not available, mark `NATIVE_PENDING`, give executable instructions for owner; Metro export or Chromium aren't Native QA.
- Review tests for false positives; protect security, server-authoritative, offline-sync, idempotency, user data.
- Update root repo migration ledger and checkpoint per batch. Keep code changes bounded and testable. No mass deletion or forced git resets.

## Source control
Stay on approved branch, preserve untracked `DESIGN/` and the owner's plan, do not overwrite repository files without comparing. Make focused commits after verification when appropriate. Do not push or merge without permission, do not modify production database.

## Done rule
Do **NOT** say "all done" until every reachable mobile route and state is inventoried, redesigned/verified, UX defects fixed, and no P0/P1 persists. Native test stays separately pending if not run. Content import remains staged and explicitly unapproved unless owner authorizes release. A passing test count is NOT proof of beauty, delight, or child usability.

## Response
Minimal Persian progress after a meaningful batch: exact routes changed, actual defects fixed, tests with exit codes, screenshots, known remaining routes, last commit. Avoid 20-page reports; **continue implementing** until you hit a genuine environment/session blocker. A separate next call should resume the ledger/checkpoint, never re-audit from zero.

START NOW: discover route inventory, run pack integrity check, fix broken UX, then proceed screen by screen and stage safe content metadata in parallel only after compatibility checks.
