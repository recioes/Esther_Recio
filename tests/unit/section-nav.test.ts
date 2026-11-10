import { describe, expect, it } from 'vitest';
import { dictionaries } from '../../src/i18n';

const components = import.meta.glob<string>('../../src/components/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('sumário da página', () => {
  it('cada item aponta para uma seção que existe', () => {
    const nav = components['../../src/components/SectionNav.astro'] ?? '';
    const ids = [...nav.matchAll(/id: '([a-z]+)'/g)].map((match) => match[1]);
    const markup = Object.values(components)
      .filter((source) => source !== nav)
      .join('\n');

    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(markup, id).toContain(`id="${id}"`);
  });

  it('tem rótulo acessível nos três idiomas', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(dict.sectionNavLabel.length, dict.locale).toBeGreaterThan(0);
    }
  });
});
