import type { HttpsUrl, ProfileLink } from './types';

export const GITHUB_URL: HttpsUrl = 'https://github.com/recioes';

/** Fonte única dos links. Qualquer destino novo passa pela validação em `lib/links.ts`. */
export const PROFILE_LINKS: readonly ProfileLink[] = [
  {
    id: 'linkedin',
    host: 'www.linkedin.com',
    icon: 'briefcase',
    targets: [
      { locale: 'pt-BR', href: 'https://www.linkedin.com/in/estherrecio/?locale=pt-BR' },
      { locale: 'en', href: 'https://www.linkedin.com/in/estherrecio/?locale=en-US' },
    ],
  },
  {
    id: 'github',
    host: 'github.com',
    icon: 'code',
    targets: [{ href: GITHUB_URL }],
  },
  {
    id: 'lattes',
    host: 'lattes.cnpq.br',
    icon: 'book',
    targets: [{ href: 'https://lattes.cnpq.br/0571310526367628' }],
  },
];
