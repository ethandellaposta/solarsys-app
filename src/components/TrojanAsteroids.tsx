'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TROJAN_ASTEROIDS } from '@/lib/extrasData'
import { auToScene, PlanetPosition } from '@/lib/astronomy'
import { getCircleTexture } from '@/lib/particleTexture'

interface TrojanAsteroidsProps {
  jupiterPosition?: PlanetPosition
}

export default function TrojanAsteroids({ jupiterPosition }: TrojanAsteroidsProps) {
  const ref = useRef<THREE.Group>(null)
  const tex = useMemo(() => getCircleTexture(), [])

  // Compute Jupiter's current ecliptic angle
  const jupiterAngle = useMemo(() => {
    if (!jupiterPosition) return 0
    return Math.atan2(jupiterPosition.y, jupiterPosition.x)
  }, [jupiterPosition])

  // L4 is 60° ahead, L5 is 60° behind
  const l4Angle = jupiterAngle + Math.PI / 3
  const l5Angle = jupiterAngle - Math.PI / 3

  const orbitR = auToScene(TROJAN_ASTEROIDS.orbitRadius)
  const spread = auToScene(TROJAN_ASTEROIDS.spreadRadius)
  const angleSpr = TROJAN_ASTEROIDS.spreadAngle * (Math.PI / 180)

  const { l4Positions, l5Positions } = useMemo(() => {
    const count = TROJAN_ASTEROIDS.countPerGroup
    const l4 = new Float32Array(count * 3)
    const l5 = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // L4 cluster
      const a4 = l4Angle + (Math.random() - 0.5) * angleSpr * 2
      const r4 = orbitR + (Math.random() - 0.5) * spread * 2
      const y4 = (Math.random() - 0.5) * spread * 0.3
      l4[i * 3] = Math.cos(a4) * r4
      l4[i * 3 + 1] = y4
      l4[i * 3 + 2] = Math.sin(a4) * r4

      // L5 cluster
      const a5 = l5Angle + (Math.random() - 0.5) * angleSpr * 2
      const r5 = orbitR + (Math.random() - 0.5) * spread * 2
      const y5 = (Math.random() - 0.5) * spread * 0.3
      l5[i * 3] = Math.cos(a5) * r5
      l5[i * 3 + 1] = y5
      l5[i * 3 + 2] = Math.sin(a5) * r5
    }
    return { l4Positions: l4, l5Positions: l5 }
  }, [l4Angle, l5Angle, orbitR, spread, angleSpr])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.001
  })

  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[l4Positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color={TROJAN_ASTEROIDS.color}
          map={tex}
          transparent
          opacity={0.4}
          alphaTest={0.01}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[l5Positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color={TROJAN_ASTEROIDS.color}
          map={tex}
          transparent
          opacity={0.4}
          alphaTest={0.01}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}
