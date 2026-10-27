export interface PlanetConfig {
  id: string;
  name: string;
  mass: number;
  radius: number;
  mu: number;
  color: string;
  atmosphereColor?: string;
  emissiveColor?: string;
  description: string;
  kind: string;
  distanceAU: number;
  periodDays: number;
  rotationDays: number;
  tilt: number;
  eccentricity: number;
  inclination: number;
  visualDistance: number;
  visualRadius: number;
  texture: string;
  fact: string;
  temperature: string;
  source: string;
}

const body = (data: PlanetConfig) => data;
export const PLANETS: Record<string, PlanetConfig> = {
  mercury: body({
    id: "mercury",
    name: "Mercurio",
    mass: 3.3011e23,
    radius: 2439.7,
    mu: 22031.87,
    color: "#b3aaa0",
    description:
      "Un mundo rocoso cubierto de cráteres, muy cerca del Sol y casi sin atmósfera.",
    kind: "Planeta rocoso",
    distanceAU: 0.387,
    periodDays: 87.969,
    rotationDays: 58.646,
    tilt: 0.034,
    eccentricity: 0.2056,
    inclination: 7,
    visualDistance: 12,
    visualRadius: 0.52,
    texture: "2k_mercury.jpg",
    fact: "Su año dura solo 88 días terrestres. Sus días y noches tienen temperaturas extremas.",
    temperature: "−180 a 430 °C",
    source: "https://science.nasa.gov/mercury/facts/",
  }),
  venus: body({
    id: "venus",
    name: "Venus",
    mass: 4.8675e24,
    radius: 6051.8,
    mu: 324858.59,
    color: "#d6bc85",
    atmosphereColor: "#e8c58e",
    description:
      "Una espesa cubierta de nubes oculta su superficie. Su atmósfera retiene una enorme cantidad de calor.",
    kind: "Planeta rocoso",
    distanceAU: 0.723,
    periodDays: 224.701,
    rotationDays: 243.025,
    tilt: 177.36,
    eccentricity: 0.0068,
    inclination: 3.39,
    visualDistance: 17,
    visualRadius: 0.93,
    texture: "2k_venus_atmosphere.jpg",
    fact: "Tarda más en girar sobre su eje que en completar una vuelta alrededor del Sol.",
    temperature: "≈ 464 °C",
    source: "https://science.nasa.gov/venus/facts/",
  }),
  earth: body({
    id: "earth",
    name: "Tierra",
    mass: 5.972e24,
    radius: 6371,
    mu: 398600.44,
    color: "#5a9ed2",
    atmosphereColor: "#579af4",
    description:
      "Océanos, continentes y una atmósfera protectora. Es el único mundo donde sabemos que existe vida.",
    kind: "Planeta rocoso",
    distanceAU: 1,
    periodDays: 365.256,
    rotationDays: 0.99727,
    tilt: 23.44,
    eccentricity: 0.0167,
    inclination: 0,
    visualDistance: 23,
    visualRadius: 1,
    texture: "2k_earth_daymap.jpg",
    fact: "Su inclinación axial produce las estaciones. La distancia al Sol no es su causa principal.",
    temperature: "≈ 15 °C de media",
    source: "https://science.nasa.gov/earth/facts/",
  }),
  mars: body({
    id: "mars",
    name: "Marte",
    mass: 6.417e23,
    radius: 3389.5,
    mu: 42828.37,
    color: "#d38a61",
    atmosphereColor: "#bc6644",
    description:
      "Su polvo rico en hierro le da el color rojo. Conserva huellas de un pasado con agua líquida.",
    kind: "Planeta rocoso",
    distanceAU: 1.524,
    periodDays: 686.98,
    rotationDays: 1.02596,
    tilt: 25.19,
    eccentricity: 0.0934,
    inclination: 1.85,
    visualDistance: 30,
    visualRadius: 0.72,
    texture: "2k_mars.jpg",
    fact: "El monte Olimpo es un enorme volcán de unos 22 km de altura, mucho mayor que el Everest.",
    temperature: "≈ −65 °C de media",
    source: "https://science.nasa.gov/mars/facts/",
  }),
  jupiter: body({
    id: "jupiter",
    name: "Júpiter",
    mass: 1.898e27,
    radius: 69911,
    mu: 126686534,
    color: "#d6b894",
    description:
      "El planeta más grande: un gigante de hidrógeno y helio con bandas de nubes y tormentas enormes.",
    kind: "Gigante gaseoso",
    distanceAU: 5.203,
    periodDays: 4332.59,
    rotationDays: 0.41354,
    tilt: 3.13,
    eccentricity: 0.0489,
    inclination: 1.3,
    visualDistance: 45,
    visualRadius: 3.1,
    texture: "2k_jupiter.jpg",
    fact: "La Gran Mancha Roja es una tormenta gigantesca observada durante siglos.",
    temperature: "≈ −110 °C en las nubes",
    source: "https://science.nasa.gov/jupiter/facts/",
  }),
  saturn: body({
    id: "saturn",
    name: "Saturno",
    mass: 5.683e26,
    radius: 58232,
    mu: 37931187,
    color: "#d9c69c",
    description:
      "Sus anillos están formados por incontables fragmentos de hielo y roca, que orbitan el planeta.",
    kind: "Gigante gaseoso",
    distanceAU: 9.537,
    periodDays: 10759.22,
    rotationDays: 0.444,
    tilt: 26.73,
    eccentricity: 0.0565,
    inclination: 2.49,
    visualDistance: 61,
    visualRadius: 2.6,
    texture: "2k_saturn.jpg",
    fact: "Su densidad media es menor que la del agua. No tiene una superficie sólida donde aterrizar.",
    temperature: "≈ −140 °C en las nubes",
    source: "https://science.nasa.gov/saturn/facts/",
  }),
  uranus: body({
    id: "uranus",
    name: "Urano",
    mass: 8.681e25,
    radius: 25362,
    mu: 5793939,
    color: "#a8d8dd",
    atmosphereColor: "#7bc5d5",
    description:
      "Su atmósfera contiene metano, que absorbe luz roja. Su eje de rotación está casi acostado.",
    kind: "Gigante de hielo",
    distanceAU: 19.19,
    periodDays: 30688.5,
    rotationDays: 0.71833,
    tilt: 97.77,
    eccentricity: 0.0457,
    inclination: 0.77,
    visualDistance: 77,
    visualRadius: 1.65,
    texture: "2k_uranus.jpg",
    fact: "Su inclinación de casi 98° provoca estaciones extremas que duran unos 21 años terrestres.",
    temperature: "Hasta −224 °C",
    source: "https://science.nasa.gov/uranus/facts/",
  }),
  neptune: body({
    id: "neptune",
    name: "Neptuno",
    mass: 1.024e26,
    radius: 24622,
    mu: 6836529,
    color: "#6283c9",
    atmosphereColor: "#4872da",
    description:
      "Oscuro, frío y azotado por fuertes vientos. Es el planeta más lejano del Sol.",
    kind: "Gigante de hielo",
    distanceAU: 30.07,
    periodDays: 60182,
    rotationDays: 0.67125,
    tilt: 28.32,
    eccentricity: 0.0113,
    inclination: 1.77,
    visualDistance: 93,
    visualRadius: 1.6,
    texture: "2k_neptune.jpg",
    fact: "Necesita cerca de 165 años terrestres para completar una órbita alrededor del Sol.",
    temperature: "≈ −200 °C en las nubes",
    source: "https://science.nasa.gov/neptune/facts/",
  }),
  moon: body({
    id: "moon",
    name: "Luna",
    mass: 7.347e22,
    radius: 1737.4,
    mu: 4902.8,
    color: "#a9aaa9",
    description:
      "El satélite natural de la Tierra. Sus cráteres registran miles de millones de años de impactos.",
    kind: "Satélite natural",
    distanceAU: 1,
    periodDays: 27.3217,
    rotationDays: 27.3217,
    tilt: 6.68,
    eccentricity: 0.0549,
    inclination: 5.14,
    visualDistance: 0,
    visualRadius: 0.27,
    texture: "2k_moon.jpg",
    fact: "Su rotación está sincronizada con su órbita: por eso vemos casi siempre la misma cara.",
    temperature: "−173 a 127 °C",
    source: "https://science.nasa.gov/moon/facts/",
  }),
};
export const SOLAR_PLANETS = Object.values(PLANETS).filter(
  (p) => p.id !== "moon",
);
export const number = (value: number, digits = 0) =>
  value.toLocaleString("es-BO", { maximumFractionDigits: digits });
export const texturePath = (name: string) => `/textures/${name}`;

/** Solves Kepler's equation for elliptic orbits; angles in radians. */
export function solveEccentricAnomaly(mean: number, eccentricity: number) {
  const m = ((mean % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let e = eccentricity < 0.8 ? m : Math.PI;
  for (let i = 0; i < 15; i++) {
    const correction =
      (e - eccentricity * Math.sin(e) - m) / (1 - eccentricity * Math.cos(e));
    e -= correction;
    if (Math.abs(correction) < 1e-10) break;
  }
  return e;
}
