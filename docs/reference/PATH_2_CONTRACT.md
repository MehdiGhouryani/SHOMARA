# Path 2.1 Contract

Date: 2026-10-03
Status: Frozen current path contract

## Child navigation

Primary destinations are exactly:

1. مسیر
2. تمرین
3. من

No teacher, social, currency, shop, leaderboard, or backpack surfaces may appear in the child shell.

## Continuous path

- The Grade 1 path contains 25 learner stations grouped into 5 units.
- Units are rendered in one continuously scrollable surface.
- Station nodes alternate left/right across the complete 25-station sequence (the alternation does not reset at a unit boundary).
- A unit header is the visual anchor for each five-station group.
- A checkpoint appears between units.
- Current, completed, available, locked, not-downloaded, and sync-pending states are distinct.
- A skipped station remains revisit-able after a successful jump.
- Completing a jump target moves the learner cursor forward; skipped earlier stations remain available for review.

## Jump

- Jump is offered at a unit boundary after the previous unit is completed.
- Every jump is a distinct 5-question assessment.
- Passing requires at least 4/5.
- The client does not contain the answer key.
- Server validation is authoritative.
- Passing opens only the first station of the next unit.
- Failing does not change learning progress and returns the learner to the path.
- Jump has no XP/gems/streak currency reward.

## Station presentation

Stations also have a visual kind contract exported from `packages/contracts/src/path2.ts`; Web and Mobile use the same mapping for lesson, practice, review and challenge node iconography.

Header is intentionally compact:

```text
ایستگاه {number}
{station.title}
{minutes} دقیقه
```

Long explanatory copy belongs inside the lesson, not in navigation chrome.

## Login / entry

- The child-facing shell does not expose teacher login.
- Login presents only working authentication methods.
- Disabled providers are not rendered as interactive choices.
- Technical screen IDs are never visible to the learner.
- Guest entry, when present, is tertiary and still uses the adult gate.

## Profile / settings

`من` contains identity, real progress, achievements, appearance, settings, and adult access. Settings is secondary, not a primary tab.

Current child settings are limited to sound, motion, and text size; future notification controls must not be rendered until they are implemented.

## Visual direction

The product uses a Persian-first neutral canvas with a green primary identity and semantic secondary accents. The palette is owned by `packages/design-system/src/tokens.json`; screen-specific hardcoded brand colors are prohibited.
