package com.mathlearning.app.di

import com.mathlearning.feature.lesson.ShomaraDiscoverStep
import com.mathlearning.feature.lesson.ShomaraGuidedEvaluator
import com.mathlearning.feature.lesson.ShomaraGuidedItem

/**
 * Release counterpart of `src/debug/.../LessonContentWiring.kt` (N08R-08): NO discover
 * content exists in release — the local content package is Phase 1 (O1/O2-gated), and no
 * draft ever ships. Fail-closed by construction.
 */
object LessonContentWiring {
    const val IsDebugBuild: Boolean = false

    val discoverSteps: List<ShomaraDiscoverStep> = emptyList()

    /** Release: no guided items, no evaluator — the guided skeleton stays fail-closed. */
    val guidedItems: List<ShomaraGuidedItem> = emptyList()

    val guidedEvaluator: ShomaraGuidedEvaluator? = null
}
