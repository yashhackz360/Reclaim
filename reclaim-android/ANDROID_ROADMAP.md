# Reclaim Android — Build Roadmap

**Status:** v0.3 — Native Kotlin/Jetpack Compose 🚀  
Migrated from Flutter to native Android (Kotlin + Jetpack Compose). The old Flutter build environment, JNI conflicts, and pubspec issues are fully retired. This document tracks current state and the remaining work to reach a full production release.

---

## Migration Summary

| | Old (v0.2.x Flutter) | New (v0.3 Native Kotlin) |
|---|---|---|
| UI Framework | Flutter / Dart | Jetpack Compose |
| Build System | Flutter Gradle plugin | Standard Android Gradle (KTS) |
| Build Issues | JNI / NDK conflicts, SDK 35/36 mismatch | ✅ Clean Gradle sync |
| Package ID | `com.reclaim.app` (Kotlin side) | `com.reclaim.app` (unified) |
| Theme | Flutter Material | Material 3 (dark, Compose) |
| Firebase | Not wired | Firebase AI + Firebase Functions |

---

## Current State

| Layer | Status | Notes |
|-------|--------|-------|
| Jetpack Compose UI (Kotlin) | ✅ Done | Dashboard, stats card, focus button, onboarding nudge |
| Material 3 theme (dark) | ✅ Done | Slate900/800, FocusBlue, CalmTeal, WarningRose palette |
| Gradle build scaffold | ✅ Done | AGP KTS, KSP, Compose, Firebase, Secrets plugin |
| Package namespace | ✅ Done | `com.reclaim.app` across all files |
| Firebase initialization | ✅ Done | `FirebaseApp.initializeApp()` in `onCreate` |
| AccessibilityService declared | ✅ Done | Manifest + `accessibility_service_config.xml` |
| ContentDetectionEngine | ✅ Done | YouTube, Instagram, TikTok, Facebook, X, Reddit |
| FocusLockAccessibilityService | ✅ Done | Window event listener + back navigation + logViolation call |
| Onboarding nudge | ✅ Done | Deep-link to Accessibility Settings when service not enabled |
| Firebase Auth | 🔲 Pending | Login/register screen for streak + analytics sync |
| Firestore streak display | 🔲 Pending | Read `streaks/{uid}` and show on dashboard |
| Accountability partner UI | 🔲 Pending | View/send unlock requests from Android |
| Room local analytics cache | 🔲 Pending | Offline storage before syncing to Firestore |
| Signed APK / CI release | 🔲 Pending | GitHub Actions build + upload to releases |

---

## Plan of Action

### Phase 1 — Firebase Auth (Est: 2–3 hrs)

- [ ] Add `google-services.json` to `app/` (from Firebase Console)
- [ ] Add `FirebaseAuth` login screen (email/Google sign-in)
- [ ] Pass `uid` from Auth to `FocusLockAccessibilityService` for `logViolation` calls
- [ ] Store `fcmToken` in Firestore `users/{uid}` on first login

### Phase 2 — Live Dashboard Stats (Est: 2–3 hrs)

- [ ] Create a `DashboardViewModel` with `StateFlow`
- [ ] Read `analytics/{uid}/daily/{today}` from Firestore on app open
- [ ] Replace hardcoded "2.5 hrs" / "43 distractions" with live data
- [ ] Read `streaks/{uid}` and display current streak badge

### Phase 3 — Accountability Partner UI (Est: 3–4 hrs)

- [ ] List screen: show current `block_rules` from Firestore
- [ ] Unlock request flow: POST to `unlock_requests` collection
- [ ] Partner view: approve/reject incoming requests
- [ ] Push notifications: receive FCM and route to `UnlockRequest` screen

### Phase 4 — Room Local Cache (Est: 1–2 hrs)

- [ ] Define `ViolationEntity` with Room
- [ ] Buffer violations locally when offline
- [ ] Sync buffer to Firebase on connectivity restore

### Phase 5 — Release (Est: 1 hr)

- [ ] Generate launcher icons with correct Reclaim brand
- [ ] Sign with upload key — set `KEYSTORE_PATH`, `STORE_PASSWORD`, `KEY_PASSWORD` in CI secrets
- [ ] GitHub Actions workflow: build APK → upload to `v0.3.0` release
- [ ] Update web download link from `v0.2.6-alpha` to `v0.3.0`

---

## Key Files

| File | Purpose |
|------|---------|
| [`app/src/main/java/com/reclaim/app/MainActivity.kt`](./app/src/main/java/com/reclaim/app/MainActivity.kt) | Compose entry point, accessibility check, onboarding nudge |
| [`app/src/main/java/com/reclaim/app/services/FocusLockAccessibilityService.kt`](./app/src/main/java/com/reclaim/app/services/FocusLockAccessibilityService.kt) | Core blocking service — window event listener + Firebase logging |
| [`app/src/main/java/com/reclaim/app/detection/ContentDetectionEngine.kt`](./app/src/main/java/com/reclaim/app/detection/ContentDetectionEngine.kt) | Per-platform detection logic (YouTube, Instagram, TikTok, etc.) |
| [`app/src/main/java/com/reclaim/app/ui/theme/`](./app/src/main/java/com/reclaim/app/ui/theme/) | Material 3 color scheme, typography, dark theme |
| [`app/src/main/res/xml/accessibility_service_config.xml`](./app/src/main/res/xml/accessibility_service_config.xml) | Accessibility service metadata & package filter |
| [`app/build.gradle.kts`](./app/build.gradle.kts) | Gradle config — SDK, dependencies, secrets |
| [`.env.example`](./.env.example) | Gemini API key template |

---

## Testing the Build Locally

```bash
# Open in Android Studio
# File → Open → select reclaim-android/

# Or from command line (requires ANDROID_HOME set):
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk

# Verify accessibility service visible
adb shell settings get secure enabled_accessibility_services
```

---

## Backend Integration Reference

The Android app calls the following Firebase Cloud Functions (defined in `reclaim-backend/functions/index.js`):

| Function | Trigger | Called From |
|---|---|---|
| `logViolation` | HTTPS Callable | `FocusLockAccessibilityService` on each block |
| `onUserCreate` | Auth trigger | Runs automatically on first sign-in |
| `dailyStreakEvaluator` | Pub/Sub 00:00 UTC | Server-side — evaluates yesterday's violations |

---

Estimated total effort to reach full v0.3 production: **8–10 hours**.  
The native Kotlin foundation is solid. The remaining work is UI screens and Firebase data binding.
