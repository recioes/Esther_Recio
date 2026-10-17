import { describe, expect, it } from 'vitest';
import { CV, CV_CONTACT } from '../../src/data/cv';
import { CV_VARIANTS } from '../../src/data/cv-variants';
import { dictionaries } from '../../src/i18n';

const locales = Object.keys(CV) as (keyof typeof CV)[];

describe('currículo', () => {
  it('há um por idioma do site, com arquivo próprio', () => {
    expect(locales.sort()).toEqual(Object.keys(dictionaries).sort());
    expect(new Set(locales.map((locale) => CV[locale].fileName)).size).toBe(locales.length);
  });

  it('os nomes dos PDFs seguem o padrão que scripts/verify-dist.mjs confere no build', () => {
    for (const locale of locales) {
      expect(CV[locale].fileName).toBe(`Esther-Recio-CV-${locale}.pdf`);
    }
  });

  it('cada idioma tem as mesmas experiências, na mesma ordem, e o mesmo número de pontos', () => {
    const [base, ...others] = locales.map((locale) => CV[locale]);
    for (const cv of others) {
      expect(cv.experience.map((role) => role.org)).toEqual(base?.experience.map((r) => r.org));
      expect(cv.experience.map((role) => role.bullets.length)).toEqual(
        base?.experience.map((role) => role.bullets.length),
      );
    }
  });

  it('números-chave aparecem iguais em todos os idiomas', () => {
    for (const locale of locales) {
      const text = JSON.stringify(CV[locale]);
      for (const fact of ['570', '100 mil', '~12', 'SS', 'Zenvia', 'ClearSale', 'Kafka']) {
        if (fact === '100 mil' && locale === 'en') continue;
        expect(text, `${locale}: ${fact}`).toContain(fact === '100 mil' ? '100' : fact);
      }
    }
  });

  it('só o currículo em espanhol traz nacionalidade e a vida na Espanha', () => {
    const es = JSON.stringify(CV.es.additional);
    expect(es).toContain('Doble nacionalidad');
    expect(es).toContain('Colegio Calasanz de Villacarriedo');
    expect(es).toMatch(/seis años|6 años/i);
    expect(CV['pt-BR'].additional).toBeUndefined();
    expect(CV.en.additional).toBeUndefined();
  });

  it('usa só links https', () => {
    for (const link of CV_CONTACT.links) expect(link.href).toMatch(/^https:\/\//);
  });

  it('todo dicionário tem os textos do cartão de download', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(dict.resume.label.length).toBeGreaterThan(0);
      expect(dict.resume.description.length).toBeGreaterThan(0);
      expect(dict.resume.downloadHint.length).toBeGreaterThan(0);
    }
  });
});

describe('variantes por vaga', () => {
  const permutation = (order: readonly number[], size: number): boolean =>
    order.length === size && [...order].sort().join() === [...Array(size).keys()].join();

  it('cobrem os três idiomas e só reordenam (sem perder nem repetir itens)', () => {
    expect(CV_VARIANTS.length).toBeGreaterThan(0);
    expect(new Set(CV_VARIANTS.map((variant) => variant.id)).size).toBe(CV_VARIANTS.length);
    for (const variant of CV_VARIANTS) {
      for (const locale of locales) {
        expect(variant.headline[locale].length, `${variant.id}/${locale}`).toBeGreaterThan(0);
        expect(variant.summary[locale].length, `${variant.id}/${locale}`).toBeGreaterThan(0);
        expect(permutation(variant.skillOrder, CV[locale].skills.length)).toBe(true);
        expect(
          permutation(variant.currentRoleOrder, CV[locale].experience[0]?.bullets.length ?? 0),
        ).toBe(true);
      }
    }
  });
});
