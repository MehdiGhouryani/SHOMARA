# ADR-0043 — Content Package Engine: trust chain, PROPOSED schema, security report

- **Date:** 2026-11-13
- **Status:** Engine ACCEPTED as infrastructure; **manifest schema = PROPOSED (DRAFT)** — field names are NOT final until owner decision **O2** (format) and **O7** (size budget) are approved. No fabricated content format is finalized while O1/O2 remain open (owner P5-mission constraint). No content ships: release and debug assets contain zero packages (debug fixtures exist only inside tests with ephemeral keys).
- **Decision owner:** project owner (engine = engineering; schema finalization = O2/O7)
- **Related:** ADR-0039 §4 (package format proposal), ADR-0042 (durable registry v2 migration), gap G-13/G-14 in `INFRASTRUCTURE_GAP_REGISTER_FA.md`
- **Evidence:** `harness/WORKLOG.md` IPA-P5 — 33 tests green (engine security matrix + activation lifecycle + real v1→v2 migration), android:gate PASS, module-graph R8 rules.

## 1. Trust chain (normative for the engine)

```text
manifest.sig (ECDSA P-256 / SHA-256, keyId ∈ TrustedPackageKeys)
   covers the EXACT bytes of manifest.json
      → manifest declares every file (path, sizeBytes, sha256)
         → every file verified byte-by-byte on disk (size + SHA-256 + no undeclared files)
            → activation = full verification of the STAGED bytes → atomic pointer flip → registry commit
               → previous package preserved for rollback (never deleted by activation)
```

- **SHA-256 = integrity; signature = authenticity.** They are never conflated (mission rule). A valid signature does NOT hide answer keys — the answer-key boundary remains O1's separate decision; no answer/evaluator field exists anywhere in this engine (ForbiddenFieldGuard stays upstream in the repositories).
- **Trust anchors:** `TrustedPackageKeys` — keyId → PublicKey (EC P-256). `production()` is EMPTY (fail-closed: every package rejected) until the owner pins the production public key through the release process. **Private signing keys never enter the APK, Git, logs or shared dev environments** — all test keys are generated ephemerally in-test.
- **Load path is network-free by construction** — R8 static rule bans `java.net`/`okhttp3`/`javax.net` in `:core:contentpackage`; airplane mode is the normal state (ADR-0039).

## 2. PROPOSED manifest schema v1 (DRAFT — O2 to finalize)

```json
{
  "packageId": "shomara-core",            // ^[a-z0-9][a-z0-9.-]{1,63}$
  "packageVersion": 1,
  "schemaVersion": 1,                     // engine supports exactly 1 today
  "minAppVersion": "0.1.0",               // numeric-dot compare; newer = rejected
  "stations": ["ST07"],                   // ^ST[0-9]{2}$
  "files": [
    { "path": "stations/ST07.json",       // roots: stations/ audio/ images/ — traversal-proof
      "sizeBytes": 123,
      "sha256": "<64 lowercase hex>" }
  ],
  "signing": { "keyId": "prod-1", "algorithm": "SHA256withECDSA" }
}
```
`manifest.sig` = `{"keyId","algorithm","signature"(base64 DER ECDSA)}` detached, covering manifest bytes verbatim.
**PROPOSED limits (guards, not the O7 budget):** manifest ≤ 256 KiB, files ≤ 10,000, single file ≤ 8 MiB, total ≤ 64 MiB, strict JSON structure, duplicate-path rejection, undeclared-file rejection (metadata files `manifest.json`/`manifest.sig` exempt).
**Lifecycle evidence:** the O2-final schema must add the approval/publishing evidence field (APPROVED+evidence per the content pipeline) — recorded as the O2 gating requirement; the engine refuses anything beyond its known schema version regardless.

## 3. Security report — mission steps mapped to implementation + tests

| # | Mission step | Implementation | Test |
|---|---|---|---|
| 1 | Safe parse + size/depth/count limits | `PackageManifestParser` (size cap before parse; strict structure; file count/path/algorithm validation) | oversize manifest/single-file; hostile paths |
| 2 | Schema validation | strict field/shape checks in parser + `ContentPackageValidator` | unsupported schemaVersion rejected |
| 3 | Signature vs trusted key | `PackageSignatureVerifier` (ECDSA P-256/SHA-256, keyId lookup) | valid sig; wrong key; unknown keyId; tampered manifest bytes |
| 4 | Per-file hash + byte length | `PackageIntegrityVerifier` | missing file; tampered file bytes |
| 5 | References + station/asset existence | validator (stations↔files roots); resolvers return honest Absent | stations-without-files rejected; resolver Absent |
| 6 | minAppVersion/schema compatibility | `ContentPackageValidator.compareVersions` | newer minAppVersion rejected |
| 7 | Stage to temp | `ContentPackageActivator.stage` (candidate verified FIRST, staged bytes RE-verified) | tampered candidate never reaches staging |
| 8 | Atomic activation | pointer write-temp+rename; registry transaction | pointer flip proven; registry ACTIVE |
| 9 | Previous version kept + rollback | staging dirs never deleted by activation; `PackageRollbackManager` | crash-between-stage-and-flip keeps previous serving; rollback restores pointer + marks FAILED |
| 10 | Corruption without unrecoverable crash | every stage throws typed exceptions (ManifestFormat/Signature/Integrity/Compatibility) — caller surfaces honest recovery; Robolectric divergence documented in ADR-0042 (device corruption proof → instrumented phase) | typed failures asserted throughout |

Additional tests: **deterministic build** (same inputs → byte-identical manifest+files; ECDSA signature itself is randomized per-run — documented), **empty production trust slot rejects everything** (fail-closed), **no-fake-content** (release+debug assets contain zero packages; fixtures exist only in tests).

## 4. Test vectors (committed via the test suite)

`PackageEngineSecurityTest` + `ContentPackageActivationTest` + `LearningDatabaseMigrationTest` constitute the executable vector set: valid/wrong-key/unknown-key/tampered-manifest/tampered-file/missing-file/duplicate-path/traversal(`..`,`\`,absolute,empty-segment)/oversize/unsupported-schema/minAppVersion/first-activation-rollback/crash-between-steps/deterministic-build/v1→v2 row-preserving migration with schema validation against exported 2.json.

## 5. What is deliberately NOT done (until decisions land)

- **No O2-final schema, no real package shipped** — the engine is exercised exclusively by ephemeral-key test fixtures.
- **No answer-key storage** — O1 untouched; ForbiddenFieldGuard continues to reject such payloads upstream.
- **No wiring into app startup** — activation hooks into launch when real approved content exists (P7, post-O2/O7 + content pipeline).
- **No cleanup of superseded staging dirs** (deliberate maintenance op — recorded debt), no key-rotation ceremony (pinned-key map supports rotation; the rotation ADR arrives with O2), no device-level corruption proof (instrumented phase).
