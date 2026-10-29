plugins {
    alias(libs.plugins.android.library)
}

android {
    namespace = "com.mathlearning.core.testing"
    compileSdk = 37

    defaultConfig { minSdk = 24 }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    api(project(":core:common"))
    api(project(":core:model"))
    api(libs.junit4)
}
