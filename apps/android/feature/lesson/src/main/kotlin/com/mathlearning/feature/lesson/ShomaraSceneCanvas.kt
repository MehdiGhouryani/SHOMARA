package com.mathlearning.feature.lesson

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import com.mathlearning.core.designsystem.LocalShomaraReducedMotion
import com.mathlearning.core.designsystem.ShomaraMotionLogic
import com.mathlearning.core.designsystem.ShomaraTokens
import kotlin.math.abs

/**
 * S1 · STATION_EXPERIENCE_BLUEPRINT §2 — the SceneCanvas slot and the two stage moments.
 *
 * The canvas is the lesson's single scene surface: `weight(1f)`, NO scroll (invariant 3 —
 * the content fits the scene; scroll belongs to parent dialogs only). The host renders the
 * active stage's composable inside it; this file owns nothing about WHICH stage or WHAT
 * content — it is the frame, the transition pair (§3 contract) and the RTL-aware enter
 * direction (§4.2).
 *
 * ONE CLOCK (S1 §3): the canvas owns the exit→enter timeline and reports the swap boundary
 * through [onSceneSwapped]. The host commits its stage cursor exactly there, which is what
 * makes `stageExit` play on the OLD scene and `stageEnter` play on the NEW one. A second
 * clock in the host would desynchronise the pair and is deliberately absent.
 *
 * Reduced motion: both moments collapse to instant cuts (S1 acceptance ②) — the stage
 * FACTS survive, the movement does not. The phase sequence is identical either way.
 */
enum class ShomaraScenePhase { Holding, Exiting, Entering }

/**
 * Pure phase timing — testable without a device. One approved advance walks
 * Exit → Enter → Holding; reduced motion walks the SAME sequence with zero-duration steps.
 */
object ShomaraScenePhaseLogic {
    fun exitDurationMs(reducedMotion: Boolean): Int = ShomaraStageMotionLogic.exitMs(reducedMotion)
    fun enterDurationMs(reducedMotion: Boolean): Int = ShomaraStageMotionLogic.enterMs(reducedMotion)

    /** The single transition is ONE moment pair; overlapping pairs are a blueprint §4 bug. */
    fun nextPhase(phase: ShomaraScenePhase): ShomaraScenePhase? = when (phase) {
        ShomaraScenePhase.Holding -> null
        ShomaraScenePhase.Exiting -> ShomaraScenePhase.Entering
        ShomaraScenePhase.Entering -> ShomaraScenePhase.Holding
    }

    /**
     * The full ordered walk of one advance. The swap boundary sits between Exiting and
     * Entering — exactly where the host commits the new stage (there is no other boundary at
     * which old-scene-out and new-scene-in could both be true).
     */
    fun advanceSequence(reducedMotion: Boolean = false): List<ShomaraScenePhase> =
        listOf(ShomaraScenePhase.Exiting, ShomaraScenePhase.Entering, ShomaraScenePhase.Holding)

    /** True when this phase renders the scene: the canvas is never blank during a moment. */
    fun showsScene(phase: ShomaraScenePhase): Boolean = true

    /** True exactly at the exit→enter boundary, where the host swaps the stage. */
    fun isSwapBoundary(phase: ShomaraScenePhase): Boolean = phase == ShomaraScenePhase.Entering

    /** The enter slide start offset as a fraction of the canvas width (§4.1: slide+fade). */
    fun enterStartFraction(): Float = 0.12f

    /** The exit settle scale (§4.1: 0.98), read from the token band, not a raw literal. */
    fun exitScale(): Float = ShomaraTokens.MotionPressScale.toFloat()
}

/**
 * The scene frame. [stageKey] changes the moment [ShomaraStationFlowMachine.advance] is
 * accepted (the host passes the INCOMING stage); [onSceneSwapped] is called once, at the
 * exit→enter boundary, and the host commits its cursor there — so the exit animates the old
 * scene and the enter animates the new one.
 */
@Composable
fun ShomaraSceneCanvas(
    stageKey: Any?,
    onSceneSwapped: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    val reducedMotion = LocalShomaraReducedMotion.current
    val layoutDirection = LocalLayoutDirection.current
    var phase by remember { mutableStateOf(ShomaraScenePhase.Holding) }
    var displayedStage by remember { mutableStateOf(stageKey) }

    // Motion drives actual values (not targets): the exit settles to 0 and STAYS there until
    // the swap, so nothing animates back out when the phase returns to Holding.
    val exitFrame = remember { Animatable(0f) }
    val enterOffset = remember { Animatable(0f) }

    LaunchedEffect(stageKey) {
        if (displayedStage != stageKey) {
            phase = ShomaraScenePhase.Exiting
        }
    }

    LaunchedEffect(phase) {
        when (phase) {
            ShomaraScenePhase.Exiting -> {
                if (reducedMotion) {
                    exitFrame.snapTo(1f)
                } else {
                    exitFrame.snapTo(0f)
                    exitFrame.animateTo(1f, tween(ShomaraScenePhaseLogic.exitDurationMs(false)))
                }
                // The boundary: the host commits the new stage here, so the composable below
                // re-emits the NEW scene and the enter moment plays on it.
                displayedStage = stageKey
                onSceneSwapped()
                phase = ShomaraScenePhase.Entering
            }
            ShomaraScenePhase.Entering -> {
                exitFrame.snapTo(0f)
                if (reducedMotion) {
                    enterOffset.snapTo(0f)
                } else {
                    enterOffset.snapTo(1f)
                    enterOffset.animateTo(0f, tween(ShomaraScenePhaseLogic.enterDurationMs(false)))
                }
                phase = ShomaraScenePhase.Holding
            }
            ShomaraScenePhase.Holding -> {
                enterOffset.snapTo(0f)
                exitFrame.snapTo(0f)
            }
        }
    }

    // §4.2: the enter slide direction comes from the LAYOUT direction (reading start side),
    // never a hardcoded RTL choice. In RTL the scene enters from the right, in LTR from the left.
    val enterSign = if (layoutDirection == LayoutDirection.Rtl) 1f else -1f
    val settle = ShomaraScenePhaseLogic.exitScale()
    val scale = 1f - (1f - settle) * exitFrame.value

    Box(
        modifier = modifier
            .fillMaxSize()
            .graphicsLayer {
                // §6: animations ride graphicsLayer, never layout — no relayout, no nested scroll.
                scaleX = scale
                scaleY = scale
                alpha = 1f - exitFrame.value
                translationX = abs(enterOffset.value) *
                    ShomaraScenePhaseLogic.enterStartFraction() * size.width * enterSign
            },
        contentAlignment = Alignment.TopCenter,
    ) {
        // The scene is rendered in EVERY phase. During Exiting the host has not committed yet,
        // so this is the old scene fading out; after the swap callback it is the new scene
        // sliding in. A blank frame here would be a visible hole, not a transition.
        content()
    }
}

/**
 * S1 §2 — the pinned FeedbackSlot + BottomCtaSlot frame (acceptance ⑤: exactly ONE primary
 * CTA). The banner lives ABOVE the CTA and never scrolls away (E-04); the CTA slot renders
 * the host's single primary action or stays empty — an inert button is a dead end, not a slot.
 */
@Composable
fun ShomaraStationBottomSlots(
    feedback: (@Composable () -> Unit)?,
    cta: (@Composable () -> Unit)?,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        feedback?.invoke()
        cta?.invoke()
    }
}
