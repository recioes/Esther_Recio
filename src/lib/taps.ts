/** Conta toques/cliques seguidos: o contador zera quando a pausa entre dois passa de `windowMs`. */
export interface TapCounter {
  record(nowMs: number): number;
  reset(): void;
}

export function createTapCounter(windowMs: number): TapCounter {
  let count = 0;
  let last = Number.NEGATIVE_INFINITY;
  return {
    record(nowMs) {
      count = nowMs - last > windowMs ? 1 : count + 1;
      last = nowMs;
      return count;
    },
    reset() {
      count = 0;
      last = Number.NEGATIVE_INFINITY;
    },
  };
}
