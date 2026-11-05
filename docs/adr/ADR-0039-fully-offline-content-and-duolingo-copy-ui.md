# ADR-0039 — Fully offline content (bundled package + local evaluator) and Duolingo-copy UI model

- **Date:** 2026-11-05
- **Status:** Accepted (owner decisions, 2026-11-05: product fully offline, no server; copy Duolingo UI structure)
- **Decision owner:** project owner
- **Supersedes (in part):** ADR-0003 (Server-Authoritative Learning Runtime) — learning truth moves from the server to the bundled local package + local evaluator. Also supersedes the "Duolingo principles only" guardrail in `design/INSPIRATION_GUARDRAILS.md` (structure copy is now the UI model; that guardrail file itself is updated in a later ledger step, not here).
- **Related:** ADR-0037 (installable beta track lock), ADR-0038 (splash / launch / DEBUG OTP, N08-15), `design/playbook/STEP_ZERO_RECONCILIATION.md`, `design/playbook/POSE_TO_PAGE_MAPPING_DRAFT.md`, `design/MASTER.md`, `design/playbook/PAGE_UIUX_BLUEPRINT.md`, `harness/roadmap.json` (N08/N09/N10), `content-library/integration/AUTHORING_CONTRACT_GAPS.md`, `content-library/integration/PHASE_INTEGRATION.md`
- **Evidence studies (read-only, workspace, not repo files):** `shomara-offline-content/OFFLINE_CONTENT_PLAN_FA.md`, `shomara-duolingo-copy/DUOLINGO_COPY_PLAN_FA.md`, `shomara-zero-to-hundred-readonly-fa.md`, `shomara-path-deep-review/PATH_DEEP_REVIEW_FA.md`
- **Location note:** registered in `docs/adr/` (this file) on 2026-11-05, as the canonical ADR copy. The step-zero record copy remains in `design/playbook/ADR-0039-fully-offline-content-and-duolingo-copy-ui.md` next to the other step-zero records; if the two copies ever disagree, this `docs/adr/` copy governs.

## Context

Two owner decisions were given on 2026-11-05:

1. **The product is fully offline, with no server — and specifically, content is completely offline.** All lesson content is bundled in the app (APK), needs no runtime download from a server, and has no server dependency for content.
2. **Copy Duolingo for the UI, in a principled way.** SHOMARA's UI was judged weak and without appeal for children; Duolingo's page layouts, path geometry, lesson loop, feedback, and component system are now the UI model.

Both decisions land on a codebase whose documented architecture says the opposite, while its executable reality already agrees with the first one:

- **Today the app is server-less in practice, only server-authoritative on paper.** Both server URLs (`otpEndpoints`, `lessonSubmitUrl` in `ShomaraRuntimeConfig`) are never set anywhere in the repo and are always `null`. `LessonGateway.submit()` therefore always returns "endpoint not configured", real OTP login always reaches "login not yet configured", and `ShomaraApp` never passes `pathProgress` to the shell — which is why all 25 stations are Locked in the device screenshot. Fully offline does **not** conflict with today's executable reality; it conflicts with the documented architecture, the recorded rules, and the roadmap.
- **But offline content starts from zero.** `content-library/` holds only one draft text pilot (ST07) + two audio-text CSVs + JSON indexes + contract docs: zero audio files, zero image files, no separate machine-readable spec, no separate question bank, and 24 stations without a spec. "Bundling content" means first authoring 24 stations, then producing 232+ audio files and 41+ ST07 assets (plus the other 24 stations' assets), then building the bundled package — not copying existing files into the APK.
- **The central conflict is the answer key.** The ST07 pilot YAML is full of `answer:` fields, and the recorded rule (CONTENT-008, `AGENTS.md` §3-6) says an answer key / evaluator must never reach the child client. Bundling the YAML as-is puts the answer key inside the APK, where it can be extracted. That needs an explicit architecture decision (§3 below), not a file copy.
- **The UI gap is structural, not taste.** The path screen has no scroll (chapters 2–5 unreachable), only one state exists (Locked — `stateFor` has no Fresh branch, so `currentStationId = null` locks all 25 stations), and no station has a visual identity. The lesson player renders only chrome: `ShomaraLessonOptions` is `emptyList` for all 5 stages, so no server option ever renders, and the T01/T05/T13/T15 adapters are pure state machines with no host-connected rendering. Duolingo's model, in one sentence, is "one clear single-node winding path + one task per card + one fixed bottom button + immediate feedback + one short summary" — the five things SHOMARA lacks and that are copied.

## Decision

### 1. Fully offline content (decided)

- All lesson content is bundled inside the app (APK). No runtime download from a server, no server dependency for content.
- Content updates happen **only via app updates** (a new release through the store) — including a typo fix in one item, a threshold change, or a new station.
- The content-package version is independent of the app version (for example package 1.3.0 in app 2.1.0), so a bug report can name which content package has the problem. Rollback means returning to the previous app version, not a server rollback.
- Content lifecycle in the new model: authoring (in an authoring tool / CMS, not in the app) → human review → APPROVED → bundling (a versioned package) → release with a new app version → activation on first run (checksum validation, atomic activation, rollback to the previous package if validation fails).
- ENABLED in the new model means: the package is in the APK, its checksum is verified, and the first-run activation gate enabled it. "Only APPROVED can be enabled" (N08-07) stays, but APPROVED now means human approval recorded in the authoring tool, not server activation.
- **No silent fallback:** if the local package is corrupt or incomplete, the app shows an honest error surface ("the content of this station is not available") and never silently falls back to other content. This is the same spirit as the old rule, with the new source of truth.
- "Offline" is the normal state of the product, not an error: the offline banners / state surfaces are redefined (families 01/03/06/07/08/09/10/11/12/13/16); "pending-sync" in family 16 is meaningless and is removed.

### 2. New source of truth (decided)

- The **versioned, checksummed, signed content package inside the APK + the local evaluator** replace "server truth".
- The local evaluator produces correctness, `nextAction`, mastery, and unlock decisions on-device. The UI still never decides mastery: it renders what the evaluator returns. The Native architecture (single-activity, UDF, immutable `UiState`) is unchanged; only the "remote source" of the Route → ViewModel → UseCase → Repository chain is replaced by the local package.
- What is replaced (the deletion / redesign work itself is Phase 1 / 2, not this ADR): `LessonGateway` (HTTP submit) → local evaluator; `ServerLearningConfig` → versioned local config; server manifest activation → bundled APK manifest; OTP login + server token / session → local child profile + local parent PIN (Phase 2); server sync / outbox transport → removed; internet-dependent launch copy → rewritten.
- **Boundary rule (decided — restates CONTENT-008 / CONTENT-018):** the answer key lives only in the local evaluator layer. It never enters the child lesson projection, the database, logs, or telemetry. Snapshot tests must prove, for every template adapter, that the child projection contains no answer, evaluator, or threshold (continuation of N06-11 with the new reference). Telemetry is only session / encounter / interaction / choice IDs; answers, correctness, and child PII are never logged.

### 3. Answer-key model — OPEN, owner decision (not guessed here)

The central conflict: the ST07 pilot YAML is full of `answer:` fields, and the recorded rule (CONTENT-008, `AGENTS.md` §3-6) says an answer key / evaluator must never reach the child client. Bundling the YAML as-is puts the answer key inside the APK, where it can be extracted. Three options exist (offline plan §3.1); **no option is selected in this ADR**:

1. **Answer key in the APK, inside a separate local evaluator layer.** Simplest. The APK can be unpacked and the answers read. For an educational child app the "cheating" risk matters less than the exposure risk, but the risk is not zero and must be recorded. Obfuscation, layer separation, and no-logging reduce the risk; they do not remove it.
2. **Evaluator without an extractable key (answer-generation rule).** For some templates it is possible (for example T01: the correct number is computed from the counted objects, not from a key); for others (for example T15: picking the right picture of three) it is not possible without a key. This option must be **proven per template**, not claimed in general.
3. **Evaluator from item parameters at runtime.** Items are bundled with parameters (for example `targetCount: 2`) and the evaluator judges from the parameter; no explicit "answer" is ever stored. This works for T01 / T05 / T13; for T15 only if the correct option is derivable from a parameter.

This decision blocks Phase B (lesson loop) and Phase 1 (offline skeleton). It does **not** block Phase A (path).

### 4. Package format — OPEN, owner decision (proposal recorded, not adopted)

Proposed format (offline plan §2.3), to be confirmed by the owner before Phase 1:

```
content-package/
├── manifest.json            # package version, schema version, file list + SHA-256 per file,
│                            # ENABLED stations, voiceProfileId, whole-package checksum
├── stations/                # ST07.json … ST25.json — P1–P5 items + practice + jump, versioned schema;
│                            # only APPROVED stations
├── audio/                   # N.001.opus … / SFX.*.opus — only APPROVED/PUBLISHED, duration + checksum in manifest
└── images/                  # OBJ.*.webp … / CH.guide.*.webp — only APPROVED, no text/number/star inside images
```

- Three models stay separate: **authoring** (with answer / evaluator — lives only in the authoring tool / CMS, never enters the APK); **published package** (locked version + checksums — what is bundled); **child projection** (prompt, options, interaction config, audio / asset ID — **without** answer, correctness, pass threshold, next step, reviewer identity). The local evaluator is a fourth, separate layer.
- Content rules carried over: display and spoken text only by ID, never hard-coded in code; numbers stored ASCII and mapped to Persian digits at display; variable item generation with a fixed seed; each station has 15 sections (stage6 §2) and 11 validation rules (stage6 §5); an executable validator must be built — none exists in `content-library/` today, and the pilot's "0 errors" is a text claim, not a script output.

This decision blocks Phase 1 (offline skeleton). It does **not** block Phase A (path).

### 5. Consequences of "fully offline" (decided — stated plainly, not hidden)

- **Local progress is tamperable** (root, editing DataStore / Room, clearing data) and is **not trustworthy as learning evidence**; it must never be presented as such. If a parent / school report is ever needed, it must carry this caveat.
- **No sync between devices.** If the device is changed, lost, or the app is cleared, progress is gone with no recovery. This must be stated honestly in the parent area (not on day one, but in the parent surface).
- **Child data stays only on the device** — the best case for child privacy.
- **APK size is not computable today:** text is ~1.2 MB for 25 stations (known); audio and images have no byte sizes in any file. Labelled estimates in the offline plan (§3.3 — audio ~1.4 MB assuming Opus 24 kbps, 2 s average) are assumptions, not facts. A size budget must be set in Phase 0 / 1 and every content package measured against it. (The budget itself is OPEN — see §8, O7.)
- The migration definition of done "API / learning contract tests between Native and backend are green" (roadmap §10) must be redefined as contract tests of the bundled content package (Phase 5).

### 6. Duolingo-copy boundaries (decided)

- **Guardrail change (recorded):** the owner's 2026-11-05 direction supersedes "Duolingo principles only" (`INSPIRATION_GUARDRAILS.md` reject column). The UI model is now Duolingo itself — page layouts, path geometry, lesson loop, feedback, component system — adapted to Persian RTL and SHOMARA v2 tokens. Three boundaries:
  1. **No brand is copied:** logo, the owl (Duo) and any Duolingo character, Duolingo brand colours (no brand hex value is reproduced in any plan or ADR), brand font, Duolingo texts, images, icons, sounds, or the name "Duolingo" anywhere in the child UI. Executable colour / font / shape come only from SHOMARA v2 tokens (canvas `#FFF8EF`, primary `#0C7A54`, amber `#FFB020` for attention only).
  2. **Motivation economy is OPEN — owner decision, not approved** (see §8, O10): lives / energy, punitive streak, leagues / leaderboard, coins / gems / currency, shop, chest / quest with random reward, child badges, daily-goal ring. None is built until explicit owner approval, and if approved, only with a separate ADR and a child-safe version — never a raw Duolingo copy, and never a reskin (for example a "flower" or "gem-like leaf" standing in for a coin).
  3. **Source of truth is no longer "server":** wherever the copy plan says "source of truth", it means the bundled local package + local evaluator (§2 above). This changes the data source, not the copied structure.
- **Copied (structure and behaviour):** single-node winding path; node with triple encoding (fill + icon + position) and states Fresh / Current / Completed / Perfect / Locked; Current larger (84dp) with a progress ring + floating "back to current" button; unit header + guidebook; unit-end challenge as an educational summary; one task per card; fixed bottom CTA ("Check" → "Continue" / "Got it") with a state-dependent label; manual progression, no auto-advance, no timer; top progress bar showing only remaining work (no %, no score); immediate correct / wrong feedback showing the correct answer; mistake repetition at the end of the lesson; hint at the moment of need; short skippable lesson summary + mistake review; onboarding order (meaningful choice → calibration → first lesson → account as storage); fixed guide character with short, interruptible reactions; one CTA per state; tactile press depth; redundant coding (icon + sentence + optional sound); penalty-free replay / re-reading.
- **Not copied (brand and assets):** logo; the owl and any Duolingo character; brand colours; brand font; Duolingo texts (sentences, labels, celebration / guilt messages); Duolingo images / icons / sounds; the name "Duolingo" or any reference to it in the child UI; Duolingo's HUD layout.
- **Not copied (economy and pressure — even with the structure copied):** lives / energy meter; punitive streak (day counter, flame, streak protection, guilt messages); leagues / leaderboard / ranking / social comparison; coins / gems / currency and any countable / spendable token (including "star" as currency and any reskin of it); shop, power-ups, boosts; chest with random or delayed reward; daily / monthly quest with an expiring timer; child badges (including streak / completion / speed badges); daily-goal ring; guilt reminders ("you lost a day"); full-screen unskippable celebration; multiple simultaneous progress layers.
- **Deliberate SHOMARA deviations from Duolingo (kept):** assessment (family 10) stays the quietest (dial 2/2/3) — no character, no hint, no celebration before a valid result; feedback celebration is calmed (panel + icon + sentence, no full colour flood, no loud sound per item); the path is RTL-mirrored (starts top-right, winds left; fill from the right); Persian digits; Main as guide / Number as maths companion (proposed, not decided — CONTENT-006); 3 tabs only (Path / Practice / Me), no Leaderboard / Quests / Shop tabs.

### 7. Phasing map (roadmap only — no later phase is started by this ADR)

- **Phase 0 — Decision and ADR (this file).** Gate: owner approval of this ADR + the two studies.
- **Phase A — Duolingo path (independent, now):** real scroll (`LazyColumn` + sticky chapter + live restore-scroll), sinusoidal RTL geometry (token amplitude), node 72dp / Current 84dp, 14dp progress bar with role, Fresh reachable for ST01 (not a fake Current), loading / error / empty states from `ShomaraStateSurface`, "next step" line + per-chapter counts, Clay shadow only for Current, explicit focus / pressed / selected states + `mergeDescendants`, chapter band in `ui.chapter` token colour (ribbon P2 stays PENDING_OWNER until chapter names are approved), floating "back to current" button. Files: `ShomaraPathGraph.kt` (+ `ShomaraNavigation.kt` for the pill / TalkBack only). No new image, no owner decision, no new content. Local gate: `verify:static:all` 90/90 + `android:gate` green; device gate: screenshots 360/390/412dp + 200% font, scroll to chapter 5, real-gesture TalkBack (Current "ایستگاه فعلی", locked "قفل", no double-read).
- **Phase 1 — Offline skeleton, ST07 only as pilot:** package loader (manifest + checksum validation + atomic activation), local evaluator, durable progress store, audio manifest, `LocalLessonOptions` (read from the local package). Depends on: this ADR + answer-key model (§3) + package format (§4) + CONTENT-006 (voice — TTS binaries must be pre-produced) + CONTENT-014 (mastery threshold — for the local numeric rule).
- **Phase 2 — Server removal and local identity:** delete the OTP / token / session server chain, the debug OTP simulation, `LessonGateway` / `ShomaraOtpApi` / `ShomaraRuntimeConfig`, the server launch probe, the `OutboxSyncEngine` transport, and server `ManifestActivation`; local child profile + local parent PIN (hashed, never plaintext); `ParentGate` stays fail-closed until the local verifier is wired. Depends on: Phase 1 + the multi-profile decision (§8, O5).
- **Phase 3 — Authoring the 24 stations in five batches** (A: ST01–06, B: ST08–12, C: ST13–17, D: ST18–22, E: ST23–25), each with the executable validator and independent human review; the previous batch's P0/P1 closed first. Depends on: Phase 1 + CONTENT-004 (names) + CONTENT-005 (religious content — which version is bundled) + CONTENT-016 (grade-1 scope) + CONTENT-012.
- **Phase 4 — Full audio and images:** all audio binaries (232+ lines) and all image assets (41 ST07 + the 24 stations'), bundled with a manifest (duration + checksum + abstract `voiceProfileId`). Depends on: CONTENT-006 (narrator) + CONTENT-007 (SFX source) + CONTENT-009/010 + owner-supplied Vazirmatn TTF + guide face (CONTENT-006).
- **Phase 5 — Cutover and release (N09/N10 redefined):** parity redefined (parity with what — §8, O13), Expo child client retirement ("web/API unaffected" must be rewritten), cutover gate with bundled-package contract tests instead of backend contract tests, N10-01 security review (answer-key-in-APK risk), N10-04 device matrix ("offline" is the normal state), N10-06 pipeline (content-package versioning), HG-05 (explicit owner permission for the final artifact and signing). Depends on: Phases 1–4 + HG-05.
- **Rule for all phases:** no phase starts without the previous phase's gate; no phase invents fake content; no file is moved or deleted without owner approval in step zero.

## Consequences

- ADR-0003's server-authoritative rule no longer describes the product: learning truth is the local package + local evaluator. Every rule that cited it must be rewritten in a later ledger step — `AGENTS.md` (§1, §3 rules 5/6/13/14, §5), `design/MASTER.md` (§5, §7, §8), `design/INSPIRATION_GUARDRAILS.md` (precedence chain: "server truth" → "versioned content package"), `design/playbook/NATIVE_IMPLEMENTATION.md`, `design/playbook/PAGE_UIUX_BLUEPRINT.md`, `skills/shomara-learning-content/SKILL.md`, `skills/shomara-product-design/SKILL.md` — and `harness/roadmap.json` (N06/N07/N08/N09/N10, including the N08-13 CMS panel fate and the missing N08-15 registration) + `START_HERE.md` (§6, §7). **None of those edits is made by this ADR; this file only records the decision.**
- The old "offline-first with server sync" model (offline-first + Server-Wins conflict policy, N07-02/03) is replaced by "offline only, no sync". The N07-02/03 acceptance must be rewritten in the same later ledger step.
- Family 03 (Phone/OTP) does not exist in the offline product: Welcome / Profile / GradePlacement stay local; the OTP screens are removed in Phase 2.
- No code, no ledger change, no TESTED_NATIVE row, no deletion, no asset, and no build / gate / test is included in this ADR. No PASS is claimed.
- Honest limits carried into the phases: only ST07 is a complete pilot; 24 stations unauthored; 41 ST07 assets described, not delivered; 232 audio rows, zero binaries; no Vazirmatn TTF in the repo (owner must supply; random download forbidden, ADR-0037); only 4 character WebP in runtime; guide face undefined (CONTENT-006); 8 station titles + all 5 chapter names open (CONTENT-004).

## Open owner decisions

| # | Decision | Options (from the studies) | Blocks |
|---|---|---|---|
| O1 | Answer-key model (§3) | (1) Key in the APK inside a separate evaluator layer; (2) evaluator without an extractable key, proven per template; (3) evaluator from item parameters at runtime | Phase 1 / B |
| O2 | Content package format (§4) | Proposal in §4 (`manifest.json` + `stations/*.json` + `audio/*.opus` + `images/*.webp`; three models + separate evaluator layer) — confirm, or an alternative | Phase 1 |
| O3 | `LessonGateway` interface: keep with a local implementation, or delete and use an explicit `LocalLessonEvaluator` | (a) Keep the interface, local implementation (least host / journey change, misleading "Gateway" name stays); (b) delete, explicit `LocalLessonEvaluator` (cleaner, larger host / journey change). The offline plan proposes (b). | Phase 1 |
| O4 | Durable local progress store | Room (durable, versioned migrations, for progress + packages) vs DataStore (simpler, for settings / checkpoints, not structured progress). The offline plan proposes Room for progress / packages + DataStore for settings / checkpoints. | Phase 1 |
| O5 | Local child identity / multi-profile | Fully local profile (name, grade G1…, avatar sun / leaf / cloud / moon), no account, no password, no server recovery; one profile vs several profiles with selection at launch — undecided | Phase 2 |
| O6 | Fate of backend / Supabase (74 migrations) and `apps/web` (CMS panel, incl. N08-13) | Delete vs keep as an offline authoring tool (CMS without backend) | Phase 2 / 5 |
| O7 | APK size budget | No number exists today; a cap must be set (text ~1.2 MB known; audio / images unknown) | Phase 1 / 4 |
| O8 | Vazirmatn font supply | Owner supplies an approved TTF; until then `FontFamily.Default` stays. Random download forbidden. | Phase 4 (and all UI) |
| O9 | Guide face (CONTENT-006) | Main (purple, current default — not an approved decision) vs another face; numeric poses TBD; Dana / Fandogh / Roka roles + real transparent output | Phases A–D (character cameos) |
| O10 | Motivation economy (Duolingo copy plan §5.4) | Lives / energy; non-punitive streak; leagues / leaderboard; currency / shop; badges; daily-goal ring — each needs explicit approval + its own ADR + a child-safe version | Any phase that would build one (none planned) |
| O11 | CONTENT-004 / 005 / 007 / 016 (N08-08 blockers) | 004 names (8 titles + 5 chapter names); 005 religious content (neutral-first vs separate cultural package); 007 SFX source + haptics default; 016 grade-1 scope (9×9, two-digit comparison, 100) | Phases 1, 3, 4 |
| O12 | Remaining CONTENT-001…018 dispositions | 001 trace direction / tolerance; 002 jump question count (1 vs 5); 003 hints in the independent pool (forbidden in P4/P5); 008 (see §3); 009 ST07 visuals; 010 approved playable audio; 011 calibration values; 012 the 24 station specs; 013 audio script metadata / lifecycle; 014 mastery / unlock / jump (3 of 4, draft); 015 typed authoring behaviour; 017 audio never blocks; 018 telemetry (IDs only). Full table in the offline plan §5.1. | Phases 1–4 |
| O13 | Parity definition for N09-01 + "web/API unaffected" (N09-03) | Parity with what, now that there is no backend? | Phase 5 |

**Phase A is not blocked by any open decision above.** What this ADR does not decide: the exact local evaluator API, the Room schema, the manifest schema version, and the voice choice (CONTENT-006) — those are Phase 1 decisions, recorded then.
