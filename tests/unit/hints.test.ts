import { describe, expect, it } from 'vitest';
import { dictionaries } from '../../src/i18n';
import {
  boardEntries,
  EGG_IDS,
  type EggId,
  parseEggList,
  pickHint,
  reachableEggs,
  serializeEggs,
} from '../../src/lib/hints';

describe('pickHint', () => {
  it('nunca sorteia um segredo já achado', () => {
    const found = new Set<EggId>(['turbo', 'rain', 'moon']);
    for (let step = 0; step < 50; step += 1) {
      const hint = pickHint(EGG_IDS, found, () => step / 50);
      expect(hint).toBeDefined();
      expect(found.has(hint as EggId)).toBe(false);
    }
  });

  it('o sorteio cobre todos os que faltam', () => {
    const found = new Set<EggId>(EGG_IDS.filter((id) => id !== 'dizzy' && id !== 'theme'));
    expect(pickHint(EGG_IDS, found, () => 0)).toBe('theme');
    expect(pickHint(EGG_IDS, found, () => 0.99)).toBe('dizzy');
  });

  it('devolve undefined quando tudo foi achado', () => {
    expect(pickHint(EGG_IDS, new Set(EGG_IDS))).toBeUndefined();
  });

  it('sem teclado, só sugere o que dá para fazer no toque', () => {
    const touch = reachableEggs(false);
    expect(touch).toEqual(expect.arrayContaining(['turbo', 'theme', 'constellation', 'dizzy']));
    for (const id of ['rain', 'moon', 'name', 'wish', 'trail'] as const) {
      expect(touch).not.toContain(id);
    }
    expect(reachableEggs(true)).toEqual(EGG_IDS);
  });
});

describe('persistência da sessão', () => {
  it('ida e volta, ignorando lixo e repetições, mantendo a ordem', () => {
    expect(parseEggList(serializeEggs(['moon', 'dizzy']))).toEqual(['moon', 'dizzy']);
    expect(parseEggList('moon,hacker,,dizzy,moon')).toEqual(['moon', 'dizzy']);
    expect(parseEggList(null)).toEqual([]);
  });
});

describe('quadro de pistas', () => {
  it('cada achado novo libera uma pista nova, sem repetir nem pegar o que já foi achado', () => {
    const found = new Set<EggId>();
    const clues: EggId[] = [];
    // O visitante acha, uma a uma, as primeiras descobertas: cada uma soma exatamente uma pista.
    for (const egg of ['dizzy', 'theme', 'moon'] as const) {
      found.add(egg);
      const next = pickHint(EGG_IDS, new Set([...found, ...clues]), () => 0);
      expect(next).toBeDefined();
      clues.push(next as EggId);
      expect(clues).toHaveLength(found.size);
    }
    expect(new Set(clues).size).toBe(clues.length);
    for (const clue of clues) expect(found.has(clue)).toBe(false);
  });

  it('quando só sobram segredos já com pista, não há pista nova', () => {
    const found = new Set<EggId>(['turbo']);
    const clues: EggId[] = EGG_IDS.filter((id) => id !== 'turbo');
    expect(pickHint(EGG_IDS, new Set([...found, ...clues]))).toBeUndefined();
  });
});

describe.each(Object.values(dictionaries))('pistas em $locale', (dict) => {
  it('há uma pista, não vazia, para cada segredo, e o texto do quadro', () => {
    for (const id of EGG_IDS) expect(dict.easter.hints[id].length, id).toBeGreaterThan(10);
    expect(dict.easter.boardTitle.length).toBeGreaterThan(0);
    expect(dict.easter.hintsDone.length).toBeGreaterThan(0);
  });

  it('a pista não entrega a resposta de bandeja', () => {
    const answers: readonly (readonly [EggId, RegExp])[] = [
      ['rain', /foguete|rocket|cohete/i],
      ['moon', /\b(lua|moon|luna)\b/i],
      ['wish', /estrela|estrella|wish|deseo/i],
      ['turbo', /konami/i],
    ];
    for (const [id, forbidden] of answers) {
      expect(dict.easter.hints[id], `${dict.locale}/${id}`).not.toMatch(forbidden);
    }
  });
});

describe('boardEntries (o quadro como retrato do progresso)', () => {
  const first = () => 0;

  it('achado fora da ordem das pistas entra no quadro (riscado) e a pista pendente continua', () => {
    // A pista da vez é "wish"; o visitante acha "dizzy", que não tinha pista.
    const found = new Set<EggId>(['moon', 'dizzy']);
    const entries = boardEntries(EGG_IDS, found, ['moon', 'wish'], { random: first });
    expect(entries.slice(0, 3)).toEqual(['moon', 'wish', 'dizzy']);
    expect(entries).toHaveLength(4);
    expect(found.has(entries[3] as EggId)).toBe(false);
  });

  it('todo achado alcançável tem entrada, sem repetição, em qualquer ordem', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const order = [...EGG_IDS].sort(
        (a, b) => ((a.charCodeAt(0) * (seed + 7)) % 13) - ((b.charCodeAt(0) * (seed + 7)) % 13),
      );
      const found = new Set<EggId>();
      let entries: EggId[] = [];
      for (const egg of order) {
        found.add(egg);
        const before = entries.filter((id) => !found.has(id));
        entries = boardEntries(EGG_IDS, found, entries, { random: () => (seed % 10) / 10 });
        for (const id of found) expect(entries).toContain(id);
        expect(new Set(entries).size).toBe(entries.length);
        const pendingNew = entries.filter((id) => !found.has(id) && !before.includes(id));
        const left = EGG_IDS.some((id) => !found.has(id) && !before.includes(id));
        expect(pendingNew.length).toBe(left ? 1 : 0);
      }
      expect(entries.filter((id) => !found.has(id))).toEqual([]);
    }
  });

  it('sem pista nova, só completa um estado salvo antigo', () => {
    const found = new Set<EggId>(['theme', 'turbo']);
    expect(boardEntries(EGG_IDS, found, ['dizzy'], { withNewClue: false })).toEqual([
      'dizzy',
      'turbo',
      'theme',
    ]);
  });

  it('não cria entrada para o que este aparelho não alcança', () => {
    const touch = reachableEggs(false);
    const found = new Set<EggId>(['wish', 'theme']);
    const entries = boardEntries(touch, found, [], { withNewClue: false });
    expect(entries).toEqual(['theme']);
  });
});
