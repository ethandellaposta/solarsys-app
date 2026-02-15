'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { KUIPER_BELT } from '@/lib/extrasData'
import { auToScene } from '@/lib/astronomy'
import { getCircleTexture } from '@/lib/particleTexture'

export default function KuiperBelt() {
  const ref = useRef<THREE.Points>(null)
  const tex = useMemo(() => getCircleTexture(), [])

  const positions = useMemo(() => {
    const count = KUIPER_BELT.count
    const pos = new Float32Array(count * 3)
    const innerR = auToScene(KUIPER_BELT.innerRadius)
    const outerR = auToScene(KUIPER_BELT.outerRadius)
    const thick = auToScene(KUIPER_BELT.thickness)

    for (let i = 0; i < count; i++) {
      const t = Math.random()
      const r = innerR + (outerR - innerR) * t
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * thick
      pos[i * 3] = Math.cos(theta) * r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(theta) * r
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.0005
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={KUIPER_BELT.color}
        map={tex}
        transparent
        opacity={0.35}
        alphaTest={0.01}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
