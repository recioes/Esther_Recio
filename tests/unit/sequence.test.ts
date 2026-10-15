import { describe, expect, it } from 'vitest';
import {
  createSequenceMatcher,
  KONAMI_SEQUENCE,
  keyToToken,
  toWordSequence,
} from '../../src/lib/sequence';

const feedAll = (matcher: ReturnType<typeof createSequenceMatcher>, tokens: readonly string[]) =>
  tokens.map((token) => matcher.feed(token));

describe('createSequenceMatcher', () => {
  const sequences = {
    konami: KONAMI_SEQUENCE,
    rocket: toWordSequence('foguete'),
    moon: toWordSequence('lua'),
  };

  it('reconhece o código Konami completo', () => {
    const matcher = createSequenceMatcher(sequences);
    const results = feedAll(matcher, KONAMI_SEQUENCE);
    expect(results.at(-1)).toBe('konami');
    expect(results.slice(0, -1).every((result) => result === undefined)).toBe(true);
  });

  it('reconhece palavras no meio de outras teclas', () => {
    const matcher = createSequenceMatcher(sequences);
    const typed = [...'xxfogueteyy'];
    expect(feedAll(matcher, typed).filter(Boolean)).toEqual(['rocket']);
  });

  it('não reconhece sequência incompleta ou fora de ordem', () => {
    const matcher = createSequenceMatcher(sequences);
    expect(feedAll(matcher, [...'fogute']).filter(Boolean)).toEqual([]);
    expect(feedAll(matcher, [...'aul']).filter(Boolean)).toEqual([]);
  });

  it('um erro no meio da sequência Konami impede o disparo', () => {
    const matcher = createSequenceMatcher(sequences);
    const broken = [...KONAMI_SEQUENCE];
    broken[4] = 'right';
    expect(feedAll(matcher, broken).filter(Boolean)).toEqual([]);
  });

  it('limpa o buffer depois de um acerto (não dispara duas vezes seguidas)', () => {
    const matcher = createSequenceMatcher(sequences);
    expect(feedAll(matcher, [...'lua']).filter(Boolean)).toEqual(['moon']);
    expect(feedAll(matcher, [...'lua']).filter(Boolean)).toEqual(['moon']);
    expect(feedAll(matcher, [...'lu']).filter(Boolean)).toEqual([]);
  });

  it('reset descarta o que foi digitado', () => {
    const matcher = createSequenceMatcher(sequences);
    feedAll(matcher, [...'lu']);
    matcher.reset();
    expect(matcher.feed('a')).toBeUndefined();
  });

  it('prefere a sequência mais longa quando duas terminam juntas', () => {
    const matcher = createSequenceMatcher({ short: ['b', 'a'], long: ['u', 'b', 'a'] });
    expect(feedAll(matcher, ['u', 'b', 'a']).at(-1)).toBe('long');
  });

  it('aceita um conjunto vazio sem quebrar', () => {
    const matcher = createSequenceMatcher({});
    expect(matcher.feed('a')).toBeUndefined();
  });
});

describe('keyToToken', () => {
  it('converte setas e letras em tokens', () => {
    expect(keyToToken('ArrowUp')).toBe('up');
    expect(keyToToken('ArrowLeft')).toBe('left');
    expect(keyToToken('B')).toBe('b');
    expect(keyToToken('7')).toBe('7');
  });

  it('ignora teclas que não fazem parte de sequências', () => {
    for (const key of ['Shift', 'Tab', 'Enter', ' ', 'Escape', 'F5', 'Dead']) {
      expect(keyToToken(key)).toBeUndefined();
    }
  });
});
