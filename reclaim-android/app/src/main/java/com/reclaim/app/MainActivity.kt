package com.reclaim.app

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.google.firebase.FirebaseApp
import com.reclaim.app.ui.theme.ReclaimTheme
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : ComponentActivity() {

  companion object {
    const val ACCESSIBILITY_CHANNEL = "com.reclaim.app/accessibility"
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // Initialize Firebase
    FirebaseApp.initializeApp(this)

    enableEdgeToEdge()
    setContent {
      ReclaimTheme {
        Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
          HomeDashboard(
            modifier = Modifier.padding(innerPadding),
            onOpenAccessibilitySettings = { openAccessibilitySettings() }
          )
        }
      }
    }
  }

  private fun isAccessibilityServiceEnabled(): Boolean {
    val am = getSystemService(ACCESSIBILITY_SERVICE) as AccessibilityManager
    val enabledServices = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
    return enabledServices.any { it.resolveInfo.serviceInfo.packageName == packageName }
  }

  private fun openAccessibilitySettings() {
    startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

@Composable
fun HomeDashboard(
  modifier: Modifier = Modifier,
  onOpenAccessibilitySettings: () -> Unit
) {
  val context = LocalContext.current

  // Re-check accessibility status whenever the composable recomposes (e.g. on resume)
  var accessibilityEnabled by remember { mutableStateOf(false) }
  LaunchedEffect(Unit) {
    val am = context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    val enabled = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
    accessibilityEnabled = enabled.any { it.resolveInfo.serviceInfo.packageName == context.packageName }
  }

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background)
      .padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(28.dp)
  ) {
    DashboardHeader()
    if (!accessibilityEnabled) {
      AccessibilityNudge(onOpenSettings = onOpenAccessibilitySettings)
    }
    AttentionScoreCard()
    FocusControls()
  }
}

@Composable
fun DashboardHeader() {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Column {
      Text(
        text = "Reclaim",
        style = MaterialTheme.typography.headlineMedium,
        color = MaterialTheme.colorScheme.onBackground,
        fontWeight = FontWeight.Bold
      )
      Text(
        text = "Good morning. Your attention is yours.",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
      )
    }
    IconButton(onClick = { /* TODO: open settings screen */ }) {
      Icon(
        imageVector = Icons.Default.Settings,
        contentDescription = "Settings",
        tint = MaterialTheme.colorScheme.onBackground
      )
    }
  }
}

// ─── Onboarding Nudge ─────────────────────────────────────────────────────────

@Composable
fun AccessibilityNudge(onOpenSettings: () -> Unit) {
  Card(
    modifier = Modifier
      .fillMaxWidth()
      .border(
        width = 1.dp,
        color = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.4f),
        shape = RoundedCornerShape(20.dp)
      ),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface
    ),
    shape = RoundedCornerShape(20.dp)
  ) {
    Row(
      modifier = Modifier.padding(20.dp),
      horizontalArrangement = Arrangement.spacedBy(16.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(
        imageVector = Icons.Rounded.Warning,
        contentDescription = null,
        tint = MaterialTheme.colorScheme.tertiary,
        modifier = Modifier.size(32.dp)
      )
      Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
          text = "Shield not active",
          style = MaterialTheme.typography.titleSmall,
          color = MaterialTheme.colorScheme.onSurface,
          fontWeight = FontWeight.SemiBold
        )
        Text(
          text = "Enable FocusLock in Accessibility Settings to block Shorts, Reels & TikTok.",
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
      Button(
        onClick = onOpenSettings,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = MaterialTheme.colorScheme.tertiary
        ),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
      ) {
        Text("Enable", style = MaterialTheme.typography.labelMedium)
      }
    }
  }
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

@Composable
fun AttentionScoreCard() {
  Card(
    modifier = Modifier.fillMaxWidth(),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    shape = RoundedCornerShape(24.dp)
  ) {
    Column(
      modifier = Modifier.padding(24.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      Text(
        text = "Hours Reclaimed Today",
        style = MaterialTheme.typography.titleMedium,
        color = MaterialTheme.colorScheme.onSurface
      )
      Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
          text = "2.5",
          style = MaterialTheme.typography.displayLarge,
          color = MaterialTheme.colorScheme.primary,
          fontWeight = FontWeight.Bold
        )
        Text(
          text = "hrs",
          style = MaterialTheme.typography.titleLarge,
          color = MaterialTheme.colorScheme.onSurface,
          modifier = Modifier.padding(bottom = 6.dp)
        )
      }
      Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Icon(
          imageVector = Icons.Rounded.CheckCircle,
          contentDescription = null,
          tint = MaterialTheme.colorScheme.secondary,
          modifier = Modifier.size(20.dp)
        )
        Text(
          text = "You've avoided 43 distractions",
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurface
        )
      }
    }
  }
}

// ─── Focus Controls ───────────────────────────────────────────────────────────

@Composable
fun FocusControls() {
  var isFocusing by remember { mutableStateOf(false) }

  Column(
    modifier = Modifier.fillMaxWidth(),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(24.dp)
  ) {
    Text(
      text = "Start a Session",
      style = MaterialTheme.typography.titleLarge,
      color = MaterialTheme.colorScheme.onBackground,
      fontWeight = FontWeight.SemiBold,
      modifier = Modifier.align(Alignment.Start)
    )

    Spacer(modifier = Modifier.height(8.dp))

    Button(
      onClick = { isFocusing = !isFocusing },
      modifier = Modifier.size(160.dp),
      shape = RoundedCornerShape(100),
      colors = ButtonDefaults.buttonColors(
        containerColor = if (isFocusing) MaterialTheme.colorScheme.secondary
                         else MaterialTheme.colorScheme.primary
      ),
      contentPadding = PaddingValues(0.dp)
    ) {
      Icon(
        imageVector = if (isFocusing) Icons.Default.Shield else Icons.Default.PowerSettingsNew,
        contentDescription = if (isFocusing) "Stop Focus Session" else "Start Focus Session",
        modifier = Modifier.size(64.dp)
      )
    }

    Text(
      text = "\"Take back what matters. Your attention belongs to you.\"",
      style = MaterialTheme.typography.bodyLarge,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
      textAlign = TextAlign.Center,
      modifier = Modifier.padding(horizontal = 32.dp)
    )
  }
}
