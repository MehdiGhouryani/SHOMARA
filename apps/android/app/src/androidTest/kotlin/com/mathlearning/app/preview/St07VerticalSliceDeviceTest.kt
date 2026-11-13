package com.mathlearning.app.preview

import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.mathlearning.core.database.ShomaraLearningDatabase
import com.mathlearning.core.database.repo.RoomContentPackageRegistryRepository
import com.mathlearning.core.database.repo.RoomLessonRecordRepository
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/**
 * DEVICE evidence (P8): the vertical-slice chain runs ON the emulator — signed draft package
 * (ephemeral debug trust) → activator → loader → projection → engine → debug evaluator → Room v3
 * attempts → checkpoint. After this test, the on-device DB and content dirs are inspectable
 * (run-as) — the persistence is real, not in-memory.
 */
@RunWith(AndroidJUnit4::class)
class St07VerticalSliceDeviceTest {

    @Test
    fun deviceChainRunsEndToEnd() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        val db = ShomaraLearningDatabase.build(context, "slice-device.db")
        val contentRoot = File(context.filesDir, "slice-content").apply { mkdirs() }
        val report = St07VerticalSlice.run(
            context,
            contentRoot,
            RoomLessonRecordRepository(db),
            RoomContentPackageRegistryRepository(db),
        )
        assertEquals(11, report.attempts)
        assertEquals(4, report.correct)
        assertEquals(4, report.gaps)
        assertTrue(report.steps.any { it.startsWith("activation: ACTIVE v1") })
        assertTrue(report.steps.any { it.startsWith("resume: resumed at") })
        db.close()
    }
}
