'use client'

import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { auToScene, PlanetPosition } from '@/lib/astronomy'
import { HABITABLE_ZONE, LIGHT_TIMES, MAJOR_MOONS, MoonData } from '@/lib/extrasData'

// ─── Habitable Zone Ring ───
export function HabitableZone() {
  const geo = useMemo(() => {
    const inner = auToScene(HABITABLE_ZONE.innerRadius)
    const outer = auToScene(HABITABLE_ZONE.outerRadius)
    return new THREE.RingGeometry(inner, outer, 128)
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <primitive object={geo} attach="geometry" />
      <meshBasicMaterial
        color={HABITABLE_ZONE.color}
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Ecliptic Grid with AU markings ───
export function EclipticGrid() {
  const lines = useMemo(() => {
    const segments: number[] = []
    // Concentric circles at 1, 2, 5, 10, 20, 30, 50 AU
    const radii = [1, 2, 5, 10, 20, 30, 50]
    for (const au of radii) {
      const r = auToScene(au)
      const pts = 64
      for (let i = 0; i <= pts; i++) {
        const theta = (i / pts) * Math.PI * 2
        segments.push(Math.cos(theta) * r, 0, Math.sin(theta) * r)
      }
      // separator
      segments.push(NaN, NaN, NaN)
    }
    // Radial lines every 45 degrees
    for (let a = 0; a < 8; a++) {
      const theta = (a / 8) * Math.PI * 2
      const maxR = auToScene(55)
      segments.push(0, 0, 0)
      segments.push(Math.cos(theta) * maxR, 0, Math.sin(theta) * maxR)
      segments.push(NaN, NaN, NaN)
    }
    return new Float32Array(segments)
  }, [])

  const auLabels = [1, 2, 5, 10, 20, 30, 50]

  return (
    <>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.02} depthWrite={false} />
      </lineSegments>
      {auLabels.map((au) => (
        <Html key={au} position={[auToScene(au) + 0.3, 0.1, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="text-[8px] font-mono text-white/15">{au} AU</div>
        </Html>
      ))}
    </>
  )
}

// ─── Scale Ruler ───
export function ScaleRuler() {
  const oneAU = auToScene(1)
  return (
    <group position={[auToScene(2), 0.05, auToScene(-1)]}>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, oneAU, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </line>
      {/* End ticks */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, -0.1, 0, 0, 0.1, 0, oneAU, -0.1, 0, oneAU, 0.1, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </line>
      <Html position={[oneAU / 2, 0.3, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="text-[8px] font-mono text-white/25">1 AU = 149.6M km</div>
      </Html>
    </group>
  )
}

// ─── Light Travel Time Labels ───
export function LightTravelLabels({ positions }: { positions: PlanetPosition[] }) {
  return (
    <>
      {positions.map((p) => {
        const lightSec = LIGHT_TIMES[p.name]
        if (!lightSec) return null
        const x = auToScene(p.x)
        const y = auToScene(p.z) + 0.8
        const z = auToScene(p.y)
        const mins = Math.floor(lightSec / 60)
        const secs = lightSec % 60
        const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
        return (
          <Html key={p.name} position={[x, y, z]} center style={{ pointerEvents: 'none' }}>
            <div className="text-[7px] font-mono text-yellow-400/30">☀→ {label}</div>
          </Html>
        )
      })}
    </>
  )
}

// ─── Moons orbiting parent planets ───
export function Moons({
  positions,
  simDate,
  showLabels
}: {
  positions: PlanetPosition[]
  simDate: Date
  showLabels: boolean
}) {
  const posMap = new Map(positions.map((p) => [p.name, p]))

  return (
    <>
      {MAJOR_MOONS.map((moon) => (
        <MoonObj
          key={moon.name}
          moon={moon}
          parentPos={posMap.get(moon.parent)}
          simDate={simDate}
          showLabels={showLabels}
        />
      ))}
    </>
  )
}

function MoonObj({
  moon,
  parentPos,
  simDate,
  showLabels
}: {
  moon: MoonData
  parentPos?: PlanetPosition
  simDate: Date
  showLabels: boolean
}) {
  if (!parentPos) return null

  // Moon orbit radius — visible separation from parent
  // Earth's Moon at 384k km → ~0.8 scene units from Earth
  // Galilean moons at ~400k-1.9M km → scale proportionally
  const orbitSceneR = Math.max(0.5, (moon.orbitRadiusKm / 1_000_000) * 0.6 + 0.4)
  // Moon visual size — small relative to parent
  const visualRadius = Math.max(0.02, Math.min(0.05, moon.radiusKm / 50000))

  // Compute moon angle from period
  const msPerDay = 86400000
  const daysSinceEpoch = simDate.getTime() / msPerDay
  const angle = ((daysSinceEpoch / moon.periodDays) * Math.PI * 2) % (Math.PI * 2)

  const parentX = auToScene(parentPos.x)
  const parentY = auToScene(parentPos.z)
  const parentZ = auToScene(parentPos.y)

  const moonX = parentX + Math.cos(angle) * orbitSceneR
  const moonY = parentY
  const moonZ = parentZ + Math.sin(angle) * orbitSceneR

  return (
    <group position={[moonX, moonY, moonZ]}>
      <mesh>
        <sphereGeometry args={[visualRadius, 12, 12]} />
        <meshStandardMaterial color={moon.color} roughness={0.8} />
      </mesh>
      {showLabels && (
        <Html position={[0, visualRadius + 0.15, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap text-[7px] font-medium text-white/25">{moon.name}</div>
        </Html>
      )}
    </group>
  )
}

// ─── Orbital Velocity Vectors ───
export function VelocityVectors({ positions }: { positions: PlanetPosition[] }) {
  // Show velocity direction as small arrows tangent to orbit
  return (
    <>
      {positions.map((p) => {
        const x = auToScene(p.x)
        const y = auToScene(p.z)
        const z = auToScene(p.y)
        // Velocity is roughly perpendicular to radial direction in the ecliptic
        const dist = Math.sqrt(p.x * p.x + p.y * p.y) || 1
        // Tangent direction (90° from radial, in ecliptic plane)
        const vScale = 0.8 / Math.sqrt(dist) // faster when closer
        const vx = (-p.y / dist) * vScale
        const vz = (p.x / dist) * vScale
        const endX = x + auToScene(vx)
        const endZ = z + auToScene(vz)

        return (
          <line key={p.name}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([x, y, z, endX, y, endZ]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#44AAFF" transparent opacity={0.25} />
          </line>
        )
      })}
    </>
  )
}

// ─── Hill Spheres (gravitational influence) ───
export function HillSpheres({ positions }: { positions: PlanetPosition[] }) {
  // Hill sphere radius ≈ a * (m_planet / (3 * m_sun))^(1/3)
  // Simplified relative sizes
  const hillRadii: Record<string, number> = {
    Mercury: 0.0012,
    Venus: 0.0068,
    Earth: 0.0098,
    Mars: 0.0033,
    Jupiter: 0.355,
    Saturn: 0.412,
    Uranus: 0.469,
    Neptune: 0.775
  }

  return (
    <>
      {positions.map((p) => {
        const hr = hillRadii[p.name]
        if (!hr) return null
        const r = auToScene(hr)
        if (r < 0.15) return null // too small to see
        const x = auToScene(p.x)
        const y = auToScene(p.z)
        const z = auToScene(p.y)
        return (
          <mesh key={p.name} position={[x, y, z]}>
            <sphereGeometry args={[r, 24, 24]} />
            <meshBasicMaterial
              color="#8888FF"
              transparent
              opacity={0.03}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </>
  )
}
