package com.mathlearning.core.common.scope

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineName
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

/**
 * Scope ownership contract (P3 native infrastructure, ADR-0041):
 *
 *  - APPLICATION scope: created ONCE per process by the composition root (`AppGraph`), survives
 *    configuration changes, dies with the process. SupervisorJob — one failing child must not
 *    cancel siblings. Never cancelled by hand.
 *  - FEATURE scope: none. Features never create their own global scopes; screen-scoped work uses
 *    the composition's `rememberCoroutineScope()` (cancelled with the UI) and I/O dispatchers are
 *    ALWAYS injected, never discovered (`Dispatchers.Main` in main sources is verifier-banned).
 *  - DATASTORE scope: a dedicated `SupervisorJob + Dispatchers.IO` scope owned by the graph for
 *    the preference stores — separate from the general application scope so store I/O never
 *    competes with lifecycle work on the same dispatcher pool.
 */
object ShomaraScopes {

    fun applicationScope(dispatcher: CoroutineDispatcher = Dispatchers.Default): CoroutineScope =
        CoroutineScope(SupervisorJob() + dispatcher + CoroutineName("shomara-application"))

    fun dataStoreScope(dispatcher: CoroutineDispatcher = Dispatchers.IO): CoroutineScope =
        CoroutineScope(SupervisorJob() + dispatcher + CoroutineName("shomara-datastore"))
}
