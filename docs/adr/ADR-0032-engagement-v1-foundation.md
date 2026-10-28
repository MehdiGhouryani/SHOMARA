# ADR-0032 — Engagement V1 Foundation

**Date:** 2026-10-03
**Status:** Accepted for implementation after P01 human review

## Context

The product has an existing learning runtime and a source specification for missions, games, rewards, and achievements. The main risk is creating a second learning truth inside engagement features.

## Decision

1. Learning Runtime remains authoritative for skill evidence, mastery, station pass, and progression truth.
2. Engagement is downstream: Learning Event → Mission/Quest Progress → Reward/Milestone projection.
3. V1 has no child leaderboard, paid/tradeable currency, punitive streak, login-only reward, or time-only reward.
4. Daily Quest capacity is three, semantically ordered as Easy Start, Skill Builder, Meaningful Progress.
5. Reward grants are idempotent on `(learning_identity, source_type, source_ref, reward_definition)` semantics, with an implementation-safe key exposed in contracts.
6. Reward Games do not produce learning evidence by default.
7. Mastery Checks cannot use hard timers.
8. A Mini Game must name its primary Skill targets and versioned evaluation/evidence policy when it can generate evidence.
9. The Android child shell remains Path / Practice / Profile; Mission Hub is not a new primary tab in V1.
10. The first economy is earn-only, non-monetary, and collection-focused.

## Consequences

- P03 can build shared feedback primitives without inventing quest semantics.
- P04 can build challenge primitives with an explicit evaluator/evidence boundary.
- P05 can implement a full ST01 vertical slice without introducing local reward truth.
- P06/P07 can map existing DB quest/reward tables to the locked contract instead of inventing another schema.
- Any later proposal that violates these rules requires a roadmap `PLAN_REVISION`.
