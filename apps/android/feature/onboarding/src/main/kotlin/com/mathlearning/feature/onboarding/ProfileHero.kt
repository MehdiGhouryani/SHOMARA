package com.mathlearning.feature.onboarding

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import com.mathlearning.core.designsystem.ShomaraProfileDrawables
import com.mathlearning.core.designsystem.ShomaraTokens

/**
 * Leaf greens. The owner SVGs use three fresh light-green shades per leaf
 * cluster (#C1E9A5 / #A1DB8A / #81CD79 and neighbours); the v2 tokens have
 * no mid-green, so the two darker shades are tints of the primary token
 * over the cream canvas. The device screenshot must confirm they read like
 * the mockup; if they read grey, a mid-green token is a later ADR, not a
 * silent hex. The SVG opacity (.7-.8 on the darkest layer) is folded into
 * the tint.
 */
private val LeafLight: Color = ShomaraTokens.ColorPrimarySoft
private val LeafMid: Color = ShomaraTokens.ColorPrimary.copy(alpha = 0.35f)
private val LeafDark: Color = ShomaraTokens.ColorPrimary.copy(alpha = 0.45f)

/** Bottom-hill bands: one pale green, stepped alphas so the five SVG bands
 * stay distinct (the SVG's .78 opacity on the front band is folded in). */
private val HillBand1: Color = ShomaraTokens.ColorPrimarySoft
private val HillBand2: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.85f)
private val HillBand3: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.7f)
private val HillBand4: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.9f)
private val HillBand5: Color = ShomaraTokens.ColorPrimarySoft.copy(alpha = 0.75f)

/**
 * The hero: clouds + back hills + leaves + rays + the mascot WebP peeking
 * over the front curve, layered in that order (the front curve is drawn
 * last, so it covers the mascot's lower body). The artwork is the page title
 * visually, so it carries the step title as a heading: the declared TalkBack
 * traversal contract (OnboardingA11y) names this heading, and before this the
 * rendered screen had no heading at all for assistive technology to reach.
 */
@Composable
internal fun ShomaraProfileHero(modifier: Modifier = Modifier) {
    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .semantics {
                contentDescription = ShomaraProfileStrings.ProfileTitle
                heading()
            },
    ) {
        val heroWidth = maxWidth
        val heroHeight = heroWidth / ShomaraProfileLayout.HeroAspectRatio
        Box(
            modifier = Modifier
                .size(width = heroWidth, height = heroHeight)
                .clearAndSetSemantics {},
        ) {
            // Clouds first (bottom of the stack).
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudTopLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudTopLeftX,
                        y = heroHeight * ShomaraProfileLayout.CloudTopLeftY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudTopLeftWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudTopLeftWidth * (130f / 220f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudTopRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudTopRightX,
                        y = heroHeight * ShomaraProfileLayout.CloudTopRightY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudTopRightWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudTopRightWidth * (115f / 190f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudBottomLeftX,
                        y = heroHeight * ShomaraProfileLayout.CloudBottomLeftY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudBottomLeftWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudBottomLeftWidth * (145f / 225f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.CloudBottomRightX,
                        y = heroHeight * ShomaraProfileLayout.CloudBottomRightY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.CloudBottomRightWidth,
                        height = heroWidth * ShomaraProfileLayout.CloudBottomRightWidth * (115f / 190f),
                    ),
            )
            // Back hills, bottom-anchored, behind the mascot.
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::heroHillBackLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .size(
                        width = heroWidth * ShomaraProfileLayout.HeroHillWidth,
                        height = heroWidth * ShomaraProfileLayout.HeroHillWidth * (180f / 320f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::heroHillBackRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(
                        width = heroWidth * ShomaraProfileLayout.HeroHillWidth,
                        height = heroWidth * ShomaraProfileLayout.HeroHillWidth * (150f / 320f),
                    ),
            )
            // Top leaves, at the hero's left/right edges.
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.LeavesTopLeftX,
                        y = heroHeight * ShomaraProfileLayout.LeavesTopLeftY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.LeavesTopLeftWidth,
                        height = heroWidth * ShomaraProfileLayout.LeavesTopLeftWidth * (150f / 180f),
                    ),
                first = ShomaraProfileShapes::leavesTopLeft1Path,
                second = ShomaraProfileShapes::leavesTopLeft2Path,
                third = ShomaraProfileShapes::leavesTopLeft3Path,
            )
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.LeavesTopRightX,
                        y = heroHeight * ShomaraProfileLayout.LeavesTopRightY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.LeavesTopRightWidth,
                        height = heroWidth * ShomaraProfileLayout.LeavesTopRightWidth * (175f / 175f),
                    ),
                first = ShomaraProfileShapes::leavesTopRight1Path,
                second = ShomaraProfileShapes::leavesTopRight2Path,
                third = ShomaraProfileShapes::leavesTopRight3Path,
            )
            // Yellow rays, upper right of the mascot.
            Canvas(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.RaysX,
                        y = heroHeight * ShomaraProfileLayout.RaysY,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.RaysWidth,
                        height = heroWidth * ShomaraProfileLayout.RaysWidth * (115f / 90f),
                    ),
            ) {
                drawPath(
                    path = ShomaraProfileShapes.raysPath(size.width, size.height),
                    color = ShomaraTokens.ColorAmber,
                    style = Stroke(
                        width = size.width * ShomaraProfileLayout.RaysStrokeWidthFraction,
                        cap = StrokeCap.Round,
                    ),
                )
            }
            // The mascot (owner WebP, with bow, as-is). ContentScale.Fit on
            // the exact 1.5 aspect box, so no crop and no distortion.
            Image(
                painter = painterResource(ShomaraProfileDrawables.MascotWithBow),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = heroWidth * ShomaraProfileLayout.MascotXFraction,
                        y = heroHeight * ShomaraProfileLayout.MascotYFraction,
                    )
                    .size(
                        width = heroWidth * ShomaraProfileLayout.MascotWidthFraction,
                        height = heroWidth * ShomaraProfileLayout.MascotWidthFraction / ShomaraProfileLayout.MascotAspectRatio,
                    ),
            )
            // Front curve last: it covers the mascot's lower body, so the
            // mascot reads as peeking over the hill.
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::heroFrontCurve1Path,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = heroWidth, height = heroWidth * (355f / 878f)),
            )
            Canvas(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = heroWidth, height = heroWidth * (355f / 878f)),
            ) {
                drawPath(
                    path = ShomaraProfileShapes.heroFrontCurve2Path(size.width, size.height),
                    color = ShomaraTokens.ColorAmberSoft,
                    style = Stroke(
                        width = size.width * ShomaraProfileLayout.FrontCurveStrokeWidthFraction,
                        cap = StrokeCap.Round,
                    ),
                )
            }
        }
    }
}

/**
 * Draws one generated path, built for the Canvas's drawn size. The path
 * builder is a function reference (e.g. ShomaraProfileShapes::cloudTopLeftPath)
 * because the pixel size is only known inside the draw scope.
 */
@Composable
private fun ShomaraProfileShapeCanvas(
    buildPath: (width: Float, height: Float) -> Path,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier) {
        drawPath(path = buildPath(size.width, size.height), color = color)
    }
}

/** A three-layer leaf cluster, drawn back to front (light, mid, dark). */
@Composable
private fun ShomaraProfileLeaves(
    first: (width: Float, height: Float) -> Path,
    second: (width: Float, height: Float) -> Path,
    third: (width: Float, height: Float) -> Path,
    modifier: Modifier = Modifier,
) {
    Canvas(modifier = modifier) {
        drawPath(path = first(size.width, size.height), color = LeafLight)
        drawPath(path = second(size.width, size.height), color = LeafMid)
        drawPath(path = third(size.width, size.height), color = LeafDark)
    }
}

/**
 * The bottom background layer: bottom clouds, the five-band bottom hills,
 * and the bottom leaves flanking the CTA. Decorative; drawn behind the
 * content and the CTA.
 *
 * It lives with the hero art but is placed by the screen, so it is module-internal rather than
 * file-private (the hero itself is internal for the same reason).
 */
@Composable
internal fun ShomaraProfileBottomBackground(modifier: Modifier = Modifier) {
    BoxWithConstraints(modifier = modifier.fillMaxWidth()) {
        val layerWidth = maxWidth
        val layerHeight = layerWidth * ShomaraProfileLayout.BottomBackgroundHeightFraction
        Box(
            modifier = Modifier
                .size(width = layerWidth, height = layerHeight)
                .clearAndSetSemantics {},
        ) {
            // Bottom clouds, above the hills.
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomLeftPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = layerWidth * ShomaraProfileLayout.BottomCloudLeftX,
                        y = layerHeight * ShomaraProfileLayout.BottomCloudLeftY,
                    )
                    .size(
                        width = layerWidth * ShomaraProfileLayout.BottomCloudLeftWidth,
                        height = layerWidth * ShomaraProfileLayout.BottomCloudLeftWidth * (145f / 225f),
                    ),
            )
            ShomaraProfileShapeCanvas(
                buildPath = ShomaraProfileShapes::cloudBottomRightPath,
                color = ShomaraTokens.ColorSurfaceAlt,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .offset(
                        x = layerWidth * ShomaraProfileLayout.BottomCloudRightX,
                        y = layerHeight * ShomaraProfileLayout.BottomCloudRightY,
                    )
                    .size(
                        width = layerWidth * ShomaraProfileLayout.BottomCloudRightWidth,
                        height = layerWidth * ShomaraProfileLayout.BottomCloudRightWidth * (115f / 190f),
                    ),
            )
            // Bottom hills: all five bands share one viewBox, so one Canvas.
            Canvas(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .size(width = layerWidth, height = layerWidth * (195f / 878f)),
            ) {
                drawPath(path = ShomaraProfileShapes.bottomHills1Path(size.width, size.height), color = HillBand1)
                drawPath(path = ShomaraProfileShapes.bottomHills2Path(size.width, size.height), color = HillBand2)
                drawPath(path = ShomaraProfileShapes.bottomHills3Path(size.width, size.height), color = HillBand3)
                drawPath(path = ShomaraProfileShapes.bottomHills4Path(size.width, size.height), color = HillBand4)
                drawPath(path = ShomaraProfileShapes.bottomHills5Path(size.width, size.height), color = HillBand5)
            }
            // Bottom leaves, flanking the CTA.
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .size(
                        width = layerWidth * ShomaraProfileLayout.LeavesBottomLeftWidth,
                        height = layerWidth * ShomaraProfileLayout.LeavesBottomLeftWidth * (215f / 170f),
                    ),
                first = ShomaraProfileShapes::leavesBottomLeft1Path,
                second = ShomaraProfileShapes::leavesBottomLeft2Path,
                third = ShomaraProfileShapes::leavesBottomLeft3Path,
            )
            ShomaraProfileLeaves(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .offset(x = layerWidth * ShomaraProfileLayout.LeavesBottomRightX)
                    .size(
                        width = layerWidth * ShomaraProfileLayout.LeavesBottomRightWidth,
                        height = layerWidth * ShomaraProfileLayout.LeavesBottomRightWidth * (230f / 170f),
                    ),
                first = ShomaraProfileShapes::leavesBottomRight1Path,
                second = ShomaraProfileShapes::leavesBottomRight2Path,
                third = ShomaraProfileShapes::leavesBottomRight3Path,
            )
        }
    }
}
