// QA ponta a ponta dos easter eggs, das pistas e do layout em celular.
// Uso: npm run build && npm run qa        (precisa de Edge ou Chrome; não usa a rede)
//      npm run qa -- --only=mobile,order   (só algumas seções)
// Sai com código 1 se qualquer verificação (✗) falhar. Avisos (⚠) não derrubam o teste.
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONSTELLATION_ORDER } from '../../src/lib/constellation.ts';
import { launchBrowser, serveDist, sleep } from './cdp.mjs';

const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));
const SHOTS = join(tmpdir(), 'qa-shots');
mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const log = (mark, text) => console.log(`${mark} ${text}`);
const pass = (text) => log('✓', text);
const warn = (text) => log('⚠', text);
function check(condition, text, detail = '') {
  if (condition) pass(text);
  else {
    failures += 1;
    log('✗', `${text}${detail ? `  [${detail}]` : ''}`);
  }
  return condition;
}

// Cada idioma tem a sua rota e os seus textos; o QA roda o jogo inteiro em todos.
const LOCALES = {
  'pt-BR': {
    path: '',
    lang: 'pt-BR',
    board: 'Pistas',
    counter: 'Segredos descobertos',
    done: 'Obrigada',
  },
  en: { path: 'en/', lang: 'en', board: 'Clues', counter: 'Secrets found', done: 'Thanks' },
  es: {
    path: 'es/',
    lang: 'es',
    board: 'Pistas',
    counter: 'Secretos descubiertos',
    done: 'Gracias',
  },
};

const ALL_EGGS = [
  'turbo',
  'rain',
  'moon',
  'name',
  'wish',
  'theme',
  'constellation',
  'dizzy',
  'trail',
];
const TOUCH_EGGS = ['turbo', 'theme', 'constellation', 'dizzy'];

/** Estado visível e persistido do quadro de pistas. */
const readState = (page) =>
  page.eval(`(() => {
    const store = (key) => (sessionStorage.getItem(key) || '').split(',').filter(Boolean);
    const toggle = document.querySelector('.egg-board__toggle');
    return {
      found: store('found-eggs'),
      clues: store('egg-clues'),
      counter: toggle ? toggle.querySelector('[aria-hidden]')?.textContent ?? '' : '',
      boardVisible: !!document.querySelector('.egg-board') && !document.querySelector('.egg-board').hidden,
      open: toggle?.getAttribute('aria-expanded') === 'true',
      items: [...document.querySelectorAll('.egg-board__list li')].map((li) => ({
        text: li.textContent, done: li.dataset.done, last: li.classList.contains('is-new'), final: li.classList.contains('egg-board__done'),
      })),
    };
  })()`);

/**
 * Invariante do quadro, conferido depois de cada passo: o quadro é o retrato fiel do progresso.
 * - todo segredo achado aparece riscado (mesmo achado fora da ordem das pistas);
 * - toda pista riscada é de um segredo achado, e toda pendente é de um não achado;
 * - nenhuma pista aparece duas vezes.
 */
async function boardMatchesProgress(page, label) {
  const s = await readState(page);
  const entries = s.clues.map((egg, index) => ({ egg, done: s.items[index]?.done === 'true' }));
  const shownDone = new Set(entries.filter((e) => e.done).map((e) => e.egg));
  const notShown = s.found.filter((egg) => !shownDone.has(egg));
  const wrong = entries.filter((e) => e.done !== s.found.includes(e.egg)).map((e) => e.egg);
  const dupes = s.clues.filter((egg, index) => s.clues.indexOf(egg) !== index);
  return check(
    notShown.length === 0 && wrong.length === 0 && dupes.length === 0,
    `${label}: o quadro mostra exatamente o que foi achado`,
    `achados fora do quadro=${notShown} marcação errada=${wrong} repetidas=${dupes}`,
  );
}

const pendingOf = (s) => s.clues.filter((_egg, index) => s.items[index]?.done !== 'true');

async function emptyGlobePoint(page) {
  return page.eval(`(() => {
    const w = innerWidth, h = innerHeight;
    for (const [fx, fy] of [[0.04, 0.5], [0.96, 0.5], [0.5, 0.02], [0.04, 0.3], [0.96, 0.3], [0.5, 0.98]]) {
      const x = w * fx, y = h * fy;
      const el = document.elementFromPoint(x, y);
      if (el && !el.closest('a, button, [data-no-drag], [data-no-tap], .constellation, .egg-board, .language-switch')) return { x, y };
    }
    return null;
  })()`);
}

async function boxOf(page, selector, index = 0) {
  const box = await page.box(selector, index);
  if (!box) throw new Error(`elemento não encontrado: ${selector}`);
  return box;
}

async function konami(page) {
  for (const key of [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ]) {
    await page.key(key);
  }
}

async function doConstellation(page) {
  for (const index of CONSTELLATION_ORDER) {
    const star = await boxOf(page, '.constellation__star', index);
    await page.pointer(star.x, star.y);
    await sleep(60);
  }
}

async function tapMonogram(page, times = 5) {
  const mono = await boxOf(page, '.hero__monogram');
  for (let i = 0; i < times; i += 1) {
    await page.pointer(mono.x, mono.y);
    await sleep(80);
  }
}

async function tapGlobe(page, times = 5) {
  const point = await emptyGlobePoint(page);
  if (!point) return false;
  for (let i = 0; i < times; i += 1) {
    await page.pointer(point.x, point.y);
    await sleep(90);
  }
  return true;
}

// Cada segredo só é "achado" quando o visitante faz exatamente o que a pista descreve.
// Este mapa é o contrato: uma pista que aponta para uma ação que não marca o segredo é bug.
const ACTIONS = {
  turbo: (page) => konami(page),
  rain: (page) => page.type('foguete'),
  moon: (page) => page.type('lua'),
  name: (page) => page.type('esther'),
  wish: (page) => page.type('estrela'),
  theme: (page) => tapMonogram(page),
  constellation: (page) => doConstellation(page),
  dizzy: (page) => tapGlobe(page),
  trail: async (page) => {
    await sleep(1200);
    await page.key('s');
  },
};

async function desktopScenarios(browser, root, locale) {
  const copy = LOCALES[locale];
  const base = root + copy.path;
  console.log(`\n── Desktop ${locale} (1280×800, mouse e teclado) ──`);
  const page = await browser.newPage();
  await page.emulate({ width: 1280, height: 800 });
  await page.goto(base);
  check(
    (await page.eval('document.documentElement.lang')) === copy.lang,
    `a página abre em ${locale}`,
  );
  const globe = await page.waitGlobe();
  if (!globe) warn('WebGL indisponível neste ambiente: o cenário da Terra tonta será pulado.');

  const before = await readState(page);
  check(!before.boardVisible, 'o quadro de pistas começa escondido (nenhum segredo achado)');

  let previousPending = [];
  const found = [];
  for (const egg of ALL_EGGS) {
    if (egg === 'dizzy' && !globe) continue;
    await ACTIONS[egg](page);
    await sleep(500);
    const state = await readState(page);
    found.push(egg);
    check(
      state.found.includes(egg),
      `${egg}: marcado como achado ao fazer o que a pista descreve`,
      `found=${state.found}`,
    );
    check(
      state.boardVisible && state.counter.includes(`${found.length}/`),
      `${egg}: contador mostra ${found.length}`,
      state.counter,
    );
    // Cada primeira descoberta libera exatamente 1 pista pendente nova (se ainda houver segredo sem pista).
    const pendingNow = pendingOf(state);
    const fresh = pendingNow.filter((id) => !previousPending.includes(id));
    const anyLeft = ALL_EGGS.some(
      (id) => !state.found.includes(id) && !previousPending.includes(id),
    );
    check(
      fresh.length === 1 || (fresh.length === 0 && !anyLeft),
      `${egg}: primeira descoberta libera exatamente 1 pista nova`,
      `novas=${fresh}`,
    );
    await boardMatchesProgress(page, `${locale}/${egg}`);
    previousPending = pendingNow;
  }

  // Repetir um segredo já achado não pode mudar nada.
  const snapshot = await readState(page);
  await page.type('lua');
  await sleep(400);
  const again = await readState(page);
  check(
    JSON.stringify(snapshot.found) === JSON.stringify(again.found) &&
      snapshot.clues.length === again.clues.length,
    'repetir um segredo achado não soma achado nem pista',
  );

  const final = await readState(page);
  const expected = ALL_EGGS.filter((id) => id !== 'dizzy' || globe);
  check(
    expected.every((id) => final.found.includes(id)),
    'todos os segredos foram marcados como achados',
    `faltam: ${expected.filter((id) => !final.found.includes(id))}`,
  );
  check(
    final.items.filter((item) => item.done === 'true').length === final.clues.length,
    'toda pista cujo segredo foi achado aparece riscada (✓)',
  );
  const labels = await page.eval(`(() => ({
    label: document.querySelector('.egg-board__toggle .sr-only')?.textContent ?? '',
    done: document.querySelector('.egg-board__done')?.textContent ?? '',
  }))()`);
  check(
    labels.label.includes(copy.counter) && labels.label.includes(copy.board),
    `rótulo do quadro em ${locale}`,
    labels.label,
  );
  check(labels.done.includes(copy.done), `mensagem final em ${locale}`, labels.done);
  await page.eval(
    `(() => { const t = document.querySelector('.egg-board__toggle'); if (t.getAttribute('aria-expanded') !== 'true') t.click(); })()`,
  );
  await sleep(300);
  await page.screenshot(join(SHOTS, `desktop-board-${locale}.png`));
  await page.key('Escape');
  await sleep(200);
  check(!(await readState(page)).open, 'Esc recolhe a lista de pistas');

  // Persistência: recarregar e trocar de idioma mantêm o progresso.
  await page.goto(base);
  const reloaded = await readState(page);
  check(
    reloaded.found.length === final.found.length && reloaded.boardVisible,
    'recarregar a página mantém o progresso',
  );
  const otherLocale = locale === 'en' ? 'es' : 'en';
  await page.goto(root + LOCALES[otherLocale].path);
  const other = await readState(page);
  check(
    other.found.length === final.found.length && other.boardVisible,
    `trocar de idioma (${locale} → ${otherLocale}) mantém o progresso`,
  );
  check(
    other.items.length > 0 &&
      other.items.every((item, index) => item.text !== reloaded.items[index]?.text),
    'as pistas são traduzidas ao trocar de idioma',
  );
  check((await page.eval('window.__errors.length')) === 0, 'nenhum erro de JavaScript na página');
  check(
    (await page.eval('window.__csp.length')) === 0,
    'nenhuma violação de CSP (inclui Trusted Types)',
    String(await page.eval('window.__csp.join(" | ")')),
  );
  await page.close();
}

// A pista da estrela cadente pede "o que ele é" / "um desejo": toda forma natural de dizer isso deve valer.
/** Com todas as pistas liberadas, cada idioma mostra o próprio texto, e nenhum repete o de outro. */
async function clueTexts(browser, root) {
  console.log('\n── Textos das pistas em cada idioma ──');
  const byLocale = {};
  for (const [locale, copy] of Object.entries(LOCALES)) {
    const page = await browser.newPage();
    await page.emulate({ width: 1280, height: 800 });
    await page.goto(root + copy.path);
    await page.eval(
      `sessionStorage.setItem('found-eggs', 'dizzy'); sessionStorage.setItem('egg-clues', ${JSON.stringify(ALL_EGGS.join(','))}); location.reload();`,
    );
    await sleep(1500);
    byLocale[locale] = await page.eval(
      `[...document.querySelectorAll('.egg-board__list li:not(.egg-board__done)')].map((li) => li.textContent)`,
    );
    await page.close();
  }
  for (const [locale, texts] of Object.entries(byLocale)) {
    check(
      texts.length === ALL_EGGS.length,
      `${locale}: ${ALL_EGGS.length} pistas no quadro`,
      `${texts.length}`,
    );
    check(
      texts.every((text) => text.length > 15 && !/undefined|\{|\[object/.test(text)),
      `${locale}: nenhuma pista vazia ou quebrada`,
    );
  }
  const pt = byLocale['pt-BR'];
  const same = pt.filter(
    (text, i) =>
      text === byLocale.en[i] || text === byLocale.es[i] || byLocale.en[i] === byLocale.es[i],
  );
  check(
    same.length === 0,
    'as pistas não se repetem entre idiomas',
    same.join(' | ').slice(0, 120),
  );
}

async function wishPhrasings(browser, base) {
  console.log('\n── Palavras da estrela cadente (cada uma numa sessão nova) ──');
  for (const word of [
    'estrela',
    'Estrela',
    'estrella',
    'star',
    'shootingstar',
    'wish',
    'desejo',
    'deseo',
  ]) {
    const page = await browser.newPage();
    await page.emulate({ width: 1280, height: 800 });
    await page.goto(base);
    await page.type(word);
    await sleep(400);
    const state = await readState(page);
    check(
      state.found.includes('wish'),
      `digitar "${word}" marca a estrela cadente`,
      `found=${state.found}`,
    );
    await page.close();
  }
}

async function mobileScenarios(browser, base, label, size) {
  console.log(`\n── Celular: ${label} (${size.width}×${size.height}, toque) ──`);
  const page = await browser.newPage();
  page.mobile = true;
  await page.emulate({ ...size, dpr: 3, mobile: true, cpu: 4 });
  await page.goto(base);
  const globe = await page.waitGlobe(12000);
  if (!globe) warn('WebGL indisponível neste ambiente: toques na Terra pulados.');

  const media = await page.eval(
    `({ coarse: matchMedia('(pointer: coarse)').matches, hover: matchMedia('(hover: hover)').matches, w: innerWidth, sw: document.documentElement.scrollWidth })`,
  );
  check(
    media.coarse && !media.hover,
    'emulação de celular ativa (pointer: coarse, sem hover)',
    JSON.stringify(media),
  );
  check(media.sw <= media.w, 'sem rolagem horizontal', `scrollWidth=${media.sw} > ${media.w}`);

  // Alvos de toque: mínimo de 44 px é o recomendado; abaixo de 24 px é falha (WCAG 2.5.8).
  const targets = [
    '.link-card',
    '.page__cue',
    '.language-switch a, .language-switch button',
    '.hero__monogram',
    '.constellation__star',
  ];
  for (const selector of targets) {
    const box = await page.box(selector);
    if (!box) continue;
    const smallest = Math.min(box.w, box.h);
    if (smallest < 24) check(false, `alvo de toque ${selector}`, `${Math.round(smallest)}px`);
    else if (smallest < 44)
      warn(`alvo de toque ${selector} tem ${Math.round(smallest)}px (recomendado ≥ 44px)`);
    else pass(`alvo de toque ${selector}: ${Math.round(smallest)}px`);
  }

  // Segredos acessíveis no toque: turbo (segurar o nome), tema, constelação e Terra tonta.
  const name = await boxOf(page, '[data-sparkle]');
  await page.tap(name.x, name.y, 1100);
  await sleep(600);
  let state = await readState(page);
  check(
    state.found.includes('turbo'),
    'segurar o nome (900 ms) ativa o turbo no toque',
    `found=${state.found}`,
  );
  check(
    state.counter.endsWith(`/${TOUCH_EGGS.length}`),
    `o total no celular é ${TOUCH_EGGS.length} (só o que dá para fazer no toque)`,
    state.counter,
  );

  // O aviso do efeito vem primeiro; o quadro abre depois e nunca fica sob o aviso.
  check(
    !state.open,
    'logo após o achado o quadro ainda está fechado (o aviso do efeito aparece primeiro)',
  );
  const sequenced = await watchBoardOpening(page);
  check(sequenced.opened, 'o quadro abre sozinho depois do aviso', JSON.stringify(sequenced));
  check(
    sequenced.overlaps === 0,
    'o quadro aberto nunca fica coberto por um aviso',
    JSON.stringify(sequenced),
  );

  await ACTIONS.theme(page);
  await ACTIONS.constellation(page);
  if (globe) await ACTIONS.dizzy(page);
  await sleep(600);
  state = await readState(page);
  for (const egg of TOUCH_EGGS) {
    if (egg === 'dizzy' && !globe) continue;
    check(state.found.includes(egg), `${egg}: achado por toque`, `found=${state.found}`);
  }
  check(
    state.clues.every((id) => TOUCH_EGGS.includes(id)),
    'nenhuma pista de segredo impossível no celular (teclado/mouse)',
    `clues=${state.clues}`,
  );
  check(
    !state.found.some((id) => !TOUCH_EGGS.includes(id)),
    'nada fora do toque contado como achado',
  );
  const maxFound = Number(state.counter.match(/(\d+)\//)?.[1] ?? 0);
  check(maxFound <= TOUCH_EGGS.length, 'o contador nunca passa do total', state.counter);

  // Quadro: cabe na tela, abre/fecha ao toque e não cobre o conteúdo permanentemente.
  const toggle = await boxOf(page, '.egg-board__toggle');
  if (toggle.h < 44) warn(`botão do quadro tem ${Math.round(toggle.h)}px de altura`);
  await page.eval(
    `document.querySelector('.egg-board__toggle').getAttribute('aria-expanded') !== 'true' && document.querySelector('.egg-board__toggle').click()`,
  );
  await sleep(300);
  const board = await boxOf(page, '.egg-board__list');
  const viewport = { w: size.width, h: size.height };
  check(
    board.left >= 0 && board.right <= viewport.w && board.top >= 0 && board.bottom <= viewport.h,
    'a lista de pistas aberta cabe inteira na tela',
    JSON.stringify(board),
  );
  const cards = await page.eval(
    `[...document.querySelectorAll('.link-card')].map((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; })`,
  );
  const overlaps = cards.filter(
    (c) =>
      c.left < board.right && c.right > board.left && c.top < board.bottom && c.bottom > board.top,
  ).length;
  if (overlaps)
    warn(
      `com a lista aberta, ela cobre ${overlaps} cartão(ões) de link (recolhe sozinha em ~7 s; o botão fecha)`,
    );
  else pass('a lista aberta não cobre os cartões de link');
  await page.screenshot(join(SHOTS, `mobile-${label}-board-open.png`));
  const toggleBox = await boxOf(page, '.egg-board__toggle');
  await page.tap(toggleBox.x, toggleBox.y);
  await sleep(300);
  check(!(await readState(page)).open, 'tocar no contador fecha a lista');
  await page.tap(toggleBox.x, toggleBox.y);
  await sleep(300);
  const outside = await emptyGlobePoint(page);
  if (outside) {
    await page.tap(outside.x, outside.y);
    await sleep(300);
    check(!(await readState(page)).open, 'tocar fora do quadro recolhe a lista');
  }
  const toggleLabel = await page.eval(
    `document.querySelector('.egg-board__toggle').getAttribute('aria-controls') === document.querySelector('.egg-board__list').id`,
  );
  check(toggleLabel, 'o botão do quadro aponta (aria-controls) para a lista');

  // Desempenho com CPU 4× mais lenta: tarefas longas (>200 ms) travam a interação.
  const longTasks = await page.eval('window.__long.filter((e) => e.d > 200)');
  const atLoad = longTasks.filter((e) => e.t < 6000);
  const atPlay = longTasks.filter((e) => e.t >= 6000);
  if (atPlay.length)
    warn(
      `${atPlay.length} tarefa(s) longa(s) durante a interação (CPU 4× mais lenta): ${atPlay.map((e) => `${e.d} ms @${e.t}`).join(', ')}`,
    );
  else pass('nenhuma tarefa longa (>200 ms) durante a interação, com CPU 4× mais lenta');
  if (atLoad.length)
    warn(
      `carregamento (globo 3D por WebGL de software, CPU 4× mais lenta): ${atLoad.map((e) => `${e.d} ms @${e.t}`).join(', ')}`,
    );
  check((await page.eval('window.__errors.length')) === 0, 'nenhum erro de JavaScript na página');
  check(
    (await page.eval('window.__csp.length')) === 0,
    'nenhuma violação de CSP (inclui Trusted Types)',
    String(await page.eval('window.__csp.join(" | ")')),
  );

  // Fim do jogo no celular: achou os 4 → mensagem final no quadro.
  if (globe) {
    const done = await readState(page);
    check(
      done.found.length === TOUCH_EGGS.length && done.items.at(-1)?.final === true,
      'achou todos os segredos do celular: o quadro mostra a mensagem final',
    );
  }
  await page.screenshot(join(SHOTS, `mobile-${label}.png`));
  await page.close();
}

/**
 * Fora de ordem: depois do primeiro achado, a pista aponta para X; o visitante acha Y (outro).
 * Y precisa aparecer riscado na hora, X continua pendente e uma pista nova chega.
 */
async function outOfOrder(browser, root, locale, device) {
  const copy = LOCALES[locale];
  console.log(`\n── Fora de ordem: ${locale}, ${device} ──`);
  const page = await browser.newPage();
  const mobile = device !== 'desktop';
  page.mobile = mobile;
  await page.emulate(
    mobile ? { width: 390, height: 844, dpr: 3, mobile: true } : { width: 1280, height: 800 },
  );
  await page.goto(root + copy.path);
  const globe = await page.waitGlobe(12000);
  const pool = (mobile ? TOUCH_EGGS : ALL_EGGS).filter((id) => id !== 'dizzy' || globe);

  // Primeiro achado: no desktop, a lua; no celular, o tema.
  const first = mobile ? 'theme' : 'moon';
  await ACTIONS[first](page);
  await sleep(500);
  let s = await readState(page);
  await boardMatchesProgress(page, `${locale}/${device} após ${first}`);

  // Percorre o resto sempre escolhendo um segredo que NÃO é o da pista pendente.
  for (let round = 0; round < pool.length; round += 1) {
    const pending = pendingOf(s);
    const target = pool.find((id) => !s.found.includes(id) && !pending.includes(id));
    if (!target) break;
    await ACTIONS[target](page);
    await sleep(500);
    const after = await readState(page);
    check(
      after.found.includes(target),
      `${locale}/${device}: ${target} achado fora da ordem das pistas`,
    );
    const entry = after.clues.indexOf(target);
    check(
      entry >= 0 && after.items[entry]?.done === 'true',
      `${locale}/${device}: ${target} aparece riscado mesmo sem ter sido a pista da vez`,
      `clues=${after.clues}`,
    );
    check(
      pending.every((id) => pendingOf(after).includes(id)),
      `${locale}/${device}: a pista que estava pendente continua pendente`,
      `antes=${pending} depois=${pendingOf(after)}`,
    );
    await boardMatchesProgress(page, `${locale}/${device} após ${target}`);
    s = after;
  }
  // Agora segue as pistas pendentes até o fim: tudo achado e tudo riscado.
  for (let guard = 0; guard < pool.length; guard += 1) {
    const next = pendingOf(s).find((id) => pool.includes(id));
    if (!next) break;
    await ACTIONS[next](page);
    await sleep(500);
    s = await readState(page);
  }
  await boardMatchesProgress(page, `${locale}/${device} no fim`);
  check(
    pool.every((id) => s.found.includes(id)),
    `${locale}/${device}: todos os segredos alcançáveis achados`,
    `faltam=${pool.filter((id) => !s.found.includes(id))}`,
  );
  await page.eval(
    `(() => { const t = document.querySelector('.egg-board__toggle'); if (t.getAttribute('aria-expanded') !== 'true') t.click(); })()`,
  );
  await sleep(300);
  await page.screenshot(join(SHOTS, `out-of-order-${locale}-${device}.png`));
  await page.close();
}

/** Observa o quadro por até 12 s: ele precisa abrir e nunca dividir a tela com um aviso. */
async function watchBoardOpening(page, maxMs = 12000) {
  return page.eval(`new Promise((resolve) => {
    const started = performance.now();
    let overlaps = 0;
    let opened = false;
    const seen = new Set();
    const tick = () => {
      const list = document.querySelector('.egg-board__list');
      const toast = document.querySelector('.toast.is-visible');
      const open = list && !list.hidden;
      if (open && toast) {
        const a = list.getBoundingClientRect();
        const b = toast.getBoundingClientRect();
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) overlaps += 1;
      }
      if (toast) seen.add(toast.textContent);
      if (open) opened = true;
      if (opened || performance.now() - started > ${maxMs}) resolve({ opened, overlaps, toasts: [...seen], ms: Math.round(performance.now() - started) });
      else setTimeout(tick, 100);
    };
    tick();
  })`);
}

/**
 * Corrida real: o achado acontece logo ao abrir a página e, enquanto o quadro espera para abrir,
 * chega a saudação por horário (~2,4 s após carregar, 4,8 s na tela). O quadro não pode abrir por
 * cima dela; tem de esperar o aviso sumir. (Com espera de tempo fixo, este cenário falha.)
 */
async function boardWaitsForToasts(browser, root) {
  console.log('\n── Quadro x avisos (saudação chega enquanto o quadro espera) ──');
  for (const device of ['desktop', 'celular']) {
    const mobile = device === 'celular';
    // A pré-condição (saudação chegar DEPOIS do achado) depende do relógio da página. Se não
    // ocorrer, a tentativa é inconclusiva e o cenário se repete; nunca se repete por falha.
    let result;
    for (let attempt = 1; attempt <= 3 && !result; attempt += 1) {
      const page = await browser.newPage();
      page.mobile = mobile;
      await page.emulate(
        mobile ? { width: 390, height: 844, dpr: 3, mobile: true } : { width: 1280, height: 800 },
      );
      await page.goto(root);
      await (mobile ? ACTIONS.turbo(page) : ACTIONS.moon(page));
      const watched = await watchBoardOpening(page, 15000);
      await page.close();
      if (watched.toasts.some((text) => /\d{1,2}[:h]\d{2}/.test(text))) result = watched;
      else
        warn(
          `${device}: tentativa ${attempt} inconclusiva (a saudação não chegou durante a espera)`,
        );
    }
    if (
      !check(
        Boolean(result),
        `${device}: o cenário exercitou a corrida (saudação durante a espera)`,
      )
    ) {
      continue;
    }
    check(
      result.opened,
      `${device}: o quadro abre depois que os avisos somem`,
      JSON.stringify(result),
    );
    check(
      result.overlaps === 0,
      `${device}: o quadro nunca abre por cima de um aviso`,
      JSON.stringify(result),
    );
  }
}

const { server, url } = await serveDist(DIST);
// --only=desktop,clues,wish,overlay,order,mobile roda só essas seções (padrão: todas).
const only = process.argv
  .find((arg) => arg.startsWith('--only='))
  ?.slice(7)
  .split(',');

// Cada seção roda num navegador novo: com WebGL por software, dezenas de abas na mesma
// instância saturam o processo de GPU e geram falhas e lentidão que não são do site.
const SECTIONS = [
  [
    'desktop',
    async (browser) => {
      for (const locale of Object.keys(LOCALES)) await desktopScenarios(browser, url, locale);
    },
  ],
  ['clues', (browser) => clueTexts(browser, url)],
  ['wish', (browser) => wishPhrasings(browser, url)],
  ['overlay', (browser) => boardWaitsForToasts(browser, url)],
  [
    'order',
    async (browser) => {
      for (const locale of Object.keys(LOCALES)) {
        await outOfOrder(browser, url, locale, 'desktop');
        await outOfOrder(browser, url, locale, 'celular');
      }
    },
  ],
  [
    'mobile',
    async (browser) => {
      await mobileScenarios(browser, url, 'iPhone', { width: 390, height: 844 });
      await mobileScenarios(browser, url, 'pequeno', { width: 320, height: 568 });
    },
  ],
];

try {
  for (const [index, [name, run]] of SECTIONS.entries()) {
    if (only && !only.includes(name)) continue;
    const browser = await launchBrowser({ port: 9333 + index });
    try {
      await run(browser);
    } finally {
      await browser.close();
    }
  }
} finally {
  server.close();
}

console.log(`\nCapturas de tela em: ${SHOTS}`);
if (failures > 0) {
  console.error(`\n${failures} verificação(ões) falharam.`);
  process.exit(1);
}
console.log('\nQA ponta a ponta: tudo certo.');
process.exit(0);
