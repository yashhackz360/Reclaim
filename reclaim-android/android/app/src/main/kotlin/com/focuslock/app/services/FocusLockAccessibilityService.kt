package com.focuslock.app.services

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.util.Log
import android.view.accessibility.AccessibilityEvent

/**
 * Reclaim Accessibility Service
 * Stub implementation — full detection engine coming in v1.0.
 */
class FocusLockAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "ReclaimA11y"
        var instance: FocusLockAccessibilityService? = null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "Reclaim Accessibility Service connected")

        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                         AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            notificationTimeout = 100
            packageNames = arrayOf(
                "com.zhiliaoapp.musically",
                "com.instagram.android",
                "com.facebook.katana",
                "com.google.android.youtube",
                "com.twitter.android",
                "com.reddit.frontpage",
            )
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        // Detection engine will be implemented in v1.0
        Log.d(TAG, "Event from: ${event.packageName}")
    }

    override fun onInterrupt() {
        Log.w(TAG, "Reclaim Accessibility Service interrupted")
        instance = null
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        Log.i(TAG, "Reclaim Accessibility Service destroyed")
    }
}
