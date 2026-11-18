# ADR-0047 — Local identity, Parent PIN, and privacy foundation (P10)

- **Date:** 2026-11-14
- **Decision status:** Infrastructure contracts / backup policy were accepted for P10. **As-built correction (2026-11-18): foundation only — production identity, durable Parent PIN, ParentGate and full erasure are NOT wired.**
- **Decision owner:** project owner (P10 mission: identity/parent control/data protection per ADR-0039)
- **Governing owner decision:** O5 (single vs multi profile) remains OPEN. This ADR does not approve either option and does not create a permanent profile schema or launch-selection flow.
- **Related:** ADR-0039 §5 (local-only data), ADR-0044 (engine seams), gap G-25–G-28, `docs/content/CONTENT_PIPELINE_FA.md`, `docs/architecture/OWNER_DECISION_BRIEF_O5_LOCAL_PROFILE_FA.md`
- **Latest verification:** Android Native run `44308240426` on branch SHA `bc9c1b8` PASS — 81 XML suites, 583 tests, zero failure/error/skip; includes profile module ParentPinManagerTest 7/7 and PrivacyAndDiagnosticsTest 6/6. This verifies source/JVM behavior only, not app integration or a real device.
- **Correction scope:** the facts below supersede any earlier wording in this ADR that implied a durable PIN store, LocalProfileManager, fully composed erasure, or an available parent deletion flow. No owner decision was changed.

## 1. Threat model and current control status

| Threat | Existing foundation | As-built limitation / status |
|---|---|---|
| Child opens parent surface without authorization | `ParentPinManager` implements salted PBKDF2 verification, constant-time byte comparison, failed-attempt counter and growing lockout policy. Input `CharArray` and temporary key buffers are cleared. | **NOT WIRED:** no durable `PinStore` implementation is present in app composition; active `ShomaraChildShellHost` constructs `ShomaraParentGate(verifier = null)`, so the gate remains fail-closed. |
| PIN exposure via storage/logging | `PinRecord` stores salt/hash/counter, not plaintext. Diagnostics tests guard PII and sensitive values. | No real persisted PIN record exists in the app. No hardware-backed pepper/keystore integration. |
| Backup exfiltration | Manifest policy has `allowBackup=false`, `fullBackupContent=false` and API-31+ data extraction rules excluding backup/transfer. | Manifest/static verification is not a complete app-store privacy review; no recovery/restore product exists. |
| Debug content/trust leaking into release | Debug-only source separation and R10 static guard exist; release trust set remains fail-closed. | This does not imply approved lesson content or signed release readiness. |
| PII in logs/diagnostics | SafeAppLogger sensitive-key rejection + SafeDiagnostics value scan. | Continue to enforce on any new screen/telemetry path; no child PII should be added to diagnostics. |
| Child-data erasure | `PrivacyDataController` iterates injected `PrivacyStore` instances and file directories; failures are accumulated and do not stop later wipes. It now reports an incomplete recursive directory deletion instead of marking it cleared. | **NOT WIRED:** controller accepts abstract stores/dirs; no production aggregator/adapters for the real Room/DataStore stores and app-private directories are wired from the app composition root. The tests use test stores and temporary directories only. There is no in-app parent deletion journey yet. |
| Accidental cross-profile state | O5 stays open; no permanent profile table or selection UX is created prematurely. | A DataStore onboarding draft is not an identity/profile slot. No `LocalProfileManager` or `ProfileSlotStore` source exists in the current tree. |

## 2. Data inventory — contract vs actual integration

| Data | Current owner/store | Can the current app's PrivacyDataController delete it? |
|---|---|---|
| Incomplete onboarding draft (name/avatar/grade) | `PreferencesProfileDraftStore` in DataStore | Only if a concrete `PrivacyStore` adapter is supplied; no app wiring is present. |
| Child permanent identity/profile | **Not implemented**; O5 remains OPEN | No profile row/store exists to delete. |
| Settings (avatar/reduced motion) | DataStore settings store | No production PrivacyStore adapter is wired. |
| Lesson checkpoints | DataStore checkpoint store | No production PrivacyStore adapter is wired. |
| Legacy token/session state (Phase-2 retirement) | DataStore token store | No production PrivacyStore adapter is wired; retirement is governed by ADR-0039/O3. |
| Room packages/progress/outbox/attempt data | Room v3 repositories/entities | No production PrivacyStore adapter is wired to the controller. |
| Content/package staging, media/cache directories | App-private directories where present | Controller can delete a directory only when a real directory is passed to it; app-wide directory list is not composed. |
| Audio/image binaries | Not delivered as approved production assets yet | No production directory inventory/wipe integration verified. |
| Keystore | No current secret-key material required by the present PBKDF2 component | No KeyStore integration is claimed. Re-evaluate if a pepper or other secret-bearing design is approved. |

## 3. Component contracts and implementation state

| Component | Contract | Actual state |
|---|---|---|
| `ParentPinManager` | `setPin/verify/isConfigured/clearPin` over an injected `PinStore`; persisted failed attempts; policy `parent-pin-policy:v1`. | **SOURCE_IMPLEMENTED / LOGIC_TESTED**. Interface only; no durable adapter and no ParentGate wiring. |
| `PinStore` | Persist `PinRecord(salt, hash, iterations, failedAttempts, lockedUntilMs)`. | **INTERFACE ONLY**. Tests use `InMemoryPinStore`; no DataStore/Room production implementation exists. |
| `LocalProfileManager` / `ProfileSlotStore` | Permanent child profile save/read/delete. | **NOT IMPLEMENTED** in the current source tree. O5 remains OPEN; onboarding draft store is not a substitute. |
| `PrivacyDataController` | `deleteAllChildData(): WipeResult(cleared[], failures[])` over injected stores + dirs. | **SOURCE_IMPLEMENTED / LOGIC_TESTED**, but only generic injection. No app composition root or user-visible deletion flow is connected. |
| `BackupPolicyController` | Single policy declaration asserted against manifest. | Manifest/foundation policy remains in place; this is not an in-app erasure control. |
| `SafeDiagnostics` | `containsPii(value)` + `scan(payload)` complementing key-side logging guards. | Foundation/test layer; maintain as new telemetry/logging is added. |
| `DeviceKeyManager` | Hardware-protected secret/pepper only if a future approved design requires it. | Not implemented or claimed. |

## 4. PIN KDF: legacy baseline and required production decision

The component currently writes `PBKDF2WithHmacSHA256` records using a per-record random 16-byte salt and **210,000** iterations. It stores the iteration count alongside the derived hash, uses constant-time byte comparison, clears caller input and temporary byte arrays, validates malformed records fail-closed, and persists the lockout counter only through the injected store.

**Important correction:** 210,000 is the legacy P10/v1 baseline, not the current OWASP recommendation for PBKDF2-HMAC-SHA256. OWASP currently prefers Argon2id (minimum 19 MiB, t=2, p=1); when FIPS-140 compliance requires PBKDF2, it lists PBKDF2-HMAC-SHA256 at 600,000 iterations. OWASP also says work factors must be benchmarked on the target system, balancing attack cost with login latency. See the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

No blind iteration bump is made in this ADR: the current component is not wired into the app and no low-end-device benchmark is available. Before production ParentGate wiring:
1. Select Argon2id or a FIPS-required PBKDF2 configuration explicitly.
2. Benchmark on the lowest supported device and keep verification below the agreed latency budget.
3. Add an explicit KDF/record format version before changing algorithm/work factor; upgrade legacy records only through a reviewed, tested migration.
4. Review the short numeric PIN threat model (offline extraction, retry controls, Keystore/pepper options) before calling the mechanism production-ready.

## 5. Privacy policy and store-submission implications

- ADR-0039 defines the product as fully offline/no-server. That product decision does not prove every legacy runtime/auth code path has been retired yet.
- The current profile draft is local DataStore state; a permanent child profile has not been implemented.
- **An in-app parent deletion flow is not available yet.** The controller foundation and its generic tests are not evidence that all real Room/DataStore/files are connected or erased.
- Do not state in an app-store privacy declaration that a parent can currently delete all child data through the app. The owner/legal text must wait for the real inventory, wiring, UI flow and device tests.
- Recovery/restore across devices is not offered in ADR-0039 v1; any future recovery requires a separate owner decision and privacy review.

## 6. Deliberately not delivered / release gates

- No single- or multi-profile choice is approved (O5 OPEN); no permanent profile schema, profile picker or `LocalProfileManager`.
- No durable `PinStore` adapter; no PIN setup/change/reset UI; no ParentGate verifier wiring. The gate remains fail-closed.
- No composed real-store/file erasure operation and no in-app deletion screen; the current controller is only a reusable foundation.
- No Keystore/pepper integration.
- No final KDF/work-factor selection or low-end device benchmark.
- No release approval: HG-05 remains owner-gated; production content, evaluator, media rights, physical device/TalkBack and release tests remain separate gates.

**Decision boundary:** this correction is an as-built evidence update only. O5, O1/O2/O3/O6 and HG-05 statuses are not changed by this document.
