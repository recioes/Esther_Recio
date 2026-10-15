const SVG_NS = 'http://www.w3.org/2000/svg';
const STAR_PATH =
  'M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z';

/** Estrela de quatro pontas (SVG decorativo) estilizada pelas classes de sparkles.css. */
export function createStar(className: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', className);
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', STAR_PATH);
  svg.append(path);
  return svg;
}

/** Remove o elemento quando a animação CSS termina (nada fica sobrando no DOM). */
export function removeWhenDone(element: Element): void {
  element.addEventListener('animationend', () => element.remove(), { once: true });
}
