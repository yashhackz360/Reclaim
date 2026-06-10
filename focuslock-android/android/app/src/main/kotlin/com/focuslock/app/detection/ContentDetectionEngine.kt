package com.focuslock.app.detection

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.util.Log

/**
 * ContentDetectionEngine
 *
 * Analyzes accessibility events to determine if short-form content is being shown.
 * Uses package name, window title, and UI node inspection to classify content type.
 */
class ContentDetectionEngine {

    companion object {
        private const val TAG = "ContentDetector"
    }

    data class ContentDetection(
        val packageName: String,
        val contentType: ContentType,
        val label: String,
        val confidence: Float,
    )

    enum class ContentType {
        TIKTOK_FULL,
        YOUTUBE_SHORTS,
        YOUTUBE_SHORTS_SHELF,
        INSTAGRAM_REELS,
        INSTAGRAM_REELS_TAB,
        FACEBOOK_REELS,
        TWITTER_VIDEO_FEED,
        REDDIT_VIDEO_FEED,
        UNKNOWN,
    }

    // ── Package → block target mapping ─────────────────────────────────────────
    private val FULL_APP_BLOCKS = setOf(
        "com.zhiliaoapp.musically",     // TikTok
        "com.ss.android.ugc.trill",     // TikTok (alt)
    )

    fun analyze(
        packageName: String,
        rootNode: AccessibilityNodeInfo,
        event: AccessibilityEvent,
    ): ContentDetection? {
        return when {
            packageName in FULL_APP_BLOCKS ->
                ContentDetection(packageName, ContentType.TIKTOK_FULL, "TikTok", 1.0f)

            packageName == "com.google.android.youtube" ->
                analyzeYouTube(packageName, rootNode, event)

            packageName == "com.instagram.android" ->
                analyzeInstagram(packageName, rootNode, event)

            packageName == "com.facebook.katana" ->
                analyzeFacebook(packageName, rootNode, event)

            packageName == "com.twitter.android" ->
                analyzeTwitter(packageName, rootNode, event)

            packageName == "com.reddit.frontpage" ->
                analyzeReddit(packageName, rootNode, event)

            else -> null
        }
    }

    // ── YouTube Analysis ───────────────────────────────────────────────────────
    private fun analyzeYouTube(pkg: String, root: AccessibilityNodeInfo, event: AccessibilityEvent): ContentDetection? {
        // Check if we're in the Shorts player
        val isShortsPlayer = root.findAccessibilityNodeInfosByText("Shorts").isNotEmpty() ||
            root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_player_page_container").isNotEmpty() ||
            root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/shorts_container").isNotEmpty()

        // Check for Shorts shelf on home feed
        val hasShortsShelf = root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_shelf").isNotEmpty()

        return when {
            isShortsPlayer -> ContentDetection(pkg, ContentType.YOUTUBE_SHORTS, "YouTube Shorts", 0.95f)
            hasShortsShelf -> ContentDetection(pkg, ContentType.YOUTUBE_SHORTS_SHELF, "YouTube Shorts Shelf", 0.8f)
            else -> null
        }
    }

    // ── Instagram Analysis ─────────────────────────────────────────────────────
    private fun analyzeInstagram(pkg: String, root: AccessibilityNodeInfo, event: AccessibilityEvent): ContentDetection? {
        val isReelsPlayer = root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/clips_viewer_view_pager").isNotEmpty()
        val isReelsTab    = root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/clips_tab").isNotEmpty() &&
            root.findAccessibilityNodeInfosByText("Reels").isNotEmpty()

        return when {
            isReelsPlayer -> ContentDetection(pkg, ContentType.INSTAGRAM_REELS, "Instagram Reels", 0.95f)
            isReelsTab    -> ContentDetection(pkg, ContentType.INSTAGRAM_REELS_TAB, "Instagram Reels Tab", 0.85f)
            else -> null
        }
    }

    // ── Facebook Analysis ──────────────────────────────────────────────────────
    private fun analyzeFacebook(pkg: String, root: AccessibilityNodeInfo, event: AccessibilityEvent): ContentDetection? {
        val isReels = root.findAccessibilityNodeInfosByViewId("com.facebook.katana:id/reels_video_player").isNotEmpty() ||
            root.findAccessibilityNodeInfosByText("Reels").isNotEmpty()
        return if (isReels) ContentDetection(pkg, ContentType.FACEBOOK_REELS, "Facebook Reels", 0.85f) else null
    }

    // ── Twitter Analysis ───────────────────────────────────────────────────────
    private fun analyzeTwitter(pkg: String, root: AccessibilityNodeInfo, event: AccessibilityEvent): ContentDetection? {
        val hasVideo = root.findAccessibilityNodeInfosByViewId("com.twitter.android:id/video_player").isNotEmpty()
        return if (hasVideo) ContentDetection(pkg, ContentType.TWITTER_VIDEO_FEED, "X/Twitter Video", 0.75f) else null
    }

    // ── Reddit Analysis ────────────────────────────────────────────────────────
    private fun analyzeReddit(pkg: String, root: AccessibilityNodeInfo, event: AccessibilityEvent): ContentDetection? {
        val hasVideo = root.findAccessibilityNodeInfosByViewId("com.reddit.frontpage:id/video_player").isNotEmpty()
        return if (hasVideo) ContentDetection(pkg, ContentType.REDDIT_VIDEO_FEED, "Reddit Video", 0.7f) else null
    }
}
