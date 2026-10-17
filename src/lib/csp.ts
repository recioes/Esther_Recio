/**
 * Content-Security-Policy entregue via <meta>, pois o GitHub Pages não permite headers.
 * Limitações do <meta>: não suporta frame-ancestors, report-uri nem sandbox.
 */
const DIRECTIVES: Readonly<Record<string, readonly string[]>> = {
  'default-src': ["'none'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'"],
  'media-src': ["'self'"],
  'font-src': ["'self'"],
  'connect-src': ["'none'"],
  'base-uri': ["'none'"],
  'form-action': ["'none'"],
  // Trusted Types: o navegador recusa HTML/script vindo de string (innerHTML, eval de string
  // etc.), mesmo que algum código novo ou dependência tente. Nenhuma política é permitida.
  'require-trusted-types-for': ["'script'"],
  'trusted-types': ["'none'"],
  'upgrade-insecure-requests': [],
};

export const CONTENT_SECURITY_POLICY: string = Object.entries(DIRECTIVES)
  .map(([name, values]) => [name, ...values].join(' '))
  .join('; ');
