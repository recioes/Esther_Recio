import { PROFILE_LINKS } from '../data/links';
import { DEFAULT_LOCALE, dictionaries } from '../i18n';
import type { Dictionary } from '../i18n/types';
import { tapBoostMultiplier } from '../lib/boost';
import { dayPeriod, formatClock } from '../lib/greeting';
import {
  createSequenceMatcher,
  KONAMI_SEQUENCE,
  keyToToken,
  toWordSequence,
} from '../lib/sequence';
import { shootingStarDelayMs, shouldSpawnShootingStar } from '../lib/shooting-star';
import { createTapCounter } from '../lib/taps';
import { isThemeId, nextTheme, THEME_GLOBE, type ThemeId } from '../lib/themes';
import { printConsoleSignature } from './console-signature';
import { mountConstellation } from './constellation-ui';
import { createCursorTrail } from './cursor-trail';
import {
  glowName,
  rocketRain,
  spawnShootingStar,
  starBurstAt,
  toggleMoon,
  turboRocket,
} from './fx';
import type { GlobeHandle, MarkerUi } from './globe';
import { createMarkerTooltip } from './globe-tooltip';
import type { NameEffects } from './name-sparkles';
import { createToast } from './toast';

/**
 * Easter eggs da página. Nada aqui é necessário para usar o site: tudo é decorativo e
 * respeita "reduzir movimento" (nesse caso só aparecem os avisos de texto).
 *
 * - Konami (↑↑↓↓←→←→BA) ou segurar o nome: turbo no globo + foguete
 * - toques no globo: cada um gira mais rápido; no 10º o planeta fica "tonto"
 * - digitar: foguete/rocket (chuva), lua/moon (modo lunar), esther (nome brilha), estrela/wish
 * - 5 cliques no monograma: troca de tema
 * - constelação escondida no canto superior esquerdo
 * - estrela cadente rara (1 em 20 visitas)
 * - rastro de poeira estelar no mouse (tecla S, parada por 1 s, liga/desliga)
 * - recado no console do navegador
 */

type ActionId = 'turbo' | 'rain' | 'moon' | 'name' | 'wish';

const WORDS: readonly (readonly [ActionId, string])[] = [
  ['rain', 'foguete'],
  ['rain', 'rocket'],
  ['moon', 'lua'],
  ['moon', 'moon'],
  ['name', 'esther'],
  ['wish', 'estrela'],
  ['wish', 'wish'],
];

const SEQUENCES: Readonly<Record<string, readonly string[]>> = {
  ...Object.fromEntries(WORDS.map(([action, word]) => [`${action}:${word}`, toWordSequence(word)])),
  'turbo:konami': KONAMI_SEQUENCE,
};

const TURBO_BOOST = 10;
const TURBO_MS = 6000;
const TAP_WINDOW_MS = 2000;
const TAPS_UNTIL_DIZZY = 10;
const MONOGRAM_CLICKS_FOR_THEME = 5;
const MONOGRAM_WINDOW_MS = 2500;
const LONG_PRESS_MS = 900;
const LONG_PRESS_SLOP_PX = 10;
/** A tecla S só liga/desliga a poeira estelar se nada foi digitado no último segundo (não atrapalha as palavras). */
const TRAIL_KEY_IDLE_MS = 1000;
const GREETING_DELAY_MS = 2400;
const GREETED_KEY = 'greeted';

export interface EasterEnvironment {
  readonly reducedMotion: boolean;
  readonly finePointer: boolean;
  readonly name: NameEffects;
}

export interface EasterEggs {
  readonly markerUi: MarkerUi;
  onGlobeTap(): void;
  attachGlobe(handle: GlobeHandle): void;
}

function currentDictionary(): Dictionary {
  const lang = document.documentElement.lang;
  return (
    Object.values(dictionaries).find((dict) => dict.htmlLang === lang) ??
    dictionaries[DEFAULT_LOCALE]
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
  );
}

function wasGreeted(): boolean {
  try {
    return sessionStorage.getItem(GREETED_KEY) === '1';
  } catch {
    return false;
  }
}

function markGreeted(): void {
  try {
    sessionStorage.setItem(GREETED_KEY, '1');
  } catch {
    // Armazenamento bloqueado: a saudação pode reaparecer, sem problema.
  }
}

export function startEasterEggs(env: EasterEnvironment): EasterEggs {
  const dict = currentDictionary();
  const copy = dict.easter;
  const toast = createToast();
  const html = document.documentElement;
  const trail = env.finePointer && !env.reducedMotion ? createCursorTrail() : undefined;
  let globe: GlobeHandle | undefined;
  let theme: ThemeId = isThemeId(html.dataset.theme) ? html.dataset.theme : 'aurora';
  let turboUntil = 0;

  const actions: Readonly<Record<ActionId, () => void>> = {
    turbo() {
      const now = performance.now();
      if (now < turboUntil) return;
      turboUntil = now + TURBO_MS;
      toast.show(copy.turbo);
      globe?.boost(TURBO_BOOST, TURBO_MS);
      if (!env.reducedMotion) turboRocket();
      env.name.celebrate();
    },
    rain() {
      toast.show(copy.rocketRain);
      if (!env.reducedMotion) rocketRain();
    },
    moon() {
      toast.show(toggleMoon() ? copy.moonOn : copy.moonOff);
    },
    name() {
      toast.show(copy.nameGlow);
      glowName();
      env.name.celebrate();
    },
    wish() {
      const grant = (x: number, y: number): void => {
        starBurstAt(x, y);
        toast.show(copy.wish);
      };
      if (env.reducedMotion) toast.show(copy.wish);
      else spawnShootingStar(copy.shootingStarLabel, grant);
    },
  };

  // Teclado: Konami e palavras secretas; S liga/desliga o rastro de estrelas.
  const matcher = createSequenceMatcher(SEQUENCES);
  let lastKeyTime = Number.NEGATIVE_INFINITY;
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (isTypingTarget(event.target)) return;
    const token = keyToToken(event.key);
    if (token === undefined) return;

    const idle = event.timeStamp - lastKeyTime;
    lastKeyTime = event.timeStamp;
    if (token === 's' && trail && idle > TRAIL_KEY_IDLE_MS) {
      toast.show(trail.toggle() ? copy.trailOn : copy.trailOff);
    }

    const matched = matcher.feed(token);
    const action = matched?.split(':')[0] as ActionId | undefined;
    if (action) actions[action]();
  });

  // Segurar o nome (celular, onde não há teclado): mesmo efeito do Konami.
  const nameWrap = document.querySelector<HTMLElement>('[data-sparkle]');
  if (nameWrap) {
    let pressTimer = 0;
    let startX = 0;
    let startY = 0;
    const cancelPress = (): void => {
      window.clearTimeout(pressTimer);
      pressTimer = 0;
    };
    nameWrap.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
      cancelPress();
      pressTimer = window.setTimeout(actions.turbo, LONG_PRESS_MS);
    });
    nameWrap.addEventListener('pointermove', (event) => {
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > LONG_PRESS_SLOP_PX) {
        cancelPress();
      }
    });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) {
      nameWrap.addEventListener(type, cancelPress);
    }
  }

  // Cinco cliques no monograma: próximo tema.
  const applyTheme = (next: ThemeId): void => {
    theme = next;
    html.dataset.theme = next;
    globe?.setPalette(THEME_GLOBE[next].glow, THEME_GLOBE[next].twilight);
    trail?.refreshColors();
    toast.show(copy.themes[next]);
  };
  const monogramClicks = createTapCounter(MONOGRAM_WINDOW_MS);
  document.querySelector<HTMLElement>('.hero__monogram')?.addEventListener('click', () => {
    if (monogramClicks.record(performance.now()) < MONOGRAM_CLICKS_FOR_THEME) return;
    monogramClicks.reset();
    applyTheme(nextTheme(theme));
  });

  // Constelação escondida.
  mountConstellation((x, y) => {
    starBurstAt(x, y, 18);
    toast.show(copy.constellation);
  });

  // Estrela cadente rara.
  if (!env.reducedMotion && shouldSpawnShootingStar()) {
    window.setTimeout(actions.wish, shootingStarDelayMs());
  }

  // Saudação pela hora local, uma vez por sessão.
  if (!wasGreeted()) {
    window.setTimeout(() => {
      const now = new Date();
      toast.show(
        copy.greeting[dayPeriod(now.getHours())].replace('{time}', formatClock(now)),
        4800,
      );
      markGreeted();
    }, GREETING_DELAY_MS);
  }

  const linkedin = PROFILE_LINKS.find((link) => link.id === 'linkedin');
  if (linkedin) printConsoleSignature(copy.consoleHello, copy.consoleCta, linkedin.href);

  const globeTaps = createTapCounter(TAP_WINDOW_MS);
  return {
    markerUi: createMarkerTooltip(copy.markers),
    onGlobeTap() {
      if (!globe) return;
      const count = globeTaps.record(performance.now());
      if (count >= TAPS_UNTIL_DIZZY) {
        globeTaps.reset();
        globe.dizzy(2800);
        toast.show(copy.dizzy);
        return;
      }
      globe.boost(tapBoostMultiplier(count), 2500);
    },
    attachGlobe(handle) {
      globe = handle;
      if (theme !== 'aurora')
        handle.setPalette(THEME_GLOBE[theme].glow, THEME_GLOBE[theme].twilight);
    },
  };
}
