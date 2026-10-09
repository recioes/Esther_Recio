import type { Locale } from '../data/types';
import { en } from './en';
import { ptBR } from './pt-BR';
import type { Dictionary } from './types';

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export const dictionaries: Readonly<Record<Locale, Dictionary>> = {
  'pt-BR': ptBR,
  en,
};

/** Caminho da página relativo à base do site ('' = raiz, 'en/' = versão em inglês). */
export function pagePath(dict: Dictionary): string {
  return dict.slug === '' ? '' : `${dict.slug}/`;
}
