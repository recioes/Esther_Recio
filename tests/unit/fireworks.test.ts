import { describe, expect, it } from 'vitest';
import { burst, planShow, step } from '../../src/lib/fireworks';

const fixed = (value: number) => () => value;
const options = { width: 1000, height: 800, colors: ['#f0f', '#0ff'], shells: 6, durationMs: 4000 };

describe('fogos de artifício', () => {
  it('programa as explosões dentro do tempo e da tela, sem cobrir o centro', () => {
    for (const r of [0, 0.5, 0.999]) {
      const shells = planShow(options, fixed(r));
      expect(shells).toHaveLength(6);
      for (const shell of shells) {
        expect(shell.atMs).toBeGreaterThanOrEqual(0);
        expect(shell.atMs).toBeLessThanOrEqual(options.durationMs);
        expect(shell.y).toBeLessThan(options.height * 0.45);
        // Faixa central (onde fica a mensagem) livre de explosões.
        expect(shell.x < options.width * 0.4 || shell.x > options.width * 0.6).toBe(true);
      }
    }
  });

  it('termina com um bombardeio: as três últimas explosões caem nos 8% finais do show', () => {
    for (const r of [0, 0.5, 0.999]) {
      const finale = planShow(options, fixed(r)).slice(-3);
      for (const shell of finale)
        expect(shell.atMs).toBeGreaterThanOrEqual(options.durationMs * 0.92);
    }
  });

  it('alterna as cores do tema', () => {
    const shells = planShow(options, fixed(0.3));
    expect(shells.map((s) => s.color)).toEqual(['#f0f', '#0ff', '#f0f', '#0ff', '#f0f', '#0ff']);
  });

  it('cada explosão nasce no ponto da explosão com a quantidade pedida', () => {
    const particles = burst({ atMs: 0, x: 10, y: 20, color: '#fff' }, 40, fixed(0.5));
    expect(particles).toHaveLength(40);
    for (const p of particles) {
      expect([p.x, p.y, p.life]).toEqual([10, 20, 1]);
    }
  });

  it('a gravidade puxa para baixo e todas as partículas acabam sumindo', () => {
    let particles = burst({ atMs: 0, x: 0, y: 0, color: '#fff' }, 20, fixed(0.5));
    const startY = particles.map((p) => p.y);
    particles = step(particles, 16);
    expect(particles.length).toBe(20);
    let frames = 0;
    while (particles.length > 0 && frames < 10_000) {
      particles = step(particles, 16);
      frames += 1;
    }
    expect(particles).toEqual([]);
    expect(frames).toBeLessThan(400); // some em menos de ~6,5 s
    expect(startY).toHaveLength(20);
  });

  it('um intervalo enorme (aba em segundo plano) não faz as partículas saltarem', () => {
    const [p] = burst({ atMs: 0, x: 0, y: 0, color: '#fff' }, 1, fixed(0.5));
    if (!p) throw new Error('sem partícula');
    const [moved] = step([{ ...p }], 10_000);
    expect(Math.hypot(moved?.x ?? 0, moved?.y ?? 0)).toBeLessThan(20);
  });
});
