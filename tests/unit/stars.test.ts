import { describe, expect, it } from 'vitest';
import { createRng, starPositions } from '../../src/lib/stars';

describe('createRng', () => {
  it('é determinístico para a mesma semente', () => {
    const first = createRng(42);
    const second = createRng(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('gera valores em [0, 1)', () => {
    const rng = createRng(7);
    for (let index = 0; index < 1000; index++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('starPositions', () => {
  it('gera `count` pontos dentro da casca esférica', () => {
    const positions = starPositions(500, createRng(1), 40, 60);
    expect(positions).toHaveLength(1500);
    for (let index = 0; index < positions.length; index += 3) {
      const radius = Math.hypot(
        positions[index] ?? 0,
        positions[index + 1] ?? 0,
        positions[index + 2] ?? 0,
      );
      expect(radius).toBeGreaterThanOrEqual(39.999);
      expect(radius).toBeLessThanOrEqual(60.001);
    }
  });
});
