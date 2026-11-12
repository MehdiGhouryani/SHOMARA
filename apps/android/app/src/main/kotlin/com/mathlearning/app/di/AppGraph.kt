package com.mathlearning.app.di

import com.mathlearning.app.startup.ShomaraAppStartup
import kotlinx.coroutines.CoroutineScope

/**
 * AppGraph (P3 native infrastructure, ADR-0041) — the explicit composition root CONTRACT.
 *
 * `DefaultAppContainer` remains the single implementation; `AppGraph` names the ownership rules
 * the container must satisfy:
 *  - [applicationScope]: the ONE application-lifetime coroutine scope (SupervisorJob), created
 *    through `ShomaraScopes` and never cancelled by hand. Feature and screen scopes are NOT
 *    owned here — screens use `rememberCoroutineScope()`, I/O dispatchers are injected.
 *  - [startup]: the ordered startup contract (essential steps run in `onCreate`; deferred steps
 *    are registered but never execute at launch, so startup never waits on content/audio/CMS).
 */
interface AppGraph : AppContainer {
    val applicationScope: CoroutineScope
    val startup: ShomaraAppStartup
}
