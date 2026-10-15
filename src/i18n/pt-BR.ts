import type { Dictionary } from './types';

export const ptBR: Dictionary = {
  locale: 'pt-BR',
  htmlLang: 'pt-BR',
  slug: '',
  shortName: 'PT',
  title: 'Esther Recio — Backend Developer',
  description:
    'Esther Recio, Backend Developer na Zenvia (C#, .NET, Kafka). Formada em Administração e Análise e Desenvolvimento de Sistemas; português e espanhol nativos, inglês fluente.',
  ogImageAlt: 'Esther Recio, Backend Developer, ao lado de um globo terrestre sobre fundo roxo.',
  role: 'Backend Developer',
  linksLabel: 'Perfis profissionais',
  languageSwitchLabel: 'Idioma da página',
  languageNames: { 'pt-BR': 'Português', en: 'English', es: 'Español' },
  newTabHint: 'abre em nova aba',
  globeHint: 'Arraste para girar a Terra',
  links: {
    linkedin: { label: 'LinkedIn', description: 'Perfil profissional' },
    github: { label: 'GitHub', description: 'Código e projetos' },
    lattes: { label: 'Lattes', description: 'Currículo acadêmico' },
  },
  about: {
    title: 'Sobre',
    lead: 'Backend developer com um pé nos negócios e outro no código.',
    paragraphs: [
      'Trabalho na Zenvia com C# e .NET, construindo serviços que lidam com muito volume. Cheguei lá direto do estágio na ClearSale, depois de começar a carreira na Administração. Essa mistura de Administração e sistemas me dá um olhar de negócio na hora de escrever código.',
    ],
  },
  languages: {
    title: 'Idiomas',
    intro:
      'Três idiomas, dois deles de origem: nasci no Brasil, passei parte da infância na Espanha e o inglês me levou a trabalhar como intérprete aos 17 anos.',
    levels: { native: 'Nativo', fluent: 'Fluente' },
    items: {
      pt: { name: 'Português', detail: 'Língua materna.' },
      es: {
        name: 'Español',
        detail:
          'Morei seis anos na Espanha a partir dos dois anos de idade e fui alfabetizada lá, no Colegio Calasanz de Villacarriedo. Boa parte da minha família é espanhola.',
      },
      en: {
        name: 'English',
        detail:
          'Curso na Casa Thomas Jefferson, em Brasília. O bom desempenho levou a três trabalhos como intérprete; o primeiro, aos 17 anos.',
      },
    },
    note: 'Crescer entre dois países e dois idiomas deu familiaridade com contextos culturais diferentes, útil em equipes distribuídas e na comunicação intercultural. É vivência pessoal e familiar, distinta da minha experiência profissional, que até aqui foi no Brasil.',
  },
  timeline: {
    title: 'Trajetória',
    intro: 'Da Administração para o backend: uma transição construída passo a passo.',
    cue: 'Conhecer minha trajetória',
    present: 'atual',
    currentLabel: 'em andamento',
    kindLabels: { work: 'Experiência', education: 'Formação' },
    items: {
      zenvia: {
        title: 'Backend Developer',
        org: 'Zenvia',
        summary:
          'Serviços backend em C# e .NET (APIs, workers, microsserviços e mensageria em alto volume), incluindo a adaptação de serviços para grandes clientes empresariais.',
        highlight: 'Do estágio direto para Dev Júnior',
        points: [
          'Migração de várias aplicações do Google Pub/Sub para Apache Kafka: tópicos, consumidores, DLQs e validação ponta a ponta.',
          'Migração de aplicações para a AWS, com testes de carga e preparação para produção junto ao time de SRE.',
          'Redis como cache distribuído no lugar do cache em memória, em microsserviços.',
          'Liderança de uma iniciativa de observabilidade: alertas do Grafana no Slack com templates em Go, dashboards e condições de acionamento.',
          'Atuação similar a Security Champion: correção de SSRF e de dependências vulneráveis, seguindo a OWASP.',
          'Participação em migrações de banco de dados que reduziram cerca de R$ 570 mil em custos de infraestrutura.',
        ],
      },
      clearsale: {
        title: 'Estágio em Backend',
        org: 'ClearSale',
        summary:
          'Entrada no mercado de tecnologia ainda no primeiro semestre da faculdade, e a porta de entrada para a Zenvia.',
        highlight: '40 vagas, ~12 mil inscrições',
        points: [
          'APIs REST e BFFs em C#: manutenção, correção de bugs e novos endpoints.',
          'Testes unitários com xUnit e análise de qualidade com SonarQube nos pipelines de CI/CD.',
          'Pipelines em YAML para PR e DEV, com publicação no AKS.',
          'Sessões de pair programming e participação no desenvolvimento de um query builder em C#.',
        ],
      },
      uniceub: {
        title: 'Análise e Desenvolvimento de Sistemas',
        org: 'UniCEUB',
        summary:
          'Graduação tecnológica que somou raciocínio analítico e prática de desenvolvimento à visão de negócios da Administração: a formação que sustentou a transição de carreira.',
        points: [
          'TCC com menção SS, a nota máxima. Soube que o professor o usou como exemplo de referência para a turma do semestre seguinte.',
          'Estágio na ClearSale conquistado ainda no primeiro semestre do curso, antes do início do segundo.',
        ],
      },
      americanas: {
        title: 'Gerente Comercial',
        org: 'Americanas S.A.',
        summary:
          'Gestão de loja e de equipe, com metas de vendas e atendimento de casos complexos.',
        points: [
          'Gestão administrativa: tesouraria, controle de ponto, admissões, desligamentos e entrevistas.',
          'Responsável pelas metas de vendas do Ame Digital, engajando as equipes com ações diárias em loja.',
          'Gerência geral interina em uma das lojas mais importantes do Distrito Federal (a loja central de Brasília).',
        ],
      },
      afinidade: {
        title: 'Assistente de Customer Success',
        org: 'Grupo Afinidade',
        summary:
          'Relacionamento com clientes B2B de planos de saúde e odontológicos de várias operadoras, por e-mail, WhatsApp e telefone.',
        points: [
          'Movimentações cadastrais (inclusão, exclusão e alteração) e orientação sobre reajustes, rede credenciada e reembolso.',
          'Plano de ação do departamento com 5W2H e matriz GUT; mapeamento de processos com Bizagi.',
          'Ponto focal de uma das maiores contas da carteira (cerca de R$ 100 mil por mês).',
          'Supervisão temporária da equipe do setor por três meses.',
        ],
      },
      nis: {
        title: 'Auxiliar Administrativa',
        org: 'Núcleo de Integração Social (NIS), ONG',
        summary:
          'Apoio ao projeto principal de empreendedorismo social da organização: processos administrativos, elaboração de ofícios e declarações, gestão de projetos e de pessoas e relacionamento com empresas parceiras.',
      },
      afinidadeIntern: {
        title: 'Estágio em Customer Success',
        org: 'Grupo Afinidade',
        summary:
          'Apoio ao relacionamento empresarial com corretoras de planos de saúde e seguros: movimentações cadastrais, emissão de boletos, gestão de contratos e reembolsos, com atendimento por telefone e e-mail.',
      },
      firz: {
        title: 'Trainee de Marketing',
        org: 'Firz Consultoria',
        summary:
          'Aprendizado prático em Marketing: construção de personas, uso básico do Photoshop e criação de identidades visuais.',
      },
      interpreter: {
        title: 'Intérprete de inglês (freelance)',
        org: 'Casa Thomas Jefferson',
        summary:
          'Três edições da Education USA Fair (2017, 2018 e 2019), interpretando para representantes das universidades Kent State, Colorado Boulder e Missouri.',
        highlight: 'Primeiro trabalho aos 17 anos',
        points: [
          'O bom desempenho no curso de inglês da Casa Thomas Jefferson, em Brasília, levou à seleção para os três trabalhos.',
        ],
      },
      unb: {
        title: 'Bacharelado em Administração',
        org: 'Universidade de Brasília (UnB)',
        summary:
          'A base de gestão, pesquisa e pensamento crítico, que segue importante até hoje. Junto com a formação em sistemas, forma a combinação de negócios e tecnologia que levo para o trabalho.',
        highlight: 'Ingresso aos 17 anos',
        points: [
          'TCC com menção SS, a nota máxima. Na avaliação, recebi elogios e a sugestão de considerar o mestrado.',
          'Monitoria, comissão organizadora de evento e artigo apresentado em congresso: veja "Atividades acadêmicas".',
        ],
      },
    },
  },
  academic: {
    title: 'Atividades acadêmicas',
    intro: 'Pesquisa, apoio ao ensino e organização de eventos durante a graduação na UnB.',
    publicationLabel: 'Publicação',
    publication: {
      titleGloss: '',
      glossLabel: '',
      eventLabel: 'Apresentado em',
      authorsLabel: 'Autores',
      role: 'Autora principal',
      summary:
        'Revisão bibliométrica sobre a evolução da pesquisa em GSCM entre 2018 e 2020, desenvolvida na disciplina de Logística Organizacional, no segundo semestre de 2020.',
    },
    activitiesLabel: 'Voluntariado',
    activities: {
      monitoria: {
        title: 'Monitora voluntária de Teoria Política Moderna',
        org: 'Universidade de Brasília',
        summary: 'Apoio à professora responsável pela disciplina e aos estudantes.',
        points: [
          'Correção de trabalhos e lançamento de notas em planilhas de acompanhamento.',
          'Esclarecimento de dúvidas dos estudantes.',
        ],
      },
      organizingCommittee: {
        title: 'Comissão organizadora da Semana Acadêmica de Administração 2021',
        org: 'Universidade de Brasília',
        summary: 'Integrante voluntária da comissão organizadora.',
        points: [
          'Apoio à organização dos eventos on-line.',
          'Host e co-host na abertura e no encerramento.',
        ],
      },
    },
  },
  easter: {
    turbo: 'Modo turbo ativado 🚀',
    rocketRain: 'Chuva de foguetes! 🚀',
    moonOn: 'A lua apareceu 🌙',
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
      brasilia: { title: 'Brasília', detail: 'Brasil · UnB e UniCEUB' },
      santander: { title: 'Santander', detail: 'Espanha · onde fui alfabetizada' },
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
