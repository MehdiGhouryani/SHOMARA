package com.mathlearning.feature.lesson

import com.mathlearning.core.designsystem.ShomaraDigits

/**
 * B4 — P3 «تزیین کیک» round structure with real counts, no round content.
 *
 * Counts (6 rounds; blanks 2/3/2/3/4/—; tray 3/2/2/2/3/—) are quoted from pilot §4 as
 * CONFIGURABLE structure data, not approved values: binding them to real rounds needs O2 +
 * human approval. Round 6 has no blanks/tray — the pilot marks it «not continue», and the
 * [FindUnit] mode below is the structural placeholder for it, not an approved closing mode.
 *
 * The render (see ShomaraTemplateSkeletons) uses only these counts: the pattern row has
 * exactly [blankCount] empty slots, the tray exactly [traySize] empty slots, and the round
 * indicator reads «راند N از ۶». No pattern, element or cake asset is rendered.
 */
enum class ShomaraGameRoundMode { Continue, FindUnit }

data class ShomaraGameRoundStructure(
    /** 1-based round index (1..[TOTAL_ROUNDS]). */
    val roundIndex: Int,
    /** Empty slots in the pattern row for this round (0 when the round has no row). */
    val blankCount: Int,
    /** Empty slots in the tray for this round (0 when the round has no tray). */
    val traySize: Int,
    val mode: ShomaraGameRoundMode,
) {
    init {
        require(roundIndex in 1..TOTAL_ROUNDS) { "round index outside 1..$TOTAL_ROUNDS" }
        require(blankCount >= 0) { "blank count must not be negative" }
        require(traySize >= 0) { "tray size must not be negative" }
    }

    /** «راند N از ۶» — the one round indicator, from counts only. */
    fun roundLabel(): String =
        "راند ${ShomaraDigits.toFa(roundIndex)} از ${ShomaraDigits.toFa(TOTAL_ROUNDS)}"

    companion object {
        const val TOTAL_ROUNDS: Int = 6

        /** The pilot §4 structure as configurable data — counts, not content. */
        fun pilotStructure(): List<ShomaraGameRoundStructure> = listOf(
            ShomaraGameRoundStructure(roundIndex = 1, blankCount = 2, traySize = 3, mode = ShomaraGameRoundMode.Continue),
            ShomaraGameRoundStructure(roundIndex = 2, blankCount = 3, traySize = 2, mode = ShomaraGameRoundMode.Continue),
            ShomaraGameRoundStructure(roundIndex = 3, blankCount = 2, traySize = 2, mode = ShomaraGameRoundMode.Continue),
            ShomaraGameRoundStructure(roundIndex = 4, blankCount = 3, traySize = 2, mode = ShomaraGameRoundMode.Continue),
            ShomaraGameRoundStructure(roundIndex = 5, blankCount = 4, traySize = 3, mode = ShomaraGameRoundMode.Continue),
            ShomaraGameRoundStructure(roundIndex = 6, blankCount = 0, traySize = 0, mode = ShomaraGameRoundMode.FindUnit),
        )
    }
}
