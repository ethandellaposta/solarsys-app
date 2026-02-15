export interface PlanetData {
  name: string;
  radiusKm: number; // real radius in km
  radius: number; // visual radius in scene units (computed from radiusKm)
  orbitRadius: number; // not used for positioning (astronomy-engine handles that), kept for reference
  orbitSpeed: number; // not used (astronomy-engine handles that)
  rotationSpeed: number; // legacy, unused — kept for compat
  siderealPeriodHours: number; // real sidereal rotation period in hours (negative = retrograde)
  color: string; // base color hex
  textureUrl?: string; // URL to texture map image
  emissive?: string; // emissive color (for sun)
  emissiveIntensity?: number;
  tilt: number; // axial tilt in radians
  rings?: { innerRadius: number; outerRadius: number; color: string };
  description: string;
  facts: {
    diameter: string;
    distanceFromSun: string;
    dayLength: string;
    yearLength: string;
    moons: string;
    temperature: string;
    type: string;
  };
}

// Planet visual style hints for procedural shaders
export const PLANET_STYLES: Record<string, {
  colors: string[];
  style: "bands" | "rocky" | "icy" | "gas" | "star";
  bandCount?: number;
  noiseScale?: number;
  atmosphereColor?: string;
  atmosphereOpacity?: number;
}> = {
  Sun: { colors: ["#FDB813", "#FF8C00", "#FF4500", "#FFD700"], style: "star" },
  Mercury: { colors: ["#8B8682", "#A09890", "#6B6460", "#7A7570"], style: "rocky", noiseScale: 8 },
  Venus: { colors: ["#E8CDA0", "#D4A860", "#C8B080", "#BFA070"], style: "rocky", noiseScale: 3, atmosphereColor: "#E8CDA0", atmosphereOpacity: 0.25 },
  Earth: { colors: ["#1B4F72", "#2471A3", "#2E86C1", "#1A5276", "#27AE60", "#196F3D"], style: "rocky", noiseScale: 5, atmosphereColor: "#87CEEB", atmosphereOpacity: 0.15 },
  Mars: { colors: ["#C0392B", "#E27B58", "#A04030", "#D4603A", "#8B4513"], style: "rocky", noiseScale: 6 },
  Jupiter: { colors: ["#C4A882", "#D4A460", "#E8C8A0", "#A08060", "#C09060", "#8B7355"], style: "bands", bandCount: 12 },
  Saturn: { colors: ["#E8D5A3", "#D4C090", "#C8B070", "#F0E0B0", "#B8A060"], style: "bands", bandCount: 8 },
  Uranus: { colors: ["#7EC8E3", "#5BA3C4", "#9DD8F0", "#4A90B0"], style: "icy", atmosphereColor: "#7EC8E3", atmosphereOpacity: 0.12 },
  Neptune: { colors: ["#3B5EE8", "#2040C0", "#5070F0", "#1830A0"], style: "icy", atmosphereColor: "#3B5EE8", atmosphereOpacity: 0.12 },
};

// Real radii in km
// Sun: 695,700 km, Mercury: 2,440, Venus: 6,052, Earth: 6,371,
// Mars: 3,390, Jupiter: 69,911, Saturn: 58,232, Uranus: 25,362, Neptune: 24,622

// We use a log-based scale so that:
// - Relative proportions are preserved (Jupiter >> Earth >> Mercury)
// - Small planets remain visible
// - The Sun doesn't dominate the entire scene
// Formula: visualRadius = BASE * log10(radiusKm / REF) ^ POWER
// Tuned so Earth ~ 0.35, Jupiter ~ 0.9, Sun ~ 2.2

const RADIUS_BASE = 0.28;
const RADIUS_REF = 1000;
const RADIUS_POWER = 1.6;

function scaleRadius(km: number): number {
  return RADIUS_BASE * Math.pow(Math.log10(km / RADIUS_REF), RADIUS_POWER);
}

// Ring radii scale relative to planet visual radius
function scaleRings(
  planetKm: number,
  innerMult: number,
  outerMult: number,
  color: string
): { innerRadius: number; outerRadius: number; color: string } {
  const r = scaleRadius(planetKm);
  return { innerRadius: r * innerMult, outerRadius: r * outerMult, color };
}

export const SUN_DATA: PlanetData = {
  name: "Sun",
  radiusKm: 695700,
  radius: scaleRadius(695700), // ~2.2
  orbitRadius: 0,
  orbitSpeed: 0,
  rotationSpeed: 0.02,
  siderealPeriodHours: 609.12,
  color: "#FDB813",
  emissive: "#FDB813",
  emissiveIntensity: 2,
  tilt: 0.1265,
  description:
    "The Sun is the star at the center of our Solar System. It is a nearly perfect ball of hot plasma, heated to incandescence by nuclear fusion reactions in its core.",
  facts: {
    diameter: "1,391,000 km",
    distanceFromSun: "0 km",
    dayLength: "25-35 Earth days",
    yearLength: "N/A",
    moons: "0",
    temperature: "5,500°C (surface)",
    type: "G-type main-sequence star",
  },
};

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    radiusKm: 2440,
    radius: scaleRadius(2440), // ~0.14
    orbitRadius: 0.387,
    orbitSpeed: 0,
    rotationSpeed: 0.008,
    siderealPeriodHours: 1407.6,
    color: "#B5B5B5",
    tilt: 0.0005,
    description:
      "Mercury is the smallest planet in the Solar System and the closest to the Sun. It has no atmosphere to retain heat, causing extreme temperature variations.",
    facts: {
      diameter: "4,879 km",
      distanceFromSun: "57.9 million km",
      dayLength: "59 Earth days",
      yearLength: "88 Earth days",
      moons: "0",
      temperature: "-180°C to 430°C",
      type: "Terrestrial",
    },
  },
  {
    name: "Venus",
    radiusKm: 6052,
    radius: scaleRadius(6052), // ~0.33
    orbitRadius: 0.723,
    orbitSpeed: 0,
    rotationSpeed: -0.002,
    siderealPeriodHours: -5832.5,
    color: "#E8CDA0",
    tilt: 3.0943,
    description:
      "Venus is the second planet from the Sun. It has the densest atmosphere of the terrestrial planets, consisting mostly of carbon dioxide with a thick sulfuric acid cloud layer.",
    facts: {
      diameter: "12,104 km",
      distanceFromSun: "108.2 million km",
      dayLength: "243 Earth days",
      yearLength: "225 Earth days",
      moons: "0",
      temperature: "465°C (average)",
      type: "Terrestrial",
    },
  },
  {
    name: "Earth",
    radiusKm: 6371,
    radius: scaleRadius(6371), // ~0.35
    orbitRadius: 1.0,
    orbitSpeed: 0,
    rotationSpeed: 0.5,
    siderealPeriodHours: 23.934,
    color: "#2E86C1",
    tilt: 0.4091,
    description:
      "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth's surface is covered with water.",
    facts: {
      diameter: "12,756 km",
      distanceFromSun: "149.6 million km",
      dayLength: "24 hours",
      yearLength: "365.25 days",
      moons: "1",
      temperature: "15°C (average)",
      type: "Terrestrial",
    },
  },
  {
    name: "Mars",
    radiusKm: 3390,
    radius: scaleRadius(3390), // ~0.20
    orbitRadius: 1.524,
    orbitSpeed: 0,
    rotationSpeed: 0.49,
    siderealPeriodHours: 24.623,
    color: "#E27B58",
    tilt: 0.4396,
    description:
      "Mars is the fourth planet from the Sun, often called the 'Red Planet' due to its reddish appearance caused by iron oxide on its surface.",
    facts: {
      diameter: "6,792 km",
      distanceFromSun: "227.9 million km",
      dayLength: "24.6 hours",
      yearLength: "687 Earth days",
      moons: "2",
      temperature: "-65°C (average)",
      type: "Terrestrial",
    },
  },
  {
    name: "Jupiter",
    radiusKm: 69911,
    radius: scaleRadius(69911), // ~0.90
    orbitRadius: 5.203,
    orbitSpeed: 0,
    rotationSpeed: 1.21,
    siderealPeriodHours: 9.925,
    color: "#C4A882",
    tilt: 0.0546,
    description:
      "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets combined.",
    facts: {
      diameter: "142,984 km",
      distanceFromSun: "778.5 million km",
      dayLength: "9.9 hours",
      yearLength: "11.9 Earth years",
      moons: "95",
      temperature: "-110°C (cloud top)",
      type: "Gas Giant",
    },
  },
  {
    name: "Saturn",
    radiusKm: 58232,
    radius: scaleRadius(58232), // ~0.82
    orbitRadius: 9.537,
    orbitSpeed: 0,
    rotationSpeed: 1.12,
    siderealPeriodHours: 10.656,
    color: "#E8D5A3",
    tilt: 0.4665,
    rings: scaleRings(58232, 1.5, 2.3, "#D4B896"),
    description:
      "Saturn is the sixth planet from the Sun and the second-largest in the Solar System. It is best known for its prominent ring system made of ice particles, rocky debris, and dust.",
    facts: {
      diameter: "120,536 km",
      distanceFromSun: "1.43 billion km",
      dayLength: "10.7 hours",
      yearLength: "29.5 Earth years",
      moons: "146",
      temperature: "-140°C (average)",
      type: "Gas Giant",
    },
  },
  {
    name: "Uranus",
    radiusKm: 25362,
    radius: scaleRadius(25362), // ~0.60
    orbitRadius: 19.19,
    orbitSpeed: 0,
    rotationSpeed: -0.70,
    siderealPeriodHours: -17.24,
    color: "#7EC8E3",
    tilt: 1.7064,
    rings: scaleRings(25362, 1.4, 1.7, "#5BA3C4"),
    description:
      "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass. It rotates on its side with an axial tilt of 98 degrees.",
    facts: {
      diameter: "51,118 km",
      distanceFromSun: "2.87 billion km",
      dayLength: "17.2 hours",
      yearLength: "84 Earth years",
      moons: "28",
      temperature: "-195°C (average)",
      type: "Ice Giant",
    },
  },
  {
    name: "Neptune",
    radiusKm: 24622,
    radius: scaleRadius(24622), // ~0.58
    orbitRadius: 30.07,
    orbitSpeed: 0,
    rotationSpeed: 0.74,
    siderealPeriodHours: 16.11,
    color: "#3B5EE8",
    tilt: 0.4943,
    description:
      "Neptune is the eighth and farthest known planet from the Sun. It is the fourth-largest planet by diameter and the third-most-massive. Neptune has the strongest winds of any planet.",
    facts: {
      diameter: "49,528 km",
      distanceFromSun: "4.50 billion km",
      dayLength: "16.1 hours",
      yearLength: "165 Earth years",
      moons: "16",
      temperature: "-200°C (average)",
      type: "Ice Giant",
    },
  },
];

// Comet data for famous periodic comets
export interface CometData {
  name: string;
  perihelion: number; // AU - closest to sun
  aphelion: number; // AU - farthest from sun
  eccentricity: number;
  inclination: number; // degrees
  argPerihelion: number; // argument of perihelion, degrees
  longAscNode: number; // longitude of ascending node, degrees
  periodYears: number;
  color: string;
  tailColor: string;
  description: string;
}

export const COMETS: CometData[] = [
  {
    name: "Halley",
    perihelion: 0.586,
    aphelion: 35.08,
    eccentricity: 0.967,
    inclination: 162.26,
    argPerihelion: 111.33,
    longAscNode: 58.42,
    periodYears: 75.32,
    color: "#E8E8FF",
    tailColor: "#4488FF",
    description: "Halley's Comet — the most famous periodic comet, visible from Earth every 75-76 years.",
  },
  {
    name: "Encke",
    perihelion: 0.336,
    aphelion: 4.094,
    eccentricity: 0.848,
    inclination: 11.78,
    argPerihelion: 186.55,
    longAscNode: 334.57,
    periodYears: 3.3,
    color: "#FFFFDD",
    tailColor: "#FFCC44",
    description: "Comet Encke — has the shortest orbital period of any known comet at just 3.3 years.",
  },
  {
    name: "Hale-Bopp",
    perihelion: 0.914,
    aphelion: 370.8,
    eccentricity: 0.995,
    inclination: 89.43,
    argPerihelion: 130.59,
    longAscNode: 282.47,
    periodYears: 2533,
    color: "#FFFFFF",
    tailColor: "#66BBFF",
    description: "Comet Hale-Bopp — one of the brightest comets of the 20th century, visible to the naked eye for 18 months.",
  },
];

// Asteroid belt parameters (real values in AU)
export const ASTEROID_BELT = {
  innerRadius: 2.06, // AU — inner edge (near Mars)
  outerRadius: 3.27, // AU — outer edge (near Jupiter)
  thickness: 0.3, // AU — vertical spread
  count: 4000, // number of particles
  color: "#8B8680",
};
