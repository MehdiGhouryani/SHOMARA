package com.mathlearning.app.preview

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.mathlearning.core.contentpackage.loader.ContentPackageActivator
import com.mathlearning.core.contentpackage.loader.ContentPackageLoader
import com.mathlearning.core.contentpackage.signing.PackageSignatureVerifier
import com.mathlearning.core.contentpackage.signing.TrustedPackageKeys
import com.mathlearning.core.contentpackage.validation.ContentPackageValidator
import com.mathlearning.core.database.ShomaraLearningDatabase
import com.mathlearning.core.database.repo.RoomContentPackageRegistryRepository
import com.mathlearning.core.database.repo.RoomLessonRecordRepository
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File

/**
 * The P8 vertical-slice chain proof over REAL SQLite + REAL filesystem (Robolectric):
 * signed draft package → activator → loader → projection → engine walk (P1..P5) → debug
 * evaluator layer → Room v3 attempts → checkpoint suspend/resume → honest gaps (T13/T01/T05
 * coverage + not-transcribed stages). Release stays fail-closed (no draft assets, empty trust).
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class St07VerticalSliceTest {

    private val context: Context = ApplicationProvider.getApplicationContext()

    @Test
    fun `the full chain runs end to end and persists every attempt`() = runBlocking {
        val db = ShomaraLearningDatabase.build(context, "slice-e2e.db")
        val contentRoot = File(context.filesDir, "slice-content").apply { mkdirs() }
        val report = St07VerticalSlice.run(
            context,
            contentRoot,
            RoomLessonRecordRepository(db),
            RoomContentPackageRegistryRepository(db),
        )
        // The chain's recorded steps prove every stage of the pipeline ran.
        assertTrue(report.steps.any { it.startsWith("draft-package:") })
        assertTrue(report.steps.any { it.startsWith("activation: ACTIVE v1") })
        assertTrue(report.steps.any { it.startsWith("load: verified manifest") })
        assertTrue(report.steps.any { it.startsWith("projection: guided items: 8") })
        assertTrue(report.steps.any { it.startsWith("p2-guided:") })
        assertTrue(report.steps.any { it.startsWith("p3-game: T05 pattern accepted=true") })
        assertTrue(report.steps.any { it.startsWith("p4-p5: stages not transcribed") })
        assertTrue(report.steps.any { it.startsWith("persistence: attempts persisted: 11") })
        assertTrue(report.steps.any { it.startsWith("resume: resumed at") })
        // Honest gaps: 4 T13/T01 items surfaced, 4 T15 evaluated.
        assertEquals(11, report.attempts) // 8 items + 3 wrong-then-retry sequences
        assertEquals(4, report.correct) // i01 first-try + 3 retries after warm feedback
        assertEquals(4, report.gaps) // T13/T01 await O1
        db.close()
    }

    @Test
    fun `force stop and resume - attempts survive a full reopen and the session record is durable`() = runBlocking {
        val first = ShomaraLearningDatabase.build(context, "slice-resume.db")
        val records = RoomLessonRecordRepository(first)
        St07VerticalSlice.run(context, File(context.filesDir, "slice-resume-content"), records, RoomContentPackageRegistryRepository(first))
        first.close() // force-stop simulation

        val second = ShomaraLearningDatabase.build(context, "slice-resume.db")
        val reopened = RoomLessonRecordRepository(second)
        assertEquals(11, reopened.attemptsFor("slice-st07").size)
        val stored = reopened.session("slice-st07")
        assertNotNull(stored)
        assertEquals("ST07", stored!!.stationId)
        assertEquals("learning-engine:v1", stored.engineRuleVersion)
        second.close()
    }

    @Test
    fun `corrupted active package fails the loader - the previous honest state is never faked`() = runBlocking {
        val db = ShomaraLearningDatabase.build(context, "slice-corrupt.db")
        val contentRoot = File(context.filesDir, "slice-corrupt-content").apply { mkdirs() }
        St07VerticalSlice.run(context, contentRoot, RoomLessonRecordRepository(db), RoomContentPackageRegistryRepository(db))
        // Corrupt the ACTIVE package's manifest after activation.
        val pointer = ContentPackageActivator.readPointer(contentRoot)!!
        val manifestFile = File(File(File(contentRoot, "staging"), pointer.dir), "manifest.json")
        manifestFile.writeText("garbage")
        val loader = ContentPackageLoader(PackageSignatureVerifier(St07VerticalSlice.debugTrust(St07EphemeralKeys.last!!)), ContentPackageValidator("0.1.0"))
        val thrown = runCatching { loader.loadFromDirectory(File(contentRoot, pointer.dir)) }.exceptionOrNull()
        assertNotNull("a corrupted active package must fail the load (fail-closed)", thrown)
        db.close()
    }

    @Test
    fun `unsupported content version is rejected at validation - draft drift cannot silently load`() {
        val validator = ContentPackageValidator(currentAppVersion = "0.1.0")
        val manifest = com.mathlearning.core.contentpackage.manifest.PackageManifestParser.parse(
            """
            {"packageId":"shomara-st07-draft","packageVersion":1,"schemaVersion":9,"minAppVersion":"0.1.0",
             "stations":["ST07"],"files":[],"signing":{"keyId":"debug-ephemeral","algorithm":"SHA256withECDSA"}}
            """.trimIndent().toByteArray(),
        )
        val thrown = runCatching { validator.validate(manifest) }.exceptionOrNull()
        assertTrue(thrown!!.message!!.contains("schemaVersion"))
    }

    @Test
    fun `release fail-closed - the empty production trust set rejects the draft package even if it leaked`() = runBlocking {
        val db = ShomaraLearningDatabase.build(context, "slice-release.db")
        val contentRoot = File(context.filesDir, "slice-release-content").apply { mkdirs() }
        // Build the draft package, then try to activate it against the PRODUCTION trust set.
        val keyPair = java.security.KeyPairGenerator.getInstance("EC").apply { initialize(256) }.generateKeyPair()
        val candidate = St07VerticalSlice.buildDraftPackage(context, File(context.filesDir, "slice-release-candidate"), keyPair)
        val activator = ContentPackageActivator(
            contentRoot = contentRoot,
            registry = RoomContentPackageRegistryRepository(db),
            signatureVerifier = PackageSignatureVerifier(TrustedPackageKeys.production()),
            validator = ContentPackageValidator("0.1.0"),
        )
        val thrown = runCatching { activator.stage(candidate) }.exceptionOrNull()
        assertNotNull("release trust (empty) must reject the draft package", thrown)
        assertNull(ContentPackageActivator.readPointer(contentRoot))
        assertFalse(File(contentRoot, "active-pointer.json").exists())
        db.close()
    }
}

