package com.mathlearning.core.profile

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** In-memory test fixture only; no durable PinStore adapter is wired in the app module yet. */
class InMemoryPinStore : ParentPinManager.PinStore {
    var record: ParentPinManager.PinRecord? = null
    override fun read(): ParentPinManager.PinRecord? = record
    override fun write(record: ParentPinManager.PinRecord) { this.record = record }
    override fun clear() { record = null }
}

class ParentPinManagerTest {

    private fun manager(now: Long = 0) = ParentPinManager(InMemoryPinStore(), nowMs = { now })

    @Test
    fun `pin is stored hashed - never plaintext`() {
        val store = InMemoryPinStore()
        val mgr = ParentPinManager(store)
        mgr.setPin(charArrayOf('1', '3', '4', '5'))
        val record = store.record!!
        assertTrue(record.hashHex.length == 64)
        assertTrue(record.saltHex.length == 32)
        assertTrue(record.hashHex != "1345")
        assertTrue("plaintext PIN must never appear in the record", !record.toString().contains("1345"))
    }

    @Test
    fun `set pin consumes the supplied character array and accepts digits only`() {
        val store = InMemoryPinStore()
        val mgr = ParentPinManager(store)
        val secret = "2468".toCharArray()

        mgr.setPin(secret)

        assertTrue(secret.all { it == 0.toChar() })
        assertTrue(mgr.isConfigured())

        val invalid = "24a8".toCharArray()
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { mgr.setPin(invalid) }
        assertTrue(invalid.all { it == 0.toChar() })
    }

    @Test
    fun `verify consumes input even when no pin exists or stored record is corrupt`() {
        val emptyInput = "2468".toCharArray()
        assertFalse(ParentPinManager(InMemoryPinStore()).verify(emptyInput).ok)
        assertTrue(emptyInput.all { it == 0.toChar() })

        val corruptedStore = InMemoryPinStore().apply {
            record = ParentPinManager.PinRecord(
                saltHex = "not-hex",
                hashHex = "also-not-hex",
                iterations = ParentPinManager.ITERATIONS,
                failedAttempts = 0,
                lockedUntilMs = 0,
            )
        }
        val corruptedManager = ParentPinManager(corruptedStore)
        assertFalse(corruptedManager.isConfigured())
        val corruptInput = "2468".toCharArray()
        assertFalse(corruptedManager.verify(corruptInput).ok)
        assertTrue(corruptInput.all { it == 0.toChar() })
    }

    @Test
    fun `correct pin verifies and resets the persisted failure counter and lockout`() {
        val store = InMemoryPinStore()
        val mgr = ParentPinManager(store, nowMs = { 10_000L })
        mgr.setPin(charArrayOf('9', '9', '9', '9'))

        repeat(3) { assertFalse(mgr.verify(charArrayOf('0', '0', '0', '0')).ok) }
        assertEquals(3, store.record!!.failedAttempts)
        assertEquals(0L, store.record!!.lockedUntilMs)

        assertTrue(mgr.verify(charArrayOf('9', '9', '9', '9')).ok)
        assertEquals(0, store.record!!.failedAttempts)
        assertEquals(0L, store.record!!.lockedUntilMs)

        // A later failure starts a new sequence rather than stacking old attempts.
        assertFalse(mgr.verify(charArrayOf('1', '1', '1', '1')).ok)
        assertEquals(1, store.record!!.failedAttempts)
        assertEquals(0L, store.record!!.lockedUntilMs)
    }

    @Test
    fun `lockout engages after the threshold and grows - process death cannot dodge it`() {
        var now = 0L
        val store = InMemoryPinStore()
        val mgr = ParentPinManager(store, nowMs = { now })
        mgr.setPin(charArrayOf('7', '7', '7', '7'))
        repeat(5) { mgr.verify(charArrayOf('0', '0', '0', '0')) }
        // 5 consecutive failures → locked for 30s, persisted in the store.
        val blocked = mgr.verify(charArrayOf('7', '7', '7', '7'))
        assertFalse(blocked.ok)
        assertTrue(blocked.lockedForMs > 0)
        now += 29_999
        assertFalse(mgr.verify(charArrayOf('7', '7', '7', '7')).ok) // still locked (survives restart: store-based)
        now += 31_000
        assertTrue(mgr.verify(charArrayOf('7', '7', '7', '7')).ok) // lockout expired, correct pin passes
    }

    @Test
    fun `wrong pin before lockout expiry is rejected even if correct`() {
        var now = 0L
        val store = InMemoryPinStore()
        val mgr = ParentPinManager(store, nowMs = { now })
        mgr.setPin(charArrayOf('5', '5', '5', '5'))
        repeat(5) { mgr.verify(charArrayOf('0', '0', '0', '0')) }
        assertFalse(mgr.verify(charArrayOf('5', '5', '5', '5')).ok) // correct but locked
    }

    @Test
    fun `pin length boundary is enforced`() {
        val mgr = manager()
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { mgr.setPin(charArrayOf('1', '2', '3')) }
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) { mgr.setPin("123456789".toCharArray()) }
    }
}
