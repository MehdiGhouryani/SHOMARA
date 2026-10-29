# Content import contract — STRICT STAGING ONLY

## Reality of supplied files
These 10 files describe content/research; they do NOT contain 25 executable lesson specs or 232 audio binaries or final art. The source project summary says ST07 is the single complete pilot and the other 24 station specs remain to be authored. Stage 3 original code analysis was explicitly skipped; repo mapping/compatibility remains unresolved.

### Map of actual source files
- `shomara-stage1-study.md`: analysis of 25 sections and 150 workbook pages; source citations/interpretations may require checking the actual books.
- `shomara-external-research.md` and `shomara-stage2-research.md`: research, contextual evidence and proposals; never promote research numbers into product promises.
- `shomara-stage4-architecture.md`: proposed 25 station cards/100 skills, `STk = book unit k` mapping, open names/content decisions; not authoritative live API.
- `shomara-stage5-shared-references.md`: 15 game template candidates T01–T15, audio/haptic/motion/hint rules; some values are tentative and can conflict with existing stage flow.
- `shomara-stage6-spec-format.md`: authoring format, YAML examples and validator expectations; not final TS schema.
- `shomara-stage7-pilot-ST07.md`: DRAFT fully specified pilot ST07 'عددهای ۱ و ۲' with P1–P5, sample game T05, T13 trace, and audio IDs; **do not install as ST01**.
- CSV manifests: `id,kind,text_display,text_tts,voice,rate,status,used_by,notes`; metadata needed to create/play audio; all existing statuses must be respected.

## Content promotion states
`SOURCE_ONLY → MAPPED_TO_REPO → STAGED → VALIDATED → HUMAN_REVIEWED → APPROVED → ENABLED`.

**Never skip from SOURCE_ONLY directly to ENABLED.** No direct Supabase production insert and no live lesson substitution. No false claims that a text manifest implies TTS audio file is present.

## Allowed safe first work
1. Verify source bytes/checksums (script in playbook).
2. Read current `packages/contracts`, `learning-runtime`, `apps/mobile/src/station`, local dev content, lesson types, API, migrations, admin audio pipeline, existing offline assets, and test structure.
3. Build written compatibility map (see `integration/REPO_COMPATIBILITY_TEMPLATE.md`) with evidence and no domain changes.
4. Create a typed **draft-only staging adapter/schema** in a separately named `content/drafts` or appropriate repo location, if existing pipeline supports it, guarded by explicit feature flag OFF in production.
5. Implement/test one **nonproduction** ST07 prototype round only if current engine supports it and conflicts are resolved; use placeholders for missing visual/audio artifacts with clear 'missing' behavior, not a fake binary.
6. If genuinely applicable, integrate approved global audio metadata into admin **draft** import only, test dedupe, validity and rollback.

## Must resolve before enabling a lesson
- ST07 vs current ST01 actual domain mapping and old grade-1 data.
- 5-part `P1–P5` pedagogical division vs repo current `TEACH/PRACTICE/ASSESSMENT/RECOVERY/RESULT` stages. They are not necessarily identical.
- Suggested assessment thresholds, attempts, hint strategy, offline and ledger state vs server authoritative contracts.
- Short Stage6 status values vs the canonical content lifecycle, typed behavior and role-specific review evidence.
- Audio script rows vs generated/uploaded binary asset versions, rights, moderation and publication state.
- Role of 5 existing character WebPs vs `CH.guide` and subject characters; which face is narrator is undecided in source.
- Owner open decisions on station names, titles, religious themes, TTS narrator and haptic default.
- No binary voice assets; TTS must be produced and audibly checked in admin before enabling.
- No final new art assets for OBJ/GLYPH/PAT; can use reusable code shapes, but cannot pretend artwork exists.
- ST07 educational item-specific behavior and book-page accuracy need human review.

## Content security, copyright and moderation
No reproduction of textbook imagery from descriptions. Use original coded visuals or licensed art. Age-appropriate, privacy-preserving telemetry without student PII. Avoid religious/culturally specific items pending owner decision; do not erase historic text from source files.

## Principles from Stage5 (proposals, not automatic runtime changes)
- One narrator; optional quiet path music only, no music during lessons.
- Haptics lightweight and independently mutable; not coupled to audio mute; prefer no vibration on retry.
- Gentle motion and no infinite animations during solving; reduced motion alternatives.
- P1 discovery no score; P2 guided hint ladder; P4/P5 neutral feedback and no hint/guide if currently approved.
- Accessible audio replay, no punishment, no more than one primary instruction per scene.
- ST07 specification requests larger targets 72dp for child-manipulative tasks and forbids showing not-yet-taught numerals.

**Precedence:** Existing production server contracts + approved owner decisions over the draft docs. If source and code conflict, document it and require a decision before changing learning semantics.

The executable split, lifecycle mapping and validator backlog are canonical in `integration/AUTHORING_CONTRACT_GAPS.md`.
