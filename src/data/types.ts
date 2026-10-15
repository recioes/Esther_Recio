export type Locale = 'pt-BR' | 'en';

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
  | 'interpreter'
  | 'unb';

export type TimelineKind = 'work' | 'education';

export interface TimelineEntry {
  readonly id: TimelineId;
  readonly kind: TimelineKind;
  /** Em andamento: o marcador pulsa. */
  readonly current?: boolean;
  readonly tags?: readonly string[];
}
