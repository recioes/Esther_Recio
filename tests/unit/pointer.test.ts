import { describe, expect, it } from 'vitest';
import { pointerOffset, tiltAngles } from '../../src/lib/pointer';

const rect = { left: 100, top: 50, width: 200, height: 100 };

describe('pointerOffset', () => {
  it('calcula a posição relativa ao card', () => {
    expect(pointerOffset(150, 80, rect)).toEqual({ x: 50, y: 30 });
  });
});

describe('tiltAngles', () => {
  it('não inclina no centro do card', () => {
    expect(tiltAngles({ x: 100, y: 50 }, rect, 5)).toEqual({ rx: 0, ry: 0 });
  });

  it('inclina no máximo nos cantos', () => {
    expect(tiltAngles({ x: 0, y: 0 }, rect, 5)).toEqual({ rx: 5, ry: -5 });
    expect(tiltAngles({ x: 200, y: 100 }, rect, 5)).toEqual({ rx: -5, ry: 5 });
  });

  it('limita valores fora do card', () => {
    expect(tiltAngles({ x: 9999, y: -9999 }, rect, 5)).toEqual({ rx: 5, ry: 5 });
  });

  it('retorna zero para retângulo sem tamanho', () => {
    expect(tiltAngles({ x: 1, y: 1 }, { left: 0, top: 0, width: 0, height: 0 }, 5)).toEqual({
      rx: 0,
      ry: 0,
    });
  });
});
