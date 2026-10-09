export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface Offset {
  readonly x: number;
  readonly y: number;
}

export interface Tilt {
  readonly rx: number;
  readonly ry: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// "+ 0" converte -0 em 0 para manter a saída previsível.
const round2 = (value: number): number => Math.round(value * 100) / 100 + 0;

export function pointerOffset(clientX: number, clientY: number, rect: Rect): Offset {
  return { x: clientX - rect.left, y: clientY - rect.top };
}

/** Converte a posição do ponteiro dentro do card em ângulos de inclinação (graus). */
export function tiltAngles(offset: Offset, rect: Rect, maxDegrees: number): Tilt {
  if (rect.width <= 0 || rect.height <= 0) return { rx: 0, ry: 0 };

  const nx = clamp((offset.x / rect.width) * 2 - 1, -1, 1);
  const ny = clamp((offset.y / rect.height) * 2 - 1, -1, 1);

  return { rx: round2(-ny * maxDegrees), ry: round2(nx * maxDegrees) };
}
