import type { ActivityEntry, LanguageEntry, Publication } from './types';

/** Idiomas e níveis informados pela Esther. */
export const LANGUAGES: readonly LanguageEntry[] = [
  { id: 'pt', level: 'native' },
  { id: 'es', level: 'native' },
  { id: 'en', level: 'fluent' },
];

/** Atividades voluntárias na UnB. */
export const ACTIVITIES: readonly ActivityEntry[] = [
  { id: 'monitoria', start: '2020-08', end: '2020-12' },
  { id: 'organizingCommittee', start: '2021-09', end: '2021-10' },
];

/** Artigo apresentado no GOOP. Dados bibliográficos conforme informados; sem resultados inventados. */
export const PUBLICATION: Publication = {
  title: 'Evolução da Pesquisa em GSCM: uma Revisão Bibliométrica no Período de 2018 a 2020',
  event: 'Congresso de Gestão de Operações e Projetos em Organizações Públicas (GOOP)',
  date: '2021-05-24',
  authors: [
    'Esther Recio',
    'Naiara de Oliveira Martins',
    'Lucas Lima Moreno',
    'Nathália de Oliveira',
    'Priscila Maria da Silva',
  ],
};
