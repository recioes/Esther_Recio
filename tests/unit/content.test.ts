import { describe, expect, it } from 'vitest';
import { ACTIVITIES, LANGUAGES, PUBLICATION } from '../../src/data/academic';
import { TIMELINE } from '../../src/data/timeline';
import { dictionaries } from '../../src/i18n';
import { formatFullDate, formatMonth, formatPeriod } from '../../src/lib/period';
import { THEMES } from '../../src/lib/themes';

const all = Object.values(dictionaries);

/** Garante que todo idioma tem todos os textos (a falta de um quebraria a página só em produção). */
describe.each(all)('dicionário $locale', (dict) => {
  it('tem texto para cada item da linha do tempo', () => {
    for (const entry of TIMELINE) {
      const item = dict.timeline.items[entry.id];
      expect(item, entry.id).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.org.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
    }
    expect(Object.keys(dict.timeline.items)).toHaveLength(TIMELINE.length);
  });

  it('tem idiomas, atividades e publicação', () => {
    for (const language of LANGUAGES) {
      expect(dict.languages.items[language.id].detail.length).toBeGreaterThan(0);
      expect(dict.languages.levels[language.level].length).toBeGreaterThan(0);
    }
    for (const activity of ACTIVITIES) {
      expect(dict.academic.activities[activity.id].points.length).toBeGreaterThan(0);
    }
    expect(dict.academic.publication.role.length).toBeGreaterThan(0);
    expect(dict.about.paragraphs.length).toBeGreaterThan(0);
  });

  it('tem nome para cada tema, saudação para cada período e rótulo para cada ponto do globo', () => {
    for (const theme of THEMES) expect(dict.easter.themes[theme].length).toBeGreaterThan(0);
    for (const greeting of Object.values(dict.easter.greeting)) {
      expect(greeting).toContain('{time}');
    }
    expect(Object.keys(dict.easter.markers).sort()).toEqual(['brasilia', 'santander']);
  });

  it('tem textos de 404 e da imagem de compartilhamento', () => {
    expect(dict.notFound.title.length).toBeGreaterThan(0);
    expect(dict.ogImageAlt.length).toBeGreaterThan(0);
  });

  it('nomeia os três idiomas do seletor', () => {
    expect(Object.keys(dict.languageNames).sort()).toEqual(['en', 'es', 'pt-BR']);
  });
});

describe('consistência entre pt-BR, en e es', () => {
  const [base, ...others] = all;

  it('há exatamente três idiomas, com slugs distintos', () => {
    expect(all.map((dict) => dict.locale).sort()).toEqual(['en', 'es', 'pt-BR']);
    expect(new Set(all.map((dict) => dict.slug)).size).toBe(3);
  });

  it('cada item da linha do tempo tem o mesmo número de pontos e o mesmo destaque (ou nenhum)', () => {
    for (const entry of TIMELINE) {
      const reference = base?.timeline.items[entry.id];
      for (const dict of others) {
        const item = dict.timeline.items[entry.id];
        expect(item.points?.length ?? 0, `${dict.locale}/${entry.id}`).toBe(
          reference?.points?.length ?? 0,
        );
        expect(Boolean(item.highlight), `${dict.locale}/${entry.id}`).toBe(
          Boolean(reference?.highlight),
        );
      }
    }
  });

  it('números-chave aparecem iguais nos três idiomas', () => {
    const facts: readonly [string, (dict: (typeof all)[number]) => string][] = [
      ['570', (dict) => dict.timeline.items.zenvia.points?.join(' ') ?? ''],
      ['100', (dict) => dict.timeline.items.afinidade.points?.join(' ') ?? ''],
      ['40', (dict) => dict.timeline.items.clearsale.highlight ?? ''],
      ['12', (dict) => dict.timeline.items.clearsale.highlight ?? ''],
      ['17', (dict) => dict.timeline.items.unb.highlight ?? ''],
      ['17', (dict) => dict.timeline.items.interpreter.highlight ?? ''],
      ['SS', (dict) => dict.timeline.items.unb.points?.join(' ') ?? ''],
      ['SS', (dict) => dict.timeline.items.uniceub.points?.join(' ') ?? ''],
      ['2017', (dict) => dict.timeline.items.interpreter.summary],
      ['2019', (dict) => dict.timeline.items.interpreter.summary],
    ];
    for (const [needle, pick] of facts) {
      for (const dict of all) expect(pick(dict), `${dict.locale}: ${needle}`).toContain(needle);
    }
  });

  it('cita as mesmas organizações nos três idiomas', () => {
    for (const org of [
      'Zenvia',
      'ClearSale',
      'UniCEUB',
      'Firz Consultoria',
      'Núcleo de Integração Social',
    ]) {
      for (const dict of all) {
        const orgs = Object.values(dict.timeline.items).map((item) => item.org);
        expect(
          orgs.some((name) => name.includes(org)),
          `${dict.locale}: ${org}`,
        ).toBe(true);
      }
    }
  });
});

describe('linha do tempo', () => {
  it('não repete ids, começa pelo item atual e está em ordem de início decrescente', () => {
    const ids = TIMELINE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TIMELINE[0]?.current).toBe(true);
    expect(TIMELINE.filter((entry) => entry.current)).toHaveLength(1);
    const starts = TIMELINE.map((entry) => entry.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it('inclui as duas faculdades e as experiências Firz e NIS', () => {
    const ids = TIMELINE.map((entry) => entry.id);
    expect(ids).toEqual(
      expect.arrayContaining(['unb', 'uniceub', 'clearsale', 'zenvia', 'firz', 'nis']),
    );
  });

  it('nenhum período termina antes de começar', () => {
    for (const entry of TIMELINE) {
      if (entry.end) expect(entry.end >= entry.start, entry.id).toBe(true);
    }
  });
});

describe('dados acadêmicos', () => {
  it('a autora principal é a primeira e os coautores estão completos', () => {
    expect(PUBLICATION.authors).toEqual([
      'Esther Recio',
      'Naiara de Oliveira Martins',
      'Lucas Lima Moreno',
      'Nathália de Oliveira',
      'Priscila Maria da Silva',
    ]);
    expect(PUBLICATION.date).toBe('2021-05-24');
    expect(PUBLICATION.title).toBe(
      'Evolução da Pesquisa em GSCM: uma Revisão Bibliométrica no Período de 2018 a 2020',
    );
  });

  it('monitoria (ago–dez 2020) e comissão (set–out 2021)', () => {
    expect(ACTIVITIES).toEqual([
      { id: 'monitoria', start: '2020-08', end: '2020-12' },
      { id: 'organizingCommittee', start: '2021-09', end: '2021-10' },
    ]);
  });

  it('idiomas: português e espanhol nativos, inglês fluente', () => {
    expect(LANGUAGES).toEqual([
      { id: 'pt', level: 'native' },
      { id: 'es', level: 'native' },
      { id: 'en', level: 'fluent' },
    ]);
  });
});

describe('formatação de períodos', () => {
  it('usa o mês abreviado do idioma, sem ponto', () => {
    expect(formatMonth('2024-06', 'pt-BR')).toBe('jun 2024');
    expect(formatMonth('2024-06', 'en')).toBe('Jun 2024');
    expect(formatMonth('2024-06', 'es')).toBe('jun 2024');
  });

  it('formata intervalos fechados e em andamento', () => {
    expect(formatPeriod('2023-08', '2024-06', 'en', 'present')).toBe('Aug 2023 — Jun 2024');
    expect(formatPeriod('2024-06', undefined, 'pt-BR', 'atual')).toBe('jun 2024 — atual');
    expect(formatPeriod('2024-06', undefined, 'es', 'actualidad')).toBe('jun 2024 — actualidad');
  });

  it('todos os idiomas mostram o mesmo ano de início e de fim em cada item', () => {
    for (const entry of TIMELINE) {
      for (const dict of all) {
        const text = formatPeriod(entry.start, entry.end, dict.htmlLang, dict.timeline.present);
        expect(text, `${dict.locale}/${entry.id}`).toContain(entry.start.slice(0, 4));
        if (entry.end) expect(text).toContain(entry.end.slice(0, 4));
      }
    }
  });

  it('formata a data da publicação por idioma', () => {
    expect(formatFullDate('2021-05-24', 'en')).toBe('May 24, 2021');
    expect(formatFullDate('2021-05-24', 'pt-BR')).toBe('24 de maio de 2021');
    expect(formatFullDate('2021-05-24', 'es')).toBe('24 de mayo de 2021');
  });
});
