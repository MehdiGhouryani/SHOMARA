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
    fun zero(): TraceStroke = TraceStroke(
        listOf(
            TracePoint(BOX / 2f + 50f, 60f),
            TracePoint(BOX / 2f + 20f, 40f),
            TracePoint(BOX / 2f - 50f, 60f),
            TracePoint(BOX / 2f - 60f, BOX / 2f),
            TracePoint(TracePoint(BOX / 2f - 50f, BOX - 60f).x, BOX - 60f),
            TracePoint(BOX / 2f + 20f, BOX - 40f),
            TracePoint(BOX / 2f + 50f, BOX - 60f),
            TracePoint(BOX / 2f + 60f, BOX / 2f),
            TracePoint(BOX / 2f + 50f, 60f),
        ),
    )

    /** The glyph for a numeral key (content supplies the key; unknown keys have no stroke). */
    fun forNumeral(numeral: String): TraceStroke? = when (numeral) {
        "0", "۰" -> zero()
        "1", "۱" -> one()
        else -> null
    }
}
