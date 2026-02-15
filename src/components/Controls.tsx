'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Tag, Circle, FastForward, Rewind, Calendar } from 'lucide-react'

interface ControlsProps {
  timeScale: number
  setTimeScale: (scale: number) => void
  showLabels: boolean
  setShowLabels: (show: boolean) => void
  showOrbits: boolean
  setShowOrbits: (show: boolean) => void
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  simDate: Date
  onResetToNow: () => void
  onDateChange: (date: Date) => void
}

const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 28
}

export default function Controls({
  timeScale,
  setTimeScale,
  showLabels,
  setShowLabels,
  showOrbits,
  setShowOrbits,
  isPaused,
  setIsPaused,
  simDate,
  onResetToNow,
  onDateChange
}: ControlsProps) {
  const handleSpeedChange = (delta: number) => {
    const newScale = Math.max(0.1, Math.min(50, timeScale + delta))
    setTimeScale(Math.round(newScale * 10) / 10)
  }

  const isRealTime = timeScale === 1 && !isPaused

  const safeDate = simDate ?? new Date()
  const dateStr = safeDate.toISOString().slice(0, 10)

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.4 }}
      className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      {/* Date display */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springConfig, delay: 0.5 }}
        className="flex items-center gap-2.5 rounded-xl glass px-3.5 py-2"
      >
        <Calendar size={11} className="text-white/25" />
        <input
          type="date"
          value={dateStr}
          onChange={(e) => {
            if (e.target.value) {
              const parts = e.target.value.split('-')
              const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12)
              onDateChange(d)
            }
          }}
          className="bg-transparent text-[11px] font-mono text-white/60 outline-none [color-scheme:dark]"
        />
        <div className="h-3 w-px bg-white/8" />
        <span className="text-[10px] font-mono text-white/25">
          {safeDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        <AnimatePresence>
          {isRealTime && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="flex items-center gap-1 text-[9px] font-semibold tracking-wider text-emerald-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 live-dot" />
              LIVE
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main controls */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springConfig, delay: 0.55 }}
        className="flex items-center gap-0.5 rounded-2xl glass px-2 py-1.5"
      >
        <ControlButton
          onClick={() => setIsPaused(!isPaused)}
          active={false}
          title={isPaused ? 'Play' : 'Pause'}
        >
          <AnimatePresence mode="wait">
            {isPaused ? (
              <motion.div
                key="play"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Play size={14} />
              </motion.div>
            ) : (
              <motion.div
                key="pause"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Pause size={14} />
              </motion.div>
            )}
          </AnimatePresence>
        </ControlButton>

        <Divider />

        <ControlButton onClick={() => handleSpeedChange(-0.5)} active={false} title="Slow down">
          <Rewind size={12} />
        </ControlButton>

        <motion.div
          key={timeScale}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="min-w-12 text-center text-[11px] font-mono font-medium text-white/60"
        >
          {timeScale >= 10 ? `${timeScale.toFixed(0)}×` : `${timeScale.toFixed(1)}×`}
        </motion.div>

        <ControlButton onClick={() => handleSpeedChange(0.5)} active={false} title="Speed up">
          <FastForward size={12} />
        </ControlButton>

        <ControlButton onClick={onResetToNow} active={false} title="Reset to now">
          <RotateCcw size={12} />
        </ControlButton>

        <Divider />

        <ControlButton onClick={() => setShowLabels(!showLabels)} active={showLabels} title="Toggle labels">
          <Tag size={12} />
        </ControlButton>

        <ControlButton onClick={() => setShowOrbits(!showOrbits)} active={showOrbits} title="Toggle orbits">
          <Circle size={12} />
        </ControlButton>
      </motion.div>
    </motion.div>
  )
}

function Divider() {
  return <div className="mx-0.5 h-4 w-px bg-white/6" />
}

function ControlButton({
  children,
  onClick,
  active,
  title
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  title: string
}) {
  return (
    <motion.button
      onClick={onClick}
      title={title}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
        active ? 'text-white' : 'text-white/35 hover:text-white/70'
      }`}
    >
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="control-active-bg"
            className="absolute inset-0 rounded-xl bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
