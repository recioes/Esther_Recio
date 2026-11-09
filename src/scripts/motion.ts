import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { buildRoutePath } from '../lib/route';

/**
 * Camada de animação (GSAP + Lenis). É melhoria progressiva: sem ela, o conteúdo fica visível
 * como está no HTML. O DOM é manipulado só com textContent/createElement, por causa da CSP.
 */
const EASE_OUT = 'expo.out';
const SCRAMBLE_GLYPHS = '01<>/{}[]#$';
const SCRAMBLE_SECONDS = 0.9;
/** Depois disso o CSS já revelou o herói (ver hero-hold): animar de novo piscaria. */
const HERO_HOLD_MS = 2000;

/** Raios da elipse em EarthBackdrop.astro. */
const ORBIT_RX = 560;
const ORBIT_RY = 150;

const SVG_NS = 'http://www.w3.org/2000/svg';
const ROUTE_AMPLITUDE = 30;
/** Nave apontando para cima, centrada na origem. */
const SHIP_PARTS: readonly (readonly [string, string])[] = [
  ['timeline__ship-flame', 'M-3 9 L0 17 L3 9 Z'],
  ['timeline__ship-fin', 'M-4 3 L-9 10 L-4 9 Z M4 3 L9 10 L4 9 Z'],
  ['timeline__ship-hull', 'M0 -12 C5 -7 5 3 4 9 L-4 9 C-5 3 -5 -7 0 -12 Z'],
];

const REVEAL_TITLES = '.section__title, .timeline__title';
const REVEAL_TEXT = '.section__lead, .section__intro, .timeline__intro, .prose, .section__note';
const REVEAL_CARDS = '.lang-card, .pub, .activity, .project';

function markAnimated(targets: readonly Element[]): void {
  for (const target of targets) target.setAttribute('data-motion', '');
}

function splitIntoChars(element: HTMLElement): { chars: HTMLElement[]; revert: () => void } {
  const text = element.textContent ?? '';
  const chars: HTMLElement[] = [];
  const nodes = text
    .trim()
    .split(/\s+/)
    .flatMap((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'hero__word';
      for (const letter of word) {
        const char = document.createElement('span');
        char.className = 'hero__char';
        char.textContent = letter;
        chars.push(char);
        wordSpan.append(char);
      }
      return index === 0 ? [wordSpan] : [document.createTextNode(' '), wordSpan];
    });

  element.setAttribute('aria-label', text);
  element.classList.add('hero__name--split');
  element.replaceChildren(...nodes);

  return {
    chars,
    revert() {
      element.textContent = text;
      element.classList.remove('hero__name--split');
      element.removeAttribute('aria-label');
    },
  };
}

function scramble(element: HTMLElement, delay: number): void {
  const finalText = element.textContent ?? '';
  const randomGlyph = () =>
    SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)] ?? '';
  const frame = (progress: number) =>
    [...finalText]
      .map((letter, index) => {
        if (letter === ' ' || index / finalText.length < progress) return letter;
        return randomGlyph();
      })
      .join('');

  const state = { progress: 0 };
  element.textContent = frame(0);
  gsap.to(state, {
    progress: 1,
    delay,
    duration: SCRAMBLE_SECONDS,
    ease: 'none',
    onUpdate: () => {
      element.textContent = frame(state.progress);
    },
    onComplete: () => {
      element.textContent = finalText;
    },
  });
}

function playHeroIntro(): void {
  const name = document.querySelector<HTMLElement>('.hero__name');
  const role = document.querySelector<HTMLElement>('.hero__role');
  const monogram = document.querySelector<HTMLElement>('.hero__monogram');
  if (!name || !role || performance.now() > HERO_HOLD_MS) return;

  const { chars, revert } = splitIntoChars(name);
  gsap.fromTo(
    chars,
    { yPercent: 70, rotateX: -75, opacity: 0 },
    {
      yPercent: 0,
      rotateX: 0,
      opacity: 1,
      duration: 1.1,
      ease: EASE_OUT,
      stagger: 0.035,
      onComplete: revert,
    },
  );
  if (monogram) {
    gsap.from(monogram, { scale: 0.6, duration: 1, ease: 'back.out(1.6)', clearProps: 'scale' });
  }
  scramble(role, 0.45);
}

function revealTitles(): void {
  const titles = gsap.utils.toArray<HTMLElement>(REVEAL_TITLES);
  markAnimated(titles);
  for (const title of titles) {
    gsap.fromTo(
      title,
      { clipPath: 'inset(0 0 100% 0)', y: 48 },
      {
        clipPath: 'inset(0 -10% -15% -10%)',
        y: 0,
        duration: 1.1,
        ease: EASE_OUT,
        scrollTrigger: { trigger: title, start: 'top 90%', once: true },
      },
    );
  }
}

function fadeInBatch(selector: string, y: number): void {
  const targets = gsap.utils.toArray<HTMLElement>(selector);
  markAnimated(targets);
  gsap.set(targets, { opacity: 0, y });
  ScrollTrigger.batch(targets, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: EASE_OUT,
        stagger: 0.09,
        clearProps: 'transform',
      }),
  });
}

function revealProjectDetails(): void {
  for (const list of gsap.utils.toArray<HTMLElement>('.project__tools, .project__learnings')) {
    const items = Array.from(list.children);
    markAnimated(items);
    // fromTo com valores finais explícitos: from() relê o estado atual a cada refresh e pode gravar opacidade 0.
    gsap.fromTo(
      items,
      { opacity: 0, x: -14 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: EASE_OUT,
        stagger: 0.06,
        scrollTrigger: { trigger: list, start: 'top 90%', once: true },
      },
    );
  }
}

function scrubHeroAway(): void {
  const wrap = document.querySelector<HTMLElement>('.hero__name-wrap');
  const firstScreen = document.querySelector<HTMLElement>('.page');
  if (!wrap || !firstScreen) return;
  gsap.to(wrap, {
    yPercent: -35,
    scale: 0.92,
    ease: 'none',
    scrollTrigger: { trigger: firstScreen, start: 'top top', end: 'bottom top', scrub: true },
  });
}

function drawOrbit(): void {
  gsap.fromTo(
    gsap.utils.toArray<SVGPathElement>('.earth__orbit-line'),
    { strokeDasharray: 1, strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration: 2.4, delay: 0.4, ease: 'power2.inOut' },
  );
}

/** Na metade de trás o satélite é desenhado sob o canvas do globo, que o encobre. */
function flySatellite(): void {
  const back = document.querySelector<SVGGElement>('[data-orbit-side="back"]');
  const front = document.querySelector<SVGGElement>('[data-orbit-side="front"]');
  if (!back || !front) return;
  const state = { angle: Math.PI / 3 };
  gsap.to(state, {
    angle: Math.PI / 3 + Math.PI * 2,
    duration: 28,
    ease: 'none',
    repeat: -1,
    onUpdate: () => {
      const sine = Math.sin(state.angle);
      const cosine = Math.cos(state.angle);
      const heading = (Math.atan2(ORBIT_RY * cosine, -ORBIT_RX * sine) * 180) / Math.PI;
      const scale = 0.7 + 0.3 * ((sine + 1) / 2);
      const active = sine >= 0 ? front : back;
      const hidden = sine >= 0 ? back : front;
      active.setAttribute(
        'transform',
        `translate(${ORBIT_RX * cosine} ${ORBIT_RY * sine}) rotate(${heading}) scale(${scale})`,
      );
      active.setAttribute('visibility', 'visible');
      hidden.setAttribute('visibility', 'hidden');
    },
  });
}

function createRouteSvg(list: HTMLElement): {
  track: SVGPathElement;
  flight: SVGPathElement;
  ship: SVGGElement;
} {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'timeline__route');
  svg.setAttribute('aria-hidden', 'true');
  const track = document.createElementNS(SVG_NS, 'path');
  track.setAttribute('class', 'timeline__route-track');
  const flight = document.createElementNS(SVG_NS, 'path');
  flight.setAttribute('class', 'timeline__route-flight');
  flight.setAttribute('pathLength', '1');
  flight.setAttribute('stroke-dasharray', '1');
  const ship = document.createElementNS(SVG_NS, 'g');
  for (const [name, d] of SHIP_PARTS) {
    const part = document.createElementNS(SVG_NS, 'path');
    part.setAttribute('class', name);
    part.setAttribute('d', d);
    ship.append(part);
  }
  svg.append(track, flight, ship);
  list.prepend(svg);
  list.classList.add('route-on');
  return { track, flight, ship };
}

/** A rota da nave passa por todas as estações e se desenha com a rolagem. */
function drawTimeline(): void {
  const list = document.querySelector<HTMLElement>('.timeline__list');
  if (!list) return;
  const { track, flight, ship } = createRouteSvg(list);
  const progress = { value: 0 };

  const apply = (): void => {
    flight.setAttribute('stroke-dashoffset', String(1 - progress.value));
    const length = track.getTotalLength();
    const at = length * progress.value;
    const point = track.getPointAtLength(at);
    const ahead = track.getPointAtLength(Math.min(at + 1, length));
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI + 90;
    ship.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
  };

  const layout = (): void => {
    const origin = list.getBoundingClientRect();
    const stations = [...list.querySelectorAll('.timeline__dot')].map((dot) => {
      const rect = dot.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - origin.left,
        y: rect.top + rect.height / 2 - origin.top,
      };
    });
    const d = buildRoutePath(stations, ROUTE_AMPLITUDE);
    track.setAttribute('d', d);
    flight.setAttribute('d', d);
    apply();
  };

  layout();
  new ResizeObserver(layout).observe(list);
  gsap.to(progress, {
    value: 1,
    ease: 'none',
    onUpdate: apply,
    scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 70%', scrub: 0.4 },
  });
}

function addScrollProgress(): void {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  gsap.fromTo(
    bar,
    { scaleX: 0 },
    { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
  );
}

function bindMagnetic(): void {
  for (const element of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    const toX = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3' });
    const toY = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3' });
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      toX((event.clientX - rect.left - rect.width / 2) * 0.3);
      toY((event.clientY - rect.top - rect.height / 2) * 0.3);
    });
    element.addEventListener('pointerleave', () => {
      toX(0);
      toY(0);
    });
  }
}

function startSmoothScroll(): void {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true, allowNestedScroll: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function startMotion(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  playHeroIntro();
  document.documentElement.classList.add('motion-on');
  revealTitles();
  fadeInBatch(REVEAL_TEXT, 24);
  fadeInBatch(REVEAL_CARDS, 56);
  revealProjectDetails();
  drawOrbit();
  flySatellite();
  drawTimeline();

  // Efeitos atrelados à rolagem custam um quadro inteiro por scroll: só com mouse.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    scrubHeroAway();
    addScrollProgress();
    startSmoothScroll();
    bindMagnetic();
  }
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
