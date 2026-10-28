package com.jarvis.assistant.view

import android.content.Context
import android.graphics.PixelFormat
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.os.SystemClock
import android.util.AttributeSet
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

class ShaderOrbView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : GLSurfaceView(context, attrs) {

    enum class State(val value: Int) {
        IDLE(0),
        LISTENING(1),
        PROCESSING(2),
        SPEAKING(3)
    }

    private val renderer: OrbRenderer

    init {
        setEGLContextClientVersion(2)
        setEGLConfigChooser(8, 8, 8, 8, 16, 0)
        holder.setFormat(PixelFormat.TRANSLUCENT)
        setZOrderOnTop(true)

        renderer = OrbRenderer()
        setRenderer(renderer)
        renderMode = RENDERMODE_CONTINUOUSLY
    }

    fun setState(state: State) {
        renderer.currentState = state.value
    }

    fun updateAudioAmplitude(amplitude: Float) {
        renderer.audioAmplitude = amplitude
    }

    private class OrbRenderer : Renderer {
        private var program = 0
        private var uTimeHandle = 0
        private var uResolutionHandle = 0
        private var uAudioAmpHandle = 0
        private var uStateHandle = 0
        private var aPositionHandle = 0

        private var startTime = SystemClock.elapsedRealtime()
        var currentState = 0
        var audioAmplitude = 0f

        private val quadVertices: FloatBuffer = ByteBuffer.allocateDirect(32)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer().apply {
                put(floatArrayOf(
                    -1f, -1f,
                     1f, -1f,
                    -1f,  1f,
                     1f,  1f
                ))
                position(0)
            }

        override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
            GLES20.glClearColor(0f, 0f, 0f, 0f)
            program = createProgram(VERTEX_SHADER, FRAGMENT_SHADER)
            uTimeHandle = GLES20.glGetUniformLocation(program, "u_time")
            uResolutionHandle = GLES20.glGetUniformLocation(program, "u_resolution")
            uAudioAmpHandle = GLES20.glGetUniformLocation(program, "u_audio_amp")
            uStateHandle = GLES20.glGetUniformLocation(program, "u_state")
            aPositionHandle = GLES20.glGetAttribLocation(program, "a_position")
        }

        private var width = 1f
        private var height = 1f

        override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
            GLES20.glViewport(0, 0, w, h)
            width = w.toFloat()
            height = h.toFloat()
        }

        override fun onDrawFrame(gl: GL10?) {
            GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)
            GLES20.glUseProgram(program)

            val elapsed = (SystemClock.elapsedRealtime() - startTime) / 1000f
            GLES20.glUniform1f(uTimeHandle, elapsed)
            GLES20.glUniform2f(uResolutionHandle, width, height)
            GLES20.glUniform1f(uAudioAmpHandle, audioAmplitude)
            GLES20.glUniform1i(uStateHandle, currentState)

            GLES20.glEnableVertexAttribArray(aPositionHandle)
            GLES20.glVertexAttribPointer(aPositionHandle, 2, GLES20.GL_FLOAT, false, 0, quadVertices)
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
            GLES20.glDisableVertexAttribArray(aPositionHandle)
        }

        private fun createProgram(vSource: String, fSource: String): Int {
            val vShader = loadShader(GLES20.GL_VERTEX_SHADER, vSource)
            val fShader = loadShader(GLES20.GL_FRAGMENT_SHADER, fSource)
            val p = GLES20.glCreateProgram()
            GLES20.glAttachShader(p, vShader)
            GLES20.glAttachShader(p, fShader)
            GLES20.glLinkProgram(p)
            return p
        }

        private fun loadShader(type: Int, code: String): Int {
            val shader = GLES20.glCreateShader(type)
            GLES20.glShaderSource(shader, code)
            GLES20.glCompileShader(shader)
            return shader
        }

        companion object {
            private const val VERTEX_SHADER = """
                attribute vec4 a_position;
                varying vec2 v_uv;
                void main() {
                    v_uv = (a_position.xy + 1.0) * 0.5;
                    gl_Position = a_position;
                }
            """

            private const val FRAGMENT_SHADER = """
                precision mediump float;
                varying vec2 v_uv;
                uniform float u_time;
                uniform vec2 u_resolution;
                uniform float u_audio_amp;
                uniform int u_state;

                void main() {
                    vec2 p = (v_uv - 0.5) * 2.0;
                    float r = length(p);
                    if (r > 1.0) discard;

                    float z = sqrt(max(0.0, 1.0 - r * r));
                    vec3 N = vec3(p, z);
                    vec3 V = vec3(0.0, 0.0, 1.0);

                    float speed = (u_state == 2) ? 3.5 : 1.0;
                    float wave = sin(N.x * 4.0 + u_time * speed) * cos(N.y * 4.0 + u_time * speed);

                    vec3 cyan = vec3(0.0, 0.94, 1.0);
                    vec3 magenta = vec3(1.0, 0.0, 0.45);
                    vec3 color = mix(cyan, magenta, wave * 0.5 + 0.5);

                    float fresnel = pow(1.0 - max(0.0, dot(N, V)), 2.5);
                    vec3 finalCol = mix(color, vec3(1.0), fresnel * 0.6);

                    gl_FragColor = vec4(finalCol, 0.95);
                }
            """
        }
    }
}
