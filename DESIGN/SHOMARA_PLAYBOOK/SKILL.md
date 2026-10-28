# SHOMARA PLAYBOOK — local project skill (for ZCode/GLM)

You are implementing a **Persian, Android-first mathematics learning product**, not building a concept mockup.

## Mandatory read order
1. Repository `AGENTS.md`, `START_HERE.md`, actual branch, dirty files and routes.
2. Existing `DESIGN/SKILL.md`, `DESIGN/MASTER.md`, its tokens/guides/page contracts and acceptance rules (**these are authoritative for brand**).
3. This `DESIGN/SHOMARA_PLAYBOOK/MASTER_EXECUTION.md` and `UX_REVIEW_RUBRIC.md` (**these are authoritative for execution process**).
4. `ROUTE_REGISTRY.md` + screen-specific `pages/*.md`, *only for the current screen and its dependencies*.
5. `CONTENT_LIBRARY/INTEGRATION_GATE.md` and related references only when changing educational content, templates, audio or curriculum. Avoid loading the 200KB book study unnecessarily for purely visual tasks.

## Precedence when guidance conflicts
Safety / contracts / authoritative backend / approved product decisions > existing DESIGN master/tokens > this PLAYBOOK process > screen-specific overrides (only layout/UX) > content draft proposals > visual examples. A page instruction cannot override authentication, learning correctness or a canonical color token. If two binding sources disagree, log the mismatch with paths and resolve safely; never silently invent a new requirement.

## Per-route loop (NON-OPTIONAL)
DISCOVER actual screen → READ source & exact page contract → OBSERVE current rendered state → AUDIT UX → FIX design + behavior → TEST real interaction → CAPTURE before/after → UPDATE ledger → NEXT route.

Do not say "all screens done" if any route, modal, state or critical device check remains unverified. Never assume the previous GLM commits are correct. Do not make existing `DESIGN/` files disappear. Existing 5-character static WebP art is the default. Rive is deferred.

## Hard rules
- No false native testing claims, no fake audio or asset binaries.
- No hardcoded random colors, spacings or radii when canonical tokens exist.
- No excessive clay layers: math meaning and readable forms win.
- No duplicate answer submission, client-authoritative progression, accidental content import, unsafe migration, or destructive git commands.
- No punishment/streak/lives/stars; no unauthorized reshaping of lessons.
- Implement in bounded checkpoints with committed and testable evidence; continue until discoverable routes are addressed unless genuinely blocked. Do not interpret 'use maximum tokens' as permission to fabricate evidence or ignore runtime limits.
