# ADR-0003 — Server-Authoritative Learning Runtime

> **Status update (2026-11-13, P2 reconciliation):** SUPERSEDED-IN-PART by [ADR-0039](ADR-0039-fully-offline-content-and-duolingo-copy-ui.md) — learning truth moved from the remote Platform runtime to the bundled content package + versioned local evaluator, and local progress is persisted on device. The server-side runtime below remains the historical record of the Backend/Sessions model, whose fate (retain as authoring/CMS or retire) is open owner decision **O6**. This document is preserved unchanged as history.

## Decision

Learning Truth and learning transitions are owned by the Platform runtime, not the child client.

## Rationale

The product core defines Evidence → Learning State → Decision → Learning Plan as canonical learning semantics. Mobile is a client and may hold transient interaction state, but cannot authoritatively finalize Learning State, Mastery, Station Pass, or permissions.

## Consequences

- Mobile submits answers/results with idempotency keys.
- Server evaluates accepted answers.
- Historical Evidence is append-only.
- UI can render a decision but cannot create a different one locally.
- Offline queue is a transport concern; reconciliation remains server-authoritative.
- Game mechanics remain interchangeable with the same runtime contract.
