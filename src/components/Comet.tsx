'use client'

import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { CometData } from '@/lib/planetData'
import { auToScene } from '@/lib/astronomy'

interface CometProps {
  data: CometData
  simDate: Date
  showLabels: boolean
  showOrbits: boolean
}

const DEG = Math.PI / 180

// Compute position on a Keplerian orbit given mean anomaly
function keplerPosition(
  semiMajor: number,
  ecc: number,
  inclination: number,
  argPeri: number,
  longNode: number,
  meanAnomaly: number
): { x: number; y: number; z: number } {
  // Solve Kepler's equation: E - e*sin(E) = M
  let E = meanAnomaly
  for (let i = 0; i < 20; i++) {
    E = meanAnomaly + ecc * Math.sin(E)
  }

  // True anomaly
  const cosE = Math.cos(E)
  const sinE = Math.sin(E)
  const cosV = (cosE - ecc) / (1 - ecc * cosE)
  const sinV = (Math.sqrt(1 - ecc * ecc) * sinE) / (1 - ecc * cosE)
  const v = Math.atan2(sinV, cosV)

  // Distance from focus
  const r = semiMajor * (1 - ecc * cosE)

  // Position in orbital plane
  const xOrb = r * Math.cos(v)
  const yOrb = r * Math.sin(v)

  // Rotate to ecliptic coordinates
  const cosI = Math.cos(inclination)
  const sinI = Math.sin(inclination)
  const cosW = Math.cos(argPeri)
  const sinW = Math.sin(argPeri)
  const cosO = Math.cos(longNode)
  const sinO = Math.sin(longNode)

  const x = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb
  const y = (sinO * cosW + cosO * sinW * cosI) * xOrb + (-sinO * sinW + cosO * cosW * cosI) * yOrb
  const z = sinW * sinI * xOrb + cosW * sinI * yOrb

  return { x, y, z }
}

export default function Comet({ data, simDate, showLabels, showOrbits }: CometProps) {
  const semiMajor = (data.perihelion + data.aphelion) / 2
  const inc = data.inclination * DEG
  const argP = data.argPerihelion * DEG
  const longN = data.longAscNode * DEG
  const periodDays = data.periodYears * 365.25

  // Compute current mean anomaly from simDate
  // Use J2000 epoch as reference
  const j2000 = new Date(2000, 0, 1, 12, 0, 0)
  const daysSinceJ2000 = (simDate.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24)
  const meanMotion = (2 * Math.PI) / periodDays
  const M = (meanMotion * daysSinceJ2000) % (2 * Math.PI)

  // Current position
  const pos = keplerPosition(semiMajor, data.eccentricity, inc, argP, longN, M)
  const sceneX = auToScene(pos.x)
  const sceneY = auToScene(pos.z) // ecliptic z -> scene y
  const sceneZ = auToScene(pos.y) // ecliptic y -> scene z

  // Distance from sun for tail brightness
  const distFromSun = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z)
  const tailBrightness = Math.min(1, 2 / (distFromSun + 0.5))

  // Compute orbit path
  const orbitPoints = useMemo(() => {
    const segments = 512 // More segments for highly eccentric orbits
    const points = new Float32Array((segments + 1) * 3)
    for (let i = 0; i <= segments; i++) {
      const mAnomaly = (i / segments) * Math.PI * 2
      const p = keplerPosition(semiMajor, data.eccentricity, inc, argP, longN, mAnomaly)
      // Clamp to visible range (don't draw beyond ~50 AU)
      const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)
      if (dist > 50) {
        points[i * 3] = points[(i - 1) * 3] || 0
        points[i * 3 + 1] = points[(i - 1) * 3 + 1] || 0
        points[i * 3 + 2] = points[(i - 1) * 3 + 2] || 0
      } else {
        points[i * 3] = auToScene(p.x)
        points[i * 3 + 1] = auToScene(p.z)
        points[i * 3 + 2] = auToScene(p.y)
      }
    }
    return points
  }, [semiMajor, data.eccentricity, inc, argP, longN])

  // Compute tail direction (away from sun)
  const tailDir = useMemo(() => {
    const len = Math.sqrt(sceneX * sceneX + sceneY * sceneY + sceneZ * sceneZ) || 1
    return {
      x: sceneX / len,
      y: sceneY / len,
      z: sceneZ / len
    }
  }, [sceneX, sceneY, sceneZ])

  // Tail points (extends away from sun)
  const tailLength = auToScene(Math.min(1.5, 3 * tailBrightness))
  const tailPoints = useMemo(() => {
    const pts = new Float32Array(12 * 3) // 12 segments
    for (let i = 0; i < 12; i++) {
      const t = i / 11
      pts[i * 3] = sceneX + tailDir.x * tailLength * t
      pts[i * 3 + 1] = sceneY + tailDir.y * tailLength * t
      pts[i * 3 + 2] = sceneZ + tailDir.z * tailLength * t
    }
    return pts
  }, [sceneX, sceneY, sceneZ, tailDir, tailLength])

  // Only render if within visible range
  if (distFromSun > 50) return null

  const cometSize = 0.06 + 0.04 * tailBrightness

  return (
    <>
      {/* Orbit path */}
      {showOrbits && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbitPoints, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={data.color} transparent opacity={0.12} linewidth={1} />
        </line>
      )}

      {/* Comet tail */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[tailPoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={data.tailColor} transparent opacity={0.4 * tailBrightness} linewidth={2} />
      </line>

      {/* Comet nucleus */}
      <group position={[sceneX, sceneY, sceneZ]}>
        <mesh>
          <sphereGeometry args={[cometSize, 16, 16]} />
          <meshBasicMaterial color={data.color} />
        </mesh>

        {/* Coma glow */}
        <mesh>
          <sphereGeometry args={[cometSize * 3, 16, 16]} />
          <meshBasicMaterial color={data.tailColor} transparent opacity={0.15 * tailBrightness} />
        </mesh>

        {showLabels && (
          <Html position={[0, cometSize + 0.3, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="whitespace-nowrap rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white/50 backdrop-blur-sm">
              {data.name}
            </div>
          </Html>
        )}
      </group>
    </>
  )
}
