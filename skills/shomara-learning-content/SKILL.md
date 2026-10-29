---
name: shomara-learning-content
description: Analyze, author, validate, stage, or integrate SHOMARA grade-one curriculum, stations, game patterns, Persian narration, audio metadata, offline content packages, or CMS workflows. Use whenever work touches content-library, ST01–ST25, T01–T15, skills/mastery content, ST07, textbook mapping, TTS, audio approval, or educational QA.
---

# SHOMARA learning content skill

Treat research as evidence and authoring input, never as enabled production content.

## Required workflow

1. Read `AGENTS.md`, `START_HERE.md`, run harness `validate` and `next`, and stay within the active task.
2. Read `content-library/INTEGRATION_GATE.md`, `content-library/integration/SOURCE_AUDIT.md` and, for schema/audio/CMS work, `content-library/integration/AUTHORING_CONTRACT_GAPS.md`.
3. Select only the required originals using the routing table below. Never edit `content-library/originals/**`.
4. Reconcile the proposal with server contracts and `content-library/integration/REPO_COMPATIBILITY.md`.
5. Advance content one state at a time: `SOURCE_ONLY → MAPPED_TO_REPO → STAGED → VALIDATED → HUMAN_REVIEWED → APPROVED → ENABLED`.
6. Run `npm run verify:content-library` and record unresolved issue IDs. A green static validator is not curriculum approval.

## Reference routing

- Curriculum sequence and book pages: `content-library/originals/shomara-stage1-study.md`.
- Evidence and child interaction: `content-library/originals/shomara-external-research.md` and `content-library/originals/shomara-stage2-research.md`.
- Station/skill map: `content-library/originals/shomara-stage4-architecture.md`.
- Audio, feedback, motion and T01–T15: `content-library/originals/shomara-stage5-shared-references.md`.
- Authoring schema and validation: `content-library/originals/shomara-stage6-spec-format.md`.
- Only complete pilot: `content-library/originals/shomara-stage7-pilot-ST07.md` plus its CSV manifest.
- Phase ownership and promotion gates: `content-library/integration/PHASE_INTEGRATION.md`.
- Authoring/published/client split, lifecycle mapping and CMS gaps: `content-library/integration/AUTHORING_CONTRACT_GAPS.md`.

## Hard boundaries

- Keep correctness, evaluator configuration, next step, mastery and pass decisions server-authoritative; authoring answers never enter the child client.
- Maintain separate authoring, published-package and child-projection models; snapshot-test answer/evaluator/threshold stripping for every adapter.
- Preserve stable station/audio IDs and source provenance. Renaming is a reviewed contract migration.
- Audio CSV rows are draft metadata, not audio files. Only `approved` assets with checksum, duration and rights may ship.
- Treat `voice`/`rate` CSV fields as provider hints until human approval; store generated/uploaded binary versions in a separate asset lifecycle with RBAC/audit/rollback.
- Missing audio must not block a lesson; show text, continue safely and emit privacy-safe diagnostics.
- Do not copy textbook imagery. Use new coded or licensed assets and retain rights evidence.
- Do not resolve `OPEN_DECISION` or `SOURCE_CONFLICT` silently. Reference its audit ID in the ADR, content review or task evidence.
- Do not claim child, educator, pronunciation, device or accessibility approval without corresponding human/device evidence.
- Minimize child telemetry: do not log answer keys or raw answers by default; require an explicit privacy/retention decision for any response payload.

## Implementation order

Validate the authoring schema and server boundary first. Implement ST07 as a nonproduction draft pilot using T01, T05, T13 and T15. Only after its acceptance gate may the remaining 24 station specifications be produced in the roadmap batches.
