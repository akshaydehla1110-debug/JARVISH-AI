package com.jarvis.assistant.automation

import android.accessibilityservice.AccessibilityService
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class JarvisAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    override fun onInterrupt() {}

    fun dispatchWhatsAppSend(contactName: String, messageText: String, onComplete: (Boolean) -> Unit) {
        val rootNode = rootInActiveWindow ?: run {
            onComplete(false)
            return
        }

        try {
            val inputNodes = rootNode.findAccessibilityNodeInfosByViewId("com.whatsapp:id/entry")
            if (inputNodes.isNotEmpty()) {
                val inputField = inputNodes[0]
                val msgArgs = Bundle().apply {
                    putCharSequence(
                        AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                        messageText
                    )
                }
                inputField.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, msgArgs)

                val sendButtons = rootNode.findAccessibilityNodeInfosByViewId("com.whatsapp:id/send")
                if (sendButtons.isNotEmpty()) {
                    sendButtons[0].performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    onComplete(true)
                    return
                }
            }
            onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    companion object {
        var instance: JarvisAccessibilityService? = null
            private set
    }
}
