"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import { DwarfPlanetData } from "@/lib/extrasData";
import { auToScene } from "@/lib/astronomy";

interface DwarfPlanetProps {
  data: DwarfPlanetData;
  simDate: Date;
  showLabels: boolean;
  showOrbits: boolean;
}

const DEG = Math.PI / 180;

function keplerPosition(
  semiMajor: number,
  ecc: number,
  inclination: number,
  argPeri: number,
  longNode: number,
  meanAnomaly: number
): { x: number; y: number; z: number } {
  let E = meanAnomaly;
  for (let i = 0; i < 20; i++) {
    E = meanAnomaly + ecc * Math.sin(E);
  }
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const cosV = (cosE - ecc) / (1 - ecc * cosE);
  const sinV = (Math.sqrt(1 - ecc * ecc) * sinE) / (1 - ecc * cosE);
  const v = Math.atan2(sinV, cosV);
  const r = semiMajor * (1 - ecc * cosE);
  const xOrb = r * Math.cos(v);
  const yOrb = r * Math.sin(v);

  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);
  const cosW = Math.cos(argPeri);
  const sinW = Math.sin(argPeri);
  const cosO = Math.cos(longNode);
  const sinO = Math.sin(longNode);

  const x = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
  const y = (sinO * cosW + cosO * sinW * cosI) * xOrb + (-sinO * sinW + cosO * cosW * cosI) * yOrb;
  const z = sinW * sinI * xOrb + cosW * sinI * yOrb;
  return { x, y, z };
}

export default function DwarfPlanet({ data, simDate, showLabels, showOrbits }: DwarfPlanetProps) {
  const semiMajor = (data.perihelion + data.aphelion) / 2;
  const inc = data.inclination * DEG;
  const argP = data.argPerihelion * DEG;
  const longN = data.longAscNode * DEG;
  const periodDays = data.periodYears * 365.25;

  const j2000 = new Date(2000, 0, 1, 12, 0, 0);
  const daysSinceJ2000 = (simDate.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
  const M = ((2 * Math.PI) / periodDays * daysSinceJ2000) % (2 * Math.PI);

  const pos = keplerPosition(semiMajor, data.eccentricity, inc, argP, longN, M);
  const sceneX = auToScene(pos.x);
  const sceneY = auToScene(pos.z);
  const sceneZ = auToScene(pos.y);

  const visualRadius = 0.08 + (data.radiusKm / 2000) * 0.04;

  const orbitPoints = useMemo(() => {
    const segments = 256;
    const pts = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const mA = (i / segments) * Math.PI * 2;
      const p = keplerPosition(semiMajor, data.eccentricity, inc, argP, longN, mA);
      pts[i * 3] = auToScene(p.x);
      pts[i * 3 + 1] = auToScene(p.z);
      pts[i * 3 + 2] = auToScene(p.y);
    }
    return pts;
  }, [semiMajor, data.eccentricity, inc, argP, longN]);

  return (
    <>
      {showOrbits && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbitPoints, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={data.color} transparent opacity={0.1} />
        </line>
      )}
      <group position={[sceneX, sceneY, sceneZ]}>
        <mesh>
          <sphereGeometry args={[visualRadius, 16, 16]} />
          <meshStandardMaterial color={data.color} roughness={0.8} />
        </mesh>
        {showLabels && (
          <Html position={[0, visualRadius + 0.3, 0]} center style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white/40 backdrop-blur-sm">
              {data.name}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
