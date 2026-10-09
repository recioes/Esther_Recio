---
name: frontend-clean-architecture
description: Use ao estruturar, refatorar ou revisar um front-end (Astro, Vite, TypeScript, CSS) com clean code e arquitetura em camadas — dados separados de apresentação, tokens, CSS em camadas, testes e quality gates. Inclui playbook para migrar páginas HTML/CSS legadas.
---

# Front-end: clean code e arquitetura

Princípio central: **a solução mais simples que atenda aos requisitos de qualidade**. Para uma página estática, isso significa poucas camadas, mas bem separadas.

## Regra de dependência

```
data → lib → components → pages
```

- `data/`: fatos (links, textos fixos) em objetos tipados. Sem lógica.
- `i18n/`: textos por idioma. Componentes recebem texto por props.
- `lib/`: funções puras, sem DOM, testáveis (ex.: `validateLinks`).
- `components/`: apresentação. Sem URLs nem textos hard-coded.
- `pages/`: composição. Monta componentes com dados.
- Nada importa "para cima" (um componente não importa uma página).

## Estrutura base

```
src/
├── data/        # links.ts
├── i18n/        # pt-BR.ts, en.ts
├── lib/         # funções puras
├── components/  # Hero, LinkCard, Footer…
├── layouts/     # Base (head, meta, CSP, lang)
├── pages/
├── scripts/     # melhorias progressivas (spotlight.ts)
└── styles/      # tokens.css, base.css, components/
tests/{unit,e2e}
```

## Clean code (regras objetivas)

- **SRP:** um componente = uma responsabilidade visual; uma função = uma coisa.
- **Funções ≤ 20 linhas**, no máximo 3 parâmetros, *early return* em vez de aninhamento.
- **Nomes revelam intenção:** `PROFILE_LINKS`, `isAllowedHost`, não `arr`, `check`.
- **Sem magic values:** cores, espaçamentos e durações vêm de tokens; strings repetidas viram constantes.
- **Sem comentários que repetem o código.** Comente o *porquê*, não o *o quê*.
- **Código em inglês; conteúdo em PT-BR/EN.**
- **Sem código morto**, sem `console.log` commitado, sem TODO sem dono/data.
- **Imutabilidade:** `readonly` e `as const` nos dados.

## TypeScript

`tsconfig` com:
```json
{ "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true, "exactOptionalPropertyTypes": true } }
```
- Proibido `any`; use `unknown` + *narrowing*.
- Tipos literais para IDs e hosts (`type LinkId = "github" | "lattes"`).
- Validar dados externos na borda; dentro do app, confiar nos tipos.

## CSS

```css
@layer reset, tokens, base, components, utilities;
```
- **Repita a declaração da ordem das camadas no topo de cada arquivo CSS** e valide o CSS final no build. Minificadores podem reordenar blocos `@layer`: num caso real, o `reset` passou por cima dos componentes (`display: none` não pegava). Teste: ordem de primeira aparição dos blocos no CSS final = ordem declarada.
- Tokens em `:root`; componentes só consomem tokens.
- Seletores de classe (BEM leve: `.link-card`, `.link-card__icon`); **sem ID, sem `!important`** (exceção única: bloco `prefers-reduced-motion`).
- Mobile-first; unidades relativas (`rem`, `clamp()`); sem alturas fixas em containers de conteúdo.
- Um arquivo de estilo por componente, escopado.

## JavaScript

- Opcional: a página precisa funcionar sem JS.
- Módulos ES pequenos, um por comportamento.
- Sem `innerHTML`; usar `textContent` e APIs do DOM.
- Respeitar `prefers-reduced-motion` e `(hover: hover)` dentro do script.

## Testes e qualidade

| Camada | Ferramenta | O que cobre |
|---|---|---|
| Unitário | Vitest | `lib/` e validação de `data/` (hosts, `https:`) |
| E2E | Playwright | Navegação, `lang`, links com `rel`, 0 violações de CSP |
| A11y | axe-core | 0 violações |
| Perf/SEO | Lighthouse CI | ≥ 95 em todas as categorias |
| Estilo | Biome (ou ESLint + Prettier) | Lint e format |

Quality gates sugeridos: LCP < 2 s, CLS 0, JS < 5 KB gzip, vídeo/imagens otimizados.

## Definição de pronto

- [ ] Lint, tipos e testes passando no CI
- [ ] axe sem violações; Lighthouse ≥ 95
- [ ] Sem URLs/textos/cores hard-coded em componentes
- [ ] Sem `!important`, `any`, `innerHTML`
- [ ] README e ADR atualizados
- [ ] Commits no padrão Conventional Commits

## Playbook: migrar página HTML/CSS legada

1. **Diagnosticar** (listar problemas com evidência: arquivo e linha).
2. **Extrair dados:** URLs e textos para `data/` e `i18n/`.
3. **Extrair tokens:** cores, tamanhos, fontes → `tokens.css`.
4. **Componentizar:** blocos repetidos viram componentes.
5. **Limpar CSS:** remover duplicatas e `!important`; substituir `px` fixos por escala relativa.
6. **Corrigir pontos de segurança/acessibilidade:** `rel`, `lang`, `alt`, foco visível, favicon.
7. **Otimizar assets:** GIF → vídeo + poster; imagens → AVIF/WebP.
8. **Adicionar testes e CI**, depois visual novo.
9. Cada etapa em commit/PR pequeno; **não misturar refatoração com mudança visual**.

## Anti-padrões

- Framework pesado para página simples; biblioteca de animação para um hover.
- Lógica de negócio em componentes de UI.
- Copiar/colar markup em vez de componente.
- Estilo inline, IDs como hooks de CSS, alturas fixas.
- Mudar comportamento sem teste.
