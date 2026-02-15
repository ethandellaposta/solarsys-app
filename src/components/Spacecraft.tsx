'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { SpacecraftData } from '@/lib/extrasData'
import { auToScene } from '@/lib/astronomy'

interface SpacecraftProps {
  data: SpacecraftData
  simDate: Date
  showLabels: boolean
}

const DEG = Math.PI / 180

// ─── JWST: hexagonal mirror + sunshield ───
function JWSTModel() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15
  })

  return (
    <group ref={groupRef} scale={0.15}>
      {/* Primary mirror — 7 hexagonal segments approximated as a disk */}
      <mesh rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.04, 6]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Secondary mirror strut */}
      <mesh position={[0, 0.6, -0.4]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 4]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Secondary mirror */}
      <mesh position={[0, 1.1, -0.6]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.03, 6]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Sunshield layers */}
      {[0, -0.15, -0.3, -0.45, -0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.3]} rotation={[-0.1, 0, 0]}>
          <planeGeometry args={[2.4 - i * 0.15, 1.4 - i * 0.08]} />
          <meshStandardMaterial
            color={i === 0 ? '#C0C0C0' : '#4A3A5A'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            metalness={i === 0 ? 0.8 : 0.2}
            roughness={i === 0 ? 0.2 : 0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Voyager: dish + boom + RTG ───
function VoyagerModel() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1
  })

  return (
    <group ref={groupRef} scale={0.12}>
      {/* High-gain antenna dish */}
      <mesh>
        <cylinderGeometry args={[0, 1.2, 0.3, 24]} />
        <meshStandardMaterial color="#E8E8E8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Bus body */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Magnetometer boom */}
      <mesh position={[1.5, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 4]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      {/* RTG power source */}
      <mesh position={[-0.8, -0.5, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* RTG fins */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.8, -0.5, 0]} rotation={[0, 0, -0.4 + (i * Math.PI) / 2]}>
          <boxGeometry args={[0.25, 0.02, 0.6]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      ))}
      {/* Science scan platform */}
      <mesh position={[0, -0.8, 0.4]}>
        <boxGeometry args={[0.2, 0.15, 0.3]} />
        <meshStandardMaterial color="#B0B0B0" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ─── New Horizons: triangular body + dish ───
function NewHorizonsModel() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12
  })

  return (
    <group ref={groupRef} scale={0.1}>
      {/* High-gain antenna */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0, 0.9, 0.2, 24]} />
        <meshStandardMaterial color="#E0E0E0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Triangular body */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.25, 3]} />
        <meshStandardMaterial color="#A08040" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* RTG */}
      <mesh position={[0.8, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

// ─── Parker Solar Probe: heat shield + solar panels ───
function ParkerModel() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef} scale={0.1}>
      {/* Thermal Protection System (heat shield) */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.12, 32]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.95} metalness={0.1} />
      </mesh>
      {/* Spacecraft body behind shield */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Solar panel arrays (small, close to Sun) */}
      <mesh position={[0.6, -0.3, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.15]} />
        <meshStandardMaterial color="#1A237E" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-0.6, -0.3, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.15]} />
        <meshStandardMaterial color="#1A237E" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0, 0.3, 0.15, 16]} />
        <meshStandardMaterial color="#E0E0E0" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

function SpacecraftModel({ name }: { name: string }) {
  if (name === 'James Webb (JWST)') return <JWSTModel />
  if (name.startsWith('Voyager')) return <VoyagerModel />
  if (name === 'New Horizons') return <NewHorizonsModel />
  if (name === 'Parker Solar Probe') return <ParkerModel />
  // Fallback
  return (
    <mesh>
      <octahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.3} />
    </mesh>
  )
}

export default function Spacecraft({ data, simDate, showLabels }: SpacecraftProps) {
  const pos = useMemo(() => {
    const yearsSince2025 = simDate.getFullYear() + simDate.getMonth() / 12 - 2025
    const dist = data.distanceAU_2025 + data.speedAU_per_year * yearsSince2025
    if (dist < 0) return null

    const angle = data.angle * DEG
    const elev = data.elevationDeg * DEG
    const flatDist = dist * Math.cos(elev)

    return {
      x: auToScene(flatDist * Math.cos(angle)),
      y: auToScene(dist * Math.sin(elev)),
      z: auToScene(flatDist * Math.sin(angle)),
      dist
    }
  }, [data, simDate])

  if (!pos || pos.dist > 300) return null

  // Compute direction away from Sun for orientation
  const sunDir = useMemo(() => {
    const len = Math.sqrt(pos!.x ** 2 + pos!.y ** 2 + pos!.z ** 2) || 1
    return { x: pos!.x / len, y: pos!.y / len, z: pos!.z / len }
  }, [pos])

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* 3D spacecraft model */}
      <group
        rotation={[
          Math.atan2(sunDir.y, Math.sqrt(sunDir.x ** 2 + sunDir.z ** 2)),
          Math.atan2(sunDir.x, sunDir.z),
          0
        ]}
      >
        <SpacecraftModel name={data.name} />
      </group>

      {/* Faint glow around spacecraft */}
      <mesh>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {/* Signal line back to Sun */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, -pos.x, -pos.y, -pos.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={data.color} transparent opacity={0.04} />
      </line>

      {showLabels && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[8px] font-medium text-amber-300/70 backdrop-blur-sm border border-amber-400/10">
            {data.name}
            <span className="ml-1.5 text-white/30 font-mono">{pos.dist.toFixed(1)} AU</span>
          </div>
        </Html>
      )}
    </group>
  )
}
