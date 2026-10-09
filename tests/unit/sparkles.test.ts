import { describe, expect, it } from 'vitest';
import { createBurst, SPARKLE_TONE_COUNT } from '../../src/lib/sparkles';

/** Gerador pseudoaleatório determinístico (mulberry32). */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('createBurst', () => {
  it('gera a quantidade pedida', () => {
    expect(createBurst(14, seeded(1))).toHaveLength(14);
    expect(createBurst(0, seeded(1))).toEqual([]);
  });

  it('é determinística com o mesmo gerador', () => {
    expect(createBurst(8, seeded(42))).toEqual(createBurst(8, seeded(42)));
  });

  it('mantém posições, tamanhos e tempos dentro dos limites', () => {
    for (const sparkle of createBurst(200, seeded(7))) {
      expect(sparkle.x).toBeGreaterThanOrEqual(0);
      expect(sparkle.x).toBeLessThanOrEqual(100);
      expect(sparkle.y).toBeGreaterThanOrEqual(0);
      expect(sparkle.y).toBeLessThanOrEqual(100);
      expect(sparkle.size).toBeGreaterThanOrEqual(14);
      expect(sparkle.size).toBeLessThanOrEqual(30);
      expect(sparkle.delay).toBeGreaterThanOrEqual(0);
      expect(sparkle.delay).toBeLessThanOrEqual(350);
      expect(sparkle.duration).toBeGreaterThanOrEqual(900);
      expect(sparkle.duration).toBeLessThanOrEqual(1500);
      expect(Number.isInteger(sparkle.tone)).toBe(true);
      expect(sparkle.tone).toBeGreaterThanOrEqual(0);
      expect(sparkle.tone).toBeLessThan(SPARKLE_TONE_COUNT);
    }
  });

  it('faz cada brilho voar para fora do centro', () => {
    for (const sparkle of createBurst(50, seeded(3))) {
      const outwardX = (sparkle.x - 50) * sparkle.dx;
      const outwardY = (sparkle.y - 50) * sparkle.dy;
      expect(outwardX + outwardY).toBeGreaterThan(0);
    }
  });

  it('não lança erro quando random retorna o extremo 1', () => {
    const burst = createBurst(4, () => 0.999999);
    expect(burst.every((sparkle) => sparkle.tone < SPARKLE_TONE_COUNT)).toBe(true);
  });
});
