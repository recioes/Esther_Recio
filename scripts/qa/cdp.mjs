// Mini cliente do Chrome DevTools Protocol para os testes de QA ponta a ponta (sem dependências).
// Controla o Edge/Chrome do sistema: abre abas com emulação de celular, toca, digita e lê a página.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';

const BROWSERS = [
  process.env.QA_BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
};

/** Serve dist/ sob o mesmo prefixo do GitHub Pages (/Esther_Recio/). */
export function serveDist(distDir, base = '/Esther_Recio/', port = 0) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith(base)) {
      res.writeHead(404).end('fora da base');
      return;
    }
    let rel = normalize(decodeURIComponent(url.pathname.slice(base.length)));
    if (rel.startsWith('..')) {
      res.writeHead(403).end();
      return;
    }
    if (rel === '.' || rel === '' || rel.endsWith('\\') || rel.endsWith('/'))
      rel = join(rel, 'index.html');
    const root = resolve(distDir);
    const file = resolve(root, rel);
    // Só serve o que está dentro de dist/ (sem path traversal, sem caminho absoluto).
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    if (!existsSync(file)) {
      res.writeHead(404).end('404');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, url: `http://127.0.0.1:${server.address().port}${base}` });
    });
  });
}

class Page {
  #ws;
  #id = 0;
  #pending = new Map();
  #waiters = [];

  constructor(ws, targetId, browser) {
    this.#ws = ws;
    this.targetId = targetId;
    this.browser = browser;
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.#pending.has(message.id)) {
        const { resolve, reject } = this.#pending.get(message.id);
        this.#pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.message}`));
        else resolve(message.result);
      } else if (message.method) {
        for (const waiter of this.#waiters.filter((w) => w.method === message.method))
          waiter.resolve();
        this.#waiters = this.#waiters.filter((w) => w.method !== message.method);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject }));
  }

  #waitFor(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout esperando ${method}`)), timeoutMs);
      this.#waiters.push({
        method,
        resolve: () => {
          clearTimeout(timer);
          resolve();
        },
      });
    });
  }

  /** Emula um aparelho. `mobile` liga toque, hover:none e pointer:coarse, como num celular. */
  async emulate({ width, height, dpr = 1, mobile = false, cpu = 1 }) {
    this.mobile = mobile;
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: dpr,
      mobile,
    });
    await this.send('Emulation.setTouchEmulationEnabled', {
      enabled: mobile,
      maxTouchPoints: mobile ? 5 : 1,
    });
    if (mobile) {
      await this.send('Emulation.setUserAgentOverride', {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      });
    }
    if (cpu > 1) await this.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  }

  async goto(url) {
    await this.send('Page.enable');
    await this.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `window.__long = [];
        try { new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__long.push({ d: Math.round(e.duration), t: Math.round(e.startTime) }); }).observe({ type: 'longtask', buffered: true }); } catch {}
        window.__errors = []; window.addEventListener('error', (e) => window.__errors.push(String(e.message)));
        window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + (e.blockedURI || e.sample || '')));`,
    });
    const loaded = this.#waitFor('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded;
    await sleep(400);
  }

  /** Espera o globo 3D (precisa de WebGL); devolve false se não subiu. */
  async waitGlobe(timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await this.eval(`document.documentElement.classList.contains('globe-ready')`))
        return true;
      await sleep(200);
    }
    return false;
  }

  async eval(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? 'erro no eval');
    }
    return result.result.value;
  }

  /** Centro e tamanho do primeiro elemento que casa com o seletor (ou o n-ésimo). */
  box(selector, index = 0) {
    return this.eval(`(() => {
      const el = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    })()`);
  }

  /**
   * Toque e clique levam carimbo de tempo explícito: com o globo renderizado por software o
   * navegador de teste fica ocupado, e sem isso o intervalo entre apertar e soltar passaria do
   * limite de "toque" (350 ms) por culpa do harness, e não do site.
   */
  async click(x, y) {
    const t = Date.now() / 1000;
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, timestamp: t });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
      timestamp: t + 0.001,
    });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
      timestamp: t + 0.06,
    });
  }

  async tap(x, y, holdMs = 0) {
    const t = Date.now() / 1000;
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
      timestamp: t,
    });
    if (holdMs) await sleep(holdMs);
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
      timestamp: holdMs ? Date.now() / 1000 : t + 0.06,
    });
  }

  /** Usa toque num aparelho móvel e mouse no desktop, como o usuário real faria. */
  pointer(x, y) {
    return this.mobile ? this.tap(x, y) : this.click(x, y);
  }

  async key(key) {
    const arrows = {
      ArrowUp: 38,
      ArrowDown: 40,
      ArrowLeft: 37,
      ArrowRight: 39,
      Escape: 27,
      Enter: 13,
      Tab: 9,
    };
    if (arrows[key]) {
      const base = { key, code: key, windowsVirtualKeyCode: arrows[key] };
      await this.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
    } else {
      await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key, text: key });
      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key });
    }
  }

  async type(text) {
    for (const char of text) await this.key(char);
  }

  async screenshot(path) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path, Buffer.from(data, 'base64'));
    return path;
  }

  async close() {
    this.#ws.close();
    await fetch(`http://127.0.0.1:${this.browser.port}/json/close/${this.targetId}`).catch(
      () => {},
    );
  }
}

export async function launchBrowser({ port = 9333, extraArgs = [] } = {}) {
  const exe = BROWSERS.find((path) => path && existsSync(path));
  if (!exe) throw new Error('Nenhum Edge/Chrome encontrado. Defina QA_BROWSER com o caminho.');
  const profile = mkdtempSync(join(tmpdir(), 'qa-profile-'));
  const child = spawn(
    exe,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      // WebGL por software: o globo 3D sobe mesmo sem GPU (lento, mas funcional).
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      ...extraArgs,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/version`);
      break;
    } catch {
      await sleep(200);
    }
  }
  const browser = {
    port,
    async newPage() {
      const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
        method: 'PUT',
      });
      const target = await response.json();
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve, { once: true });
        ws.addEventListener('error', reject, { once: true });
      });
      return new Page(ws, target.id, browser);
    },
    async close() {
      child.kill();
      await sleep(300);
      rmSync(profile, { recursive: true, force: true });
    },
  };
  return browser;
}
