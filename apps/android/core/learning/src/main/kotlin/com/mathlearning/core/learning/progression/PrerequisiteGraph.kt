package com.mathlearning.core.learning.progression

/**
 * PrerequisiteGraph (P6) — the STRUCTURAL prerequisite layer. Edges arrive from the content
 * package (never invented here); the engine provides cycle detection + missing-prerequisite
 * queries (decision-free algorithms). An acyclic graph is mandatory: a cycle means the content
 * pipeline produced an impossible unlock order and is rejected at load, not at runtime.
 */
class PrerequisiteGraph(private val edges: Map<String, Set<String>>) {

    init {
        detectCycle()
        edges.forEach { (station, prereqs) ->
            prereqs.forEach { prereq ->
                if (prereq !in edges.keys) {
                    throw MissingPrerequisiteException("station $station requires unknown station '$prereq'")
                }
            }
        }
    }

    fun prerequisitesOf(stationId: String): Set<String> = edges[stationId] ?: emptySet()

    fun missingPrerequisites(stationId: String, completedStations: Set<String>): Set<String> =
        prerequisitesOf(stationId).filter { it !in completedStations }.toSet()

    fun detectCycle() {
        val visiting = HashSet<String>()
        val visited = HashSet<String>()
        fun dfs(node: String) {
            if (node in visiting) throw PrerequisiteCycleException("prerequisite cycle detected at '$node'")
            if (node in visited) return
            visiting += node
            for (prereq in edges[node] ?: emptySet()) dfs(prereq)
            visiting -= node
            visited += node
        }
        edges.keys.forEach(::dfs)
    }
}

class PrerequisiteCycleException(message: String) : Exception(message)
class MissingPrerequisiteException(message: String) : Exception(message)
