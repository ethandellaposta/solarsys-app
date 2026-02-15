'use client'

import { useRef, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import Planet from './Planet'
import Starfield from './Starfield'
import AsteroidBelt from './AsteroidBelt'
import KuiperBelt from './KuiperBelt'
import TrojanAsteroids from './TrojanAsteroids'
import Comet from './Comet'
import DwarfPlanet from './DwarfPlanet'
import Spacecraft from './Spacecraft'
import CameraController from './CameraController'
import {
  HabitableZone,
  EclipticGrid,
  ScaleRuler,
  LightTravelLabels,
  Moons,
  VelocityVectors,
  HillSpheres
} from './Overlays'
import { PLANETS, SUN_DATA, COMETS } from '@/lib/planetData'
import { DWARF_PLANETS, SPACECRAFT } from '@/lib/extrasData'
import { PlanetPosition } from '@/lib/astronomy'
import { getObjectScenePosition } from '@/lib/objectPositions'

export interface OverlayToggles {
  dwarfPlanets: boolean
  moons: boolean
  kuiperBelt: boolean
  trojans: boolean
  spacecraft: boolean
  habitableZone: boolean
  eclipticGrid: boolean
  lightTravel: boolean
  velocityVectors: boolean
  hillSpheres: boolean
  scaleRuler: boolean
}

interface SolarSystemProps {
  selectedPlanet: string | null
  onSelectPlanet: (name: string | null) => void
  showLabels: boolean
  showOrbits: boolean
  positions: PlanetPosition[]
  orbitPaths: Record<string, { x: number; y: number; z: number }[]>
  simDate: Date
  overlays: OverlayToggles
}

function Scene({
  selectedPlanet,
  onSelectPlanet,
  showLabels,
  showOrbits,
  positions,
  orbitPaths,
  simDate,
  overlays
}: SolarSystemProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)

  const handleSelect = useCallback(
    (name: string) => {
      onSelectPlanet(selectedPlanet === name ? null : name)
    },
    [selectedPlanet, onSelectPlanet]
  )

  const posMap = new Map(positions.map((p) => [p.name, p]))
  const jupiterPos = posMap.get('Jupiter')

  // Compute selected object's scene position for camera lock-on
  const selectedScenePos = useMemo(() => {
    if (!selectedPlanet) return null
    return getObjectScenePosition(selectedPlanet, simDate, positions)
  }, [selectedPlanet, simDate, positions])

  return (
    <>
      <CameraController targetPosition={selectedScenePos} controlsRef={controlsRef} />

      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={3} decay={0.3} color="#FFF5E0" castShadow />

      <Starfield count={8000} />

      {/* Core: Sun + Planets */}
      <Planet
        data={SUN_DATA}
        selected={selectedPlanet === 'Sun'}
        onSelect={handleSelect}
        showLabels={showLabels}
        showOrbits={showOrbits}
        simDate={simDate}
      />

      {PLANETS.map((planet) => {
        const pos = posMap.get(planet.name)
        return (
          <Planet
            key={planet.name}
            data={planet}
            selected={selectedPlanet === planet.name}
            onSelect={handleSelect}
            showLabels={showLabels}
            showOrbits={showOrbits}
            simDate={simDate}
            position={pos ? { x: pos.x, y: pos.y, z: pos.z } : undefined}
            orbitPath={orbitPaths[planet.name]}
          />
        )
      })}

      {/* Asteroid Belt (always on) */}
      <AsteroidBelt />

      {/* Comets (always on) */}
      {COMETS.map((comet) => (
        <Comet
          key={comet.name}
          data={comet}
          simDate={simDate}
          showLabels={showLabels}
          showOrbits={showOrbits}
        />
      ))}

      {/* ─── Toggleable Overlays ─── */}

      {overlays.dwarfPlanets &&
        DWARF_PLANETS.map((dp) => (
          <DwarfPlanet
            key={dp.name}
            data={dp}
            simDate={simDate}
            showLabels={showLabels}
            showOrbits={showOrbits}
          />
        ))}

      {overlays.moons && <Moons positions={positions} simDate={simDate} showLabels={showLabels} />}

      {overlays.kuiperBelt && <KuiperBelt />}

      {overlays.trojans && <TrojanAsteroids jupiterPosition={jupiterPos} />}

      {overlays.spacecraft &&
        SPACECRAFT.map((sc) => (
          <Spacecraft key={sc.name} data={sc} simDate={simDate} showLabels={showLabels} />
        ))}

      {overlays.habitableZone && <HabitableZone />}

      {overlays.eclipticGrid && <EclipticGrid />}

      {overlays.scaleRuler && <ScaleRuler />}

      {overlays.lightTravel && <LightTravelLabels positions={positions} />}

      {overlays.velocityVectors && <VelocityVectors positions={positions} />}

      {overlays.hillSpheres && <HillSpheres positions={positions} />}

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={1}
        maxDistance={500}
        zoomSpeed={1.0}
        rotateSpeed={0.5}
        makeDefault
      />
    </>
  )
}

export default function SolarSystem(props: SolarSystemProps) {
  return (
    <Canvas
      camera={{ position: [0, 40, 60], fov: 50, near: 0.01, far: 2000 }}
      style={{ background: '#000005' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          props.onSelectPlanet(null)
        }
      }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
