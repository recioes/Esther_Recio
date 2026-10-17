/**
 * Física dos fogos de artifício do final da caça aos segredos (sem DOM: testável e determinística
 * com um gerador de números injetado). Unidades: pixels e milissegundos.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Vida restante, de 1 (acabou de nascer) a 0 (some). */
  life: number;
  readonly decay: number;
  readonly color: string;
  readonly size: number;
}

export interface Shell {
  /** Quando a explosão acontece, em ms desde o início do show. */
  readonly atMs: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
}

export interface ShowOptions {
  readonly width: number;
  readonly height: number;
  readonly colors: readonly string[];
  /** Quantas explosões e em quanto tempo. */
  readonly shells: number;
  readonly durationMs: number;
}

const GRAVITY = 0.00018; // px/ms²
const DRAG = 0.0012; // fração da velocidade perdida por ms

/** Programa as explosões espalhadas pela parte de cima da tela, com o centro livre para a mensagem. */
export function planShow(options: ShowOptions, random: () => number = Math.random): Shell[] {
  const { width, height, colors, shells, durationMs } = options;
  return Array.from({ length: shells }, (_, index) => {
    // As três últimas explodem quase juntas: o "grand finale" do show.
    const finale = index >= shells - 3;
    // Alterna lados para não tampar o cartão central, que fica no meio da tela.
    const side = index % 2 === 0 ? 0.08 + random() * 0.3 : 0.62 + random() * 0.3;
    return {
      atMs: finale
        ? durationMs * (0.92 + random() * 0.08)
        : (index / Math.max(1, shells - 1)) * durationMs * (0.8 + random() * 0.12),
      x: side * width,
      y: (0.12 + random() * 0.3) * height,
      color: colors[index % colors.length] ?? '#ffffff',
    };
  });
}

/** Partículas de uma explosão: anel com velocidades levemente irregulares. */
export function burst(shell: Shell, count: number, random: () => number = Math.random): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + random() * 0.2;
    const speed = 0.16 + random() * 0.22;
    return {
      x: shell.x,
      y: shell.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.00055 + random() * 0.00035,
      color: shell.color,
      size: 1.8 + random() * 1.8,
    };
  });
}

/** Avança a simulação `dtMs` e devolve só as partículas ainda vivas. */
export function step(particles: readonly Particle[], dtMs: number): Particle[] {
  const dt = Math.min(dtMs, 50); // aba em segundo plano: evita um salto enorme ao voltar
  const keep = 1 - DRAG * dt;
  const alive: Particle[] = [];
  for (const p of particles) {
    p.vx *= keep;
    p.vy = p.vy * keep + GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= p.decay * dt;
    if (p.life > 0) alive.push(p);
  }
  return alive;
}
