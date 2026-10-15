import type { LinkId, Locale, TimelineId } from '../data/types';
import type { DayPeriod } from '../lib/greeting';
import type { MarkerId } from '../lib/markers';
import type { ThemeId } from '../lib/themes';

export interface LinkCopy {
  readonly label: string;
  readonly description: string;
}

export interface TimelineCopy {
  readonly period: string;
  readonly title: string;
  readonly org: string;
  readonly summary: string;
  /** Destaque curto exibido como selo (opcional). */
  readonly highlight?: string;
}

export interface TimelineSectionCopy {
  readonly title: string;
  readonly intro: string;
  readonly cue: string;
  readonly currentLabel: string;
  readonly items: Readonly<Record<TimelineId, TimelineCopy>>;
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
  readonly moonOff: string;
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
  readonly timeline: TimelineSectionCopy;
  readonly easter: EasterCopy;
  readonly notFound: NotFoundCopy;
}
