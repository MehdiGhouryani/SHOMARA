package com.mathlearning.app.di

import android.content.Context
import android.util.Log
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import com.mathlearning.core.common.logging.AppLogEvent
import com.mathlearning.core.common.logging.AppLogger
import com.mathlearning.core.common.logging.LogLevel
import com.mathlearning.core.common.logging.LogSink
import com.mathlearning.core.common.logging.SafeAppLogger
import com.mathlearning.core.database.LocalLearningDatabase
import com.mathlearning.core.datastore.LessonCheckpointStore
import com.mathlearning.core.datastore.PreferencesLessonCheckpointStore
import com.mathlearning.core.datastore.PreferencesProfileDraftStore
import com.mathlearning.core.datastore.PreferencesSettingsStore
import com.mathlearning.core.datastore.PreferencesTokenStore
import com.mathlearning.core.datastore.ShomaraProfileDraftStore
import com.mathlearning.core.datastore.ShomaraSettingsStore
import com.mathlearning.app.startup.ShomaraAppStartup
import com.mathlearning.app.startup.ShomaraStartupStep
import com.mathlearning.core.common.scope.ShomaraScopes
import com.mathlearning.core.network.LessonGateway
import com.mathlearning.core.network.ShomaraOtpApi
import com.mathlearning.feature.lesson.ShomaraDiscoverStep
import com.mathlearning.feature.lesson.ShomaraGuidedEvaluator
import com.mathlearning.feature.lesson.ShomaraGuidedItem
import com.mathlearning.core.network.ShomaraOtpEndpoints
import com.mathlearning.core.network.ShomaraOtpProvider
import com.mathlearning.feature.onboarding.ShomaraAuthSession
import com.mathlearning.feature.onboarding.ShomaraRealOtpProvider
import com.mathlearning.sync.OutboxSyncEngine
import kotlinx.coroutines.CoroutineScope
import java.io.File

interface AppContainer {
    val logger: AppLogger
    val authSession: ShomaraAuthSession
    val profileDraftStore: ShomaraProfileDraftStore
    val lessonCheckpointStore: LessonCheckpointStore

    /** N08R-08: discover preview steps (debug wiring only; release empty). */
    val lessonDiscoverSteps: List<ShomaraDiscoverStep>

    /** N08R-09: guided items + debug-only evaluator (release: empty + null). */
    val lessonGuidedItems: List<ShomaraGuidedItem>
    val lessonGuidedEvaluator: ShomaraGuidedEvaluator?

    /** N08R-09: preview stage-advance — true ONLY when the debug wiring supplied content. */
    val lessonPreviewAdvance: Boolean
    val lessonGateway: LessonGateway
    val localDatabase: LocalLearningDatabase
    val outboxSyncEngine: OutboxSyncEngine

    /** Persisted child preferences (N08-04): avatar + reduced motion, real DataStore. */
    val settingsStore: ShomaraSettingsStore

    /**
     * N08-15: true only in a DEBUG build. The launch gate uses it to label the simulated OTP flow
     * on screen; release builds always report false, so the label can never appear in production.
     */
    val simulatedAuthEnabled: Boolean

    /** True when a real OTP backend is configured for this build (ADR-0037 I2). */
    fun isBackendConfigured(): Boolean
}

/**
 * Runtime endpoint configuration (ADR-0037 L10): the API base URL is injected at runtime and
 * never committed. It stays null until the owner configures the production backend (ADR-0037
 * I2); every auth call then fails closed with a configuration error, never a network attempt.
 */
object ShomaraRuntimeConfig {
    @Volatile
    var otpEndpoints: ShomaraOtpEndpoints? = null

    @Volatile
    var lessonSubmitUrl: String? = null
}

class DefaultAppContainer(
    context: Context,
    /**
     * Injected by the build type: `true` only for debug. Kept as a constructor parameter (not a
     * `BuildConfig` read inside the container) so the release path is provably the default.
     */
    private val debugBuild: Boolean = false,
    /** DEBUG-only provider factory; null in release, so no simulated code path can be reached. */
    private val debugOtpProvider: ((ShomaraOtpApi) -> ShomaraOtpProvider)? = null,
    /** N08R-08: discover preview steps — non-empty ONLY from the debug variant wiring. */
    private val discoverSteps: List<ShomaraDiscoverStep> = emptyList(),
    /** N08R-09: guided preview items + debug evaluator — non-null ONLY in the debug variant. */
    private val guidedItems: List<ShomaraGuidedItem> = emptyList(),
    private val guidedEvaluator: ShomaraGuidedEvaluator? = null,
) : AppGraph {
    override val logger: AppLogger = SafeAppLogger(AndroidLogSink)

    // P3 (ADR-0041): the ONE application-lifetime scope — SupervisorJob, process-owned, never
    // cancelled by hand. Feature/screen scopes are NOT owned here.
    override val applicationScope: CoroutineScope = ShomaraScopes.applicationScope()

    // P3 (ADR-0041): a dedicated, owned scope for the preference stores (SupervisorJob + IO) so
    // store I/O has its own pool instead of the previous anonymous `CoroutineScope(Dispatchers.IO)`.
    private val dataStoreScope: CoroutineScope = ShomaraScopes.dataStoreScope()

    override val startup: ShomaraAppStartup = ShomaraAppStartup(
        essential = listOf(
            ShomaraStartupStep(id = "log-runtime-mode") { graph ->
                graph.logger.log(
                    LogLevel.INFO,
                    AppLogEvent(
                        name = "startup.runtime-mode",
                        attributes = mapOf(
                            "variant" to if (graph.simulatedAuthEnabled) "debug-preview" else "release",
                            "backend" to if (graph.isBackendConfigured()) "configured" else "offline",
                        ),
                    ),
                )
            },
        ),
        // No deferred steps exist yet — content package/audio/CMS work is Phase 4+ and
        // owner-decision-gated (O2); startup never waits on it (ADR-0041).
        deferred = emptyList(),
        logger = SafeAppLogger(AndroidLogSink),
    )

    private val dataStore = PreferenceDataStoreFactory.create(
        scope = dataStoreScope,
        produceFile = { File(context.filesDir, "shomara_auth.preferences_pb") },
    )

    private val realOtpApi: ShomaraOtpApi = ShomaraOtpApi(
        client = ShomaraOtpApi.defaultClient(),
        endpoints = { ShomaraRuntimeConfig.otpEndpoints },
    )

    /**
     * N08-15: the provider is the ONLY difference between the debug and release auth paths. The
     * session orchestrator, the token store, the throttle and every fail-closed rule are identical.
     */
    private val otpProvider: ShomaraOtpProvider =
        if (debugBuild) debugOtpProvider?.invoke(realOtpApi) ?: ShomaraRealOtpProvider(realOtpApi)
        else ShomaraRealOtpProvider(realOtpApi)

    override val simulatedAuthEnabled: Boolean = debugBuild && otpProvider.isSimulated

    override fun isBackendConfigured(): Boolean = ShomaraRuntimeConfig.otpEndpoints != null

    override val authSession: ShomaraAuthSession = ShomaraAuthSession(
        api = otpProvider,
        store = PreferencesTokenStore(dataStore),
        // A simulated credential is accepted only when this build is debug AND the provider is the
        // simulated one. Release builds pass false and therefore reject it (fail closed).
        allowSimulated = debugBuild && otpProvider.isSimulated,
    )

    override val profileDraftStore: ShomaraProfileDraftStore = PreferencesProfileDraftStore(dataStore)

    override val lessonCheckpointStore: LessonCheckpointStore = PreferencesLessonCheckpointStore(dataStore)

    // N08R-08: debug-only discover preview (ST07 P1 DRAFT structure); release is empty.
    override val lessonDiscoverSteps: List<ShomaraDiscoverStep> = discoverSteps

    // N08R-09: guided preview items + the debug-only draft evaluator (release empty/null).
    override val lessonGuidedItems: List<ShomaraGuidedItem> = guidedItems
    override val lessonGuidedEvaluator: ShomaraGuidedEvaluator? = guidedEvaluator
    override val lessonPreviewAdvance: Boolean = discoverSteps.isNotEmpty() || guidedItems.isNotEmpty()

    override val settingsStore: ShomaraSettingsStore = PreferencesSettingsStore(dataStore)

    override val lessonGateway: LessonGateway = LessonGateway(
        client = ShomaraOtpApi.defaultClient(),
        submitUrl = { ShomaraRuntimeConfig.lessonSubmitUrl },
    )

    override val localDatabase: LocalLearningDatabase = LocalLearningDatabase()

    override val outboxSyncEngine: OutboxSyncEngine = OutboxSyncEngine(
        db = localDatabase,
        transport = { _, _ ->
            // Wire the real HTTP transport when the backend lands (I2); until then every send
            // is retriable so operations stay queued and are never lost.
            com.mathlearning.sync.SyncTransportResult.Retriable("backend not configured (I2)")
        },
    )
}

private data object AndroidLogSink : LogSink {
    override fun write(level: LogLevel, event: AppLogEvent) {
        val metadataKeys = event.attributes.keys.sorted().joinToString(prefix = "[", postfix = "]")
        val message = "${event.name} keys=$metadataKeys"
        when (level) {
            LogLevel.DEBUG -> Log.d(TAG, message)
            LogLevel.INFO -> Log.i(TAG, message)
            LogLevel.WARN -> Log.w(TAG, message)
            LogLevel.ERROR -> Log.e(TAG, message)
        }
    }

    private const val TAG = "SHOMARA"
}