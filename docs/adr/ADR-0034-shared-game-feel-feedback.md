# ADR-0034 — Shared Game-Feel Feedback Contract

**Status:** Accepted for P03 implementation  
**Date:** 2026-10-03

## Context

The product must feel like one learning game rather than a collection of unrelated station screens. The existing animation contract maps semantic learning events to character states, but individual screens could still invent their own touch feedback and result treatment. Android and Web also need the same semantic outcome mapping without sharing renderer code.

## Decision

Use one cross-surface contract in `packages/contracts/src/game-feel.ts`:

```text
authoritative learning outcome ──> semantic event ──> character + feedback policy
renderer-local tap/drag/reveal ────────────────────> feedback policy only
```

The contract separates two kinds of events:

- **Semantic learning events:** `ANSWER_CORRECT`, `NEAR_MISS`, `ANSWER_WRONG`, `RECOVERY`, `STATION_PASS`, `MILESTONE`, and `REWARD_GRANTED`. These may update the companion state. They never decide learning truth.
- **Interaction feedback events:** tap, drag-start, drop placement, progress fill, hint/badge/unlock/reward reveal. These are renderer-local and never update the companion or mastery state.

`semanticEventForOutcome` is the shared outcome mapping: correct → `ANSWER_CORRECT`, partial credit → `NEAR_MISS`, otherwise → `ANSWER_WRONG`. Android StationFlow and the Web lesson surface use this same mapping.

The shared policy also defines bounded feedback budgets, named haptic/audio cue slots, accessibility announcements, and a `resolveFeedbackPresentation` function. Reduced motion removes animation but preserves readable feedback and its semantic event. Sound and haptics are independently optional. Audio assets remain deferred to P12.

Android uses `GameFeelController`, `TactileChoice`, `DraggableToken`, `FeedbackBurst`, `RevealPrimitives`, and `ProgressFill`. Child interactions use forgiving drop geometry and a `NEAR_MISS` placement result without inventing an answer verdict.

## Research decisions

- **ADAPT** official Android accessibility guidance: keep interactive targets at least 48dp × 48dp.
- **ADAPT** Android haptics guidance: prefer clear, consistent, action-oriented cues; keep wrong-answer feedback softer than success and avoid punitive buzzes.
- **BORROW / ADAPT** WCAG 2.2 SC 2.3.3: honor OS and in-app reduced-motion preferences while retaining the conveyed information.
- **ADAPT** independent child UX research: emphasize big tap, swipe, and drag interactions and visible feedback that does not depend on audio.
- **REJECT** screen-specific animation forks, answer-truth decisions in renderers, punitive error theatrics, and feedback-only-through-sound.

## Consequences

Positive:

- ST01, future stations, Android, and Web share one interaction language.
- Learning truth remains independent from visual, audio, and haptic feedback.
- Accessibility can disable motion, sound, or haptics independently without losing meaning.
- Tests can verify policy, budgets, outcome mapping, and placement behavior without rendering a device screen.

Costs:

- New station interactions must use shared primitives instead of local Pressable styling.
- Future audio/haptic implementations must attach to the same cue slots rather than inventing parallel learning events.
- Production Android/device and UX-owner evidence is still required before P03 can be marked PASS.
