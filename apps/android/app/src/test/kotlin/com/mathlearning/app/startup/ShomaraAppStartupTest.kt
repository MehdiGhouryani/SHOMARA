package com.mathlearning.app.startup

import com.mathlearning.app.di.AppGraph
import com.mathlearning.core.common.logging.AppLogEvent
import com.mathlearning.core.common.logging.AppLogger
import com.mathlearning.core.common.logging.LogLevel
import com.mathlearning.core.common.scope.ShomaraScopes
import com.mathlearning.core.database.LocalLearningDatabase
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.datastore.ShomaraSettingsStore
import com.mathlearning.core.network.LessonGateway
import com.mathlearning.feature.lesson.ShomaraDiscoverStep
import com.mathlearning.feature.lesson.ShomaraGuidedEvaluator
import com.mathlearning.feature.lesson.ShomaraGuidedItem
import com.mathlearning.feature.onboarding.ShomaraAuthSession
import com.mathlearning.sync.OutboxSyncEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.test.StandardTestDispatcher
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * JVM contract tests for the startup rule (ADR-0041): essential steps run ordered and never kill
 * the process; deferred steps are registered but NEVER executed at launch (startup must not wait
 * on content/audio/CMS work).
 */
class ShomaraAppStartupTest {

    private class RecordingLogger : AppLogger {
        val events = mutableListOf<AppLogEvent>()
        override fun log(level: LogLevel, event: AppLogEvent) {
            events += event
        }
    }

    /** Touching any unneeded graph member throws loudly — proving steps stay in their lane. */
    private class BoomGraph(override val logger: AppLogger) : AppGraph {
        override val authSession: ShomaraAuthSession get() = throw AssertionError("startup touched the session")
        override val profileDraftStore: ShomaraProfileDraftStore get() = throw AssertionError("startup touched the draft store")
        override val lessonCheckpointStore: LessonCheckpointStore get() = throw AssertionError("startup touched checkpoints")
        override val lessonDiscoverSteps: List<ShomaraDiscoverStep> get() = throw AssertionError("startup touched lesson content")
        override val lessonGuidedItems: List<ShomaraGuidedItem> get() = throw AssertionError("startup touched lesson content")
        override val lessonGuidedEvaluator: ShomaraGuidedEvaluator? get() = throw AssertionError("startup touched the evaluator")
        override val lessonPreviewAdvance: Boolean get() = throw AssertionError("startup touched lesson wiring")
        override val lessonGateway: LessonGateway get() = throw AssertionError("startup touched the gateway")
        override val localDatabase: LocalLearningDatabase get() = throw AssertionError("startup touched the database")
        override val outboxSyncEngine: OutboxSyncEngine get() = throw AssertionError("startup touched sync")
        override val settingsStore: ShomaraSettingsStore get() = throw AssertionError("startup touched settings")
        override val simulatedAuthEnabled: Boolean get() = throw AssertionError("startup touched auth wiring")
        override fun isBackendConfigured(): Boolean = throw AssertionError("startup probed the backend")
        override val applicationScope: CoroutineScope = ShomaraScopes.applicationScope(StandardTestDispatcher())
        override val startup: ShomaraAppStartup get() = throw AssertionError("startup read itself")
    }

    @Test
    fun `essential steps run in order and deferred steps are never executed at launch`() {
        val logger = RecordingLogger()
        val graph = BoomGraph(logger)
        val executed = mutableListOf<String>()

        val startup = ShomaraAppStartup(
            essential = listOf(
                ShomaraStartupStep("first") { executed += "first" },
                ShomaraStartupStep("second") { executed += "second" },
            ),
            deferred = listOf(
                ShomaraStartupStep("deferred-never-at-launch") { throw AssertionError("deferred step ran at startup") },
            ),
            logger = logger,
        )

        startup.onApplicationCreate(graph)

        assertEquals(listOf("first", "second"), executed)
        assertEquals(listOf("deferred-never-at-launch"), startup.deferredStepIds())
        assertTrue(logger.events.none { it.name == "startup.essential.failed" })
    }

    @Test
    fun `a failing essential step is logged and swallowed without killing launch`() {
        val logger = RecordingLogger()
        val executed = mutableListOf<String>()
        val startup = ShomaraAppStartup(
            essential = listOf(
                ShomaraStartupStep("explodes") { throw IllegalStateException("diagnostic step failed") },
                ShomaraStartupStep("still-runs") { executed += "still-runs" },
            ),
            deferred = emptyList(),
            logger = logger,
        )

        startup.onApplicationCreate(BoomGraph(logger))

        assertEquals(listOf("still-runs"), executed)
        assertEquals(listOf("startup.essential.failed"), logger.events.map(AppLogEvent::name))
        assertEquals("explodes", logger.events.single().attributes["step"])
    }
}
