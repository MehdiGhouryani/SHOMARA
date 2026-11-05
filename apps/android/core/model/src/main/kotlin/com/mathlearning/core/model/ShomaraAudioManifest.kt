package com.mathlearning.core.model

/**
 * B12 — pure CSV metadata parser for the audio manifests, staging/admin ONLY.
 *
 * Reads the draft manifests (`content-library/originals/shomara-*-audio-manifest.csv`,
 * 232 rows: 53 + 179) and reports on them. It never plays audio, never promotes a row to a
 * runtime asset, and never touches a binary: the output is a staging report.
 *
 * Rules (stage5 §1.10, item 8; ST07_PILOT_IMPLEMENTATION C4):
 *  - BOM-aware: the global manifest starts with a UTF-8 BOM.
 *  - Unique ids across files (`audio-index.json`: `uniqueAcrossFiles: true`) — duplicates
 *    are reported, never silently merged.
 *  - «Row without a file / file without a row»: a row whose expected audio file is absent
 *    from [knownFiles], and a known file no row references. The expected file name for a
 *    row id is `"$id.opus"` unless the caller passes another [fileNameFor] — the naming
 *    convention itself is not approved anywhere, so it stays a parameter, not a rule.
 */
data class ShomaraAudioManifestRow(
    val id: String,
    val kind: String,
    val textDisplay: String,
    val textTts: String,
    val voice: String,
    val rate: String,
    val status: String,
    val usedBy: String,
    val notes: String,
)

data class ShomaraAudioManifestReport(
    val rows: List<ShomaraAudioManifestRow>,
    /** Ids that appear more than once (across all parsed files — uniqueness is global). */
    val duplicateIds: List<String>,
    /** Row ids whose expected audio file is absent from [knownFiles]. */
    val rowsWithoutFile: List<String>,
    /** Known files no row references (file name without its extension). */
    val filesWithoutRow: List<String>,
    /** Malformed input: wrong column count, empty id, or a header that is not the manifest header. */
    val errors: List<String>,
)

object ShomaraAudioManifest {
    val Header: List<String> = listOf(
        "id", "kind", "text_display", "text_tts", "voice", "rate", "status", "used_by", "notes",
    )

    fun parse(
        csvText: String,
        knownFiles: Set<String> = emptySet(),
        fileNameFor: (String) -> String = { id -> "$id.opus" },
    ): ShomaraAudioManifestReport {
        val errors = mutableListOf<String>()
        val text = csvText.removePrefix("\uFEFF")
        val lines = text.split('\n').map { it.trimEnd('\r') }.filter { it.isNotBlank() }
        if (lines.isEmpty()) return ShomaraAudioManifestReport(emptyList(), emptyList(), emptyList(), emptyList(), listOf("empty manifest"))
        val header = splitLine(lines.first())
        if (header != Header) errors += "unexpected header: ${header.joinToString(",")}"
        val rows = mutableListOf<ShomaraAudioManifestRow>()
        for ((lineNumber, line) in lines.drop(1).withIndex()) {
            val fields = splitLine(line)
            if (fields.size != Header.size) {
                errors += "line ${lineNumber + 2}: ${fields.size} columns, expected ${Header.size}"
                continue
            }
            val row = ShomaraAudioManifestRow(
                id = fields[0], kind = fields[1], textDisplay = fields[2], textTts = fields[3],
                voice = fields[4], rate = fields[5], status = fields[6], usedBy = fields[7], notes = fields[8],
            )
            if (row.id.isBlank()) {
                errors += "line ${lineNumber + 2}: empty id"
                continue
            }
            rows += row
        }
        val duplicateIds = rows.groupingBy { it.id }.eachCount().filter { it.value > 1 }.keys.sorted()
        val rowIds = rows.map { it.id }.toSet()
        val rowsWithoutFile = rows.map { it.id }.filter { fileNameFor(it) !in knownFiles }.distinct().sorted()
        val filesWithoutRow = knownFiles
            .map { it.substringBeforeLast('.', it) }
            .filter { it !in rowIds }
            .distinct().sorted()
        return ShomaraAudioManifestReport(rows, duplicateIds, rowsWithoutFile, filesWithoutRow, errors)
    }

    /** Minimal quote-aware split: handles `"..."` fields and `""` escapes; no other CSV dialect. */
    private fun splitLine(line: String): List<String> {
        val fields = mutableListOf<String>()
        val current = StringBuilder()
        var inQuotes = false
        var i = 0
        while (i < line.length) {
            val char = line[i]
            when {
                char == '"' && inQuotes && i + 1 < line.length && line[i + 1] == '"' -> {
                    current.append('"')
                    i += 2
                }
                char == '"' -> {
                    inQuotes = !inQuotes
                    i += 1
                }
                char == ',' && !inQuotes -> {
                    fields += current.toString()
                    current.clear()
                    i += 1
                }
                else -> {
                    current.append(char)
                    i += 1
                }
            }
        }
        fields += current.toString()
        return fields
    }
}
