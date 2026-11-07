// GENERATED FILE — DO NOT EDIT DIRECTLY.
// Source of truth: packages/design-system/src/tokens.json (v2 block, canonical per ADR-0037 L6).
// Regenerate with: node tools/token-codegen/generate.mjs   (drift gate: node tools/token-codegen/generate.mjs --check)

/**
 * Canonical v2 design tokens for TypeScript consumers (UI/UX Generation V2, owner decision
 * D-021). Shape mirrors the v2 block one-to-one; semantic mapping happens in components.
 */
export const V2_TOKENS =
{
    "note": "UI/UX Generation V2 (owner decision D-021, 2026-10-27) — warm garden palette. WCAG-checked pairs; V1 groups above remain for unmigrated surfaces.",
    "color": {
      "canvas": "#FFF8EF",
      "surface": "#FFFFFF",
      "surfaceAlt": "#FDF3E3",
      "primary": "#0C7A54",
      "primarySoft": "#DDF2E7",
      "primaryDark": "#0A5C41",
      "amber": "#FFB020",
      "amberSoft": "#FFF1D6",
      "amberInk": "#4A2E00",
      "berry": "#C13A7C",
      "berrySoft": "#FBE3F0",
      "berryDark": "#9E2B60",
      "sky": "#1D6FA8",
      "skySoft": "#E1F0FA",
      "ink": "#15302B",
      "ink2": "#44594F",
      "muted": "#5E6F68",
      "line": "#E7DED1",
      "line2": "#D6CCBD",
      "edge": "#D8CDBB",
      "white": "#FFFFFF",
      "danger": "#B3402F",
      "dangerSoft": "#FBE7E2",
      "amberEdge": "#D89513",
      "splashCream": "#FDF4E5"
    },
    "type": {
      "display": {
        "fontSize": 32,
        "lineHeight": 40,
        "weight": "800"
      },
      "title": {
        "fontSize": 22,
        "lineHeight": 30,
        "weight": "800"
      },
      "body": {
        "fontSize": 17,
        "lineHeight": 26,
        "weight": "600"
      },
      "caption": {
        "fontSize": 13,
        "lineHeight": 20,
        "weight": "700"
      },
      "bignum": {
        "fontSize": 40,
        "lineHeight": 44,
        "weight": "800"
      }
    },
    "space": [
      4,
      8,
      12,
      16,
      20,
      24,
      32,
      40
    ],
    "radius": {
      "sm": 12,
      "md": 18,
      "lg": 24,
      "xl": 32,
      "pill": 999
    },
    "shadow": {
      "color": "#15302B",
      "opacity": 0.1,
      "offsetY": 4
    },
    "motion": {
      "duration": {
        "fast": 120,
        "base": 220,
        "slow": 340
      },
      "spring": {
        "damping": 14,
        "stiffness": 220,
        "mass": 1
      },
      "pressScale": 0.96
    },
    "component": {
      "touchMin": 48,
      "buttonH": 56,
      "nodeSize": 72,
      "nodeCurrent": 84,
      "manipulativeMin": 72,
      "manipulativeMax": 80,
      "edge": 4,
      "trayBead": 48,
      "progressH": 14,
      "rowH": 72,
      "gradeCardH": 56,
      "topBarH": 56,
      "characterHero": 180,
      "characterCompactWidth": 360,
      "characterRegularWidth": 400,
      "splashHeroMaxWidth": 320,
      "splashProgressMaxWidth": 220
    },
    "clay": {
      "note": "Semantic clay depth (design token extension, merged 2026-10-28). Numbers only — every color resolves through v2.color at the component (soft fill=surface, border=line; featured fill=amberSoft, border=amber; highlight=white).",
      "levels": {
        "flat": 0,
        "hint": 1,
        "soft": 2,
        "featured": 3
      },
      "soft": {
        "borderWidth": 1.5,
        "shadowOpacity": 0.08,
        "shadowRadius": 10,
        "shadowOffsetY": 5,
        "highlightOpacity": 0.68,
        "highlightThickness": 1,
        "elevation": 2
      },
      "featured": {
        "borderWidth": 3,
        "shadowOpacity": 0.12,
        "shadowRadius": 10,
        "shadowOffsetY": 6,
        "highlightOpacity": 0.68,
        "highlightThickness": 1,
        "elevation": 4
      },
      "answerTile": {
        "minHeight": 64,
        "borderWidth": 2
      }
    }
  } as const;

export type V2Tokens = typeof V2_TOKENS;
