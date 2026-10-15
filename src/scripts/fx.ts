import { createBurst } from '../lib/sparkles';
import { createStar, removeWhenDone } from './sparkle-dom';

/** Efeitos de tela cheia dos easter eggs. Tudo decorativo (aria-hidden), removido ao terminar. */

let layer: HTMLElement | undefined;

function fxLayer(): HTMLElement {
  if (layer?.isConnected) return layer;
  layer = document.createElement('div');
  layer.className = 'fx-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  return layer;
}

interface RocketFlight {
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly durationMs: number;
  readonly delayMs: number;
  readonly sizePx: number;
}

/** Foguete de um ponto a outro da tela, com o nariz alinhado à trajetória. */
function launchRocket(flight: RocketFlight): void {
  const flyX = flight.toX - flight.fromX;
  const flyY = flight.toY - flight.fromY;
  // O emoji aponta para cima e para a direita (-45°): soma 45° ao ângulo do voo.
  const heading = (Math.atan2(flyY, flyX) * 180) / Math.PI + 45;

  const rocket = document.createElement('span');
  rocket.className = 'fx-rocket';
  rocket.textContent = '🚀';
  rocket.style.setProperty('--x0', `${flight.fromX}px`);
  rocket.style.setProperty('--y0', `${flight.fromY}px`);
  rocket.style.setProperty('--fly-x', `${flyX}px`);
  rocket.style.setProperty('--fly-y', `${flyY}px`);
  rocket.style.setProperty('--heading', `${heading}deg`);
  rocket.style.setProperty('--size', `${flight.sizePx}px`);
  rocket.style.setProperty('--dur', `${flight.durationMs}ms`);
  rocket.style.setProperty('--delay', `${flight.delayMs}ms`);
  removeWhenDone(rocket);
  fxLayer().append(rocket);
}

const between = (min: number, max: number): number => min + Math.random() * (max - min);

/** Chuva de foguetes subindo pela tela inteira. */
export function rocketRain(count = 16): number {
  const width = window.innerWidth;
  const height = window.innerHeight;
  for (let index = 0; index < count; index += 1) {
    const fromX = between(-0.05, 1) * width;
    launchRocket({
      fromX,
      fromY: height + 40,
      toX: fromX + between(0.15, 0.35) * width,
      toY: -80,
      durationMs: between(1800, 3000),
      delayMs: between(0, 1600),
      sizePx: between(24, 44),
    });
  }
  return count;
}

/** Um foguete grande cruzando a tela na diagonal (Konami). */
export function turboRocket(): void {
  launchRocket({
    fromX: -60,
    fromY: window.innerHeight + 40,
    toX: window.innerWidth + 80,
    toY: -80,
    durationMs: 2600,
    delayMs: 0,
    sizePx: Math.max(56, Math.min(window.innerWidth, window.innerHeight) * 0.14),
  });
}

/** Explosão de estrelinhas em um ponto da tela (coordenadas em px). */
export function starBurstAt(x: number, y: number, count = 14): void {
  const target = fxLayer();
  for (const sparkle of createBurst(count)) {
    const star = createStar('sparkle');
    star.dataset.tone = String(sparkle.tone);
    star.style.setProperty('--x', `${x + (sparkle.x - 50) * 1.6}px`);
    star.style.setProperty('--y', `${y + (sparkle.y - 50) * 1.6}px`);
    star.style.setProperty('--size', `${sparkle.size}px`);
    star.style.setProperty('--dx', `${sparkle.dx}px`);
    star.style.setProperty('--dy', `${sparkle.dy}px`);
    star.style.setProperty('--rot', `${sparkle.rotate}deg`);
    star.style.setProperty('--delay', `${sparkle.delay}ms`);
    star.style.setProperty('--dur', `${sparkle.duration}ms`);
    removeWhenDone(star);
    target.append(star);
  }
}

let moonTimer = 0;

/**
 * Mostra a lua grande no canto da tela e o céu azulado por `durationMs`, como os outros efeitos.
 * Chamar de novo enquanto ela está na tela reinicia o tempo (não empilha, não apaga).
 */
export function showMoon(durationMs: number): void {
  const html = document.documentElement;
  if (!document.querySelector('.moon')) {
    const moon = document.createElement('div');
    moon.className = 'moon';
    moon.setAttribute('aria-hidden', 'true');
    document.body.append(moon);
  }
  html.dataset.moon = 'on';
  window.clearTimeout(moonTimer);
  moonTimer = window.setTimeout(() => {
    delete html.dataset.moon;
  }, durationMs);
}

/** Faz o nome brilhar por alguns segundos. */
export function glowName(durationMs = 3600): void {
  const wrap = document.querySelector<HTMLElement>('[data-sparkle]');
  if (!wrap) return;
  wrap.classList.add('is-glowing');
  window.setTimeout(() => wrap.classList.remove('is-glowing'), durationMs);
}

/** Estrela cadente clicável (devagar o bastante para dar tempo de pegar). Só uma por vez. */
export function spawnShootingStar(label: string, onWish: (x: number, y: number) => void): void {
  if (document.querySelector('.shooting-star')) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const fromY = between(0.06, 0.3) * height;
  const dx = -(width + 160);
  const dy = between(0.18, 0.4) * height;

  const star = document.createElement('button');
  star.type = 'button';
  star.className = 'shooting-star';
  star.setAttribute('aria-label', label);
  star.style.setProperty('--x0', `${width + 80}px`);
  star.style.setProperty('--y0', `${fromY}px`);
  star.style.setProperty('--dx', `${dx}px`);
  star.style.setProperty('--dy', `${dy}px`);
  star.style.setProperty('--angle', `${(Math.atan2(dy, -dx) * 180) / Math.PI}deg`);
  star.style.setProperty('--dur', '9000ms');
  star.addEventListener('animationend', () => star.remove(), { once: true });
  star.addEventListener(
    'click',
    () => {
      const rect = star.getBoundingClientRect();
      star.remove();
      onWish(rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    { once: true },
  );
  document.body.append(star);
}
