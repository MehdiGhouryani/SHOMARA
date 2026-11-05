# Pose-to-Page Mapping — DRAFT (Step Zero)

Status: DRAFT. No numeric pose is assigned in this draft, because no
page file in `design/playbook/pages/*.md` assigns a numeric pose.
Numeric poses are TBD pending an owner decision, and must not be
invented. This draft records only the family rules that the page
files actually state, plus the current runtime whitelist.

Correct page files: `11_RECOVERY_RESULT.md` and `12_PRACTICE_TAB.md`
(not SESSION_SUMMARY / PRACTICE_HUB).

## Family rules (from the page files)

| Family | Character rule |
|---|---|
| 01 Welcome / Launch | One warm hero with one small, static character WebP; one clear next action; no dense text, no fake achievement |
| 02 Onboarding | Large character / image, one idea per step; back / skip only when the product allows |
| 03 Auth / OTP | No character reference; calm form, label above the field, six-box OTP only if the backend really wants six digits |
| 04 Profile Setup | Exact WebP avatars only if selectable; a giant avatar must not overwhelm the form |
| 05 Grade / Placement | No character reference; tactile grade cards that do not look like answers; grades 2-6 are not announced as available |
| 06 Learning Path | Static character cameos; one chosen hero; not every node shines |
| 07 Station Start | Character in a frame, concise lesson goal, only one primary Start / Continue CTA |
| 08 Teach / Discover | The maths manipulative is the hero; small character guide only when allowed; no endless character animation while focusing |
| 09 Guided Practice | No character reference; soft-raised, physically responsive objects; preferred touch target >=72dp in early grades |
| 10 Assessment | CHARACTER REMOVED: cleanest visual state, maths goal dominant, non-essential characters and celebration cues that could leak an answer are hidden |
| 11 Recovery / Result | Restrained celebration after a valid success, with a static character WebP; feedback without shame, no harsh shake |
| 12 Practice Tab | No character reference; only recent practice or topics that really exist, no placeholder grid |
| 13 Challenge | Visual priority is the question; no casino-style reward artwork; reuse ChallengeIntroView2 and V2 answer / sheet primitives |
| 14 Profile / Me | One real character WebP, if useful; real, explicit progress data; no dark dashboard, no fake badge / star / streak |
| 15 Avatar / Settings | "Use the five real character WebPs; do not invent a new avatar"; distinct selected state |
| 16 States | Small optional character, if not distracting; no raw developer error page, no endless spinner |
| 17 Navigation | No character reference; V2 TabBar with consistent label / touch space / active indicator |

## Numeric pose assignment — TBD

| Family | Allowed families | Numeric pose | Status |
|---|---|---|---|
| 01, 02, 06, 07, 08, 11, 14, 16 | Main / Number only, until owner decides Dana / Fandogh / Roka roles | TBD | OWNER DECISION PENDING |
| 03, 05, 09, 10, 12, 17 | None | — | EXCLUDED by page contract |
| 04, 15 | Only poses that are actually selectable / shipped | TBD | OWNER DECISION PENDING |

Rules for the future assignment, when the owner decides:
- Characters are always static and small in 01 / 06 / 08 / 16, never
  animated endlessly, never guilt-inducing, never revealing an answer.
- Assessment (10) stays character-free, even after poses are assigned.
- A pose is only assigned if its WebP is actually shipped in the
  runtime whitelist below, or is added to it by an approved transfer.
- Main = proposed main guide; Number = proposed maths companion
  (pointing at manipulatives, never revealing answers).
  Dana / Fandogh / Roka = reserved, not shipped, until role and real
  transparent output are approved.

## Current runtime whitelist (do not rename in step zero)

`apps/android/core/designsystem/src/main/res/drawable-nodpi/`:
- `shomara_char_main_01.webp`
- `shomara_char_main_10.webp`
- `shomara_char_number_01.webp`
- `shomara_char_number_17.webp`
- plus `shomara_splash_artwork.png` (splash only, untouched)

Handoff source (not runtime): 90 WebP in
`docs/design-handoff-2026-10/assets/characters/`, 5 families x 18.
