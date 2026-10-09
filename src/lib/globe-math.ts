export type Vec3 = readonly [number, number, number];

export interface Rotation {
  readonly x: number;
  readonly y: number;
}

export type TextureSet = '2k' | '4k';

/** Fração do menor lado da tela ocupada pelo diâmetro do globo. */
export const GLOBE_FILL = 0.85;

const DEG_TO_RAD = Math.PI / 180;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Vetor unitário para latitude/longitude, na convenção de UV da SphereGeometry do three.js
 * com textura equiretangular: lon 0 → +X, leste (+90) → −Z, oeste (−90) → +Z, norte → +Y.
 */
export function latLonToVector(latDeg: number, lonDeg: number): Vec3 {
  const lat = latDeg * DEG_TO_RAD;
  const lon = lonDeg * DEG_TO_RAD;
  return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)];
}

/** Rotação (Euler XYZ, em radianos) que traz lat/lon para o centro da tela, de frente para a câmera (+Z). */
export function viewRotation(latDeg: number, lonDeg: number): Rotation {
  return { x: latDeg * DEG_TO_RAD, y: (-90 - lonDeg) * DEG_TO_RAD };
}

/** Arrastar para a direita/baixo faz a superfície seguir o ponteiro. A inclinação é limitada. */
export function applyDrag(
  rotation: Rotation,
  dxPixels: number,
  dyPixels: number,
  radiansPerPixel: number,
  maxPitch: number,
): Rotation {
  return {
    x: clamp(rotation.x + dyPixels * radiansPerPixel, -maxPitch, maxPitch),
    y: rotation.y + dxPixels * radiansPerPixel,
  };
}

/** No centro do globo, mover 1 raio em pixels equivale a ~1 radiano. */
export function dragRadiansPerPixel(width: number, height: number, fill = GLOBE_FILL): number {
  const diameterPixels = fill * Math.min(width, height);
  return diameterPixels > 0 ? 2 / diameterPixels : 0;
}

/** Distância da câmera para o globo (raio 1) ocupar `fill` do menor lado da tela. */
export function cameraDistance(
  width: number,
  height: number,
  fovDegrees: number,
  fill = GLOBE_FILL,
): number {
  const smallestSide = Math.min(width, height);
  if (smallestSide <= 0) return 3;
  return height / (fill * smallestSide * Math.tan((fovDegrees * DEG_TO_RAD) / 2));
}

/** Decaimento exponencial por meia-vida (inércia do arrasto). */
export function decayVelocity(
  velocity: number,
  dtSeconds: number,
  halfLifeSeconds: number,
): number {
  return velocity * 0.5 ** (dtSeconds / halfLifeSeconds);
}

/**
 * 4k só quando faz diferença: a metade visível do globo mostra ~metade da largura da textura,
 * então 2048 px atendem diâmetros de até 1024 px. `saveData` sempre usa 2k.
 */
export function pickTextureSet(
  viewportMinPixels: number,
  devicePixelRatio: number,
  saveData: boolean,
  fill = GLOBE_FILL,
): TextureSet {
  const diameterPixels = fill * viewportMinPixels * devicePixelRatio;
  return !saveData && diameterPixels > 1024 ? '4k' : '2k';
}
