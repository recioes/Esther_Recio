import type { ProfileLink } from '../data/types';

function parseUrl(href: string): URL | undefined {
  try {
    return new URL(href);
  } catch {
    return undefined;
  }
}

function validateHref(link: ProfileLink, href: string): string[] {
  const url = parseUrl(href);
  if (!url) return [`${link.id}: URL inválida (${href})`];

  const errors: string[] = [];
  if (url.protocol !== 'https:') {
    errors.push(`${link.id}: o protocolo deve ser https (${href})`);
  }
  if (url.hostname !== link.host) {
    errors.push(`${link.id}: host "${url.hostname}" difere do permitido "${link.host}"`);
  }
  return errors;
}

/** Retorna a lista de problemas; lista vazia = todos os destinos são válidos. */
export function validateLinks(links: readonly ProfileLink[]): string[] {
  return links.flatMap((link) => validateHref(link, link.href));
}

/** Falha o build quando algum link foge da allowlist. */
export function assertValidLinks(links: readonly ProfileLink[]): void {
  const errors = validateLinks(links);
  if (errors.length > 0) {
    throw new Error(`Links inválidos:\n${errors.join('\n')}`);
  }
}
