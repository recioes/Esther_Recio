import type { TimelineEntry } from './types';

/**
 * Trajetória, do mais recente ao mais antigo pela data de início (os textos ficam em src/i18n/*).
 * Fonte: LinkedIn (linkedin.com/in/estherrecio) e informações da própria Esther.
 */
export const TIMELINE: readonly TimelineEntry[] = [
  {
    id: 'zenvia',
    kind: 'work',
    start: '2024-06',
    current: true,
    tags: ['C#', '.NET', 'Kafka', 'AWS', 'Redis', 'Grafana', 'k6'],
  },
  {
    id: 'clearsale',
    kind: 'work',
    start: '2023-08',
    end: '2024-06',
    tags: ['C#', 'xUnit', 'Vue.js', 'Azure DevOps', 'MongoDB'],
  },
  { id: 'uniceub', kind: 'education', start: '2023-02', end: '2025-02' },
  { id: 'americanas', kind: 'work', start: '2022-06', end: '2022-11' },
  { id: 'afinidade', kind: 'work', start: '2020-09', end: '2022-06' },
  { id: 'nis', kind: 'work', start: '2019-11', end: '2020-09' },
  { id: 'afinidadeIntern', kind: 'work', start: '2019-01', end: '2019-11' },
  { id: 'firz', kind: 'work', start: '2018-11', end: '2019-01' },
  { id: 'interpreter', kind: 'work', start: '2017-10', end: '2019-10' },
  { id: 'unb', kind: 'education', start: '2017-08', end: '2022-02' },
];
