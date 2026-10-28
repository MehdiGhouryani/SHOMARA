# شمارا — Design System Reference

این فایل مرجع انسانی Design System است. منبع اجرایی tokenها در `packages/design-system/src/tokens.json` قرار دارد.

## Repository layout

```text
packages/design-system/
  src/tokens.json              # Source of truth
  src/index.ts                 # Typed exports + legacy bridge

apps/web/app/design-tokens.generated.css
  # Generated Web CSS variables — do not edit directly

apps/web/components/ui/
  # Web primitives

apps/mobile/src/ui/design-system/
  # Native adapter + primitives

docs/reference/DESIGN_SYSTEM.md
  # Human-readable contract
```

## Non-negotiable rules

- New colors, spacing, radii, sizes and type scales MUST come from Design System tokens.
- Child-facing UI remains Persian-first and RTL.
- Vazirmatn is the product UI font.
- Interactive controls target at least 48px/dp.
- Amber is used for reward/secondary emphasis; error semantics use explicit error tokens and text, not color alone.
- Reduced motion follows both OS preference and explicit app setting.
- Existing legacy aliases in `apps/web/app/globals.css` are migration-only.

## Change process

1. Change `packages/design-system/src/tokens.json`.
2. Run `npm run design-system:generate`.
3. Run `npm run verify:uiux:p3`.
4. Update component consumers and evidence documents in the same change.
