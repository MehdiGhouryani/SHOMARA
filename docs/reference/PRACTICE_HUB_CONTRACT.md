# Practice Hub Contract

## Purpose
Practice is a supporting learning surface, not a second progression system.

## Canonical visible surface
- S14 — Practice / short games

Skills (S15) and concept review (S16) remain curriculum data and may be rendered inside learning/progress experiences later. They are not primary child navigation surfaces in the current product shell.

## Visible layout
1. One recommended practice action.
2. A small list of short games.
3. One secondary action back to Path.

## Rules
1. Practice may expose opportunities already grounded in the current curriculum/path.
2. Practice must not unlock or bypass locked stations.
3. Practice must not infer mastery, percentages, streaks, or rewards from local UI state.
4. Practice must not create a second navigation hierarchy for skills/concepts.
5. Interactive controls use shared Design System touch targets.
6. Web and Mobile consume the same contract.

## Path grounding
`canOpenPracticeStation()` allows:
- stations already completed;
- the first uncompleted station.

Everything later in the sequence returns the learner to Path. This is a UX guard, not a security boundary; authoritative learning remains server-side.
