# ADR-0047 — Local identity, Parent PIN, and privacy foundation (P10)

- **Date:** 2026-11-14
- **Status:** Infrastructure ACCEPTED. **O5 (single vs multi profile) remains OPEN** — per the owner mission rule, no final multi-profile schema and no multi-profile launch flow were built; the single profile slot is the shipped default and `LocalProfileManager.createSecondProfile` refuses until O5 lands.
- **Decision owner:** project owner (P10 mission: identity/parent control/data protection per ADR-0039)
- **Related:** ADR-0039 §5 (local-only data), ADR-0044 (engine seams), gap G-25–G-28, `docs/content/CONTENT_PIPELINE_FA.md`
- **Evidence:** WORKLOG IPA-P10 — 12 profile-module tests green, manifest privacy assertions in the foundation verifier, R10 debug-isolation rule, android:gate PASS, static:all 94/94.

## 1. Threat model summary (child-data threat → control)

| Threat | Control shipped | Test |
|---|---|---|
| Parent control bypass (child opens parent surface) | Parent PIN, PBKDF2-HMAC-SHA256 210k iterations + per-install salt; constant-time verify; persisted lockout (5 failures → 30s doubling to 15 min) survives process death | `ParentPinManagerTest` (5 tests) |
| PIN/password exposure via storage | PinRecord = salt+hash+counter only; never plaintext; length band 4..8 enforced at set-time | hash test |
| Backup exfiltration of child data | allowBackup=false + fullBackupContent=false + API-31+ dataExtractionRules excluding cloud-backup AND device-transfer for ALL domains; BackupPolicyController v1 (`backup-policy:v1-none`) is the single policy source asserted by the foundation verifier | manifest assertions |
| Debug content/trust leaking into release | src/debug compile-time separation; R10 static rule bans debug types (St07VerticalSlice/St07EphemeralKeys/DebugSt07) outside src/debug; release trust set = EMPTY (proven by the P8 release test) | module-graph R10 + P8 release test |
| PII in logs/crash metadata | SafeAppLogger (sensitive KEY rejection) + SafeDiagnostics VALUE scan (phone/PIN-shape/email + sensitive key names) | privacy tests |
| Data retention beyond erasure | PrivacyDataController: one orchestrated wipe across Room rows, DataStore, checkpoints, content dirs — fail-safe (failures collected, wipe continues) | deletion tests |
| Accidental multi-profile state before O5 | LocalProfileManager.createSecondProfile throws; single slot only | O5 gate (documented; multi-profile integration test impossible by construction) |

## 2. Data inventory (every child-data location, post-P10)

| Data | Store | Cleared by PrivacyDataController? |
|---|---|---|
| Profile draft (name/avatar/grade) | DataStore (`PreferencesProfileDraftStore`) | ✓ via store wipe |
| Settings (avatar/motion) | DataStore (`PreferencesSettingsStore`) | ✓ |
| Lesson checkpoints | DataStore (`PreferencesLessonCheckpointStore`) | ✓ |
| Tokens (until Phase-2 O3 removal) | DataStore (`PreferencesTokenStore`) | ✓ |
| Room: sessions/attempts/progress/outbox/packages/audio/migration | Room v3 | ✓ (via store wipe on the DB) |
| Package staging/pointer | files/content/ | ✓ (dir wipe) |
| Slice checkpoints (debug) | files/slice-checkpoints/ | ✓ (dir wipe) |
| Audio/image binaries | delivered=false today | ✓ (dir wipe when they arrive) |
| Keystore | evaluated: NOT needed yet — PBKDF2 needs no key; Keystore becomes mandatory only if an O1/O2 decision introduces secret material needing hardware protection | evaluation recorded |

## 3. Security component contracts

| Component | Contract |
|---|---|
| `ParentPinManager` | setPin/verify/isConfigured/clearPin over an injected `PinStore`; `VerifyResult(ok, lockedForMs)`; policy `parent-pin-policy:v1` |
| `LocalProfileManager` | save/read/delete over `ProfileSlotStore`; name length 1..40; O5 refusal on multi-profile |
| `PrivacyDataController` | `deleteAllChildData(): WipeResult(cleared[], failures[])` over injected stores+dirs; fail-safe ordering |
| `BackupPolicyController` | `current(): Policy` — the manifest asserts against this declaration |
| `SafeDiagnostics` | `containsPii(value)` + `scan(payload)` — value-side PII scan complementing the logger's key-side guard |
| `DeviceKeyManager` | **evaluated: not needed yet** — PIN uses PBKDF2 (no secret key material); Keystore enters only when O1/O2 ship secret-bearing data (recorded decision point) |

## 4. Privacy Policy implications (app-store-facing, for the owner's legal text)

- Child data collected: first-name/avatar/grade (device-only); interaction IDs + outcomes (device-only).
- No network transmission, no cloud backup, no analytics, no third-party SDKs, no ads, no identifiers shared.
- Erasure: uninstall OR the parent deletion flow (PrivacyDataController) — both real, tested.
- Recovery/restore across devices: NOT offered in v1 (ADR-0039 §5 accepted consequence; the parent surface must state it).
- Before store submission: the owner's privacy-policy text must reflect exactly this inventory.

## 5. What is deliberately NOT done

- No multi-profile schema/flow (O5 open — the seam refuses).
- No Room profile table (DataStore slot kept; migration happens with the O5 decision).
- No Android Keystore usage (evaluated; enters with O1/O2 secret material).
- No parent UI wiring of the PIN (component + tests shipped; the parent surface wiring is the owner's product phase).
- assembleRelease remains forbidden (HG-05) — the "Release APK audit" is served by the manifest privacy assertions + debug-isolation compile-time separation + R10 static rule.
