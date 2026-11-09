import { describe, expect, it } from 'vitest';
import { buildRoutePath } from '../../src/lib/route';
import tokens from '../../src/styles/tokens.css?raw';

function tokenHex(name: string): string {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`token ausente: ${name}`);
  return match[1];
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

describe('paleta', () => {
  const background = tokenHex('color-bg');

  it.each([
    'color-text',
    'color-text-muted',
    'color-signal-300',
    'color-starlight',
    'color-hydrogen',
    'color-rose',
    'color-ember',
    'color-oxygen',
  ])('%s passa no AA sobre o fundo', (name) => {
    expect(contrast(tokenHex(name), background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['color-accent-700', 'color-signal-600'])('texto branco passa no AA sobre %s', (name) => {
    expect(contrast('#ffffff', tokenHex(name))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('rota da trajetória', () => {
  const points = [
    { x: 10, y: 0 },
    { x: 10, y: 30 },
    { x: 10, y: 90 },
  ];

  it('passa por todas as estações e alterna o lado da curva', () => {
    expect(buildRoutePath(points, 16)).toBe('M 10 0 C 26 10 26 20 10 30 C -6 50 -6 70 10 90');
  });

  it('sem estações não desenha nada', () => {
    expect(buildRoutePath([], 16)).toBe('');
  });
});
