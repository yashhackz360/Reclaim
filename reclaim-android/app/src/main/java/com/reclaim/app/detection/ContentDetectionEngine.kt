package com.reclaim.app.detection

/**
 * ContentDetectionEngine
 *
 * Per-platform detection logic for short-form video content.
 * Keeps detection rules isolated and unit-testable.
 *
 * Each detector returns true when the current window/event indicates
 * the user is viewing disallowed content.
 */
object ContentDetectionEngine {

  // ─── Platform Package IDs ───────────────────────────────────────────────────

  const val PKG_YOUTUBE   = "com.google.android.youtube"
  const val PKG_INSTAGRAM = "com.instagram.android"
  const val PKG_TIKTOK    = "com.zhiliaoapp.musically"
  const val PKG_FACEBOOK  = "com.facebook.katana"
  const val PKG_TWITTER   = "com.twitter.android"
  const val PKG_REDDIT    = "com.reddit.frontpage"

  val WATCHED_PACKAGES = setOf(
    PKG_YOUTUBE, PKG_INSTAGRAM, PKG_TIKTOK, PKG_FACEBOOK, PKG_TWITTER, PKG_REDDIT
  )

  // ─── Detection Rules ────────────────────────────────────────────────────────

  /**
   * Returns true if the given event signals short-form video content.
   *
   * @param packageName The package name of the active app window
   * @param className   The class name of the active view/activity
   * @param contentDesc Optional content description from the accessibility node
   */
  fun isDistractionContent(
    packageName: String?,
    className: String?,
    contentDesc: String? = null
  ): Boolean {
    if (packageName == null) return false
    return when (packageName) {
      PKG_YOUTUBE   -> isYouTubeShorts(className, contentDesc)
      PKG_INSTAGRAM -> isInstagramReels(className, contentDesc)
      PKG_TIKTOK    -> isTikTok()
      PKG_FACEBOOK  -> isFacebookReels(className, contentDesc)
      PKG_TWITTER   -> isTwitterVideo(className, contentDesc)
      PKG_REDDIT    -> isRedditVideoFeed(className, contentDesc)
      else          -> false
    }
  }

  // ─── YouTube Shorts ─────────────────────────────────────────────────────────
  // Shorts surface: activity class contains "Shorts" or content description
  // matches known Shorts view IDs. The window title also contains "Shorts".
  private fun isYouTubeShorts(className: String?, contentDesc: String?): Boolean {
    val clsHit = className?.contains("shorts", ignoreCase = true) == true
    val descHit = contentDesc?.contains("shorts", ignoreCase = true) == true
    return clsHit || descHit
  }

  // ─── Instagram Reels ────────────────────────────────────────────────────────
  // Reels tab: class or content description contains "reel" or the known
  // view ID fragment "clips_tab".
  private fun isInstagramReels(className: String?, contentDesc: String?): Boolean {
    val clsHit  = className?.contains("reel", ignoreCase = true) == true
    val descHit = contentDesc?.let {
      it.contains("reel", ignoreCase = true) || it.contains("clips_tab", ignoreCase = true)
    } == true
    return clsHit || descHit
  }

  // ─── TikTok ─────────────────────────────────────────────────────────────────
  // TikTok's entire experience is short-form video — block all of it.
  private fun isTikTok(): Boolean = true

  // ─── Facebook Reels ─────────────────────────────────────────────────────────
  private fun isFacebookReels(className: String?, contentDesc: String?): Boolean {
    return className?.contains("reel", ignoreCase = true) == true ||
      contentDesc?.contains("reel", ignoreCase = true) == true
  }

  // ─── X (Twitter) Video Feed ─────────────────────────────────────────────────
  private fun isTwitterVideo(className: String?, contentDesc: String?): Boolean {
    return className?.contains("video", ignoreCase = true) == true ||
      contentDesc?.contains("for you", ignoreCase = true) == true
  }

  // ─── Reddit Video Feed ──────────────────────────────────────────────────────
  private fun isRedditVideoFeed(className: String?, contentDesc: String?): Boolean {
    return className?.contains("video", ignoreCase = true) == true ||
      contentDesc?.contains("watch", ignoreCase = true) == true
  }
}
