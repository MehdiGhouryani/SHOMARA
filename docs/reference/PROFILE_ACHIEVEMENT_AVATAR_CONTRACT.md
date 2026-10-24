# Profile / Achievement / Avatar Contract

**Status:** Current supporting contract
**Date:** 2026-10-03
**Scope:** learner-facing Web + Mobile

## Profile hierarchy

`من` is the identity and progress surface. It contains exactly four visual groups:

1. Identity — avatar, name, grade.
2. Progress — completed stations and unlocked achievements.
3. Achievements — the current five-item milestone baseline; the authoritative achievement registry expands in roadmap P07.
4. Actions — `تغییر ظاهر` and protected `والدین`.

No teacher, social, companion, currency, league, assignment, or developer surface belongs here.

## Achievements

Achievements are milestone trophies earned from completed learning stations. They remain on Profile rather than becoming a primary navigation destination. Each item can open a secondary detail sheet/dialog (S18) without introducing a new navigation branch.

| ID | Title | Station | Icon |
|---|---|---|---|
| A01 | شمارش‌گر | ST01 | count |
| A02 | جهت‌یاب | ST02 | direction |
| A03 | عددساز | ST03 | number |
| A04 | شکل‌شناس | ST04 | shape |
| A05 | حسابگر | ST05 | calculation |

The UI does not invent XP, gems, streaks, leagues, ranking, tiers, or percentage mastery.

## Avatar Workshop

S20 is a secondary child route entered from Profile. It is intentionally small:

`Preview → choose preset → save / cancel`

The current implementation provides four canonical presets. Selection is a child profile projection and does not change learning truth.

## Visual direction

The design borrows broad principles from Duolingo's documented product craft work: consistent headers, a small intentional type hierarchy, purposeful whitespace, simplified navigation, and achievement collections presented as milestone rewards on the learner profile. It does **not** reuse Duolingo's branded artwork, copy, or proprietary assets.
