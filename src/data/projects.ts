import type { ProjectEntry } from './types';

/** Projetos em destaque (os textos ficam em src/i18n/*). */
export const PROJECTS: readonly ProjectEntry[] = [
  {
    id: 'jessicaRecio',
    kind: 'live',
    href: 'https://recio.trd.br',
    featured: true,
    tools: [
      'OmO',
      'Claude Opus',
      'Claude Sonnet',
      'GPT Astra',
      'GPT Sol',
      'DeepSeek V4 Flash',
      'DeepSeek V4 Pro',
    ],
    tags: [
      'SvelteKit',
      'TypeScript',
      'GSAP',
      'Lenis',
      'Vitest',
      'Playwright',
      'GitHub Actions',
      'Cloudflare Pages',
    ],
  },
  {
    id: 'ihaircare',
    kind: 'repository',
    href: 'https://github.com/recioes/ihaircare.backend.app',
    tags: ['C#', 'ASP.NET Core', 'MongoDB', 'Swagger', 'SOLID'],
  },
];
