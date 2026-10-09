---
name: premium-dark-ui
description: Use ao criar ou modernizar interfaces web com estética premium inspirada na Apple — tema escuro roxo/preto/rosa, vidro fosco, hover com spotlight, tipografia grande e motion acessível. Ideal para landing pages e páginas de links pessoais.
---

# Premium Dark UI (roxo · preto · rosa)

Objetivo: impacto visual alto com **simplicidade, desempenho e acessibilidade**. Menos elementos, melhor executados.

## Princípios

1. **Espaço e hierarquia antes de enfeite.** Um foco por tela, muito respiro, tipografia grande.
2. **Profundidade sutil:** vidro fosco, bordas de 1 px translúcidas, glow suave — nunca sombras pesadas.
3. **Cor com intenção:** fundo quase preto; roxo para atmosfera; rosa só para interação e destaque.
4. **Movimento com propósito:** reforça feedback (hover, foco, entrada). Nada que loope sem pausa.
5. **Progressive enhancement:** tudo funciona sem JS; efeitos só em dispositivos que suportam.

## Tokens (sempre via custom properties)

```css
:root {
  --color-bg: #07060b;
  --color-surface: rgb(255 255 255 / 0.04);
  --color-border: rgb(255 255 255 / 0.10);
  --color-text: #f5f5f7;
  --color-text-muted: #a1a1aa;
  --color-purple-500: #8b5cf6;
  --color-purple-700: #6d28d9;
  --color-pink-500: #ec4899;
  --color-pink-300: #f9a8d4;
  --gradient-brand: linear-gradient(135deg, #8b5cf6, #ec4899);

  --radius-lg: 20px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-fast: 150ms;
  --dur-med: 300ms;
  --font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

Regra: **nenhuma cor, raio ou duração fora dos tokens.**

## Tipografia

- Fonte: Inter variável **self-hosted** (nunca CDN de terceiros), fallback `system-ui`.
- Título: `font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 600–700; letter-spacing: -0.04em; line-height: 1.05`.
- Subtítulo em `--color-text-muted`; no máximo uma palavra/trecho em `--gradient-brand` (`background-clip: text`).
- Corpo ≥ 16 px; no máximo 2 pesos por tela.

## Componente de referência: card com spotlight

```css
.link-card {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  backdrop-filter: blur(24px) saturate(140%);
  color: var(--color-text);
  transition:
    transform var(--dur-med) var(--ease-out),
    border-color var(--dur-med) var(--ease-out);
}

.link-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: radial-gradient(
    320px circle at var(--mx, 50%) var(--my, 50%),
    rgb(139 92 246 / 0.35),
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--dur-med) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .link-card:hover { transform: translateY(-2px); border-color: rgb(236 72 153 / 0.5); }
  .link-card:hover::before { opacity: 1; }
}

.link-card:focus-visible {
  outline: 2px solid var(--color-pink-300);
  outline-offset: 3px;
}
.link-card:focus-visible::before { opacity: 1; }
```

```ts
// scripts/spotlight.ts — progressive enhancement, sem innerHTML
const cards = document.querySelectorAll<HTMLElement>("[data-spotlight]");

for (const card of cards) {
  card.addEventListener(
    "pointermove",
    (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    { passive: true },
  );
}
```

`style.setProperty` (CSSOM) é compatível com CSP `style-src 'self'`; não use `setAttribute("style", …)` nem `style="…"` no markup.

## Fundo temático (astronomia)

- Prefira um globo/cena WebGL **lazy** (import dinâmico após a primeira pintura, só se houver WebGL) com poster estático de fallback; GIF nunca.
- Canvas de fundo: `.page{pointer-events:none}` e filhos interativos `pointer-events:auto`; escute o arrasto na `window` e ignore a/button/input.
- `touch-action: pan-y pinch-zoom` para não bloquear a rolagem no mobile.
- `prefers-reduced-motion: reduce` → sem auto-rotação nem inércia (render sob demanda).
- Meta de peso: JS inicial < 5 KB gzip; chunk 3D < 150 KB gzip; texturas 2k por padrão, 4k só em telas grandes e sem `saveData`.

## Motion

- Entrada escalonada (`animation-delay` de 60–80 ms por item), duração ≤ 600 ms.
- Tilt 3D opcional: máximo 6°, `perspective: 800px`, só com `hover: hover`.
- Animar apenas `transform` e `opacity` (compositor).
- Sempre incluir:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

(Este é o único lugar onde `!important` é aceitável.)

## Acessibilidade

- Contraste mínimo WCAG AA (4,5:1 texto normal, 3:1 texto grande/UI).
- Texto branco sobre gradiente: use `#6d28d9 → #db2777` (≈ 4,6:1 ou mais). O gradiente `#8b5cf6 → #ec4899` serve para texto grande, anéis e ícones, não para texto pequeno sobre fundo claro.
- Sem foto: monograma (iniciais) em círculo de vidro com anel em gradiente é uma alternativa limpa; o fundo temático vira o protagonista.
- Estado de foco visível equivalente ao hover (teclado = mouse).
- Alvos de toque ≥ 44 × 44 px.
- Cada link com texto acessível claro (ex.: "LinkedIn (português)").
- `alt` descritivo na foto; elementos decorativos com `aria-hidden="true"`.

## Anti-padrões (não fazer)

- Neon saturado em tudo, múltiplos gradientes competindo, glow em texto corrido.
- Efeitos que dependem de hover sem alternativa para toque.
- Animações infinitas sem pausa; parallax agressivo; auto-scroll.
- Fontes, ícones ou scripts de CDN de terceiros.
- `!important`, valores mágicos, estilos inline.

## Checklist de entrega

- [ ] Todos os valores vêm de tokens
- [ ] Hover, foco e toque tratados separadamente
- [ ] `prefers-reduced-motion` respeitado
- [ ] Contraste AA verificado
- [ ] Funciona sem JS
- [ ] Sem recurso de terceiros em runtime
- [ ] Testado em 360 px, 768 px e desktop
