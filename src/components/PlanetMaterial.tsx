'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANET_STYLES } from '@/lib/planetData'

// Simplex-like noise via GLSL for procedural textures
const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
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
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
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
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
`

function createBandedMaterial(colors: THREE.Color[], bandCount: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColors: { value: colors },
      uColorCount: { value: colors.length },
      uBandCount: { value: bandCount }
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${NOISE_GLSL}
      uniform float uTime;
      uniform vec3 uColors[6];
      uniform int uColorCount;
      uniform float uBandCount;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;

      void main() {
        vec3 pos = vPosition * 3.0;
        float lat = vUv.y;

        // Create bands based on latitude
        float band = lat * uBandCount;
        float bandNoise = snoise(vec3(pos.x * 0.5, band * 0.3, uTime * 0.02)) * 0.3;
        band += bandNoise;

        // Turbulence within bands
        float turb = fbm(pos + vec3(uTime * 0.01, 0.0, 0.0), 4) * 0.15;
        band += turb;

        // Map to color
        float t = fract(band);
        int idx = int(mod(band, float(uColorCount)));
        int idx2 = int(mod(band + 1.0, float(uColorCount)));
        vec3 c1 = uColors[idx < 6 ? idx : 0];
        vec3 c2 = uColors[idx2 < 6 ? idx2 : 0];
        vec3 color = mix(c1, c2, smoothstep(0.3, 0.7, t));

        // Simple lighting
        vec3 lightDir = normalize(vec3(-1.0, 0.5, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;

        gl_FragColor = vec4(color * diff, 1.0);
      }
    `
  })
}

function createRockyMaterial(colors: THREE.Color[], noiseScale: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColors: { value: colors },
      uColorCount: { value: colors.length },
      uNoiseScale: { value: noiseScale }
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${NOISE_GLSL}
      uniform vec3 uColors[6];
      uniform int uColorCount;
      uniform float uNoiseScale;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec3 pos = vPosition * uNoiseScale;

        // Multi-octave noise for terrain
        float n1 = fbm(pos, 4) * 0.5 + 0.5;
        float n2 = fbm(pos * 1.5 + 100.0, 3) * 0.5 + 0.5;
        float n3 = snoise(pos * 0.5) * 0.5 + 0.5;

        // Blend colors based on noise — smoother transitions
        float t = n1 * float(uColorCount - 1);
        int idx = int(floor(t));
        float frac_t = fract(t);
        idx = min(idx, uColorCount - 1);
        int idx2 = min(idx + 1, uColorCount - 1);

        vec3 c1 = uColors[idx < 6 ? idx : 0];
        vec3 c2 = uColors[idx2 < 6 ? idx2 : 0];
        vec3 color = mix(c1, c2, smoothstep(0.15, 0.85, frac_t));

        // Subtle surface detail (no harsh craters)
        float detail = n2 * 0.06 - 0.03;
        color += vec3(detail);

        // Gentle height variation
        color += vec3(n3 * 0.04 - 0.02);

        // Clamp to avoid black patches
        color = max(color, vec3(0.08));

        // Lighting
        vec3 lightDir = normalize(vec3(-1.0, 0.5, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;

        gl_FragColor = vec4(color * diff, 1.0);
      }
    `
  })
}

function createIcyMaterial(colors: THREE.Color[]): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColors: { value: colors },
      uColorCount: { value: colors.length }
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${NOISE_GLSL}
      uniform vec3 uColors[6];
      uniform int uColorCount;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec3 pos = vPosition * 2.0;

        // Soft swirling patterns
        float n = fbm(pos, 4) * 0.5 + 0.5;
        float swirl = snoise(pos * 1.5 + vec3(n * 2.0)) * 0.5 + 0.5;

        float t = swirl * float(uColorCount);
        int idx = int(floor(t));
        float frac_t = fract(t);
        idx = idx < uColorCount ? idx : uColorCount - 1;
        int idx2 = idx + 1 < uColorCount ? idx + 1 : 0;

        vec3 c1 = uColors[idx < 6 ? idx : 0];
        vec3 c2 = uColors[idx2 < 6 ? idx2 : 0];
        vec3 color = mix(c1, c2, smoothstep(0.3, 0.7, frac_t));

        // Lighting with slight specular for ice
        vec3 lightDir = normalize(vec3(-1.0, 0.5, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;
        vec3 viewDir = normalize(-vPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0) * 0.2;

        gl_FragColor = vec4(color * diff + vec3(spec), 1.0);
      }
    `
  })
}

function createStarMaterial(colors: THREE.Color[]): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColors: { value: colors }
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${NOISE_GLSL}
      uniform float uTime;
      uniform vec3 uColors[4];
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec3 pos = vPosition * 3.0;

        // Animated turbulent surface
        float n1 = fbm(pos + vec3(uTime * 0.05), 5) * 0.5 + 0.5;
        float n2 = snoise(pos * 2.0 + vec3(uTime * 0.08)) * 0.5 + 0.5;

        // Sunspots
        float spots = smoothstep(0.58, 0.62, n1) * 0.3;

        // Blend sun colors
        vec3 color = mix(uColors[0], uColors[1], n1);
        color = mix(color, uColors[2], n2 * 0.3);
        color = mix(color, uColors[3], smoothstep(0.4, 0.6, n1) * 0.4);
        color -= vec3(spots);

        // Self-illuminating
        gl_FragColor = vec4(color * 1.2, 1.0);
      }
    `
  })
}

export function usePlanetMaterial(planetName: string): THREE.ShaderMaterial | null {
  const matRef = useRef<THREE.ShaderMaterial | null>(null)

  const material = useMemo(() => {
    const style = PLANET_STYLES[planetName]
    if (!style) return null

    const colors = style.colors.map((c) => new THREE.Color(c))
    // Pad to 6 colors
    while (colors.length < 6) colors.push(colors[colors.length - 1])

    switch (style.style) {
      case 'bands':
        return createBandedMaterial(colors, style.bandCount || 8)
      case 'rocky':
        return createRockyMaterial(colors, style.noiseScale || 5)
      case 'icy':
        return createIcyMaterial(colors)
      case 'star':
        return createStarMaterial(colors)
      default:
        return null
    }
  }, [planetName])

  matRef.current = material

  useFrame((_, delta) => {
    if (matRef.current && matRef.current.uniforms.uTime) {
      matRef.current.uniforms.uTime.value += delta
    }
  })

  return material
}

export function Atmosphere({ radius, color, opacity }: { radius: number; color: string; opacity: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.03, 48, 48]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export function SunCorona({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.02
    }
  })

  return (
    <>
      {/* Inner glow */}
      <mesh ref={ref}>
        <sphereGeometry args={[radius * 1.15, 48, 48]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Outer corona */}
      <mesh>
        <sphereGeometry args={[radius * 1.5, 32, 32]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Faint halo */}
      <mesh>
        <sphereGeometry args={[radius * 2.5, 24, 24]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.015}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
