# P01 — Product / Game Research + Design Lock

PHASE_ID: P01
STARTED_AT: 2026-10-03
COMPLETED_AT: 2026-10-03 (design-lock implementation slice)
STATUS: IN_PROGRESS

RESEARCH_SOURCES: See Research gate table below.
BORROW_DECISIONS: See Borrow decisions below.
ADAPT_DECISIONS: See Adapt decisions below.
REJECT_DECISIONS: See Reject decisions below.
FILES_READ: ROADMAP_PHASES.md; README.md; engagement/reward source spec; Station 01 vertical slice spec; contracts; product-surface/progression/reference contracts; current external sources.
FILES_CHANGED: packages/contracts/src/engagement.ts; packages/contracts/src/engagement-policy.ts; packages/contracts/src/engagement-policy.test.ts; packages/contracts/src/index.ts; scripts/verify-phase1-product-lock.mjs; scripts/verify-phase4.mjs; scripts/verify-phase6.mjs; scripts/verify-phase7.mjs; scripts/verify-phase10.mjs; docs/qa/ANDROID_STORE_RELEASE_CHECKLIST.md; docs/qa/phase-logs/P01_product-game-research-design-lock.md; prototypes/p01-engagement-review/* (review artifact, 2026-10-04); scripts/verify-p01-prototype-isolation.mjs.
CONTRACTS_CHANGED: Engagement V1 executable contract + P01 A–G decision register, mission expiry/completion policy, achievement policy, reward economy policy, and signature challenge policy.
MIGRATIONS_CHANGED: NOT_APPLICABLE.
TESTS_RUN: tsc packages/contracts; tsc test surface with local vitest type shim; 18 P01 policy tests; 8 engagement tests; 9 game-feel tests; 7 learning-runtime golden tests; 19 node-runnable files / 0 failures via esbuild + vitest-compatible runner; node scripts/verify-phase1-product-lock.mjs; current P03/ST01/assignment/performance static verifiers PASS. Real vitest remains UNVERIFIED because npm is unavailable in this sandbox.
DEVICE_TESTS: NOT_APPLICABLE.
HUMAN_REVIEW: REQUIRED before PASS.
CHILD_EDUCATIONAL_REVIEW: REQUIRED before PASS.
KNOWN_LIMITATIONS: P01 product/learning owner review is still required for phase PASS; P02 technical verification, live backend, device and child evidence remain open; provisional thresholds/frequency stay gated at P06/P07/P08/P09/P10.
OUT_OF_SCOPE_BACKLOG: Server mission engine; reward grant service; inventory projection; challenge engine; Android release verification.
PASS_JUSTIFICATION: NOT_YET_PASS — design decisions A–G are encoded and verified, but the mandatory product/learning owner and child/educational review gates are not available in this execution.

## Research gate

| Source | Observed mechanism | Evidence quality | Product implication | Decision | Measurement / risk |
|---|---|---|---|---|---|
| Duolingo — Time Spent Learning Well | Path activity receives higher learning value than generic activity; quests are ordered easy → meaningful and monthly challenges moved away from XP farming. | Product documentation + reported experiments; not independent learning proof. | Keep Path primary and make missions drive meaningful learning behavior rather than raw activity. | ADAPT | Measure path progression and meaningful return, not XP/session volume. |
| Khan Academy Kids — Learning level/progress (updated 2026-02-26) | Learning Path adapts based on performance; prizes appear intermittently based on completion/accuracy. | Current first-party product documentation. | Engagement may reinforce completed learning, but learning progression remains adaptive/runtime-owned. | ADAPT | Reward frequency is a later hypothesis; avoid over-rewarding every action. |
| DragonBox Numbers | Nooms represent numbers as digital manipulatives; activities build number sense through gameplay and manipulation. | First-party product description. | Prefer math-as-mechanic games over question wrappers where feasible. | BORROW | Validate that interaction changes mathematical reasoning, not just visual novelty. |
| Prodigy — Treasure Track | Daily/monthly/seasonal quests connect math questions with adventure/reward progression. | First-party product description. | Use quests/adventure as a return loop attached to learning events. | ADAPT | Prevent quest farming and avoid a second curriculum. |
| SplashLearn — Math Games | Short interactive math games, personalization, rewards, and offline continuity are core product patterns. | First-party product/product-support documentation. | Keep game rounds short, varied, skill-aligned, and cacheable. | ADAPT | Measure completion and skill evidence separately from engagement. |
| Romero-Rodríguez et al. 2024 systematic review | Gamification effects were positive for engagement/motivation/self-efficacy but learning results were mixed; review found no solid general evidence of learning gains. | Peer-reviewed systematic review. | Learning metrics must be primary; engagement metrics cannot be used as proof of learning. | BORROW | Require skill progression, evidence quality, recovery/transfer measures. |
| Google Play Families Policy | Child-targeted apps have specific content, data, SDK, ads/monetization and disclosure obligations. | Current official platform policy. | V1 child core remains ad-free and earn-only; no child-facing purchase economy. | REJECT paid economy for V1 | Re-check policy before release and before any monetization change. |
| Android target API policy | From 2026-08-31 new apps/updates submitted to Play must target Android 16/API 36+. | Current official platform requirement. | Android build/release phase must enforce target API 36+. | ADAPT | Device/EAS release gate in P02/P14. |

## BORROW decisions

1. Keep the learning Path as the dominant progression surface.
2. Use math-as-mechanic principles for reusable games where the skill can be directly represented.
3. Use adventure/quest framing as an engagement layer around learning encounters.
4. Separate learning evidence from engagement telemetry.

## ADAPT decisions

1. V1 uses at most 3 active Daily Quests in a fixed semantic order: Easy Start → Skill Builder → Meaningful Progress.
2. Mission completion is triggered only by valid learning/engagement events; app-open, time-spent, and login are not valid completion triggers.
3. Rewards are deterministic/collectible in V1 and are downstream from milestones, quests, station progress, achievements, or adventure completion.
4. Rewardable items are non-monetary, non-tradeable, and do not provide unfair learning advantages.
5. Adventure is a mission-level experience containing typed encounters; narrative alone never creates learning evidence.
6. The Android child experience remains three-tab (`مسیر / تمرین / من`) for V1; Mission Hub is secondary and must not compete with Path.
7. Character feedback is instructional/affective feedback tied to semantic events, not constant decoration.

## REJECT decisions

1. Child leaderboards in V1.
2. Paid/spendable child currency in V1.
3. Punitive streak loss/guilt mechanics.
4. Login-only or time-only rewards.
5. Hard timers in mastery checks.
6. Standalone game engine/layer that creates learning truth outside the existing runtime.
7. Game loops that allow XP/reward farming without meaningful learning behavior.

## Locked implementation contract

The new executable contract is `packages/contracts/src/engagement.ts`.

It freezes:

- Quest types and trigger taxonomy.
- Three Daily Quest slots and max active count.
- Reward classes and source types.
- Reward grant idempotency key shape.
- Mini-game classes and timer policy.
- Evidence permission boundary for Reward Games.
- Engagement event taxonomy.
- V1 economy/safety guardrails.

Contract tests live in `packages/contracts/src/engagement.test.ts`.

## Why this is an implementation, not only documentation

P01 does not build the Mission/Reward backend yet. The roadmap explicitly forbids feature implementation before design lock. The contract above converts the locked product decisions into executable types and invariants, so P03–P07 cannot silently invent a second semantics.

## Design-lock implementation slice — 2026-10-03

Added `packages/contracts/src/engagement-policy.ts` as the executable P01 policy boundary. It records 23 decisions across A–G: child game feeling, mission categories/caps/expiry, achievement semantics, V1 no-token reward economy, Path entry-card Mission Hub placement, provisional 5-world mapping, and the 25-station Signature Challenge contract.

Research updates checked on 2026-10-03: [Google Play Families Policies](https://support.google.com/googleplay/android-developer/answer/9893335), [Google Play Payments](https://support.google.com/googleplay/android-developer/answer/9858738), [Digital Game-Based Learning meta-analysis](https://doi.org/10.24310/ijtei.102.2024.19694), [Gamification motivation meta-analysis](https://doi.org/10.1007/s11423-023-10337-7), [Duolingo Friends Quests](https://blog.duolingo.com/friends-quests/), [Deci, Koestner & Ryan reward meta-analysis](https://doi.org/10.1037/0033-2909.125.6.627), and [child-safety critique of Prodigy monetization](https://fairplayforkids.org/wp-content/uploads/2021/02/Prodigy_Complaint_Feb21.pdf).

Key decision: do not add gems/diamonds, spendable balances, random chests, premium cosmetics, social comparison, or paid child economy to V1. This is stricter than the benchmark products because current policy and child-safety evidence make the risk obvious, while the product goal is learning-first.

Verifier result: P01 verifier PASS (14/14 checks after extension); contract typecheck PASS; P01 policy tests PASS (18/18).

## Review prototype — 2026-10-04

Owner asked for usable UI skeletons of Mission Hub, worlds, station challenge, reward/collection, avatar and parent report. Building them inside `apps/` would start P04–P09 scope while P03 is frozen and P01/P02 are not `PASS` (§13.1, PLAN_REVISION 2026-10-04). Decision: deliver them as a **P01 research artifact** instead, because P01's open gates (`HUMAN_REVIEW`, `CHILD_EDUCATIONAL_REVIEW`, Mission Hub discoverability for P01-E-01) need something a reviewer and a child can actually touch.

- Location: `prototypes/p01-engagement-review/` (standalone `index.html`, fake labelled data, no backend, no npm).
- Built-in review panel: approve / needs-change / reject + notes per decision, JSON export for this log.
- Child test protocol: `prototypes/p01-engagement-review/README.md`.
- Guard: `scripts/verify-p01-prototype-isolation.mjs` (no app/package references, no network calls, no gems/coins/store/leaderboard/loot box, 3-tab nav, visible demo banner). Result: PASS. Included automatically in `verify:static:all`.
- Not changed: apps, contracts, migrations, Learning Runtime, station content, P03 code.
- Code in the prototype is throwaway; P04–P09 rebuild from reviewed decisions + `packages/contracts`.

This does not change P01 status. P01 stays `IN_PROGRESS` until the review export and child-test notes are recorded under Remaining gate.

## BUILD_FIRST note — 2026-10-04

Owner chose build-first (roadmap 13.4). P01 stays `IN_PROGRESS`; the encoded decision register is the working baseline for P03–P12. Owner review and child test are ledger rows VD-001 / VD-002 (13.5), closed at the start of P13.

## Remaining gate

`HUMAN_REVIEW: REQUIRED`

Product/learning owner must review the locked decisions before P01 can be marked PASS. No P02/P03 implementation should be represented as PASS before this gate is recorded.

## Out-of-scope backlog discovered

- Server quest/reward/inventory tables already exist historically, but their current implementation must be reviewed and extended only after P05/P06 according to the locked contract.
- Mission Hub UI remains P06 scope.
- Reward grant service remains P07 scope.
- Signature challenge implementation remains P04/P05 scope.
- Android target API enforcement remains P02 scope.
