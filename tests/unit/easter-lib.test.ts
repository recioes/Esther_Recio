import { describe, expect, it } from 'vitest';
import {
  advanceConstellation,
  CONSTELLATION_ORDER,
  CONSTELLATION_POINTS,
  isConstellationComplete,
} from '../../src/lib/constellation';
import { GLOBE_MARKERS, isFacingCamera, pickNearest } from '../../src/lib/markers';
import {
  SHOOTING_STAR_CHANCE,
  shootingStarDelayMs,
  shouldSpawnShootingStar,
} from '../../src/lib/shooting-star';
import { isThemeId, nextTheme, THEME_GLOBE, THEMES, type ThemeId } from '../../src/lib/themes';

describe('constelação', () => {
  it('tem cinco estrelas dentro da caixa 0–100', () => {
    expect(CONSTELLATION_POINTS).toHaveLength(5);
    for (const { x, y } of CONSTELLATION_POINTS) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });

  it('a ordem usa cada estrela e volta à primeira', () => {
    expect(CONSTELLATION_ORDER[0]).toBe(CONSTELLATION_ORDER.at(-1));
    expect(new Set(CONSTELLATION_ORDER).size).toBe(5);
  });

  it('clicar na ordem certa completa a constelação', () => {
    let progress = 0;
    for (const index of CONSTELLATION_ORDER) progress = advanceConstellation(progress, index);
    expect(isConstellationComplete(progress)).toBe(true);
  });

  it('errar reinicia; clicar na primeira estrela já conta como novo começo', () => {
    const first = CONSTELLATION_ORDER[0] ?? 0;
    let progress = advanceConstellation(0, first);
    progress = advanceConstellation(progress, CONSTELLATION_ORDER[1] ?? 0);
    expect(progress).toBe(2);
    expect(advanceConstellation(progress, 99)).toBe(0);
    expect(advanceConstellation(progress, first)).toBe(1);
  });

  it('não está completa no meio do caminho', () => {
    expect(isConstellationComplete(0)).toBe(false);
    expect(isConstellationComplete(CONSTELLATION_ORDER.length - 1)).toBe(false);
  });
});

describe('estrela cadente', () => {
  it('aparece em 1 a cada 20 visitas', () => {
    expect(SHOOTING_STAR_CHANCE).toBe(0.05);
    expect(shouldSpawnShootingStar(() => 0.04)).toBe(true);
    expect(shouldSpawnShootingStar(() => 0.05)).toBe(false);
    expect(shouldSpawnShootingStar(() => 0.9)).toBe(false);
  });

  it('o atraso fica entre 6 e 20 segundos', () => {
    expect(shootingStarDelayMs(() => 0)).toBe(6000);
    expect(shootingStarDelayMs(() => 1)).toBe(20000);
  });
});

describe('temas', () => {
  it('cicla por todos e volta ao início', () => {
    let theme: ThemeId = THEMES[0];
    const visited: ThemeId[] = [theme];
    for (let step = 0; step < THEMES.length; step += 1) {
      theme = nextTheme(theme);
      visited.push(theme);
    }
    expect(visited.at(-1)).toBe(THEMES[0]);
    expect(new Set(visited).size).toBe(THEMES.length);
  });

  it('todos os temas têm cores do globo', () => {
    for (const theme of THEMES) expect(THEME_GLOBE[theme].glow).toBeGreaterThan(0);
  });

  it('valida ids de tema', () => {
    expect(isThemeId('sunset')).toBe(true);
    expect(isThemeId('hacker')).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
  });
});

describe('marcadores do globo', () => {
  it('marca Brasília e Santander com coordenadas plausíveis', () => {
    const byId = Object.fromEntries(GLOBE_MARKERS.map((marker) => [marker.id, marker]));
    expect(byId.brasilia?.lat).toBeCloseTo(-15.8, 0);
    expect(byId.brasilia?.lon).toBeCloseTo(-47.9, 0);
    expect(byId.santander?.lat).toBeCloseTo(43.46, 1);
    expect(byId.santander?.lon).toBeCloseTo(-3.8, 0);
  });

  it('só enxerga pontos virados para a câmera', () => {
    expect(isFacingCamera(1, 3)).toBe(true);
    expect(isFacingCamera(0, 3)).toBe(false);
    expect(isFacingCamera(-0.5, 3)).toBe(false);
    // Perto do horizonte (z = 1/distância) o ponto já está escondido pela curvatura.
    expect(isFacingCamera(1 / 3, 3)).toBe(false);
    expect(isFacingCamera(0.5, 0)).toBe(false);
  });

  it('escolhe o marcador visível mais próximo dentro do raio', () => {
    const candidates = [
      { id: 'a', x: 100, y: 100, visible: true },
      { id: 'b', x: 110, y: 100, visible: true },
      { id: 'c', x: 101, y: 100, visible: false },
    ];
    expect(pickNearest(candidates, 108, 100, 20)?.id).toBe('b');
    expect(pickNearest(candidates, 101, 100, 20)?.id).toBe('a');
    expect(pickNearest(candidates, 300, 300, 20)).toBeUndefined();
    expect(pickNearest([], 0, 0, 20)).toBeUndefined();
  });
});
