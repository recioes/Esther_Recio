export type Locale = 'pt-BR' | 'en' | 'es';

export type HttpsUrl = `https://${string}`;

/** Hosts permitidos como destino de links externos (allowlist). */
export type AllowedHost = 'www.linkedin.com' | 'github.com' | 'lattes.cnpq.br';

export type LinkId = 'linkedin' | 'github' | 'lattes';

export type IconName = 'briefcase' | 'code' | 'book' | 'arrow';

export interface ProfileLink {
  readonly id: LinkId;
  readonly host: AllowedHost;
  readonly icon: IconName;
  readonly href: HttpsUrl;
}

export type TimelineId =
  | 'zenvia'
  | 'clearsale'
  | 'uniceub'
  | 'americanas'
  | 'afinidade'
  | 'nis'
  | 'afinidadeIntern'
  | 'firz'
  | 'interpreter'
  | 'unb';

export type TimelineKind = 'work' | 'education';

/** Mês no formato AAAA-MM. Os períodos são formatados por idioma em `lib/period.ts`. */
export type YearMonth = `${number}-${number}`;

export interface TimelineEntry {
  readonly id: TimelineId;
  readonly kind: TimelineKind;
  readonly start: YearMonth;
  /** Ausente = em andamento (ou pontual, quando não há `current`). */
  readonly end?: YearMonth;
  readonly current?: boolean;
  readonly tags?: readonly string[];
}

export type LanguageId = 'pt' | 'es' | 'en';

export type LanguageLevel = 'native' | 'fluent';

export interface LanguageEntry {
  readonly id: LanguageId;
  readonly level: LanguageLevel;
}

export type ActivityId = 'monitoria' | 'organizingCommittee';

export interface ActivityEntry {
  readonly id: ActivityId;
  readonly start: YearMonth;
  readonly end: YearMonth;
}

export interface Publication {
  /** Título original, em português (dado bibliográfico: não se traduz). */
  readonly title: string;
  readonly event: string;
  /** Data da apresentação (AAAA-MM-DD). */
  readonly date: `${number}-${number}-${number}`;
  /** Na ordem da publicação; a primeira é a autora principal. */
  readonly authors: readonly string[];
}
