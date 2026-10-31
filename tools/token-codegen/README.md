# SHOMARA token codegen (N03-01)

Single-source codegen for the canonical design tokens. `packages/design-system/src/tokens.json`
(schemaVersion 2.0.0) is the **only** token JSON in the repository; the `v2` block inside it is
the canonical palette/shape for the Native client (ADR-0037 L6, owner decision D-021). The v1
top-level groups stay available for unmigrated web surfaces and are deliberately not emitted here.

## Targets

| Target | Output | Notes |
|---|---|---|
| TypeScript | `packages/design-system/src/tokens.generated.ts` | `V2_TOKENS` const + type, mirrors the v2 block one-to-one |
| Kotlin | `apps/android/core/designsystem/src/main/kotlin/com/mathlearning/core/designsystem/ShomaraTokens.kt` | Compose-ready raw values (`Color`/`dp`/`sp`/`FontWeight`); the Gradle module is wired in N03-02 |

## Commands

```bash
node tools/token-codegen/generate.mjs          # regenerate both targets
node tools/token-codegen/generate.mjs --check  # drift gate; exit 1 on any drift
```

## Rules

- Never hand-edit the generated files; regenerate in the same change set as any tokens.json edit.
- Never introduce a second token JSON or a parallel token system (AGENTS §3.10).
- The schema guard (`assertSchema`) enforces: schemaVersion, #RRGGBB colors, strictly ascending
  space scale, the 48dp touch floor (`v2.component.touchMin`), and the four MASTER clay levels
  (`flat/hint/soft/featured`).
- The vitest drift test lives at `packages/design-system/src/codegen.drift.test.ts` and runs with
  the normal unit suite; `--check` is the CLI form for CI/Gradle wiring in later tasks.
