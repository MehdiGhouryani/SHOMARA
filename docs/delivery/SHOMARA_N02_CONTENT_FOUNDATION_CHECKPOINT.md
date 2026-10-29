# SHOMARA N02 content foundation checkpoint

- Date: 2026-10-28
- Branch: `native/n02-foundation`
- Snapshot: `SNAP-20261028-NATIVE-N02-CONTENT-FOUNDATION`
- Phase status: `IN_PROGRESS — 7/8; N02-07 BLOCKED_ENV`

## Delivered

1. Read and classified all ten byte-protected source files under `content-library/originals`.
2. Recorded the actual scope: 25 stations, 150 work pages, 100 proposed skills, 15 interaction patterns, one complete draft pilot (ST07), 24 missing station specs and 232 draft audio metadata rows.
3. Added a canonical issue ledger with twelve content conflicts, decisions, missing artifacts and unverified values.
4. Added phase ownership and content promotion gates from `SOURCE_ONLY` through `ENABLED`.
5. Standardized active roots to lowercase/kebab-case: `design/`, `content-library/`, `skills/`.
6. Isolated three project skills: product design, screen execution and learning content.
7. Added deterministic indexes generated from protected sources: 150 pages and 25 stations/100 skills.
8. Added executable gates for content provenance, CSV metadata, source drift, generated-index drift and project-skill structure.
9. Expanded the canonical roadmap to 92 tasks without starting N03 before the Android foundation gate.

## Important unresolved content issues

- `CONTENT-001`: numeral-one stroke direction conflicts between Stage5 and ST07.
- `CONTENT-002`: jump-test count conflicts between Stage4 and ST07.
- `CONTENT-003`: P4 is declared independent but some pool items reference hints.
- `CONTENT-004..007`: station/chapter names, sensitive themes, narrator and haptic/SFX choices need owner/human decisions.
- `CONTENT-008`: authoring answers must remain server-side and absent from the child client.
- `CONTENT-009..012`: art, playable approved audio, calibrated values and 24 station specs are missing.

## Verification commands

```bash
npm run content:indexes:check
npm run verify:content-library
npm run verify:project-skills
npm run verify:design-pack
npm run verify:repository
npm run verify:android-foundation
```

Node 22 package build/all-workspace typecheck and 65 files/502 Vitest tests pass. The static suite is 80/85; the five remaining failures are the unchanged Chromium-only flow/parity gates.

Static validation is not child testing, educational approval, pronunciation review or Native device evidence. The next executable canonical task remains N02-07 on a runner with JDK 17, Android SDK 37 and reachable Google/Maven repositories.
