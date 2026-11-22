plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.mathlearning.feature.lesson"
    compileSdk = 37

    defaultConfig { minSdk = 24 }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:model"))
    implementation(project(":core:designsystem"))
    implementation(project(":core:network"))
    implementation(project(":core:datastore"))
    implementation(project(":core:database"))

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)

    testImplementation(libs.junit4)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.mockwebserver)

    // F-04 (deep-review follow-up): the lesson-host resume Compose test lives in androidTest,
    // so this module needs the same Compose-test dependencies :app already declares.
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestImplementation(libs.androidx.test.ext.junit)
    // The instrumented tests launch createAndroidComposeRule<ComponentActivity>(); without the
    // test manifest the runner cannot resolve that activity and every test fails before it
    // starts (found on the emulator, 2026-11-22). core:designsystem and feature:path already
    // declare it — this module was the only one missing it.
    androidTestImplementation(libs.androidx.compose.ui.test.manifest)
}
