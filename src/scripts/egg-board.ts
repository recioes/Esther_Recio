import type { EasterCopy } from '../i18n/types';
import type { EggId } from '../lib/hints';

/**
 * Depois de uma pista nova o quadro abre sozinho e se recolhe; abrir ou fechar à mão cancela isso.
 * Só abre quando nenhum aviso (toast) está na tela: abertos juntos, um cobriria o outro. Um tempo
 * fixo não basta, porque outros avisos (como a saudação por horário) duram mais e chegam a qualquer hora.
 */
const AUTO_OPEN_DELAY_MS = 3600;
const AUTO_OPEN_RETRY_MS = 400;
const AUTO_OPEN_MAX_WAIT_MS = 15_000;
const AUTO_CLOSE_MS = 7000;

export interface EggBoardState {
  readonly found: ReadonlySet<EggId>;
  /** Segredos que já ganharam pista, na ordem em que as pistas chegaram. */
  readonly clues: readonly EggId[];
  /** Quantos segredos este visitante consegue achar. */
  readonly total: number;
  /** Uma pista acabou de ser liberada (primeira descoberta de um segredo). */
  readonly fresh: boolean;
}

export interface EggBoard {
  render(state: EggBoardState): void;
}

/**
 * Quadro no canto inferior direito: contador "✦ n/total" que, ao clicar, mostra as pistas
 * acumuladas (uma por segredo descoberto). Só aparece depois do primeiro segredo achado.
 */
export function createEggBoard(copy: EasterCopy, isToastVisible: () => boolean): EggBoard {
  const root = document.createElement('section');
  root.className = 'egg-board';
  root.setAttribute('aria-label', copy.boardTitle);
  root.hidden = true;

  const list = document.createElement('ol');
  list.className = 'egg-board__list';
  list.id = 'egg-board-list';
  list.hidden = true;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'egg-board__toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', list.id);

  root.append(list, toggle);
  document.body.append(root);

  let openTimer = 0;
  let closeTimer = 0;
  const setOpen = (open: boolean): void => {
    list.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Tocar fora do quadro ou apertar Esc recolhe a lista (sem isso, no celular ela cobriria cartões).
  document.addEventListener('pointerdown', (event) => {
    if (list.hidden || (event.target instanceof Node && root.contains(event.target))) return;
    window.clearTimeout(closeTimer);
    setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || list.hidden) return;
    window.clearTimeout(closeTimer);
    setOpen(false);
  });

  return {
    render({ found, clues, total, fresh }) {
      const count = [...found].length;
      if (count === 0) return;
      const ratio = `${Math.min(count, total)}/${total}`;

      const visible = document.createElement('span');
      visible.setAttribute('aria-hidden', 'true');
      visible.textContent = `✦ ${ratio}`;
      const label = document.createElement('span');
      label.className = 'sr-only';
      label.textContent = `${copy.counterLabel}: ${ratio}. ${copy.boardTitle}`;
      toggle.replaceChildren(visible, label);

      const items = clues.map((egg, index) => {
        const item = document.createElement('li');
        const done = found.has(egg);
        item.dataset.done = String(done);
        if (fresh && index === clues.length - 1) item.classList.add('is-new');
        item.textContent = copy.hints[egg];
        return item;
      });
      if (found.size >= total) {
        const done = document.createElement('li');
        done.className = 'egg-board__done';
        done.textContent = copy.hintsDone;
        items.push(done);
      }
      list.replaceChildren(...items);

      root.hidden = false;
      if (!fresh) return;
      toggle.classList.remove('is-bump');
      void toggle.offsetWidth;
      toggle.classList.add('is-bump');
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      const startedAt = performance.now();
      const tryOpen = (): void => {
        // Ainda há aviso na tela: tenta de novo daqui a pouco (com um teto, para não ficar para sempre).
        if (isToastVisible() && performance.now() - startedAt < AUTO_OPEN_MAX_WAIT_MS) {
          openTimer = window.setTimeout(tryOpen, AUTO_OPEN_RETRY_MS);
          return;
        }
        setOpen(true);
        closeTimer = window.setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
      };
      openTimer = window.setTimeout(tryOpen, AUTO_OPEN_DELAY_MS);
    },
  };
}
