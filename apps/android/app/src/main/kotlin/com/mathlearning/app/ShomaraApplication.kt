package com.mathlearning.app

import android.app.Application
import com.mathlearning.app.di.AppContainer
import com.mathlearning.app.di.DefaultAppContainer

class ShomaraApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = DefaultAppContainer()
    }
}
