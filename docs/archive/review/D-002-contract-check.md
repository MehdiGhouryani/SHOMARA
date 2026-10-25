# D-002 contract check — is a second submit for a wrong answer with `CONTINUE` contract-legal?

Date: 2026-10-25 · Trigger: review finding R-5 / P0 mission item 3 · Verdict: **legal — no client change, no D-016 needed.**

## Question

D-002 (START_HERE §4) lets the wrong-answer sheet offer «دوباره امتحان کن» only when the server decision is
`CONTINUE` or `STATION_PASS`. Retrying sends a second submit for the same encounter with `attemptNumber + 1` and a
fresh idempotency key. Does the learning contract clearly allow a second submit for the same encounter?

## Evidence

**1. The submit endpoint is attempt-numbered by design.**
`docs/api/API_LEARNING_RUNTIME_CONTRACT.md` §3 defines `POST /api/v1/learning/attempts/submit` with client-supplied
`attemptNumber` and `clientIdempotencyKey`. Nothing in the contract limits an encounter to one attempt.

**2. The engine enforces per-key idempotency, not per-encounter uniqueness.**
`packages/learning-runtime/src/engine.ts`:
- `:38` — a replay is detected by `getAttemptByIdempotency(command.clientIdempotencyKey)`; a *different* key is a new attempt.
- `:69-70` — the only guards are `ENCOUNTER_COMPLETED` (status, not attempt count) and `ATTEMPT_NUMBER_INVALID` (must be a positive integer). There is no `MAX_ATTEMPT` anywhere in the learning path (grep across `packages/` and `apps/web/`).
- `:78-91` — each submit stores its own `AttemptRecord` with its `attemptNumber`.

**3. Multiple attempts per item are a first-class concept in the shared contracts.**
`packages/contracts/src/challenge.ts:321-324` builds round idempotency keys as `…:r{roundIndex}:a{attemptNumber}`, and
`challenge.ts:239` (`maxAttemptsPerRound`) shows the contract family models repeated attempts explicitly.

**4. Under the current real decision policy, wrong+`CONTINUE` is unreachable — but that is a server policy, not a contract limit.**
`packages/learning-runtime/src/policies.ts:47-51` (`nextStateForAttempt`): an accepted, incorrect answer returns
`RECOVERY`; `CONTINUE` is returned for correct answers. `engine.ts:180` keeps `STATION_PASS`/qualifying-check precedence.
So on the production path (`apps/web/app/api/v1/learning/attempts/submit/route.ts:25-33` → `learning-runtime` engine)
the D-002 retry branch fires today only for wrong+`STATION_PASS` (possible when the station checks already qualify);
wrong+`CONTINUE` is exercised by the flow harness mock (`apps/mobile/parity/flow/stubs/config-runtime.ts:100-102`),
which returns `CONTINUE` for a first wrong answer precisely to pin the client branch. The decision is the server's
(`RUNTIME_POLICY_VERSION` / `STATION_PASS_POLICY_VERSION` in the decision record); a future policy may legitimately
answer `CONTINUE` to a wrong attempt, and the client following it is the correct server-authoritative behaviour.

**5. The client's second submit is honest and pinned.**
`apps/mobile/src/station/runtimeApi.ts:427` derives the key from `attemptNumber`, and `StationFlow` increments it after
every accepted submit. `scripts/flow-station-run.mjs:154` asserts the retry is a second submit with
`attemptNumber === 2` and a different idempotency key, and `:240` asserts all keys stay unique across the station.

## Decision

The contract clearly allows more than one submit per encounter (attempt-numbered, per-key idempotent, no attempt cap;
the challenge contract repeats the same pattern per round). The D-002 client behaviour stays exactly as implemented.
No D-016 is recorded because no semantics change is needed. The one nuance worth keeping visible: under the current
runtime policy a wrong single answer yields `RECOVERY`, so the mock-only wrong+`CONTINUE` path exists to future-proof
the client against server policy versions — that is the server's prerogative, not a client guess.
