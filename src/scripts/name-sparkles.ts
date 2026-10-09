import { createBurst } from '../lib/sparkles';

/**
 * Ao passar o mouse (ou tocar) no nome: explosão de estrelas e um foguete cruzando.
 * Tudo é decorativo (aria-hidden) e posicionado via CSSOM, permitido pela CSP (style-src 'self').
 */
const SPARKLE_COUNT = 18;
const TRAIL_COUNT = 8;
const ROCKET_DURATION_MS = 1800;
const SVG_NS = 'http://www.w3.org/2000/svg';
const STAR_PATH =
  'M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z';

function createStar(className: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', className);
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', STAR_PATH);
  svg.append(path);
  return svg;
}

function removeWhenDone(element: Element): void {
  element.addEventListener('animationend', () => element.remove(), { once: true });
}

function spawnSparkles(layer: HTMLElement): void {
  for (const sparkle of createBurst(SPARKLE_COUNT)) {
    const star = createStar('sparkle');
    star.dataset.tone = String(sparkle.tone);
    star.style.setProperty('--x', `${sparkle.x}%`);
    star.style.setProperty('--y', `${sparkle.y}%`);
    star.style.setProperty('--size', `${sparkle.size}px`);
    star.style.setProperty('--dx', `${sparkle.dx}px`);
    star.style.setProperty('--dy', `${sparkle.dy}px`);
    star.style.setProperty('--rot', `${sparkle.rotate}deg`);
    star.style.setProperty('--delay', `${sparkle.delay}ms`);
    star.style.setProperty('--dur', `${sparkle.duration}ms`);
    removeWhenDone(star);
    layer.append(star);
  }
}

function spawnRocket(layer: HTMLElement): void {
  const { width, height } = layer.getBoundingClientRect();
  // Sai do canto inferior esquerdo e cruza até além do canto superior direito.
  const flyX = width * 1.1;
  const flyY = -height * 0.9;
  // O emoji 🚀 já aponta para cima e para a direita (-45°); alinha o nariz à trajetória.
  const heading = (Math.atan2(flyY, flyX) * 180) / Math.PI + 45;

  const rocket = document.createElement('span');
  rocket.className = 'rocket';
  rocket.textContent = '🚀';
  rocket.style.setProperty('--fly-x', `${flyX}px`);
  rocket.style.setProperty('--fly-y', `${flyY}px`);
  rocket.style.setProperty('--heading', `${heading}deg`);
  rocket.style.setProperty('--dur', `${ROCKET_DURATION_MS}ms`);
  removeWhenDone(rocket);
  layer.append(rocket);

  // Rastro de estrelinhas que acendem conforme o foguete passa.
  for (let index = 1; index <= TRAIL_COUNT; index += 1) {
    const progress = index / (TRAIL_COUNT + 1);
    const dot = createStar('sparkle sparkle--trail');
    dot.dataset.tone = String(index % 2);
    dot.style.setProperty('--x', `${progress * 110}%`);
    dot.style.setProperty('--y', `${100 - progress * 90}%`);
    dot.style.setProperty('--size', `${10 + index * 1.5}px`);
    dot.style.setProperty('--delay', `${progress * ROCKET_DURATION_MS * 0.8}ms`);
    removeWhenDone(dot);
    layer.append(dot);
  }
}

export function enhanceName(reducedMotion: boolean): void {
  const root = document.querySelector<HTMLElement>('[data-sparkle]');
  const layer = root?.querySelector<HTMLElement>('[data-sparkle-layer]');
  if (!root || !layer) return;

  let busy = false;
  // pointerenter cobre mouse e toque (cada toque gera um novo enter).
  root.addEventListener('pointerenter', () => {
    if (busy) return;
    busy = true;
    // Com movimento reduzido, as estrelas só acendem no lugar (ver CSS) e não há foguete.
    spawnSparkles(layer);
    if (!reducedMotion) spawnRocket(layer);
    window.setTimeout(() => {
      busy = false;
    }, ROCKET_DURATION_MS);
  });
}
