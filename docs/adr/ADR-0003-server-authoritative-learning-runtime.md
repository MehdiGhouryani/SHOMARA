# ADR-0003 — Server-Authoritative Learning Runtime

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
