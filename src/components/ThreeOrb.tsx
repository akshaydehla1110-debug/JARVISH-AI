import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbState } from '../types/assistant';
import { OrbCustomization, DEFAULT_CUSTOMIZATION } from '../types/customization';

interface ThreeOrbProps {
  state: OrbState;
  isServiceActive?: boolean;
  audioAmplitude?: number; // 0.0 to 1.0
  customization?: OrbCustomization;
  size?: number; // Size in px
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

// Convert Hex string to THREE.Vector3 RGB (0-1)
function hexToVec3(hex: string): THREE.Vector3 {
  const color = new THREE.Color(hex);
  return new THREE.Vector3(color.r, color.g, color.b);
}

export const ThreeOrb: React.FC<ThreeOrbProps> = ({
  state,
  isServiceActive = true,
  audioAmplitude = 0,
  customization = DEFAULT_CUSTOMIZATION,
  size,
  interactive = true,
  className = '',
  onClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<OrbState>(state);
  const ampRef = useRef<number>(audioAmplitude);
  const serviceRef = useRef<boolean>(isServiceActive);
  const customRef = useRef<OrbCustomization>(customization);
  const shockwaveRef = useRef<number>(0);

  const displaySize = size || customization.size || 320;

  stateRef.current = state;
  ampRef.current = audioAmplitude;
  serviceRef.current = isServiceActive;
  customRef.current = customization;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = displaySize;
    const height = displaySize;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true, // 100% transparent background (Zero blur / clear screen)
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.5, 3.5, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    rimLight.position.set(-3.0, -2.0, -2.5);
    scene.add(rimLight);

    const fillLight = new THREE.HemisphereLight(0xe8f0ff, 0x1a2436, 1.0);
    scene.add(fillLight);

    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1. Inner Procedural Fluid Convection Core with Customizable Colors
    const fluidVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;
      uniform float uAmplitude;
      uniform int uState;
      uniform float uShockwave;
      uniform float uDisplacement;
      uniform float uSpeedMultiplier;
      uniform float uServiceActive;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        vec3 ns = 0.142857142857 * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        float speed = ((uState == 2) ? 3.5 : (uState == 1) ? 2.2 : (uState == 3) ? 2.6 : 0.9) * uSpeedMultiplier;
        if (uServiceActive < 0.5) speed = 0.2;

        float dispStrength = (uDisplacement * 0.7) + uAmplitude * 0.3 + uShockwave * 0.35;
        if (uState == 1) dispStrength += 0.08;
        if (uServiceActive < 0.5) dispStrength = 0.02;

        vec3 noiseCoord = position * 1.6 + vec3(uTime * speed * 0.3, uTime * speed * 0.25, uTime * speed * 0.2);
        float noise = snoise(noiseCoord);
        
        vec3 displaced = position + normal * (noise * dispStrength);
        vPosition = (modelViewMatrix * vec4(displaced, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `;

    const fluidFragmentShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;
      uniform float uAmplitude;
      uniform int uState;
      uniform float uShockwave;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform float uTurbulence;
      uniform float uSpeedMultiplier;
      uniform float uServiceActive;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        vec3 ns = 0.142857142857 * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(-vPosition);

        float speed = ((uState == 2) ? 3.8 : (uState == 1) ? 2.3 : (uState == 3) ? 2.8 : 0.85) * uSpeedMultiplier;
        if (uServiceActive < 0.5) speed = 0.2;

        float turb = (1.2 + uAmplitude * 2.2) * uTurbulence;

        vec3 coord = normal * turb + vec3(uTime * speed * 0.25, uTime * speed * 0.2, uTime * speed * 0.15);
        float n1 = snoise(coord);
        float n2 = snoise(coord * 1.6 + vec3(4.2, 1.8, 7.5));
        float n3 = snoise(coord * 2.4 - vec3(2.1, 5.4, 3.2));

        // Dynamic fluid colors from customizable user palette
        vec3 basePrimary = uPrimaryColor;
        vec3 deepPrimary = uPrimaryColor * 0.35;
        vec3 baseSecondary = uSecondaryColor;
        vec3 deepSecondary = uSecondaryColor * 0.3;

        // Inactive / Asleep service desaturation
        if (uServiceActive < 0.5) {
          basePrimary = vec3(0.2, 0.25, 0.32);
          deepPrimary = vec3(0.08, 0.1, 0.14);
          baseSecondary = vec3(0.25, 0.2, 0.3);
          deepSecondary = vec3(0.08, 0.06, 0.1);
        }

        vec3 primaryBlob = mix(deepPrimary, basePrimary, smoothstep(-0.25, 0.7, n1));
        vec3 secondaryBlob = mix(deepSecondary, baseSecondary, smoothstep(-0.3, 0.75, n2));

        float mixFactor = smoothstep(-0.35, 0.35, n1 - n2 + sin(uTime * 0.5) * 0.2);
        vec3 coreColor = mix(primaryBlob, secondaryBlob, mixFactor);

        // Fresnel edge glaze
        float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.6);
        vec3 rimColor = mix(basePrimary, baseSecondary, 0.5) * fresnel * 1.3;

        // Specular highlight
        vec3 lightDir = normalize(vec3(0.8, 1.0, 1.2));
        vec3 halfVec = normalize(lightDir + viewDir);
        float spec = pow(max(0.0, dot(normal, halfVec)), 32.0);

        vec3 finalFluid = coreColor + rimColor + vec3(spec * 0.65);
        gl_FragColor = vec4(finalFluid, (uServiceActive < 0.5) ? 0.75 : 0.95);
      }
    `;

    const initialPrimary = hexToVec3(customization.primaryColor);
    const initialSecondary = hexToVec3(customization.secondaryColor);

    const fluidUniforms = {
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uState: { value: 0 },
      uShockwave: { value: 0 },
      uPrimaryColor: { value: initialPrimary },
      uSecondaryColor: { value: initialSecondary },
      uTurbulence: { value: customization.turbulence },
      uSpeedMultiplier: { value: customization.speed },
      uDisplacement: { value: customization.displacement },
      uServiceActive: { value: isServiceActive ? 1.0 : 0.0 },
    };

    const fluidGeometry = new THREE.SphereGeometry(0.78, 64, 64);
    const fluidMaterial = new THREE.ShaderMaterial({
      vertexShader: fluidVertexShader,
      fragmentShader: fluidFragmentShader,
      uniforms: fluidUniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const fluidCoreMesh = new THREE.Mesh(fluidGeometry, fluidMaterial);
    orbGroup.add(fluidCoreMesh);

    // 2. Translucent Outer Silicone / Liquid-Glass Shell
    const outerGlassGeometry = new THREE.SphereGeometry(0.96, 64, 64);
    const outerGlassMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0.04,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : customization.glassOpacity,
      opacity: isSoftwareGl ? 0.35 : 1.0,
      transparent: true,
      ior: customization.refractionIor,
      thickness: 1.35,
      attenuationColor: new THREE.Color(customization.glassTint),
      attenuationDistance: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95,
      depthWrite: false,
    });
    const outerGlassMesh = new THREE.Mesh(outerGlassGeometry, outerGlassMaterial);
    outerGlassMesh.renderOrder = 2;
    orbGroup.add(outerGlassMesh);

    // 3. Concentric Silicone Refraction Ring / Contour
    const contourGeometry = new THREE.TorusGeometry(0.92, 0.02, 16, 64);
    const contourMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: isServiceActive ? 0.45 : 0.15,
      color: 0xffffff,
      clearcoat: 1.0,
      depthWrite: false,
    });
    const contourMesh = new THREE.Mesh(contourGeometry, contourMaterial);
    contourMesh.rotation.x = Math.PI / 2.3;
    contourMesh.rotation.y = Math.PI / 6;
    orbGroup.add(contourMesh);

    // NO SHADOW CANVAS OR BLUR PLANE (100% clean visible screen around the orb!)

    // Interactive Dragging
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const targetRotation = new THREE.Vector2(0, 0);
    const currentRotation = new THREE.Vector2(0, 0);

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      shockwaveRef.current = 1.0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !interactive) {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        targetRotation.x = normY * 0.35;
        targetRotation.y = normX * 0.55;
        return;
      }
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotation.y += deltaX * 0.015;
      targetRotation.x += deltaY * 0.015;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const syncState = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (syncState === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Live uniforms synchronization
      const currentCustom = customRef.current;
      const isServActive = serviceRef.current;

      fluidUniforms.uTime.value = elapsed;
      fluidUniforms.uAmplitude.value = THREE.MathUtils.damp(
        fluidUniforms.uAmplitude.value,
        ampRef.current,
        14,
        delta
      );

      fluidUniforms.uPrimaryColor.value.copy(hexToVec3(currentCustom.primaryColor));
      fluidUniforms.uSecondaryColor.value.copy(hexToVec3(currentCustom.secondaryColor));
      fluidUniforms.uSpeedMultiplier.value = currentCustom.speed;
      fluidUniforms.uTurbulence.value = currentCustom.turbulence;
      fluidUniforms.uDisplacement.value = currentCustom.displacement;
      fluidUniforms.uServiceActive.value = isServActive ? 1.0 : 0.0;

      // Update glass properties
      outerGlassMaterial.ior = currentCustom.refractionIor;
      outerGlassMaterial.transmission = isSoftwareGl ? 0 : currentCustom.glassOpacity;
      outerGlassMaterial.attenuationColor.set(currentCustom.glassTint);

      // State Mapping
      const currentState = stateRef.current;
      let stateCode = 0;
      if (currentState === 'listening') stateCode = 1;
      else if (currentState === 'processing') stateCode = 2;
      else if (currentState === 'speaking') stateCode = 3;
      fluidUniforms.uState.value = stateCode;

      if (shockwaveRef.current > 0.001) {
        shockwaveRef.current = THREE.MathUtils.damp(shockwaveRef.current, 0, 4.5, delta);
      }
      fluidUniforms.uShockwave.value = shockwaveRef.current;

      currentRotation.x = THREE.MathUtils.damp(currentRotation.x, targetRotation.x, 6, delta);
      currentRotation.y = THREE.MathUtils.damp(currentRotation.y, targetRotation.y, 6, delta);

      orbGroup.rotation.x = currentRotation.x;
      orbGroup.rotation.y = currentRotation.y;

      if (!isServActive) {
        // Sleep state
        fluidCoreMesh.rotation.y += delta * 0.15;
        fluidCoreMesh.scale.set(0.92, 0.92, 0.92);
      } else if (stateCode === 2) {
        fluidCoreMesh.rotation.y += delta * 4.2 * currentCustom.speed;
        fluidCoreMesh.rotation.z += delta * 2.1 * currentCustom.speed;
      } else if (stateCode === 1) {
        fluidCoreMesh.rotation.y += delta * 1.5 * currentCustom.speed;
        const breath = 1.0 + Math.sin(elapsed * 4.0) * 0.04 + ampRef.current * 0.15;
        fluidCoreMesh.scale.set(breath, breath, breath);
      } else if (stateCode === 3) {
        fluidCoreMesh.rotation.y += delta * 1.8 * currentCustom.speed;
        const speechPulse = 1.0 + ampRef.current * 0.22;
        fluidCoreMesh.scale.set(speechPulse, speechPulse, speechPulse);
      } else {
        fluidCoreMesh.rotation.y += delta * 0.6 * currentCustom.speed;
        fluidCoreMesh.rotation.x = Math.sin(elapsed * 0.8) * 0.08;
        const idlePulse = 1.0 + Math.sin(elapsed * 1.5) * 0.02;
        fluidCoreMesh.scale.set(idlePulse, idlePulse, idlePulse);
      }

      contourMesh.rotation.z -= delta * 0.4;

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = displaySize;
      const h = displaySize;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      fluidGeometry.dispose();
      fluidMaterial.dispose();
      outerGlassGeometry.dispose();
      outerGlassMaterial.dispose();
      contourGeometry.dispose();
      contourMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [displaySize, interactive]);

  return (
    <div
      ref={mountRef}
      onClick={onClick}
      className={`relative select-none overflow-visible bg-transparent ${className}`}
      style={{ width: displaySize, height: displaySize }}
      title="JARVIS 3D Fluid Glass Orb - Click or drag to interact"
    />
  );
};
