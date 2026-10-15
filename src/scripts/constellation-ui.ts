import {
  advanceConstellation,
  CONSTELLATION_ORDER,
  CONSTELLATION_POINTS,
  isConstellationComplete,
} from '../lib/constellation';

const SVG_NS = 'http://www.w3.org/2000/svg';
const COMPLETE_MS = 4500;

/**
 * Cinco estrelas quase invisíveis no canto da tela. Clicadas na ordem certa, desenham uma estrela
 * de cinco pontas. Decorativo e escondido (aria-hidden); o resto da página não depende dele.
 */
export function mountConstellation(onComplete: (centerX: number, centerY: number) => void): void {
  const root = document.createElement('div');
  root.className = 'constellation';
  root.setAttribute('aria-hidden', 'true');

  const lines = document.createElementNS(SVG_NS, 'svg');
  lines.setAttribute('class', 'constellation__lines');
  lines.setAttribute('viewBox', '0 0 100 100');
  root.append(lines);

  let progress = 0;
  let locked = false;

  const drawLines = (): void => {
    lines.replaceChildren();
    for (let index = 0; index < progress - 1; index += 1) {
      const from = CONSTELLATION_POINTS[CONSTELLATION_ORDER[index] ?? 0];
      const to = CONSTELLATION_POINTS[CONSTELLATION_ORDER[index + 1] ?? 0];
      if (!from || !to) continue;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(from.x));
      line.setAttribute('y1', String(from.y));
      line.setAttribute('x2', String(to.x));
      line.setAttribute('y2', String(to.y));
      lines.append(line);
    }
  };

  const stars = CONSTELLATION_POINTS.map((point, index) => {
    const star = document.createElement('span');
    star.className = 'constellation__star';
    star.dataset.noDrag = '';
    star.style.left = `${point.x}%`;
    star.style.top = `${point.y}%`;
    star.style.setProperty('--twinkle-delay', `${index * 0.7}s`);
    star.addEventListener('click', () => select(index));
    root.append(star);
    return star;
  });

  const refreshStars = (): void => {
    const lit = new Set(CONSTELLATION_ORDER.slice(0, progress));
    for (const [index, star] of stars.entries()) star.classList.toggle('is-lit', lit.has(index));
  };

  function select(index: number): void {
    if (locked) return;
    progress = advanceConstellation(progress, index);
    drawLines();
    refreshStars();
    if (!isConstellationComplete(progress)) return;

    locked = true;
    root.classList.add('is-complete');
    const rect = root.getBoundingClientRect();
    onComplete(rect.left + rect.width / 2, rect.top + rect.height / 2);
    window.setTimeout(() => {
      root.classList.remove('is-complete');
      progress = 0;
      locked = false;
      drawLines();
      refreshStars();
    }, COMPLETE_MS);
  }

  document.body.append(root);
}
