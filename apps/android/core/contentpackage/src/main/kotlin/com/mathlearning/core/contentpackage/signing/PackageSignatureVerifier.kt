package com.mathlearning.core.contentpackage.signing

import com.mathlearning.core.contentpackage.manifest.ManifestSignatureEnvelope
import com.mathlearning.core.contentpackage.manifest.SignatureVerificationException
import java.security.KeyFactory
import java.security.PublicKey
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import android.util.Base64

/**
 * The trust anchors for package authenticity (P5 engine). Public keys are safe to embed in the
 * APK — the PRIVATE signing key NEVER enters the APK, Git, logs or shared dev environments
 * (owner P5-mission rule); it lives with the owner's release process only.
 *
 * PRODUCTION SLOT: `production()` is intentionally EMPTY until the owner supplies the pinned
 * production public key (keyId + X.509/SubjectPublicKeyInfo bytes) through the release process.
 * An empty trust set rejects EVERY package (fail-closed) — the engine cannot be tricked into
 * accepting unsigned or self-signed content. Tests inject ephemeral keys via the constructor.
 */
class TrustedPackageKeys(private val keys: Map<String, PublicKey>) {

    fun key(keyId: String): PublicKey? = keys[keyId]

    fun trustedKeyIds(): Set<String> = keys.keys

    companion object {
        /** Fail-closed production slot: no trusted keys until the owner pins one. */
        fun production(): TrustedPackageKeys = TrustedPackageKeys(emptyMap())

        /** Decodes an X.509 SubjectPublicKeyInfo blob (EC P-256 expected for the proposed algorithm). */
        fun decodeX509(keyId: String, base64Der: String): Pair<String, PublicKey> {
            val spec = X509EncodedKeySpec(Base64.decode(base64Der, Base64.DEFAULT))
            val factory = KeyFactory.getInstance("EC")
            return keyId to factory.generatePublic(spec)
        }
    }
}

/**
 * Security step 3 (owner P5 mission): verify the DETACHED signature over the exact manifest
 * bytes with the trusted key named by the envelope. Signature ≠ SHA-256: hashes prove integrity
 * against the manifest; the signature proves WHO AUTHORED the manifest. A valid signature does
 * NOT hide answer keys — the answer-key boundary stays O1's separate decision (mission rule).
 */
class PackageSignatureVerifier(private val trustedKeys: TrustedPackageKeys) {

    fun verify(manifestBytes: ByteArray, envelope: ManifestSignatureEnvelope): PublicKey {
        val key = trustedKeys.key(envelope.keyId)
            ?: throw SignatureVerificationException("signing keyId '${envelope.keyId}' is not trusted (trusted: ${trustedKeys.trustedKeyIds()})")
        if (envelope.algorithm != com.mathlearning.core.contentpackage.manifest.PackageManifest.SUPPORTED_ALGORITHM) {
            throw SignatureVerificationException("unsupported signature algorithm: ${envelope.algorithm}")
        }
        val verifier = Signature.getInstance("SHA256withECDSA")
        verifier.initVerify(key)
        verifier.update(manifestBytes)
        val signatureBytes = try {
            Base64.decode(envelope.base64Signature, Base64.DEFAULT)
        } catch (e: IllegalArgumentException) {
            throw SignatureVerificationException("signature is not valid base64")
        }
        val valid = verifier.verify(signatureBytes)
        if (!valid) throw SignatureVerificationException("signature does not verify against trusted key '${envelope.keyId}'")
        return key
    }
}
