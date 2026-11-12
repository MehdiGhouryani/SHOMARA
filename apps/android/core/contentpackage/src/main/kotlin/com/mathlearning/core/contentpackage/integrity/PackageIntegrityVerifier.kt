package com.mathlearning.core.contentpackage.integrity

import com.mathlearning.core.contentpackage.manifest.PackageFileEntry
import com.mathlearning.core.contentpackage.manifest.PackageIntegrityException
import java.io.File
import java.security.MessageDigest

/**
 * Security step 4 (owner P5 mission): byte-level integrity of EVERY declared file — exact
 * sizeBytes AND sha256 from the (signature-verified) manifest, against the actual bytes on disk.
 * Missing files, size drift, hash drift and unexpected EXTRA files all fail loudly.
 */
class PackageIntegrityVerifier {

    fun verify(root: File, files: List<PackageFileEntry>, declaredPaths: Set<String>) {
        if (!root.isDirectory) throw PackageIntegrityException("package root is not a directory: ${root.path}")
        val metadata = setOf("manifest.json", "manifest.sig") // signed package metadata, not content files
        val present = root.walkTopDown()
            .filter { it.isFile }
            .map { it.relativeTo(root).invariantSeparatorsPath }
            .toSet()
        val unexpected = (present - metadata) - declaredPaths
        if (unexpected.isNotEmpty()) {
            throw PackageIntegrityException("package contains undeclared files: ${unexpected.sorted().take(5)}")
        }
        for (entry in files) {
            val file = File(root, entry.path)
            if (!file.isFile) throw PackageIntegrityException("missing declared file: ${entry.path}")
            val bytes = file.readBytes()
            if (bytes.size.toLong() != entry.sizeBytes) {
                throw PackageIntegrityException("size mismatch for ${entry.path}: declared ${entry.sizeBytes}, actual ${bytes.size}")
            }
            val digest = MessageDigest.getInstance("SHA-256").digest(bytes)
                .joinToString("") { "%02x".format(it) }
            if (digest != entry.sha256) {
                throw PackageIntegrityException("sha256 mismatch for ${entry.path}: content does not match the verified manifest")
            }
        }
    }
}
