/**
 * Constelação escondida: cinco estrelas formando um pentágono; ligadas na ordem certa desenham
 * uma estrela de cinco pontas (0 → 2 → 4 → 1 → 3 → 0).
 */
export interface StarPoint {
  readonly x: number;
  readonly y: number;
}

/** Vértices de um pentágono regular em uma caixa 0–100, a partir do topo, em sentido horário. */
export const CONSTELLATION_POINTS: readonly StarPoint[] = [0, 1, 2, 3, 4].map((index) => {
  const angle = (-90 + index * 72) * (Math.PI / 180);
  return { x: 50 + 42 * Math.cos(angle), y: 52 + 42 * Math.sin(angle) };
});

export const CONSTELLATION_ORDER: readonly number[] = [0, 2, 4, 1, 3, 0];

/**
 * Avança o progresso (quantas estrelas já foram ligadas na ordem). Acertar a próxima soma 1;
 * errar volta ao início, mas clicar na primeira já conta como um novo começo.
 */
export function advanceConstellation(progress: number, clicked: number): number {
  if (CONSTELLATION_ORDER[progress] === clicked) return progress + 1;
  return CONSTELLATION_ORDER[0] === clicked ? 1 : 0;
}

export const isConstellationComplete = (progress: number): boolean =>
  progress >= CONSTELLATION_ORDER.length;
