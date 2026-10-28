package com.jarvis.assistant.audio

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.PowerManager
import android.os.SystemClock
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.sqrt

class WakeWordListener(
    private val context: Context,
    private val onWakeWordDetected: (latencyMs: Long) -> Unit,
    private val onAudioAmplitude: (amp: Float) -> Unit
) {
    private val sampleRate = 16000
    private val channelConfig = AudioFormat.CHANNEL_IN_MONO
    private val audioFormat = AudioFormat.ENCODING_PCM_16BIT
    private val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat) * 2

    private var audioRecord: AudioRecord? = null
    private var isListening = false
    private var listeningJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    private val wakeLock: PowerManager.WakeLock by lazy {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "JarvisAI:WakeWordLock").apply {
            setReferenceCounted(false)
        }
    }

    @SuppressLint("MissingPermission")
    fun startContinuousListening() {
        if (isListening) return
        isListening = true

        try {
            wakeLock.acquire(10 * 60 * 1000L)
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                sampleRate,
                channelConfig,
                audioFormat,
                bufferSize
            )

            audioRecord?.startRecording()
            startAudioProcessingLoop()
        } catch (e: Exception) {
            e.printStackTrace()
            isListening = false
        }
    }

    private fun startAudioProcessingLoop() {
        listeningJob = scope.launch {
            val audioBuffer = ShortArray(512)

            while (isActive && isListening) {
                val readShorts = audioRecord?.read(audioBuffer, 0, audioBuffer.size) ?: 0
                if (readShorts > 0) {
                    val rms = computeRMS(audioBuffer, readShorts)
                    val normalizedAmp = (rms / 32768f).coerceIn(0f, 1f)
                    onAudioAmplitude(normalizedAmp)
                }
            }
        }
    }

    fun captureCommandUtterance(onCaptured: (String) -> Unit) {
        scope.launch {
            onCaptured("Mute phone")
        }
    }

    private fun computeRMS(buffer: ShortArray, length: Int): Float {
        var sum = 0.0
        for (i in 0 until length) {
            sum += buffer[i] * buffer[i]
        }
        return sqrt(sum / length).toFloat()
    }

    fun stopListening() {
        isListening = false
        listeningJob?.cancel()
        try {
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
            if (wakeLock.isHeld) wakeLock.release()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
