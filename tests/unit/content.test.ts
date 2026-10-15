import { describe, expect, it } from 'vitest';
import { TIMELINE } from '../../src/data/timeline';
import { dictionaries } from '../../src/i18n';
import { THEMES } from '../../src/lib/themes';

/** Garante que todo idioma tem todos os textos (a falta de um quebraria a página só em produção). */
describe.each(Object.values(dictionaries))('dicionário $locale', (dict) => {
  it('tem texto para cada item da linha do tempo', () => {
    for (const entry of TIMELINE) {
      const item = dict.timeline.items[entry.id];
      expect(item, entry.id).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.org.length).toBeGreaterThan(0);
      expect(item.period.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
    }
    expect(Object.keys(dict.timeline.items)).toHaveLength(TIMELINE.length);
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
});

describe('linha do tempo', () => {
  it('não repete ids e começa pelo item atual', () => {
    const ids = TIMELINE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TIMELINE[0]?.current).toBe(true);
    expect(TIMELINE.filter((entry) => entry.current)).toHaveLength(1);
  });

  it('inclui as duas faculdades e o estágio na ClearSale', () => {
    const ids = TIMELINE.map((entry) => entry.id);
    expect(ids).toEqual(expect.arrayContaining(['unb', 'uniceub', 'clearsale', 'zenvia']));
  });
});
