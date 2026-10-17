import type { APIRoute } from 'astro';
import { dictionaries, pagePath } from '../i18n';
import { joinBase } from '../lib/base-path';

/** Sitemap com as três versões do idioma ligadas por hreflang (a 404 fica de fora). */
export const GET: APIRoute = ({ site }) => {
  const absolute = (path: string): string =>
    new URL(joinBase(import.meta.env.BASE_URL, path), site).href;
  const pages = Object.values(dictionaries);
  const alternates = pages
    .map(
      (page) =>
        `    <xhtml:link rel="alternate" hreflang="${page.htmlLang}" href="${absolute(pagePath(page))}"/>`,
    )
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute('')}"/>`)
    .join('\n');
  const urls = pages
    .map((page) => `  <url>\n    <loc>${absolute(pagePath(page))}</loc>\n${alternates}\n  </url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
