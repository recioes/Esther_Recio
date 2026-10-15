import type { MarkerCopy } from '../i18n/types';
import type { MarkerId } from '../lib/markers';
import type { MarkerUi } from './globe';

/** Rótulo flutuante dos pontos luminosos (Brasília, Santander). Decorativo: aria-hidden. */
export function createMarkerTooltip(copy: Readonly<Record<MarkerId, MarkerCopy>>): MarkerUi {
  const element = document.createElement('div');
  element.className = 'globe-tip';
  element.setAttribute('aria-hidden', 'true');
  const title = document.createElement('strong');
  const detail = document.createElement('span');
  element.append(title, detail);
  document.body.append(element);

  const place = (x: number, y: number): void => {
    element.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };

  return {
    show(id, x, y) {
      title.textContent = copy[id].title;
      detail.textContent = copy[id].detail;
      place(x, y);
      element.classList.add('is-visible');
    },
    move: place,
    hide() {
      element.classList.remove('is-visible');
    },
  };
}
