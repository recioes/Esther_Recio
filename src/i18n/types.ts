import type {
  ActivityId,
  LanguageId,
  LanguageLevel,
  LinkId,
  Locale,
  TimelineId,
} from '../data/types';
import type { DayPeriod } from '../lib/greeting';
import type { MarkerId } from '../lib/markers';
import type { ThemeId } from '../lib/themes';

export interface LinkCopy {
  readonly label: string;
  readonly description: string;
}

/** Resumo profissional (id "sobre"). */
export interface AboutCopy {
  readonly title: string;
  /** Frase de posicionamento, em destaque. */
  readonly lead: string;
  readonly paragraphs: readonly string[];
}

export interface LanguageCopy {
  readonly name: string;
  readonly detail: string;
}

export interface LanguagesCopy {
  readonly title: string;
  readonly intro: string;
  readonly levels: Readonly<Record<LanguageLevel, string>>;
  readonly items: Readonly<Record<LanguageId, LanguageCopy>>;
  /** Diferencia a vivência multicultural da experiência profissional. */
  readonly note: string;
}

export interface TimelineCopy {
  readonly title: string;
  readonly org: string;
  readonly summary: string;
  /** Destaque curto exibido como selo (opcional). */
  readonly highlight?: string;
  /** Contribuições concretas, em lista (opcional). */
  readonly points?: readonly string[];
}

export interface TimelineSectionCopy {
  readonly title: string;
  readonly intro: string;
  readonly cue: string;
  readonly present: string;
  readonly currentLabel: string;
  readonly kindLabels: { readonly work: string; readonly education: string };
  readonly items: Readonly<Record<TimelineId, TimelineCopy>>;
}

export interface ActivityCopy {
  readonly title: string;
  readonly org: string;
  readonly summary: string;
  readonly points: readonly string[];
}

export interface AcademicCopy {
  readonly title: string;
  readonly intro: string;
  readonly publicationLabel: string;
  readonly publication: {
    /** Tradução livre do título, para quem não lê português. Vazio em pt-BR. */
    readonly titleGloss: string;
    readonly glossLabel: string;
    readonly eventLabel: string;
    readonly authorsLabel: string;
    readonly role: string;
    readonly summary: string;
  };
  readonly activitiesLabel: string;
  readonly activities: Readonly<Record<ActivityId, ActivityCopy>>;
}

export interface MarkerCopy {
  readonly title: string;
  readonly detail: string;
}

/** Textos dos easter eggs. `{time}` em `greeting` é trocado pela hora local do visitante. */
export interface EasterCopy {
  readonly turbo: string;
  readonly rocketRain: string;
  readonly moonOn: string;
  readonly nameGlow: string;
  readonly wish: string;
  readonly shootingStarLabel: string;
  readonly dizzy: string;
  readonly constellation: string;
  readonly trailOn: string;
  readonly trailOff: string;
  readonly themes: Readonly<Record<ThemeId, string>>;
  readonly greeting: Readonly<Record<DayPeriod, string>>;
  readonly markers: Readonly<Record<MarkerId, MarkerCopy>>;
  /** Linhas impressas no console do navegador (o link do LinkedIn vem depois). */
  readonly consoleHello: string;
  readonly consoleCta: string;
}

export interface NotFoundCopy {
  readonly title: string;
  readonly text: string;
  readonly back: string;
}

export interface Dictionary {
  readonly locale: Locale;
  readonly htmlLang: string;
  /** '' para o idioma padrão (raiz do site); demais idiomas ficam em /<slug>/. */
  readonly slug: string;
  readonly shortName: string;
  readonly title: string;
  readonly description: string;
  readonly ogImageAlt: string;
  readonly role: string;
  readonly linksLabel: string;
  readonly languageSwitchLabel: string;
  readonly languageNames: Readonly<Record<Locale, string>>;
  readonly newTabHint: string;
  readonly globeHint: string;
  readonly links: Readonly<Record<LinkId, LinkCopy>>;
  readonly about: AboutCopy;
  readonly languages: LanguagesCopy;
  readonly timeline: TimelineSectionCopy;
  readonly academic: AcademicCopy;
  readonly easter: EasterCopy;
  readonly notFound: NotFoundCopy;
}
