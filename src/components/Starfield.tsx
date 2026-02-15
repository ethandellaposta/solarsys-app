'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getStarTexture } from '@/lib/particleTexture'

export default function Starfield({ count = 5000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const tex = useMemo(() => getStarTexture(), [])

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    // Star color temperature palette
    const starColors = [
      [1.0, 1.0, 1.0], // white
      [1.0, 0.95, 0.85], // warm white
      [0.85, 0.9, 1.0], // cool blue-white
      [1.0, 0.85, 0.7], // yellow
      [0.7, 0.8, 1.0], // blue
      [1.0, 0.7, 0.5] // orange
    ]
    for (let i = 0; i < count; i++) {
      const r = 500 + Math.random() * 700
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      const sc = starColors[Math.floor(Math.random() * starColors.length)]
      const brightness = 0.6 + Math.random() * 0.4
      col[i * 3] = sc[0] * brightness
      col[i * 3 + 1] = sc[1] * brightness
      col[i * 3 + 2] = sc[2] * brightness
    }
    return { positions: pos, colors: col }
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.002
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        vertexColors
        map={tex}
        transparent
        opacity={0.9}
        alphaTest={0.01}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
