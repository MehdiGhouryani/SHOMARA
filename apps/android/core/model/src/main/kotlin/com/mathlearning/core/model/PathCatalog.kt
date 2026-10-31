package com.mathlearning.core.model

/**
 * Canonical path metadata (N05-09): the 25 station IDs are FIXED (content-library
 * `stations-index.json`; CONTENT-004 keeps IDs stable) and the five chapter bands group five
 * stations each (ST(5k+1)..ST(5k+5), mirroring the "ST k maps to unit k" proposal).
 *
 * CONTENT-004 honesty: station titles are the content-library `workingTitle` values, marked
 * [StationNodeMeta.provisional] — the UI presents them as-is and invents no book-matching
 * claims. Chapter bands use structural labels («فصل ۱»..«فصل ۵»); a final owner rename stays a
 * non-blocking input and must not silently change IDs.
 */
data class StationNodeMeta(
    val id: String,
    val workingTitle: String,
    val chapter: Int,
    val ordinal: Int,
    val provisional: Boolean = true,
) {
    init {
        require(id.matches(Regex("ST\\d{2}"))) { "station id must be the fixed STxx form" }
        require(chapter in 1..ShomaraStationCatalog.CHAPTER_COUNT) { "chapter out of range" }
        require(ordinal in 1..ShomaraStationCatalog.STATION_COUNT) { "ordinal out of range" }
    }

    val chapterLabel: String get() = ShomaraChapterCatalog.labelFor(chapter)
}

object ShomaraStationCatalog {
    const val STATION_COUNT: Int = 25
    const val CHAPTER_COUNT: Int = 5
    const val STATIONS_PER_CHAPTER: Int = 5

    /** Source: content-library/derived/stations-index.json (IDs fixed per CONTENT-004). */
    val Stations: List<StationNodeMeta> = listOf(
        "شمارش و الگو", "جایگاه و جهت", "عدد و جمع", "شکل‌ها و ویژگی‌ها", "جمع و تفریق",
        "جمع با مهره‌ها", "عددهای ۱ و ۲", "عددهای ۳ و ۴", "صفر و ۵", "عددهای ۶ و ۷",
        "برابری و عدد ۸", "مقایسه و عدد ۹", "نشانهٔ جمع", "تفریق و طول", "گروه‌بندی",
        "ساعت و عددها", "جمع چندبخشی", "الگو و زمان", "ده‌تایی‌ها و خرید", "عددهای دو رقمی",
        "عددهای ۱ تا ۱۰۰", "تقویم و شمارش", "شمارش گروهی", "مسئله‌های چندمرحله‌ای", "عدد ۱۰۰",
    ).mapIndexed { index, title ->
        val ordinal = index + 1
        StationNodeMeta(
            id = "ST%02d".format(ordinal),
            workingTitle = title,
            chapter = (index / STATIONS_PER_CHAPTER) + 1,
            ordinal = ordinal,
        )
    }

    fun station(id: String): StationNodeMeta =
        Stations.firstOrNull { it.id == id } ?: throw IllegalArgumentException("unknown station $id")

    fun chapterOf(stationId: String): Int = station(stationId).chapter

    fun stationsInChapter(chapter: Int): List<StationNodeMeta> =
        Stations.filter { it.chapter == chapter }.also { require(it.size == STATIONS_PER_CHAPTER) { "chapter $chapter band corrupted" } }
}

object ShomaraChapterCatalog {
    /** Structural labels only — CONTENT-004 chapter naming stays with the owner. */
    fun labelFor(chapter: Int): String {
        require(chapter in 1..ShomaraStationCatalog.CHAPTER_COUNT) { "chapter out of range" }
        return "فصل ${toFa(chapter)}"
    }

    val All: List<Int> = (1..ShomaraStationCatalog.CHAPTER_COUNT).toList()

    private fun toFa(value: Int): String {
        val persian = charArrayOf('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹')
        return value.toString().map { persian[it - '0'] }.joinToString("")
    }
}
