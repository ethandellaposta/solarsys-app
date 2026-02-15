'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { PlanetData, PLANET_STYLES } from '@/lib/planetData'
import { auToScene } from '@/lib/astronomy'
import { Atmosphere, SunCorona } from './PlanetMaterial'

const TEXTURE_MAP: Record<string, string> = {
  Sun: '/textures/sun.jpg',
  Mercury: '/textures/mercury.jpg',
  Venus: '/textures/venus_atmosphere.jpg',
  Earth: '/textures/earth.jpg',
  Mars: '/textures/mars.jpg',
  Jupiter: '/textures/jupiter.jpg',
  Saturn: '/textures/saturn.jpg',
  Uranus: '/textures/uranus.jpg',
  Neptune: '/textures/neptune.jpg'
}

const CLOUD_MAP: Record<string, string> = {
  Earth: '/textures/earth_clouds.jpg'
}

interface PlanetProps {
  data: PlanetData
  selected: boolean
  onSelect: (name: string) => void
  showLabels: boolean
  showOrbits: boolean
  simDate: Date
  position?: { x: number; y: number; z: number }
  orbitPath?: { x: number; y: number; z: number }[]
}

function EarthClouds({ radius }: { radius: number }) {
  const cloudRef = useRef<THREE.Mesh>(null)
  const cloudTex = useLoader(THREE.TextureLoader, CLOUD_MAP.Earth)

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.04
    }
  })

  return (
    <mesh ref={cloudRef}>
      <sphereGeometry args={[radius * 1.01, 48, 48]} />
      <meshStandardMaterial
        map={cloudTex}
        transparent
        opacity={0.35}
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

export default function Planet({
  data,
  selected,
  onSelect,
  showLabels,
  showOrbits,
  simDate,
  position,
  orbitPath
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const style = PLANET_STYLES[data.name]

  const texturePath = TEXTURE_MAP[data.name]
  const texture = useLoader(THREE.TextureLoader, texturePath || '/textures/earth.jpg')

  const planetTexture = useMemo(() => {
    if (!texturePath) return null
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }, [texture, texturePath])

  const scenePos = useMemo(() => {
    if (!position) return { x: 0, y: 0, z: 0 }
    return {
      x: auToScene(position.x),
      y: auToScene(position.z),
      z: auToScene(position.y)
    }
  }, [position])

  const orbitPoints = useMemo(() => {
    if (!orbitPath || orbitPath.length === 0) return null
    const arr = new Float32Array(orbitPath.length * 3)
    for (let i = 0; i < orbitPath.length; i++) {
      arr[i * 3] = auToScene(orbitPath[i].x)
      arr[i * 3 + 1] = auToScene(orbitPath[i].z)
      arr[i * 3 + 2] = auToScene(orbitPath[i].y)
    }
    return arr
  }, [orbitPath])

  const ringGeometry = useMemo(() => {
    if (!data.rings) return null
    const geo = new THREE.RingGeometry(data.rings.innerRadius, data.rings.outerRadius, 128)
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      const normalizedDist =
        (dist - data.rings!.innerRadius) / (data.rings!.outerRadius - data.rings!.innerRadius)
      uv.setXY(i, normalizedDist, 1)
    }
    return geo
  }, [data.rings])

  // Compute rotation angle from simDate and real sidereal period
  // rotation = (2π / period) * elapsed_time
  const rotationY = useMemo(() => {
    const periodHours = data.siderealPeriodHours
    if (!periodHours) return 0
    const j2000 = new Date(2000, 0, 1, 12, 0, 0)
    const elapsedHours = (simDate.getTime() - j2000.getTime()) / (1000 * 60 * 60)
    return ((2 * Math.PI) / periodHours) * elapsedHours
  }, [simDate, data.siderealPeriodHours])

  // Apply rotation directly each frame (no delta accumulation)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationY
    }
  })

  return (
    <>
      {showOrbits && orbitPoints && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbitPoints, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={selected ? '#ffffff' : '#333355'}
            transparent
            opacity={selected ? 0.6 : 0.25}
          />
        </line>
      )}

      <group position={[scenePos.x, scenePos.y, scenePos.z]}>
        <group rotation={[data.tilt, 0, 0]}>
          <mesh
            ref={meshRef}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(data.name)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto'
            }}
          >
            <sphereGeometry args={[data.radius, 64, 64]} />
            {data.name === 'Sun' ? (
              <meshStandardMaterial
                map={planetTexture}
                emissive="#FDB813"
                emissiveIntensity={1.5}
                emissiveMap={planetTexture}
              />
            ) : planetTexture ? (
              <meshStandardMaterial map={planetTexture} roughness={0.85} metalness={0.05} />
            ) : (
              <meshStandardMaterial color={data.color} roughness={0.8} metalness={0.1} />
            )}
          </mesh>

          {/* Earth cloud layer */}
          {data.name === 'Earth' && <EarthClouds radius={data.radius} />}

          {/* Atmosphere glow */}
          {style?.atmosphereColor && (
            <Atmosphere
              radius={data.radius}
              color={style.atmosphereColor}
              opacity={style.atmosphereOpacity || 0.1}
            />
          )}

          {/* Sun corona */}
          {data.name === 'Sun' && <SunCorona radius={data.radius} />}

          {data.rings && ringGeometry && (
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <primitive object={ringGeometry} attach="geometry" />
              <meshStandardMaterial
                color={data.rings.color}
                side={THREE.DoubleSide}
                transparent
                opacity={0.6}
                roughness={0.9}
              />
            </mesh>
          )}
        </group>

        {selected && (
          <mesh>
            <sphereGeometry args={[data.radius * 1.06, 24, 24]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.08} wireframe />
          </mesh>
        )}

        {showLabels && (
          <Html position={[0, data.radius + 0.6, 0]} center style={{ pointerEvents: 'none' }}>
            <div
              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm transition-all ${
                selected ? 'bg-white/20 text-white' : 'bg-black/40 text-white/60'
              }`}
            >
              {data.name}
            </div>
          </Html>
        )}
      </group>
    </>
  )
}
