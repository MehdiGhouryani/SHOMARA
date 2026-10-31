pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SHOMARA"

include(":app")
include(":core:common")
include(":core:designsystem")
include(":core:datastore")
include(":core:network")
include(":core:model")
include(":core:testing")
include(":feature:onboarding")
include(":feature:path")
include(":feature:practice")
include(":feature:profile")
include(":feature:settings")
include(":feature:parent")
