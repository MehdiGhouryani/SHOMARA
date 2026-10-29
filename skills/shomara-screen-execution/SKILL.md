---
name: shomara-screen-execution
description: Execute route-by-route SHOMARA UX implementation and migration with evidence. Use for Android Native or Expo screen work, page audits, route/state inventory, visual consistency, accessibility, responsive RTL, learning interactions, route migration, screenshots, QA ledgers, and Design System adoption.
---

# SHOMARA screen execution skill

Implement a Persian, Android-first mathematics product—not a concept mockup. Expo V2 is a temporary behavioral reference; Kotlin/Jetpack Compose is the target.

## Mandatory read order

1. Read repository `AGENTS.md`, `START_HERE.md`; inspect branch/dirty files; run harness `validate` and `next`.
2. Read `skills/shomara-product-design/SKILL.md`, `design/MASTER.md` and `design/INSPIRATION_GUARDRAILS.md` for brand and product invariants.
3. Read `design/playbook/MASTER_EXECUTION.md`, `design/playbook/UX_REVIEW_RUBRIC.md`, `design/playbook/PAGE_UIUX_BLUEPRINT.md` and `design/playbook/ROUTE_REGISTRY.md` for execution policy.
4. Read only the matching contract(s) in `design/playbook/pages/`.
5. For Compose work read `design/playbook/NATIVE_IMPLEMENTATION.md`; for token/component/theme work load `skills/shomara-design-system/SKILL.md` and `design/playbook/COMPONENT_READINESS.md`.
6. For educational content/audio/CMS changes read `skills/shomara-learning-content/SKILL.md` and only the references it routes to.

## Precedence

Safety, approved product decisions, backend/domain contracts and server truth > `design/MASTER.md` and canonical tokens > this execution process > page-family layout guidance > content drafts > examples.

If binding sources conflict, record exact paths and resolve safely. Never silently invent a requirement or weaken a verifier.

## Non-optional route loop

`DISCOVER → READ → OBSERVE → AUDIT → DESIGN → IMPLEMENT → TEST → CAPTURE → LEDGER`

- Discover the exact route, callers, owner data, entry/exit and reachable states.
- Observe the actual UI before editing; source reading alone is not visual review.
- Fix behavior and hierarchy before decoration. Keep one obvious primary CTA.
- Record the focal object, permitted depth tier and page-specific anti-patterns; Clay is not a default container treatment.
- Test real navigation, duplicate actions, offline/retry/back/resume, RTL/math direction and accessibility.
- Capture comparable evidence and update `quality/SCREEN_LEDGER.csv` plus the root harness checkpoint.

## Hard rules

- Never claim Native QA without an Android build and device/emulator evidence.
- Never create fake audio/art assets, fabricate screenshots or infer PASS from source text.
- Use `packages/design-system/src/tokens.json`; no random page-local visual constants.
- Preserve server-authoritative answers, progression, mastery and Station Pass.
- Keep answer keys/evaluators out of the child client.
- No lives, punitive streaks, currency, loot boxes, store or leaderboard.
- V1/V2 and historical goldens remain until zero consumers and replacement gates exist.
- Make bounded, committed checkpoints; preserve unrelated user changes.

## Load-on-demand references

- Page behavior: `design/playbook/pages/01_*.md` through `design/playbook/pages/17_*.md`.
- Compose patterns and gates: `design/playbook/NATIVE_IMPLEMENTATION.md`.
- Full-journey regression: `design/playbook/quality/QA_JOURNEYS.md`.
- Per-route evidence: `design/playbook/quality/REVIEW_CARD.md` and `design/playbook/quality/SCREEN_LEDGER.csv`.
- Native order/status: `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`; keep it `NATIVE_PENDING` until its named evidence exists.
- Interrupted session: root `ZCODE.md` and canonical `START_HERE.md`; `quality/EXECUTION_CHECKPOINT.md` is historical evidence only.

Stop only before a material product/curriculum/privacy/licensing/production/release decision. Continue safe implementation while a relevant task remains executable.
