package com.mathlearning.core.common.state

import com.mathlearning.core.common.scope.ShomaraScopes
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancelChildren
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ShomaraStateHolderTest {

    /**
     * A screen-like scope the test OWNS (the pattern features must follow): an explicit Job over
     * the shared test scheduler — drained deterministically by [TestScope.advanceUntilIdle].
     * (`runTest.backgroundScope` does not drain on advanceUntilIdle in coroutines-test 1.8.)
     */
    private fun TestScope.ownedScope(): CoroutineScope =
        CoroutineScope(StandardTestDispatcher(testScheduler) + Job())

    @Test
    fun `duplicate operations collapse onto the running one and a completed key frees for the next`() = runTest {
        val scope = ownedScope()
        val executor = SingleFlightExecutor(scope)
        val release = CompletableDeferred<Unit>()
        var runs = 0

        val first = executor.launch("submit") {
            runs += 1
            release.await()
        }
        assertNotNull(first)
        advanceUntilIdle()
        assertEquals(1, runs)

        assertNull("a duplicate while the first is in flight must be dropped", executor.launch("submit") { })
        assertTrue(executor.isActive("submit"))

        release.complete(Unit)
        advanceUntilIdle()
        assertFalse(executor.isActive("submit"))

        val second = executor.launch("submit") { runs += 1 }
        assertNotNull("after completion a new operation must be allowed", second)
        advanceUntilIdle()
        assertEquals(2, runs)
        scope.coroutineContext.cancelChildren()
    }

    @Test
    fun `cancellation frees the key so the next operation starts fresh`() = runTest {
        val scope = ownedScope()
        val executor = SingleFlightExecutor(scope)
        val gate = CompletableDeferred<Unit>()

        val job = executor.launch("submit") { gate.await() }
        assertNotNull(job)
        advanceUntilIdle()

        job!!.cancel()
        advanceUntilIdle()

        assertFalse(executor.isActive("submit"))
        val next = executor.launch("submit") { }
        assertNotNull("a cancelled operation must not poison its key", next)
        advanceUntilIdle()
        scope.coroutineContext.cancelChildren()
    }

    @Test
    fun `different keys never block each other`() = runTest {
        val scope = ownedScope()
        val executor = SingleFlightExecutor(scope)
        val gate = CompletableDeferred<Unit>()

        val blocked = executor.launch("a") { gate.await() }
        assertNotNull(blocked)
        advanceUntilIdle()

        val independent = executor.launch("b") { }
        assertNotNull("an in-flight operation on key a must not block key b", independent)
        gate.complete(Unit)
        advanceUntilIdle()
        scope.coroutineContext.cancelChildren()
    }

    @Test
    fun `the application scope survives a failing child - supervisor semantics`() {
        val dispatcher = StandardTestDispatcher()
        val scope = ShomaraScopes.applicationScope(dispatcher)
        try {
            val siblingGate = CompletableDeferred<Unit>()
            scope.launch { throw IllegalStateException("child crash") }
            val sibling = scope.launch { siblingGate.await() }

            TestScope(dispatcher).advanceUntilIdle()

            assertTrue("supervisor scope must stay active after a child failure", scope.coroutineContext.isActive)
            assertTrue("a sibling must not be cancelled by an unrelated child failure", sibling.isActive)
        } finally {
            scope.coroutineContext.cancelChildren()
        }
    }
}
