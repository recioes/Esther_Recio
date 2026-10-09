import type { HttpsUrl, ProfileLink } from './types';

export const GITHUB_URL: HttpsUrl = 'https://github.com/recioes';

/** Fonte única dos links. Qualquer destino novo passa pela validação em `lib/links.ts`. */
export const PROFILE_LINKS: readonly ProfileLink[] = [
  {
    id: 'linkedin',
    host: 'www.linkedin.com',
    icon: 'briefcase',
    // Sem ?locale: o app do LinkedIn ignora o parâmetro e abre no idioma do aparelho.
    href: 'https://www.linkedin.com/in/estherrecio/',
  },
  {
    id: 'github',
    host: 'github.com',
    icon: 'code',
    href: GITHUB_URL,
  },
  {
    id: 'lattes',
    host: 'lattes.cnpq.br',
    icon: 'book',
    href: 'https://lattes.cnpq.br/0571310526367628',
  },
];
