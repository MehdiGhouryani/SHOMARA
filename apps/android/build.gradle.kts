plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.compose.compiler) apply false
}

// P7 (ADR-0045): repeatable content-pipeline entrypoint from the Android build.
// The validator is Node-based (tools/content-pipeline); this task shells out to the same CLI
// npm runs — one canonical implementation, two entrypoints.
tasks.register<Exec>("contentPipelineValidate") {
    group = "verification"
    description = "Validates the typed authoring artifacts (ST07 prototype) via the content pipeline CLI."
    workingDir = rootProject.projectDir.parentFile.parentFile
    commandLine("node", rootProject.projectDir.parentFile.parentFile.resolve("tools/content-pipeline/cli.mjs").absolutePath, "validate", "ST07", "--machine-only")
}
