plugins {
    alias(libs.plugins.android.library)
}

android {
    namespace = "com.mathlearning.sync"
    compileSdk = 37

    defaultConfig { minSdk = 24 }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:model"))
    implementation(project(":core:database"))
    implementation(libs.kotlinx.coroutines.core)

    testImplementation(libs.junit4)
    testImplementation(libs.kotlinx.coroutines.test)
}
