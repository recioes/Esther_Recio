/**
 * A linha do tempo "acende" item a item ao entrar na tela (como as cidades no lado noturno do globo).
 * Sem JS ou sem IntersectionObserver, tudo fica aceso: a classe `timeline-ready` só é posta aqui.
 */
const LIT_CLASS = 'is-lit';

export function observeTimeline(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-timeline-item]');
  if (items.length === 0 || typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(LIT_CLASS);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.3, rootMargin: '0px 0px -8% 0px' },
  );

  document.documentElement.classList.add('timeline-ready');
  for (const item of items) observer.observe(item);
}
