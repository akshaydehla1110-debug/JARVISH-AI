package com.jarvis.assistant.service

import android.animation.ValueAnimator
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.jarvis.assistant.JarvisApplication
import com.jarvis.assistant.R
import com.jarvis.assistant.audio.VoiceClassifierAndTTS
import com.jarvis.assistant.audio.WakeWordListener
import com.jarvis.assistant.intent.IntentExecutorService
import com.jarvis.assistant.view.ShaderOrbView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class JarvisOverlayService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private lateinit var windowManager: WindowManager
    private lateinit var overlayParams: WindowManager.LayoutParams
    private lateinit var overlayView: View

    private lateinit var orbView: ShaderOrbView
    private lateinit var statusText: TextView
    private lateinit var successCheckmark: ImageView

    private lateinit var wakeWordListener: WakeWordListener
    private lateinit var voiceClassifierAndTTS: VoiceClassifierAndTTS
    private lateinit var intentExecutor: IntentExecutorService

    private var isExpanded = false
    private val collapsedSizePx by lazy { (48 * resources.displayMetrics.density).toInt() }
    private val expandedWidthPx by lazy { (320 * resources.displayMetrics.density).toInt() }
    private val expandedHeightPx by lazy { (72 * resources.displayMetrics.density).toInt() }

    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, createForegroundNotification())
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        initViews()
        initEngines()
    }

    private fun initViews() {
        overlayParams = WindowManager.LayoutParams(
            collapsedSizePx,
            collapsedSizePx,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = (16 * resources.displayMetrics.density).toInt()
            y = (12 * resources.displayMetrics.density).toInt()
        }

        overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_liquid_island, null)
        orbView = overlayView.findViewById(R.id.shader_orb_view)
        statusText = overlayView.findViewById(R.id.tv_status)
        successCheckmark = overlayView.findViewById(R.id.iv_success_check)

        overlayView.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = overlayParams.x
                        initialY = overlayParams.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        overlayParams.x = initialX + (event.rawX - initialTouchX).toInt()
                        overlayParams.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(overlayView, overlayParams)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        if (Math.abs(event.rawX - initialTouchX) < 10 && Math.abs(event.rawY - initialTouchY) < 10) {
                            toggleOverlayExpansion()
                        }
                        return true
                    }
                }
                return false
            }
        })

        windowManager.addView(overlayView, overlayParams)
    }

    private fun initEngines() {
        voiceClassifierAndTTS = VoiceClassifierAndTTS(this)
        intentExecutor = IntentExecutorService(this)

        wakeWordListener = WakeWordListener(
            context = this,
            onWakeWordDetected = { latencyMs ->
                serviceScope.launch {
                    onAssistantAwakened(latencyMs)
                }
            },
            onAudioAmplitude = { amp ->
                orbView.updateAudioAmplitude(amp)
            }
        )

        wakeWordListener.startContinuousListening()
    }

    private fun onAssistantAwakened(latencyMs: Long) {
        expandOverlay()
        orbView.setState(ShaderOrbView.State.LISTENING)
        statusText.text = "Listening..."

        voiceClassifierAndTTS.analyzeCallerGender { gender, frequencyHz ->
            val honorific = if (gender == VoiceClassifierAndTTS.CallerGender.MALE) "Sir" else "Ma'am"
            statusText.text = "Hi \${honorific}"
            
            voiceClassifierAndTTS.speakGreeting(honorific) {
                listenForCommand()
            }
        }
    }

    private fun listenForCommand() {
        wakeWordListener.captureCommandUtterance { speechText ->
            serviceScope.launch {
                statusText.text = speechText
                orbView.setState(ShaderOrbView.State.PROCESSING)

                val result = intentExecutor.executeIntent(speechText)
                if (result.silent) {
                    showMicroSuccessIndicator()
                } else {
                    orbView.setState(ShaderOrbView.State.SPEAKING)
                    voiceClassifierAndTTS.speak(result.spokenResponse ?: "") {
                        collapseOverlay()
                    }
                }
            }
        }
    }

    private fun showMicroSuccessIndicator() {
        successCheckmark.visibility = View.VISIBLE
        successCheckmark.alpha = 0f
        successCheckmark.animate().alpha(1f).setDuration(150).withEndAction {
            overlayView.postDelayed({
                successCheckmark.animate().alpha(0f).setDuration(150).withEndAction {
                    successCheckmark.visibility = View.GONE
                    collapseOverlay()
                }
            }, 800)
        }
    }

    private fun expandOverlay() {
        if (isExpanded) return
        isExpanded = true
        animateOverlayDimensions(collapsedSizePx, expandedWidthPx, collapsedSizePx, expandedHeightPx)
    }

    private fun collapseOverlay() {
        if (!isExpanded) return
        isExpanded = false
        orbView.setState(ShaderOrbView.State.IDLE)
        animateOverlayDimensions(expandedWidthPx, collapsedSizePx, expandedHeightPx, collapsedSizePx)
    }

    private fun toggleOverlayExpansion() {
        if (isExpanded) collapseOverlay() else onAssistantAwakened(0)
    }

    private fun animateOverlayDimensions(fromW: Int, toW: Int, fromH: Int, toH: Int) {
        ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 300
            interpolator = OvershootInterpolator(1.1f)
            addUpdateListener { animator ->
                val fraction = animator.animatedValue as Float
                overlayParams.width = (fromW + (toW - fromW) * fraction).toInt()
                overlayParams.height = (fromH + (toH - fromH) * fraction).toInt()
                windowManager.updateViewLayout(overlayView, overlayParams)
            }
            start()
        }
    }

    private fun createForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, JarvisApplication.CHANNEL_ID)
            .setContentTitle("JARVIS AI Active")
            .setContentText("Zero-lag background listener running")
            .setSmallIcon(R.drawable.ic_jarvis_orb)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        wakeWordListener.stopListening()
        voiceClassifierAndTTS.release()
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val NOTIFICATION_ID = 1001
    }
}
