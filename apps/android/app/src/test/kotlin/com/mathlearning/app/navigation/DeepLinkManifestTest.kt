package com.mathlearning.app.navigation

import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * N08-05 regression guard: every deep link the NavHost registers must also be reachable by Android.
 *
 * The measured defect: `ShomaraApp` registers navDeepLink patterns for `onboarding`, `shell` and
 * `lesson/{stationId}`, while AndroidManifest.xml declared ONLY `mathlearning://foundation`. Android
 * therefore rejected the others at the OS level:
 *
 *   Error: Activity not started, unable to resolve Intent { act=VIEW
 *   dat=mathlearning://lesson/... pkg=com.mathlearning.app }
 *
 * A registered route with an undeclared host is a dead link, and nothing failed until someone tried
 * it. This test reads the real manifest so the drift breaks the build instead.
 */
class DeepLinkManifestTest {

    private fun manifest(): String {
        // Gradle runs unit tests with the module dir as working dir; walk up until the file exists.
        var dir: File? = File(".").absoluteFile
        while (dir != null) {
            val candidate = File(dir, "src/main/AndroidManifest.xml")
            if (candidate.isFile) return candidate.readText()
            val fromModule = File(dir, "app/src/main/AndroidManifest.xml")
            if (fromModule.isFile) return fromModule.readText()
            dir = dir.parentFile
        }
        throw IllegalStateException("AndroidManifest.xml not found from ${File(".").absolutePath}")
    }

    @Test
    fun `every registered deep link host is declared in the manifest`() {
        val text = manifest()
        // The hosts the app's NavHost patterns use.
        val expectedHosts = listOf("onboarding", "shell", "lesson", "foundation")
        for (host in expectedHosts) {
            assertTrue(
                "deep link host '$host' is registered in the NavHost but not declared in AndroidManifest.xml",
                text.contains("android:host=\"$host\""),
            )
        }
    }

    @Test
    fun `the view intent filter declares the mathlearning scheme`() {
        val text = manifest()
        assertTrue(
            "the scheme used by every deep link must be declared",
            text.contains("android:scheme=\"mathlearning\""),
        )
        assertTrue(text.contains("android.intent.action.VIEW"))
    }

    @Test
    fun `lesson deep links can carry a stationId path segment`() {
        // `mathlearning://lesson/ST07` must resolve: the host is declared, so any path under it
        // reaches the NavHost pattern "lesson/{stationId}".
        val text = manifest()
        assertTrue(text.contains("android:host=\"lesson\""))
        assertTrue(AppDestination.LESSON.deepLink.contains("{stationId}"))
    }
}