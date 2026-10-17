import type { Dictionary } from './types';

export const en: Dictionary = {
  locale: 'en',
  htmlLang: 'en',
  slug: 'en',
  shortName: 'EN',
  title: 'Esther Recio — Backend Developer',
  description:
    'Esther Recio, Backend Developer at Zenvia (C#, .NET, Kafka). Degrees in Business Administration and Systems Analysis and Development; native Portuguese and Spanish, fluent English.',
  ogImageAlt:
    'Esther Recio, Backend Developer, next to a globe of the Earth on a purple background.',
  role: 'Backend Developer',
  linksLabel: 'Professional profiles',
  languageSwitchLabel: 'Page language',
  languageNames: { 'pt-BR': 'Português', en: 'English', es: 'Español' },
  newTabHint: 'opens in a new tab',
  globeHint: 'Drag to spin the Earth',
  links: {
    linkedin: { label: 'LinkedIn', description: 'Professional profile' },
    github: { label: 'GitHub', description: 'Code and projects' },
    lattes: { label: 'Lattes', description: 'Academic résumé' },
  },
  resume: {
    label: 'Résumé',
    description: 'Download as PDF (1 page)',
    downloadHint: 'downloads a PDF file',
  },
  about: {
    title: 'About',
    lead: 'Backend developer with one foot in business and the other in code.',
    paragraphs: [
      'I work at Zenvia with C# and .NET, building services that handle a lot of traffic. I got there straight from my internship at ClearSale, after starting my career in Business Administration. That mix of Administration and systems gives me a business perspective when I write code.',
    ],
  },
  languages: {
    title: 'Languages',
    intro:
      'Three languages, two of them native: I was born in Brazil, spent part of my childhood in Spain, and English led me to work as an interpreter at 17.',
    levels: { native: 'Native', fluent: 'Fluent' },
    items: {
      pt: { name: 'Português', detail: 'Mother tongue.' },
      es: {
        name: 'Español',
        detail:
          'I lived in Spain for six years from age two, and learned to read and write there, at Colegio Calasanz de Villacarriedo. A large part of my family is Spanish.',
      },
      en: {
        name: 'English',
        detail:
          'Studied at Casa Thomas Jefferson in Brasília. My strong results led to three interpreting jobs, the first at 17.',
      },
    },
    note: 'Growing up between two countries and two languages gave me familiarity with different cultural contexts, useful in distributed teams and cross-cultural communication. It is personal and family experience, separate from my professional experience, which so far has been in Brazil.',
  },
  timeline: {
    title: 'Journey',
    intro: 'From Business Administration to backend: a transition built step by step.',
    cue: 'Explore my journey',
    present: 'present',
    currentLabel: 'ongoing',
    kindLabels: { work: 'Experience', education: 'Education' },
    items: {
      zenvia: {
        title: 'Backend Developer',
        org: 'Zenvia',
        summary:
          'Backend services in C# and .NET (APIs, workers, microservices and high-volume messaging), including adapting services for large enterprise customers.',
        highlight: 'From internship straight to Junior Dev',
        points: [
          'Migrated several applications from Google Pub/Sub to Apache Kafka: topics, consumers, DLQs and end-to-end validation.',
          'Migrated applications to AWS, with load testing and production readiness alongside the SRE team.',
          'Introduced Redis as a distributed cache in place of in-memory caching, across microservices.',
          'Led an observability initiative: Grafana alerts on Slack with Go templates, dashboards and trigger conditions.',
          'Worked in a Security Champion-like role: fixed SSRF and vulnerable dependencies, following OWASP guidance.',
          'Took part in database migrations that cut roughly R$ 570k in infrastructure costs.',
        ],
      },
      clearsale: {
        title: 'Backend Internship',
        org: 'ClearSale',
        summary:
          'Entered the tech industry in the first semester of college, and the doorway to Zenvia.',
        highlight: '40 spots, ~12k applicants',
        points: [
          'REST APIs and BFFs in C#: maintenance, bug fixes and new endpoints.',
          'Unit tests with xUnit and quality analysis with SonarQube in CI/CD pipelines.',
          'YAML pipelines for PR and DEV environments, publishing to AKS.',
          'Pair programming sessions and part of the development of a C# query builder.',
        ],
      },
      uniceub: {
        title: 'Systems Analysis and Development',
        org: 'UniCEUB',
        summary:
          'A technology degree that added analytical reasoning and development practice to the business view from Administration: the education that supported the career transition.',
        points: [
          'Final project graded SS, the top mark. I learned the professor used it as a reference example for the following semester’s class.',
          'Landed the ClearSale internship in the first semester of the course, before the second one began.',
        ],
      },
      americanas: {
        title: 'Commercial Manager',
        org: 'Americanas S.A.',
        summary:
          'Store and team management, with sales targets and handling of complex customer cases.',
        points: [
          'Administrative management: treasury, time tracking, hiring, terminations and interviews.',
          'Owned the Ame Digital sales targets, engaging teams through daily in-store actions.',
          'Interim general manager of one of the most important stores in the Federal District (the central Brasília store).',
        ],
      },
      afinidade: {
        title: 'Customer Success Assistant',
        org: 'Grupo Afinidade',
        summary:
          'Relationship with B2B health and dental plan customers across several carriers, by email, WhatsApp and phone.',
        points: [
          'Registry changes (additions, removals and updates) and guidance on price adjustments, provider networks and reimbursement.',
          'Department action plan using 5W2H and the GUT matrix; process mapping with Bizagi.',
          'Point of contact for one of the largest accounts in the portfolio (about R$ 100k per month).',
          'Temporary supervision of the team for three months.',
        ],
      },
      nis: {
        title: 'Administrative Assistant',
        org: 'Núcleo de Integração Social (NIS), NGO',
        summary:
          'Support to the organization’s main social entrepreneurship project: administrative processes, official letters and statements, project and people management, and relationships with partner companies.',
      },
      afinidadeIntern: {
        title: 'Customer Success Internship',
        org: 'Grupo Afinidade',
        summary:
          'Support to business relationships with health and insurance brokers: registry changes, invoice issuing, contract management and reimbursements, with phone and email service.',
      },
      firz: {
        title: 'Marketing Trainee',
        org: 'Firz Consultoria',
        summary:
          'Hands-on marketing learning: building personas, basic Photoshop and creating visual identities.',
      },
      interpreter: {
        title: 'English interpreter (freelance)',
        org: 'Casa Thomas Jefferson',
        summary:
          'Three editions of the Education USA Fair (2017, 2018 and 2019), interpreting for representatives of Kent State, Colorado Boulder and Missouri universities.',
        highlight: 'First job at 17',
        points: [
          'Strong results in the English course at Casa Thomas Jefferson, in Brasília, led to being selected for all three jobs.',
        ],
      },
      unb: {
        title: 'Bachelor’s in Business Administration',
        org: 'University of Brasília (UnB)',
        summary:
          'The foundation in management, research and critical thinking, which still matters today. Together with the systems degree, it forms the business-plus-technology mix I bring to work.',
        highlight: 'Admitted at age 17',
        points: [
          'Final project graded SS, the top mark. During the evaluation I received praise and the suggestion to consider a master’s degree.',
          'Teaching assistantship, event organizing committee and a conference paper: see “Academic activities”.',
        ],
      },
    },
  },
  projects: {
    title: 'Project',
    intro: 'A personal project in C#, open on GitHub.',
    allLabel: 'See all repositories',
    items: {
      ihaircare: {
        name: 'iHairCare Backend API',
        summary:
          'RESTful API to manage hair-treatment schedules (create, update, list and delete), backed by MongoDB. Clean layered architecture (API, Core and Infra), SOLID principles, Swagger documentation and the connection string kept out of the code, in an environment variable.',
      },
    },
  },
  academic: {
    title: 'Academic activities',
    intro: 'Research, teaching support and event organizing during my undergraduate years at UnB.',
    publicationLabel: 'Publication',
    publication: {
      titleGloss: 'Evolution of GSCM Research: A Bibliometric Review for 2018 to 2020',
      glossLabel: 'Free translation',
      eventLabel: 'Presented at',
      authorsLabel: 'Authors',
      role: 'Lead author',
      summary:
        'A bibliometric review of how GSCM research evolved between 2018 and 2020, developed in the Organizational Logistics course in the second semester of 2020.',
    },
    activitiesLabel: 'Volunteering',
    activities: {
      monitoria: {
        title: 'Volunteer teaching assistant, Modern Political Theory',
        org: 'University of Brasília',
        summary: 'Support to the professor in charge of the course and to its students.',
        points: [
          'Grading assignments and recording grades in tracking spreadsheets.',
          'Answering students’ questions.',
        ],
      },
      organizingCommittee: {
        title: 'Organizing committee, Business Administration Academic Week 2021',
        org: 'University of Brasília',
        summary: 'Volunteer member of the organizing committee.',
        points: [
          'Helped organize the online events.',
          'Host and co-host at the opening and closing sessions.',
        ],
      },
    },
  },
  easter: {
    turbo: 'Turbo mode on 🚀',
    rocketRain: 'Rocket rain! 🚀',
    moonOn: 'The moon came out 🌙',
    nameGlow: 'You know my name 💜',
    wish: 'You made a wish ✨',
    shootingStarLabel: 'Shooting star: click to make a wish',
    dizzy: 'Easy, the planet is dizzy 🌍',
    constellation: 'You found Esther’s Star ✨',
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
      brasilia: { title: 'Brasília', detail: 'Brazil · UnB and UniCEUB' },
      santander: { title: 'Santander', detail: 'Spain · where I learned to read and write' },
    },
    boardTitle: 'Clues',
    hints: {
      turbo:
        'A legendary 80s video-game code makes this planet take off. On a phone, maybe my name knows something.',
      rain: 'Type the name of what climbs to space with fire in its tail, and watch what falls from the sky.',
      moon: 'When the sky is empty, type the name of our companion of the night.',
      name: 'My name is also a password. Type it.',
      wish: 'When something streaks across the sky, everyone makes a request. Summon one by typing what it is.',
      theme: 'The monogram up top hides more than one color. Keep poking it.',
      constellation:
        'In a corner of the sky, five little dots wait for someone who can draw them in one stroke.',
      dizzy: 'The Earth does not like being poked many times in a row.',
      trail:
        'The stardust that follows your mouse obeys one key. Clue: it is the first letter of “stardust”.',
    },
    counterLabel: 'Secrets found',
    hintsDone: 'You found every secret that comes with a clue. Thanks for exploring 💜',
    consoleHello: 'Curious, huh? Nice that you opened the console 👀',
    consoleCta: 'Let’s talk →',
  },
  notFound: {
    title: 'Houston, we lost the signal',
    text: 'This page drifted out of orbit (error 404).',
    back: 'Back to Earth',
  },
};
