/**
 * Intensidade (1 → 0) de um efeito temporário: começa no máximo e cai suavemente até acabar.
 * Usada no turbo do globo e no balanço de "tonto".
 */
export function boostEnvelope(elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0 || elapsedMs < 0 || elapsedMs >= durationMs) return 0;
  const remaining = 1 - elapsedMs / durationMs;
  return remaining * remaining * (3 - 2 * remaining);
}

/** Cada toque seguido no globo gira mais rápido (1,0 + 1,2 por toque), com teto. */
export function tapBoostMultiplier(tapCount: number, max = 14): number {
  return Math.min(max, 1 + Math.max(0, tapCount) * 1.2);
}
