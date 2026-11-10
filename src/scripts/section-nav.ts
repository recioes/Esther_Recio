/** Marca no sumário a seção que está no meio da tela e, no celular, mantém o item visível na barra. */
const EDGE_TOLERANCE_PX = 4;

export function observeSectionNav(): void {
  const list = document.querySelector<HTMLElement>('[data-section-nav]');
  if (!list || typeof IntersectionObserver === 'undefined') return;

  const links = new Map<string, HTMLAnchorElement>();
  for (const link of list.querySelectorAll<HTMLAnchorElement>('a')) {
    links.set(link.hash.slice(1), link);
  }

  const nav = list.parentElement;
  const refreshEdges = (): void => {
    const end = list.scrollWidth - list.clientWidth;
    nav?.toggleAttribute('data-more-left', list.scrollLeft > EDGE_TOLERANCE_PX);
    nav?.toggleAttribute('data-more-right', list.scrollLeft < end - EDGE_TOLERANCE_PX);
  };
  refreshEdges();
  list.addEventListener('scroll', refreshEdges, { passive: true });
  window.addEventListener('resize', refreshEdges);

  const clear = (): void => {
    for (const link of links.values()) link.removeAttribute('aria-current');
  };

  const activate = (active: HTMLAnchorElement): void => {
    clear();
    active.setAttribute('aria-current', 'true');
    list.scrollTo({ left: active.offsetLeft - list.clientWidth / 3, behavior: 'smooth' });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const link = links.get(entry.target.id);
        if (link) activate(link);
        else clear();
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );

  // A primeira tela não tem item no sumário: ao voltar para ela, nada fica marcado.
  const firstScreen = document.querySelector('.page');
  if (firstScreen) observer.observe(firstScreen);
  for (const id of links.keys()) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
}
