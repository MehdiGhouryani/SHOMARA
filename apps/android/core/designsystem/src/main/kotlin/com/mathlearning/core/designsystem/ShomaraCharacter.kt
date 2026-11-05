package com.mathlearning.core.designsystem

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp

/**
 * Shared character rendering (N08-15, task §5).
 *
 * Source of truth for which approved artwork exists: `docs/design-handoff-2026-10/pages-v1/manifest.json`
 * (ADR-0035 cast — Main, Number, Dana, Fandogh, Roka) and the committed files under
 * `docs/design-handoff-2026-10/assets/characters/<Family>/`. Only shipped poses are referenced by
 * [ShomaraCharacterDrawables]; the component never invents a missing pose and never claims
 * animation it does not have.
 *
 * Honest limits (recorded, not hidden):
 *  - There are no `.riv` files and no Rive runtime in this project, so this component is static
 *    artwork only; no skeletal animation is implied or supported.
 *  - `project-design-v2/assets/characters/` (aria/qbo/dana/jiko) is the cast superseded by
 *    ADR-0035 and is NOT used by the UI.
 */
enum class ShomaraCharacter(val family: String, val displayNameFa: String) {
    /** The guide character "Number" — the focal character of the splash and of teaching screens. */
    Number(family = "Number", displayNameFa = "نمبر"),

    /** The main companion. */
    Main(family = "Main", displayNameFa = "مِین"),
    ;

    val dir: String get() = "characters/${family.lowercase()}"
}

/** The approved pose catalogue that exists in the design handoff for each character. */
object ShomaraCharacterPoses {
    private val catalog: Map<ShomaraCharacter, Set<Int>> = mapOf(
        ShomaraCharacter.Main to (1..18).toSet(),
        ShomaraCharacter.Number to (1..18).toSet(),
    )

    fun exists(character: ShomaraCharacter, poseId: Int): Boolean =
        catalog[character]?.contains(poseId) == true

    /** Two-digit pose label, matching the file naming convention of the handoff. */
    fun labelFor(poseId: Int): String = String.format("%02d", poseId)

    /** Handoff asset path for a pose, or null when the pose is not part of the approved catalog. */
    fun assetPath(character: ShomaraCharacter, poseId: Int): String? = if (exists(character, poseId)) {
        "${character.dir}/${character.family}_${labelFor(poseId)}_app_800"
    } else {
        null
    }

    /** True only when this build actually ships the artwork for that pose. */
    fun isShipped(character: ShomaraCharacter, poseId: Int): Boolean =
        ShomaraCharacterDrawables.poseFor(character, poseId) != null
}

/**
 * Placement slots, one source for every screen (design/MASTER.md §3; CHARACTER-BIBLE §6: lesson
 * guide ≤96dp, home/intro 128–180dp, never under 72dp so a full figure is always shown).
 */
enum class ShomaraCharacterSlot(val size: Dp) {
    Inline(ShomaraTokens.ComponentNodeSize),
    Lesson(ShomaraTokens.ComponentNodeCurrent),
    Hero(ShomaraTokens.ComponentCharacterHero),
    ;

    companion object {
        fun forContentWidth(widthDp: Dp): ShomaraCharacterSlot = when {
            widthDp < ShomaraTokens.ComponentCharacterCompactWidth -> Inline
            widthDp < ShomaraTokens.ComponentCharacterRegularWidth -> Lesson
            else -> Hero
        }
    }
}

/**
 * Renders one approved character pose.
 *
 * The image is supporting decoration in most copy (TalkBack should read the sentence, not a
 * picture), but when it is the focal object — splash, station intro — the caller passes
 * `decorative = false` and the character announces itself with a real label. That is a deliberate
 * per-screen decision, never a default.
 */
@Composable
fun ShomaraCharacterImage(
    character: ShomaraCharacter,
    poseId: Int,
    slot: ShomaraCharacterSlot,
    modifier: Modifier = Modifier,
    decorative: Boolean = true,
    stateLabel: String? = null,
) {
    val painter: Painter? = ShomaraCharacterDrawables.poseFor(character, poseId)?.let { painterResource(it) }
    Box(
        modifier = modifier
            .size(slot.size)
            .semantics(mergeDescendants = true) {
                if (!decorative) {
                    role = Role.Image
                    // F-38: TalkBack hears the character's name only — the pose number is a
                    // file-naming detail, not something the child needs announced.
                    contentDescription = character.displayNameFa
                }
                if (!stateLabel.isNullOrEmpty()) stateDescription = stateLabel
            },
        contentAlignment = Alignment.Center,
    ) {
        if (painter != null) {
            Image(
                painter = painter,
                // The wrapper owns the accessibility; the raw bitmap never speaks twice.
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            MissingCharacterPlaceholder(modifier = Modifier.fillMaxSize())
        }
    }
}

/** Honest missing-art state: no fake character, no invented pose, no broken-image glyph. */
@Composable
private fun MissingCharacterPlaceholder(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = ShomaraCharacterStrings.MissingArt,
            style = ShomaraTypography.Caption,
            color = ShomaraTokens.ColorMuted,
            textAlign = TextAlign.Center,
        )
    }
}

/** Seed strings for the character surface (canonical-source overrides arrive with CMS). */
object ShomaraCharacterStrings {
    const val MissingArt: String = "این قاب از شخصیت هنوز تأیید نشده است."
}
