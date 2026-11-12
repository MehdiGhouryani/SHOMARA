package com.mathlearning.app.startup

import com.mathlearning.app.di.AppGraph
import com.mathlearning.core.common.logging.AppLogEvent
import com.mathlearning.core.common.logging.AppLogger
import com.mathlearning.core.common.logging.LogLevel

/**
 * One startup step. `id` is a stable diagnostic identifier; the executable must be O(ms) wiring —
 * file/network/content/audio/CMS work is FORBIDDEN here (ADR-0041). DataStores are created lazily
 * by the stores themselves on first collection, so startup performs no disk I/O by construction.
 */
class ShomaraStartupStep(
    val id: String,
    val execute: (AppGraph) -> Unit,
)

/**
 * ShomaraAppStartup (P3, ADR-0041) — the app's startup contract.
 *
 *  - ESSENTIAL steps run synchronously inside `Application.onCreate`; they wire and log, they
 *    never block on content/audio/CMS (offline content is bundled, and the package engine is a
 *    Phase-4 owner-decision-gated component — O2 — not a startup dependency).
 *  - DEFERRED steps are registered with an id and a lazy accessor; they are only started on
 *    first real use. `onApplicationCreate` never touches them.
 *  - A failing essential step is logged with its id and swallowed: startup must not crash the
 *    process for a diagnostic step (fail-open for diagnostics, fail-closed is for data).
 */
class ShomaraAppStartup(
    private val essential: List<ShomaraStartupStep>,
    private val deferred: List<ShomaraStartupStep>,
    private val logger: AppLogger,
) {

    fun onApplicationCreate(graph: AppGraph) {
        for (step in essential) {
            runCatching { step.execute(graph) }
                .onFailure {
                    logger.log(
                        LogLevel.WARN,
                        AppLogEvent(
                            name = "startup.essential.failed",
                            attributes = mapOf("step" to step.id),
                        ),
                    )
                    // The throwable is intentionally NOT rethrown: diagnostics must not kill launch.
                }
        }
    }

    /** Deferred ids are diagnostics only — execution belongs to the component that owns the step. */
    fun deferredStepIds(): List<String> = deferred.map { it.id }
}
