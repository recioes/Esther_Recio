import type { Dictionary } from './types';

export const en: Dictionary = {
  locale: 'en',
  htmlLang: 'en',
  slug: 'en',
  shortName: 'EN',
  title: 'Esther Recio — Backend Developer',
  description:
    'Esther Recio, Backend Developer at Zenvia (C#, .NET, Kafka). Career journey, LinkedIn, GitHub and Lattes.',
  ogImageAlt:
    'Esther Recio, Backend Developer, next to a globe of the Earth on a purple background.',
  role: 'Backend Developer',
  linksLabel: 'Professional profiles',
  languageSwitchLabel: 'Page language',
  languageNames: { 'pt-BR': 'Português', en: 'English' },
  newTabHint: 'opens in a new tab',
  globeHint: 'Drag to spin the Earth',
  links: {
    linkedin: { label: 'LinkedIn', description: 'Professional profile' },
    github: { label: 'GitHub', description: 'Code and projects' },
    lattes: { label: 'Lattes', description: 'Academic résumé' },
  },
  timeline: {
    title: 'Journey',
    intro: 'From Business Administration to backend: a transition built step by step.',
    cue: 'See my journey',
    currentLabel: 'ongoing',
    items: {
      zenvia: {
        period: 'Jun 2024 — present',
        title: 'Backend Developer',
        org: 'Zenvia',
        summary:
          'High-volume services in C# and .NET: Pub/Sub to Kafka migration, AWS migrations, distributed caching with Redis, observability with Grafana and load testing with k6. Took part in database migrations that cut roughly R$ 570k in infrastructure costs.',
        highlight: 'From internship straight to Junior Dev',
      },
      clearsale: {
        period: 'Aug 2023 — Jun 2024',
        title: 'Backend Internship',
        org: 'ClearSale',
        summary:
          'REST APIs and BFFs in C#, unit tests with xUnit, quality gates with SonarQube, YAML pipelines on AKS, and SQL Server and MongoDB databases. The doorway to Zenvia.',
        highlight: '40 spots, ~12k applicants',
      },
      uniceub: {
        period: 'Feb 2023 — Feb 2025',
        title: 'Systems Analysis and Development',
        org: 'UniCEUB',
        summary:
          'A technology degree taken while entering the field: the education that supported the career transition.',
      },
      americanas: {
        period: 'Jun 2022 — Nov 2022',
        title: 'Commercial Management',
        org: 'Americanas S.A.',
        summary:
          'Store management, sales targets for Ame Digital and interim general management of one of the most important stores in the Federal District.',
      },
      afinidade: {
        period: '2019 — 2022',
        title: 'Customer Success (intern, then assistant)',
        org: 'Grupo Afinidade',
        summary:
          'B2B relationship with health and dental plans, process mapping with Bizagi, an action plan using 5W2H and point of contact for one of the largest accounts in the portfolio.',
      },
      interpreter: {
        period: 'Oct 2017 — Oct 2019',
        title: 'English interpreter (freelance)',
        org: 'Casa Thomas Jefferson',
        summary:
          'Three editions of the Education USA Fair, interpreting for universities such as Kent State, Colorado Boulder and Missouri.',
      },
      unb: {
        period: 'Aug 2017 — Feb 2022',
        title: "Bachelor's in Business Administration",
        org: 'University of Brasília (UnB)',
        summary:
          'The foundation in management, research and critical thinking. An education that still matters today.',
        highlight: 'Admitted at age 17',
      },
    },
  },
  easter: {
    turbo: 'Turbo mode on 🚀',
    rocketRain: 'Rocket rain! 🚀',
    moonOn: 'Moon mode on 🌙',
    moonOff: 'Back to the usual sky ✨',
    nameGlow: 'You know my name 💜',
    wish: 'You made a wish ✨',
    shootingStarLabel: 'Shooting star: click to make a wish',
    dizzy: 'Easy, the planet is dizzy 🌍',
    constellation: "You found Esther's Star ✨",
    trailOn: 'Stardust on ✨',
    trailOff: 'Stardust off',
    themes: {
      aurora: 'Aurora theme',
      sunset: 'Sunset theme 🌅',
      terminal: 'Terminal theme 💻',
    },
    greeting: {
      dawn: 'Good late night! It is {time} where you are. Time to look at the stars ✨',
      morning: 'Good morning! It is {time} where you are. The sun already passed by here ☀️',
      afternoon: 'Good afternoon! It is {time} where you are. Make yourself at home 🌎',
      evening: 'Good evening! It is {time} where you are. The lights of Earth are on 🌃',
    },
    markers: {
      brasilia: { title: 'Brasília', detail: 'Brazil' },
      santander: { title: 'Santander', detail: 'Spain' },
    },
    consoleHello: 'Curious, huh? Nice that you opened the console 👀',
    consoleCta: "Let's talk →",
  },
  notFound: {
    title: 'Houston, we lost the signal',
    text: 'This page drifted out of orbit (error 404).',
    back: 'Back to Earth',
  },
};
