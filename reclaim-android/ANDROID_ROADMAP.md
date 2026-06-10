# Reclaim Android — Build Roadmap

**Status:** Parked at v0.2.x — shipping in v0.3  
The Gradle build environment is now fully set up. What remains is resolving plugin SDK version conflicts and wiring the Flutter UI to the native accessibility layer.

---

## Current State

| Layer | Status | Notes |
|-------|--------|-------|
| Flutter UI (Dart) | Done | Screens, navigation, toggle logic |
| Android Gradle scaffold | Done | `settings.gradle`, `build.gradle`, `AndroidManifest.xml`, `MainActivity.kt` |
| Kotlin AccessibilityService stub | Done | Migrated to `com.reclaim.app` package |
| CI build | Failing | Plugin SDK version mismatches (see below) |
| APK installable and launchable | Not yet | Depends on CI fix |

---

## Outstanding Build Errors (v0.2.6-alpha)

### Error 1 — Plugin SDK Version Mismatch

```
Your project is configured to compile against Android SDK 36,
but the following plugin(s) require a higher Android SDK version:
  - shared_preferences_android compiles against Android SDK 36
  - jni compiles against Android SDK 35
  - jni_flutter compiles against Android SDK 35
```

**Root cause:** `pubspec.yaml` pulls in `jni` and `jni_flutter` as transitive dependencies of `drift` or another package. These pull in NDK 28.2 which conflicts with other plugins wanting NDK 21.x.

**Fix:** Audit `pubspec.yaml` — remove any package that transitively depends on `jni`. Replace with pure-Dart alternatives.

---

### Error 2 — JVM Target Mismatch (fixed in v0.2.6)

```
Inconsistent JVM-target compatibility detected for tasks
'compileDebugJavaWithJavac' (1.8) and 'compileDebugKotlin' (17)
```

Fixed — both targets are now set to Java 17 in `app/build.gradle`.

---

## Plan of Action

### Phase 1 — Fix the CI Build (Est: 1–2 hrs)

- [ ] Audit `pubspec.yaml` — run `flutter pub deps` and trace which package pulls in `jni` / `jni_flutter`
- [ ] Remove conflicting packages — likely `drift` or `isar`. Replace with `shared_preferences` (already a dep) for simple key-value storage
- [ ] Remove `drift` / `isar` imports from Dart code if present
- [ ] Verify build locally — `flutter build apk --debug` in `reclaim-android/`
- [ ] Push — CI should produce a green APK artifact

### Phase 2 — Connect Flutter UI to Native Layer (Est: 2–3 hrs)

The Flutter `lib/` code currently uses boolean state flags instead of real native services. Wire these up:

- [ ] Create `lib/services/accessibility_bridge.dart` platform channel:
  ```dart
  static const _channel = MethodChannel('com.reclaim.app/accessibility');
  static Future<bool> isEnabled() async {
    return await _channel.invokeMethod('isEnabled');
  }
  ```
- [ ] Implement the method channel handler in `MainActivity.kt`:
  ```kotlin
  MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.reclaim.app/accessibility")
      .setMethodCallHandler { call, result ->
          if (call.method == "isEnabled") {
              val am = getSystemService(ACCESSIBILITY_SERVICE) as AccessibilityManager
              result.success(am.isEnabled)
          }
      }
  ```
- [ ] Add onboarding screen to prompt user to enable accessibility service (deep link to Settings)
- [ ] Implement `onAccessibilityEvent` in `FocusLockAccessibilityService.kt` to detect and hide Shorts/Reels

### Phase 3 — Content Detection Engine (Est: 3–4 hrs)

`ContentDetectionEngine.kt` is stubbed. Implement per-platform:

- [ ] YouTube Shorts — detect `com.google.android.youtube` package + `/shorts/` URL pattern via `AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED`
- [ ] Instagram Reels — detect Reels tab via `com.instagram.android` + view ID `clips_tab`
- [ ] TikTok — full-screen video in `com.zhiliaoapp.musically`
- [ ] Block action — use `performGlobalAction(GLOBAL_ACTION_BACK)` or overlay a blocking screen

### Phase 4 — Polish and Release (Est: 1 hr)

- [ ] Generate proper launcher icon in all densities using `flutter_launcher_icons` package
- [ ] Test on physical device or emulator (API 34+)
- [ ] Push `v0.3.0` tag — CI produces signed debug APK
- [ ] Update website download link from "Coming soon" to real APK URL

---

## Key Files

| File | Purpose |
|------|---------|
| [`android/app/build.gradle`](./android/app/build.gradle) | Gradle config — SDK versions, NDK, plugins |
| [`android/settings.gradle`](./android/settings.gradle) | Flutter Gradle plugin declaration |
| [`android/gradle/wrapper/gradle-wrapper.properties`](./android/gradle/wrapper/gradle-wrapper.properties) | Gradle version (must be >= 8.7 for Flutter 3.44) |
| [`android/app/src/main/AndroidManifest.xml`](./android/app/src/main/AndroidManifest.xml) | App manifest — Flutter v2 embedding, service declarations |
| [`android/app/src/main/kotlin/com/reclaim/app/MainActivity.kt`](./android/app/src/main/kotlin/com/reclaim/app/MainActivity.kt) | Kotlin entry point |
| [`android/app/src/main/kotlin/com/reclaim/app/services/FocusLockAccessibilityService.kt`](./android/app/src/main/kotlin/com/reclaim/app/services/FocusLockAccessibilityService.kt) | Accessibility service stub — needs full implementation |
| [`android/app/src/main/kotlin/com/reclaim/app/detection/ContentDetectionEngine.kt`](./android/app/src/main/kotlin/com/reclaim/app/detection/ContentDetectionEngine.kt) | Content detection engine stub — needs per-platform logic |
| [`lib/main.dart`](./lib/main.dart) | Flutter app entry |
| [`pubspec.yaml`](./pubspec.yaml) | Flutter dependencies — audit this for jni/drift |

---

## Testing the Build Locally

```bash
cd reclaim-android

# Check for dependency conflicts
flutter pub deps | grep -E "jni|drift|isar"

# Build debug APK
flutter build apk --debug

# Install on connected device
flutter install

# Check accessibility service is visible in Settings
adb shell settings get secure enabled_accessibility_services
```

---

## References

- Flutter Gradle new format: https://flutter.dev/to/flutter-gradle-plugin-apply
- Flutter Accessibility: https://docs.flutter.dev/platform-integration/android/accessibility
- Android Accessibility Service Guide: https://developer.android.com/guide/topics/ui/accessibility/service
- jni package conflict: https://pub.dev/packages/jni — requires SDK 35+, NDK 28

---

Estimated total effort to ship v0.3: 8–10 hours of focused work.  
The Gradle infrastructure is solid. The remaining work is pure application logic.
