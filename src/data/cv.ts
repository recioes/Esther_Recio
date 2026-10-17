/**
 * Currículo de uma página (A4), um por idioma. É a fonte do PDF: `npm run cv` gera
 * `public/cv/Esther-Recio-CV-<idioma>.pdf` a partir daqui (ver scripts/build-cv.mjs).
 *
 * Fica de propósito sem imports: o script de build roda este arquivo direto no Node.
 * Os fatos vêm da linha do tempo do site (src/data/timeline.ts e src/i18n/*); aqui o texto é
 * mais curto, no formato de currículo (verbo + resultado), e nada é inventado.
 */

export type CvLocale = 'pt-BR' | 'en' | 'es';

export interface CvRole {
  readonly title: string;
  readonly org: string;
  /** Período já formatado para o idioma. */
  readonly period: string;
  /** Destaque curto, em uma linha (opcional). */
  readonly highlight?: string;
  readonly bullets: readonly string[];
}

export interface CvSkillGroup {
  readonly label: string;
  readonly items: string;
}

export interface CvEducation {
  readonly title: string;
  readonly org: string;
  readonly period: string;
  readonly note: string;
}

export interface CvContent {
  readonly htmlLang: string;
  readonly fileName: string;
  readonly headline: string;
  readonly headings: {
    readonly summary: string;
    readonly skills: string;
    readonly experience: string;
    readonly education: string;
    readonly languages: string;
    readonly academic: string;
    readonly additional: string;
    readonly projects: string;
  };
  readonly summary: string;
  readonly skills: readonly CvSkillGroup[];
  readonly experience: readonly CvRole[];
  /** Experiências anteriores, numa linha só. */
  readonly earlier: { readonly label: string; readonly text: string };
  readonly education: readonly CvEducation[];
  readonly languages: string;
  readonly academic: readonly string[];
  /** Projetos pessoais públicos no GitHub, numa linha só. */
  readonly projects: string;
  /** Só no currículo em espanhol (nacionalidade e vivência na Espanha). */
  readonly additional?: readonly string[];
}

export interface CvContactItem {
  readonly label: string;
  /** Sem destino = texto simples (ex.: cidade). */
  readonly href?: string;
}

export const CV_CONTACT: {
  readonly name: string;
  readonly items: readonly CvContactItem[];
  readonly links: readonly CvContactItem[];
} = {
  name: 'Esther Recio',
  /** Primeiro as informações de contato direto; depois os perfis (https, nos domínios já usados no site). */
  items: [
    { label: 'Brasília, DF' },
    { label: 'esther.recio47@gmail.com', href: 'mailto:esther.recio47@gmail.com' },
  ],
  links: [
    { label: 'linkedin.com/in/estherrecio', href: 'https://www.linkedin.com/in/estherrecio/' },
    { label: 'github.com/recioes', href: 'https://github.com/recioes' },
    { label: 'lattes.cnpq.br/0571310526367628', href: 'https://lattes.cnpq.br/0571310526367628' },
  ],
};

export const CV: Readonly<Record<CvLocale, CvContent>> = {
  'pt-BR': {
    htmlLang: 'pt-BR',
    fileName: 'Esther-Recio-CV-pt-BR.pdf',
    headline: 'Backend Developer · C# · .NET · Kafka · AWS',
    headings: {
      summary: 'Resumo',
      skills: 'Competências técnicas',
      experience: 'Experiência profissional',
      education: 'Formação',
      languages: 'Idiomas',
      academic: 'Atividades acadêmicas',
      additional: 'Informações adicionais',
      projects: 'Projeto no GitHub',
    },
    summary:
      'Desenvolvedora backend na Zenvia, construindo serviços de alto volume em C# e .NET (APIs, workers, microsserviços e mensageria). Vim do estágio direto para Dev Júnior. Formada em Administração e em Análise e Desenvolvimento de Sistemas: junto visão de negócio e engenharia, com foco em confiabilidade, observabilidade e segurança.',
    skills: [
      {
        label: 'Linguagens, frameworks e IA',
        items: 'C#, .NET, Claude Code (agentes de IA)',
      },
      { label: 'Mensageria e dados', items: 'Apache Kafka, Google Pub/Sub, Redis, MongoDB' },
      { label: 'Cloud e DevOps', items: 'AWS, Azure DevOps, AKS, pipelines CI/CD em YAML' },
      {
        label: 'Qualidade, observabilidade e segurança',
        items: 'xUnit, SonarQube, k6, Grafana, OWASP',
      },
    ],
    experience: [
      {
        title: 'Backend Developer',
        org: 'Zenvia',
        period: 'jun 2024 – atual',
        highlight: 'Do estágio direto para Dev Júnior',
        bullets: [
          'Migração de várias aplicações do Google Pub/Sub para Apache Kafka: tópicos, consumidores, DLQs e validação ponta a ponta.',
          'Migração de aplicações para a AWS, com testes de carga e preparação para produção junto ao time de SRE.',
          'Redis como cache distribuído no lugar do cache em memória, em microsserviços.',
          'Liderança de iniciativa de observabilidade: alertas do Grafana no Slack (templates em Go), dashboards e regras de acionamento.',
          'Atuação similar a Security Champion: correção de SSRF e de dependências vulneráveis, seguindo a OWASP.',
          'Participação em migrações de banco de dados que reduziram cerca de R$ 570 mil em custos de infraestrutura.',
        ],
      },
      {
        title: 'Estágio em Backend',
        org: 'ClearSale',
        period: 'ago 2023 – jun 2024',
        highlight: 'Selecionada entre ~12 mil inscritos para 40 vagas',
        bullets: [
          'APIs REST e BFFs em C#: manutenção, correção de bugs e novos endpoints.',
          'Testes unitários com xUnit e análise de qualidade com SonarQube nos pipelines de CI/CD.',
          'Pipelines YAML para PR e DEV, com publicação no AKS.',
        ],
      },
      {
        title: 'Gerente Comercial',
        org: 'Americanas S.A.',
        period: 'jun 2022 – nov 2022',
        bullets: [
          'Gestão de loja e equipe: tesouraria, admissões, desligamentos e metas de vendas do Ame Digital.',
          'Gerência geral interina da loja central de Brasília, uma das mais importantes do Distrito Federal.',
        ],
      },
      {
        title: 'Assistente de Customer Success (antes, estagiária)',
        org: 'Grupo Afinidade',
        period: 'jan 2019 – jun 2022',
        bullets: [
          'Relacionamento com clientes B2B de planos de saúde e odontológicos; ponto focal de uma das maiores contas (cerca de R$ 100 mil por mês).',
          'Plano de ação do departamento com 5W2H e matriz GUT; mapeamento de processos com Bizagi; supervisão temporária da equipe por três meses.',
        ],
      },
    ],
    earlier: {
      label: 'Anteriormente',
      text: 'Auxiliar Administrativa, Núcleo de Integração Social (ONG), 2019–2020 · Trainee de Marketing, Firz Consultoria, 2018–2019 · Intérprete de inglês freelance (Education USA Fair), 2017–2019.',
    },
    education: [
      {
        title: 'Análise e Desenvolvimento de Sistemas (tecnólogo)',
        org: 'UniCEUB',
        period: '2023 – 2025',
        note: 'TCC com menção SS (nota máxima).',
      },
      {
        title: 'Bacharelado em Administração',
        org: 'Universidade de Brasília (UnB)',
        period: '2017 – 2022',
        note: 'TCC com menção SS (nota máxima).',
      },
    ],
    languages: 'Português (nativo) · Espanhol (nativo) · Inglês (fluente)',
    academic: [
      'Autora principal do artigo “Evolução da Pesquisa em GSCM: uma Revisão Bibliométrica no Período de 2018 a 2020”, apresentado no GOOP (2021).',
      'Monitora voluntária de Teoria Política Moderna (UnB, 2020); comissão organizadora da Semana Acadêmica de Administração 2021.',
    ],
    projects:
      'iHairCare Backend API (C#, ASP.NET Core, MongoDB, arquitetura limpa em camadas, SOLID, Swagger): github.com/recioes/ihaircare.backend.app.',
  },

  en: {
    htmlLang: 'en',
    fileName: 'Esther-Recio-CV-en.pdf',
    headline: 'Backend Developer · C# · .NET · Kafka · AWS',
    headings: {
      summary: 'Summary',
      skills: 'Technical skills',
      experience: 'Professional experience',
      education: 'Education',
      languages: 'Languages',
      academic: 'Academic activities',
      additional: 'Additional information',
      projects: 'GitHub project',
    },
    summary:
      'Backend developer at Zenvia, building high-volume services in C# and .NET (APIs, workers, microservices and messaging). Moved from internship straight to Junior Dev. Degrees in Business Administration and in Systems Analysis and Development: I combine business perspective with engineering, with a focus on reliability, observability and security.',
    skills: [
      {
        label: 'Languages, frameworks and AI',
        items: 'C#, .NET, Claude Code (AI agents)',
      },
      { label: 'Messaging and data', items: 'Apache Kafka, Google Pub/Sub, Redis, MongoDB' },
      { label: 'Cloud and DevOps', items: 'AWS, Azure DevOps, AKS, YAML CI/CD pipelines' },
      {
        label: 'Quality, observability and security',
        items: 'xUnit, SonarQube, k6, Grafana, OWASP',
      },
    ],
    experience: [
      {
        title: 'Backend Developer',
        org: 'Zenvia',
        period: 'Jun 2024 – Present',
        highlight: 'From internship straight to Junior Dev',
        bullets: [
          'Migrated several applications from Google Pub/Sub to Apache Kafka: topics, consumers, DLQs and end-to-end validation.',
          'Migrated applications to AWS, with load testing and production readiness alongside the SRE team.',
          'Introduced Redis as a distributed cache in place of in-memory caching, across microservices.',
          'Led an observability initiative: Grafana alerts on Slack (Go templates), dashboards and trigger rules.',
          'Worked in a Security Champion-like role: fixed SSRF and vulnerable dependencies, following OWASP guidance.',
          'Took part in database migrations that cut roughly R$ 570k in infrastructure costs.',
        ],
      },
      {
        title: 'Backend Intern',
        org: 'ClearSale',
        period: 'Aug 2023 – Jun 2024',
        highlight: 'Selected from ~12k applicants for 40 spots',
        bullets: [
          'REST APIs and BFFs in C#: maintenance, bug fixes and new endpoints.',
          'Unit tests with xUnit and quality analysis with SonarQube in CI/CD pipelines.',
          'YAML pipelines for PR and DEV environments, publishing to AKS.',
        ],
      },
      {
        title: 'Commercial Manager',
        org: 'Americanas S.A.',
        period: 'Jun 2022 – Nov 2022',
        bullets: [
          'Store and team management: treasury, hiring, terminations and Ame Digital sales targets.',
          'Interim general manager of the central Brasília store, one of the most important in the Federal District.',
        ],
      },
      {
        title: 'Customer Success Assistant (previously intern)',
        org: 'Grupo Afinidade',
        period: 'Jan 2019 – Jun 2022',
        bullets: [
          'Relationship with B2B health and dental plan customers; point of contact for one of the largest accounts (about R$ 100k per month).',
          'Department action plan using 5W2H and the GUT matrix; process mapping with Bizagi; temporary team supervision for three months.',
        ],
      },
    ],
    earlier: {
      label: 'Earlier',
      text: 'Administrative Assistant, Núcleo de Integração Social (NGO), 2019–2020 · Marketing Trainee, Firz Consultoria, 2018–2019 · Freelance English interpreter (Education USA Fair), 2017–2019.',
    },
    education: [
      {
        title: 'Systems Analysis and Development (technology degree)',
        org: 'UniCEUB',
        period: '2023 – 2025',
        note: 'Final project graded SS (top mark).',
      },
      {
        title: 'Bachelor’s in Business Administration',
        org: 'University of Brasília (UnB)',
        period: '2017 – 2022',
        note: 'Final project graded SS (top mark).',
      },
    ],
    languages: 'Portuguese (native) · Spanish (native) · English (fluent)',
    academic: [
      'Lead author of “Evolution of GSCM Research: A Bibliometric Review for 2018 to 2020” (in Portuguese), presented at GOOP (2021).',
      'Volunteer teaching assistant, Modern Political Theory (UnB, 2020); organizing committee, Business Administration Academic Week 2021.',
    ],
    projects:
      'iHairCare Backend API (C#, ASP.NET Core, MongoDB, clean layered architecture, SOLID, Swagger): github.com/recioes/ihaircare.backend.app.',
  },

  es: {
    htmlLang: 'es',
    fileName: 'Esther-Recio-CV-es.pdf',
    headline: 'Backend Developer · C# · .NET · Kafka · AWS',
    headings: {
      summary: 'Perfil',
      skills: 'Competencias técnicas',
      experience: 'Experiencia profesional',
      education: 'Formación',
      languages: 'Idiomas',
      academic: 'Actividades académicas',
      additional: 'Información adicional',
      projects: 'Proyecto en GitHub',
    },
    summary:
      'Desarrolladora backend en Zenvia, construyendo servicios de alto volumen en C# y .NET (APIs, workers, microservicios y mensajería). Pasé de las prácticas directamente a Dev Junior. Graduada en Administración y en Análisis y Desarrollo de Sistemas: combino visión de negocio e ingeniería, con foco en fiabilidad, observabilidad y seguridad.',
    skills: [
      {
        label: 'Lenguajes, frameworks e IA',
        items: 'C#, .NET, Claude Code (agentes de IA)',
      },
      { label: 'Mensajería y datos', items: 'Apache Kafka, Google Pub/Sub, Redis, MongoDB' },
      { label: 'Cloud y DevOps', items: 'AWS, Azure DevOps, AKS, pipelines CI/CD en YAML' },
      {
        label: 'Calidad, observabilidad y seguridad',
        items: 'xUnit, SonarQube, k6, Grafana, OWASP',
      },
    ],
    experience: [
      {
        title: 'Backend Developer',
        org: 'Zenvia',
        period: 'jun 2024 – actualidad',
        highlight: 'De las prácticas directamente a Dev Junior',
        bullets: [
          'Migración de varias aplicaciones de Google Pub/Sub a Apache Kafka: tópicos, consumidores, DLQs y validación de extremo a extremo.',
          'Migración de aplicaciones a AWS, con pruebas de carga y preparación para producción junto al equipo de SRE.',
          'Redis como caché distribuida en lugar de la caché en memoria, en microservicios.',
          'Liderazgo de una iniciativa de observabilidad: alertas de Grafana en Slack (plantillas en Go), dashboards y reglas de activación.',
          'Función similar a la de Security Champion: corrección de SSRF y de dependencias vulnerables, siguiendo la guía de OWASP.',
          'Participación en migraciones de bases de datos que redujeron unos R$ 570 mil en costes de infraestructura.',
        ],
      },
      {
        title: 'Prácticas en Backend',
        org: 'ClearSale',
        period: 'ago 2023 – jun 2024',
        highlight: 'Seleccionada entre ~12 mil inscritos para 40 plazas',
        bullets: [
          'APIs REST y BFFs en C#: mantenimiento, corrección de errores y nuevos endpoints.',
          'Pruebas unitarias con xUnit y análisis de calidad con SonarQube en pipelines de CI/CD.',
          'Pipelines YAML para entornos de PR y DEV, con publicación en AKS.',
        ],
      },
      {
        title: 'Gerente Comercial',
        org: 'Americanas S.A.',
        period: 'jun 2022 – nov 2022',
        bullets: [
          'Gestión de tienda y equipo: tesorería, contrataciones, despidos y objetivos de ventas de Ame Digital.',
          'Gerente general interina de la tienda central de Brasilia, una de las más importantes del Distrito Federal.',
        ],
      },
      {
        title: 'Asistente de Customer Success (antes, prácticas)',
        org: 'Grupo Afinidade',
        period: 'ene 2019 – jun 2022',
        bullets: [
          'Relación con clientes B2B de planes de salud y dentales; punto de contacto de una de las mayores cuentas (unos R$ 100 mil al mes).',
          'Plan de acción del departamento con 5W2H y matriz GUT; mapeo de procesos con Bizagi; supervisión temporal del equipo durante tres meses.',
        ],
      },
    ],
    earlier: {
      label: 'Anteriormente',
      text: 'Auxiliar Administrativa, Núcleo de Integração Social (ONG), 2019–2020 · Trainee de Marketing, Firz Consultoria, 2018–2019 · Intérprete de inglés freelance (Education USA Fair), 2017–2019.',
    },
    education: [
      {
        title: 'Análisis y Desarrollo de Sistemas (grado tecnológico)',
        org: 'UniCEUB',
        period: '2023 – 2025',
        note: 'Trabajo de fin de carrera con calificación SS (la máxima).',
      },
      {
        title: 'Grado en Administración',
        org: 'Universidad de Brasilia (UnB)',
        period: '2017 – 2022',
        note: 'Trabajo de fin de carrera con calificación SS (la máxima).',
      },
    ],
    languages: 'Español (nativo) · Portugués (nativo) · Inglés (fluido)',
    academic: [
      'Autora principal del artículo «Evolución de la investigación en GSCM: una revisión bibliométrica de 2018 a 2020» (en portugués), presentado en el GOOP (2021).',
      'Monitora voluntaria de Teoría Política Moderna (UnB, 2020); comisión organizadora de la Semana Académica de Administración 2021.',
    ],
    projects:
      'iHairCare Backend API (C#, ASP.NET Core, MongoDB, arquitectura limpia en capas, SOLID, Swagger): github.com/recioes/ihaircare.backend.app.',
    additional: [
      'Doble nacionalidad (brasileña y española).',
      'Seis años viviendo en España; estudié en el Colegio Calasanz de Villacarriedo.',
    ],
  },
};
