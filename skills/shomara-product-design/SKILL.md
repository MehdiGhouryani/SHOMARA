---
name: shomara-product-design
description: Design, audit, migrate, or review SHOMARA Android/Expo screens and learning interactions. Use for every SHOMARA product UI/UX, route hierarchy, child journey, accessibility review, responsive/RTL decision, character usage, audio/CMS surface, or Duolingo-, AVA-, Claymorphism-, or UI/UX-Pro-Max-inspired learning-flow task.
---

# SHOMARA product design skill

Build a Persian, Android-first mathematics learning product. Filter every external inspiration through SHOMARA safety, curriculum, accessibility and brand constraints.

## Start every task

1. Read `AGENTS.md`, `START_HERE.md`, then run `node tools/harness.mjs validate` and `node tools/harness.mjs next`.
2. Read `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and `skills/shomara-screen-execution/SKILL.md`.
3. Read `design/playbook/PAGE_UIUX_BLUEPRINT.md`, then only the matching page contract in `design/playbook/pages/` plus its direct dependencies.
4. Reconcile the real route/state with `design/playbook/ROUTE_REGISTRY.md`, `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` and `design/playbook/quality/SCREEN_LEDGER.csv`; never invent a route or implementation status.
5. For tokens, shared components, Clay depth or Compose theme, load `skills/shomara-design-system/SKILL.md`; for Native route work also read `design/playbook/NATIVE_IMPLEMENTATION.md`.
6. For curriculum, audio, CMS metadata or educational content, load `skills/shomara-learning-content/SKILL.md`; never promote an original directly into runtime.

## Binding workflow

`DISCOVER → OBSERVE → AUDIT → DESIGN → IMPLEMENT → TEST → CAPTURE → LEDGER`

- Treat current Expo V2 as behavioral/migration reference, not the final Native architecture.
- Record the page's outcome, focal object, design dials, anti-patterns and reason for every depth tier before decoration.
- Keep one primary action per decision state and preserve loading, offline, empty, error, disabled, correct, retry, back and resume states where relevant.
- Use canonical tokens from `packages/design-system/src/tokens.json`; do not add page-local hex, spacing or radius values.
- Keep progression, evaluation, mastery and Station Pass server-authoritative. Never ship answer keys in the child client.
- RTL controls interface flow; mathematical direction and geometry keep their semantic direction.
- Require 48dp minimum touch targets; prefer 72–80dp for early-grade manipulatives.
- Do not mark Native as tested without a real Android build/device or emulator run.
- Do not install or import an external UI generator, palette, font or framework merely because it appears in an inspiration source.

## Evidence rule

Record exact source paths, state, command/exit code, before/after evidence and open blockers. Use `UNVERIFIED`, `NATIVE_PENDING` or `BLOCKED` instead of optimistic claims. Update the route ledger and canonical harness in the same checkpoint.

## Stop and ask

Pause only for product decisions that materially change identity, curriculum, grading, privacy, production data, licensing or release/signing. Safe consistency fixes and implementation inside an approved task do not require another confirmation.
