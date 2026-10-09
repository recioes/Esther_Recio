import { describe, expect, it } from 'vitest';
import { PROFILE_LINKS } from '../../src/data/links';
import type { AllowedHost, ProfileLink } from '../../src/data/types';
import { assertValidLinks, validateLinks } from '../../src/lib/links';

function makeLink(href: string, host: AllowedHost = 'github.com'): ProfileLink {
  return {
    id: 'github',
    host,
    icon: 'code',
    href: href as ProfileLink['href'],
  };
}

describe('validateLinks', () => {
  it('aceita os links reais do perfil', () => {
    expect(validateLinks(PROFILE_LINKS)).toEqual([]);
    expect(() => assertValidLinks(PROFILE_LINKS)).not.toThrow();
  });

  it('rejeita protocolo http', () => {
    expect(validateLinks([makeLink('http://github.com/recioes')])).toHaveLength(1);
  });

  it('rejeita host fora da allowlist', () => {
    expect(validateLinks([makeLink('https://evil.example/recioes')])).toHaveLength(1);
  });

  it('rejeita domínio que apenas contém o host permitido', () => {
    expect(validateLinks([makeLink('https://github.com.evil.example/recioes')])).toHaveLength(1);
  });

  it('rejeita URL malformada', () => {
    expect(validateLinks([makeLink('https://')])).toHaveLength(1);
  });

  it('assertValidLinks lança erro descritivo', () => {
    expect(() => assertValidLinks([makeLink('http://github.com/x')])).toThrow(/Links inválidos/);
  });
});

describe('PROFILE_LINKS', () => {
  it('aponta o LinkedIn para a URL padrão, sem ?locale (o app ignora o parâmetro)', () => {
    const linkedin = PROFILE_LINKS.find((link) => link.id === 'linkedin');
    expect(linkedin?.href).toBe('https://www.linkedin.com/in/estherrecio/');
  });
});
