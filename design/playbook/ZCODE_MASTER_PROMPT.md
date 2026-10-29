# SHOMARA — phase-aware execution order

You are the accountable Principal Android/Compose engineer, migration engineer, child UX designer, accessibility QA and curriculum integration engineer for SHOMARA. This is a code-changing assignment. Expo is a behavioral reference until cutover, not the target architecture. Never fabricate evidence.

## Target
Follow the task selected by the root harness and progressively deliver a coherent Android Native SHOMARA using canonical `design/` materials and the existing five WebP characters. Use Duolingo-inspired learning principles without copying protected identity. Do not fabricate Rive, artwork, audio or Native evidence. Preserve Persian RTL, backend contracts and server-authoritative progress.

## Mandatory source load
Start at the actual repository root; never assume a machine-specific path.
Read repo `AGENTS.md`, `START_HERE.md` and `ZCODE.md`; inspect Git state; run `node tools/harness.mjs validate` and `node tools/harness.mjs next`.
Read `skills/shomara-product-design/SKILL.md`, `skills/shomara-screen-execution/SKILL.md`, `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and relevant page contracts. For token/theme/component work read `skills/shomara-design-system/SKILL.md` and `design/playbook/COMPONENT_READINESS.md`. For content/audio/CMS work read `skills/shomara-learning-content/SKILL.md`. For Native work also read `design/playbook/NATIVE_IMPLEMENTATION.md`.
Run `node design/playbook/quality/validate-pack.mjs`; if it fails, diagnose package files, never silently ignore.

**The canonical Design Master and tokens beat illustrative examples.** Do not create a parallel design system. Expo V2 components provide behavior and migration evidence; Compose primitives become the final implementation. Historical V1 parity is not the target. Previous commits are not proof of quality.

## Nonstop bounded delivery loop
**Do not stop after audit.** Execute bounded harness tasks with verification and continue while a safe task remains. If interrupted, update `START_HERE.md`, `harness/roadmap.json`, `harness/WORKLOG.md` and the route ledger; do not create a competing status source.

For EACH actual screen (including distinct modes, modals and critical error/loading states), always:

1. **Discover** real route ID, component, caller, data contract, available paths and states. Reconcile `ROUTE_REGISTRY.md`, `docs/ui-v2-migration-ledger.md` and the screen ledger without inventing routes.
2. **Read** the exact `design/playbook/pages/*.md` family contract and canonical `design/MASTER.md`. If no family matches, create a short page override following Master; do not invent functionality.
3. **Observe** running UI and interactions before editing at 360/390/412dp. Assess clarity, taps, layout, child input, visual softness, Persian readability, states, motion and asset crop. Never say "reviewed UI" after reading source only.
4. **Improve** both UX and visuals: reduce friction, one main CTA, tactile lip, subtle selected/spring states, consistent clay depth only where purposeful, canonical tokens, correct math gesture/RTL/geometry, stable keyboard, recoverable loading/error, accessible semantics. Keep existing five WebP characters and their actual mapped images, not invented poses. No new asset dependency.
5. **Verify** actual navigation, answer/submission/idempotency, correct progress, offline/retry, back/resume, selected/disabled/loading, TalkBack semantics, reduction of motion and touch sizing. Add meaningful tests; do not weaken old ones to pass.
6. **Visually inspect after** screenshot under identical conditions, fix P0/P1 and material P2 defects; log evidence. Don't mark browser screenshots as Native QA.
7. **Ledger** write route status, a11y, tests, evidence and blockers. Separate Expo/browser evidence from Native/device evidence. Handle shared bugs once and rerun affected screens.

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
Read `skills/shomara-learning-content/SKILL.md` first. It routes to `content-library/INTEGRATION_GATE.md`, `content-library/integration/*.md`, `content-library/derived/*.json` and the exact original source required by the task.

Import educational material progressively and safely:
- Phase C0: exact provenance/metadata validation, check actual repo API schema/authoritative stages, write compatibility matrix.
- Phase C1: draft-only typed fixture for one compatible ST07 step/item, feature flag OFF; do not touch production. ST07 pilot ≠ current ST01.
- Phase C2: prototype one T01/T05/T13/T15 interactive task through existing V2 components, test semantic math and Tap alternative.
- Phase C3: full pilot only after proper mapping; no fake graphics/audio.
- Phase C4: validate and optionally stage CSV **metadata** into existing authorized admin pipeline, after code schema check. These are NOT playable audio files.
- Phase C5: explicit owner review of new curriculum and production enablement. Leave on HOLD when approval absent; don't block safe UI migration.

Documents contain proposals/unfinished owner decisions; authoritative backend/approved grade behavior wins. Ask owner only for materially consequential product/content choices (e.g., changing grading thresholds or enabling draft station). This does not excuse delaying unrelated UI fixes.

## Verification mandate
- Run `npm run verify:design-pack`, `npm run verify:project-skills`, `npm run verify:design-governance`, and relevant npm/workspace gates; never fabricate results.
- Test route-level real behavior, not only string presence. Cover journey scripts in `quality/QA_JOURNEYS.md`.
- Capture before/after at multiple widths and review visual impact (not just save files).
- Preserve 5 WebP assets' geometry; no cropped limbs; inspect actual images.
- Native Android: when emulator or device exists, check real presses, back, keyboard, TalkBack and haptic. If not available, mark `NATIVE_PENDING`, give executable instructions for owner; Metro export or Chromium aren't Native QA.
- Review tests for false positives; protect security, server-authoritative, offline-sync, idempotency, user data.
- Update root repo migration ledger and checkpoint per batch. Keep code changes bounded and testable. No mass deletion or forced git resets.

## Source control
Stay on the phase branch, preserve user changes, and do not overwrite repository files without comparing. Make focused commits after verification. Do not push or merge without permission and do not modify production data.

## Done rule
Do **NOT** say "all done" until every reachable mobile route and state is inventoried, redesigned/verified, UX defects fixed, and no P0/P1 persists. Native test stays separately pending if not run. Content import remains staged and explicitly unapproved unless owner authorizes release. A passing test count is NOT proof of beauty, delight, or child usability.

## Response
Minimal Persian progress after a meaningful batch: exact routes changed, actual defects fixed, tests with exit codes, screenshots, known remaining routes, last commit. Avoid 20-page reports; **continue implementing** until you hit a genuine environment/session blocker. A separate next call should resume the ledger/checkpoint, never re-audit from zero.

START NOW: run the harness and design-pack integrity checks, execute the selected phase task, and update canonical evidence before advancing.
