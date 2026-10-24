---
roadmap_id: SHOMARA-MASTER-IMPLEMENTATION
version: 3.2
date: 2026-10-04
authoritative_phase_plan: true
phase_count: 15
phase_id_format: P00-P14
status_values: [PENDING, IN_PROGRESS, IMPLEMENTED, BLOCKED, PASS]
execution_mode: BUILD_FIRST  # PLAN_REVISION 2026-10-04 (13.4)
next_eligible_phase: P12
primary_platform: Android
secondary_platform: Web
---

# شمارا — Master Implementation Roadmap & Product/Game Plan

**Version:** `v3.2`
**Date:** `2026-10-04`
**Audience:** AI coding agents, product/design/engineering leads, QA, curriculum reviewers
**Primary platform:** Android / Expo React Native
**Secondary platform:** Web validation surface

> **This is the only execution-status and phase-sequencing source of truth.**
> It does not replace domain contracts, ADRs, source specifications, executable contracts, database migrations, or code. It decides **what happens next, in what order, under which research gate, and what evidence is required for PASS**.

---

## 0. EXECUTION CONSTITUTION

### 0.1 Non-negotiable rule

No implementation phase is considered complete because code exists, a static verifier passes, or a screen looks correct on one machine.

A phase is `PASS` only when **all required gates in that phase are green and all mandatory evidence is recorded**.

If a required gate is unavailable or failed, the phase is `BLOCKED` and the exact blocker is recorded. Never convert an unknown result into PASS.

### 0.2 Status values

Only these statuses are allowed:

- `PENDING` — not started.
- `IN_PROGRESS` — actively being executed.
- `BLOCKED` — attempted or checked and cannot be completed because a required gate is unavailable/failed.
- `PASS` — all gates passed with evidence.

Do not invent statuses such as `mostly done`, `almost pass`, `soft-pass`, or `done-enough`.

### 0.3 AI execution protocol

Before any implementation work, the AI must:

1. Read this entire file.
2. Read the current canonical source files named by the selected phase.
3. Read the actual implementation files relevant to the phase.
4. Inspect the current test/verify surface.
5. Check the phase dependency table.
6. Select only the first `PENDING` phase whose dependencies are `PASS`, unless the human explicitly names a different phase.
7. Set that phase to `IN_PROGRESS` before changing code.
8. Run the mandatory research gate for that phase **before implementation**.
9. Record research findings as `Borrow / Adapt / Reject` decisions.
10. Implement only the scoped work for that phase.
11. Run all required automated checks.
12. Perform manual/device/child/educational review when the phase requires it.
13. Fix failures and re-run the affected gate(s).
14. Mark `PASS` only when the full acceptance matrix is green.
15. Record commands, results, changed files, unresolved risks, and date in the phase log.
16. Put newly discovered out-of-scope work in the backlog instead of silently expanding the phase.

### 0.4 No forward leakage

When working on phase `Pn`, do not silently implement `P(n+1)` or a later phase merely because the code is nearby.

Allowed exception: a tiny compatibility change is permitted only when it is required to keep the current phase buildable and is explicitly recorded as a dependency fix.

### 0.5 Research-before-build rule

Every implementation phase has a mandatory `Research Gate`.

Minimum research standard:

- search current external sources on the phase topic;
- prefer primary sources from the referenced product/provider;
- for educational decisions, include at least one credible research/review source when applicable;
- for Android/Google Play safety/compliance, use current official Google/Android documentation;
- use at least two independent sources for product decisions unless the source is an official platform requirement;
- record the date checked;
- record which idea is `BORROW`, which is `ADAPT`, and which is `REJECT`;
- never copy proprietary artwork, copy, branding, or screen geometry.

### 0.6 Decision states

Each phase may create decisions with these labels:

| State | Meaning |
|---|---|
| `LOCKED` | Implementation must follow it until a formal plan revision. |
| `PROVISIONAL` | Safe working assumption; must be revisited at the stated gate. |
| `OPEN` | Not decided yet; implementation must not assume it. |
| `REJECTED` | Explicitly not allowed in the current product scope. |

### 0.7 Evidence hierarchy

When sources conflict, use this precedence:

1. **This roadmap** for phase order, status, and execution protocol.
2. **ADR files** for locked architecture decisions.
3. **`packages/contracts`** for executable cross-surface product contracts.
4. **Current source specifications** under `docs/source/` for domain rules.
5. **`project-design-v2/`** for current character/visual source material.
6. **Code + Supabase migrations** for implementation/runtime truth.
7. **Current external research** for evidence, benchmarks, policy, and design reference.

Historical/superseded files are not a source of truth.

### 0.8 Plan-revision protocol

A change to a `LOCKED` product/architecture decision requires a `PLAN_REVISION` entry containing:

- date;
- reason;
- evidence;
- affected phases;
- contracts/specs affected;
- migration/API compatibility impact;
- whether already-passed phases must be re-opened.

Do not create a second roadmap file for a revision.

### 0.9 Documentation hygiene

Do not create parallel documentation such as:

- `ROADMAP_PHASES_v4.md`;
- `START_HERE_v2.md`;
- duplicate `*_completed_new.md` files;
- a second current character/design folder.

Edit the canonical file and let git/commit history preserve history.

### 0.10 Truthfulness rule

The agent must distinguish:

- `PASS` = executed and verified;
- `IMPLEMENTED` = code complete and every check runnable in the current environment is green, but live/device/human/child gates are deferred to the verification debt ledger (13.5). `IMPLEMENTED` is **never** `PASS` and must never be reported as done-and-verified;
- `UNVERIFIED` = not executed;
- `BLOCKED` = known blocker prevents completion;
- `PROVISIONAL` = educational/product assumption still awaiting review.

A static scan is not equivalent to a device test. A source review is not equivalent to a child test. A mock repository is not equivalent to live Supabase.

### 0.10.1 Legacy verifier naming rule

Some executable regression scripts still contain historical names such as `verify-phase16-deep-audit.mjs`. They are **test/tool names only** and do not define the current roadmap phases. The AI must never infer phase order from script names.

### 0.11 Allowed phase state transitions

```text
PENDING ──start──> IN_PROGRESS ──all gates green──> PASS
IN_PROGRESS ──code done, runnable checks green, open gates logged in 13.5──> IMPLEMENTED   (BUILD_FIRST only)
IMPLEMENTED ──deferred gates closed──> PASS
PENDING ──attempt/reason recorded──> BLOCKED
BLOCKED ──blocker removed──> IN_PROGRESS
PASS ──only by PLAN_REVISION──> IN_PROGRESS
```

Rules:

- `PASS → PASS` is not a new execution; attach no fake evidence.
- A `PASS` phase may be re-opened only through `PLAN_REVISION` with impact analysis.
- A `BLOCKED` phase may not be skipped by silently marking dependent phases green.
- The next executable phase is the first `PENDING` phase whose dependencies are all `PASS`, unless the human explicitly overrides the sequence.
- **BUILD_FIRST override (13.4, active):** a phase may start when its dependencies are `PASS` or `IMPLEMENTED`; P01 and P02 count as build-unblocked while `IN_PROGRESS` because their source work is in place and only verification gates remain.

### 0.12 Mandatory phase evidence record

Every phase log must answer exactly these fields:

```text
PHASE_ID
STARTED_AT
COMPLETED_AT
STATUS
RESEARCH_SOURCES
BORROW_DECISIONS
ADAPT_DECISIONS
REJECT_DECISIONS
FILES_READ
FILES_CHANGED
CONTRACTS_CHANGED
MIGRATIONS_CHANGED
TESTS_RUN
DEVICE_TESTS
HUMAN_REVIEW
CHILD_EDUCATIONAL_REVIEW
KNOWN_LIMITATIONS
OUT_OF_SCOPE_BACKLOG
PASS_JUSTIFICATION
```

A phase may leave a field as `NOT_APPLICABLE` only when the phase definition explicitly says so.

### 0.13 Research quality rule

Research is not a link dump. For each source, record:

`source → observed mechanism → evidence quality → product implication → BORROW / ADAPT / REJECT → measurement / risk`

The AI must not quote a benchmark feature as proof that it improves learning. Educational evidence and product benchmark evidence are separate evidence classes.

---

# 1. CURRENT PRODUCT TRUTH

## 1.1 What already exists and must be preserved

The following are current implementation facts and must not be rebuilt as parallel systems:

- **25-station Grade 1 zig-zag path** across 5 units already exists.
- Station order alternates left/right continuously through all 25 stations; the alternation does not reset at unit boundaries.
- `G1_STATIONS` and `G1_UNITS` are already used by the path runtime.
- Path status semantics already distinguish `COMPLETED`, `CURRENT`, `AVAILABLE`, `LOCKED`, `NOT_DOWNLOADED`, and `SYNC_PENDING`.
- Station routes already exist under `apps/mobile/app/station/[stationId]/`.
- `StationFlow.tsx` is the current lesson/game runtime and already supports Pattern, Count, Recovery/Recheck, Transfer, and Mastery flows.
- Grade 1 currently has **64 skills** and 25 stations.
- Grade 1 has **14 reusable game templates** in the existing game/engagement specification.
- Phone OTP is the current production onboarding authentication path.
- There is **no separate ParentGate** in the current onboarding flow.
- Google, email, and guest are not part of the production onboarding UI.
- `consentAt` is retained for compatibility but is not evidence of parent authentication.
- Android is the primary product platform; Web is secondary validation.
- Native splash should remain native and should not be replaced with an artificial multi-screen splash.
- Current learner primary navigation is **three destinations**: `مسیر`, `تمرین`, `من`.
- The existing path must remain the primary learning surface.
- Child avatar identity is separate from contextual companion characters.
- Current cast source of truth is `project-design-v2`.

## 1.2 What is intentionally not complete yet

The current repository has important foundations, but the following engagement capabilities are not yet a complete, canonical server-backed product system:

- one mission/quest engine with current child-facing progression;
- one reward registry/grant service with full idempotency and inventory projection;
- long-term collection progression connected to real rewards;
- one signature challenge for every station;
- world-level adventure/boss challenges;
- production-ready character customization/collection economy;
- a validated non-punitive daily/weekly learning rhythm loop;
- full Rive/audio cast production and child calibration;
- live Supabase/Auth/RLS/RPC verification in this environment;
- real device/EAS release evidence;
- educational sign-off for the Grade 1 package;
- child usability evidence for the new engagement layer.

## 1.3 Current engagement gap

The product already has game, reward, quest, and engagement rules in source specification, but the implementation surface is intentionally conservative:

- current child shell does **not** expose XP/gems/streak as primary UI;
- current achievements are a small milestone set tied to early stations;
- there is no complete backend quest/reward/inventory stack yet;
- the future Mission system must therefore be implemented as an extension of current learning runtime, not as a second learning runtime.

## 1.4 Current technical verification caveat

The extracted snapshot has already passed several **static** verifiers, but a production claim must not be made from those results alone.

At roadmap creation time, the following remain unverified in this environment:

- a complete dependency installation plus all Web/Mobile workspace builds;
- live Supabase migration/Auth/RLS/RPC execution;
- real Station 01 end-to-end against live backend;
- EAS device build and install;
- real-device accessibility/performance testing;
- child playtest and educational approval.

The first technical verification phase below is therefore a hard gate before new feature implementation.

---

# 2. RESEARCH BASELINE — 2026-10-03

This section is the initial external evidence base for the product/game plan. Phase-specific research must still be performed again before implementation.

## 2.1 Duolingo — what to learn from

Current Duolingo material describes a progression model where the learning path remains central and daily quests are deliberately ordered from easier starts toward more meaningful progress. Duolingo also reports that it shifted some long-term challenges from XP accumulation toward quest completion because XP farming could reward gaming the system rather than balanced daily progress. It explicitly evaluates “time spent learning well” rather than raw session counts, and reports that path lessons are treated as especially valuable learning activity.

**Product implication for Shomara:**

- Path progression remains the core learning loop.
- Missions should pull the learner toward meaningful path/skill behavior.
- Reward design must avoid easy farming loops.
- “More activity” is not automatically “more learning.”
- Daily mission ordering can go from easy → skill builder → meaningful progress.
- A Mission Hub is useful, but it should not become a competing curriculum.

Sources:

- Duolingo — Time Spent Learning Well: https://blog.duolingo.com/time-spent-learning-well/
- Duolingo — How to Use Duolingo / Duolingo 101: https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/

## 2.2 Khan Academy Kids — what to learn from

Khan Academy Kids documents an adaptive Learning Path that changes support according to the learner’s current skill level. Its character system is part of the teaching experience rather than a decorative layer; the service also describes rewards and collections such as hats, toys, clothes, and bugs, alongside character rooms and progress-oriented rewards.

A particularly relevant design principle is that character feedback can praise the **specific effort or strategy** the child used rather than giving generic celebration for everything.

**Product implication for Shomara:**

- Character reactions should be instructional/affective feedback, not wallpaper.
- Customization should be a long-term collection loop.
- The system can reward completion and persistence, but learning progression remains central.
- Difficulty/support should adapt without changing skill identity.

Sources:

- Khan Academy Kids — Learning Path: https://khankids.zendesk.com/hc/en-us/articles/360048828572-Learn-more-about-the-Learning-Path
- Khan Academy Kids — Characters: https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids

## 2.3 DragonBox Numbers — what to learn from

DragonBox Numbers is designed for ages 4–8 and uses the Nooms as digital manipulatives. The product describes multiple activities that build number sense through direct manipulation and gameplay rather than memorization alone.

**Product implication for Shomara:**

- The most valuable game is the one where the math idea is part of the mechanic.
- “Answer a question to move a character” is weaker than “the child manipulates quantity as the game action.”
- Reusable game engines should change context/representation while preserving the target skill.

Source:

- DragonBox Numbers: https://dragonbox.com/products/numbers

## 2.4 Prodigy Math — what to learn from

Prodigy describes a game world with quests, seasonal/longer challenges, bosses, rewards, and collectible/pet-oriented progression. The relevant pattern is not any specific branded feature; it is the integration of learning tasks with an adventure loop and visible collectible progress.

**Product implication for Shomara:**

- A child can understand long-term progress better when it is visible as world/character change.
- World quests and final challenges can provide a larger goal than a single station.
- A challenge should feel like a playable event, not a second exam.

Source:

- Prodigy Math overview: https://webflow.prodigygame.com/main-en/blog/what-is-prodigy-math-game

## 2.5 SplashLearn — what to learn from

SplashLearn highlights short interactive math games, colorful characters, age-appropriate challenge, personalization, and rewards/progress feedback.

**Product implication for Shomara:**

- Keep individual game rounds short enough for a child to understand the objective quickly.
- Vary interaction type rather than repeating one question shell.
- Keep difficulty tied to the intended skill, not to arbitrary countdown pressure.

Source:

- SplashLearn — Preschool Math Games: https://www.splashlearn.com/math-games-for-preschoolers

## 2.6 Educational research — what to learn from

Systematic reviews of gamification in primary/secondary education find positive effects are more consistently associated with engagement/motivation/self-efficacy than with guaranteed learning gains. One 2024 primary-education systematic review reported mixed learning outcomes and warned against assuming gamification alone produces better learning results. Another 2024 systematic review of school engagement emphasized the need to measure engagement holistically rather than equating it with participation alone.

**Product implication for Shomara:**

- Learning outcomes must remain the primary success criterion.
- Engagement metrics are secondary and need quality controls.
- We must measure recovery, transfer, skill progression, and evidence quality—not only return rate or time spent.
- Every new reward mechanic needs an educational hypothesis and a failure mode.

Sources:

- Romero-Rodríguez et al., 2024, International Journal of Educational Research: https://www.sciencedirect.com/science/article/pii/S0883035524001666
- Ramírez Ruiz et al., 2024, Frontiers in Education: https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1466926/full

## 2.7 Android / child-safety constraints

Current Android documentation states that from 31 August 2026 new Google Play apps and updates must target Android 16 / API 36 or higher. Google Play Families policy requires special handling for child-targeted apps, including data-practice restrictions and accurate Play Console disclosures. Monetization/advertising for child-targeted apps is also subject to Families requirements.

**Product implication for Shomara:**

- Keep the child experience ad-free.
- Any future currency/spend model must go through a separate policy/design review.
- The first reward economy should be **earn-only and non-monetary**.
- Never add a child-facing purchase flow as a casual extension of a gem system.
- Re-check current Play policy immediately before release and whenever monetization is introduced.

Sources:

- Android Developers — Target API requirement: https://developer.android.com/google/play/requirements/target-sdk
- Google Play — Families Policy Requirements: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play — Developer Program Policy / Ads and Monetization: https://support.google.com/googleplay/android-developer/answer/18258653

---

# 3. PRODUCT NORTH STAR

## 3.1 Desired child feeling

The child should feel:

> «دارم توی یک دنیای بامزه بازی می‌کنم و کم‌کم دارم بهتر می‌شم.»

Not:

> «دارم امتحان می‌دم و برای رد شدن باید امتیاز بگیرم.»

## 3.2 Product formula

```text
LEARNING TRUTH
    ↓
PATH PROGRESS
    ↓
STATION EXPERIENCE
    ↓
GAME / CHALLENGE
    ↓
VISIBLE PROGRESS
    ↓
MISSION / COLLECTION
    ↓
REWARD
    ↓
CHARACTER / WORLD CHANGE
    ↓
RETURN TO LEARNING
```

The loop must return to learning.

## 3.3 Four non-negotiable separations

### Learning Truth

Skills, evidence, mastery, station completion, and authoritative decisions.

### Experience

Story, game, challenge, mission, adventure, celebration.

### Reward

Badge, cosmetic, character, sticker, world element, earn-only non-monetary token if later approved.

### Analytics

Events describing what happened; not a second source of learning truth.

---

# 4. PRODUCT-WIDE GAME-FEEL RULES

These rules apply to every future station/game/mission phase.

## 4.1 Objective clarity

Within approximately two seconds, the child should understand:

- what to do;
- what object is interactive;
- what “success” looks like.

## 4.2 Action → reaction

Every meaningful child action should have a short feedback chain:

```text
Tap / drag / choose
      ↓
Object reaction
      ↓
Sound / haptic where appropriate
      ↓
Character response
      ↓
Progress / world effect
```

## 4.3 Error treatment

Errors are information, not punishment.

Preferred:

- gentle visual redirection;
- strategy-oriented hint;
- representation change;
- character encouragement;
- retry.

Avoid:

- shame language;
- loss of earned rewards;
- lives/hearts that block learning;
- red-screen failure theatrics;
- punitive streak resets.

## 4.4 Reward visibility

Prefer a reward that changes the world/character over a naked number.

Example:

> «یک قطعه از نقشه پیدا کردی.»

is usually more meaningful than:

> `+10 XP`

## 4.5 Difficulty

Difficulty may change:

- range;
- distractors;
- representation;
- visual complexity;
- number of steps;
- action count;
- hint level.

Difficulty must not silently redefine the target Skill.

## 4.6 Timer

```text
NONE  = default
SOFT  = affects pace/feedback only
HARD  = only for explicit non-mastery challenge gameplay
```

No hard timer in Mastery Check.

## 4.7 Animation budget

Animation is support, not competition with the math task.

Use short entrance/micro-feedback/celebration sequences. Avoid long mandatory celebration that blocks flow.

## 4.8 Audio

Sound must be optional and meaningful. A child should be able to complete the task with audio disabled.

## 4.9 Motion

Respect OS Reduce Motion and the in-app motion preference.

---

# 5. ENGAGEMENT INFORMATION ARCHITECTURE

## 5.1 Current primary navigation is preserved

Current primary child destinations remain:

1. `مسیر`
2. `تمرین`
3. `من`

This is locked until a tested product decision changes it.

## 5.2 Mission Hub placement is OPEN until research/child test

Do **not** add a fourth primary tab automatically.

Working hypothesis:

- Missions may appear as a secondary high-visibility surface on Path and/or Profile;
- Mission Hub may be a full secondary screen reachable with one clear action;
- placement must be tested for discoverability and cognitive load.

The final placement is a P01/P06 product decision, not an implementation assumption.

## 5.3 Proposed hierarchy

```text
WORLD / JOURNEY
   ↓
PATH
   ↓
STATION
   ├── LEARN
   ├── GUIDED
   ├── MINI-GAMES
   ├── INDEPENDENT
   ├── REVIEW
   ├── CHECKS
   ├── RECOVERY / RECHECK
   ├── TRANSFER
   ├── MASTERY CHECK
   └── ⭐ STATION CHALLENGE

ENGAGEMENT LAYER
   ├── DAILY QUESTS
   ├── STATION QUESTS
   ├── WORLD QUESTS
   └── ADVENTURE MISSIONS

COLLECTION LAYER
   ├── ACHIEVEMENTS
   ├── COSMETICS
   ├── CHARACTERS
   ├── STICKERS
   └── WORLD ELEMENTS
```

---

# 6. MISSION SYSTEM — PRODUCT RULES

## 6.1 Mission definition

A Mission is a short-term behavioral goal that guides useful learning behavior. It is not a replacement for the curriculum.

## 6.2 Initial mission types

```text
DAILY
STATION
WORLD
ADVENTURE
SPECIAL_EVENT (later)
```

## 6.3 Daily Mission set

Initial target: at most **3 active child-facing daily missions**.

Recommended order:

```text
Q1 — EASY START
Q2 — SKILL BUILDER
Q3 — MEANINGFUL PROGRESS
```

This mirrors the documented Duolingo pattern of making the earliest task easiest and later tasks more closely tied to useful progression, while adapting it for a child math product.

## 6.4 Valid mission triggers

Allowed examples:

- complete station;
- complete a specific game/review;
- complete a recovery activity;
- complete a transfer activity;
- complete a challenge;
- reach a learning milestone.

Disallowed as the sole reason for a learning mission:

- open app;
- spend X minutes in app;
- watch a screen;
- stay idle;
- buy something.

## 6.5 Mission completion

Mission completion must come from authoritative or accepted product events. UI-local progress alone cannot grant the final reward.

## 6.6 Mission failure

A mission expiration is not a learning failure.

Do not remove learning progress because a daily mission expires.

## 6.7 Mission reward frequency

Reward frequency is a hypothesis to test.

Initial design target:

- small immediate reward for short mission completion;
- larger milestone reward for accumulated meaningful progress;
- no reward spam after every tap.

---

# 7. ACHIEVEMENT SYSTEM — PRODUCT RULES

## 7.1 Mission vs Achievement

Mission = short-term goal.

Achievement = permanent collection item representing a notable milestone.

They must not share one data model blindly.

## 7.2 Achievement families

Proposed families:

```text
PATH
SKILL
CHALLENGE
RECOVERY
TRANSFER
EXPLORATION
COLLECTION
PERSISTENCE
WORLD
```

## 7.3 Example achievements

Illustrative only; IDs and thresholds are decided during P07:

- اولین ایستگاه
- کارآگاه الگو
- شمارش‌گر شجاع
- قهرمان دوباره‌تلاش
- استاد انتقال
- کاشف پنج ایستگاه
- نجات‌دهنده‌ی اولین دنیا
- کامل‌کننده‌ی مسیر

## 7.4 Achievement rule

An achievement must have:

- a stable ID;
- a trigger/condition;
- deterministic progress calculation;
- unlock timestamp;
- reward mapping if any;
- idempotent grant behavior;
- a child-friendly description;
- a visual asset reference.

## 7.5 Achievement vs mastery

Achievement unlock ≠ mastery.

Mastery remains a learning-runtime decision.

---

# 8. REWARD / ECONOMY RULES

## 8.1 Reward classes

The current source specification already provides a strong baseline:

```text
STAR_PROGRESS
MILESTONE_BADGE
CHARACTER_REACTION
WORLD_ELEMENT
CHARACTER_COSMETIC
PATH_REVEAL
STICKER
```

## 8.2 Candidate token / gem model

The user-facing product goal includes the possibility of diamonds/gems/points. This is **not yet locked**.

Working rule:

> First implementation may use an **earn-only, non-purchasable, non-cashable token** solely for child-visible collection/personalization, subject to P01 product decision and P06 safety/compliance review.

No purchase screen, store, subscription upsell, paid loot box, or money-like child economy is implied by this roadmap.

## 8.3 Reward grant

Reward must be idempotent:

```text
(learning_identity, source_type, source_ref, reward_id)
```

must not create duplicate grants after retries or offline replay.

## 8.4 Reward source separation

```text
Learning Evidence → Mastery Policy
Learning/Engagement Event → Reward Policy
```

Never:

```text
reward_granted → mastery=true
```

## 8.5 No punitive economy

A child does not lose previously earned cosmetics/badges because of:

- a wrong answer;
- a missed day;
- an expired mission;
- an interrupted session;
- an offline period.

---

# 9. CHARACTER & CUSTOMIZATION RULES

## 9.1 Companion vs child avatar

Keep these concepts separate:

```text
Child Avatar = child identity / customization
Companion = contextual guide / emotional feedback / story
```

## 9.2 Character collection

Long-term target:

```text
Starter character
   ↓
Cosmetics
   ↓
Accessories
   ↓
Pet/companion collection
   ↓
Additional character unlocks
```

The exact number of unlockable child characters is an OPEN product decision until P07/P08 research and content capacity review.

## 9.3 Reward-to-customization mapping

Examples:

```text
Mission milestone → hat
Station milestone → sticker
World completion → outfit
Achievement → accessory
Adventure completion → character/pet unlock
```

Do not make the mapping random or opaque.

## 9.4 Character reactions

Use characters for:

- hint encouragement;
- correct strategy feedback;
- recovery encouragement;
- mission celebration;
- reward reveal;
- world transition.

Do not use characters to leak answers during checks.

---

# 10. WORLD / ADVENTURE RULES

## 10.1 World unit

The current Grade 1 structure has 5 units. A provisional product direction is to give each unit a world identity.

This is `PROVISIONAL` until P09 content/story design confirms the mapping.

## 10.2 World responsibilities

Each world should eventually have:

- visual identity;
- story hook;
- 5 stations;
- station challenges;
- world missions;
- collectible theme;
- world element unlocks;
- world challenge/boss-like synthesis moment.

## 10.3 World challenge

A World Challenge combines several previously learned skills in a playful synthesis experience.

It is not the Mastery Check.

## 10.4 Adventure mission

An Adventure can contain multiple encounters:

```text
Story → Game → Choice → Math task → Game → Reward
```

Only encounters with approved learning roles can create learning evidence.

---

# 11. STATION CHALLENGE RULES

## 11.1 One signature challenge per station

Target: **25/25 stations have one dedicated Signature Challenge instance**.

The challenge is additive to the existing StationFlow, not a replacement for current Mini Games, Checks, Recovery, Transfer, or Mastery Check.

## 11.2 Reuse architecture

Do not build 25 independent game engines.

Use:

```text
Game Template
   ↓
Station Challenge Instance
   ↓
Station-specific content/config
```

## 11.3 Target duration

Initial target: approximately 30–90 seconds for a complete short challenge, with flexibility for the math skill.

## 11.4 Challenge structure

```text
START
  ↓
~2 second objective explanation
  ↓
ROUND 1
  ↓
ROUND 2
  ↓
ROUND 3
  ↓
FINAL MOMENT
  ↓
RESULT / REWARD PRESENTATION
```

## 11.5 Challenge contract

Recommended canonical shape:

```ts
StationChallenge {
  id
  stationId
  gameCode
  primarySkillIds
  supportingSkillIds
  objective
  difficultyPolicy
  rounds
  evaluator
  hintPolicy
  timerPolicy
  rewardPolicy
  evidencePolicy
}
```

This extends the existing game contract rather than introducing a parallel game framework.

---

# 12. CURRENT G1 GAME TEMPLATE REGISTRY

These templates already exist in the source specification and should be reused rather than duplicated:

| Code | Template | Typical role |
|---|---|---|
| `G1-GAME-001` | مسیر الگو | pattern recognition / continuation |
| `G1-GAME-002` | شکار شمارش | counting / quantity |
| `G1-GAME-003` | کارخانه عدد | number composition / representation |
| `G1-GAME-004` | شهر شکل‌ها | shape classification / construction |
| `G1-GAME-005` | آینه جادویی | symmetry |
| `G1-GAME-006` | ربات مقایسه | more/less/equal |
| `G1-GAME-007` | پرش روی محور | number line |
| `G1-GAME-008` | تعمیر ساعت | time |
| `G1-GAME-009` | شکار تقویم | calendar |
| `G1-GAME-010` | فروشگاه کوچولو | applied number problems |
| `G1-GAME-011` | کارخانه ده‌تایی | tens / place value |
| `G1-GAME-012` | جدول جادویی | grid / reasoning |
| `G1-GAME-013` | کارآگاه اطلاعات | sufficient/insufficient information |
| `G1-GAME-014` | ماموریت چندمرحله‌ای | multi-step reasoning |

The skill mapping in the existing source spec is a baseline only. P10 re-validates every station against the actual skill graph and educational content review before freezing final challenge instances.

---

# 13. PHASE TABLE

| Phase | Name | Depends | Status | Output |
|---|---|---|---|---|
| P00 | Documentation cleanup + truth reconciliation | — | `PASS` | One canonical roadmap + stale-doc cleanup |
| P01 | Product/Game research + design lock | P00 | `IN_PROGRESS` | Game-feel, mission, reward, achievement, world, challenge decisions |
| P02 | Technical foundation verification + stabilization | P00 | `IN_PROGRESS` | Android-first authoritative runtime, reproducible baseline, live/backend/device evidence |
| P03 | Game Feel Foundation | P01, P02 | `IMPLEMENTED` (BUILD_FIRST; device/owner gates deferred) | Shared feedback/celebration/interaction primitives |
| P04 | Station Challenge Foundation | P01, P02 | `IMPLEMENTED` (BUILD_FIRST; live/device gates deferred) | Reusable challenge contract + engine boundary |
| P05 | ST01 Engagement Vertical Slice | P03, P04 | `IMPLEMENTED` (BUILD_FIRST; live/device/child/education gates deferred) | Fully playable Station 01 + challenge + mission + reward slice |
| P06 | Mission Engine + Mission Hub | P05 | `IMPLEMENTED` (BUILD_FIRST; live/device/child gates deferred) | Daily/Station/World mission system |
| P07 | Achievement + Reward Grant + Collection | P06 | `IMPLEMENTED` (BUILD_FIRST; live/device gates deferred) | Real achievements/rewards/inventory projection |
| P08 | Character Customization + Character Collection | P07 | `IMPLEMENTED` (BUILD_FIRST; live/device gates deferred) | Avatar workshop + unlockable collection loop |
| P09 | World + Long-Term Progression | P07, P08 | `IMPLEMENTED` (BUILD_FIRST; live/device gates deferred) | Worlds, world missions, synthesis challenges |
| P10 | ST02–ST25 Challenge & Content Expansion | P05, P09 | `IN_PROGRESS` (25/25 playable MC packs; review/device gates open — not PASS) | 25/25 playable packs seeded; PASS gated on VD-013…017 |
| P11 | Learning Rhythm + Notifications | P06 | `IMPLEMENTED` (BUILD_FIRST; OS push + child QA deferred) | Non-punitive return loop |
| P12 | Rive + Audio + Game-Feel Polish | P03, P08 | `PENDING` | Production cast, audio, motion calibration |
| P13 | Accessibility + Performance + Safety + Child QA | P10, P11, P12 | `PENDING` | Device/child/reduced-motion/a11y sign-off |
| P14 | Pilot + Release + Controlled Rollout | P02, P10, P11, P12, P13 | `PENDING` | Live verification, AAB/APK, pilot, rollback plan |

### 13.1 Execution graph

```text
                 ┌────────────── P01 Research / Design ──────────────┐
                 │                                                   │
P00 Cleanup ─────┼────> P02 Technical Baseline ──────────────────────┤
                 │                                                   │
                 └───────────────────────────────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ↓                       ↓
                     P03 Game Feel           P04 Challenges
                          └───────────┬───────────┘
                                      ↓
                              P05 ST01 Slice
                                      ↓
                              P06 Missions
                                      ↓
                           P07 Reward / Achievement
                                      ↓
                              P08 Customization
                                      ↓
                              P09 Worlds
                                      ↓
                    P10 ST02–ST25 Expansion
                                      │
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
              P11 Learning Rhythm                 P12 Polish
                    └─────────────────┬─────────────────┘
                                      ↓
                              P13 Child / A11y QA
                                      ↓
                              P14 Pilot / Release
```

P01 and P02 are the only intentionally parallel tracks. ~~Feature implementation does not begin until both are `PASS`.~~ Superseded by 13.4 (BUILD_FIRST): feature implementation proceeds P03 → P12 in graph order; deferred verification is collected in 13.5 and closed at the start of P13.

### 13.3 PLAN_REVISION — 2026-10-04 (P03 early slice freeze + content deferral)

- **Reason:** a P03 implementation slice was started on 2026-10-03 before P01/P02 reached `PASS`, contradicting 13.1 and `START_HERE.md`. Separately, the human owner decided that station content depth needs dedicated, deep work and must not be rushed now.
- **Evidence:** P03 evidence record (2026-10-03); `START_HERE.md` §4; owner direction 2026-10-04.
- **Decision:** the existing P03 code is retained (it is statically verified and does not touch learning truth) but P03 is **frozen**: no new P03 scope and no P04+ work until P01 and P02 are `PASS`. P03 stays `IN_PROGRESS`; it is not reset to `PENDING` and not `PASS`. Station content depth stays in its scheduled phases: ST01 in P05, ST02–ST25 in P10. No new station content is authored before those phases.
- **Affected phases:** P03 (frozen), P05, P10 (scope unchanged, explicitly confirmed).
- **Contracts/specs affected:** none.
- **Migration/API compatibility impact:** none.
- **Re-open of passed phases:** none (P00 stays `PASS`).
- **Rule clarification:** the P02 "Important rule" now matches this section: P03+ may neither start new scope nor `PASS` before P01 and P02 are `PASS`.
- **Superseded (same day) by 13.4** for the freeze only. The content-deferral decision above stays in force.

### 13.4 PLAN_REVISION — 2026-10-04 (BUILD_FIRST: implement now, verify later)

- **Reason:** the human owner decided to finish the code of the product first and run testing/verification afterwards. The P01/P02 gates that remain (owner/child review, `npm install` + lockfile, live Supabase, Android device) need resources outside the AI coding environment and were blocking all implementation.
- **Evidence:** owner direction 2026-10-04; P01 log (decisions A–G encoded in `packages/contracts/src/engagement-policy.ts`); P02 log (P02-B..E source implemented, only live/device evidence open).
- **Decision:**
  1. `execution_mode: BUILD_FIRST`. The 13.3 freeze is lifted. Implementation proceeds in graph order: **P03 (finish) → P04 → P05 → P06 → P07 → P08 → P09 → P10 → P11 → P12**.
  2. P01 and P02 stay `IN_PROGRESS` (their gates are real and still open) but are **build-unblocked**. The encoded P01 decision register is the working product baseline; `PROVISIONAL` items stay provisional and are re-checked at their `reviewAt` phase.
  3. A finished implementation phase gets `IMPLEMENTED`, never `PASS`. Its unrun gates go into the verification debt ledger (13.5).
  4. **P13 starts by closing the whole ledger** (P01 owner + child review, the P02 gates, and every phase's deferred device/live/child item) before its own a11y/perf/safety work. P14 is unchanged. No phase becomes `PASS` without its evidence.
  5. Content deferral from 13.3 stays: ST01 depth in P05, ST02–ST25 in P10.
- **Guardrails that do NOT relax under BUILD_FIRST** (violating any of these is a defect, not a shortcut):
  - Learning Truth stays server-authoritative; no second engine; Mini Game / Station Challenge ride the existing Learning Runtime.
  - Reward ≠ mastery; achievement ≠ mastery; no `reward_granted → mastery`.
  - No child-facing gems/coins/store/loot boxes/leaderboards in V1 (P01-D-02, P01-D-04).
  - Primary nav stays `مسیر / تمرین / من`; Mission Hub is a secondary screen from a Path entry card (P01-E-01).
  - The existing 25-station zig-zag path is preserved, not rebuilt.
  - No evaluator/answer keys in client content.
  - Every phase keeps all verifiers that can run in its environment green (`verify:static:all`, available `tsc`, unit tests), adds its own verifier, and fills the 0.12 evidence record with honest `UNVERIFIED` fields.
  - New DB work = new forward-only migration; never edit an applied migration.
- **Known risk accepted by owner:** code is written without a lockfile-backed install, so mobile/web typecheck and builds may hide errors until the ledger is closed. Mitigation: run `npm install` + `npm run verify:p02:full` as early as a networked machine is available, even mid-build; it is not blocking.
- **Affected phases:** P01, P02 (unchanged status, build-unblocked), P03 (unfrozen), P04–P12 (may start in order), P13 (absorbs the ledger).
- **Contracts/specs affected:** none. **Migration/API impact:** none. **Re-open of passed phases:** none.
- **P01 review prototype:** `prototypes/p01-engagement-review/` stays a review tool for the ledger; its code is not ported into `apps/`.

### 13.5 Verification debt ledger (BUILD_FIRST)

Every gate deferred under 13.4 is listed here. Add a row when a phase reaches `IMPLEMENTED`; close a row only with real evidence. P13 cannot pass while any row is `OPEN`.

| ID | Phase | Deferred gate | How to close | Status |
|---|---|---|---|---|
| VD-001 | P01 | Product/learning owner review of decisions A–G | Fill the review panel in `prototypes/p01-engagement-review/`, attach JSON export to the P01 log | OPEN |
| VD-002 | P01 | Child discoverability/feel test (Mission Hub placement, challenge, collection, avatar) | Protocol in the prototype README, 5–8 Grade 1 children | OPEN |
| VD-003 | P02-A | Clean `npm install`, committed `package-lock.json`, `npm run verify:p02:full` green | Networked dev machine | OPEN |
| VD-004 | P02-B/C | Live Supabase: migrations, Phone OTP, RLS/RPC negative paths | Real Supabase project | OPEN |
| VD-005 | P02-E | EAS APK install + live ST01 end-to-end on a physical Android device | EAS build + device | OPEN |
| VD-006 | P03 | Physical Android visual/motion smoke + UX-owner approval | Device + owner | OPEN |
| VD-007 | P00/P02 | Legacy verifier drift (BL-001) reconciled | Update or retire stale verifiers | OPEN |
| VD-008 | P05 | Live ST01 slice + child/education sign-off | Live Supabase 0057 + device playthrough + educational review | OPEN |
| VD-009 | P06 | Live mission_sync RPC + Mission Hub device smoke + child discoverability | Apply 0058, exercise mission_sync, Android hub entry from Path | OPEN |
| VD-010 | P07 | Live collection_sync + inventory/achievements on device | Apply 0059, Profile collection projection, child review | OPEN |
| VD-011 | P08 | Live avatar_save_appearance + owned cosmetics on device | Apply 0060, workshop E2E after challenge grant | OPEN |
| VD-012 | P09 | Live worlds_projection + path world labels on device | Apply 0061, complete a unit end-to-end | OPEN |
| VD-013 | P10-A | Educational sign-off + device smoke for ST02–ST05 challenges | Human review matrix + Android ST02–ST05 challenge runs | OPEN |
| VD-014 | P10-B | Educational sign-off + device smoke for ST06–ST10 challenges | Human review matrix + Android ST06–ST10 challenge runs | OPEN |
| VD-015 | P10-C | Educational sign-off + device smoke for ST11–ST15 challenges | Human review matrix + Android ST11–ST15 challenge runs | OPEN |
| VD-016 | P10-D | Educational sign-off + device smoke for ST16–ST20 challenges | Human review matrix + Android ST16–ST20 challenge runs | OPEN |
| VD-017 | P10-E | Educational sign-off + device smoke for ST21–ST25 + full 25/25 review | Human review + Android ST21–ST25; then P10 may move IMPLEMENTED | OPEN |
| VD-018 | P11 | Child QA of rhythm copy + optional OS push scheduling | Device smoke Path card + settings toggle; no pressure language | OPEN |

### 13.2 Phase completion transaction

A phase completion is treated like a transaction:

1. implementation work is frozen;
2. all mandatory checks are run;
3. failed checks are repaired and re-run;
4. human/child/educational gates are recorded when required;
5. `PASS_JUSTIFICATION` is filled;
6. the phase status changes to `PASS`;
7. only then may a dependent phase start.

A phase cannot be marked `PASS` retroactively because a later phase fixed one of its blockers. Re-open the phase through `PLAN_REVISION` instead.

---

# 14. PHASE TEMPLATE — MANDATORY FOR EVERY PHASE

Every phase section below follows this same contract.

```text
Goal
Why now
Dependencies
Research Gate
Research Decision Log
Scope
Implementation Steps
Data / Contract Changes
UX / Game Feel
QA / Verification
Human / Child / Educational Gates
PASS Criteria
BLOCKED Criteria
Rollback / Review Triggers
Phase Log
```

No phase may omit the Research Gate or PASS Criteria.

### 14.1 Implementation-touchpoint rule

Each phase must name the **existing** code/contracts it will touch before editing. When a phase creates a new subsystem, its target directory/module boundary must be stated before implementation. Never create files only to satisfy a checklist.

### 14.2 Gate evidence location rule

Current phase evidence belongs in:

- this roadmap (phase log / decision log / status);
- executable verifier/test output;
- current contracts and migrations;
- release/playtest reports outside the historical snapshot tree when needed.

Do not create per-phase Markdown snapshots.

---

# P00 — DOCUMENTATION CLEANUP + TRUTH RECONCILIATION

**Status:** `PASS`
**Date completed:** `2026-10-03`

## Goal

Remove obsolete/duplicated/currently misleading documentation and establish one AI-readable implementation plan.

## Why now

The previous repository contained competing roadmaps, stale UX research, old source revisions, v1.3 design material, and contradictory product assumptions (for example ParentGate/old navigation/stale path descriptions). Those conflicts make AI execution unsafe.

## Dependencies

None.

## Research Gate

Completed as part of current repository review and current external benchmark refresh.

## Work completed

- Replaced old `ROADMAP_PHASES.md` with this single master execution plan.
- Updated `START_HERE.md`, `README.md`, and `docs/README.md` to point to this roadmap.
- Removed the obsolete `project-design-v1.3` design package after v2 became canonical.
- Removed stale/duplicated source specs that created competing truths.
- Removed the stale UX journey research that still described the old ParentGate/entry flow.
- Removed the pre-P09 child-surface specification.
- Removed explicitly superseded UX roadmap/phase documents.
- Removed historical-only documentation that had no current execution role where safe to do so.
- Kept current technical contracts, ADRs, API contracts, QA release documents, current source specs, and current phase evidence that remain referenced by active tooling.
- Removed obsolete phase-1/phase-2 audit tooling that depended on the deleted v1.3 UX catalog.
- Updated current verification references from the deleted old Station 01 source file to the completed canonical Station 01 source.
- Removed dangling references from current docs to deleted sources.

## Cleanup inventory

The cleanup pass retired the old document layer that could compete with this roadmap:

- `docs/phases/*.md`: **0 current files remain**.
- `docs/audits/*`: **0 snapshot files remain**.
- Old phase-named API contracts were renamed to domain-oriented API contract names; the duplicate Phase 6 API note was removed.
- Obsolete UX journey research JSON was removed because it described the pre-cleanup path/jump state.
- Root/current README and START_HERE now point to this roadmap as the only phase-sequencing authority.

Historical snapshot manifests under `docs/history/` are retained strictly as trace records and are never a current source of truth.

## PASS evidence

- 25-station path and 64-skill implementation truth preserved.
- Current phone-only onboarding preserved.
- Current 3-tab child surface preserved.
- Current `project-design-v2` preserved.
- Current game/engagement specification preserved.
- No active document may instruct the AI to use `project-design-v1.3` as a current source.
- No `docs/phases/*.md` implementation roadmap remains; phase sequencing is centralized here.
- No `docs/audits/` snapshot tree remains; current evidence is emitted by executable checks and summarized here when it changes a decision.
- Phase-specific API filenames were normalized to domain-oriented names; the redundant Phase 6 API note was removed.
- QA capture references were reconciled with phone-only authentication and no ParentGate onboarding.

## Phase log

`PASS` — 2026-10-03.

Evidence recorded in this handoff:

- Markdown working-tree reduction: `docs/` from 139 Markdown files at the start of cleanup to 35 current Markdown files; `docs/phases/` and `docs/audits/` removed from the working tree.
- Retired pre-cleanup UX research JSON removed after confirming it described the old path/jump state.
- API contracts normalized from phase-named filenames to domain-named filenames; redundant Phase 6 API contract removed.
- Root/current navigation documentation reconciled with phone-only OTP and no separate ParentGate.
- `node scripts/verify-migrations-static.mjs` → PASS (52 migrations; latest `0052_child_path_station_label_refinement_v2.sql`).
- `node scripts/verify-phase16-deep-audit.mjs` → PASS for static/runtime regression suite; output explicitly leaves live pilot/device gates unverified.
- `node scripts/verify-production-readiness-static.mjs` → PASS.
- `node scripts/verify-mobile-release.mjs` → PASS (target SDK/API 36, production AAB, preview APK, SecureStore auth, 3 child tabs).
- `node scripts/verify-ux-p10-final.mjs` → PASS.
- `node scripts/verify-uiux-phase7-5.mjs` → PASS.
- `node scripts/verify-uiux-path2.mjs` → PASS.
- `node scripts/verify-uiux-phase7.mjs` → PASS.
- `node scripts/verify-uiux-phase8.mjs` → PASS.
- `node scripts/verify-uiux-phase9.mjs` → PASS.
- `node scripts/verify-uiux-phase3.mjs` → PASS.
- `node scripts/verify-uiux-phase4.mjs` → PASS.
- `node scripts/verify-uiux-phase5.mjs` → PASS.

Explicitly **not verified** by P00: full dependency-backed workspace build/typecheck, live Supabase/Auth/RLS/RPC execution, EAS/device build, real-device QA, child playtest, and educational approval. Those remain scheduled gates in later phases.

---

# P01 — PRODUCT / GAME RESEARCH + DESIGN LOCK

**Status:** `IN_PROGRESS`
**Depends:** `P00`

## Goal

Freeze the product philosophy and interaction rules for game-feel, missions, achievements, rewards, character collection, worlds, and station challenges before feature coding.

## Why now

The repository already contains good technical game contracts, but the engagement layer needs product-level decisions so implementation does not drift into ad-hoc gamification.

## Research Gate

Required research topics:

1. Duolingo current path/quest/achievement/progression patterns.
2. Khan Academy Kids character/reward/adaptive learning patterns.
3. DragonBox math-as-mechanic patterns.
4. Prodigy quest/world/boss/collection patterns.
5. SplashLearn short math-game patterns.
6. Current primary-education gamification research.
7. Current Google Play child/Families policy before any spendable currency or purchase-related design.

Minimum output:

```text
SOURCE
FINDING
BORROW
ADAPT
REJECT
RISK
MEASUREMENT
```

## Product decisions to lock

### A. Child game feeling

- playful first;
- objective obvious;
- short feedback loops;
- errors safe;
- no punitive economy;
- visual progress matters;
- game mechanic should embody the math where possible.

### B. Mission architecture

Lock:

- Daily / Station / World / Adventure categories;
- maximum active daily missions;
- mission trigger taxonomy;
- completion semantics;
- reward frequency;
- expiry behavior;
- UI placement.

### C. Achievement architecture

Lock:

- families;
- milestone thresholds;
- collection display;
- reward relationship;
- re-unlock/idempotency behavior.

### D. Reward architecture

Decide:

- which rewards are V1;
- whether an earn-only token exists;
- whether token is called `diamond`, `gem`, `star`, or another neutral term;
- whether it can be spent in V1 or only collected;
- how often rewards appear;
- whether rewards are deterministic or choice-based.

### E. Mission Hub placement

Choose one after child-oriented UX review:

- Path entry card;
- Profile secondary route;
- dedicated secondary route reachable from both.

Do not add a primary tab until evidence supports it.

### F. World structure

Confirm whether 5 existing Grade 1 units map to 5 worlds or whether multiple units share a world.

### G. Signature challenge rules

Lock:

- target duration;
- round count range;
- challenge result semantics;
- hint rules;
- failure handling;
- character reaction timing;
- reward relationship.

## Implementation

No major feature implementation. This is a design/research lock phase.

Allowed:

- product contracts;
- diagrams;
- JSON schemas;
- event names;
- acceptance criteria;
- low-fidelity prototypes if necessary for child test.

## PASS criteria

- Research log contains the required sources.
- Every `OPEN` engagement decision is either resolved or explicitly scheduled.
- Mission Hub placement is decided.
- Reward economy decision is explicit.
- 25-station challenge rule is explicit.
- No feature is justified solely by “Duolingo does it”.
- Child-safety and Google Play implications are recorded for any economy-related decision.
- Product/design/learning owner signs off.

## BLOCKED criteria

- unresolved primary navigation conflict;
- no agreement on reward semantics;
- research missing for a high-risk product decision;
- child-safety/policy implications unknown for a proposed paid/spendable economy.

## Rollback/review triggers

Re-open P01 if later child testing shows:

- missions distract from the path;
- reward collection dominates math interaction;
- children misunderstand the difference between a mission and a lesson;
- a chosen currency creates pressure or transaction confusion.

---

# P02 — TECHNICAL FOUNDATION VERIFICATION + STABILIZATION
## Implementation touchpoints

Read before editing:

- `package.json` and workspace package manifests
- `apps/mobile/package.json`, Expo config and release profiles
- `packages/contracts/`
- `packages/learning-runtime/`
- `packages/offline-sync/`
- `apps/web/app/api/v1/`
- `supabase/migrations/`
- `docs/api/`
- `docs/qa/ANDROID_STORE_RELEASE_CHECKLIST.md`


**Status:** `IN_PROGRESS`
**Depends:** `P00`

## Goal

Prove the existing product can be built, typed, tested, and connected to the real backend before adding new engagement infrastructure.

## Why now

The previous snapshot has passed static checks, but live dependency/backend/device gates were not all executed.

## Research Gate

Research the current toolchain versions and release constraints:

- Node/npm workspace compatibility;
- Expo/React Native requirements;
- Android API 36 requirements;
- Supabase Auth/RLS/RPC production verification patterns;
- Google Play child-app release requirements.

## Implementation steps

### P02 execution tracks

### P02 implementation note

The substantial source implementation for the Android-first authority boundary is now in place: production auth fails closed; Android installation identity is server-bound; session resume and Jump Assessment are RPC-authoritative; ST01 production content is canonical and child-safe; progression is reconciled from a server snapshot; and production cache reads are integrity-verified. P02 remains `IN_PROGRESS` only for live/backend/device/reproducibility evidence and the committed dependency lockfile.


P02 is executed as five substantial gates because Android is the final product surface:

- **P02-A — Reproducible engineering baseline:** lock dependency resolution, build shared packages, typecheck all required workspaces, run unit/static verifiers, and record exact tool versions.
- **P02-B — Production security boundary:** fail-closed Auth, account/learning-identity resolution, client-installation binding, RLS/RPC permissions, and explicit negative-path tests.
- **P02-C — Learning Runtime authority:** authoritative session resume, encounter creation, attempt idempotency, station-pass semantics, Jump Assessment persistence/grant, and golden semantic fixtures.
- **P02-D — Canonical Android content:** ST01 child-safe content presentation, stable package checksum/version, entitlement, cache verification, and no evaluator answer keys in downloadable production content.
- **P02-E — Android vertical smoke:** Expo/EAS config, APK preview profile, cold/warm resume, offline queue semantics, and live ST01 execution against Supabase.

## Implementation steps

1. Install dependencies from the current repository manifests.
2. Build shared packages.
3. Run all workspace typechecks.
4. Run unit tests.
5. Run current static verifiers.
6. Run Web production build.
7. Run Mobile export/typecheck.
8. Verify Expo/EAS configuration.
9. Execute live Supabase migration/Auth/RLS/RPC checks where credentials/environment are available.
10. Execute Station 01 live E2E.
11. Execute at least one cold/warm Android device smoke test.
12. Record exact environment versions.

## PASS criteria

- dependency installation succeeds;
- package builds succeed;
- TypeScript checks succeed across required workspaces;
- unit tests are green;
- Web production build is green;
- mobile export/build is green;
- static gates remain green;
- live Supabase/Auth/RLS/RPC checks pass;
- Station 01 live E2E passes;
- no production auth fallback is exposed;
- Android package/target configuration satisfies current release requirements.

## BLOCKED criteria

- missing required credentials;
- unavailable backend project;
- unavailable Android device/build service;
- any failing required build/test gate.

## P02-A evidence update — 2026-10-03 (sandbox, no network)

Environment: Node `v22.23.1`, TypeScript `5.6.3`, esbuild bundled runner; **no npm, no registry access, no lockfile install** — so this is partial P02-A evidence, not a clean-install PASS.

- `tsc` typecheck PASS: `contracts`, `design-system`, `learning-runtime`, `offline-sync`, `assignment-runtime`, `adult-projections` (earlier adult-projections errors were a missing workspace link cascade, not code defects).
- `tsc` package builds PASS: `assignment-runtime`, `learning-runtime`, `offline-sync`, `adult-projections`.
- Unit tests executed for the first time in this snapshot (esbuild + vitest-compatible shim, not real vitest): **19/19 node-runnable files, 0 failures after fixes**. `RevealPrimitives.test.tsx` NOT_RUN (needs `react-native`/`react-native-reanimated`).
- Real defects found by executing the tests and fixed (dependency fixes, no forward leakage):
  1. `previousOnboardingStep('SYNC_LOADING')` returned `RESULT`; sync commit is now non-reversible.
  2. `maskIranMobile` rendered mixed Latin/Persian digits (`۰۹12 ••• •567`); now fully Persian.
  3. `updateChildAvatarPreset` was not idempotent for the implicit default avatar; default `sun` is now one exported constant used by Profile/Avatar.
  4. Touch-target guard silently skipped `DS.size.*` token styles; it now resolves tokens and caught real sub-48dp targets: Path `continueButton` (44dp), two OTP text actions, tappable `ChildAvatar`. All fixed to `DS.size.touchMin`.
  5. `engagement.test.ts` relied on vitest globals and was invisible to tsc; now imports explicitly.
  6. `verify-mobile-release.mjs` was **failing in the supplied snapshot** (hard-coded `SCHEMA_VERSION = 3` vs current `5`), contradicting the P00 log; guard now asserts an explicit version ≥ 3 plus newer-version rejection. It also still expected `preferences.motion` inside `AnimatedCharacter` although P03 moved it to the shared `useReducedMotionPreference` hook; the guard now checks the shared hook. This also unblocked `verify-ux-p10-final.mjs`, which chains into it.
- Added `scripts/run-p02-gates.mjs` (`npm run verify:p02:full`): one command that runs install → package builds → typecheck:all → unit tests → static verifiers → web build → expo export and writes a timestamped JSON evidence record. It must be run on a networked dev machine to close P02-A.

Legacy verifier drift (already failing in the supplied snapshot, unchanged here; tool names only per 0.10.1): `independent-verification`, `verify-phase4/6/7/8/10/11-auth/12-postgres-runtime/14-deep-remediation` assert removed routes (`app/animation.tsx`, `station/[stationId].tsx`, teacher web pages), old `__DEV__` auth fallback that P02 intentionally removed, a renamed idempotency-key variable (scope itself verified intact: installation+session+encounter+content+attempt), or `dist/` output. **Backlog:** retire or re-baseline them in P02-A so the verifier surface has no red noise. → **Closed 2026-10-04**, see below.

## P02-A evidence update — 2026-10-04 (sandbox, no network)

Environment: Node `v22.23.1`, TypeScript via local `tsc`; still **no npm registry access, no lockfile install**. Partial P02-A evidence only.

- **Legacy verifier backlog closed.** All 33 executable verifiers in `scripts/` now pass in one sweep via the new `npm run verify:static:all` (requires `npm run build:packages` first). Re-baselined to current truth, with a dated comment in each file: `verify-phase11-auth` (removed ContentManager dev auth fallback now asserted *absent*; production cache integrity asserted; roadmap wording), `verify-phase12-postgres-runtime` + `verify-phase14-deep-remediation` (idempotency key uses `installationId`; canonical skill-graph id `g1-canonical-v1.0` from migration 0045), `verify-phase8` (retired teacher web pages no longer required; teacher APIs still required), `independent-verification` (green through the chained fixes).
- **Real defects fixed (dependency fixes, no forward leakage):**
  1. `typecheck:all` called `npm --workspace @math/adult-projections run typecheck`, but that package had no `typecheck` script, so `verify:p02:full` could never pass. Added; `learning-runtime` typecheck added; `design-system` and `learning-runtime` now included in `typecheck:all`.
  2. `runtime-tests.mjs` deleted `packages/learning-runtime/dist` unconditionally, breaking any later gate (web build, mobile export) because `@math/learning-runtime` resolves to `dist/`. It now only removes `dist/` it created.
  3. `offline-sync` build compiled `__tests__` into `dist/` and required `vitest` types at build time; added `tsconfig.build.json` excluding tests.
  4. **Expo SDK drift:** `expo ~57` but `expo-secure-store ~15.0.7` (SDK 54 line) and `expo-build-properties ~0.14.0` (SDK 53 line). Since SDK 55 Expo modules share the SDK major; pinned to `~57.0.4` / `~57.0.22` (checked against the npm changelogs on 2026-10-04). `verify-mobile-release` now asserts SDK-aligned majors for all Expo-owned modules instead of a stale literal.
  5. Root `package.json` declared `react-native-reanimated`/`react-native-worklets` as root dependencies without `react-native`; removed (they remain in `@math/mobile`).
  6. Two Playwright journeys navigated to the retired `/teacher` web UI; marked `test.skip` with reason. Teacher API lifecycle tests remain active.
- `run-p02-gates.mjs` now also runs `mobile:deps:check` (`expo install --check`) and `verify:static:all`.
- `tsc --noEmit` PASS: `contracts`, `design-system`, `assignment-runtime`, `adult-projections`; package builds PASS: `learning-runtime`, `offline-sync`, `assignment-runtime`, `adult-projections`.

Still UNVERIFIED: clean `npm ci` + lockfile, `expo install --check` against the full SDK 57 matrix, real vitest run, mobile/web typecheck (need RN/Next deps), web production build, Expo export, live Supabase/Auth/RLS/RPC, ST01 live E2E, Android device smoke.

## Important rule

P02 may be `BLOCKED` without preventing P01 research work. Under BUILD_FIRST (13.4) feature phases (`P03+`) may start new scope while P02 is `IN_PROGRESS`, but no phase may `PASS` before P01 and P02 are `PASS`; open P02 gates live in the verification debt ledger (13.5).

---

# P03 — GAME FEEL FOUNDATION
## Implementation touchpoints

Primary existing boundaries:

- `packages/contracts/src/animation.ts` and `packages/contracts/src/index.ts`
- `apps/mobile/src/animation/`
- `apps/mobile/src/components/AnimatedCharacter.tsx`
- `apps/mobile/src/station/StationFlow.tsx`
- `apps/web/components/CharacterArt.tsx` and existing child feedback primitives
- `docs/source/math_learning_product_animation_visual_runtime_v0_32.md`
- `docs/adr/ADR-0002-semantic-animation-events.md`


**Status:** `IMPLEMENTED`
**Depends:** `P01, P02`

## Goal

Build one reusable interaction-feedback language so the product feels like one coherent game rather than 25 unrelated mini-apps.

## Implementation update — 2026-10-03

The first substantial P03 implementation slice is now in place on Android:

- `apps/mobile/src/game-feel/` owns shared feedback policy, transient feedback presentation, and tactile choice interaction.
- `GameFeelController` maps existing semantic animation events to short, non-punitive feedback without becoming a learning-truth authority.
- `CharacterSays` can render the semantic character state through `AnimatedCharacter`; learning code still emits events rather than renderer commands.
- `StationFlow` uses the shared tactile choice primitive and shared feedback overlay for real ST01 interactions.
- Shared `RevealPrimitives` now cover reward, badge, unlock, and hint reveals with the same reduced-motion/accessibility boundary; StationFlow uses the reward reveal on successful station completion.
- `StationFlow` card/button rendering now delegates to the canonical `DSSurface`/`DSButton` primitives instead of maintaining a second local surface/button implementation.
- Drag/drop evaluation now distinguishes `ACCEPTED`, `REJECTED`, and `OUTSIDE` so future challenge screens can express near-miss/rejection without encoding answer truth in the renderer.
- OS reduced-motion and the in-app motion preference remain hard constraints across character, feedback, reveal, tap, and drag primitives through one shared motion-preference hook.
- Celebration `blocksInput` is now consumed by `StationFlow`, so meaningful completion feedback prevents duplicate interaction only during its bounded feedback window.
- `useAnimationController` dispatch is now referentially stable, preventing effect churn in consumers.
- Pure controller/feedback tests and a dedicated P03 static verifier were added.
- Finalized one cross-surface `packages/contracts/src/game-feel.ts` contract with semantic vs renderer-local interaction events, reduced-motion/silent/haptics resolution, shared outcome mapping, and bounded feedback budgets.
- Removed the duplicate mobile `animation/*` feedback fork; Android now consumes the shared contract, while Web uses the same authoritative outcome mapping.
- Added near-miss placement semantics, forgiving drag geometry, centralized haptic patterns, accessible reveal announcements, and a shared animated progress-fill primitive.

P03 remains `IN_PROGRESS`: P02 is not yet PASS, and physical Android/UX-owner evidence is intentionally deferred. No P03 PASS claim is made. ~~Frozen since 2026-10-04 (13.3).~~ **Unfrozen by 13.4 (BUILD_FIRST):** P03 is the current implementation phase; finish it, mark `IMPLEMENTED`, log deferred gates in 13.5, then start P04.

## P03 implementation evidence record — 2026-10-03

**PHASE_ID**
P03

**STARTED_AT**
2026-10-03

**COMPLETED_AT**
NOT_APPLICABLE — implementation slice remains IN_PROGRESS

**STATUS**
IMPLEMENTED (synced with §13 on 2026-10-04; device/owner gates open in VD-006)

**RESEARCH_SOURCES**
Existing research baseline documented in this roadmap and the referenced animation/game-feel ADRs; no new external research was required for this coding slice.

**BORROW_DECISIONS**
Reuse semantic animation events, canonical design-system tokens, Android reduced-motion signals, and existing shared DS surface/button/progress primitives.

**ADAPT_DECISIONS**
Adapt feedback into a mobile `GameFeelController`, keep transient feedback short and non-punitive, centralize reveal motion, and preserve renderer-independent learning truth.

**REJECT_DECISIONS**
No punitive wrong-answer shake/flash/deduction; no screen-specific animation fork; no new reward economy; no client-side learning/misusory mastery decision.

**FILES_READ**
`ROADMAP_PHASES.md`, `packages/contracts/src/animation.ts`, `apps/mobile/src/animation/*`, `apps/mobile/src/components/AnimatedCharacter.tsx`, `apps/mobile/src/components/CharacterAvatar.tsx`, `apps/mobile/src/station/StationFlow.tsx`, `apps/mobile/src/station/LessonPlayerChrome.tsx`, `apps/mobile/src/ui/design-system/*`, and existing P03 tests/verifier.

**FILES_CHANGED**
`apps/mobile/src/game-feel/*`, `apps/mobile/src/animation/index.ts`, `apps/mobile/src/components/SemanticAnimationDemo.tsx`, `apps/mobile/src/animation/useAnimationController.ts`, `packages/contracts/src/game-feel.ts`, `packages/contracts/src/game-feel.test.ts`, `packages/contracts/src/animation.ts`, `apps/web/components/DuolingoLessonModal.tsx`, `apps/web/components/InteractiveCompanion.tsx`, `apps/mobile/src/components/CharacterAvatar.tsx`, `apps/mobile/src/station/StationFlow.tsx`, `scripts/verify-phase3-game-feel.mjs`, `docs/adr/ADR-0034-shared-game-feel-feedback.md`, `CHANGELOG_v2.md`, `ROADMAP_PHASES.md`.

**CONTRACTS_CHANGED**
No new cross-package learning contract. `DragDropController` received a local interaction-result refinement only.

**MIGRATIONS_CHANGED**
NOT_APPLICABLE.

**TESTS_RUN**
P03 static verifier PASS (28/28); shared-contract tests PASS (9/9); mobile game-feel tests PASS (23/23 new/affected); P01 product-lock verifier PASS (9/9); migration static guard PASS (54/54); TypeScript source parse PASS for all P03 game-feel files and affected StationFlow/character/animation files. Full dependency-backed unit/typecheck suite is UNVERIFIED because workspace dependencies are not installed in this environment.

**DEVICE_TESTS**
NOT_RUN — intentionally deferred; APK/device work is out of the current task scope.

**HUMAN_REVIEW**
NOT_RUN.

**CHILD_EDUCATIONAL_REVIEW**
NOT_RUN.

**KNOWN_LIMITATIONS**
No installed `node_modules`/lockfile-backed workspace run, no physical Android visual/audio smoke test, no UX-owner approval, and P02 live Supabase/auth/RPC/device evidence remains open.

**OUT_OF_SCOPE_BACKLOG**
Audio/haptic implementation remains deferred to P12; mission/reward economy/challenge engine work remains in P04+; live Android/device evidence remains under P02.

**PASS_JUSTIFICATION**
NOT_APPLICABLE — P03 is not being marked PASS. The implementation slice is statically verified but its phase-level gates are not all green.

## Research Decision Log — 2026-10-03

- Android Developers, Make apps more accessible: interactive controls should provide at least a 48dp × 48dp touch target. **ADAPT**: retain the existing 48dp child touch-target guard and keep shared tactile controls at or above the target. Evidence: official Android accessibility guidance; measurement: static guard plus later device review.
- Android Developers, Haptics design principles: favor clear, action-oriented, consistent haptics, be mindful of frequency, and avoid legacy one-shot buzzing. **ADAPT**: centralize named haptic cues, keep wrong-answer nudges softer than success, gate haptics behind preferences, and defer production asset/audio calibration to P12. **REJECT**: punitive buzzes and unbounded vibration patterns.
- W3C WCAG 2.2, SC 2.3.3: non-essential interaction animation should be disableable; reduced-motion settings are a valid technique. **BORROW**: OS + in-app motion gate. **ADAPT**: when motion is reduced, remove animation while retaining readable feedback and the same semantic event.
- Nielsen Norman Group, Children’s UX and physical-development research: younger children expect clear interactivity and handle large tap, swipe, and drag gestures better than fine-motor interaction. **ADAPT**: tactile choice, forgiving drag placement, near-miss feedback, and visual feedback that does not depend on audio. **REJECT**: dense fine-motor controls and feedback-only-through-sound.

Research quality note: product benchmarks in the roadmap informed the overall product direction, but these P03 implementation decisions use the official Android/W3C requirements plus independent child UX research. None of these sources is treated as proof of learning gain.

## Research Gate

Research:

- child touch interaction and feedback design;
- micro-animation dosage for children;
- reduced-motion patterns;
- accessible audio/haptic feedback;
- current Android touch-target guidance;
- benchmark celebration/reward animation patterns from the researched products.

Gate result: PASS for the coding slice. The 2026-10-03 research above was checked before finalizing the shared contract; device and UX-owner gates remain open by design.

## Scope

Create reusable primitives for:

- tap response;
- drag/drop response;
- correct feedback;
- incorrect/try-again feedback;
- near-miss;
- hint reveal;
- progress fill;
- reward reveal;
- badge reveal;
- unlock reveal;
- chest/box reveal if approved;
- character reaction states;
- short completion celebration;
- reduced-motion variants;
- silent variants.

## Non-goals

- no mission backend;
- no new reward economy;
- no 25-game build;
- no world system.

## Implementation principles

- shared semantic tokens;
- semantic animation events;
- character assets remain separate from generic UI animation;
- no answer leakage in checks;
- dynamic feedback duration remains short;
- web/mobile reuse the same semantics.

## PASS criteria

- every shared primitive has accessibility/reduced-motion behavior;
- feedback is testable independently;
- no arbitrary screen-specific animation fork is introduced;
- one real existing StationFlow mini-game uses the new primitives;
- real device visual/audio smoke test passes on at least one Android device;
- UX owner approves the feedback rhythm.

---

# P04 — STATION CHALLENGE FOUNDATION
## Implementation touchpoints

Read and extend, rather than replace:

- `apps/mobile/src/station/StationFlow.tsx`
- `apps/mobile/src/station/runtimeApi.ts`
- `apps/mobile/src/station/types.ts`
- `apps/mobile/src/station/macro.ts`
- `packages/learning-runtime/`
- `packages/contracts/src/lesson.ts`, `learning.ts`, `content.ts`
- `docs/source/math_learning_product_game_engagement_quest_reward_v0_28_completed_v0_31.md`
- `docs/source/math_learning_product_session_runtime_learning_rules_v0_29_completed_v0_31.md`


**Status:** `IMPLEMENTED`
**Depends:** `P01, P02`

## Goal

Extend the existing game architecture with a canonical Signature Challenge layer without creating a parallel game engine or learning truth system.

## Research Gate

Research:

- game-loop design for short child interactions;
- adaptive difficulty without changing skill identity;
- server-authoritative evaluation of interactive games;
- evidence quality for game interactions;
- anti-cheat/idempotency patterns for retry/offline replay.

## Scope

Create the technical foundation for:

```text
Game Template
   ↓
Station Challenge Instance
   ↓
Encounter
   ↓
Attempt / raw response
   ↓
Evaluator
   ↓
Evidence (where allowed)
   ↓
Learning Runtime
```

## Contract

Canonical challenge fields:

- stable ID;
- Station ID;
- gameCode;
- primary/supporting skills;
- objective;
- rounds;
- difficulty policy;
- hint policy;
- timer policy;
- evaluator version;
- reward policy;
- evidence policy.

## Rules

- client does not authoritatively decide correctness/mastery/reward;
- difficulty does not change Skill identity;
- hard timers cannot appear in Mastery Check;
- challenge results do not automatically mark station mastery;
- challenge reward cannot directly set learning truth;
- retries are idempotent.

## PASS criteria

- one schema/contract exists and is shared;
- one engine path handles at least two templates;
- server boundary is explicit;
- duplicate submit behavior is tested;
- offline replay semantics are defined;
- evaluator versioning is present;
- no parallel `ChallengeEngine2`/duplicate game state system is created.

## BUILD_FIRST implementation update — 2026-10-04

- Added the production SQL runtime boundary in forward-only migration `0056_station_challenge_runtime_rpc.sql`; the previous 0055 RPC stubs are now replaced by transactional start, round submit, hint, finish, resume, and station-definition calls.
- Added server-computed answer fingerprints, retry-safe round receipts, challenge attempt provenance, and explicit `counts_toward_mastery=false` / `counts_toward_station_pass=false` enforcement.
- Extended the shared Learning Runtime command with optional challenge provenance. It is evidence metadata only and cannot alter evaluation, mastery, station pass, or reward truth.
- Added a plain-Node executable challenge gate with 15 behavioral tests covering two templates, idempotency, payload mismatch, retryable ordering, scaffolding, hints, early exit, reward eligibility, content-role rejection, and answer-key isolation.

## Verification record

- `node scripts/verify-phase4-challenge-foundation.mjs`: `PASS` (30 static checks).
- `node scripts/test-challenge-runtime.mjs`: `PASS` (15/15).
- `node scripts/verify-migrations-static.mjs`: `PASS` (56 migrations).
- `node scripts/verify-static-all.mjs`: `PASS` (35/35) after rebuilding the available package artifacts.
- Deferred under BUILD_FIRST: clean lockfile-backed install, live Supabase migration/RPC execution, physical Android smoke, and UX-owner review. These remain open in VD-003, VD-004, VD-005, and VD-006; P04 remains `IMPLEMENTED`, not `PASS`.

---

# P05 — ST01 ENGAGEMENT VERTICAL SLICE
## Implementation touchpoints

- `content/dev-packs/g1-st01-v2/` and current ST01 package metadata
- `apps/mobile/app/station/[stationId]/`
- `apps/mobile/src/station/StationFlow.tsx`
- `apps/mobile/src/ui/PracticeHubScreen.tsx` only where shared games are reused
- `docs/source/math_learning_product_station01_vertical_slice_v0_30_completed_v0_31.md`
- `docs/source/math_learning_product_grade1_skill_graph_v0_27_completed_v0_31.md`


**Status:** `IMPLEMENTED`
**Depends:** `P03, P04`

## Goal

Turn ST01 into the full reference vertical slice for the future product experience.

## Research Gate

Before implementation, review:

- the current ST01 source contract;
- current Grade 1 skill graph;
- child math interaction research for counting/pattern tasks;
- current character-feedback guidance;
- current game-feel benchmarks.

## Target ST01 structure

Preserve the current StationFlow encounter logic, adding:

```text
Existing learning flow
       +
ST01 Signature Challenge
       +
one Station Mission seed
       +
one Achievement seed
       +
one Reward seed
       +
character reactions
```

## Suggested challenge concept

Working concept only until P01/P04 lock:

> `مسیر گمشده` — a short pattern-path challenge where the child helps a companion choose the correct continuation.

Target skills remain ST01 skills; the game context changes, not the educational target.

## Test surfaces

- onboarding → path;
- path → ST01;
- lesson → challenge;
- challenge → result;
- challenge retry;
- challenge hint;
- mission progress;
- reward presentation;
- resume after interruption;
- offline/online reconciliation.

## PASS criteria

- ST01 can be completed end-to-end;
- Signature Challenge is clearly distinct from Mastery Check;
- mission progress is authoritative;
- reward grant is idempotent;
- character reaction does not leak answers;
- no hard timer in mastery;
- at least one real-device playthrough passes;
- basic child usability review finds no P0/P1 blocker;
- educational reviewer confirms the game still targets the intended ST01 skills.

## Rollback trigger

If the child spends attention on collecting/rewarding rather than the math interaction, simplify the engagement layer before expanding to ST02+.

---

# P05 — ST01 ENGAGEMENT VERTICAL SLICE

## BUILD_FIRST implementation update — 2026-10-04

- Added the shared ST01 slice contract in `packages/contracts/src/st01-slice.ts`: the three-round `مسیر گمشده` pattern challenge, pattern-safe hints, one station mission seed, one challenge achievement seed, deterministic reward seeds, and a pure server-fact engagement derivation.
- Added `apps/mobile/src/station/SignatureChallengeView.tsx` and connected the existing StationFlow to the P04 challenge runtime after the authoritative ST01 learning flow. The client sends raw choices only; it never evaluates correctness or grants progress.
- Added forward-only migration `0057_st01_engagement_vertical_slice.sql` with nine challenge variants, P04 definition/round bindings, canonical-approved content metadata, reward/mission seeds, idempotent reward projection, achievement unlock, and reward-presentation receipts.

## Verification record

- Contract typecheck: PASS.
- Existing static/regression suite: PASS (36/36 before P05 additions).
- Research gate: PASS for patterning importance and hint/help-seeking design. Borrow: short repeating-pattern interaction and progressive scaffolds. Adapt: Persian-first path metaphor, no hard timer, hints never reduce reward. Reject: answer-revealing hints, reward farming, mastery claims from challenge completion.
- Deferred under BUILD_FIRST: clean lockfile-backed install, live Supabase migration/RPC execution, physical Android smoke, child usability review, and educational sign-off. P05 is `IMPLEMENTED`, not `PASS`; gates roll into the verification debt ledger.

# P06 — MISSION ENGINE + MISSION HUB
## Implementation touchpoints

Expected new domain boundary (names to be finalized only after P01):

- shared mission contracts under `packages/contracts/`
- mission evaluator/service boundary under the server-side application layer
- Supabase migrations for authoritative mission instances/progress/completion
- child mission projection under Web + Mobile
- analytics event contract for mission lifecycle

Do not attach mission truth to `StationFlow` local state or invent a second progression engine.


**Status:** `IMPLEMENTED`
**Depends:** `P05`

## Goal

Build the real mission system and the child-facing Mission Hub/entry surface.

## Research Gate

Research current implementations of:

- daily quest generation;
- mission ordering;
- expiry;
- progress aggregation;
- child-friendly mission copy;
- notification/return loops.

Use Duolingo’s current Daily Quest ordering as one benchmark, not as a direct clone.

## Data/contract scope

Expected entities/contract families:

```text
MissionDefinition
MissionInstance
MissionProgress
MissionTrigger
MissionCompletion
```

Exact database naming is decided during implementation after migration review.

## Behavior

- max 3 active daily child missions;
- stable trigger IDs;
- progress is derived from accepted events;
- completion is idempotent;
- expired mission does not delete learning progress;
- mission rewards are granted once;
- offline progress can be queued but cannot create unauthorized learning truth.

## UI

Mission surface should show:

- title;
- objective;
- progress;
- reward preview;
- time/expiry only when useful and non-threatening;
- completion celebration;
- no shame/guilt language.

## PASS criteria

- server-backed mission state exists;
- daily generation/selection is deterministic enough to debug;
- mission progress survives app restart;
- duplicate event replay cannot double-complete;
- child UX passes basic usability review;
- mission placement is discoverable without competing with Path.

---

## BUILD_FIRST implementation update — 2026-10-04

- Added `packages/contracts/src/missions.ts`: deterministic daily selection, one active station mission, accepted-event receipts, silent expiry, idempotent completion/reward keys, child projection, and V1 guardrails.
- Added forward-only migration `0058_mission_engine_hub.sql` with mission definitions, instances, receipts, grants, RLS, seed catalog, and server-only mission sync/projection RPCs.
- Added the authenticated Web mission-hub endpoint and Android Mission Hub screen. The locked three-tab navigation remains intact, with missions exposed through a secondary Path entry card.
- Contract and migration static checks pass. Clean install, live Supabase execution, physical Android smoke, and child/owner review remain deferred under BUILD_FIRST.

**Verification:** contract typecheck PASS; migration static guard PASS (59 migrations including 0058); mission catalog validation PASS. Status is `IMPLEMENTED`, not `PASS`. Deferred gates: VD-009.

# P07 — ACHIEVEMENT + REWARD GRANT + COLLECTION
## Implementation touchpoints

- `packages/contracts/src/collection.ts` (+ tests)
- migration `0059_achievement_reward_collection.sql`
- Web `GET/POST /api/v1/collection`
- Mobile `getCollection` / `acknowledgeCollectionGrant` in runtimeApi
- Profile still shows compatibility `CHILD_ACHIEVEMENTS` for A01–A05; authoritative registry is the P07 catalog

**Status:** `IMPLEMENTED`
**Depends:** `P06`

## Goal

Replace the current small/hardcoded achievement approach with a real extensible achievement/reward registry and idempotent grant system.

## Research Gate

Research:

- milestone/trophy presentation;
- collection feedback for children;
- deterministic reward systems;
- non-punitive reward loops;
- current Families policy implications of child-facing commerce.

## Scope

Build:

- AchievementDefinition registry;
- AchievementProgress;
- AchievementUnlock;
- RewardDefinition registry;
- RewardGrant;
- Collection/Inventory projection;
- reward claim/presentation state if needed.

## Candidate reward taxonomy

```text
BADGE
COSMETIC
CHARACTER
STICKER
WORLD_ELEMENT
PATH_REVEAL
EARN_ONLY_TOKEN (only if P01 approves)
```

## PASS criteria

- no hardcoded “first five stations only” achievement registry remains as the long-term model;
- reward grants are idempotent;
- reward cannot mutate learning truth;
- inventory is reconstructable from authoritative grants;
- offline replay cannot duplicate grants;
- child-facing reward screens never imply money value unless explicitly approved;
- analytics events distinguish `presented` from `granted`/`claimed`.

---

## BUILD_FIRST implementation update — 2026-10-05 (P07)

- Added extensible achievement registry (path × 25 stations, challenge seed, family milestones) and collection reward catalog under V1 economy.
- Pure derivation: unlock once, idempotent grant keys, inventory reconstructable from grants; presentation separate from grant.
- Migration 0059: definitions/unlocks/presentation ledger, `collection_sync` / `collection_projection` / `collection_acknowledge_presentation`, client writes revoked.
- Web collection API + mobile client helpers. `CHILD_ACHIEVEMENTS` remains compatibility baseline only.
- Static verifier `verify-p07-collection.mjs` PASS. Live/device gates → VD-010. Status `IMPLEMENTED`, not `PASS`.

# P08 — CHARACTER CUSTOMIZATION + CHARACTER COLLECTION
## Implementation touchpoints

Current visual source:

- `project-design-v2/`

Current child surface:

- `apps/mobile/app/avatar.tsx`
- `apps/web/app/profile/avatar/page.tsx`
- `apps/mobile/src/state/` profile projection
- `apps/web/components/AvatarWorkshopView.tsx`

Production ownership must move from local-only projection to authoritative inventory ownership once P07 is PASS.


**Status:** `IMPLEMENTED`
**Depends:** `P07`

## Goal

Create a meaningful long-term customization loop based on actual earned rewards.

## Research Gate

Research:

- Khan Academy Kids collection/character room patterns;
- child avatar customization complexity;
- cognitive load from too many choices;
- save/cancel/offline behavior;
- visual identity consistency with current cast v2.

## Scope

Child Avatar:

```text
Preview
 → category selection
 → item selection
 → apply
 → save / cancel
```

Possible categories:

- outfit;
- hat;
- shoes;
- bag;
- accessory;
- background;
- pet/companion cosmetic later.

## Character unlocks

Potential unlock sources:

- world milestone;
- achievement collection;
- adventure completion;
- long-term path milestone.

Do not randomize valuable character unlocks in V1.

## PASS criteria

- child avatar remains separate from companion cast;
- inventory ownership is authoritative;
- save/cancel/error/offline states are explicit;
- no future-locked item appears as if it were earned;
- at least one end-to-end reward unlocks one visible customization item;
- visual design is compatible with current `project-design-v2`.

---

## BUILD_FIRST implementation update — 2026-10-05 (P08)

- `packages/contracts/src/avatar-customization.ts`: cosmetic catalog (base/outfit/hat/accessory/background), ownership from P07 grants, sanitize/equip, workshop projection.
- Migration `0060_avatar_customization.sql`: authoritative appearance, ownership checks on save, workshop projection RPC.
- Mobile avatar workshop: categories, locked labels, save/cancel, offline starter-only fallback.
- Web `/api/v1/avatar` GET/POST. End-to-end: ST01 challenge sticker grant → pattern background unlockable.
- Verifier `verify-p08-avatar.mjs` PASS. Live/device → VD-011. Status `IMPLEMENTED`, not `PASS`.

# P09 — WORLD + LONG-TERM PROGRESSION
## Implementation touchpoints

- existing `G1_STATIONS` / `G1_UNITS` progression data and contracts
- Path Web/Mobile surfaces
- new world/quest projection contracts only after P07/P08
- world challenge instances through the P04 challenge engine

No new route may replace the existing Path.


**Status:** `IMPLEMENTED`
**Depends:** `P07, P08`

## Goal

Turn the 25-station path into a coherent adventure journey without rebuilding the path engine.

## Research Gate

Research:

- Prodigy quest/world/boss progression;
- DragonBox world unlock patterns;
- child narrative dosage and cognitive load;
- long-term progression without excessive reward dependency.

## Scope

Provisional mapping:

```text
Unit 1 → World 1
Unit 2 → World 2
Unit 3 → World 3
Unit 4 → World 4
Unit 5 → World 5
```

Each world eventually gets:

- visual identity;
- story arc;
- collectible set;
- mission set;
- world challenge;
- completion reward.

## Existing path rule

The path itself remains the actual 25-station progression surface.

World visuals sit on top of the existing progression semantics.

## World Challenge

One synthesis challenge per world:

```text
Recall → Use → Combine → Decide → Celebrate
```

This is not a replacement for station checks or mastery.

## PASS criteria

- every world maps to real existing path units/stations;
- no fake unlock is created locally;
- world completion derives from authoritative station/mission/reward events;
- world challenge has explicit skill coverage and evaluator/evidence policy;
- the child can tell what changed after completing a world;
- educational review approves the synthesis design.

---

## BUILD_FIRST implementation update — 2026-10-05 (P09)

- `packages/contracts/src/worlds.ts`: 5 worlds ↔ 5 units, derived status from station passes, synthesis challenge stubs (not mastery).
- Migration `0061_world_progression.sql`: definitions, completion ledger, `worlds_projection` (grants WORLD_ELEMENT on unit complete).
- Path UI shows world title/story on unit headers; path remains primary (no new tab).
- Web `/api/v1/worlds`. World challenge content depth deferred to P10.
- Verifier `verify-p09-worlds.mjs` PASS. Live/device → VD-012. Status `IMPLEMENTED`, not `PASS`.

# P10 — ST02–ST25 CHALLENGE + CONTENT EXPANSION
## Implementation touchpoints

- canonical `G1_STATIONS`, `G1_UNITS`, 64-skill graph
- `content/` package definitions/migrations
- reusable G1 game templates from the current GEQR specification
- StationFlow / challenge engine from P04
- educational review matrix produced per batch


**Status:** `IN_PROGRESS` (Batch A–E definition seeds complete; review/device gates open; educational/device gates open)
**Depends:** `P05, P09`

## Goal

Expand the Signature Challenge experience to all 25 stations and ensure each one is educationally grounded.

## Research Gate

Before each content batch, research/review:

- the actual station contract;
- target/supporting skills;
- current error patterns/recovery variants;
- age-appropriate visual representation;
- benchmark game mechanics for the specific concept where useful.

## Production method

Do not build all 20+ challenges in one undifferentiated pass.

Use batches:

```text
Batch A: ST02–ST05
Gate
Batch B: ST06–ST10
Gate
Batch C: ST11–ST15
Gate
Batch D: ST16–ST20
Gate
Batch E: ST21–ST25
Gate
```

Each batch repeats:

```text
Research
 → Content design
 → Implementation
 → Evaluator QA
 → Educational review
 → Device smoke
 → PASS
```

## Required content matrix

For every station record:

| Field | Required |
|---|---|
| Station | yes |
| Primary Skill IDs | yes |
| Supporting Skill IDs | yes |
| Game Template | yes |
| Challenge Instance ID | yes |
| Objective | yes |
| Difficulty policy | yes |
| Evaluator version | yes |
| Hint policy | yes |
| Reward policy | yes |
| Mission hooks | yes |
| Evidence policy | yes |
| Child copy | yes |
| RTL/a11y review | yes |

## PASS criteria

- 25/25 stations have a Signature Challenge instance;
- all challenge instances map to real skills;
- evaluators are versioned;
- every batch has educational sign-off;
- no station introduces an unsupported parallel engine;
- challenge metrics remain secondary to learning metrics.

---

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch A only)

- Batch A stations: **ST02, ST03, ST04, ST05** (not ST06–ST25).
- `packages/contracts/src/p10-batch-a.ts`: content matrix, skill mapping, evaluator versions, PENDING_HUMAN_SIGN_OFF.
- Migration `0062_p10_batch_a_challenges.sql`: 4 `station_challenge_definitions` + sticker rewards; PRACTICE_EVIDENCE; not mastery.
- Verifier `verify-p10-batch-a.mjs` PASS for seed surface.
- **Not done:** Batch B–E, rich per-round content packs, educational sign-off, device smoke → VD-013.
- P10 remains `IN_PROGRESS` until all batches gate.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch B)

- Batch B stations: **ST06–ST10**.
- `packages/contracts/src/p10-batch-b.ts` + migration `0063_p10_batch_b_challenges.sql`.
- Educational review PENDING; device smoke → VD-014.
- Batches C–E not started. P10 remains `IN_PROGRESS`.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch C)

- Batch C stations: **ST11–ST15**.
- `p10-batch-c.ts` + migration `0064_p10_batch_c_challenges.sql`.
- Educational review PENDING → VD-015. P10 remains `IN_PROGRESS`.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch D)

- Batch D stations: **ST16–ST20**.
- `p10-batch-d.ts` + migration `0065_p10_batch_d_challenges.sql`.
- Educational review PENDING → VD-016. P10 remains `IN_PROGRESS`.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch E — final seed batch)

- Batch E stations: **ST21–ST25**.
- `p10-batch-e.ts` + migration `0066_p10_batch_e_challenges.sql`.
- **25/25** Signature Challenge *definitions* now seeded (ST01 via P05 + A–E).
- Educational sign-off + device smoke still open (VD-013…VD-017). P10 remains `IN_PROGRESS`, not PASS.
- Rich per-round content packs and UI templates remain iterative polish; engine is P04.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch A **depth**)

- Playable content for **ST02–ST05**: 3 rounds × 3 levels each (36 content versions).
- Migration `0067_p10_batch_a_depth_content.sql`: artifacts, versions, rounds, variants.
- `game_code` switched to **G1-GAME-001** (existing MULTIPLE_CHOICE engine path).
- Answers only in `evaluator_config`; presentation has options/display only.
- Batches B–E still definition-only until similar depth passes.
- Educational sign-off still open (VD-013).

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch B **depth**)

- Playable content for **ST06–ST10**: 3×3 variants each (45 content versions).
- Migration `0068_p10_batch_b_depth_content.sql`; template `G1-GAME-001`.
- Educational sign-off still open (VD-014). C–E depth not started.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch C **depth**)

- Playable ST11–ST15: 45 content versions; migration `0069`; template G1-GAME-001.
- VD-015 educational sign-off still open.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch D **depth**)

- Playable ST16–ST20; migration `0070`; G1-GAME-001. VD-016 still open.

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch E **depth** — final)

- Playable ST21–ST25; migration `0071_p10_batch_e_depth_content.sql`.
- **25/25 stations** now have playable MULTIPLE_CHOICE Signature Challenge packs (ST01 via P05).
- P10 remains `IN_PROGRESS` until VD-013…017 educational + device gates close.
- See `START_HERE.md` (single status file).

## BUILD_FIRST implementation update — 2026-10-05 (P10 Batch E depth — final)

- Playable ST21–ST25; migration `0071`.
- **25/25 playable** MULTIPLE_CHOICE packs. P10 still `IN_PROGRESS`.
- Handoff: `START_HERE.md`.

# P11 — LEARNING RHYTHM + NOTIFICATIONS
## Implementation touchpoints

- mission trigger/completion system from P06
- current child shell and settings contracts
- notification preference/state contract
- mobile-only scheduling/delivery boundary

No passive notification count becomes learning truth.


**Status:** `IMPLEMENTED`
**Depends:** `P06`

## Goal

Create a gentle return loop that supports learning without punitive streak pressure.

## Research Gate

Research:

- habit formation for children;
- child-friendly goal setting;
- reminder fatigue;
- notification timing/safety;
- current platform notification policies.

Khan Academy Kids explicitly frames goal-setting as a skill that benefits from supportive feedback rather than pressure; this phase must preserve that direction.

## Scope

Possible rhythm indicators:

- days with meaningful learning activity this week;
- current learning goal;
- next suggested activity;
- optional gentle reminder.

Do not build punitive streaks first.

## PASS criteria

- no reward loss on missed day;
- no guilt/shame copy;
- reminder can be disabled;
- rhythm metric counts meaningful learning, not passive app time;
- notification frequency is bounded;
- child testing shows no confusion or pressure.

---

## BUILD_FIRST implementation update — 2026-10-05 (P11)

- `learning-rhythm.ts`: meaningful-day derive, soft weekly aim, next suggestion, forbidden shame copy.
- Path card «آهنگ یادگیری» + Settings toggle «یادآور برگشت» (opt-in, disableable).
- No streak, no missed-day penalty, notification ≠ learning truth.
- OS push scheduling deferred → VD-018. Status `IMPLEMENTED`, not full PASS without child QA.

# P12 — RIVE + AUDIO + GAME-FEEL POLISH
## Implementation touchpoints

- `project-design-v2/assets/` and character build pipeline
- Rive companion/character components
- `apps/mobile/src/animation/` semantic events
- audio asset manifest and player boundary
- reduced-motion settings in local state and design system


**Status:** `PENDING`
**Depends:** `P03, P08`

## Goal

Bring the character system and sensory feedback from placeholder/soft-production quality to calibrated production quality.

## Research Gate

Research/QA:

- current Android audio and haptic behavior;
- Persian voice clarity for Grade 1;
- Rive performance on low-end Android;
- reduced-motion behavior;
- character feedback dosage for children.

## Scope

### Rive

- 4 current characters;
- state/event mapping;
- fallback when Rive asset unavailable;
- animation performance;
- reduced motion.

### Audio

- correct;
- incorrect/try again;
- reward;
- unlock;
- mission completion;
- short Persian instructions/character lines where approved.

### Game feel

Calibrate:

- animation duration;
- sound loudness;
- haptic strength;
- celebration frequency;
- reward reveal pacing.

## PASS criteria

- no frame-rate blocker on target devices;
- no sound is required to understand an action;
- reduced motion works;
- Persian audio is understandable and educationally approved;
- child testing finds character behavior helpful rather than distracting.

---

# P13 — ACCESSIBILITY + PERFORMANCE + SAFETY + CHILD QA

> **BUILD_FIRST (13.4):** P13 begins by closing every `OPEN` row of the verification debt ledger (13.5). Its own a11y/performance/safety/child-QA scope starts only after the ledger is empty.
## Implementation touchpoints

- current Design System contracts and tokens
- Android release checklist
- all child shell routes
- mission/reward/challenge surfaces
- analytics dashboard/test exports
- device QA scripts and playtest protocol


**Status:** `PENDING`
**Depends:** `P10, P11, P12`

## Goal

Validate the whole engagement layer against real child usage, low-end Android constraints, RTL, accessibility, and current platform safety policy.

## Research Gate

Re-check current:

- Android accessibility/touch guidance;
- Google Play Families requirements;
- target API requirement;
- app data practices;
- child-privacy constraints;
- current device market reality.

## Real-device matrix

At minimum target representative coverage across:

- Android 13/14/15/16;
- small and medium phone widths;
- low-memory devices;
- RTL;
- large text;
- Reduce Motion;
- offline/reconnect.

## Child playtest

Minimum target for the engagement layer:

- 8–12 children for the first focused game-feel calibration when feasible;
- representative Grade 1 age range;
- observe without coaching where possible;
- capture confusion points, navigation misses, frustration, delight, and whether the child understands the reward/mission loop.

Self-review by an adult is not a substitute for child testing.

## PASS criteria

- no P0/P1 accessibility blocker;
- no P0/P1 child safety/compliance blocker;
- no crash/blocker on required device matrix;
- touch targets meet the product accessibility contract;
- mission/reward system does not create unintended pressure;
- learning tasks remain visually primary;
- child test confirms the “game, not exam” feeling for the tested slice;
- all material findings are either fixed or moved to an explicit later backlog item.

---

# P14 — PILOT + RELEASE + CONTROLLED ROLLOUT
## Implementation touchpoints

- EAS profiles/configuration
- Supabase migrations/Auth/RLS/RPC
- runtime/content/mission/reward production paths
- `docs/qa/ANDROID_STORE_RELEASE_CHECKLIST.md`
- support/rollback runbook created during this phase (not a competing roadmap)


**Status:** `PENDING`
**Depends:** `P02, P10, P11, P12, P13`

## Goal

Prove the integrated product in a controlled environment, then release gradually with observability and rollback.

## Research Gate

Re-check current at execution time:

- Google Play target API;
- Families policy;
- app review declarations;
- EAS build requirements;
- crash/performance monitoring;
- privacy/data-safety declarations.

## Production verification

Run:

1. live migrations;
2. live Auth/OTP;
3. live RLS;
4. live runtime RPC;
5. station start/submit/resume;
6. challenge submit/retry;
7. mission progress;
8. reward grant idempotency;
9. achievement unlock;
10. customization unlock/save;
11. offline replay;
12. reconnect;
13. cold start / warm start;
14. AAB production build;
15. preview APK;
16. final child-device QA;
17. pilot user support/runbook.

## Rollout strategy

```text
Internal QA
   ↓
Small pilot
   ↓
Observe
   ↓
Fix / rollback if needed
   ↓
Expanded pilot
   ↓
Store submission / controlled release
```

## PASS criteria

- live backend verification green;
- production AAB builds and installs;
- no release-only auth/content fallback;
- migration state is verified;
- learning truth and reward truth remain separate;
- mission/reward duplicate protection passes;
- child/device/accessibility gates pass;
- pilot metrics show no critical negative learning/experience signal;
- rollback procedure has been rehearsed.

---

# 15. CROSS-PHASE DATA + CONTRACT RULES

## 15.1 Learning truth

Must continue to be owned by the authoritative learning runtime/server.

## 15.2 Game state

Transient where possible. Historical meaning lives in attempts/evidence/events, not in an unbounded game-session blob.

## 15.3 Mission truth

Mission state may be projected to the client, but final completion/reward decisions must not rely on client-only state.

## 15.4 Reward truth

Reward grants are authoritative, idempotent, auditable records.

## 15.5 Inventory

Inventory is a projection of authoritative ownership/grants.

## 15.6 Achievement

Achievement unlock is authoritative and replay-safe.

## 15.7 Offline

Offline may preserve continuity and queue accepted operations. Offline does not become a second authority for mastery, unlock, or reward ownership.

## 15.8 Analytics

Analytics are observational. They are never silently promoted into learning truth.

---

# 16. CROSS-PHASE ANALYTICS PLAN

Track at minimum:

### Learning

- station completion;
- skill progression;
- evidence quality;
- recovery success;
- recheck performance;
- transfer performance;
- mastery progression.

### Game

- `game_started`;
- `game_completed`;
- `game_abandoned`;
- challenge retry count;
- hint usage;
- time-to-understand objective (where measurable without intrusive tracking).

### Mission

- `quest_presented`;
- `quest_progressed`;
- `quest_completed`;
- `quest_expired`.

### Reward

- `reward_presented`;
- `reward_granted`;
- `reward_claimed`;
- `milestone_reached`;
- `inventory_item_equipped`.

### Engagement

- meaningful return;
- path progression;
- learning rhythm;
- mission completion;
- challenge completion.

## Metric rule

Do not optimize a feature using only:

- time spent;
- app opens;
- raw taps;
- total XP-like activity;
- number of games played.

At least one learning-quality metric must be paired with engagement metrics for any major gamification experiment.

---

# 17. CONTENT PRODUCTION RULE

Every new game/challenge/content package must pass this pipeline:

```text
DRAFT
  ↓
RESEARCH
  ↓
DESIGN
  ↓
EDUCATIONAL REVIEW
  ↓
IMPLEMENTATION
  ↓
AUTOMATED QA
  ↓
DEVICE QA
  ↓
CHILD TEST (when required)
  ↓
PASS
```

No content is considered production-ready merely because JSON parses or UI renders.

---

# 18. AI REVIEW CHECKLIST BEFORE EVERY COMMIT

The AI should answer these questions internally and record only the resulting evidence/decision, not hidden reasoning:

1. Am I working on the first eligible PENDING phase?
2. Did I run the required research gate before implementation?
3. Did I read the current source spec and the actual code?
4. Did I accidentally reintroduce a superseded product rule?
5. Did I create a second source of truth?
6. Did I create a new navigation branch without a product decision?
7. Did I make learning truth client-authoritative?
8. Did I create reward logic without idempotency?
9. Did I introduce punitive mechanics?
10. Did I make a game more complex than the target child can understand quickly?
11. Did I add a hard timer to an educational check?
12. Did I create a reward before validating the learning trigger?
13. Did I run all phase-required gates?
14. Am I claiming PASS for something I did not execute?
15. Did I move discovered out-of-scope work into the backlog?

---

# 19. BACKLOG DISCOVERED DURING EXECUTION

Use this section only for work discovered after the roadmap is locked.

| ID | Date | Discovered in | Item | Risk | Proposed phase | Status |
|---|---|---|---|---|---|---|
| BL-001 | 2026-10-03 | P00 | Reconcile old verifier scripts that still describe historical UX phases | Medium | P02/P03 | OPEN |
| BL-002 | 2026-10-03 | P00 | Validate current device build and live Supabase environment | High | P02 | OPEN |
| BL-003 | 2026-10-03 | P00 | Educational approval for Grade 1 skills/content | High | P10/P13 | OPEN |
| BL-004 | 2026-10-03 | P00 | Decide final Mission Hub placement after child UX testing | High | P01/P06 | OPEN |
| BL-005 | 2026-10-03 | P00 | Decide whether an earn-only token is useful enough to add | Medium | P01/P07 | OPEN |
| BL-006 | 2026-10-03 | P02 | Canonicalize ST01 Android package checksum/version after enriching child-safe presentation | High | P02 | DONE |
| BL-007 | 2026-10-03 | P02 | Remove evaluator answer keys from Android client runtime fixtures | High | P02 | DONE |
| BL-008 | 2026-10-03 | P02 | Add authoritative progression reconciliation endpoint for APK projection | High | P02/P05 | DONE |
| BL-009 | 2026-10-03 | P02 | Run live Supabase/Auth/RLS/RPC and physical Android evidence; static-only snapshot is not PASS | High | P02 | OPEN |
| BL-010 | 2026-10-03 | P03 | Replace historical P03 verifier semantics with a dedicated game-feel verifier and shared Android interaction primitives | Medium | P03 | DONE |
| BL-011 | 2026-10-03 | P03 | Add audio/haptic implementation behind the same semantic feedback contract after accessibility and device constraints are validated | Medium | P12 | OPEN |

---

# 20. PLAN REVISION LOG

| Date | Revision | Reason | Impact |
|---|---|---|---|
| 2026-10-03 | `PLAN_REVISION-001` | Replaced contradictory 0–16/UX roadmap structure with one current engagement-first implementation plan; aligned with phone-only auth, existing 25-station path, current 3-tab shell, game specification, and research-first execution protocol. | All future implementation sequencing follows P00–P14. Historical phase docs are not execution truth. |
| 2026-10-03 | `PLAN_REVISION-002` | Deep documentation audit found remaining phase-specific API names, stale audit snapshots, and pre-cleanup research evidence still capable of confusing an AI executor. | Phase Markdown and audit snapshot trees removed; active API contracts normalized; QA/reference wording reconciled; verifier dependencies updated. |

---

# 21. CURRENT CANONICAL REFERENCES

Read these when they are relevant to a phase:

## Architecture / rules

- `docs/adr/ADR-0001-no-unity-game-architecture.md`
- `docs/adr/ADR-0002-semantic-animation-events.md`
- `docs/adr/ADR-0003-server-authoritative-learning-runtime.md`
- `docs/adr/ADR-0004-persian-first-grade1-to-6-design-system.md`

## Current domain sources

- `docs/source/math_learning_product_animation_visual_runtime_v0_32.md`
- `docs/source/math_learning_product_content_contract_v0_28_completed_v0_31.md`
- `docs/source/math_learning_product_game_engagement_quest_reward_v0_28_completed_v0_31.md`
- `docs/source/math_learning_product_grade1_skill_graph_v0_27_completed_v0_31.md`
- `docs/source/math_learning_product_parent_teacher_experience_v0_31.md`
- `docs/source/math_learning_product_session_runtime_learning_rules_v0_29_completed_v0_31.md`
- `docs/source/math_learning_product_station01_vertical_slice_v0_30_completed_v0_31.md`

## Current child UX / product contracts

- `docs/reference/CHILD_PRODUCT_SURFACE.md`
- `docs/reference/ONBOARDING_CONTRACT.md`
- `docs/reference/PROGRESSION_CONTRACT.md`
- `docs/reference/PATH_2_CONTRACT.md`
- `docs/reference/PATH_2_1_VISUAL_RULES.md`
- `docs/reference/PRACTICE_HUB_CONTRACT.md`
- `docs/reference/PROFILE_ACHIEVEMENT_AVATAR_CONTRACT.md`
- `docs/reference/LESSON_PLAYER_CONTRACT.md`
- `docs/reference/MOBILE_LOCAL_STATE.md`
- `docs/reference/DESIGN_SYSTEM.md`

## Current API / release sources

- `docs/api/API_CONTENT_DELIVERY_CONTRACT.md`
- `docs/api/API_LEARNING_RUNTIME_CONTRACT.md`
- `docs/api/API_ASSIGNMENT_CONTRACT.md`
- `docs/api/API_ADULT_PROJECTION_CONTRACT.md`
- `docs/api/API_OFFLINE_SYNC_CONTRACT.md`
- `docs/api/API_E2E_RELEASE_CONTRACT.md`
- `docs/qa/ANDROID_STORE_RELEASE_CHECKLIST.md`
- `docs/qa/DUOLINGO_REFERENCE_NOTES.md`
- `project-design-v2/docs/CHARACTER-BIBLE-v2.md`
- `project-design-v2/docs/RIVE-RIG-BRIEF.md`

---

# 22. END-STATE DEFINITION

The roadmap is successful only when the child can experience the following loop on a real Android device:

```text
PHONE OTP
  ↓
ONBOARDING
  ↓
25-STATION PATH
  ↓
STATION LEARNING
  ↓
GUIDED PRACTICE / MINI-GAME
  ↓
INDEPENDENT / CHECK / RECOVERY / TRANSFER / MASTERY
  ↓
⭐ SIGNATURE STATION CHALLENGE
  ↓
MISSION PROGRESS
  ↓
🎁 AUTHORITATIVE REWARD
  ↓
🏆 ACHIEVEMENT / COLLECTION
  ↓
👕 CHARACTER CUSTOMIZATION / WORLD CHANGE
  ↓
🗺️ NEXT STATION / NEXT WORLD
  ↓
RETURN TO LEARNING
```

At no point does engagement become a second learning truth.

At no point does a reward replace mastery.

At no point does a missing day erase progress.

At no point does a visual celebration make the math task harder to understand.

**This is the completion target.**
