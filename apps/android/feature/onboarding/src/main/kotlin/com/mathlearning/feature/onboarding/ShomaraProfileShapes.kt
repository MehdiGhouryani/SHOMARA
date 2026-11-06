package com.mathlearning.feature.onboarding

import androidx.compose.ui.graphics.Path

/**
 * Decorative hero/background shapes for the page-02 profile screen,
 * transcribed from the owner-delivered SVGs in `complete-ui-assets.zip`
 * (16 files, 2026-11-06) by `gen_shapes.py` (kept locally at
 * `~/workspace/shomara-page02/gen_shapes.py`, NOT part of the repo).
 *
 * Each function builds the path for a drawn width/height; coordinates
 * are viewBox fractions, so the caller scales freely. Colours are NOT
 * in this file: they come from [ShomaraTokens] at the call site — the
 * SVG hex values are approximate (per the owner guide) and are never
 * used. Arcs in the source SVGs were converted to cubic beziers by the
 * generator, so the emitted code uses only moveTo/lineTo/cubicTo/close.
 * The renders in `~/workspace/shomara-page02/renders/` are the same
 * parsed segments flattened to polygons; they were view-checked against
 * the mockup before staging.
 */
internal object ShomaraProfileShapes {

    // fill #FEF0D8
    /** cloudTopLeft — transcribed from cloudTopLeft.svg (viewBox 220 x 130). Width/height are the drawn size. */
    fun cloudTopLeftPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.209f, height * 0.862f)
        cubicTo(width * 0.091f, height * 0.862f, width * 0.036f, height * 0.754f, width * 0.041f, height * 0.6f)
        cubicTo(width * 0.045f, height * 0.446f, width * 0.118f, height * 0.323f, width * 0.218f, height * 0.315f)
        cubicTo(width * 0.264f, height * 0.1f, width * 0.377f, height * 0.023f, width * 0.491f, height * 0.062f)
        cubicTo(width * 0.573f, height * 0.085f, width * 0.645f, height * 0.185f, width * 0.677f, height * 0.315f)
        cubicTo(width * 0.777f, height * 0.269f, width * 0.877f, height * 0.331f, width * 0.927f, height * 0.462f)
        cubicTo(width * 0.977f, height * 0.6f, width * 0.945f, height * 0.777f, width * 0.868f, height * 0.838f)
        cubicTo(width * 0.832f, height * 0.869f, width * 0.782f, height * 0.869f, width * 0.732f, height * 0.869f)
        lineTo(width * 0.209f, height * 0.869f)
        close()
    }

    // fill #FEF0D8
    /** cloudTopRight — transcribed from cloudTopRight.svg (viewBox 190 x 115). Width/height are the drawn size. */
    fun cloudTopRightPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.174f, height * 0.878f)
        cubicTo(width * 0.074f, height * 0.878f, width * 0.021f, height * 0.783f, width * 0.026f, height * 0.643f)
        cubicTo(width * 0.032f, height * 0.513f, width * 0.095f, height * 0.409f, width * 0.189f, height * 0.383f)
        cubicTo(width * 0.247f, height * 0.174f, width * 0.353f, height * 0.07f, width * 0.468f, height * 0.078f)
        cubicTo(width * 0.574f, height * 0.078f, width * 0.658f, height * 0.174f, width * 0.695f, height * 0.33f)
        cubicTo(width * 0.763f, height * 0.287f, width * 0.858f, height * 0.322f, width * 0.916f, height * 0.409f)
        cubicTo(width * 0.984f, height * 0.513f, width * 0.989f, height * 0.687f, width * 0.932f, height * 0.791f)
        cubicTo(width * 0.895f, height * 0.861f, width * 0.847f, height * 0.878f, width * 0.774f, height * 0.878f)
        lineTo(width * 0.174f, height * 0.878f)
        close()
    }

    // fill #FFF1DB
    /** cloudBottomLeft — transcribed from cloudBottomLeft.svg (viewBox 225 x 145). Width/height are the drawn size. */
    fun cloudBottomLeftPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.164f, height * 0.91f)
        cubicTo(width * 0.067f, height * 0.91f, width * 0.013f, height * 0.821f, width * 0.018f, height * 0.69f)
        cubicTo(width * 0.022f, height * 0.572f, width * 0.076f, height * 0.483f, width * 0.151f, height * 0.455f)
        cubicTo(width * 0.196f, height * 0.207f, width * 0.293f, height * 0.083f, width * 0.404f, height * 0.083f)
        cubicTo(width * 0.502f, height * 0.083f, width * 0.582f, height * 0.166f, width * 0.622f, height * 0.303f)
        cubicTo(width * 0.711f, height * 0.234f, width * 0.822f, height * 0.276f, width * 0.862f, height * 0.421f)
        cubicTo(width * 0.871f, height * 0.455f, width * 0.876f, height * 0.49f, width * 0.876f, height * 0.524f)
        cubicTo(width * 0.947f, height * 0.559f, width * 0.982f, height * 0.648f, width * 0.973f, height * 0.738f)
        cubicTo(width * 0.964f, height * 0.848f, width * 0.902f, height * 0.91f, width * 0.818f, height * 0.91f)
        lineTo(width * 0.164f, height * 0.91f)
        close()
    }

    // fill #FEF0D8
    /** cloudBottomRight — transcribed from cloudBottomRight.svg (viewBox 190 x 115). Width/height are the drawn size. */
    fun cloudBottomRightPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.179f, height * 0.887f)
        cubicTo(width * 0.079f, height * 0.887f, width * 0.026f, height * 0.791f, width * 0.026f, height * 0.652f)
        cubicTo(width * 0.026f, height * 0.513f, width * 0.089f, height * 0.409f, width * 0.184f, height * 0.383f)
        cubicTo(width * 0.247f, height * 0.174f, width * 0.347f, height * 0.07f, width * 0.474f, height * 0.078f)
        cubicTo(width * 0.579f, height * 0.087f, width * 0.663f, height * 0.183f, width * 0.7f, height * 0.339f)
        cubicTo(width * 0.774f, height * 0.296f, width * 0.858f, height * 0.33f, width * 0.916f, height * 0.409f)
        cubicTo(width * 0.989f, height * 0.513f, width * 0.995f, height * 0.687f, width * 0.937f, height * 0.791f)
        cubicTo(width * 0.9f, height * 0.861f, width * 0.847f, height * 0.887f, width * 0.774f, height * 0.887f)
        lineTo(width * 0.179f, height * 0.887f)
        close()
    }

    // fill #C1E9A5
    /** leavesTopLeft1 — transcribed from leavesTopLeft1.svg (viewBox 180 x 150). Width/height are the drawn size. */
    fun leavesTopLeft1Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.067f, height * 0.947f)
        cubicTo(width * -0.011f, height * 0.753f, width * 0.017f, height * 0.56f, width * 0.1f, height * 0.513f)
        cubicTo(width * 0.194f, height * 0.46f, width * 0.278f, height * 0.6f, width * 0.344f, height * 0.767f)
        cubicTo(width * 0.272f, height * 0.527f, width * 0.3f, height * 0.247f, width * 0.406f, height * 0.2f)
        cubicTo(width * 0.517f, height * 0.147f, width * 0.594f, height * 0.293f, width * 0.594f, height * 0.513f)
        cubicTo(width * 0.656f, height * 0.36f, width * 0.761f, height * 0.287f, width * 0.839f, height * 0.347f)
        cubicTo(width * 0.939f, height * 0.427f, width * 0.861f, height * 0.627f, width * 0.739f, height * 0.747f)
        cubicTo(width * 0.583f, height * 0.9f, width * 0.328f, height * 0.98f, width * 0.067f, height * 0.947f)
        close()
    }

    // fill #A1DB8A
    /** leavesTopLeft2 — transcribed from leavesTopLeft2.svg (viewBox 180 x 150). Width/height are the drawn size. */
    fun leavesTopLeft2Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.328f, height * 0.953f)
        cubicTo(width * 0.289f, height * 0.773f, width * 0.306f, height * 0.487f, width * 0.406f, height * 0.413f)
        cubicTo(width * 0.478f, height * 0.36f, width * 0.517f, height * 0.48f, width * 0.511f, height * 0.613f)
        cubicTo(width * 0.556f, height * 0.507f, width * 0.633f, height * 0.44f, width * 0.689f, height * 0.48f)
        cubicTo(width * 0.756f, height * 0.533f, width * 0.7f, height * 0.687f, width * 0.622f, height * 0.773f)
        cubicTo(width * 0.539f, height * 0.867f, width * 0.45f, height * 0.92f, width * 0.328f, height * 0.953f)
        close()
    }

    // fill #81CD79, opacity .8
    /** leavesTopLeft3 — transcribed from leavesTopLeft3.svg (viewBox 180 x 150). Width/height are the drawn size. */
    fun leavesTopLeft3Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.367f, height * 0.947f)
        cubicTo(width * 0.372f, height * 0.773f, width * 0.417f, height * 0.613f, width * 0.478f, height * 0.573f)
        cubicTo(width * 0.522f, height * 0.547f, width * 0.539f, height * 0.607f, width * 0.522f, height * 0.707f)
        cubicTo(width * 0.572f, height * 0.64f, width * 0.622f, height * 0.627f, width * 0.644f, height * 0.667f)
        cubicTo(width * 0.678f, height * 0.727f, width * 0.594f, height * 0.847f, width * 0.511f, height * 0.9f)
        close()
    }

    // fill #B8E7A1
    /** leavesTopRight1 — transcribed from leavesTopRight1.svg (viewBox 175 x 175). Width/height are the drawn size. */
    fun leavesTopRight1Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.931f, height * 0.977f)
        cubicTo(width * 0.743f, height * 0.983f, width * 0.491f, height * 0.926f, width * 0.366f, height * 0.834f)
        cubicTo(width * 0.234f, height * 0.743f, width * 0.166f, height * 0.583f, width * 0.246f, height * 0.514f)
        cubicTo(width * 0.314f, height * 0.457f, width * 0.411f, height * 0.497f, width * 0.48f, height * 0.589f)
        cubicTo(width * 0.446f, height * 0.383f, width * 0.503f, height * 0.12f, width * 0.634f, height * 0.091f)
        cubicTo(width * 0.771f, height * 0.063f, width * 0.857f, height * 0.229f, width * 0.88f, height * 0.434f)
        cubicTo(width * 0.954f, height * 0.337f, width * 1.046f, height * 0.326f, width * 1.109f, height * 0.383f)
        cubicTo(width * 1.177f, height * 0.451f, width * 1.12f, height * 0.629f, width * 1.057f, height * 0.731f)
        cubicTo(width * 1.017f, height * 0.811f, width * 0.977f, height * 0.897f, width * 0.931f, height * 0.977f)
        close()
    }

    // fill #91D488
    /** leavesTopRight2 — transcribed from leavesTopRight2.svg (viewBox 175 x 175). Width/height are the drawn size. */
    fun leavesTopRight2Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.68f, height * 0.966f)
        cubicTo(width * 0.543f, height * 0.937f, width * 0.406f, height * 0.863f, width * 0.331f, height * 0.771f)
        cubicTo(width * 0.257f, height * 0.68f, width * 0.234f, height * 0.56f, width * 0.297f, height * 0.526f)
        cubicTo(width * 0.36f, height * 0.491f, width * 0.423f, height * 0.554f, width * 0.48f, height * 0.64f)
        cubicTo(width * 0.474f, height * 0.486f, width * 0.509f, height * 0.389f, width * 0.571f, height * 0.377f)
        cubicTo(width * 0.669f, height * 0.36f, width * 0.709f, height * 0.491f, width * 0.697f, height * 0.651f)
        cubicTo(width * 0.743f, height * 0.549f, width * 0.794f, height * 0.52f, width * 0.84f, height * 0.554f)
        cubicTo(width * 0.897f, height * 0.606f, width * 0.823f, height * 0.846f, width * 0.68f, height * 0.966f)
        close()
    }

    // fill #7BC978, opacity .7
    /** leavesTopRight3 — transcribed from leavesTopRight3.svg (viewBox 175 x 175). Width/height are the drawn size. */
    fun leavesTopRight3Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.64f, height * 0.949f)
        cubicTo(width * 0.537f, height * 0.88f, width * 0.463f, height * 0.771f, width * 0.474f, height * 0.686f)
        cubicTo(width * 0.48f, height * 0.64f, width * 0.52f, height * 0.629f, width * 0.56f, height * 0.68f)
        cubicTo(width * 0.543f, height * 0.56f, width * 0.577f, height * 0.509f, width * 0.623f, height * 0.514f)
        cubicTo(width * 0.68f, height * 0.52f, width * 0.703f, height * 0.629f, width * 0.68f, height * 0.731f)
        cubicTo(width * 0.737f, height * 0.68f, width * 0.777f, height * 0.674f, width * 0.8f, height * 0.709f)
        cubicTo(width * 0.823f, height * 0.754f, width * 0.743f, height * 0.886f, width * 0.64f, height * 0.949f)
        close()
    }

    // fill #B7E5A2
    /** leavesBottomLeft1 — transcribed from leavesBottomLeft1.svg (viewBox 170 x 215). Width/height are the drawn size. */
    fun leavesBottomLeft1Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.071f, height * 0.967f)
        cubicTo(width * -0.006f, height * 0.786f, width * 0f, height * 0.484f, width * 0.071f, height * 0.293f)
        cubicTo(width * 0.124f, height * 0.149f, width * 0.218f, height * 0.079f, width * 0.312f, height * 0.102f)
        cubicTo(width * 0.429f, height * 0.126f, width * 0.424f, height * 0.265f, width * 0.382f, height * 0.4f)
        cubicTo(width * 0.459f, height * 0.335f, width * 0.588f, height * 0.326f, width * 0.629f, height * 0.386f)
        cubicTo(width * 0.688f, height * 0.47f, width * 0.588f, height * 0.563f, width * 0.447f, height * 0.623f)
        cubicTo(width * 0.535f, height * 0.609f, width * 0.6f, height * 0.623f, width * 0.624f, height * 0.67f)
        cubicTo(width * 0.665f, height * 0.753f, width * 0.518f, height * 0.837f, width * 0.376f, height * 0.893f)
        cubicTo(width * 0.259f, height * 0.935f, width * 0.165f, height * 0.963f, width * 0.071f, height * 0.967f)
        close()
    }

    // fill #91D487
    /** leavesBottomLeft2 — transcribed from leavesBottomLeft2.svg (viewBox 170 x 215). Width/height are the drawn size. */
    fun leavesBottomLeft2Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.059f, height * 0.953f)
        cubicTo(width * 0.035f, height * 0.735f, width * 0.082f, height * 0.484f, width * 0.182f, height * 0.442f)
        cubicTo(width * 0.276f, height * 0.405f, width * 0.3f, height * 0.488f, width * 0.276f, height * 0.595f)
        cubicTo(width * 0.324f, height * 0.521f, width * 0.406f, height * 0.484f, width * 0.465f, height * 0.512f)
        cubicTo(width * 0.541f, height * 0.549f, width * 0.476f, height * 0.637f, width * 0.382f, height * 0.693f)
        cubicTo(width * 0.471f, height * 0.674f, width * 0.518f, height * 0.693f, width * 0.524f, height * 0.735f)
        cubicTo(width * 0.529f, height * 0.795f, width * 0.4f, height * 0.856f, width * 0.271f, height * 0.902f)
        close()
    }

    // fill #7AC978, opacity .72
    /** leavesBottomLeft3 — transcribed from leavesBottomLeft3.svg (viewBox 170 x 215). Width/height are the drawn size. */
    fun leavesBottomLeft3Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.082f, height * 0.944f)
        cubicTo(width * 0.088f, height * 0.786f, width * 0.129f, height * 0.623f, width * 0.2f, height * 0.614f)
        cubicTo(width * 0.259f, height * 0.605f, width * 0.271f, height * 0.665f, width * 0.253f, height * 0.721f)
        cubicTo(width * 0.294f, height * 0.665f, width * 0.353f, height * 0.651f, width * 0.388f, height * 0.674f)
        cubicTo(width * 0.435f, height * 0.712f, width * 0.359f, height * 0.795f, width * 0.282f, height * 0.833f)
        close()
    }

    // fill #B6E5A0
    /** leavesBottomRight1 — transcribed from leavesBottomRight1.svg (viewBox 170 x 230). Width/height are the drawn size. */
    fun leavesBottomRight1Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.9f, height * 0.965f)
        cubicTo(width * 0.712f, height * 0.97f, width * 0.518f, height * 0.922f, width * 0.4f, height * 0.857f)
        cubicTo(width * 0.282f, height * 0.791f, width * 0.224f, height * 0.687f, width * 0.288f, height * 0.639f)
        cubicTo(width * 0.359f, height * 0.591f, width * 0.447f, height * 0.622f, width * 0.524f, height * 0.683f)
        cubicTo(width * 0.494f, height * 0.483f, width * 0.529f, height * 0.248f, width * 0.653f, height * 0.191f)
        cubicTo(width * 0.788f, height * 0.13f, width * 0.894f, height * 0.222f, width * 0.918f, height * 0.37f)
        cubicTo(width * 0.953f, height * 0.543f, width * 0.941f, height * 0.783f, width * 0.9f, height * 0.965f)
        close()
    }

    // fill #91D486
    /** leavesBottomRight2 — transcribed from leavesBottomRight2.svg (viewBox 170 x 230). Width/height are the drawn size. */
    fun leavesBottomRight2Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.788f, height * 0.965f)
        cubicTo(width * 0.629f, height * 0.93f, width * 0.506f, height * 0.857f, width * 0.441f, height * 0.783f)
        cubicTo(width * 0.382f, height * 0.709f, width * 0.382f, height * 0.635f, width * 0.447f, height * 0.613f)
        cubicTo(width * 0.506f, height * 0.596f, width * 0.571f, height * 0.635f, width * 0.618f, height * 0.687f)
        cubicTo(width * 0.606f, height * 0.557f, width * 0.635f, height * 0.448f, width * 0.706f, height * 0.43f)
        cubicTo(width * 0.794f, height * 0.404f, width * 0.847f, height * 0.483f, width * 0.841f, height * 0.578f)
        cubicTo(width * 0.835f, height * 0.73f, width * 0.824f, height * 0.848f, width * 0.788f, height * 0.965f)
        close()
    }

    // fill #78C879, opacity .78
    /** leavesBottomRight3 — transcribed from leavesBottomRight3.svg (viewBox 170 x 230). Width/height are the drawn size. */
    fun leavesBottomRight3Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.741f, height * 0.948f)
        cubicTo(width * 0.624f, height * 0.891f, width * 0.565f, height * 0.804f, width * 0.582f, height * 0.752f)
        cubicTo(width * 0.594f, height * 0.717f, width * 0.635f, height * 0.717f, width * 0.676f, height * 0.752f)
        cubicTo(width * 0.665f, height * 0.674f, width * 0.7f, height * 0.622f, width * 0.753f, height * 0.626f)
        cubicTo(width * 0.824f, height * 0.63f, width * 0.829f, height * 0.7f, width * 0.818f, height * 0.757f)
        cubicTo(width * 0.8f, height * 0.839f, width * 0.776f, height * 0.9f, width * 0.741f, height * 0.948f)
        close()
    }

    // stroke #FFCA38, width 13 (viewBox units)
    /** rays — transcribed from rays.svg (viewBox 90 x 115). Width/height are the drawn size. */
    fun raysPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.278f, height * 0.461f)
        lineTo(width * 0.356f, height * 0.113f)
        moveTo(width * 0.511f, height * 0.574f)
        lineTo(width * 0.778f, height * 0.365f)
        moveTo(width * 0.633f, height * 0.73f)
        lineTo(width * 0.933f, height * 0.713f)
    }

    // fill #FFF1DD
    /** heroHillBackLeft — transcribed from heroHillBackLeft.svg (viewBox 320 x 180). Width/height are the drawn size. */
    fun heroHillBackLeftPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0f, height * 0.806f)
        lineTo(width * 0f, height * 0.328f)
        cubicTo(width * 0.075f, height * 0.122f, width * 0.147f, height * 0.006f, width * 0.241f, height * 0.028f)
        cubicTo(width * 0.322f, height * 0.044f, width * 0.391f, height * 0.15f, width * 0.438f, height * 0.322f)
        cubicTo(width * 0.519f, height * 0.272f, width * 0.622f, height * 0.344f, width * 0.675f, height * 0.461f)
        cubicTo(width * 0.784f, height * 0.444f, width * 0.909f, height * 0.544f, width * 1f, height * 0.722f)
        lineTo(width * 1f, height * 1f)
        lineTo(width * 0f, height * 1f)
        close()
    }

    // fill #FFF1DD
    /** heroHillBackRight — transcribed from heroHillBackRight.svg (viewBox 320 x 150). Width/height are the drawn size. */
    fun heroHillBackRightPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0f, height * 1f)
        cubicTo(width * 0.087f, height * 0.78f, width * 0.169f, height * 0.653f, width * 0.281f, height * 0.62f)
        cubicTo(width * 0.341f, height * 0.473f, width * 0.428f, height * 0.393f, width * 0.519f, height * 0.407f)
        cubicTo(width * 0.6f, height * 0.173f, width * 0.725f, height * 0.1f, width * 0.819f, height * 0.253f)
        cubicTo(width * 0.887f, height * 0.36f, width * 0.944f, height * 0.52f, width * 1f, height * 0.713f)
        lineTo(width * 1f, height * 1f)
        close()
    }

    // fill #FDF8EC
    /** heroFrontCurve1 — transcribed from heroFrontCurve1.svg (viewBox 878 x 180). Width/height are the drawn size. */
    fun heroFrontCurve1Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0f, height * 0.811f)
        cubicTo(width * 0.17f, height * 0.339f, width * 0.345f, height * 0.067f, width * 0.501f, height * 0.061f)
        cubicTo(width * 0.673f, height * 0.056f, width * 0.844f, height * 0.333f, width * 1f, height * 0.811f)
        lineTo(width * 1f, height * 1f)
        lineTo(width * 0f, height * 1f)
        close()
    }

    // stroke #FFEAC6, width 5 (viewBox units)
    /** heroFrontCurve2 — transcribed from heroFrontCurve2.svg (viewBox 878 x 180). Width/height are the drawn size. */
    fun heroFrontCurve2Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0f, height * 0.811f)
        cubicTo(width * 0.17f, height * 0.339f, width * 0.345f, height * 0.067f, width * 0.501f, height * 0.061f)
        cubicTo(width * 0.673f, height * 0.056f, width * 0.844f, height * 0.333f, width * 1f, height * 0.811f)
    }

    // fill #DFF2BF
    /** bottomHills1 — transcribed from bottomHills1.svg (viewBox 878 x 195). Width/height are the drawn size. */
    fun bottomHills1Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0f, height * 0.369f)
        cubicTo(width * 0.167f, height * 0.426f, width * 0.219f, height * 0.733f, width * 0.371f, height * 0.815f)
        cubicTo(width * 0.499f, height * 0.882f, width * 0.58f, height * 0.631f, width * 0.695f, height * 0.656f)
        cubicTo(width * 0.815f, height * 0.687f, width * 0.893f, height * 0.81f, width * 1f, height * 0.974f)
        lineTo(width * 1f, height * 1f)
        lineTo(width * 0f, height * 1f)
        close()
    }

    // fill #C9ECAC
    /** bottomHills2 — transcribed from bottomHills2.svg (viewBox 878 x 195). Width/height are the drawn size. */
    fun bottomHills2Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0f, height * 0.195f)
        cubicTo(width * 0.108f, height * 0.287f, width * 0.204f, height * 0.415f, width * 0.279f, height * 0.61f)
        cubicTo(width * 0.364f, height * 0.836f, width * 0.437f, height * 0.846f, width * 0.523f, height * 1f)
        lineTo(width * 0f, height * 1f)
        close()
    }

    // fill #BCE59D
    /** bottomHills3 — transcribed from bottomHills3.svg (viewBox 878 x 195). Width/height are the drawn size. */
    fun bottomHills3Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0f, height * 0.528f)
        cubicTo(width * 0.087f, height * 0.579f, width * 0.165f, height * 0.692f, width * 0.249f, height * 0.841f)
        cubicTo(width * 0.292f, height * 0.918f, width * 0.337f, height * 0.959f, width * 0.384f, height * 1f)
        lineTo(width * 0f, height * 1f)
        close()
    }

    // fill #D1ECB0
    /** bottomHills4 — transcribed from bottomHills4.svg (viewBox 878 x 195). Width/height are the drawn size. */
    fun bottomHills4Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.605f, height * 1f)
        cubicTo(width * 0.71f, height * 0.826f, width * 0.793f, height * 0.615f, width * 0.882f, height * 0.667f)
        cubicTo(width * 0.927f, height * 0.692f, width * 0.964f, height * 0.749f, width * 1f, height * 0.805f)
        lineTo(width * 1f, height * 1f)
        close()
    }

    // fill #BDE59E, opacity .78
    /** bottomHills5 — transcribed from bottomHills5.svg (viewBox 878 x 195). Width/height are the drawn size. */
    fun bottomHills5Path(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.71f, height * 1f)
        cubicTo(width * 0.803f, height * 0.846f, width * 0.896f, height * 0.687f, width * 1f, height * 0.805f)
        lineTo(width * 1f, height * 1f)
        close()
    }

    // fill #B8B8B8
    /** iconUser — transcribed from iconUser.svg (viewBox 48 x 48). Width/height are the drawn size. */
    fun iconUserPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.5f, height * 0.104f)
        cubicTo(width * 0.385f, height * 0.104f, width * 0.292f, height * 0.197f, width * 0.292f, height * 0.312f)
        cubicTo(width * 0.292f, height * 0.428f, width * 0.385f, height * 0.521f, width * 0.5f, height * 0.521f)
        cubicTo(width * 0.615f, height * 0.521f, width * 0.708f, height * 0.428f, width * 0.708f, height * 0.312f)
        cubicTo(width * 0.708f, height * 0.197f, width * 0.615f, height * 0.104f, width * 0.5f, height * 0.104f)
        close()
        moveTo(width * 0.5f, height * 0.562f)
        cubicTo(width * 0.271f, height * 0.562f, width * 0.104f, height * 0.688f, width * 0.104f, height * 0.833f)
        cubicTo(width * 0.104f, height * 0.896f, width * 0.146f, height * 0.917f, width * 0.208f, height * 0.917f)
        lineTo(width * 0.792f, height * 0.917f)
        cubicTo(width * 0.854f, height * 0.917f, width * 0.896f, height * 0.896f, width * 0.896f, height * 0.833f)
        cubicTo(width * 0.896f, height * 0.688f, width * 0.729f, height * 0.562f, width * 0.5f, height * 0.562f)
        close()
    }

    // stroke #fff, width 5 (viewBox units)
    /** iconCheck — transcribed from iconCheck.svg (viewBox 48 x 48). Width/height are the drawn size. */
    fun iconCheckPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.292f, height * 0.5f)
        lineTo(width * 0.438f, height * 0.646f)
        lineTo(width * 0.729f, height * 0.333f)
    }

    // stroke #fff, width 5 (viewBox units)
    /** iconArrow — transcribed from iconArrow.svg (viewBox 48 x 48). Width/height are the drawn size. */
    fun iconArrowPath(width: Float, height: Float): Path = Path().apply {
        moveTo(width * 0.146f, height * 0.5f)
        lineTo(width * 0.833f, height * 0.5f)
        moveTo(width * 0.562f, height * 0.208f)
        lineTo(width * 0.854f, height * 0.5f)
        lineTo(width * 0.562f, height * 0.792f)
    }
}
