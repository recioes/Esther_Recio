import { pointerOffset, tiltAngles } from '../lib/pointer';
import { enhanceName } from './name-sparkles';

/**
 * Melhorias progressivas: a página funciona sem este arquivo (fica o poster estático).
 * - spotlight e tilt só em dispositivos com mouse (hover: hover, pointer: fine)
 * - tilt e rotação do globo respeitam prefers-reduced-motion
 * - o globo 3D (three.js) só é baixado se houver WebGL, depois da primeira pintura
 */
const MAX_TILT_DEGREES = 5;

const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resetTilt(card: HTMLElement): void {
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
}

function bindCard(card: HTMLElement, enableTilt: boolean): void {
  card.addEventListener(
    'pointermove',
    (event) => {
      const rect = card.getBoundingClientRect();
      const offset = pointerOffset(event.clientX, event.clientY, rect);
      card.style.setProperty('--mx', `${offset.x}px`);
      card.style.setProperty('--my', `${offset.y}px`);

      if (!enableTilt) return;
      const { rx, ry } = tiltAngles(offset, rect, MAX_TILT_DEGREES);
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
    },
    { passive: true },
  );
  card.addEventListener('pointerleave', () => resetTilt(card));
}

function enhanceCards(): void {
  if (!hasFinePointer) return;
  const enableTilt = !prefersReducedMotion;
  for (const card of document.querySelectorAll<HTMLElement>('[data-spotlight]')) {
    bindCard(card, enableTilt);
  }
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
  } catch {
    return false;
  }
}

function wantsSavedData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

async function startGlobe(): Promise<void> {
  const root = document.querySelector<HTMLElement>('[data-globe-root]');
  if (!root || !supportsWebGL()) return;

  try {
    const { mountGlobe } = await import('./globe');
    await mountGlobe(root, { reducedMotion: prefersReducedMotion, saveData: wantsSavedData() });
    document.documentElement.classList.add('globe-ready');
  } catch {
    // Sem WebGL utilizável ou texturas indisponíveis: o poster estático permanece.
  }
}

function whenIdle(task: () => void): void {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(task, { timeout: 1500 });
  } else {
    window.setTimeout(task, 300);
  }
}

enhanceCards();
enhanceName(prefersReducedMotion);
whenIdle(() => {
  void startGlobe();
});
