# Phase D readiness assessment — what was done and what was not (2026-11-05)

Scope: Phase D (families 01, 02, 04, 07, 11, 12, 13, 14, 15, 16, 17) after the
ADR-0039 doc sync (commit a2f6941). Source of verdicts:
`~/workspace/shomara-design-readiness/STAGE_CARDS_FA.md` (family cards) and
`DESIGN_READINESS_FA.md`. No code was changed in this assessment except the
P8 registry row below; no gate was run; no PASS is claimed.

## Done in this batch

- **P8 added to `design/playbook/IMAGE_REGISTRY.md`** (PENDING_OWNER, row only,
  no image): manipulative icons for templates T01–T15, WebP with alpha
  800x800, one icon per template, no text/numbers/characters/reward motifs.
  Each icon must depict exactly its own template's manipulative and is
  checked against the template spec before approval. Generation candidate
  with that per-template check. No icon ships until its template's
  manipulative is defined in approved content (today only ST07's templates
  are specced).

## Families checked — no code change, with reason

| Family | Card verdict | Why no code change now |
|---|---|---|
| 01 Launch/Welcome | ◐ half-ready | Welcome text not canonical (owner approval) + local session model is Phase 2 |
| 02 Onboarding | ◐ half-ready | Texts + calibration items not ready |
| 04 Profile setup | ◐ half-ready | Question texts + local profile model not ready |
| 07 Station start | ◐ half-ready | Real aim/metadata not ready (CONTENT-004) + connection to local progress needs Phase 1 |
| 11 Recovery/Result | ◐ half-ready | Result surface exists (Stage 3); in-lesson feedback panel, "what was practised", "why?", and mistake review need Phase B / local package content |
| 12 Practice tab | ◐ half-ready | Hub structure exists (Stage 4); real practice content + "my mistakes" need Phase 1 |
| 13 Challenge | ◐ half-ready | Intro exists (Stage 3); round + content not ready (CONTENT-016 + Phase B) |
| 14 Profile/Me | ◐ half-ready | Structure exists (Stage 4/5); real facts (progress + saved avatar) need Phase 1/2 |
| 15 Avatar/Settings/Guardian | ✅ ready | Structure, state machine and gate are done (Stages 4/5); remaining work is guardian/PIN texts (not canonical — owner approval) + verifier wiring (Phase 2). `ShomaraParentGate` stays fail-closed with `verifier = null`. |
| 16 System states | ✅ ready | `ShomaraStateSurface` is done (Stage 1); the code has no pending-sync state to remove (enum is Loading/Offline/Error/Empty only). Remaining work is the redefined offline texts (not canonical — owner approval) and deleting internet-dependent copy in `ShomaraLaunchGate` (Phase 2, per the card). |
| 17 Navigation/shell | ✅ ready | Structure complete (Stages 1/5 + Phase A floating button); only the device gate (real-gesture TalkBack + Back) remains. |
| 03 Phone/OTP | ✅ ready — as deletion | Deletion is Phase 2 (local identity replaces OTP); deleting it now, without the local profile/PIN, would break onboarding. Not done here. |

Families 05, 08, 09, 10 were not attempted: their cards say "not ready"
(05 needs O1/O2 + CONTENT-014/002; 08/09/10 need Phase 1 content +
evaluator). Phase B/C/E were not attempted: blocked on O1 + O2 + Phase 1.

## Still open (owner decisions, not guessed)

- O1 answer-key model (3 options, ADR-0039 §3) and O2 package format
  (ADR-0039 §4 proposal) — block Phase 1 and Phase B.
- Canonical texts still missing: welcome text (01), onboarding/profile
  question texts (02/04), guardian/PIN texts (15), redefined offline/error
  texts (16). No new user-facing sentence was invented in this batch.
