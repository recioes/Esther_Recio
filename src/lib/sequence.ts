/** Reconhece sequências de teclas (Konami, palavras secretas) olhando o fim de um buffer. */
export interface SequenceMatcher<Id extends string> {
  /** Registra uma tecla; devolve o id da sequência que acabou de ser completada, se houver. */
  feed(token: string): Id | undefined;
  reset(): void;
}

export function createSequenceMatcher<Id extends string>(
  sequences: Readonly<Record<Id, readonly string[]>>,
): SequenceMatcher<Id> {
  const entries = (Object.entries(sequences) as [Id, readonly string[]][]).filter(
    ([, sequence]) => sequence.length > 0,
  );
  const capacity = Math.max(0, ...entries.map(([, sequence]) => sequence.length));
  let buffer: string[] = [];

  return {
    feed(token) {
      buffer.push(token);
      if (buffer.length > capacity) buffer = buffer.slice(buffer.length - capacity);

      let best: [Id, readonly string[]] | undefined;
      for (const entry of entries) {
        const [, sequence] = entry;
        const tail = buffer.slice(buffer.length - sequence.length);
        const matches =
          tail.length === sequence.length &&
          tail.every((value, index) => value === sequence[index]);
        if (matches && (!best || sequence.length > best[1].length)) best = entry;
      }
      if (!best) return undefined;
      buffer = [];
      return best[0];
    },
    reset() {
      buffer = [];
    },
  };
}

const ARROWS: Readonly<Record<string, string>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Converte `KeyboardEvent.key` em token; teclas sem importância (Shift, Tab, espaço) viram undefined. */
export function keyToToken(key: string): string | undefined {
  const arrow = ARROWS[key];
  if (arrow) return arrow;
  return /^[a-z0-9]$/i.test(key) ? key.toLowerCase() : undefined;
}

export const toWordSequence = (word: string): readonly string[] => [...word.toLowerCase()];

export const KONAMI_SEQUENCE: readonly string[] = [
  'up',
  'up',
  'down',
  'down',
  'left',
  'right',
  'left',
  'right',
  'b',
  'a',
];
