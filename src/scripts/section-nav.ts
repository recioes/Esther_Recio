/** Marca no sumário a seção que está no meio da tela e, no celular, mantém o item visível na barra. */
export function observeSectionNav(): void {
  const list = document.querySelector<HTMLElement>('[data-section-nav]');
  if (!list || typeof IntersectionObserver === 'undefined') return;

  const links = new Map<string, HTMLAnchorElement>();
  for (const link of list.querySelectorAll<HTMLAnchorElement>('a')) {
    links.set(link.hash.slice(1), link);
  }

  const activate = (active: HTMLAnchorElement): void => {
    for (const link of links.values()) link.removeAttribute('aria-current');
    active.setAttribute('aria-current', 'true');
    list.scrollTo({ left: active.offsetLeft - list.clientWidth / 3, behavior: 'smooth' });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const link = links.get(entry.target.id);
        if (entry.isIntersecting && link) activate(link);
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );

  for (const id of links.keys()) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
}
