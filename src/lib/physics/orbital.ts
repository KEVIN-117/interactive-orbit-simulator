/** @license SPDX-License-Identifier: Apache-2.0 */
export { PLANETS } from "../planets";
export type { PlanetConfig } from "../planets";
export const G = 6.6743e-11;
export interface OrbitalState {
  semiMajorAxis: number; // a (km)
  eccentricity: number; // e (0 a 1)
  inclination: number; // i (grados, 0-180)
  argumentOfPeriapsis: number; // omega (grados)
  trueAnomaly: number; // nu (grados, para posición actual)
  mu?: number; // Parámetro gravitacional estándar (km^3 / s^2)
}

/**
 * Calcula la velocidad orbital instantánea usando la ecuación Vis-Viva:
 * v = sqrt( mu * (2/r - 1/a) )
 *
 * @param r Distancia actual al centro del planeta (km)
 * @param a Semieje mayor de la órbita (km)
 * @param mu Parámetro gravitacional estándar (km^3 / s^2)
 * @returns Velocidad orbital en km/s
 */
export function calculateVelocity(r: number, a: number, mu: number): number {
  if (r <= 0 || a <= 0) return 0;
  const val = mu * (2 / r - 1 / a);
  return val > 0 ? Math.sqrt(val) : 0;
}

/**
 * Calcula el periodo orbital:
 * T = 2 * pi * sqrt( a^3 / mu )
 *
 * @param a Semieje mayor de la órbita (km)
 * @param mu Parámetro gravitacional estándar (km^3 / s^2)
 * @returns Periodo orbital en segundos
 */
export function calculatePeriod(a: number, mu: number): number {
  if (a <= 0 || mu <= 0) return 0;
  return 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu);
}

/**
 * Calcula la energía orbital específica (epsilon):
 * epsilon = v^2 / 2 - mu / r = -mu / (2 * a)
 *
 * @param a Semieje mayor de la órbita (km)
 * @param mu Parámetro gravitacional estándar (km^3 / s^2)
 * @returns Energía específica en km^2 / s^2 (MJ/kg)
 */
export function calculateSpecificEnergy(a: number, mu: number): number {
  if (a <= 0 || mu <= 0) return 0;
  return -mu / (2 * a);
}

/**
 * Calcula los radios de perigeo (periapsis) y apogeo (apoapsis):
 * rp = a * (1 - e)
 * ra = a * (1 + e)
 */
export function calculateApoapsisPeriapsis(
  a: number,
  eccentricity: number,
): { apoapsis: number; periapsis: number } {
  return {
    apoapsis: a * (1 + eccentricity),
    periapsis: a * (1 - eccentricity),
  };
}

/**
 * Genera un conjunto de puntos 3D para graficar la trayectoria orbital
 * en base a los parámetros orbitales Keplerianos.
 * Retorna un arreglo de puntos [x, y, z] relativos al centro del planeta.
 *
 * @param state Parámetros orbitales
 * @param _planetRadius Radio de referencia; la geometría no recorta intersecciones con la superficie.
 * @param numPoints Cantidad de segmentos para la órbita (defecto 128)
 */
export function generateOrbitPoints(
  state: OrbitalState,
  _planetRadius: number,
  numPoints: number = 180,
): [number, number, number][] {
  const { semiMajorAxis, eccentricity, inclination, argumentOfPeriapsis } =
    state;
  const points: [number, number, number][] = [];

  const a = semiMajorAxis;
  const e = eccentricity;
  const iRad = (inclination * Math.PI) / 180;
  const omegaRad = (argumentOfPeriapsis * Math.PI) / 180;

  for (let step = 0; step <= numPoints; step++) {
    // Fracción del ciclo orbital
    const angle = (step * 2 * Math.PI) / numPoints;

    // Ecuación de la órbita en coordenadas polares en el plano orbital:
    // r = a * (1 - e^2) / (1 + e * cos(theta))
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));

    // Coordenadas en el plano orbital (Z = 0 en este sistema local de coordenadas)
    const xOrb = r * Math.cos(angle);
    const yOrb = r * Math.sin(angle);
    const zOrb = 0;

    // Rotar según el argumento de periapsis (omega) alrededor del eje Z orbital
    const x1 = xOrb * Math.cos(omegaRad) - yOrb * Math.sin(omegaRad);
    const y1 = xOrb * Math.sin(omegaRad) + yOrb * Math.cos(omegaRad);
    const z1 = zOrb;

    // Rotar según la inclinación (i) alrededor del eje X orbital (inclinamos el plano)
    // El eje X es el nodo ascendente en este modelo simplificado
    const x2 = x1;
    const y2 = y1 * Math.cos(iRad) - z1 * Math.sin(iRad);
    const z2 = y1 * Math.sin(iRad) + z1 * Math.cos(iRad);

    points.push([x2, y2, z2]);
  }

  return points;
}

/**
 * Calcula la transferencia de Hohmann entre dos órbitas circulares concéntricas y coplanares:
 * r1: Radio inicial (km)
 * r2: Radio final (km)
 * mu: Parámetro gravitacional (km^3 / s^2)
 */
export interface HohmannResult {
  r1: number;
  r2: number;
  v1: number; // Velocidad circular inicial (km/s)
  v2: number; // Velocidad circular final (km/s)
  aTrans: number; // Semieje mayor de la órbita de transferencia (km)
  vTrans1: number; // Velocidad al inicio del transfer (km/s)
  vTrans2: number; // Velocidad al final del transfer (km/s)
  deltaV1: number; // Primer impulso en periapsis del transfer (km/s)
  deltaV2: number; // Segundo impulso en apoapsis del transfer (km/s)
  totalDeltaV: number; // Suma absoluta de deltaV (km/s)
  transferTime: number; // Tiempo de viaje en segundos
}

export function calculateHohmannTransfer(
  r1: number,
  r2: number,
  mu: number,
): HohmannResult {
  const v1 = Math.sqrt(mu / r1);
  const v2 = Math.sqrt(mu / r2);

  // Semieje de la elipse de transferencia
  const aTrans = (r1 + r2) / 2;

  // Velocidades en la elipse de transferencia
  const vTrans1 = Math.sqrt(mu * (2 / r1 - 1 / aTrans));
  const vTrans2 = Math.sqrt(mu * (2 / r2 - 1 / aTrans));

  // Impulsos requeridos
  const deltaV1 = vTrans1 - v1;
  const deltaV2 = v2 - vTrans2;
  const totalDeltaV = Math.abs(deltaV1) + Math.abs(deltaV2);

  // El tiempo de transferencia es la mitad del periodo de la órbita de transferencia
  const transferTime = Math.PI * Math.sqrt(Math.pow(aTrans, 3) / mu);

  return {
    r1,
    r2,
    v1,
    v2,
    aTrans,
    vTrans1,
    vTrans2,
    deltaV1,
    deltaV2,
    totalDeltaV,
    transferTime,
  };
}

/**
 * Formatea el tiempo en segundos a un string amigable (horas, minutos, días)
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  const days = hours / 24;
  return `${days.toFixed(2)} días`;
}
