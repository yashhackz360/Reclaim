package com.reclaim.app.services

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.google.firebase.functions.FirebaseFunctions
import com.reclaim.app.detection.ContentDetectionEngine

/**
 * FocusLockAccessibilityService
 *
 * Monitors window state changes across watched packages (YouTube, Instagram,
 * TikTok, Facebook, X, Reddit). When short-form video content is detected,
 * it navigates back immediately and logs the violation to the Firebase backend
 * via the `logViolation` callable Cloud Function.
 *
 * Setup:
 *   User must enable this service in Android Settings → Accessibility.
 *   The onboarding nudge in MainActivity deep-links to Settings when not enabled.
 */
class FocusLockAccessibilityService : AccessibilityService() {

  companion object {
    private const val TAG = "FocusLock"
  }

  private val functions by lazy { FirebaseFunctions.getInstance() }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  override fun onServiceConnected() {
    super.onServiceConnected()
    Log.i(TAG, "FocusLock service connected — watching ${ContentDetectionEngine.WATCHED_PACKAGES}")
  }

  // ─── Event Handling ─────────────────────────────────────────────────────────

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    event ?: return

    // Only act on window state changes
    if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
      event.eventType != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
    ) return

    val pkg         = event.packageName?.toString() ?: return
    val className   = event.className?.toString()
    val contentDesc = event.contentDescription?.toString()

    // Skip non-watched packages for efficiency
    if (pkg !in ContentDetectionEngine.WATCHED_PACKAGES) return

    if (ContentDetectionEngine.isDistractionContent(pkg, className, contentDesc)) {
      Log.i(TAG, "Distraction detected: pkg=$pkg class=$className — blocking")
      blockContent(pkg)
    }
  }

  override fun onInterrupt() {
    Log.w(TAG, "FocusLock service interrupted")
  }

  // ─── Block Action ────────────────────────────────────────────────────────────

  /**
   * Navigate back immediately to exit the distracting content,
   * then log the violation to Firebase.
   */
  private fun blockContent(platform: String) {
    performGlobalAction(GLOBAL_ACTION_BACK)
    logViolationToBackend(platform)
  }

  // ─── Firebase Backend Integration ────────────────────────────────────────────

  /**
   * Calls the `logViolation` Firebase Cloud Function.
   * The backend increments daily analytics and updates the streak tracker.
   *
   * Firestore document path: analytics/{uid}/daily/{date}
   * Fields updated: videosBlocked, minutesSaved, violationAttempts, violationsByPlatform
   */
  private fun logViolationToBackend(platform: String) {
    val data = hashMapOf(
      "platform"  to platform,
      "url"       to "",
      "timestamp" to System.currentTimeMillis()
    )

    functions
      .getHttpsCallable("logViolation")
      .call(data)
      .addOnSuccessListener {
        Log.d(TAG, "Violation logged: platform=$platform")
      }
      .addOnFailureListener { e ->
        // Non-fatal: log locally, don't crash the service
        Log.e(TAG, "Failed to log violation: ${e.message}")
      }
  }
}
