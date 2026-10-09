import type { LinkId, Locale } from '../data/types';

export interface LinkCopy {
  readonly label: string;
  readonly description: string;
}

export interface Dictionary {
  readonly locale: Locale;
  readonly htmlLang: string;
  /** '' para o idioma padrão (raiz do site); demais idiomas ficam em /<slug>/. */
  readonly slug: string;
  readonly shortName: string;
  readonly title: string;
  readonly description: string;
  readonly role: string;
  readonly linksLabel: string;
  readonly languageSwitchLabel: string;
  readonly languageNames: Readonly<Record<Locale, string>>;
  readonly newTabHint: string;
  readonly globeHint: string;
  readonly links: Readonly<Record<LinkId, LinkCopy>>;
}
