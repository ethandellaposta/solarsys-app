'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { PLANETS, SUN_DATA, PlanetData } from '@/lib/planetData'
import { PlanetPosition, formatRA, formatDec, formatAU, auToKm } from '@/lib/astronomy'

interface InfoPanelProps {
  planetName: string
  onClose: () => void
  livePosition?: PlanetPosition
  simDate: Date
}

const PLANET_ICONS: Record<string, string> = {
  Sun: '☀️',
  Mercury: '🪨',
  Venus: '🌕',
  Earth: '🌍',
  Mars: '🔴',
  Jupiter: '🟤',
  Saturn: '🪐',
  Uranus: '🔵',
  Neptune: '💙'
}

const PLANET_ACCENT: Record<string, string> = {
  Sun: '#FBBF24',
  Mercury: '#9CA3AF',
  Venus: '#FDE68A',
  Earth: '#3B82F6',
  Mars: '#F87171',
  Jupiter: '#D97706',
  Saturn: '#FDE047',
  Uranus: '#22D3EE',
  Neptune: '#2563EB'
}

const springPanel = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 28
}

const springChild = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30
}

export default function InfoPanel({ planetName, onClose, livePosition, simDate }: InfoPanelProps) {
  const allBodies = [SUN_DATA, ...PLANETS]
  const planet: PlanetData | undefined = allBodies.find((p) => p.name === planetName)

  if (!planet) return null

  const accent = PLANET_ACCENT[planet.name] || '#6B7280'
  const safeDate = simDate ?? new Date()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={planetName}
        initial={{ x: 80, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 80, opacity: 0, scale: 0.95 }}
        transition={springPanel}
        className="absolute right-4 top-4 z-20 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl glass p-5 text-white custom-scrollbar"
      >
        {/* Accent glow at top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`
          }}
        />

        {/* Header */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springChild, delay: 0.05 }}
          className="mb-5 flex items-start justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
              className="text-3xl"
            >
              {PLANET_ICONS[planet.name] || '🌑'}
            </motion.span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight leading-tight">{planet.name}</h2>
              <p className="text-[11px] font-medium text-white/40">{planet.facts.type}</p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/70"
          >
            <X size={16} />
          </motion.button>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springChild, delay: 0.1 }}
          className="mb-5 text-[13px] leading-relaxed text-white/55"
        >
          {planet.description}
        </motion.p>

        {/* Live Position Data */}
        {livePosition && planet.name !== 'Sun' && (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...springChild, delay: 0.15 }}
            className="mb-5"
          >
            <div className="mb-2.5 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full live-dot" style={{ backgroundColor: '#34D399' }} />
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400/70">
                Position — {safeDate.toLocaleDateString()}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'From Sun', value: formatAU(livePosition.distanceFromSun) },
                { label: 'Sun (km)', value: auToKm(livePosition.distanceFromSun) },
                { label: 'From Earth', value: formatAU(livePosition.distanceFromEarth) },
                { label: 'Earth (km)', value: auToKm(livePosition.distanceFromEarth) },
                { label: 'RA', value: formatRA(livePosition.rightAscension) },
                { label: 'Dec', value: formatDec(livePosition.declination) },
                { label: 'Constellation', value: livePosition.constellation },
                { label: 'Elongation', value: `${livePosition.elongation.toFixed(1)}°` },
                ...(livePosition.magnitude !== null
                  ? [{ label: 'Magnitude', value: livePosition.magnitude.toFixed(2) }]
                  : [])
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ ...springChild, delay: 0.18 + i * 0.02 }}
                >
                  <FactCard label={item.label} value={item.value} live />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Facts */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springChild, delay: 0.25 }}
        >
          <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
            Quick Facts
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Diameter', value: planet.facts.diameter },
              { label: 'Avg Distance', value: planet.facts.distanceFromSun },
              { label: 'Day Length', value: planet.facts.dayLength },
              { label: 'Year Length', value: planet.facts.yearLength },
              { label: 'Moons', value: planet.facts.moons },
              { label: 'Temperature', value: planet.facts.temperature }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...springChild, delay: 0.28 + i * 0.02 }}
              >
                <FactCard label={item.label} value={item.value} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function FactCard({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div
      className={`rounded-lg px-2.5 py-2 ${
        live ? 'bg-emerald-500/[0.04] border border-emerald-500/[0.08]' : 'bg-white/[0.03]'
      }`}
    >
      <p
        className={`text-[9px] font-medium uppercase tracking-[0.1em] ${
          live ? 'text-emerald-400/40' : 'text-white/25'
        }`}
      >
        {label}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-white/85">{value}</p>
    </div>
  )
}
