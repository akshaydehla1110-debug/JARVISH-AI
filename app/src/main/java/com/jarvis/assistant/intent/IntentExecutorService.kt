package com.jarvis.assistant.intent

import android.content.Context
import android.media.AudioManager
import android.provider.Settings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class IntentExecutorService(private val context: Context) {

    data class ExecutionResult(
        val silent: Boolean,
        val action: String,
        val spokenResponse: String? = null
    )

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    suspend fun executeIntent(rawUtterance: String): ExecutionResult = withContext(Dispatchers.Default) {
        val lower = rawUtterance.trim().lowercase()

        // 1. Silent OS Mute Command
        if (lower.contains("mute") || lower.contains("silent")) {
            audioManager.ringerMode = AudioManager.RINGER_MODE_SILENT
            return@withContext ExecutionResult(silent = true, action = "MUTED")
        }

        if (lower.contains("unmute") || lower.contains("sound on")) {
            audioManager.ringerMode = AudioManager.RINGER_MODE_NORMAL
            return@withContext ExecutionResult(silent = true, action = "UNMUTED")
        }

        // 2. Brightness Command
        if (lower.contains("brightness")) {
            val num = Regex("\\d+").find(lower)?.value?.toIntOrNull() ?: 50
            setBrightness(num)
            return@withContext ExecutionResult(silent = true, action = "BRIGHTNESS_\$num")
        }

        // 3. Direct response
        return@withContext ExecutionResult(
            silent = false,
            action = "QUERY",
            spokenResponse = "Sub-routines operational, Sir."
        )
    }

    private fun setBrightness(percent: Int) {
        try {
            if (Settings.System.canWrite(context)) {
                val value = (percent * 255 / 100).coerceIn(0, 255)
                Settings.System.putInt(
                    context.contentResolver,
                    Settings.System.SCREEN_BRIGHTNESS,
                    value
                )
            }
        } catch (_: Exception) {}
    }
}
