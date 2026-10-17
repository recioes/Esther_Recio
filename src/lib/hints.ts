/** Segredos que contam para as pistas: achar um deles pela primeira vez libera a pista de outro. */
export const EGG_IDS = [
  'turbo',
  'rain',
  'moon',
  'name',
  'wish',
  'theme',
  'constellation',
  'dizzy',
  'trail',
] as const;

export type EggId = (typeof EGG_IDS)[number];

/** Só se digita com teclado e só há rastro com mouse: no celular essas pistas seriam impossíveis. */
export const KEYBOARD_EGGS: readonly EggId[] = ['rain', 'moon', 'name', 'wish', 'trail'];

export function isEggId(value: string): value is EggId {
  return (EGG_IDS as readonly string[]).includes(value);
}

/** Segredos que este visitante consegue encontrar neste aparelho. */
export function reachableEggs(canType: boolean): readonly EggId[] {
  return canType ? EGG_IDS : EGG_IDS.filter((id) => !KEYBOARD_EGGS.includes(id));
}

/**
 * Sorteia o segredo da próxima pista entre os alcançáveis que ainda não foram achados nem
 * ganharam pista (`excluded` = achados + os que já têm pista no quadro).
 */
export function pickHint(
  reachable: readonly EggId[],
  excluded: ReadonlySet<EggId>,
  random: () => number = Math.random,
): EggId | undefined {
  const pending = reachable.filter((id) => !excluded.has(id));
  return pending[Math.floor(random() * pending.length)];
}

/**
 * Entradas do quadro depois de um achado. O quadro é o retrato do progresso: todo segredo
 * alcançável já achado tem a sua entrada (riscada), inclusive os achados fora da ordem das
 * pistas, e é sorteada uma pista pendente nova, se ainda houver segredo sem entrada.
 * Sem `withNewClue`, só completa as entradas (para corrigir um estado salvo antigo).
 */
export function boardEntries(
  reachable: readonly EggId[],
  found: ReadonlySet<EggId>,
  current: readonly EggId[],
  {
    withNewClue = true,
    random = Math.random,
  }: { withNewClue?: boolean; random?: () => number } = {},
): EggId[] {
  const entries = [...current];
  for (const id of reachable) {
    if (found.has(id) && !entries.includes(id)) entries.push(id);
  }
  if (!withNewClue) return entries;
  const next = pickHint(reachable, new Set([...found, ...entries]), random);
  return next ? [...entries, next] : entries;
}

/** Lê "a,b,c" guardado na sessão, ignorando o que não é um segredo conhecido e repetições (mantém a ordem). */
export function parseEggList(raw: string | null): EggId[] {
  return [...new Set((raw ?? '').split(',').filter(isEggId))];
}

export function serializeEggs(eggs: Iterable<EggId>): string {
  return [...eggs].join(',');
}
