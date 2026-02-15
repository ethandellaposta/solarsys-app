import { auToScene, PlanetPosition } from "./astronomy";
import { COMETS, CometData } from "./planetData";
import { DWARF_PLANETS, DwarfPlanetData, SPACECRAFT, SpacecraftData } from "./extrasData";

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

  const x =
    (cosO * cosW - sinO * sinW * cosI) * xOrb +
    (-cosO * sinW - sinO * cosW * cosI) * yOrb;
  const y =
    (sinO * cosW + cosO * sinW * cosI) * xOrb +
    (-sinO * sinW + cosO * cosW * cosI) * yOrb;
  const z = sinW * sinI * xOrb + cosW * sinI * yOrb;
  return { x, y, z };
}

function orbitalScenePos(
  data: { perihelion: number; aphelion: number; eccentricity: number; inclination: number; argPerihelion: number; longAscNode: number; periodYears: number },
  simDate: Date
): { x: number; y: number; z: number } | null {
  const semiMajor = (data.perihelion + data.aphelion) / 2;
  const inc = data.inclination * DEG;
  const argP = data.argPerihelion * DEG;
  const longN = data.longAscNode * DEG;
  const periodDays = data.periodYears * 365.25;

  const j2000 = new Date(2000, 0, 1, 12, 0, 0);
  const daysSinceJ2000 =
    (simDate.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
  const M = (((2 * Math.PI) / periodDays) * daysSinceJ2000) % (2 * Math.PI);

  const pos = keplerPosition(semiMajor, data.eccentricity, inc, argP, longN, M);
  const dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  if (dist > 50) return null;

  return {
    x: auToScene(pos.x),
    y: auToScene(pos.z), // ecliptic z -> scene y
    z: auToScene(pos.y), // ecliptic y -> scene z
  };
}

function spacecraftScenePos(
  data: SpacecraftData,
  simDate: Date
): { x: number; y: number; z: number } | null {
  const yearsSince2025 =
    simDate.getFullYear() + simDate.getMonth() / 12 - 2025;
  const dist = data.distanceAU_2025 + data.speedAU_per_year * yearsSince2025;
  if (dist < 0 || dist > 300) return null;

  const angle = data.angle * DEG;
  const elev = data.elevationDeg * DEG;
  const flatDist = dist * Math.cos(elev);

  return {
    x: auToScene(flatDist * Math.cos(angle)),
    y: auToScene(dist * Math.sin(elev)),
    z: auToScene(flatDist * Math.sin(angle)),
  };
}

/**
 * Look up the scene-space position of any named object.
 * Returns { x, y, z } in scene units or null if not found/out of range.
 */
export function getObjectScenePosition(
  name: string,
  simDate: Date,
  planetPositions: PlanetPosition[]
): { x: number; y: number; z: number } | null {
  // Sun
  if (name === "Sun") return { x: 0, y: 0, z: 0 };

  // Planets (from astronomy-engine positions)
  const pp = planetPositions.find((p) => p.name === name);
  if (pp) {
    return {
      x: auToScene(pp.x),
      y: auToScene(pp.z),
      z: auToScene(pp.y),
    };
  }

  // Dwarf planets
  const dp = DWARF_PLANETS.find((d) => d.name === name);
  if (dp) return orbitalScenePos(dp, simDate);

  // Comets
  const comet = COMETS.find((c) => c.name === name);
  if (comet) return orbitalScenePos(comet, simDate);

  // Spacecraft
  const sc = SPACECRAFT.find((s) => s.name === name);
  if (sc) return spacecraftScenePos(sc, simDate);

  return null;
}
