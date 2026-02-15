// ─── Dwarf Planets (Keplerian orbital elements) ───
export interface DwarfPlanetData {
  name: string;
  radiusKm: number;
  perihelion: number; // AU
  aphelion: number; // AU
  eccentricity: number;
  inclination: number; // degrees
  argPerihelion: number; // degrees
  longAscNode: number; // degrees
  periodYears: number;
  color: string;
  description: string;
}

export const DWARF_PLANETS: DwarfPlanetData[] = [
  {
    name: "Pluto",
    radiusKm: 1188,
    perihelion: 29.658,
    aphelion: 49.305,
    eccentricity: 0.2488,
    inclination: 17.16,
    argPerihelion: 113.83,
    longAscNode: 110.30,
    periodYears: 247.94,
    color: "#C9B8A4",
    description: "Pluto — once the 9th planet, now classified as a dwarf planet in the Kuiper Belt.",
  },
  {
    name: "Ceres",
    radiusKm: 473,
    perihelion: 2.558,
    aphelion: 2.977,
    eccentricity: 0.0758,
    inclination: 10.59,
    argPerihelion: 73.60,
    longAscNode: 80.33,
    periodYears: 4.60,
    color: "#A0A0A0",
    description: "Ceres — the largest object in the asteroid belt and the only dwarf planet in the inner solar system.",
  },
  {
    name: "Eris",
    radiusKm: 1163,
    perihelion: 38.27,
    aphelion: 97.56,
    eccentricity: 0.4361,
    inclination: 44.04,
    argPerihelion: 151.64,
    longAscNode: 35.87,
    periodYears: 558.04,
    color: "#E0DDD8",
    description: "Eris — the most massive known dwarf planet, slightly more massive than Pluto.",
  },
  {
    name: "Makemake",
    radiusKm: 715,
    perihelion: 38.59,
    aphelion: 53.07,
    eccentricity: 0.1589,
    inclination: 28.98,
    argPerihelion: 297.24,
    longAscNode: 79.38,
    periodYears: 306.21,
    color: "#D4A574",
    description: "Makemake — a Kuiper Belt dwarf planet, one of the brightest objects in the outer solar system.",
  },
  {
    name: "Haumea",
    radiusKm: 816,
    perihelion: 34.95,
    aphelion: 51.48,
    eccentricity: 0.1912,
    inclination: 28.19,
    argPerihelion: 240.20,
    longAscNode: 122.17,
    periodYears: 284.12,
    color: "#C8C8D0",
    description: "Haumea — an elongated dwarf planet with two moons and a ring system, rotating every 4 hours.",
  },
];

// ─── Major Moons ───
export interface MoonData {
  name: string;
  parent: string;
  radiusKm: number;
  orbitRadiusKm: number; // distance from parent planet
  periodDays: number; // orbital period around parent
  color: string;
  description: string;
}

export const MAJOR_MOONS: MoonData[] = [
  // Earth
  { name: "Moon", parent: "Earth", radiusKm: 1737, orbitRadiusKm: 384400, periodDays: 27.32, color: "#C0C0C0", description: "Earth's only natural satellite." },
  // Mars
  { name: "Phobos", parent: "Mars", radiusKm: 11, orbitRadiusKm: 9376, periodDays: 0.319, color: "#8B7D6B", description: "Mars' larger moon, slowly spiraling inward." },
  { name: "Deimos", parent: "Mars", radiusKm: 6, orbitRadiusKm: 23463, periodDays: 1.263, color: "#9B8B7B", description: "Mars' smaller, outer moon." },
  // Jupiter - Galilean moons
  { name: "Io", parent: "Jupiter", radiusKm: 1822, orbitRadiusKm: 421700, periodDays: 1.769, color: "#E8C84A", description: "The most volcanically active body in the solar system." },
  { name: "Europa", parent: "Jupiter", radiusKm: 1561, orbitRadiusKm: 671034, periodDays: 3.551, color: "#C8B898", description: "An ice-covered moon with a subsurface ocean." },
  { name: "Ganymede", parent: "Jupiter", radiusKm: 2634, orbitRadiusKm: 1070412, periodDays: 7.155, color: "#A09080", description: "The largest moon in the solar system." },
  { name: "Callisto", parent: "Jupiter", radiusKm: 2410, orbitRadiusKm: 1882709, periodDays: 16.689, color: "#706050", description: "Jupiter's second-largest moon, heavily cratered." },
  // Saturn
  { name: "Titan", parent: "Saturn", radiusKm: 2575, orbitRadiusKm: 1221870, periodDays: 15.945, color: "#D4A030", description: "Saturn's largest moon with a thick atmosphere and methane lakes." },
  { name: "Enceladus", parent: "Saturn", radiusKm: 252, orbitRadiusKm: 237948, periodDays: 1.370, color: "#F0F0FF", description: "A small icy moon with geysers and a subsurface ocean." },
  // Neptune
  { name: "Triton", parent: "Neptune", radiusKm: 1353, orbitRadiusKm: 354759, periodDays: 5.877, color: "#B0C4DE", description: "Neptune's largest moon, orbiting retrograde — likely a captured Kuiper Belt object." },
];

// ─── Spacecraft ───
export interface SpacecraftData {
  name: string;
  launchYear: number;
  // Simplified: position as a function of time (AU from Sun, angle)
  // We'll use a linear radial model for deep-space probes
  // and fixed positions for orbital missions
  type: "deep-space" | "orbital";
  // For deep-space: radial distance increases over time
  distanceAU_2025: number; // approximate distance in 2025
  speedAU_per_year: number; // approximate radial speed
  angle: number; // ecliptic longitude in degrees (approximate heading)
  elevationDeg: number; // elevation above ecliptic
  color: string;
  icon: string;
  description: string;
}

export const SPACECRAFT: SpacecraftData[] = [
  {
    name: "Voyager 1",
    launchYear: 1977,
    type: "deep-space",
    distanceAU_2025: 163.7,
    speedAU_per_year: 3.6,
    angle: 255,
    elevationDeg: 35,
    color: "#FFD700",
    icon: "🛰️",
    description: "Voyager 1 — the most distant human-made object, in interstellar space since 2012.",
  },
  {
    name: "Voyager 2",
    launchYear: 1977,
    type: "deep-space",
    distanceAU_2025: 137.2,
    speedAU_per_year: 3.1,
    angle: 120,
    elevationDeg: -48,
    color: "#FFD700",
    icon: "🛰️",
    description: "Voyager 2 — the only spacecraft to visit all four giant planets, in interstellar space since 2018.",
  },
  {
    name: "New Horizons",
    launchYear: 2006,
    type: "deep-space",
    distanceAU_2025: 59.7,
    speedAU_per_year: 2.8,
    angle: 290,
    elevationDeg: 2,
    color: "#00BFFF",
    icon: "🚀",
    description: "New Horizons — flew by Pluto in 2015 and Arrokoth in 2019, now exploring the Kuiper Belt.",
  },
  {
    name: "Parker Solar Probe",
    launchYear: 2018,
    type: "orbital",
    distanceAU_2025: 0.06,
    speedAU_per_year: 0,
    angle: 0,
    elevationDeg: 3,
    color: "#FF4500",
    icon: "☀️",
    description: "Parker Solar Probe — the closest human-made object to the Sun, studying the solar corona.",
  },
  {
    name: "James Webb (JWST)",
    launchYear: 2021,
    type: "orbital",
    distanceAU_2025: 1.01, // L2 point
    speedAU_per_year: 0,
    angle: 180, // opposite side from Sun relative to Earth
    elevationDeg: 0,
    color: "#FFD700",
    icon: "🔭",
    description: "James Webb Space Telescope — orbiting the Sun-Earth L2 point, 1.5 million km from Earth.",
  },
];

// ─── Kuiper Belt ───
export const KUIPER_BELT = {
  innerRadius: 30, // AU
  outerRadius: 50, // AU
  thickness: 3, // AU vertical spread
  count: 3000,
  color: "#5A5A6A",
};

// ─── Trojan Asteroids ───
export const TROJAN_ASTEROIDS = {
  orbitRadius: 5.2, // AU (Jupiter's orbit)
  spreadRadius: 0.6, // AU spread around L4/L5
  spreadAngle: 15, // degrees spread
  countPerGroup: 600,
  color: "#7A7060",
};

// ─── Habitable Zone ───
export const HABITABLE_ZONE = {
  innerRadius: 0.95, // AU
  outerRadius: 1.67, // AU
  color: "#22C55E",
};

// ─── Light travel times (seconds from Sun) ───
export const LIGHT_SPEED_AU_PER_SEC = 1 / 499.0; // ~0.002 AU/s
export const LIGHT_TIMES: Record<string, number> = {
  Mercury: 193,
  Venus: 360,
  Earth: 499,
  Mars: 760,
  Jupiter: 2595,
  Saturn: 4759,
  Uranus: 9575,
  Neptune: 14998,
};

// ─── Meteor Showers ───
export interface MeteorShowerData {
  name: string;
  peakMonth: number; // 1-12
  peakDay: number;
  radiantRA: number; // hours
  radiantDec: number; // degrees
  zhr: number; // zenithal hourly rate
  parentBody: string;
  color: string;
}

export const METEOR_SHOWERS: MeteorShowerData[] = [
  { name: "Quadrantids", peakMonth: 1, peakDay: 3, radiantRA: 15.3, radiantDec: 49, zhr: 120, parentBody: "2003 EH1", color: "#6699FF" },
  { name: "Lyrids", peakMonth: 4, peakDay: 22, radiantRA: 18.1, radiantDec: 34, zhr: 18, parentBody: "C/1861 G1 Thatcher", color: "#88AAFF" },
  { name: "Perseids", peakMonth: 8, peakDay: 12, radiantRA: 3.1, radiantDec: 58, zhr: 100, parentBody: "109P/Swift-Tuttle", color: "#FFAA44" },
  { name: "Orionids", peakMonth: 10, peakDay: 21, radiantRA: 6.3, radiantDec: 16, zhr: 20, parentBody: "1P/Halley", color: "#FF8844" },
  { name: "Leonids", peakMonth: 11, peakDay: 17, radiantRA: 10.1, radiantDec: 22, zhr: 15, parentBody: "55P/Tempel-Tuttle", color: "#FFCC66" },
  { name: "Geminids", peakMonth: 12, peakDay: 14, radiantRA: 7.5, radiantDec: 33, zhr: 150, parentBody: "3200 Phaethon", color: "#FFDD88" },
];
