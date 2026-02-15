"use client";

import { motion } from "framer-motion";
import { OverlayToggles } from "./SolarSystem";
import {
  Globe,
  Moon,
  Orbit,
  Rocket,
  Sun,
  Grid3x3,
  Ruler,
  Zap,
  Shield,
  Lightbulb,
  Layers,
} from "lucide-react";

interface OverlayPanelProps {
  overlays: OverlayToggles;
  setOverlays: (overlays: OverlayToggles) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const OVERLAY_ITEMS: {
  key: keyof OverlayToggles;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: "dwarfPlanets", label: "Dwarf Planets", icon: <Globe size={12} />, color: "#C9B8A4" },
  { key: "moons", label: "Moons", icon: <Moon size={12} />, color: "#C0C0C0" },
  { key: "kuiperBelt", label: "Kuiper Belt", icon: <Orbit size={12} />, color: "#5A5A6A" },
  { key: "trojans", label: "Trojan Asteroids", icon: <Orbit size={12} />, color: "#7A7060" },
  { key: "spacecraft", label: "Spacecraft", icon: <Rocket size={12} />, color: "#FFD700" },
  { key: "habitableZone", label: "Habitable Zone", icon: <Sun size={12} />, color: "#22C55E" },
  { key: "eclipticGrid", label: "Ecliptic Grid", icon: <Grid3x3 size={12} />, color: "#6688AA" },
  { key: "scaleRuler", label: "Scale Ruler", icon: <Ruler size={12} />, color: "#AAAAAA" },
  { key: "lightTravel", label: "Light Travel", icon: <Lightbulb size={12} />, color: "#FBBF24" },
  { key: "velocityVectors", label: "Velocity Vectors", icon: <Zap size={12} />, color: "#44AAFF" },
  { key: "hillSpheres", label: "Hill Spheres", icon: <Shield size={12} />, color: "#8888FF" },
];

export default function OverlayPanel({
  overlays,
  setOverlays,
  isOpen,
  onToggle,
}: OverlayPanelProps) {
  const activeCount = Object.values(overlays).filter(Boolean).length;

  const toggle = (key: keyof OverlayToggles) => {
    setOverlays({ ...overlays, [key]: !overlays[key] });
  };

  const toggleAll = (on: boolean) => {
    const next = { ...overlays };
    for (const key of Object.keys(next) as (keyof OverlayToggles)[]) {
      next[key] = on;
    }
    setOverlays(next);
  };

  return (
    <div className="absolute right-4 bottom-20 z-20 flex flex-col items-end gap-2">
      {isOpen && (
        <motion.div
          initial={{ y: 10, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 10, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="glass rounded-xl p-2 w-52"
        >
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Layers
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => toggleAll(true)}
                className="text-[9px] text-white/30 hover:text-white/60 px-1"
              >
                All
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="text-[9px] text-white/30 hover:text-white/60 px-1"
              >
                None
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {OVERLAY_ITEMS.map((item, i) => {
              const active = overlays[item.key];
              return (
                <motion.button
                  key={item.key}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    delay: i * 0.02,
                  }}
                  onClick={() => toggle(item.key)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                    active
                      ? "bg-white/8 text-white/80"
                      : "text-white/30 hover:bg-white/4 hover:text-white/50"
                  }`}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ color: active ? item.color : undefined }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium flex-1">
                    {item.label}
                  </span>
                  <div
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      active ? "opacity-100" : "opacity-20"
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        className="glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-white/50 hover:text-white/80 transition-colors"
      >
        <Layers size={14} />
        <span className="text-[10px] font-medium">Layers</span>
        {activeCount > 0 && (
          <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-semibold text-white/60">
            {activeCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
