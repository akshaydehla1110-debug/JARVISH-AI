package com.jarvis.assistant.ui

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.jarvis.assistant.R
import com.jarvis.assistant.permissions.PermissionManager
import com.jarvis.assistant.service.JarvisOverlayService

class MainActivity : AppCompatActivity() {

    private lateinit var permissionManager: PermissionManager
    private lateinit var statusText: TextView
    private lateinit var btnToggleService: Button
    private lateinit var btnGrantPermissions: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        permissionManager = PermissionManager(this)

        statusText = findViewById(R.id.tv_service_status)
        btnToggleService = findViewById(R.id.btn_toggle_service)
        btnGrantPermissions = findViewById(R.id.btn_grant_permissions)

        btnToggleService.setOnClickListener {
            toggleJarvisService()
        }

        btnGrantPermissions.setOnClickListener {
            requestMissingPermissions()
        }

        updateUI()
    }

    override fun onResume() {
        super.onResume()
        updateUI()
    }

    private fun updateUI() {
        val permissionsGranted = permissionManager.checkAllPermissions().allGranted
        if (permissionsGranted) {
            statusText.text = "All Privileges Granted. JARVIS Ready."
            btnGrantPermissions.isEnabled = false
            btnGrantPermissions.text = "Privileges Active"
        } else {
            statusText.text = "Missing Permissions. Tap below to configure."
            btnGrantPermissions.isEnabled = true
            btnGrantPermissions.text = "Grant System Privileges"
        }
    }

    private fun toggleJarvisService() {
        val permissions = permissionManager.checkAllPermissions()
        if (!permissions.allGranted) {
            Toast.makeText(this, "Please grant required privileges first", Toast.LENGTH_SHORT).show()
            requestMissingPermissions()
            return
        }

        val serviceIntent = Intent(this, JarvisOverlayService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
        Toast.makeText(this, "JARVIS Overlay Service Started", Toast.LENGTH_SHORT).show()
        finish() // Closes activity so overlay renders across entire OS
    }

    private fun requestMissingPermissions() {
        if (!permissionManager.canDrawOverlays()) {
            startActivity(permissionManager.getOverlayPermissionIntent())
            return
        }
        if (!permissionManager.isAccessibilityServiceEnabled()) {
            startActivity(permissionManager.getAccessibilitySettingsIntent())
            return
        }
        if (!permissionManager.isIgnoringBatteryOptimizations()) {
            startActivity(permissionManager.getBatteryOptimizationExemptionIntent())
            return
        }
        if (!permissionManager.canWriteSystemSettings()) {
            startActivity(permissionManager.getWriteSettingsIntent())
            return
        }
    }
}
