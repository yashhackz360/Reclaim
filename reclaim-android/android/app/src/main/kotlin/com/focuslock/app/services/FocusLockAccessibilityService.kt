package com.focuslock.app.services

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.focuslock.app.overlay.BlockOverlayActivity
import com.focuslock.app.detection.ContentDetectionEngine
import com.focuslock.app.detection.RuleEvaluationEngine
import com.focuslock.app.detection.BlockAction

/**
 * FocusLock Accessibility Service
 *
 * Monitors window and content changes to detect and block short-form content.
 * This service runs as a system service and cannot be killed by the app process.
 */
class FocusLockAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "FocusLockA11y"
        var instance: FocusLockAccessibilityService? = null
    }

    private lateinit var contentDetector: ContentDetectionEngine
    private lateinit var ruleEngine: RuleEvaluationEngine

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "FocusLock Accessibility Service connected")

        contentDetector = ContentDetectionEngine()
        ruleEngine      = RuleEvaluationEngine(applicationContext)

        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                         AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or
                         AccessibilityEvent.TYPE_VIEW_SCROLLED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS
            notificationTimeout = 100
            packageNames = arrayOf(
                "com.zhiliaoapp.musically",        // TikTok
                "com.instagram.android",            // Instagram
                "com.facebook.katana",              // Facebook
                "com.google.android.youtube",       // YouTube
                "com.twitter.android",              // Twitter/X
                "com.reddit.frontpage",             // Reddit
                "com.android.chrome",               // Chrome (for URL detection)
            )
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        val rootNode    = rootInActiveWindow ?: return

        try {
            // Step 1: Detect what type of content is showing
            val detection = contentDetector.analyze(packageName, rootNode, event)
            if (detection == null) {
                rootNode.recycle()
                return
            }

            // Step 2: Evaluate rules against detection
            val action = ruleEngine.evaluate(detection)

            // Step 3: Apply enforcement action
            when (action) {
                BlockAction.BLOCK    -> showBlockOverlay(packageName, detection.label)
                BlockAction.REDIRECT -> redirectToHome()
                BlockAction.WARN     -> showWarningToast(detection.label)
                BlockAction.ALLOW    -> { /* permitted */ }
            }

            // Step 4: Log violation
            if (action != BlockAction.ALLOW) {
                ruleEngine.logViolation(detection)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing event", e)
        } finally {
            rootNode.recycle()
        }
    }

    private fun showBlockOverlay(packageName: String, contentLabel: String) {
        val intent = Intent(this, BlockOverlayActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("package", packageName)
            putExtra("label", contentLabel)
        }
        startActivity(intent)
    }

    private fun redirectToHome() {
        performGlobalAction(GLOBAL_ACTION_HOME)
    }

    private fun showWarningToast(label: String) {
        // Show a brief system overlay notification
        Log.w(TAG, "Warning: $label detected — within allowed time limit")
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted")
        instance = null
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        Log.i(TAG, "Accessibility service destroyed")
        // Attempt to restart via JobScheduler if in hard mode
        ruleEngine.scheduleServiceRestart(applicationContext)
    }
}
