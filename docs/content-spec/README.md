# Content-spec track (grade 1): PROPOSAL, not canonical

**Status: input material, not yet reconciled with the code.** Nothing here is a decision source for the app until the
reconciliation in section 4 is done and the owner has answered the open decisions. It sits outside `docs/source/`,
`docs/reference/` and `docs/adr/` on purpose (the repo keeps exactly one canonical source per contract).

**UI agents (phases U5b to U8): do not read this folder.** It is a separate track (curriculum content and audio) and 400+ KB of Persian.

## 1. What is here (`grade1/`)
| File | What it is |
|---|---|
| `shomara-project-summary.md` | status, decisions of the author, review results, 13 open decisions with defaults |
| `shomara-stage4-architecture.md` | the 25 stations as book sections (ST k = book section k), station cards, concept threads, item budgets |
| `shomara-stage5-shared-references.md` | shared rules: audio/TTS, SFX palette, haptics, motion, feedback and hint ladder, the 15 game templates T01 to T15 |
| `shomara-stage6-spec-format.md` | the station spec format (15 sections, YAML schemas) and 11 validation rules |
| `shomara-stage7-pilot-ST07.md` | one complete station (ST07 «عددهای ۱ و ۲») in that format |
| `shomara-global-audio-manifest.csv`, `shomara-ST07-audio-manifest.csv` | 179 + 53 audio lines for an admin panel (`id, kind, text_display, text_tts, voice, rate, status, used_by, notes`) |
| `shomara-stage2-research.md`, `shomara-external-research.md` | market and evidence research (several figures are marked unverified inside) |

Not included on purpose: `shomara-stage1-study.md` (362 KB analysis of the two textbooks, derived from copyrighted books). It stays
in the owner's private archive and is only needed by whoever writes the remaining 24 stations (stage 8).

## 2. Independently checked (audit, 2026-10-24)
Both CSVs: 232 lines, no duplicate ids, no digits or Latin letters in `text_tts`, no forbidden words (غلط / اشتباه), no TTS text over 10 words,
one voice (`fa-IR-DilaraNeural`), rate `-15%`, status `draft`. The 25 station names equal `G1_STATIONS` (`packages/contracts/src/progression.ts`)
and `docs/reference/CHILD_PRODUCT_SURFACE.md`. Expo SDK is `~57`, so the spec's note that `expo-av` is removed (SDK 55) holds and `expo-audio` is the route.
Not checked: stage 1, the research documents' sources, TTS pronunciation, and the ST07 body line by line.

## 3. What does not match the repo today (reconciliation ledger)
| # | Topic | Repo | Spec | Needs |
|---|---|---|---|---|
| R-01 | Skills | 64 skills, marked `PROVISIONAL / DERIVED` (`docs/source/...skill_graph...`), ids `G1-SK###` | 100 skills (4 per station), ids `SK-STnn-k` | owner decision on the canonical taxonomy + an id mapping |
| R-02 | Game templates | "14 reusable templates", `game_code` `G1-GAME-###` (README, game/engagement doc) | 15 templates `T01` to `T15` | a T-to-game_code mapping table; template screens have no design pages yet |
| R-03 | Lesson-flow rules | `docs/source/...session_runtime_learning_rules...`, `LESSON_PLAYER_CONTRACT.md`, learning-runtime code (server-authoritative) | built against `STAGE_FLOW`, which is **not in this repo**; mastery 3 of 4, pool at least 12, jump 4 of 5 are "initial values" | reconcile every number with the runtime rules before any content is authored at scale |
| R-04 | Content schema | encounter content: `learning_role`, `primary_skill_ids`, `game.game_code`, `state_schema`, `instructions.audio_fa`; only ST01 exists (`content/dev-packs/g1-st01-v1/v2`) | YAML per station: `kind/template/params/audio ids/answer`, pools, families | an ingestion mapping and a validator in the repo (none exists) |
| R-05 | Audio | `instructions.audio_fa: {}` placeholder; app speaks with device TTS (`expo-speech`); recorded audio is open question U-Q17 | pre-generated files from an admin panel (Azure neural voice, rate -15%), offline per station | contract field, storage and offline cache in content packages, `expo-audio`, an admin panel (none in `apps/web`), voice licence check, listening test |
| R-06 | Station and chapter names | fixed (`G1_STATIONS`, `CHILD_PRODUCT_SURFACE`) | 8 station names and the chapter names do not match their content (ST02, ST04, ST06, ST16, ST18, ST19, ST21, ST24); proposes renaming | owner decision; a rename touches contracts, UI, tests and verifiers |
| R-07 | Guide character | UI v1 guide is Number; legacy stages still use the old cast (Aria, Kiyo, Dana, Jiko) | one guide voice; thematic characters are silent | align after UI phases U5b to U8 |
| R-08 | Validator | none | "0 errors" was reported by a validator that is **not included** in the delivered files | rebuild it in the repo (`scripts/`, js-yaml is available) so the claim is reproducible |
| R-09 | Open decisions | n/a | 13 decisions in the summary section 5 (names, narrator voice, haptics, SFX source, religious content, accreditation...) | owner answers; defaults are listed there |

## 4. Order of work (do not skip steps)
1. **Reconciliation audit** (read-only; Prompt 5 in `docs/handoff/PROMPTS.md`): evidence per ledger row, mapping tables, questions for the owner.
2. **Implementability test of ST07** (Prompt 6): ambiguity list first, then an executable validator (R-08). This is the quality test the author asked for; do it **before** authoring the other 24 stations, because every format change multiplies by 24.
3. Owner decisions (R-01, R-05, R-06 and the 13 open ones).
4. Ingestion design (spec to encounter content) and the audio pipeline, each as its own phase with its own gates.
5. Stage 8: the remaining 24 stations (done by the content author, in five batches; validator after each batch).
