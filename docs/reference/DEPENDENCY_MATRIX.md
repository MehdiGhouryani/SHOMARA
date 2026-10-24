# Current Dependency & Architecture Matrix

**Status:** Current supporting reference
**Authority:** `ROADMAP_PHASES.md` for execution order; ADR/contracts for locked architecture.

| Area | Current decision | Verification/source |
|---|---|---|
| Backend | Modular monolith with Supabase/PostgreSQL boundary | ADR-0003 + current code/migrations |
| Web | Next.js + React + TypeScript; secondary validation surface | workspace manifests + current routes |
| Mobile | React Native + Expo + Expo Router + TypeScript; Android-first | mobile manifest + Expo config |
| Animation | Rive for production character motion where approved; Reanimated for UI motion | ADR-0002 + animation runtime source spec |
| Database | PostgreSQL via Supabase migrations | `supabase/migrations/` |
| Auth | Supabase Auth with production phone OTP onboarding | onboarding contract + auth runtime |
| Content delivery | Manifest + versioned package + checksum + CURRENT/NEXT/RECENT/FUTURE cache policy | content contract + content-delivery package |
| Learning truth | Server-authoritative Learning Runtime | ADR-0003 + learning-runtime package + migrations |
| Assignments | Adult/teacher projection and assignment services remain outside the child shell | adult/assignment contracts + server routes |
| Offline sync | At-least-once client queue with idempotent server handling; no second learning authority | offline-sync package + offline API contract |
| Cache authority | Local cache state is disposable; entitlement/content access remains server-authoritative | content contract + mobile content manager |
| Performance | 60 FPS target for standard child interactions; low-end Android profiling required before pilot | animation runtime + release QA |
| Accessibility | RTL-first, explicit reduced-motion support, large-text/device QA, non-color-only state communication | design system + onboarding/path contracts |
| Engine boundary | No Unity/Unreal/Godot; reusable React Native/Web game templates on top of Learning Runtime | ADR-0001 + game/engagement source |

## Rule

Do not add a dependency because a benchmark product uses it. Add it only when the product requirement, current platform constraints, and maintenance cost are documented in the active roadmap/ADR/contract set.
