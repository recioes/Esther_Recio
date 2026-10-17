// Guarda de segurança pós-build: falha se o HTML gerado violar os controles do ADR-0001.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));
const OWN_ORIGIN = 'https://recioes.github.io';

async function listHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}

function openingTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : undefined;
}

function externalSubresources(html) {
  const tags = [
    ...openingTags(html, 'script'),
    ...openingTags(html, 'img'),
    ...openingTags(html, 'source'),
    ...openingTags(html, 'video'),
    ...openingTags(html, 'iframe'),
    ...openingTags(html, 'link').filter((tag) =>
      /rel\s*=\s*["']?(stylesheet|preload|modulepreload|icon|preconnect)/i.test(tag),
    ),
  ];
  return tags.filter((tag) => {
    const url = attr(tag, 'src') ?? attr(tag, 'href') ?? '';
    return /^(https?:)?\/\//i.test(url) && !isOwnOrigin(url);
  });
}

// Compara a origem já parseada: um prefixo de string aceitaria "https://recioes.github.io.evil.com".
function isOwnOrigin(url) {
  try {
    return new URL(url, OWN_ORIGIN).origin === OWN_ORIGIN;
  } catch {
    return false;
  }
}

function unsafeBlankTargets(html) {
  return openingTags(html, 'a').filter((tag) => {
    if (attr(tag, 'target') !== '_blank') return false;
    const rel = (attr(tag, 'rel') ?? '').toLowerCase().split(/\s+/);
    return !(rel.includes('noopener') && rel.includes('noreferrer'));
  });
}

const CHECKS = [
  {
    name: 'meta Content-Security-Policy presente',
    failures: (html) => (/http-equiv=["']?Content-Security-Policy/i.test(html) ? [] : ['ausente']),
  },
  {
    name: 'CSP exige Trusted Types',
    failures: (html) =>
      /require-trusted-types-for 'script'/.test(html) && /trusted-types 'none'/.test(html)
        ? []
        : ['ausente'],
  },
  {
    name: "CSP sem 'unsafe-inline' / 'unsafe-eval'",
    failures: (html) => (/unsafe-(inline|eval)/i.test(html) ? ['encontrado'] : []),
  },
  {
    name: 'sem <style> inline',
    failures: (html) => openingTags(html, 'style'),
  },
  {
    name: 'sem atributo style="..."',
    failures: (html) => html.match(/\sstyle\s*=\s*["']/gi) ?? [],
  },
  {
    name: 'sem <script> inline',
    failures: (html) => openingTags(html, 'script').filter((tag) => attr(tag, 'src') === undefined),
  },
  {
    name: 'sem handlers inline (onclick etc.)',
    failures: (html) => html.match(/\son[a-z]+\s*=\s*["']/gi) ?? [],
  },
  {
    name: 'sem URLs javascript:',
    failures: (html) => html.match(/javascript:/gi) ?? [],
  },
  {
    name: 'sem recursos de terceiros (script, img, vídeo, css, fonte)',
    failures: externalSubresources,
  },
  {
    name: 'target="_blank" sempre com rel="noopener noreferrer"',
    failures: unsafeBlankTargets,
  },
  {
    name: 'prévia de compartilhamento (og:image 1200×630 e twitter:card grande)',
    failures: (html) => {
      const problems = [];
      if (
        !/<meta[^>]+property=["']og:image["'][^>]+content=["']https:\/\/[^"']+og-image\.jpg["']/i.test(
          html,
        )
      ) {
        problems.push('og:image ausente ou fora do padrão');
      }
      if (!/og:image:width["'][^>]+content=["']1200["']/i.test(html))
        problems.push('og:image:width');
      if (!/og:image:height["'][^>]+content=["']630["']/i.test(html))
        problems.push('og:image:height');
      if (!/twitter:card["'][^>]+content=["']summary_large_image["']/i.test(html)) {
        problems.push('twitter:card');
      }
      return problems;
    },
  },
  {
    name: 'atributo lang no <html>',
    failures: (html) => (/<html\b[^>]*\slang=["']?[a-z]{2}/i.test(html) ? [] : ['ausente']),
  },
];

// Ordem esperada das camadas de CSS (a mesma declarada em src/styles/*.css).
// O minificador reordena blocos @layer; se a ordem sair errada, "reset" passa por cima dos componentes.
const EXPECTED_LAYER_ORDER = ['reset', 'tokens', 'base', 'components', 'utilities'];

async function listCssFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.name.endsWith('.css'))
    .map((entry) => join(dir, entry.name));
}

function layerOrderProblems(css) {
  const seen = [];
  for (const match of css.matchAll(/@layer\s+([a-z-]+)\s*\{/gi)) {
    const name = match[1];
    if (name && !seen.includes(name)) seen.push(name);
  }
  const expected = EXPECTED_LAYER_ORDER.filter((name) => seen.includes(name));
  const sameOrder =
    seen.length === expected.length && seen.every((name, i) => name === expected[i]);
  return sameOrder
    ? []
    : [`ordem encontrada: ${seen.join(' < ')}; esperada: ${expected.join(' < ')}`];
}

const files = await listHtmlFiles(DIST_DIR);
if (files.length === 0) {
  console.error('verify-dist: nenhum HTML encontrado em dist/ (rode o build antes).');
  process.exit(1);
}

let failed = false;

// Currículos: cada idioma precisa ter o PDF publicado, com exatamente uma página.
// Nomes fixos de propósito: este script não importa TypeScript (roda em qualquer Node >= 22).
// tests/unit/cv.test.ts garante que src/data/cv.ts usa os mesmos nomes.
const CV_FILES = ['pt-BR', 'en', 'es'].map((locale) => `Esther-Recio-CV-${locale}.pdf`);
for (const fileName of CV_FILES) {
  const label = `dist/cv/${fileName}`;
  try {
    const pdf = (await readFile(join(DIST_DIR, 'cv', fileName))).toString('latin1');
    const pages = pdf.match(/\/Type\s*\/Page(?![a-zA-Z])/g)?.length ?? 0;
    if (!pdf.startsWith('%PDF-') || pages !== 1) {
      failed = true;
      console.error(
        `✗ ${label}: esperado um PDF de 1 página (encontrado: ${pages}). Rode npm run cv.`,
      );
    }
  } catch {
    failed = true;
    console.error(`✗ ${label}: arquivo ausente. Rode npm run cv e versione o PDF.`);
  }
}

const cssFiles = await listCssFiles(join(DIST_DIR, '_astro'));
for (const file of cssFiles) {
  const problems = layerOrderProblems(await readFile(file, 'utf8'));
  if (problems.length > 0) {
    failed = true;
    console.error(`✗ ${file.replace(DIST_DIR, 'dist/')}: ordem das camadas CSS`);
    for (const problem of problems) console.error(`    ${problem}`);
  }
}

for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const check of CHECKS) {
    const failures = check.failures(html);
    if (failures.length > 0) {
      failed = true;
      console.error(`✗ ${file.replace(DIST_DIR, 'dist/')}: ${check.name}`);
      for (const failure of failures) console.error(`    ${String(failure).slice(0, 200)}`);
    }
  }
}

if (failed) process.exit(1);
console.log(`verify-dist: ${files.length} página(s) OK, ${CHECKS.length} verificações cada.`);
