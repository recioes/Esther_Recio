import type { Dictionary } from './types';

export const ptBR: Dictionary = {
  locale: 'pt-BR',
  htmlLang: 'pt-BR',
  slug: '',
  shortName: 'PT',
  title: 'Esther Recio — Backend Developer',
  description:
    'Esther Recio, Backend Developer na Zenvia (C#, .NET, Kafka). Trajetória, LinkedIn, GitHub e Lattes.',
  ogImageAlt: 'Esther Recio, Backend Developer, ao lado de um globo terrestre sobre fundo roxo.',
  role: 'Backend Developer',
  linksLabel: 'Perfis profissionais',
  languageSwitchLabel: 'Idioma da página',
  languageNames: { 'pt-BR': 'Português', en: 'English' },
  newTabHint: 'abre em nova aba',
  globeHint: 'Arraste para girar a Terra',
  links: {
    linkedin: { label: 'LinkedIn', description: 'Perfil profissional' },
    github: { label: 'GitHub', description: 'Código e projetos' },
    lattes: { label: 'Lattes', description: 'Currículo acadêmico' },
  },
  timeline: {
    title: 'Trajetória',
    intro: 'Da Administração para o backend: uma transição construída passo a passo.',
    cue: 'Ver trajetória',
    currentLabel: 'em andamento',
    items: {
      zenvia: {
        period: 'jun 2024 — atual',
        title: 'Backend Developer',
        org: 'Zenvia',
        summary:
          'Serviços de alto volume em C# e .NET: migração de Pub/Sub para Kafka, migrações para AWS, cache distribuído com Redis, observabilidade com Grafana e testes de carga com k6. Participação em migrações de banco que cortaram cerca de R$ 570 mil em infraestrutura.',
        highlight: 'Do estágio direto para Dev Júnior',
      },
      clearsale: {
        period: 'ago 2023 — jun 2024',
        title: 'Estágio em Backend',
        org: 'ClearSale',
        summary:
          'APIs REST e BFFs em C#, testes com xUnit, qualidade com SonarQube, pipelines em YAML no AKS e bancos SQL Server e MongoDB. A porta de entrada para a Zenvia.',
        highlight: '40 vagas, ~12 mil inscrições',
      },
      uniceub: {
        period: 'fev 2023 — fev 2025',
        title: 'Análise e Desenvolvimento de Sistemas',
        org: 'UniCEUB',
        summary:
          'Graduação tecnológica em paralelo à entrada na área: a formação que sustentou a transição de carreira.',
      },
      americanas: {
        period: 'jun 2022 — nov 2022',
        title: 'Gerência Comercial',
        org: 'Americanas S.A.',
        summary:
          'Gestão de loja, metas de vendas do Ame Digital e gerência geral interina em uma das lojas mais importantes do Distrito Federal.',
      },
      afinidade: {
        period: '2019 — 2022',
        title: 'Customer Success (estágio e assistência)',
        org: 'Grupo Afinidade',
        summary:
          'Relacionamento B2B com planos de saúde e odontológicos, mapeamento de processos com Bizagi, plano de ação com 5W2H e ponto focal de uma das maiores contas da carteira.',
      },
      interpreter: {
        period: 'out 2017 — out 2019',
        title: 'Intérprete de inglês (freelance)',
        org: 'Casa Thomas Jefferson',
        summary:
          'Três edições da Education USA Fair, interpretando para universidades como Kent State, Colorado Boulder e Missouri.',
      },
      unb: {
        period: 'ago 2017 — fev 2022',
        title: 'Bacharelado em Administração',
        org: 'Universidade de Brasília (UnB)',
        summary:
          'A base de gestão, pesquisa e pensamento crítico. Uma formação que segue importante até hoje.',
        highlight: 'Ingresso aos 17 anos',
      },
    },
  },
  easter: {
    turbo: 'Modo turbo ativado 🚀',
    rocketRain: 'Chuva de foguetes! 🚀',
    moonOn: 'Modo lunar ligado 🌙',
    moonOff: 'De volta ao céu de sempre ✨',
    nameGlow: 'Você sabe meu nome 💜',
    wish: 'Você fez um pedido ✨',
    shootingStarLabel: 'Estrela cadente: clique para fazer um pedido',
    dizzy: 'Calma, o planeta está tonto 🌍',
    constellation: 'Você achou a Estrela da Esther ✨',
    trailOn: 'Poeira estelar ligada ✨',
    trailOff: 'Poeira estelar desligada',
    themes: {
      aurora: 'Tema aurora',
      sunset: 'Tema pôr do sol 🌅',
      terminal: 'Tema terminal 💻',
    },
    greeting: {
      dawn: 'Boa madrugada! Por aí são {time}. Hora de olhar as estrelas ✨',
      morning: 'Bom dia! Por aí são {time}. O sol já passou por aqui ☀️',
      afternoon: 'Boa tarde! Por aí são {time}. Fique à vontade 🌎',
      evening: 'Boa noite! Por aí são {time}. As luzes da Terra já acenderam 🌃',
    },
    markers: {
      brasilia: { title: 'Brasília', detail: 'Brasil' },
      santander: { title: 'Santander', detail: 'Espanha' },
    },
    consoleHello: 'Curioso(a), hein? Gostei de você ter aberto o console 👀',
    consoleCta: 'Vamos conversar →',
  },
  notFound: {
    title: 'Houston, perdemos o sinal',
    text: 'Esta página saiu da órbita (erro 404).',
    back: 'Voltar para a Terra',
  },
};
