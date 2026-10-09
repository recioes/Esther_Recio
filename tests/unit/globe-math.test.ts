import { describe, expect, it } from 'vitest';
import {
  applyDrag,
  cameraDistance,
  clamp,
  decayVelocity,
  dragRadiansPerPixel,
  latLonToVector,
  pickTextureSet,
  viewRotation,
} from '../../src/lib/globe-math';

describe('latLonToVector', () => {
  it('segue a convenção de UV do three.js', () => {
    const [x0, y0, z0] = latLonToVector(0, 0);
    expect([x0, y0, z0]).toEqual([1, 0, -0]);
    const [x1, y1, z1] = latLonToVector(0, 90);
    expect(x1).toBeCloseTo(0);
    expect(y1).toBeCloseTo(0);
    expect(z1).toBeCloseTo(-1);
    const [x2, y2, z2] = latLonToVector(0, -90);
    expect(x2).toBeCloseTo(0);
    expect(y2).toBeCloseTo(0);
    expect(z2).toBeCloseTo(1);
    const [, yNorth] = latLonToVector(90, 0);
    expect(yNorth).toBeCloseTo(1);
  });

  it('retorna vetores unitários', () => {
    const [x, y, z] = latLonToVector(-23.5, -46.6);
    expect(Math.hypot(x, y, z)).toBeCloseTo(1);
  });
});

describe('viewRotation', () => {
  it('leva o ponto escolhido para o centro (+Z)', () => {
    const lat = -12;
    const lon = -50;
    const { x: rx, y: ry } = viewRotation(lat, lon);
    const [vx, vy, vz] = latLonToVector(lat, lon);

    // Euler XYZ: primeiro gira em Y, depois em X.
    const x1 = vx * Math.cos(ry) + vz * Math.sin(ry);
    const z1 = -vx * Math.sin(ry) + vz * Math.cos(ry);
    const y2 = vy * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = vy * Math.sin(rx) + z1 * Math.cos(rx);

    expect(x1).toBeCloseTo(0);
    expect(y2).toBeCloseTo(0);
    expect(z2).toBeCloseTo(1);
  });
});

describe('applyDrag', () => {
  it('arrastar para a direita aumenta a rotação em Y', () => {
    expect(applyDrag({ x: 0, y: 0 }, 100, 0, 0.01, 1).y).toBeCloseTo(1);
  });

  it('limita a inclinação', () => {
    expect(applyDrag({ x: 0.9, y: 0 }, 0, 1000, 0.01, 1.1).x).toBe(1.1);
    expect(applyDrag({ x: -0.9, y: 0 }, 0, -1000, 0.01, 1.1).x).toBe(-1.1);
  });
});

describe('dragRadiansPerPixel', () => {
  it('é inversamente proporcional ao tamanho do globo', () => {
    expect(dragRadiansPerPixel(1000, 1000, 0.5)).toBeCloseTo(0.004);
  });

  it('retorna zero sem área', () => {
    expect(dragRadiansPerPixel(0, 0)).toBe(0);
  });
});

describe('cameraDistance', () => {
  it('faz o globo ocupar a fração pedida do menor lado (paisagem e retrato)', () => {
    const fov = 38;
    const tan = Math.tan((fov * Math.PI) / 360);
    for (const [width, height] of [
      [1920, 1080],
      [390, 844],
    ] as const) {
      const distance = cameraDistance(width, height, fov, 0.85);
      const diameterPixels = height / (distance * tan);
      expect(diameterPixels).toBeCloseTo(0.85 * Math.min(width, height));
    }
  });

  it('usa um valor seguro para tamanho zero', () => {
    expect(cameraDistance(0, 0, 38)).toBe(3);
  });
});

describe('decayVelocity', () => {
  it('cai pela metade a cada meia-vida', () => {
    expect(decayVelocity(4, 0.5, 0.5)).toBeCloseTo(2);
    expect(decayVelocity(4, 1, 0.5)).toBeCloseTo(1);
  });
});

describe('pickTextureSet', () => {
  it('usa 2k em telas pequenas e 4k quando o globo passa de 1024 px', () => {
    expect(pickTextureSet(900, 1, false)).toBe('2k');
    expect(pickTextureSet(1080, 2, false)).toBe('4k');
  });

  it('economiza dados com saveData', () => {
    expect(pickTextureSet(1440, 2, true)).toBe('2k');
  });
});

describe('clamp', () => {
  it('limita ao intervalo', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});
