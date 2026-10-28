// JARVIS AI - 3D Liquid Glass Fluid Orb Shader
precision highp float;

varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_audio_amp;
uniform int u_state;

void main() {
    vec2 p = (v_uv - 0.5) * 2.0;
    float dist = length(p);
    if (dist > 1.0) discard;

    float z = sqrt(max(0.0, 1.0 - dist * dist));
    vec3 N = vec3(p, z);
    vec3 V = vec3(0.0, 0.0, 1.0);

    float speed = (u_state == 2) ? 3.8 : 1.0;
    float wave = sin(N.x * 4.5 + u_time * speed) * cos(N.y * 4.5 + u_time * speed);

    vec3 cyan = vec3(0.0, 0.94, 1.0);
    vec3 magenta = vec3(1.0, 0.0, 0.45);
    vec3 fluid = mix(cyan, magenta, wave * 0.5 + 0.5);

    float fresnel = pow(1.0 - max(0.0, dot(N, V)), 2.6);
    vec3 finalColor = fluid * (1.0 - fresnel * 0.4) + vec3(1.0) * fresnel * 0.7;

    gl_FragColor = vec4(finalColor, 0.95);
}
