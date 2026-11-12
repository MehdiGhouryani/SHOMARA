package com.mathlearning.core.common.state

import kotlin.coroutines.coroutineContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.StateFlow

/**
 * State-holder contract (P3 native infrastructure, ADR-0041).
 *
 *  - State is IMMUTABLE and observable: [StateFlow] of a value type; UI never mutates it.
 *  - Ownership is explicit: a state holder lives in an APPLICATION scope (e.g. launch state),
 *    a FEATURE scope, or a SCREEN scope (created with the composition, cancelled with it).
 *    A state holder must NEVER be a global singleton without a lifecycle owner — the verifier
 *    bans `GlobalScope` and feature modules may not create unowned scopes.
 *  - The UI renders [state] and emits events back (UDF); it never owns the truth.
 */
interface ShomaraStateHolder<S : Any> {
    val state: StateFlow<S>
}

/**
 * Per-key single-flight dispatcher: concurrent DUPLICATE operations collapse onto the running
 * one instead of stacking (the lesson host already enforced this ad-hoc for submissions — N08-05;
 * this is the shared, tested primitive). Cancellation-safe: a cancelled active job frees its key,
 * and the NEXT call starts fresh. Different keys never block each other.
 */
class SingleFlightExecutor(private val scope: CoroutineScope) {

    private val active = HashMap<String, Job>()

    /**
     * Starts [block] under [key], or returns `null` when an equivalent operation is already
     * running (the duplicate is dropped — callers must treat `null` as "already in flight").
     */
    fun <T> launch(key: String, block: suspend CoroutineScope.() -> T): Job? {
        synchronized(active) {
            if (active[key]?.isActive == true) return null
            val job = scope.launch {
                try {
                    block()
                } finally {
                    synchronized(active) {
                        val current = coroutineContext[Job]
                        if (current != null && active[key] === current) active.remove(key)
                    }
                }
            }
            active[key] = job
            return job
        }
    }

    fun isActive(key: String): Boolean = synchronized(active) { active[key]?.isActive == true }
}
