export type Locale = 'pt-BR' | 'en';

export type HttpsUrl = `https://${string}`;

/** Hosts permitidos como destino de links externos (allowlist). */
export type AllowedHost = 'www.linkedin.com' | 'github.com' | 'lattes.cnpq.br';

export type LinkId = 'linkedin' | 'github' | 'lattes';

export type IconName = 'briefcase' | 'code' | 'book' | 'arrow';

export interface LinkTarget {
  /** Preenchido quando o mesmo perfil existe em mais de um idioma. */
  readonly locale?: Locale;
  readonly href: HttpsUrl;
}

export interface ProfileLink {
  readonly id: LinkId;
  readonly host: AllowedHost;
  readonly icon: IconName;
  /** Um alvo = card inteiro clicável; dois ou mais = card com seletor de idioma. */
  readonly targets: readonly [LinkTarget, ...LinkTarget[]];
}
