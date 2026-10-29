package com.mathlearning.core.model

@JvmInline
value class StationId private constructor(val value: String) {
    companion object {
        fun parse(value: String): StationId = StationId(requireIdentifier("stationId", value))
    }
}

@JvmInline
value class UnitId private constructor(val value: String) {
    companion object {
        fun parse(value: String): UnitId = UnitId(requireIdentifier("unitId", value))
    }
}

private fun requireIdentifier(name: String, value: String): String {
    require(value.isNotBlank()) { "$name must not be blank" }
    require(value.length <= 128) { "$name is too long" }
    require(value.all { it.isLetterOrDigit() || it in "-_." }) { "$name contains invalid characters" }
    return value
}
