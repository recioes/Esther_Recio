import type { FinaleCopy } from '../i18n/types';
import { burst, type Particle, planShow, step } from '../lib/fireworks';

/**
 * Grande final da caça aos segredos: fogos de artifício em <canvas> e uma mensagem no centro.
 * Com "reduzir movimento", só a mensagem. Fecha no botão, com Esc, tocando fora ou sozinha.
 */

const SHOW_MS = 4200;
const AUTO_CLOSE_MS = 10_000;
const LEAVE_MS = 400;
/** Toque ou clique logo que abre não fecha (evita fechar com o mesmo gesto que achou o segredo). */
const CLOSE_GRACE_MS = 700;
/** Densidade de pixels do canvas: menor em telas de toque, para pesar menos em celulares modestos. */
const MAX_DPR = { fine: 2, touch: 1.5 } as const;
const THEME_COLORS = [
  '--color-pink-300',
  '--color-purple-500',
  '--color-lilac',
  '--color-pink-500',
];

export interface FinaleOptions {
  readonly reducedMotion: boolean;
  /** Mouse fino = aparelho mais forte: mais explosões e partículas. */
  readonly finePointer: boolean;
}

function themeColors(): string[] {
  const styles = getComputedStyle(document.documentElement);
  const colors = THEME_COLORS.map((name) => styles.getPropertyValue(name).trim()).filter(Boolean);
  return [...colors, '#ffffff'];
}

/** Desenha o show e remove o canvas quando a última partícula some. */
function launchFireworks(layer: HTMLElement, finePointer: boolean): () => void {
  const canvas = document.createElement('canvas');
  canvas.className = 'finale__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, finePointer ? MAX_DPR.fine : MAX_DPR.touch);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.scale(dpr, dpr);
  layer.prepend(canvas);

  const shells = planShow({
    width,
    height,
    colors: themeColors(),
    shells: finePointer ? 16 : 10,
    durationMs: SHOW_MS,
  });
  const perShell = finePointer ? 90 : 56;
  let particles: Particle[] = [];
  let launched = 0;
  let start = 0;
  let last = 0;
  let frame = 0;

  const draw = (now: number): void => {
    if (start === 0) {
      start = now;
      last = now;
    }
    const elapsed = now - start;
    while (launched < shells.length && (shells[launched]?.atMs ?? 0) <= elapsed) {
      const shell = shells[launched];
      if (shell) particles = particles.concat(burst(shell, perShell));
      launched += 1;
    }
    particles = step(particles, now - last);
    last = now;

    // Rastros: em vez de limpar, apaga só parte do quadro anterior (canvas transparente).
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = 'rgb(0 0 0 / 0.28)';
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const alpha = Math.max(0, p.life);
      context.fillStyle = p.color;
      // Halo largo e fraco + núcleo forte: brilho sem o custo de shadowBlur (pesado no celular).
      context.globalAlpha = alpha * 0.25;
      context.beginPath();
      context.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = alpha;
      context.beginPath();
      context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;

    if (launched >= shells.length && particles.length === 0) {
      canvas.remove();
      return;
    }
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(frame);
    canvas.remove();
  };
}

let active: HTMLElement | undefined;

export function showFinale(copy: FinaleCopy, options: FinaleOptions): void {
  if (active?.isConnected) return;

  const root = document.createElement('div');
  root.className = 'finale';
  active = root;

  const card = document.createElement('section');
  card.className = 'finale__card';
  card.setAttribute('aria-labelledby', 'finale-title');

  const title = document.createElement('h2');
  title.className = 'finale__title';
  title.id = 'finale-title';
  title.textContent = copy.title;

  const text = document.createElement('p');
  text.className = 'finale__text';
  text.textContent = copy.text;

  // Leitores de tela anunciam a vitória sem roubar o foco de quem está navegando.
  const announcer = document.createElement('p');
  announcer.className = 'sr-only';
  announcer.setAttribute('role', 'status');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'finale__close';
  close.setAttribute('aria-label', copy.close);
  close.textContent = '×';

  card.append(close, title, text);
  root.append(card, announcer);
  document.body.append(root);
  window.setTimeout(() => {
    announcer.textContent = `${copy.title} ${copy.text}`;
  }, 50);

  const stopFireworks = options.reducedMotion
    ? () => {}
    : launchFireworks(root, options.finePointer);
  const openedAt = performance.now();
  let closed = false;

  const dismiss = (): void => {
    if (closed) return;
    closed = true;
    window.clearTimeout(autoClose);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('pointerdown', onPointer);
    root.classList.add('is-leaving');
    window.setTimeout(() => {
      stopFireworks();
      root.remove();
      if (active === root) active = undefined;
    }, LEAVE_MS);
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') dismiss();
  };
  const onPointer = (event: PointerEvent): void => {
    if (performance.now() - openedAt < CLOSE_GRACE_MS) return;
    if (event.target instanceof Node && card.contains(event.target) && event.target !== close) {
      return;
    }
    dismiss();
  };

  close.addEventListener('click', dismiss);
  document.addEventListener('keydown', onKey);
  document.addEventListener('pointerdown', onPointer);
  const autoClose = window.setTimeout(dismiss, AUTO_CLOSE_MS);
}
