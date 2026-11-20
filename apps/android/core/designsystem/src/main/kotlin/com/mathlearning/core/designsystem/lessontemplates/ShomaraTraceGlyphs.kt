package com.mathlearning.core.designsystem.lessontemplates

/**
 * S3b · stage5 §T13 «ردگیری عدد» — the canonical reference glyphs.
 *
 * One single shape per numeral (stage5 forbids inventing a second glyph for ۴/۵/۶ until that
 * decision is made by the owner), drawn as polylines in a 240×240dp writing box with the
 * child's reading direction in mind: the start dot is at the bottom for «۱» so the stroke goes
 * UP, which is the stage5 acceptance («خط راست از پایین به بالا برای ۱ پذیرفته؛ از بالا به
 * پایین رد»).
 *
 * Nothing here recognises handwriting: the shapes are the reference, and
 * [ShomaraTracePath.TraceSession] only measures corridor/direction/arrival.
 */
object ShomaraTraceGlyphs {
    private const val BOX = 240f

    /** «۱» — a single straight stroke from the bottom to the top (start dot at the bottom). */
    fun one(): TraceStroke = TraceStroke(
        listOf(
            TracePoint(BOX / 2f, BOX - 40f),
            TracePoint(BOX / 2f, 40f),
        ),
    )

    /** «۰» — a closed loop, started at the top-right and drawn counter-clockwise. */
    fun zero(): TraceStroke {
        val cx = BOX / 2f
        val top = 60f
        val bottom = BOX - 60f
        return TraceStroke(
            listOf(
                TracePoint(cx + 50f, top),
                TracePoint(cx + 20f, top - 20f),
                TracePoint(cx - 50f, top),
                TracePoint(cx - 60f, cx),
                TracePoint(cx - 50f, bottom),
                TracePoint(cx + 20f, bottom + 20f),
                TracePoint(cx + 50f, bottom),
                TracePoint(cx + 60f, cx),
                // The loop closes on its start point — a closed stroke, not a second shape.
                TracePoint(cx + 50f, top),
            ),
        )
    }

    /** The glyph for a numeral key (content supplies the key; unknown keys have no stroke). */
    fun forNumeral(numeral: String): TraceStroke? = when (numeral) {
        "0", "۰" -> zero()
        "1", "۱" -> one()
        else -> null
    }
}
