'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InfoPanel from '@/components/InfoPanel'
import Controls from '@/components/Controls'
import PlanetSelector from '@/components/PlanetSelector'
import OverlayPanel from '@/components/OverlayPanel'
import { computePlanetPositions, computeOrbitPath, PlanetPosition } from '@/lib/astronomy'
import { PLANETS } from '@/lib/planetData'
import type { OverlayToggles } from '@/components/SolarSystem'

const SolarSystem = dynamic(() => import('@/components/SolarSystem'), {
  ssr: false
})

const DEFAULT_OVERLAYS: OverlayToggles = {
  dwarfPlanets: true,
  moons: true,
  kuiperBelt: true,
  trojans: false,
  spacecraft: true,
  habitableZone: true,
  eclipticGrid: true,
  lightTravel: false,
  velocityVectors: false,
  hillSpheres: false,
  scaleRuler: true
}

export default function Home() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [timeScale, setTimeScale] = useState(1)
  const [showLabels, setShowLabels] = useState(true)
  const [showOrbits, setShowOrbits] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [overlays, setOverlays] = useState<OverlayToggles>(DEFAULT_OVERLAYS)
  const [overlayPanelOpen, setOverlayPanelOpen] = useState(false)

  // Simulation date — starts at real current time
  const [simDate, setSimDate] = useState<Date>(() => new Date())
  const lastTickRef = useRef<number>(Date.now())

  // Computed positions
  const [positions, setPositions] = useState<PlanetPosition[]>([])
  const [orbitPaths, setOrbitPaths] = useState<Record<string, { x: number; y: number; z: number }[]>>({})

  // Advance simulation time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) {
        lastTickRef.current = Date.now()
        return
      }
      const now = Date.now()
      const realDeltaMs = now - lastTickRef.current
      lastTickRef.current = now

      // At timeScale=1, time advances in real-time (1 real second = 1 sim second)
      // At timeScale=10, 1 real second = 10 sim seconds
      // For meaningful planetary motion, we scale days:
      // timeScale=1 means real-time, timeScale=10 means 10 days per real second
      const simDeltaMs = realDeltaMs * timeScale

      setSimDate((prev) => new Date(prev.getTime() + simDeltaMs))
    }, 50) // 20 fps update

    return () => clearInterval(interval)
  }, [isPaused, timeScale])

  // Compute planet positions when simDate changes (throttled)
  const lastComputeRef = useRef<number>(0)
  useEffect(() => {
    const now = Date.now()
    if (now - lastComputeRef.current < 100) return // throttle to 10Hz
    lastComputeRef.current = now

    const pos = computePlanetPositions(simDate)
    setPositions(pos)
  }, [simDate])

  // Compute orbit paths once on mount and when date changes significantly
  const lastOrbitComputeRef = useRef<number>(0)
  useEffect(() => {
    const now = Date.now()
    if (now - lastOrbitComputeRef.current < 5000) return // recompute every 5s max
    lastOrbitComputeRef.current = now

    const paths: Record<string, { x: number; y: number; z: number }[]> = {}
    for (const planet of PLANETS) {
      paths[planet.name] = computeOrbitPath(planet.name, simDate, 256)
    }
    setOrbitPaths(paths)
  }, [simDate])

  // Initial orbit path computation
  useEffect(() => {
    const paths: Record<string, { x: number; y: number; z: number }[]> = {}
    for (const planet of PLANETS) {
      paths[planet.name] = computeOrbitPath(planet.name, simDate, 256)
    }
    setOrbitPaths(paths)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleResetToNow = useCallback(() => {
    setSimDate(new Date())
    setTimeScale(1)
    setIsPaused(false)
    lastTickRef.current = Date.now()
  }, [])

  const handleDateChange = useCallback((date: Date) => {
    setSimDate(date)
    lastTickRef.current = Date.now()
  }, [])

  const selectedPosition = positions.find((p) => p.name === selectedPlanet)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
        className="absolute left-5 top-5 z-20"
      >
        <h1 className="text-[15px] font-semibold tracking-tight text-white/80">Solar System Explorer</h1>
        <p className="mt-0.5 text-[11px] text-white/30">
          Real-time positions &middot; Scroll to zoom &middot; Drag to orbit
        </p>
      </motion.div>

      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
              <p className="text-sm text-white/50">Computing planetary positions...</p>
            </div>
          </div>
        }
      >
        <SolarSystem
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
          showLabels={showLabels}
          showOrbits={showOrbits}
          positions={positions}
          orbitPaths={orbitPaths}
          simDate={simDate}
          overlays={overlays}
        />
      </Suspense>

      <PlanetSelector selectedPlanet={selectedPlanet} onSelectPlanet={setSelectedPlanet} />

      <AnimatePresence>
        {selectedPlanet && (
          <InfoPanel
            planetName={selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
            livePosition={selectedPosition}
            simDate={simDate}
          />
        )}
      </AnimatePresence>

      <Controls
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        simDate={simDate}
        onResetToNow={handleResetToNow}
        onDateChange={handleDateChange}
      />

      <OverlayPanel
        overlays={overlays}
        setOverlays={setOverlays}
        isOpen={overlayPanelOpen}
        onToggle={() => setOverlayPanelOpen(!overlayPanelOpen)}
      />
    </div>
  )
}
