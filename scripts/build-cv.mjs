// Gera os currículos em PDF (uma página A4 por idioma) a partir de src/data/cv.ts.
// Uso: npm run cv                       -> os 3 currículos oficiais, versionados em public/cv/
//      npm run cv -- --variant=<id>     -> versão por vaga em cv-variants/<id>/ (fora do site; ver cv-variants.ts)
//      npm run cv -- --list             -> lista as variantes
// Precisa de Edge ou Chrome instalado.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CV, CV_CONTACT } from '../src/data/cv.ts';
import { CV_VARIANTS } from '../src/data/cv-variants.ts';

const variantArg = process.argv.find((arg) => arg.startsWith('--variant='))?.split('=')[1];

if (process.argv.includes('--list')) {
  console.log(CV_VARIANTS.map((variant) => variant.id).join('\n'));
  process.exit(0);
}

const variant = variantArg ? CV_VARIANTS.find((item) => item.id === variantArg) : undefined;
if (variantArg && !variant) {
  console.error(`Variante desconhecida: ${variantArg}. Use --list.`);
  process.exit(1);
}

const OUT_DIR = fileURLToPath(
  new URL(variant ? `../cv-variants/${variant.id}/` : '../public/cv/', import.meta.url),
);

const pick = (list, order) => order.map((index) => list[index]);

/** Aplica a variante: só reordena e troca título/resumo, sem criar conteúdo novo. */
function applyVariant(cv, locale) {
  if (!variant) return cv;
  const [current, ...rest] = cv.experience;
  return {
    ...cv,
    headline: variant.headline[locale],
    summary: variant.summary[locale],
    skills: pick(cv.skills, variant.skillOrder),
    experience: [{ ...current, bullets: pick(current.bullets, variant.currentRoleOrder) }, ...rest],
  };
}

const BROWSERS = [
  process.env.CV_BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function findBrowser() {
  const found = BROWSERS.find((path) => path && existsSync(path));
  if (!found) throw new Error('Nenhum Edge/Chrome encontrado. Defina CV_BROWSER com o caminho.');
  return found;
}

const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Currículo é lido por ATS e por pessoas: coluna única, texto real, sem ícones nem imagens.
const STYLE = `
  @page { size: A4; margin: 10mm 13mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #1a1a1f; font: 9.3pt/1.35 Calibri, "Segoe UI", Arial, sans-serif; }
  h1 { margin: 0; font-size: 21pt; letter-spacing: -0.01em; line-height: 1.1; }
  .headline { margin: 1px 0 0; color: #5b3ea8; font-size: 10.5pt; font-weight: 600; }
  .contact { margin: 3px 0 0; color: #3a3a44; font-size: 9.2pt; }
  .contact a { color: inherit; text-decoration: none; }
  .contact span + span::before { content: "  |  "; color: #9a9aa5; }
  h2 { margin: 10px 0 3px; padding-bottom: 1px; border-bottom: 1px solid #5b3ea8; color: #5b3ea8;
       font-size: 9.6pt; letter-spacing: 0.07em; text-transform: uppercase; }
  p, ul { margin: 0; }
  .summary { margin-top: 2px; }
  .skills { display: grid; gap: 1px; }
  .skills b, .earlier b { font-weight: 700; }
  .role { margin-top: 5px; break-inside: avoid; }
  .role:first-of-type { margin-top: 2px; }
  .role__head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
  .role__title { font-weight: 700; font-size: 10.4pt; }
  .role__org { font-weight: 600; color: #3a3a44; }
  .role__period { color: #3a3a44; white-space: nowrap; font-size: 9.2pt; }
  .role__highlight { color: #5b3ea8; font-style: italic; font-size: 9.2pt; }
  ul { padding-left: 13px; }
  li { margin-top: 0.8px; padding-left: 1px; }
  .edu { display: flex; justify-content: space-between; gap: 8px; margin-top: 2px; }
  .edu__period { white-space: nowrap; color: #3a3a44; font-size: 9.2pt; }
  .earlier { margin-top: 5px; }
`;

function renderHtml(cv) {
  const { headings } = cv;
  const contact = [...CV_CONTACT.items, ...CV_CONTACT.links]
    .map((item) =>
      item.href
        ? `<span><a href="${item.href}">${escapeHtml(item.label)}</a></span>`
        : `<span>${escapeHtml(item.label)}</span>`,
    )
    .join('');

  const roles = cv.experience
    .map(
      (role) => `
    <div class="role">
      <div class="role__head">
        <span><span class="role__title">${escapeHtml(role.title)}</span> · <span class="role__org">${escapeHtml(role.org)}</span></span>
        <span class="role__period">${escapeHtml(role.period)}</span>
      </div>
      ${role.highlight ? `<div class="role__highlight">${escapeHtml(role.highlight)}</div>` : ''}
      <ul>${role.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>
    </div>`,
    )
    .join('');

  const education = cv.education
    .map(
      (item) => `
    <div class="edu">
      <span><b>${escapeHtml(item.title)}</b> · ${escapeHtml(item.org)}. ${escapeHtml(item.note)}</span>
      <span class="edu__period">${escapeHtml(item.period)}</span>
    </div>`,
    )
    .join('');

  const additional = cv.additional
    ? `<h2>${escapeHtml(headings.additional)}</h2><ul>${cv.additional
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join('')}</ul>`
    : '';

  return `<!doctype html>
<html lang="${cv.htmlLang}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(CV_CONTACT.name)} — CV</title>
<style>${STYLE}</style>
</head>
<body>
  <h1>${escapeHtml(CV_CONTACT.name)}</h1>
  <p class="headline">${escapeHtml(cv.headline)}</p>
  <p class="contact">${contact}</p>

  <h2>${escapeHtml(headings.summary)}</h2>
  <p class="summary">${escapeHtml(cv.summary)}</p>

  <h2>${escapeHtml(headings.skills)}</h2>
  <div class="skills">${cv.skills
    .map((group) => `<div><b>${escapeHtml(group.label)}:</b> ${escapeHtml(group.items)}</div>`)
    .join('')}</div>

  <h2>${escapeHtml(headings.experience)}</h2>
  ${roles}
  <p class="earlier"><b>${escapeHtml(cv.earlier.label)}:</b> ${escapeHtml(cv.earlier.text)}</p>

  <h2>${escapeHtml(headings.education)}</h2>
  ${education}

  <h2>${escapeHtml(headings.languages)}</h2>
  <p>${escapeHtml(cv.languages)}</p>

  <h2>${escapeHtml(headings.academic)}</h2>
  <ul>${cv.academic.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>

  <h2>${escapeHtml(headings.projects)}</h2>
  <p>${escapeHtml(cv.projects)}</p>
  ${additional}
</body>
</html>`;
}

/**
 * O Chromium grava o próprio user agent (navegador, versão e sistema operacional de quem gerou)
 * no campo /Creator do PDF. Troca por um texto neutro do mesmo tamanho em bytes, para não
 * deslocar a tabela de referências (xref) do arquivo.
 */
export function scrubPdfCreator(pdf) {
  const text = pdf.toString('latin1');
  const scrubbed = text.replace(/\/Creator \(((?:[^()\\]|\\.)*)\)/g, (_match, inner) => {
    const neutral = 'Esther Recio CV'.slice(0, inner.length).padEnd(inner.length, ' ');
    return `/Creator (${neutral})`;
  });
  return Buffer.from(scrubbed, 'latin1');
}

/** Conta as páginas pelo dicionário de páginas do PDF (suficiente para um PDF gerado pelo Chromium). */
export function countPdfPages(pdf) {
  const text = pdf.toString('latin1');
  return [...text.matchAll(/\/Type\s*\/Page(?![a-zA-Z])/g)].length;
}

const browser = findBrowser();
const workDir = mkdtempSync(join(tmpdir(), 'cv-'));
mkdirSync(OUT_DIR, { recursive: true });
let failed = false;

try {
  for (const [locale, base] of Object.entries(CV)) {
    const cv = applyVariant(base, locale);
    const htmlPath = join(workDir, `${cv.fileName}.html`);
    const pdfPath = join(OUT_DIR, cv.fileName);
    writeFileSync(htmlPath, renderHtml(cv), 'utf8');
    execFileSync(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        `--user-data-dir=${join(workDir, 'profile')}`,
        `--print-to-pdf=${pdfPath}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: 'ignore' },
    );
    const clean = scrubPdfCreator(readFileSync(pdfPath));
    writeFileSync(pdfPath, clean);
    const pages = countPdfPages(clean);
    const ok = pages === 1;
    failed ||= !ok;
    console.log(`${ok ? '✓' : '✗'} ${cv.fileName}: ${pages} página(s)`);
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

if (failed) {
  console.error('Algum currículo passou de uma página: encurte o texto em src/data/cv.ts.');
  process.exit(1);
}
