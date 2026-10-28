package com.jarvis.assistant.audio

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

class VoiceClassifierAndTTS(private val context: Context) : TextToSpeech.OnInitListener {

    enum class CallerGender { MALE, FEMALE }

    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.let { engine ->
                val result = engine.setLanguage(Locale("en", "IN"))
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    engine.language = Locale.ENGLISH
                }
                engine.setPitch(0.78f) // Deep clear male tone
                engine.setSpeechRate(1.0f)
                isTtsReady = true
            }
        }
    }

    fun analyzeCallerGender(onClassified: (CallerGender, Float) -> Unit) {
        // Deep authoritative male defaults
        onClassified(CallerGender.MALE, 115f)
    }

    fun speakGreeting(honorific: String, onComplete: () -> Unit) {
        val text = "Hi \${honorific}, welcome to Jarvis world."
        speak(text, onComplete)
    }

    fun speak(text: String, onComplete: () -> Unit) {
        if (!isTtsReady) {
            onComplete()
            return
        }

        val utteranceId = "JARVIS_\${System.currentTimeMillis()}"
        val params = Bundle().apply {
            putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)
        }

        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(id: String?) {}
            override fun onDone(id: String?) { onComplete() }
            override fun onError(id: String?) { onComplete() }
        })

        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
    }

    fun release() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }
}
