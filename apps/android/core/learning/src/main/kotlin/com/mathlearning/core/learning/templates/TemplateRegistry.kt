package com.mathlearning.core.learning.templates

/**
 * TemplateRegistry (P6) — versioned registry of template adapters. Templates are VERSIONED and
 * independently tested (owner P6 mission): a registry entry is (templateId, templateVersion) and
 * the engine refuses unknown or mismatched versions — content/evaluator version mismatch fails
 * closed instead of guessing.
 */
class TemplateRegistry {

    private val entries = LinkedHashMap<Pair<String, Int>, TemplateAdapter>()

    fun register(adapter: TemplateAdapter) {
        val key = adapter.templateId to adapter.templateVersion
        check(key !in entries) { "template already registered: $key" }
        entries[key] = adapter
    }

    fun require(templateId: String, templateVersion: Int): TemplateAdapter =
        entries[templateId to templateVersion]
            ?: throw TemplateNotFoundException("template $templateId v$templateVersion is not registered (registered: ${entries.keys})")

    fun registeredIds(): Set<Pair<String, Int>> = entries.keys.toSet()
}

interface TemplateAdapter {
    val templateId: String
    val templateVersion: Int
    /** Structural validation of a response FOR THIS TEMPLATE — shape only, no correctness. */
    fun validateResponseShape(response: TemplateResponse)
}

data class TemplateResponse(val interactionId: String, val choiceId: String?, val responseRef: String?)

class TemplateNotFoundException(message: String) : Exception(message)
