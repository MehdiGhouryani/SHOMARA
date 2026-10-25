# Design inspiration — interaction principles (bounded, brand-free)

**Status: binding reference for delegated UI decisions.** When the approved design pages
(`docs/design-handoff-2026-10/pages-v1/`, ADR-0035) are silent on an interaction question, this file is the
boundary of what may be borrowed from well-known child-learning apps. Every D-entry that uses one of these
patterns must cite this file. Anything not listed as allowed is off-limits by default: record a question
(U-Qn) instead of borrowing.

Naming rule: patterns are named by their interaction shape («short session», «feedback sheet»), never by a
product or brand. No mascot, artwork, copy, sound, asset or naming of any other app enters this repo.

## Allowed patterns (borrow the shape, not the skin)

- **Short sessions with a visible end** — one idea per screen, one primary action per screen, and a clear way
  out at all times.
- **Tap to select, explicit check, feedback sheet, continue** — already the approved pages 08–10 interaction
  (D-001); do not invent new answer gestures.
- **Immediate, specific feedback** about the work, never about the child.
- **Progress that only moves forward** — a wrong answer never removes progress.
- **A safe retry without punishment** — retry costs nothing, adds no counter, shows no alarm.
- **Large touch targets** (≥48dp; the app-wide rule is `touchTargets.test.ts`), calm motion that respects the
  reduced-motion preference, short sounds and light haptics on answer — both optional in Settings.
- **A calm guide character with short lines**; audio on demand, never autoplay.
- **Milestone celebration on station pass and challenge pass** that costs nothing and grants no currency
  (pages 11–12).
- **Reminders off by default**, opt-in, neutral wording, no guilt («روز نیامدن چیزی از یادگیری کم نمی‌کند»).

## Forbidden — never borrow, never reimplement

- Hearts or lives; any loss mechanic on a wrong answer.
- Streak counters, streak pressure or streak freeze; «day N» chains.
- XP, levels-for-points, gems or any currency, virtual shop.
- Leagues, rankings, public comparison or social feeds.
- Punishing timers; countdown pressure during practice.
- Ads, purchase prompts, paywalls.
- An owl or any other app's mascot, artwork, copy, sound or asset — including look-alikes.

## Relationship to project rules

These lists restate and narrow protected decisions (START_HERE §2.3: no coins/gems/store/loot box/
leaderboard/punitive streak; V1 reward = station pass only) and the no-shaming feedback rule (AGENTS §3.3).
Where this file and a protected decision could be read differently, the protected decision wins. Where an
approved design page defines the interaction, the page wins and this file does not apply.
