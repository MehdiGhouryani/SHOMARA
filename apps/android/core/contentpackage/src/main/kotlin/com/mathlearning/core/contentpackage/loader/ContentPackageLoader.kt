package com.mathlearning.core.contentpackage.loader

import com.mathlearning.core.contentpackage.manifest.ManifestSignatureEnvelope
import com.mathlearning.core.contentpackage.manifest.PackageManifest
import com.mathlearning.core.contentpackage.signing.PackageSignatureVerifier
import com.mathlearning.core.contentpackage.validation.ContentPackageValidator
import java.io.File

/** A fully verified package: signature-checked manifest + integrity-checked files on disk. */
data class VerifiedPackage(val manifest: PackageManifest, val root: File, val manifestSha256: String)

/**
 * Security steps 1–6 as ONE load pipeline (owner P5 mission): bounded parse → schema validation →
 * signature check → per-file hash/size → references/compatibility. Loading NEVER mutates the
 * active installation — mutation belongs to [ContentPackageActivator]. Pure local I/O: the load
 * path contains NO network code by construction (airplane mode is the normal state, ADR-0039).
 */
class ContentPackageLoader(
    private val signatureVerifier: PackageSignatureVerifier,
    private val validator: ContentPackageValidator,
) {

    fun loadFromDirectory(root: File): VerifiedPackage {
        val manifestFile = File(root, MANIFEST_FILE)
        val signatureFile = File(root, SIGNATURE_FILE)
        if (!manifestFile.isFile) throw com.mathlearning.core.contentpackage.manifest.PackageIntegrityException("missing ${MANIFEST_FILE}")
        if (!signatureFile.isFile) throw com.mathlearning.core.contentpackage.manifest.PackageIntegrityException("missing ${SIGNATURE_FILE}")

        val manifestBytes = manifestFile.readBytes()
        val manifest = com.mathlearning.core.contentpackage.manifest.PackageManifestParser.parse(manifestBytes)
        val envelope = com.mathlearning.core.contentpackage.manifest.PackageManifestParser.parseSignature(signatureFile.readBytes())

        signatureVerifier.verify(manifestBytes, envelope)
        validator.validate(manifest)
        com.mathlearning.core.contentpackage.integrity.PackageIntegrityVerifier()
            .verify(root, manifest.files, manifest.files.map { it.path }.toSet())

        val manifestSha = com.mathlearning.core.common.error.ContentChecksums.sha256Hex(manifestBytes)
        return VerifiedPackage(manifest, root, manifestSha)
    }

    companion object {
        const val MANIFEST_FILE: String = "manifest.json"
        const val SIGNATURE_FILE: String = "manifest.sig"
        const val POINTER_FILE: String = "active-pointer.json"
    }
}
