# ST07 specific staged pilot — not ST01

## Scope already defined in draft source
- `ST07`, "عددهای ۱ و ۲", `status: draft`, four listed skills `SK-ST07-1..4`.
- P1 discovery steps; P2 8 guided items; P3 6 rounds of T05 'تزیین کیک'; P4 item pool of 26 with four-family draw; P5 5 assessment items with spiral review; separate practice/jump references.
- Templates used: T01, T05, T13, T15 (with ST07-specific `mode`, `arrows`, `hideNumeral`, 2-option numeral/picture/dots support).
- Voice manifest has ST07 metadata and global voice metadata; no actual generated TTS WAV/MP3 bundled.
- Asset section describes 41 required visual assets; they are descriptions, **not delivered bitmaps**.

## Recommended gradual milestones
**C0:** content provenance/CSV QA and static schema mapping; no runtime changes.
**C1:** compare one P1 step + one P2 T15 item with existing schema; typed draft-only fixture and pure UI preview; no API changes.
**C2:** standalone T01 tap-count or T05 one round interaction renderer with tap alternative for drag, explain math validity. Reuse canonical V2 clay components. No fake grade scoring.
**C3:** ST07 complete draft simulator after real contracts mapped, author/test all 5 parts. Exclude from production.
**C4:** audio admin draft import and audible Persian TTS review; verify 179+53 metadata rows and unique IDs; no silent production upload.
**C5:** owner review + explicit approval, then production enabling separately.

## Required ST07 acceptance assertions (from user-provided source, pending compatibility review)
- Intro replay after 8 seconds of inactivity; no grading in discovery.
- P2 eight guided examples; if hints reach h2/h3, mark assisted so not counted toward mastery.
- P3 six pattern rounds; mathematically valid alternate pattern solutions accepted when rule fits.
- P4 four drawn items (one per family), no repeat in recheck, threshold 3/4 draft.
- P5 five independent items including two spiral-review skills.
- Do not show numeral >2 as newly introduced when not yet taught.
- ST07 exercises prefer ≥72dp touch target, ≥16dp spacing, ≥24dp margins.
- Missing audio: show text, continue gracefully, log missing asset; no fake actual playback.
- No character or hints in assessment if that is accepted by current product rules; no celebratory sounds midassessment.
- Drawing direction/start tolerant as specified but device calibration remains mandatory; no arbitrary static magic number in main UI.

Original item-level definitions live in `originals/shomara-stage7-pilot-ST07.md`. Do not restate all 1800 lines into UI code; transform by deliberate typed schema, validators and tests.
