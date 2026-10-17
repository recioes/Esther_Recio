/**
 * Variantes do currículo para vagas com outro foco. Só mudam o título, o resumo e a ordem das
 * competências e dos pontos do cargo atual; nenhum fato novo entra (tudo vem de src/data/cv.ts).
 * Uso: `npm run cv -- --variant=messaging` (os PDFs vão para cv-variants/<id>/, fora do site).
 *
 * Sem imports, como cv.ts: o script de build roda este arquivo direto no Node.
 */

type Locale = 'pt-BR' | 'en' | 'es';

export interface CvVariant {
  readonly id: string;
  readonly headline: Readonly<Record<Locale, string>>;
  readonly summary: Readonly<Record<Locale, string>>;
  /** Nova ordem dos grupos de competências (índices de `CV[locale].skills`). */
  readonly skillOrder: readonly number[];
  /** Nova ordem dos pontos do cargo atual (índices de `CV[locale].experience[0].bullets`). */
  readonly currentRoleOrder: readonly number[];
}

export const CV_VARIANTS: readonly CvVariant[] = [
  {
    id: 'messaging',
    headline: {
      'pt-BR': 'Backend Developer · Kafka · Mensageria · Alto volume',
      en: 'Backend Developer · Kafka · Messaging · High volume',
      es: 'Backend Developer · Kafka · Mensajería · Alto volumen',
    },
    summary: {
      'pt-BR':
        'Desenvolvedora backend na Zenvia, com foco em mensageria e serviços de alto volume em C# e .NET: migração de aplicações do Google Pub/Sub para Apache Kafka (tópicos, consumidores, DLQs), cache distribuído com Redis e serviços para grandes clientes empresariais. Vim do estágio direto para Dev Júnior.',
      en: 'Backend developer at Zenvia, focused on messaging and high-volume services in C# and .NET: migrating applications from Google Pub/Sub to Apache Kafka (topics, consumers, DLQs), distributed caching with Redis and services for large enterprise customers. Moved from internship straight to Junior Dev.',
      es: 'Desarrolladora backend en Zenvia, con foco en mensajería y servicios de alto volumen en C# y .NET: migración de aplicaciones de Google Pub/Sub a Apache Kafka (tópicos, consumidores, DLQs), caché distribuida con Redis y servicios para grandes clientes empresariales. Pasé de las prácticas directamente a Dev Junior.',
    },
    skillOrder: [1, 0, 2, 3],
    currentRoleOrder: [0, 2, 1, 5, 3, 4],
  },
  {
    id: 'platform',
    headline: {
      'pt-BR': 'Backend Developer · Cloud · Observabilidade · Segurança',
      en: 'Backend Developer · Cloud · Observability · Security',
      es: 'Backend Developer · Cloud · Observabilidad · Seguridad',
    },
    summary: {
      'pt-BR':
        'Desenvolvedora backend na Zenvia com foco em confiabilidade: migração de aplicações para a AWS com testes de carga junto ao time de SRE, liderança de uma iniciativa de observabilidade (Grafana, alertas no Slack) e atuação similar a Security Champion (SSRF, OWASP). Vim do estágio direto para Dev Júnior.',
      en: 'Backend developer at Zenvia focused on reliability: migrating applications to AWS with load testing alongside the SRE team, leading an observability initiative (Grafana, Slack alerts) and working in a Security Champion-like role (SSRF, OWASP). Moved from internship straight to Junior Dev.',
      es: 'Desarrolladora backend en Zenvia con foco en fiabilidad: migración de aplicaciones a AWS con pruebas de carga junto al equipo de SRE, liderazgo de una iniciativa de observabilidad (Grafana, alertas en Slack) y función similar a la de Security Champion (SSRF, OWASP). Pasé de las prácticas directamente a Dev Junior.',
    },
    skillOrder: [2, 3, 0, 1],
    currentRoleOrder: [1, 3, 4, 0, 2, 5],
  },
];
