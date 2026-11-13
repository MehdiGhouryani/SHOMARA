package com.mathlearning.app.preview

import android.content.Context
import com.mathlearning.core.contentpackage.loader.ContentPackageActivator
import com.mathlearning.core.contentpackage.loader.ContentPackageLoader
import com.mathlearning.core.contentpackage.manifest.PackageManifestParser
import com.mathlearning.core.contentpackage.signing.PackageSignatureVerifier
import com.mathlearning.core.contentpackage.signing.TrustedPackageKeys
import com.mathlearning.core.contentpackage.validation.ContentPackageValidator
import com.mathlearning.core.database.repo.RoomAudioAssetRepository
import com.mathlearning.core.database.repo.RoomContentPackageRegistryRepository
import com.mathlearning.core.database.repo.RoomLessonRecordRepository
import com.mathlearning.core.database.repo.RoomProgressRepository
import com.mathlearning.core.learning.checkpoint.SessionCheckpointManager
import com.mathlearning.core.learning.checkpoint.SessionCheckpointStore
import com.mathlearning.core.learning.engine.AttemptResult
import com.mathlearning.core.learning.engine.LessonSessionState
import com.mathlearning.core.learning.engine.LocalLessonEngine
import com.mathlearning.core.learning.evaluator.EvaluationOutcome
import com.mathlearning.core.learning.evaluator.LearnerResponse
import com.mathlearning.core.learning.evaluator.LocalLessonEvaluator
import com.mathlearning.core.learning.evaluator.NextAction
import com.mathlearning.core.learning.progression.PolicyArea
import com.mathlearning.core.learning.progression.PolicyGate
import com.mathlearning.core.learning.progression.PolicyNotApprovedException
import com.mathlearning.core.learning.recovery.RecoverySelector
import com.mathlearning.core.model.repository.LessonSessionRecord
import com.mathlearning.core.model.repository.RecordedAttempt
import java.io.File
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.Signature
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject

/**
 * ST07 VERTICAL SLICE (debug-only, P8) — proves the whole infrastructure chain with the real
 * ST07 DRAFT pilot content, end to end:
 *
 *   on-device draft package build (EPHEMERAL self-signed key — debug trust only) →
 *   ContentPackageActivator (stage → verify → atomic pointer) → ContentPackageLoader (re-verify)
 *   → child projection → LocalLessonEngine (P1..P5) → interaction states → debug evaluator layer
 *   → Room v3 attempts (one transaction per attempt, idempotent) → checkpoint suspend/resume.
 *
 * HONESTY BOUNDARIES (owner P8 mission):
 *  - DRAFT content lives in DEBUG assets only; the release build has no draft assets and an EMPTY
 *    trust set, so release keeps failing closed until real APPROVED packages exist.
 *  - T15 evaluation uses the pilot answers INSIDE this debug evaluator layer (O1 option-1 shape,
 *    never logged/surfaced — extractability risk recorded in ADR-0044).
 *  - T13 (stroke), T01 (tray), and anything untranscribed surface honest "not implemented /
 *    not transcribed" states — NOTHING is faked to complete a demo.
 *  - Progression/mastery POLICIES stay gated (CONTENT-014): stage advancement here is the
 *    engine's manual-progression mechanic, not an approved unlock policy.
 */
object St07VerticalSlice {

    const val DRAFT_ASSET_DIR = "content"
    const val KEY_ID = "debug-ephemeral"
    const val ENGINE_RULE_VERSION = "learning-engine:v1"

    /** One debug trust slot for the ephemeral self-signed package (never in release). */
    fun debugTrust(keyPair: KeyPair): TrustedPackageKeys =
        TrustedPackageKeys(mapOf(KEY_ID to keyPair.public))

    /** Builds the draft package on-device from debug assets and signs it with the ephemeral key. */
    fun buildDraftPackage(context: Context, stagingDir: File, keyPair: KeyPair): File {
        fun readDraft(relative: String): ByteArray = try {
            context.assets.open(relative).readBytes()
        } catch (e: java.io.FileNotFoundException) {
            // Unit-test path: Robolectric does not merge variant assets into the test classpath —
            // read the same files from the module source tree (Gradle test cwd = apps/android).
            File("src/debug/assets/$relative").readBytes()
        }
        val stationJson = readDraft("$DRAFT_ASSET_DIR/stations/ST07.json")
        val audioIndexJson = readDraft("$DRAFT_ASSET_DIR/audio/ST07-audio-index.json")
        stagingDir.mkdirs()
        File(stagingDir, "stations/ST07.json").apply { parentFile.mkdirs() }.writeBytes(stationJson)
        File(stagingDir, "audio").mkdirs()
        File(stagingDir, "audio/ST07-audio-index.json").writeBytes(audioIndexJson)

        val files = listOf("stations/ST07.json", "audio/ST07-audio-index.json").map { p ->
            val bytes = File(stagingDir, p).readBytes()
            JSONObject()
                .put("path", p)
                .put("sizeBytes", bytes.size.toLong())
                .put("sha256", ContentChecksumsBridge.sha256Hex(bytes))
        }
        val manifest = JSONObject()
            .put("packageId", "shomara-st07-draft")
            .put("packageVersion", 1)
            .put("schemaVersion", 1)
            .put("minAppVersion", "0.1.0")
            .put("stations", JSONArray(listOf("ST07")))
            .put("files", JSONArray(files))
            .put("signing", JSONObject().put("keyId", KEY_ID).put("algorithm", "SHA256withECDSA"))
        val manifestBytes = manifest.toString().toByteArray(Charsets.UTF_8)
        File(stagingDir, "manifest.json").writeBytes(manifestBytes)
        val signature = Signature.getInstance("SHA256withECDSA")
        signature.initSign(keyPair.private)
        signature.update(manifestBytes)
        File(stagingDir, "manifest.sig").writeText(
            JSONObject()
                .put("keyId", KEY_ID)
                .put("algorithm", "SHA256withECDSA")
                .put("signature", android.util.Base64.encodeToString(signature.sign(), android.util.Base64.NO_WRAP))
                .toString(),
        )
        return stagingDir
    }

    /** The full chain; every step is recorded in the report for the vertical-slice evidence. */
    suspend fun run(context: Context, contentRoot: File, records: RoomLessonRecordRepository, registry: RoomContentPackageRegistryRepository): SliceReport {
        val steps = mutableListOf<String>()
        fun step(name: String, detail: () -> String) { steps += "$name: ${detail()}" }

        // 1. On-device draft package (ephemeral self-signed debug trust).
        val keyPair = KeyPairGenerator.getInstance("EC").apply { initialize(256) }.generateKeyPair().also { St07EphemeralKeys.capture(it) }
        val candidate = buildDraftPackage(context, File(context.filesDir, "slice-candidate"), keyPair)
        step("draft-package", { "built+signed at ${candidate.path} (ephemeral key '$KEY_ID')" })

        // 2. Activator: stage → verify → atomic pointer → registry.
        val activator = ContentPackageActivator(
            contentRoot = contentRoot,
            registry = registry,
            signatureVerifier = PackageSignatureVerifier(debugTrust(keyPair)),
            validator = ContentPackageValidator(currentAppVersion = "0.1.0"),
            nowMs = { 1L },
        )
        val staged = activator.stage(candidate)
        val activated = activator.activate(staged)
        step("activation", { "ACTIVE v${activated.version} (${activated.manifestSha256.take(12)}…); pointer=${ContentPackageActivator.readPointer(contentRoot)?.dir}" })

        // 3. Loader re-verification from the ACTIVE location (cold-start path).
        val pointerDir = File(File(contentRoot, "staging"), ContentPackageActivator.readPointer(contentRoot)!!.dir)
        val loader = ContentPackageLoader(PackageSignatureVerifier(debugTrust(keyPair)), ContentPackageValidator("0.1.0"))
        val verified = loader.loadFromDirectory(pointerDir)
        step("load", { "verified manifest: ${verified.manifest.files.size} files, station ${verified.manifest.stations.single()}" })

        // 4. Projection content (draft, DRAFT-labelled) — the guided items the UI renders.
        val stationJson = JSONObject(File(pointerDir, "stations/ST07.json").readText())
        val guidedItems = stationJson.getJSONArray("guidedItems")
        val audioIndex = JSONObject(File(pointerDir, "audio/ST07-audio-index.json").readText()).getJSONObject("entries")
        val audioCount = audioIndex.keys().asSequence().count()
        step("projection", { "guided items: ${guidedItems.length()}; audio index entries: $audioCount" })

        // 5. Engine walk P1..P5 with the debug evaluator layer (T15 answers stay in THIS layer).
        val evaluator = DebugSt07Evaluator(stationJson)
        val engine = LocalLessonEngine(evaluator)
        var state = engine.createSession(
            com.mathlearning.core.learning.engine.StartSessionCommand("slice-st07", "ST07", MacroStageBridge.order()),
        )
        val attempts = mutableListOf<AttemptResult>()
        // P1 discover: presentation-only (no grading pressure) → manual advance.
        state = engine.advanceStage(state, com.mathlearning.core.model.MacroStage.P1_DISCOVER)
        // P2 guided: 8 items — 4 T15 evaluated, 4 honest gaps.
        for (i in 0 until guidedItems.length()) {
            val item = guidedItems.getJSONObject(i)
            val optionIds = item.optJSONArray("options")?.let { array -> (0 until array.length()).map { array.getJSONObject(it).getString("id") } } ?: emptyList()
            val correctOptionId = item.optString("correctOptionId", "")
            val presented = engine.presentEncounter(state, item.getString("id"), com.mathlearning.core.model.MacroStage.P2_GUIDED)
            // Child-like script: attempt 1 picks the FIRST option; on INCORRECT the retry picks the
            // correct one (immediate feedback shows the right answer — ADR-0039 §6). T13/T01 have
            // no options: the single attempt returns AWAIT_POLICY (honest O1 gap, no retry faked).
            var attemptIndex = 1
            var presentedState = presented
            var result = engine.submitAttempt(presentedState, attemptKey = attemptIndex.toString(), response = LearnerResponse(item.getString("id"), optionIds.firstOrNull(), null))
            attempts += result
            while (result.outcome?.nextAction == NextAction.RETRY && optionIds.isNotEmpty()) {
                state = result.state
                attemptIndex += 1
                val rePresented = engine.presentEncounter(state, item.getString("id"), com.mathlearning.core.model.MacroStage.P2_GUIDED)
                result = engine.submitAttempt(rePresented, attemptKey = attemptIndex.toString(), response = LearnerResponse(item.getString("id"), correctOptionId.ifBlank { optionIds.firstOrNull() }, null))
                attempts += result
            }
            state = result.state
        }
        val correctCount = attempts.count { it.outcome?.correct == true }
        val unsetCount = attempts.count { it.outcome?.nextAction == NextAction.AWAIT_POLICY }
        step("p2-guided", { "${attempts.size} attempts: $correctCount evaluated-correct, $unsetCount honest-gaps (T13/T01 await O1)" })
        state = engine.advanceStage(state, com.mathlearning.core.model.MacroStage.P2_GUIDED)
        // P3 game: deterministic pattern acceptance — no O1 secret required (ShomaraPatternRule).
        val gameAccepted = com.mathlearning.feature.lesson.ShomaraPatternRule.accepts(
            unit = listOf("cake-ring", "candle"),
            placed = listOf("cake-ring", "candle"),
        )
        state = engine.advanceStage(state, com.mathlearning.core.model.MacroStage.P3_GAME)
        step("p3-game", { "T05 pattern accepted=$gameAccepted (deterministic rule); advanced to P4" })
        // P4/P5: honestly not transcribed — the slice records the gap, never fakes completion.
        step("p4-p5", { "stages not transcribed in the draft projection — surfaced as gaps (owner mission)" })

        // 6. Persist every attempt (Room v3, one transaction each, idempotent).
        for (result in attempts) {
            records.recordAttempt(
                LessonSessionRecord(
                    sessionId = state.sessionId, stationId = "ST07", stageCursor = state.stageCursor,
                    lifecycle = state.lifecycle.name, engineRuleVersion = ENGINE_RULE_VERSION,
                    contentPackageVersion = activated.version, startedAtMs = 1L, updatedAtMs = 2L,
                ),
                RecordedAttempt(
                    sessionId = state.sessionId, encounterId = result.attemptKey.split("|")[2],
                    stage = "P2_GUIDED", attemptKey = result.attemptKey, interactionId = "n/a",
                    outcome = result.outcome?.let { if (it.correct) "CORRECT" else "INCORRECT" } ?: "UNSET",
                    evaluatorVersion = result.outcome?.evaluatorVersion ?: "unset", recordedAtMs = 3L,
                ),
            )
        }
        val persisted = records.attemptsFor(state.sessionId).size
        step("persistence", { "attempts persisted: $persisted" })

        // 7. Recovery selection + suspend/resume (checkpoint contract, version-gated).
        val recovery = RecoverySelector().replayQueue(state, emptyMap())
        val checkpoints = SessionCheckpointManager(FileCheckpointStore(context), ENGINE_RULE_VERSION)
        checkpoints.suspendSession(state, encounterId = "resume-point", nowMs = 4L)
        val resumed = checkpoints.resumeSession(state.sessionId, expectedRuleVersion = ENGINE_RULE_VERSION)
        steps += "resume: resumed at ${resumed.encounterId} (cursor ${resumed.stageCursor}); recovery queue: $recovery"

        // 8. Audio missing → honest text fallback (CONTENT-017).
        val audioMissing = ResolversBridge.audioFallback(audioIndex, "ST07.P9.missing")
        step("audio-fallback", { "missing audio → text fallback present=${audioMissing.isNotBlank()}" })

        return SliceReport(steps = steps, attempts = attempts.size, correct = correctCount, gaps = unsetCount)
    }

    data class SliceReport(val steps: List<String>, val attempts: Int, val correct: Int, val gaps: Int)
}

/** Bridges to feature/module helpers without widening their visibility. */
object ContentChecksumsBridge {
    fun sha256Hex(bytes: ByteArray): String = com.mathlearning.core.common.error.ContentChecksums.sha256Hex(bytes)
}

object MacroStageBridge {
    fun order(): List<com.mathlearning.core.model.MacroStage> = com.mathlearning.core.model.MacroStage.entries
}

object ResolversBridge {
    fun audioFallback(audioIndex: JSONObject, audioId: String): String {
        val text = audioIndex.optString(audioId, "")
        return if (text.isNotBlank()) text else "متن این بخش فعلاً جای صدا را می‌گیرد."
    }
}

/**
 * The DEBUG evaluator layer (O1 option-1 shape): pilot answers live ONLY here, never logged or
 * surfaced. T13/T01 interactions return AWAIT_POLICY (honest gap) — never a guessed outcome.
 */
class DebugSt07Evaluator(stationJson: JSONObject) : LocalLessonEvaluator {
    private val answers = HashMap<String, String>()
    private val unimplemented = HashSet<String>()

    init {
        val items = stationJson.getJSONArray("guidedItems")
        for (i in 0 until items.length()) {
            val item = items.getJSONObject(i)
            val answer = item.optJSONObject("answer")
            val correctOptionId = item.optString("correctOptionId", "")
            if (correctOptionId.isNotBlank()) {
                // The correct option ID comes from the draft asset (pilot ground truth) and stays
                // in THIS evaluator layer only — never logged, never surfaced (O1 option-1 shape).
                answers[item.getString("id")] = correctOptionId
            } else if (item.has("interactionNotImplemented")) {
                unimplemented += item.getString("id")
            }
        }
    }

    override fun evaluate(request: com.mathlearning.core.learning.evaluator.EvaluationRequest): EvaluationOutcome {
        val interactionId = request.response.interactionId
        if (interactionId in unimplemented) {
            return EvaluationOutcome(correct = false, nextAction = NextAction.AWAIT_POLICY, evaluatorVersion = "debug-draft-v1")
        }
        val correct = answers[interactionId]?.let { it == request.response.choiceId } ?: false
        return EvaluationOutcome(correct = correct, nextAction = if (correct) NextAction.ADVANCE else NextAction.RETRY, evaluatorVersion = "debug-draft-v1")
    }

}

/** Debug checkpoint store: file-backed (durable across force-stop), same SPI as the DataStore impl. */
class FileCheckpointStore(private val context: Context) : SessionCheckpointStore {
    private fun file(sessionId: String) = File(context.filesDir, "slice-checkpoints/$sessionId.json")
    override fun write(checkpoint: com.mathlearning.core.learning.checkpoint.SessionCheckpoint) {
        file(checkpoint.sessionId).apply { parentFile.mkdirs() }.writeText(
            JSONObject()
                .put("sessionId", checkpoint.sessionId)
                .put("stationId", checkpoint.stationId)
                .put("encounterId", checkpoint.encounterId)
                .put("stage", checkpoint.stage.name)
                .put("stageCursor", checkpoint.stageCursor)
                .put("engineRuleVersion", checkpoint.engineRuleVersion)
                .put("savedAtMs", checkpoint.savedAtMs)
                .toString(),
        )
    }
    override fun read(sessionId: String): com.mathlearning.core.learning.checkpoint.SessionCheckpoint? = try {
        val json = JSONObject(file(sessionId).readText())
        com.mathlearning.core.learning.checkpoint.SessionCheckpoint(
            sessionId = json.getString("sessionId"),
            stationId = json.getString("stationId"),
            encounterId = json.getString("encounterId"),
            stage = com.mathlearning.core.model.MacroStage.valueOf(json.getString("stage")),
            stageCursor = json.getInt("stageCursor"),
            completedEncounterIds = emptySet(),
            mistakes = emptyList(),
            engineRuleVersion = json.getString("engineRuleVersion"),
            savedAtMs = json.getLong("savedAtMs"),
        )
    } catch (e: Exception) { null }
    override fun clear(sessionId: String) { file(sessionId).delete() }
}
