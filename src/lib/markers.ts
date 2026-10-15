export type MarkerId = 'brasilia' | 'santander';

export interface GlobeMarker {
  readonly id: MarkerId;
  readonly lat: number;
  readonly lon: number;
}

export const GLOBE_MARKERS: readonly GlobeMarker[] = [
  { id: 'brasilia', lat: -15.7939, lon: -47.8828 },
  { id: 'santander', lat: 43.4623, lon: -3.81 },
];

/**
 * Um ponto da superfície só aparece se estiver virado para a câmera. Com o globo (raio 1) na origem
 * e a câmera em z = `distance`, a normal do ponto precisa ter z > 1 / distance (o horizonte).
 */
export function isFacingCamera(normalZ: number, distance: number, margin = 0.03): boolean {
  return distance > 0 && normalZ > 1 / distance + margin;
}

/** Marcador mais próximo do ponteiro dentro de `radius` px, ignorando os que estão atrás do globo. */
export function pickNearest<T extends { x: number; y: number; visible: boolean }>(
  candidates: readonly T[],
  pointerX: number,
  pointerY: number,
  radius: number,
): T | undefined {
  let best: T | undefined;
  let bestDistance = radius;
  for (const candidate of candidates) {
    if (!candidate.visible) continue;
    const distance = Math.hypot(candidate.x - pointerX, candidate.y - pointerY);
    if (distance <= bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}
