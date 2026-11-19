package com.mathlearning.core.designsystem

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Clay contract tests (P13): depth tiers resolve token specs; the four-tier order and the
 * visual progression are the ADR-0040 contract, asserted against the GENERATED token values.
 */
class ClayContractTest {

    @Test
    fun `four depth tiers resolve in ascending visual weight`() {
        val flat = ShomaraClay.specFor(ShomaraClayDepth.Flat)
        val hint = ShomaraClay.specFor(ShomaraClayDepth.Hint)
        val soft = ShomaraClay.specFor(ShomaraClayDepth.Soft)
        val featured = ShomaraClay.specFor(ShomaraClayDepth.Featured)
        assertTrue(flat.elevation <= hint.elevation)
        assertTrue(hint.elevation <= soft.elevation)
        assertTrue(soft.elevation <= featured.elevation)
        assertTrue(flat.borderWidth.value <= hint.borderWidth.value)
        assertTrue(hint.borderWidth.value <= soft.borderWidth.value)
        assertTrue(soft.borderWidth.value <= featured.borderWidth.value)
    }

    @Test
    fun `values come from generated tokens - no raw literals in the resolver`() {
        val tokenPairs = listOf(
            Triple(ShomaraClayDepth.Flat, ShomaraTokens.ClayFlatBorderWidth, ShomaraTokens.ClayFlatElevation),
            Triple(ShomaraClayDepth.Hint, ShomaraTokens.ClayHintBorderWidth, ShomaraTokens.ClayHintElevation),
            Triple(ShomaraClayDepth.Soft, ShomaraTokens.ClaySoftBorderWidth, ShomaraTokens.ClaySoftElevation),
            Triple(ShomaraClayDepth.Featured, ShomaraTokens.ClayFeaturedBorderWidth, ShomaraTokens.ClayFeaturedElevation),
        )
        tokenPairs.forEach { (depth, borderWidth, elevation) ->
            assertEquals(borderWidth, ShomaraClay.specFor(depth).borderWidth)
            assertEquals(elevation, ShomaraClay.specFor(depth).elevation)
        }
        assertEquals(ShomaraTokens.ClayHintShadowRadius, ShomaraClay.specFor(ShomaraClayDepth.Hint).shadowRadius)
        assertEquals(ShomaraTokens.ClaySoftShadowRadius, ShomaraClay.specFor(ShomaraClayDepth.Soft).shadowRadius)
    }

    @Test
    fun `flat tier has no shadow or border - text surfaces stay flat`() {
        val flat = ShomaraClay.specFor(ShomaraClayDepth.Flat)
        assertEquals(0.0, flat.shadowOpacity.toDouble(), 0.0)
        assertEquals(0.0f, flat.borderWidth.value, 0.0f)
        assertEquals(0.0f, flat.elevation.value, 0.0f)
    }

    // The PathKit path-node contract (redundant encoding, CURRENT-only FEATURED, LOCKED FLAT)
    // used to be asserted here against a parallel PathNode renderer that shipped emoji marks and
    // an amber Current node. PathKit is retired; the same contract now lives on the real renderer
    // and is asserted in feature:path (ShomaraPathGraphTest: depth, labels, white-on-accent).

}
