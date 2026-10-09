/** Um brilho da explosão de estrelas ao redor do nome. Posições em % da camada; deslocamentos em px. */
export interface Sparkle {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly dx: number;
  readonly dy: number;
  readonly rotate: number;
  readonly delay: number;
  readonly duration: number;
  /** Índice na paleta de cores (ver SPARKLE_TONES no CSS). */
  readonly tone: number;
}

export const SPARKLE_TONE_COUNT = 4;

const between = (random: () => number, min: number, max: number): number =>
  min + random() * (max - min);

/**
 * Distribui os brilhos numa elipse em volta do nome, cada um voando para fora.
 * `random` é injetável para os testes serem determinísticos.
 */
export function createBurst(count: number, random: () => number = Math.random): Sparkle[] {
  return Array.from({ length: count }, (_, index) => {
    // Ângulos espaçados por igual + ruído, para não amontoar brilhos num lado só.
    const angle = ((index + between(random, -0.35, 0.35)) / count) * 2 * Math.PI;
    const radius = between(random, 0.82, 1.05);
    const distance = between(random, 24, 60);
    return {
      x: 50 + Math.cos(angle) * 46 * radius,
      y: 50 + Math.sin(angle) * 42 * radius,
      size: between(random, 14, 30),
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotate: between(random, -180, 180),
      delay: between(random, 0, 350),
      duration: between(random, 900, 1500),
      tone: Math.floor(random() * SPARKLE_TONE_COUNT) % SPARKLE_TONE_COUNT,
    };
  });
}
