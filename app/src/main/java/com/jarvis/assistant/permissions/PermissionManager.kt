package com.jarvis.assistant.permissions

import android.Manifest
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import androidx.core.content.ContextCompat
import com.jarvis.assistant.automation.JarvisAccessibilityService

class PermissionManager(private val context: Context) {

    data class PermissionStatus(
        val canDrawOverlay: Boolean,
        val hasMicrophone: Boolean,
        val isAccessibilityEnabled: Boolean,
        val isBatteryExempt: Boolean,
        val canWriteSettings: Boolean,
        val allGranted: Boolean
    )

    fun checkAllPermissions(): PermissionStatus {
        val overlay = canDrawOverlays()
        val mic = hasMicrophonePermission()
        val accessibility = isAccessibilityServiceEnabled()
        val battery = isIgnoringBatteryOptimizations()
        val writeSettings = canWriteSystemSettings()

        val all = overlay && mic && accessibility && battery && writeSettings
        return PermissionStatus(
            canDrawOverlay = overlay,
            hasMicrophone = mic,
            isAccessibilityEnabled = accessibility,
            isBatteryExempt = battery,
            canWriteSettings = writeSettings,
            allGranted = all
        )
    }

    fun canDrawOverlays(): Boolean {
        return Settings.canDrawOverlays(context)
    }

    fun getOverlayPermissionIntent(): Intent {
        return Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:\${context.packageName}")
        ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
    }

    fun hasMicrophonePermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun isAccessibilityServiceEnabled(): Boolean {
        val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
            ?: return false
        val enabledServices = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
        return enabledServices.any {
            it.resolveInfo.serviceInfo.packageName == context.packageName &&
            it.resolveInfo.serviceInfo.name == JarvisAccessibilityService::class.java.name
        }
    }

    fun getAccessibilitySettingsIntent(): Intent {
        return Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    fun isIgnoringBatteryOptimizations(): Boolean {
        val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return false
        return pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    fun getBatteryOptimizationExemptionIntent(): Intent {
        return Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = Uri.parse("package:\${context.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    fun canWriteSystemSettings(): Boolean {
        return Settings.System.canWrite(context)
    }

    fun getWriteSettingsIntent(): Intent {
        return Intent(
            Settings.ACTION_MANAGE_WRITE_SETTINGS,
            Uri.parse("package:\${context.packageName}")
        ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
    }
}
