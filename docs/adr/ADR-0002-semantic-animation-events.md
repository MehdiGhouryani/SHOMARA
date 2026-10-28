# ADR 0002 — Semantic Animation Events

## Decision

Learning Engine emits semantic events. Animation runtime maps them to visual behavior.

## Consequences

- Learning rules remain renderer-independent.
- Rive state-machine names can change without changing learning code.
- Accessibility fallback can render the same semantic outcome without animation.
- Automated tests can verify learning events without rendering graphics.
