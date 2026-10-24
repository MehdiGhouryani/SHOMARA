# Package Delivery Standard

Every project handoff is a **complete snapshot**, not a delta-only patch.

Each snapshot must include:

1. All implementation files accumulated so far.
2. All source/design/spec MD files already accepted into the project.
3. All migrations and seeds accumulated so far.
4. All shared contracts and API client code.
5. All new files from the current phase.
6. Verification scripts/tests for completed phases.
7. A phase revision note.
8. A snapshot manifest stating what was included and what was not runtime-verified.

A later snapshot supersedes the previous snapshot as the working handoff, but previous ZIPs remain useful historical checkpoints.
