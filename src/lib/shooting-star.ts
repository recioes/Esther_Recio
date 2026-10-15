/** Chance de uma estrela cadente aparecer sozinha em uma visita (1 em 20). */
export const SHOOTING_STAR_CHANCE = 1 / 20;

export function shouldSpawnShootingStar(random: () => number = Math.random): boolean {
  return random() < SHOOTING_STAR_CHANCE;
}

/** Atraso até a estrela aparecer: entre 6 e 20 segundos depois do carregamento. */
export function shootingStarDelayMs(random: () => number = Math.random): number {
  return 6000 + random() * 14000;
}
