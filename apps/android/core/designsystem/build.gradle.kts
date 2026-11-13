plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.mathlearning.core.designsystem"
    compileSdk = 37

    defaultConfig {
        minSdk = 24
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(libs.androidx.compose.ui.tooling.preview)
    debugImplementation(libs.androidx.compose.ui.tooling)
    api(platform(libs.androidx.compose.bom))
    api(libs.androidx.compose.ui)
    api(libs.androidx.compose.material3)

    // N08-05: BackHandler lives here so every feature shares one back-gesture policy instead of
    // each one registering its own (previously: none at all).
    // core-ktx / lifecycle / savedstate are declared alongside it so the graph resolves to the
    // versions this project already pins; activity-compose alone would drag in older ones.
    api(libs.androidx.activity.compose)
    api(libs.androidx.core.ktx)
    api(libs.androidx.lifecycle.runtime.compose)
    api(libs.androidx.savedstate)

    testImplementation(libs.junit4)

    // N08-02: Compose semantics tests are instrumented (androidTest) — the
    // Compose test API resolves only for the android variant (jvmStubs are
    // empty). Runs on device/emulator via :core:designsystem:connectedCheck.
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.compose.ui.test.manifest)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestImplementation(libs.junit4)
}
