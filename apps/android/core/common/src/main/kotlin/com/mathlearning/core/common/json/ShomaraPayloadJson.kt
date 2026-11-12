package com.mathlearning.core.common.json

/**
 * Minimal, dependency-free Map<String,String> ⇄ JSON codec for small structured payloads
 * (station-package payloads, outbox operations). Only string values are supported by design:
 * richer structures belong to typed schemas, not loose blobs (ADR-0042).
 */
object ShomaraPayloadJson {

    fun encode(map: Map<String, String>): String {
        val escaped = map.entries
            .sortedBy { it.key }
            .joinToString(",") { (key, value) ->
                "${key.encodeJsonString()}:${value.encodeJsonString()}"
            }
        return "{$escaped}"
    }

    fun decode(json: String): Map<String, String> {
        val trimmed = json.trim()
        if (trimmed == "{}") return emptyMap()
        require(trimmed.startsWith("{") && trimmed.endsWith("}")) { "payload json is not an object" }
        val body = trimmed.substring(1, trimmed.length - 1)
        if (body.isBlank()) return emptyMap()
        val result = LinkedHashMap<String, String>()
        var index = 0
        while (index < body.length) {
            val key = body.readString(index).also { index = it.second }.first
            require(index < body.length && body[index] == ':') { "payload json missing ':' after key" }
            index += 1
            val value = body.readString(index).also { index = it.second }.first
            result[key] = value
            if (index < body.length) {
                require(body[index] == ',') { "payload json expected ',' between entries" }
                index += 1
            }
        }
        return result
    }

    /** Reads a JSON string starting at [start]; returns the decoded value and the next index. */
    private fun String.readString(start: Int): Pair<String, Int> {
        require(this[start] == '"') { "payload json expected a quoted string" }
        val builder = StringBuilder()
        var index = start + 1
        while (index < this.length) {
            val ch = this[index]
            when {
                ch == '"' -> return builder.toString() to (index + 1)
                ch == '\\' -> {
                    val next = this[index + 1]
                    builder.append(
                        when (next) {
                            '"' -> '"'
                            '\\' -> '\\'
                            '/' -> '/'
                            'n' -> '\n'
                            't' -> '\t'
                            'r' -> '\r'
                            else -> throw IllegalArgumentException("payload json bad escape \\$next")
                        },
                    )
                    index += 2
                }
                else -> {
                    builder.append(ch)
                    index += 1
                }
            }
        }
        throw IllegalArgumentException("payload json unterminated string")
    }

    private fun String.encodeJsonString(): String {
        val builder = StringBuilder("\"")
        for (ch in this) {
            when (ch) {
                '"' -> builder.append("\\\"")
                '\\' -> builder.append("\\\\")
                '\n' -> builder.append("\\n")
                '\t' -> builder.append("\\t")
                '\r' -> builder.append("\\r")
                else ->
                    if (ch < ' ') builder.append("\\u%04x".format(ch.code)) else builder.append(ch)
            }
        }
        return builder.append("\"").toString()
    }
}
