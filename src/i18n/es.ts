import type { Dictionary } from './types';

export const es: Dictionary = {
  locale: 'es',
  htmlLang: 'es',
  slug: 'es',
  shortName: 'ES',
  title: 'Esther Recio — Backend Developer',
  description:
    'Esther Recio, Backend Developer en Zenvia (C#, .NET, Kafka). Graduada en Administración y en Análisis y Desarrollo de Sistemas; portugués y español nativos, inglés fluido.',
  ogImageAlt: 'Esther Recio, Backend Developer, junto a un globo terráqueo sobre un fondo morado.',
  role: 'Backend Developer',
  linksLabel: 'Perfiles profesionales',
  languageSwitchLabel: 'Idioma de la página',
  languageNames: { 'pt-BR': 'Português', en: 'English', es: 'Español' },
  newTabHint: 'se abre en una pestaña nueva',
  globeHint: 'Arrastra para girar la Tierra',
  links: {
    linkedin: { label: 'LinkedIn', description: 'Perfil profesional' },
    github: { label: 'GitHub', description: 'Código y proyectos' },
    lattes: { label: 'Lattes', description: 'Currículum académico' },
  },
  resume: {
    label: 'Currículum',
    description: 'Descargar en PDF (1 página)',
    downloadHint: 'descarga un archivo PDF',
  },
  about: {
    title: 'Sobre mí',
    lead: 'Desarrolladora backend con un pie en el negocio y otro en el código.',
    paragraphs: [
      'Trabajo en Zenvia con C# y .NET, construyendo servicios que manejan mucho volumen. Llegué directamente desde las prácticas en ClearSale, tras empezar mi carrera en Administración. Esa mezcla de Administración y sistemas me da una mirada de negocio a la hora de escribir código.',
    ],
  },
  languages: {
    title: 'Idiomas',
    intro:
      'Tres idiomas, dos de ellos nativos: nací en Brasil, pasé parte de mi infancia en España y el inglés me llevó a trabajar como intérprete a los 17 años.',
    levels: { native: 'Nativo', fluent: 'Fluido' },
    items: {
      pt: { name: 'Português', detail: 'Lengua materna.' },
      es: {
        name: 'Español',
        detail:
          'Viví seis años en España desde los dos años y allí aprendí a leer y escribir, en el Colegio Calasanz de Villacarriedo. Gran parte de mi familia es española.',
      },
      en: {
        name: 'English',
        detail:
          'Curso en Casa Thomas Jefferson, en Brasilia. Mi buen rendimiento me llevó a tres trabajos como intérprete; el primero, a los 17 años.',
      },
    },
    note: 'Crecer entre dos países y dos idiomas me dio familiaridad con contextos culturales distintos, útil en equipos distribuidos y en la comunicación intercultural. Es una vivencia personal y familiar, distinta de mi experiencia profesional, que hasta ahora ha sido en Brasil.',
  },
  timeline: {
    title: 'Trayectoria',
    intro: 'De la Administración al backend: una transición construida paso a paso.',
    cue: 'Conocer mi trayectoria',
    present: 'actualidad',
    currentLabel: 'en curso',
    kindLabels: { work: 'Experiencia', education: 'Formación' },
    items: {
      zenvia: {
        title: 'Backend Developer',
        org: 'Zenvia',
        summary:
          'Servicios backend en C# y .NET (APIs, workers, microservicios y mensajería de alto volumen), incluida la adaptación de servicios para grandes clientes empresariales.',
        highlight: 'De las prácticas directamente a Dev Junior',
        points: [
          'Migración de varias aplicaciones de Google Pub/Sub a Apache Kafka: tópicos, consumidores, DLQs y validación de extremo a extremo.',
          'Migración de aplicaciones a AWS, con pruebas de carga y preparación para producción junto al equipo de SRE.',
          'Redis como caché distribuida en lugar de la caché en memoria, en microservicios.',
          'Liderazgo de una iniciativa de observabilidad: alertas de Grafana en Slack con plantillas en Go, dashboards y condiciones de activación.',
          'Función similar a la de Security Champion: corrección de SSRF y de dependencias vulnerables, siguiendo la guía de OWASP.',
          'Participación en migraciones de bases de datos que redujeron unos R$ 570 mil en costes de infraestructura.',
        ],
      },
      clearsale: {
        title: 'Prácticas en Backend',
        org: 'ClearSale',
        summary:
          'Entrada al sector tecnológico en el primer semestre de la carrera, y la puerta de entrada a Zenvia.',
        highlight: '40 plazas, ~12 mil inscripciones',
        points: [
          'APIs REST y BFFs en C#: mantenimiento, corrección de errores y nuevos endpoints.',
          'Pruebas unitarias con xUnit y análisis de calidad con SonarQube en pipelines de CI/CD.',
          'Pipelines en YAML para entornos de PR y DEV, con publicación en AKS.',
          'Sesiones de pair programming y participación en el desarrollo de un query builder en C#.',
        ],
      },
      uniceub: {
        title: 'Análisis y Desarrollo de Sistemas',
        org: 'UniCEUB',
        summary:
          'Grado tecnológico que sumó razonamiento analítico y práctica de desarrollo a la visión de negocio de la Administración: la formación que sostuvo la transición profesional.',
        points: [
          'Trabajo de fin de carrera con calificación SS, la máxima. Supe que el profesor lo usó como ejemplo de referencia para el grupo del semestre siguiente.',
          'Conseguí las prácticas en ClearSale en el primer semestre del curso, antes de empezar el segundo.',
        ],
      },
      americanas: {
        title: 'Gerente Comercial',
        org: 'Americanas S.A.',
        summary:
          'Gestión de tienda y de equipo, con objetivos de ventas y atención de casos complejos de clientes.',
        points: [
          'Gestión administrativa: tesorería, control de asistencia, contrataciones, despidos y entrevistas.',
          'Responsable de los objetivos de ventas de Ame Digital, motivando a los equipos con acciones diarias en tienda.',
          'Gerente general interina de una de las tiendas más importantes del Distrito Federal (la tienda central de Brasilia).',
        ],
      },
      afinidade: {
        title: 'Asistente de Customer Success',
        org: 'Grupo Afinidade',
        summary:
          'Relación con clientes B2B de planes de salud y dentales de varias aseguradoras, por correo electrónico, WhatsApp y teléfono.',
        points: [
          'Gestión de altas, bajas y modificaciones, y orientación sobre reajustes de precio, red de proveedores y reembolsos.',
          'Plan de acción del departamento con 5W2H y matriz GUT; mapeo de procesos con Bizagi.',
          'Punto de contacto de una de las mayores cuentas de la cartera (unos R$ 100 mil al mes).',
          'Supervisión temporal del equipo durante tres meses.',
        ],
      },
      nis: {
        title: 'Auxiliar Administrativa',
        org: 'Núcleo de Integração Social (NIS), ONG',
        summary:
          'Apoyo al principal proyecto de emprendimiento social de la organización: procesos administrativos, elaboración de oficios y declaraciones, gestión de proyectos y de personas, y relación con empresas aliadas.',
      },
      afinidadeIntern: {
        title: 'Prácticas en Customer Success',
        org: 'Grupo Afinidade',
        summary:
          'Apoyo a la relación empresarial con corredurías de planes de salud y seguros: gestión de altas y bajas, emisión de recibos, gestión de contratos y reembolsos, con atención telefónica y por correo.',
      },
      firz: {
        title: 'Trainee de Marketing',
        org: 'Firz Consultoria',
        summary:
          'Aprendizaje práctico en Marketing: construcción de buyer personas, uso básico de Photoshop y creación de identidades visuales.',
      },
      interpreter: {
        title: 'Intérprete de inglés (freelance)',
        org: 'Casa Thomas Jefferson',
        summary:
          'Tres ediciones de la Education USA Fair (2017, 2018 y 2019), interpretando para representantes de las universidades Kent State, Colorado Boulder y Missouri.',
        highlight: 'Primer trabajo a los 17 años',
        points: [
          'El buen rendimiento en el curso de inglés de Casa Thomas Jefferson, en Brasilia, llevó a la selección para los tres trabajos.',
        ],
      },
      unb: {
        title: 'Grado en Administración',
        org: 'Universidad de Brasilia (UnB)',
        summary:
          'La base en gestión, investigación y pensamiento crítico, que sigue siendo importante hoy. Junto con la formación en sistemas, forma la combinación de negocio y tecnología que llevo al trabajo.',
        highlight: 'Ingreso a los 17 años',
        points: [
          'Trabajo de fin de carrera con calificación SS, la máxima. En la evaluación recibí elogios y la sugerencia de considerar un máster.',
          'Monitoría, comisión organizadora de un evento y artículo presentado en un congreso: ver «Actividades académicas».',
        ],
      },
    },
  },
  projects: {
    title: 'Proyecto',
    intro: 'Un proyecto personal en C#, abierto en GitHub.',
    allLabel: 'Ver todos los repositorios',
    items: {
      ihaircare: {
        name: 'iHairCare Backend API',
        summary:
          'API RESTful para gestionar cronogramas de tratamientos capilares (crear, actualizar, listar y eliminar), con MongoDB. Arquitectura limpia en capas (API, Core e Infra), principios SOLID, documentación en Swagger y la cadena de conexión fuera del código, en una variable de entorno.',
      },
    },
  },
  academic: {
    title: 'Actividades académicas',
    intro:
      'Investigación, apoyo a la docencia y organización de eventos durante el grado en la UnB.',
    publicationLabel: 'Publicación',
    publication: {
      titleGloss:
        'Evolución de la investigación en GSCM: una revisión bibliométrica de 2018 a 2020',
      glossLabel: 'Traducción libre',
      eventLabel: 'Presentado en',
      authorsLabel: 'Autores',
      role: 'Autora principal',
      summary:
        'Revisión bibliométrica sobre la evolución de la investigación en GSCM entre 2018 y 2020, desarrollada en la asignatura de Logística Organizacional, en el segundo semestre de 2020.',
    },
    activitiesLabel: 'Voluntariado',
    activities: {
      monitoria: {
        title: 'Monitora voluntaria de Teoría Política Moderna',
        org: 'Universidad de Brasilia',
        summary: 'Apoyo a la profesora responsable de la asignatura y a los estudiantes.',
        points: [
          'Corrección de trabajos y registro de notas en hojas de seguimiento.',
          'Resolución de dudas de los estudiantes.',
        ],
      },
      organizingCommittee: {
        title: 'Comisión organizadora de la Semana Académica de Administración 2021',
        org: 'Universidad de Brasilia',
        summary: 'Integrante voluntaria de la comisión organizadora.',
        points: [
          'Apoyo a la organización de los eventos en línea.',
          'Host y co-host en la apertura y en la clausura.',
        ],
      },
    },
  },
  easter: {
    turbo: 'Modo turbo activado 🚀',
    rocketRain: '¡Lluvia de cohetes! 🚀',
    moonOn: 'Salió la luna 🌙',
    nameGlow: 'Sabes mi nombre 💜',
    wish: 'Pediste un deseo ✨',
    shootingStarLabel: 'Estrella fugaz: haz clic para pedir un deseo',
    dizzy: 'Tranquilo, el planeta está mareado 🌍',
    constellation: 'Encontraste la Estrella de Esther ✨',
    trailOn: 'Polvo estelar activado ✨',
    trailOff: 'Polvo estelar desactivado',
    themes: {
      aurora: 'Tema aurora',
      sunset: 'Tema atardecer 🌅',
      terminal: 'Tema terminal 💻',
    },
    greeting: {
      dawn: '¡Buenas madrugadas! Por ahí son las {time}. Hora de mirar las estrellas ✨',
      morning: '¡Buenos días! Por ahí son las {time}. El sol ya pasó por aquí ☀️',
      afternoon: '¡Buenas tardes! Por ahí son las {time}. Estás en tu casa 🌎',
      evening:
        '¡Buenas noches! Por ahí son las {time}. Las luces de la Tierra ya se encendieron 🌃',
    },
    markers: {
      brasilia: { title: 'Brasilia', detail: 'Brasil · UnB y UniCEUB' },
      santander: { title: 'Santander', detail: 'España · donde aprendí a leer y escribir' },
    },
    boardTitle: 'Pistas',
    hints: {
      turbo:
        'Un código legendario de los videojuegos de los 80 hace despegar este planeta. En el móvil, quizá mi nombre sepa algo.',
      rain: 'Escribe el nombre de lo que sube al espacio con fuego en la cola y mira qué cae del cielo.',
      moon: 'Cuando el cielo está vacío, escribe el nombre de nuestra compañera de las noches.',
      name: 'Mi nombre también es una contraseña. Escríbelo.',
      wish: 'Cuando algo cruza el cielo, todos piden algo. Llama a uno escribiendo lo que es.',
      theme: 'El monograma de arriba guarda más de un color. Insiste en él.',
      constellation:
        'En una esquina del cielo, cinco puntitos esperan a quien sepa dibujarlos de un solo trazo.',
      dizzy: 'A la Tierra no le gusta que la toquen muchas veces seguidas.',
      trail:
        'El polvo de estrellas que sigue al ratón obedece a una tecla. Pista: es la inicial de «stardust».',
    },
    counterLabel: 'Secretos descubiertos',
    hintsDone: 'Descubriste todos los secretos que traen pista. Gracias por explorar 💜',
    consoleHello: '¿Curioso/a, eh? Me alegra que hayas abierto la consola 👀',
    consoleCta: 'Hablemos →',
  },
  notFound: {
    title: 'Houston, hemos perdido la señal',
    text: 'Esta página se salió de órbita (error 404).',
    back: 'Volver a la Tierra',
  },
};
