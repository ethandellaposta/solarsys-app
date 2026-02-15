'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ASTEROID_BELT } from '@/lib/planetData'
import { auToScene } from '@/lib/astronomy'
import { getCircleTexture } from '@/lib/particleTexture'

export default function AsteroidBelt() {
  const ref = useRef<THREE.Points>(null)

  const particleTex = useMemo(() => getCircleTexture(), [])

  const { positions, colors } = useMemo(() => {
    const count = ASTEROID_BELT.count
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const innerR = auToScene(ASTEROID_BELT.innerRadius)
    const outerR = auToScene(ASTEROID_BELT.outerRadius)
    const thick = auToScene(ASTEROID_BELT.thickness)

    // Rocky color palette
    const palette = [
      [0.55, 0.5, 0.45],
      [0.45, 0.4, 0.35],
      [0.6, 0.55, 0.48],
      [0.5, 0.45, 0.4],
      [0.4, 0.38, 0.35],
      [0.65, 0.58, 0.5]
    ]

    for (let i = 0; i < count; i++) {
      const t = Math.random()
      const r = innerR + (outerR - innerR) * (0.3 * t + 0.7 * t * t)
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * thick * (0.3 + 0.7 * Math.random())

      pos[i * 3] = Math.cos(theta) * r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(theta) * r

      // Random rocky color with slight variation
      const base = palette[Math.floor(Math.random() * palette.length)]
      const v = 0.9 + Math.random() * 0.2
      col[i * 3] = base[0] * v
      col[i * 3 + 1] = base[1] * v
      col[i * 3 + 2] = base[2] * v
    }

    return { positions: pos, colors: col }
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.003
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        map={particleTex}
        transparent
        opacity={0.7}
        alphaTest={0.01}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
