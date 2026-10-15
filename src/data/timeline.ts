import type { TimelineEntry } from './types';

/**
 * Trajetória, do mais recente ao mais antigo (os textos ficam em src/i18n/*).
 * Fonte: LinkedIn (linkedin.com/in/estherrecio).
 */
export const TIMELINE: readonly TimelineEntry[] = [
  {
    id: 'zenvia',
    kind: 'work',
    current: true,
    tags: ['C#', '.NET', 'Kafka', 'AWS', 'Redis', 'Grafana', 'k6'],
  },
  {
    id: 'clearsale',
    kind: 'work',
    tags: ['C#', 'xUnit', 'Vue.js', 'Azure DevOps', 'MongoDB'],
  },
  { id: 'uniceub', kind: 'education' },
  { id: 'americanas', kind: 'work' },
  { id: 'afinidade', kind: 'work' },
  { id: 'interpreter', kind: 'work' },
  { id: 'unb', kind: 'education' },
];
