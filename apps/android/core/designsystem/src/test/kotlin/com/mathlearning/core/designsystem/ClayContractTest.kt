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
        val flat = ClaySpecResolver.specFor(ClayDepth.FLAT)
        val hint = ClaySpecResolver.specFor(ClayDepth.HINT)
        val soft = ClaySpecResolver.specFor(ClayDepth.SOFT)
        val featured = ClaySpecResolver.specFor(ClayDepth.FEATURED)
        assertTrue(flat.elevation <= hint.elevation)
        assertTrue(hint.elevation <= soft.elevation)
        assertTrue(soft.elevation <= featured.elevation)
        assertTrue(flat.borderWidth.value <= hint.borderWidth.value)
        assertTrue(hint.borderWidth.value <= soft.borderWidth.value)
        assertTrue(soft.borderWidth.value <= featured.borderWidth.value)
    }

    @Test
    fun `values come from generated tokens - no raw literals in the resolver`() {
        assertEquals(ShomaraTokens.ClaySoftElevation, ClaySpecResolver.specFor(ClayDepth.SOFT).elevation)
        assertEquals(ShomaraTokens.ClayFeaturedBorderWidth, ClaySpecResolver.specFor(ClayDepth.FEATURED).borderWidth)
        assertEquals(ShomaraTokens.ClayHintShadowRadius, ClaySpecResolver.specFor(ClayDepth.HINT).shadowRadius)
    }

    @Test
    fun `flat tier has no shadow or border - text surfaces stay flat`() {
        val flat = ClaySpecResolver.specFor(ClayDepth.FLAT)
        assertEquals(0.0, flat.shadowOpacity.toDouble(), 0.0)
        assertEquals(0.0f, flat.borderWidth.value, 0.0f)
        assertEquals(0.0f, flat.elevation.value, 0.0f)
    }

    @Test
    fun `path node visuals use redundant encoding - fill, mark and label all differ per state`() {
        val states = ShomaraPathNodeVisualState.values()
        val marks = states.map { ShomaraPathNodeVisuals.markFor(it) }
        val labels = states.map { ShomaraPathNodeVisuals.labelFor(it) }
        assertEquals(marks.size, marks.toSet().size)
        assertEquals(labels.size, labels.toSet().size)
        val fills = states.map { ShomaraPathNodeVisuals.colorsFor(it).fill }
        // FRESH/COMPLETED/PERFECT/LOCKED vary in fill; CURRENT has its own featured fill.
        assertTrue(fills.toSet().size >= 3)
    }

    @Test
    fun `current node is the only FEATURED depth - locked is FLAT`() {
        assertEquals(ClayDepth.FEATURED, ShomaraPathNodeVisuals.depthFor(ShomaraPathNodeVisualState.CURRENT))
        assertEquals(ClayDepth.FLAT, ShomaraPathNodeVisuals.depthFor(ShomaraPathNodeVisualState.LOCKED))
        assertEquals(ClayDepth.SOFT, ShomaraPathNodeVisuals.depthFor(ShomaraPathNodeVisualState.FRESH))
    }

}
