/** Aviso discreto (região `role="status"`, lida por leitores de tela) para os easter eggs. */
export interface Toast {
  show(message: string, durationMs?: number): void;
  /** Há um aviso na tela agora (o quadro de pistas espera ele sumir para abrir). */
  isVisible(): boolean;
}

const DEFAULT_DURATION_MS = 3400;

export function createToast(): Toast {
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  document.body.append(element);

  let timer = 0;
  return {
    show(message, durationMs = DEFAULT_DURATION_MS) {
      element.textContent = message;
      element.classList.add('is-visible');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => element.classList.remove('is-visible'), durationMs);
    },
    isVisible() {
      return element.classList.contains('is-visible');
    },
  };
}
