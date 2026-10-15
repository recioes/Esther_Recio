import { latLonToVector, type Vec3 } from './globe-math';

const MS_PER_DAY = 86_400_000;
const AXIAL_TILT_DEGREES = 23.44;

export interface GeoPoint {
  readonly lat: number;
  readonly lon: number;
}

/** Normaliza longitude para o intervalo (-180, 180]. */
export function wrapLongitude(lon: number): number {
  const wrapped = ((((lon + 180) % 360) + 360) % 360) - 180;
  return wrapped === -180 ? 180 : wrapped;
}

/**
 * Ponto da Terra com o Sol a pino naquele instante (aproximação sem equação do tempo,
 * erro de poucos graus: sobra para um enfeite).
 */
export function subsolarPoint(date: Date): GeoPoint {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = (date.getTime() - yearStart) / MS_PER_DAY;
  const lat = -AXIAL_TILT_DEGREES * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return { lat, lon: wrapLongitude((12 - utcHours) * 15) };
}

/** Direção do Sol no referencial da textura (o mesmo de `latLonToVector`). */
export function sunDirectionForDate(date: Date): Vec3 {
  const { lat, lon } = subsolarPoint(date);
  return latLonToVector(lat, lon);
}
