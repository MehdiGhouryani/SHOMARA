package com.mathlearning.core.common.error

sealed interface AppError {
    data object Offline : AppError
    data object Unauthorized : AppError
    data class Network(val retryable: Boolean) : AppError
    data class Validation(val field: String? = null) : AppError
    data class Unknown(val incidentId: String? = null) : AppError
}

enum class UserMessageKey {
    OFFLINE,
    SESSION_EXPIRED,
    TRY_AGAIN,
    CHECK_INPUT,
    UNEXPECTED,
}

fun AppError.toUserMessageKey(): UserMessageKey = when (this) {
    AppError.Offline -> UserMessageKey.OFFLINE
    AppError.Unauthorized -> UserMessageKey.SESSION_EXPIRED
    is AppError.Network -> UserMessageKey.TRY_AGAIN
    is AppError.Validation -> UserMessageKey.CHECK_INPUT
    is AppError.Unknown -> UserMessageKey.UNEXPECTED
}
