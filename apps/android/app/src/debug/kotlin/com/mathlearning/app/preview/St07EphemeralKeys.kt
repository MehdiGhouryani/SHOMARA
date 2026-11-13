package com.mathlearning.app.preview

import java.security.KeyPair

/** Per-process holder of the last ephemeral debug keypair (debug main source; never in release). */
object St07EphemeralKeys {
    var last: KeyPair? = null
        private set

    fun capture(keyPair: KeyPair): KeyPair = keyPair.also { last = it }
}
