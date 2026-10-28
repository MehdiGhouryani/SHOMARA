# ADR-0033 — Android-First Runtime Foundation

**Status:** Accepted for P02 implementation
**Date:** 2026-10-03

## Context

The product target is an Android APK/AAB. Web is retained as a demo/dev validation harness. The earlier implementation contained multiple partially authoritative paths: local jump unlock state, local content fallbacks, local resume, development authentication fallback selected by configuration state, and an account-independent installation id.

## Decision

The Android runtime follows a single authority hierarchy:

```text
Supabase Auth / PostgreSQL RPCs
        ↓
authoritative learning/session/progression state
        ↓
child-safe content presentation
        ↓
Android local projection + encrypted-ish/secure identity storage + cache
```

Specifically:

1. Production request identity is fail-closed and requires Supabase configuration plus a bearer token.
2. Android installations receive a cryptographically random UUID stored in SecureStore; account binding is server-side and direct client table writes are revoked.
3. Session resume is an RPC transaction that verifies ownership and optional installation provenance.
4. Jump Assessment is evaluated by the server, audited append-only, idempotent, prerequisite-gated, and unlock-granting in the same transaction.
5. Production content packages are stable, checksum-verified, child-safe presentations. Evaluator answer keys never enter the Android production package.
6. Remote StationFlow content is required in production. Local data can be used only as non-authoritative development fallback.
7. Android prepares/caches the canonical content package before creating a production learning session.

## Consequences

Positive:

- APK cannot manufacture mastery, station pass, jump unlock, or session identity.
- Content displayed by Android is traceable to a server-approved content version and checksum.
- Offline state can provide continuity without becoming a second learning authority.
- Web and Android can share API contracts while only Android remains the product surface.

Costs:

- A production station start depends on authenticated backend and canonical content availability unless a previously cached authoritative session/content path is being resumed.
- P02 requires live Supabase and physical Android evidence; static checks alone cannot justify PASS.
- Future features such as Missions and Rewards must consume accepted learning events rather than write learning truth directly.
