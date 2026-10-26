# Validation findings — ST07 pilot and both audio CSVs (phase P4)

Date: 2026-10-25 · Validator: `scripts/verify-content-spec.mjs` (runs in `verify:static:all`).

## Does the author's «0 errors» claim reproduce?

**Yes.** With the engine below, the ST07 pilot's 8 YAML blocks, the station audio CSV (53 lines), the global
audio CSV (179 lines) and the asset table (41 assets) validate with **0 errors and 0 warnings**. The earlier
README audit's line count also reproduces exactly: 53 + 179 = 232 lines. The validator additionally
self-tests its own rule engine on 11 negative fixtures (`scripts/fixtures/content-spec/fixture-R1…R11`),
each of which must trigger exactly its own rule and nothing else — all 11 pass.

## How each of the 11 rules (stage-6 §5) is implemented

| Rule | Engine behaviour | Notes found while implementing |
|---|---|---|
| R1 digit/Latin in `text_tts` | regex `[0-9A-Za-z]` over both CSVs | clean on both files |
| R2 «غلط/اشتباه» in audio or display text | both fields, both CSVs | clean |
| R3 spoken word budget (10; `nr` 14) | whitespace token count | clean |
| R4 display word budget (10) | whitespace token count, empty allowed | clean |
| R5 display numeral above the station's taught numbers | numerals (ASCII + Persian digits) in the STATION's `text_display` vs `audio_policy.display_numerals_allowed: [1,2]` | applies to the station's own lines only; global lines are shared across stations |
| R6 duplicate ids (lines/assets/items) | union of both CSV ids, asset ids, all yaml `id:` values | clean |
| R7 template outside T01–T15 | every `template`/`templates` value in all yaml blocks | clean |
| R8 dangling audio/asset references | every id-like scalar (except under key `id`) must exist as an audio line, an audio family prefix (`G.ok.*` → at least one `G.ok.` line), an existing item id, or a declared asset | two engine subtleties below |
| R9 forbidden art (ستاره/تاج/سکه/جام/قلب/آتش) in asset descriptions | whole-token match (split on spaces, Persian punctuation and ZWNJ) | «جامدادی» (pencil case) must NOT match «جام» — substring matching would be a false positive; the pilot is clean under token matching |
| R10 unreferenced station audio line — **warning** | station CSV ids not reachable from any yaml scalar reference | 0 warnings: every line is referenced |
| R11 pool below 12 items | the section-4 pool block's item count | ST07 pool = 26 items ✓ |

Engine subtleties recorded for the next maintainer:

1. **Item ids are not audio refs.** The practice/jump block references pool items (`ST07.F4.n1`); those are
   declared item ids. The engine resolves a reference against audio lines ∪ audio families ∪ item ids.
2. **Family refs end with `*`** (`G.ok.*`, `G.retry.*`); they resolve if any line starts with the prefix.
3. The station-id pattern in references is `ST\d{2}` (the pilot's fixtures use `ST09` for exactly this reason).
4. CSVs carry a UTF-8 BOM and CRLF endings; the parser strips both.

## Reconciliation notes that came out of building this (feed R-01..R-09, START_HERE §6.20)

- The spec's lesson-flow numbers are **not** the repo's runtime numbers: the spec says mastery «۳ از ۴»,
  pool ≥ 12, jump «۴ از ۵»; the repo runtime (`packages/learning-runtime/src/policies.ts`) uses **5-item
  checks with 4 required, two qualifying checks in distinct sessions** for a station pass. The spec itself
  marks its table «با STAGE_FLOW تطبیق شود» and STAGE_FLOW is not in this repo. Authoring against the spec's
  numbers without reconciliation would contradict the server — owner decision required before batch authoring.
- Station names: all 25 `G1_STATIONS` titles appear verbatim in stage-4 — the R-06 "renaming" question is
  about whether names match their CONTENT (owner decision), not a data mismatch.
- js-yaml is used as an already-present transitive dependency (no lockfile change); if it ever disappears
  from the tree it must be added as a devDependency with a D-entry.
