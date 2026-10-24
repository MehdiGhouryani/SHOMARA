# @math/design-system

Shared Persian-first design tokens for Web and Mobile.

## Source of truth
`src/tokens.json`

## Exports
- `TOKENS`: canonical structured tokens for new code.
- `DESIGN_TOKENS`: compatibility shape for legacy Web components during migration.

Do not put feature-specific UI components here unless they can be genuinely shared across React DOM and React Native without platform conditionals.
