'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PLANETS, SUN_DATA, COMETS } from '@/lib/planetData'
import { DWARF_PLANETS, SPACECRAFT } from '@/lib/extrasData'

interface PlanetSelectorProps {
  selectedPlanet: string | null
  onSelectPlanet: (name: string) => void
}

interface SelectorItem {
  name: string
  color: string
  shape?: 'circle' | 'diamond' | 'square' | 'triangle'
}

const SECTIONS: { label: string; items: SelectorItem[] }[] = [
  {
    label: 'Star',
    items: [{ name: 'Sun', color: '#FBBF24' }]
  },
  {
    label: 'Planets',
    items: [
      { name: 'Mercury', color: '#9CA3AF' },
      { name: 'Venus', color: '#FDE68A' },
      { name: 'Earth', color: '#3B82F6' },
      { name: 'Mars', color: '#F87171' },
      { name: 'Jupiter', color: '#D97706' },
      { name: 'Saturn', color: '#FDE047' },
      { name: 'Uranus', color: '#22D3EE' },
      { name: 'Neptune', color: '#2563EB' }
    ]
  },
  {
    label: 'Dwarf Planets',
    items: DWARF_PLANETS.map((dp) => ({
      name: dp.name,
      color: dp.color,
      shape: 'diamond' as const
    }))
  },
  {
    label: 'Comets',
    items: COMETS.map((c) => ({
      name: c.name,
      color: c.color,
      shape: 'triangle' as const
    }))
  },
  {
    label: 'Spacecraft',
    items: SPACECRAFT.map((sc) => ({
      name: sc.name,
      color: sc.color,
      shape: 'square' as const
    }))
  }
]

function ShapeIcon({ color, shape = 'circle', glow }: { color: string; shape?: string; glow: boolean }) {
  const shadow = glow ? `0 0 8px ${color}80` : 'none'
  const size = glow ? 1.2 : 1

  if (shape === 'diamond') {
    return (
      <div
        className="relative z-10 h-2 w-2"
        style={{
          backgroundColor: color,
          transform: `rotate(45deg) scale(${size})`,
          boxShadow: shadow,
          borderRadius: 1
        }}
      />
    )
  }
  if (shape === 'square') {
    return (
      <div
        className="relative z-10 h-2 w-2"
        style={{
          backgroundColor: color,
          transform: `scale(${size})`,
          boxShadow: shadow,
          borderRadius: 2
        }}
      />
    )
  }
  if (shape === 'triangle') {
    return (
      <div
        className="relative z-10"
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: `7px solid ${color}`,
          transform: `scale(${size})`,
          filter: glow ? `drop-shadow(0 0 4px ${color}80)` : 'none'
        }}
      />
    )
  }
  return (
    <div
      className="relative z-10 h-2 w-2 rounded-full"
      style={{
        backgroundColor: color,
        transform: `scale(${size})`,
        boxShadow: shadow
      }}
    />
  )
}

export default function PlanetSelector({ selectedPlanet, onSelectPlanet }: PlanetSelectorProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleSection = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  let globalIdx = 0

  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.2 }}
      className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-0 rounded-2xl glass p-1.5 max-h-[80vh] overflow-y-auto custom-scrollbar"
    >
      {SECTIONS.map((section) => {
        const isCollapsed = collapsed[section.label] ?? false

        return (
          <div key={section.label}>
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.label)}
              className="flex w-full items-center gap-1 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/20 hover:text-white/40 transition-colors"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <ChevronDown size={8} />
              </motion.div>
              {section.label}
            </button>

            {/* Items */}
            <AnimatePresence>
              {!isCollapsed &&
                section.items.map((item) => {
                  const idx = globalIdx++
                  const isSelected = selectedPlanet === item.name

                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => onSelectPlanet(item.name)}
                      title={item.name}
                      initial={{ x: -16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -16, opacity: 0, height: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 24,
                        delay: 0.02 * idx + 0.1
                      }}
                      whileHover={{ scale: 1.03, x: 2 }}
                      whileTap={{ scale: 0.96 }}
                      className={`relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors ${
                        isSelected ? 'text-white' : 'text-white/40 hover:text-white/75'
                      }`}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            layoutId="selector-bg"
                            className="absolute inset-0 rounded-lg"
                            style={{ background: `${item.color}14` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 28
                            }}
                          />
                        )}
                      </AnimatePresence>

                      <ShapeIcon color={item.color} shape={item.shape} glow={isSelected} />

                      <span className="relative z-10 text-[10px] font-medium">{item.name}</span>
                    </motion.button>
                  )
                })}
            </AnimatePresence>
          </div>
        )
      })}
    </motion.div>
  )
}
