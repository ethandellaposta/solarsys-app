import * as Astronomy from "astronomy-engine";

export interface PlanetPosition {
  name: string;
  x: number; // AU, ecliptic
  y: number; // AU, ecliptic (mapped to scene Y=0 plane, so this becomes Z)
  z: number; // AU, ecliptic (mapped to scene Y)
  distanceFromSun: number; // AU
  distanceFromEarth: number; // AU
  rightAscension: number; // hours
  declination: number; // degrees
  constellation: string;
  elongation: number; // degrees from sun
  magnitude: number | null; // apparent visual magnitude
}

const BODY_MAP: Record<string, Astronomy.Body> = {
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Earth: Astronomy.Body.Earth,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
};

const SCENE_SCALE = 8; // AU to scene units multiplier

export function getSceneScale(): number {
  return SCENE_SCALE;
}

export function auToScene(au: number): number {
  return au * SCENE_SCALE;
}

export function computePlanetPositions(date: Date): PlanetPosition[] {
  const astroDate = Astronomy.MakeTime(date);
  const positions: PlanetPosition[] = [];

  for (const [name, body] of Object.entries(BODY_MAP)) {
    // Heliocentric ecliptic coordinates
    const helio = Astronomy.HelioVector(body, astroDate);

    // Geocentric equatorial for RA/Dec
    const geo = Astronomy.GeoVector(body, astroDate, true);
    // Use a default observer at (0,0,0) on Earth's surface for RA/Dec
    const observer = new Astronomy.Observer(0, 0, 0);
    const equ = Astronomy.Equator(body, astroDate, observer, true, true);

    // Distance from sun
    const distFromSun = Math.sqrt(
      helio.x * helio.x + helio.y * helio.y + helio.z * helio.z
    );

    // Distance from earth
    const distFromEarth = Math.sqrt(
      geo.x * geo.x + geo.y * geo.y + geo.z * geo.z
    );

    // Elongation from sun
    let elongation = 0;
    try {
      const elongResult = Astronomy.Elongation(body, astroDate);
      elongation = elongResult.elongation;
    } catch {
      elongation = 0;
    }

    // Visual magnitude
    let magnitude: number | null = null;
    try {
      const illum = Astronomy.Illumination(body, astroDate);
      magnitude = illum.mag;
    } catch {
      magnitude = null;
    }

    // Constellation
    let constellation = "";
    try {
      const constel = Astronomy.Constellation(equ.ra, equ.dec);
      constellation = constel.name;
    } catch {
      constellation = "Unknown";
    }

    positions.push({
      name,
      // Map ecliptic: x->x, y->z (depth), z->y (up) in scene coords
      x: helio.x,
      y: helio.y,
      z: helio.z,
      distanceFromSun: distFromSun,
      distanceFromEarth: distFromEarth,
      rightAscension: equ.ra,
      declination: equ.dec,
      constellation,
      elongation,
      magnitude,
    });
  }

  return positions;
}

export function computeOrbitPath(
  planetName: string,
  date: Date,
  segments: number = 128
): { x: number; y: number; z: number }[] {
  const body = BODY_MAP[planetName];
  if (!body) return [];

  // Approximate orbital period in days
  const periods: Record<string, number> = {
    Mercury: 87.97,
    Venus: 224.7,
    Earth: 365.25,
    Mars: 687.0,
    Jupiter: 4332.59,
    Saturn: 10759.22,
    Uranus: 30688.5,
    Neptune: 60182.0,
  };

  const period = periods[planetName] || 365.25;
  const points: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = new Date(
      date.getTime() + (i / segments) * period * 24 * 60 * 60 * 1000
    );
    const astroDate = Astronomy.MakeTime(t);
    const helio = Astronomy.HelioVector(body, astroDate);
    points.push({ x: helio.x, y: helio.y, z: helio.z });
  }

  return points;
}

export function formatRA(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = ((hours - h) * 60 - m) * 60;
  return `${h}h ${m}m ${s.toFixed(1)}s`;
}

export function formatDec(degrees: number): string {
  const sign = degrees >= 0 ? "+" : "-";
  const abs = Math.abs(degrees);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d) * 60 - m) * 60;
  return `${sign}${d}° ${m}' ${s.toFixed(0)}"`;
}

export function formatAU(au: number): string {
  return `${au.toFixed(3)} AU`;
}

export function auToKm(au: number): string {
  const km = au * 149597870.7;
  if (km >= 1e9) return `${(km / 1e9).toFixed(2)} billion km`;
  if (km >= 1e6) return `${(km / 1e6).toFixed(1)} million km`;
  return `${km.toFixed(0)} km`;
}
