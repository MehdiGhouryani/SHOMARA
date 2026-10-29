---
name: shomara-design-system
description: Define, implement, generate, migrate, or review SHOMARA design tokens, Jetpack Compose theme, components, Claymorphism depth, typography, motion, semantics, screenshots, and component APIs. Use for N03 design-system work, token codegen, shared UI primitives, component state matrices, accessibility, or visual consistency.
---

# SHOMARA design system skill

Build one accessible cross-platform system; do not design isolated page-local styles.

## Required workflow

1. Read `AGENTS.md`, `START_HERE.md`, run harness `validate` and `next`, and obey the active task dependency graph.
2. Read `design/MASTER.md`, `design/INSPIRATION_GUARDRAILS.md` and `design/playbook/COMPONENT_READINESS.md`.
3. For Compose, read `design/playbook/NATIVE_IMPLEMENTATION.md`; for a route, also load `skills/shomara-screen-execution/SKILL.md` and its page contract.
4. Inventory existing token consumers before changing schema or generated output.
5. Define purpose, API, state matrix, semantics, RTL/math direction, motion fallback and evidence before implementation.
6. Generate platform outputs from the single canonical token source; never hand-edit generated files.
7. Run the gates routed by `references/review-checklist.md` and record device-only checks as `NATIVE_PENDING`.

## Hard boundaries

- Keep `packages/design-system/src/tokens.json` canonical until an approved migration explicitly replaces it.
- Use semantic tokens; never introduce feature-local hex, shadow, radius, spacing, duration or typography scales.
- Apply Clay depth only to clarify hierarchy or tactility. Never use depth on text or as the only state signal.
- Keep one featured surface per decision viewport and make assessment quieter than teaching.
- Preserve 48dp general targets and 72–80dp early-grade manipulatives where the content contract requires them.
- Respect reduced motion, 200% font scale, TalkBack and semantic math direction.
- Do not adopt external palettes, fonts, dependencies or copied screen recipes. Inspiration is filtered through SHOMARA contracts.
- Do not claim `TESTED_NATIVE` without a real build plus emulator/device evidence.

## Evidence

Record token diff, generated drift result, state coverage, semantics result, 360/390/412 screenshots, large-text/RTL evidence and remaining human/device approvals. A visually pleasing preview alone is not a gate.
