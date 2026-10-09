# ADR-0001 — Modernização da página de links profissionais

- **Status:** Aceito
- **Data:** 2026-10-08
- **Decisora:** Esther Recio
- **Repositório:** `recioes/Esther_Recio` → https://recioes.github.io/Esther_Recio/

---

## 1. Contexto

A página era um *link hub* estático: foto, nome, cargo ("Backend Developer") e três links (LinkedIn, GitHub, Lattes), sobre um GIF da Terra alternando dia e noite. Feita em HTML + CSS puros, com layout no Canva, para ficar exposta no LinkedIn.

**Estado anterior (lido do repo):**

| Achado | Impacto |
|---|---|
| `gif2.gif` (15,2 MB) como `background-image` de tela cheia | Pesado, sem pausa, ignora `prefers-reduced-motion` |
| Fonte `Mistrully` de `fonts.cdnfonts.com` (terceiro, sem SRI) | Dependência externa (supply chain), vazamento de IP, licença incerta |
| `target="_blank"` nos 3 links principais sem `rel="noopener noreferrer"` | Boa prática aplicada só no rodapé |
| `<html lang="en">` com público majoritariamente PT-BR | Acessibilidade e SEO |
| Um único link de LinkedIn, mas o perfil existe em PT e EN | Informação faltando |
| Card com `height: 800px` fixo, `!important` e regras duplicadas | Frágil em telas pequenas, difícil de manter |
| `favicon.ico` referenciado, mas ausente do repo | 404 silencioso |
| Cores: bege `#c4b09d` + `aliceblue`, hover `#800080` | Visual datado |

**Objetivo:** modernizar visual e experiência (roxo, preto, rosa; hover marcante; sensação "Apple"), mantendo o tema de astronomia, com desempenho e segurança.

## 2. Drivers de decisão

1. Impacto visual premium sem fricção para o visitante.
2. Segurança por padrão (OWASP): superfície mínima, sem terceiros em runtime.
3. Clean code e arquitetura: dados separados de apresentação, componentes pequenos, tokens de design.
4. Acessibilidade (WCAG 2.2 AA) e respeito a preferências do usuário.
5. Manutenção barata: é uma página pessoal, não um produto.
6. Hospedagem gratuita no GitHub Pages.

## 3. Opções consideradas

### Framework

| Opção | Prós | Contras |
|---|---|---|
| A. HTML/CSS/JS puros | Zero build e dependências | Sem componentes, i18n estruturado nem pipeline de assets |
| **B. Astro + TypeScript + CSS nativo** | HTML estático, 0 KB de JS de framework, componentes, i18n por rotas, deploy oficial no Pages | Introduz build e dependências npm |
| C. Vite + TS vanilla | Leve | Sem roteamento/i18n prontos |
| D. Next.js / React | Ecossistema | Runtime de JS desnecessário; muitas dependências |
| E. Tailwind | Velocidade de escrita | Para uma página, tokens CSS resolvem com menos ferramental |

### Fundo "Terra"

| Opção | Prós | Contras |
|---|---|---|
| GIF original | Simples | 15,2 MB, só 640×640, sem controle |
| `<video>` WebM + MP4 com poster | ~25× menor, pausável | Não é interativo; continua 640×640 |
| **Globo WebGL (three.js) lazy + poster de fallback** | Interativo, nítido (texturas 2k/4k), dia/noite real | ~132 KB gzip sob demanda; exige fallback e testes |

## 4. Decisão

**Astro + TypeScript (strict) + CSS nativo, publicado no GitHub Pages via GitHub Actions.**

### 4.1 Stack

| Camada | Escolha |
|---|---|
| Framework | Astro (estático, 0 KB de JS de framework) |
| Linguagem | TypeScript com `strict` e regras da config `astro/tsconfigs/strictest` |
| Estilo | CSS nativo: custom properties, `@layer`, `backdrop-filter`, `mask` |
| Tipografia | Inter variável, self-hosted (`@fontsource-variable/inter`) |
| Interações | TypeScript vanilla (~0,6 KB gzip): spotlight, tilt e carregamento lazy do globo |
| Mídia | Globo three.js (texturas WebP 2k/4k); poster em WebP renderizado do próprio globo; JPG só para `og:image` |
| Ícones | SVG inline próprios |
| i18n | Rotas `/` (pt-BR) e `/en/`, geradas por `[...locale].astro` a partir dos dicionários |
| Lint/format | Biome |
| Testes | Vitest (funções puras) + `scripts/verify-dist.mjs` (guarda pós-build) |
| CI/CD | GitHub Actions: CI, deploy no Pages, CodeQL, Dependabot |

### 4.2 Arquitetura

Dependências fluem em uma direção: `data → lib → components → pages`. Componentes não contêm URLs nem textos fixos.

```
src/
├── data/        # types.ts, links.ts, profile.ts (sem lógica)
├── i18n/        # types.ts, pt-BR.ts, en.ts, index.ts
├── lib/         # links.ts (validação), base-path.ts, pointer.ts, csp.ts
├── components/  # Hero, LinkCard, LanguageSwitch, EarthBackdrop, Profile, Icon
├── layouts/     # Base.astro (head, CSP, meta tags)
├── pages/       # [...locale].astro
├── scripts/     # interactions.ts
└── styles/      # tokens.css, base.css, components/*.css
scripts/verify-dist.mjs · tests/unit/ · docs/adr/ · skills/
```

**LinkedIn com um único link** (`https://www.linkedin.com/in/estherrecio/`). A primeira versão tinha dois botões (Português / English) com `?locale=`, mas o app do LinkedIn no celular intercepta o link e ignora o parâmetro, abrindo sempre no idioma do aparelho. Cada card tem exatamente um `href`:

```ts
// src/data/links.ts (trecho)
href: 'https://www.linkedin.com/in/estherrecio/',
```

`assertValidLinks` roda no build: todo `href` precisa ser `https:` e ter exatamente o host declarado (allowlist: `www.linkedin.com`, `github.com`, `lattes.cnpq.br`). Domínios que só *contêm* o host permitido são rejeitados.

### 4.3 Direção visual

Conceito: **"Observatório noturno"**: preto profundo, aurora roxa/rosa, vidro fosco, a Terra ao fundo.

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#07060b` | Fundo |
| `--color-surface` | `rgb(18 14 32 / 0.6)` | Cards (vidro escuro, garante contraste sobre o globo) |
| `--color-text` / `--color-text-muted` | `#f5f5f7` / `#a1a1aa` | Texto |
| `--color-purple-500` / `-700` | `#8b5cf6` / `#6d28d9` | Atmosfera, glow |
| `--color-pink-300` / `-500` / `-600` | `#f9a8d4` / `#ec4899` / `#db2777` | Foco, hover, acentos |
| `--gradient-brand` | roxo-500 → rosa-500 | Texto grande, anéis |
| `--gradient-action` | roxo-700 → rosa-600 | Fundo de botões com texto branco (≥ 4,5:1) |

- **Sem foto (decisão da dona):** monograma "ER" num círculo de vidro com anel em gradiente que gira devagar. A Terra vira o protagonista visual.
- **Cards:** vidro com `backdrop-filter`; **hover** com spotlight roxo que segue o cursor, tilt de até 5°, borda rosa e seta que desliza; **foco por teclado** com o mesmo destaque mais `outline`.
- **Fundo:** Terra "flutuando" no escuro (máscara radial apaga as bordas do quadro), com aurora e escurecimento por cima.
- **Movimento:** entrada escalonada; com `prefers-reduced-motion` o globo fica parado, o anel para e não há tilt.
- **Toque:** efeitos de hover só em `(hover: hover) and (pointer: fine)`; `:active` para toque.
- **Identidade:** `Mistrully` removida; entra Inter.

### 4.4 Segurança (OWASP)

Superfície: site estático, sem autenticação, formulários ou entrada de usuário. Os riscos reais ficam na **cadeia de suprimentos**, na **configuração** e na **conta do GitHub**.

| OWASP Top 10 (taxonomia 2021) | Controle aplicado |
|---|---|
| A01 Broken Access Control | 2FA/passkey, branch protection e PR obrigatório na `main` (**ação manual**, ver §6) |
| A02 Cryptographic Failures | Enforce HTTPS no Pages; só links `https:`; nenhum segredo no repo |
| A03 Injection | Sem `innerHTML`/`eval`; `style.setProperty` em vez de `style=`; CSP sem `unsafe-inline` |
| A04 Insecure Design | Zero terceiros em runtime; JS opcional |
| A05 Security Misconfiguration | CSP via `<meta>` (só em produção), `referrer` restrito, `SECURITY.md` |
| A06 Vulnerable & Outdated Components | Dependabot (npm e Actions), `npm audit` no CI, lockfile, `npm ci` |
| A07 Identification & Authentication Failures | 2FA na conta (**ação manual**) |
| A08 Software & Data Integrity Failures | Actions fixadas por SHA, `permissions` mínimas, `persist-credentials: false` |
| A09 Logging & Monitoring Failures | Sem logs no Pages (risco residual aceito); alertas do GitHub (Dependabot, CodeQL, secret scanning) |
| A10 SSRF | Não se aplica (sem backend) |

**CSP efetiva (gerada em `src/lib/csp.ts`):**

```
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; media-src 'self';
font-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests
```

Para isso funcionar: `build.inlineStylesheets: 'never'` e `assetsInlineLimit: 0` (sem CSS/JS inline nem `data:` URIs). A CSP não é aplicada em `npm run dev`, porque o Vite injeta código inline e usa WebSocket.

**Guarda pós-build (`scripts/verify-dist.mjs`)** falha o build se o HTML gerado tiver: CSP ausente ou com `unsafe-*`; `<style>`, `style=`, `<script>` ou handlers inline; URLs `javascript:`; recursos de terceiros; `target="_blank"` sem `rel="noopener noreferrer"`; `lang` ausente; ou se a ordem das camadas CSS sair diferente da declarada.

**Limitações honestas do GitHub Pages:**
- Não há headers HTTP próprios: sem `frame-ancestors` e `Permissions-Policy`; a CSP via `<meta>` não cobre `report-uri` nem `sandbox`. A proteção contra *clickjacking* é fraca. Se isso virar requisito, hospedar atrás de um CDN com regras de header (ex.: Cloudflare).
- `security.txt` e `robots.txt` só valem na raiz do domínio (`recioes.github.io`); em *project pages* não têm efeito. Por isso o canal de reporte é o `SECURITY.md`.
- Sem logs de acesso.

### 4.5 Clean code

- Responsabilidade única por componente e por função (≤ 20 linhas, *early return*).
- URLs em `data/`, textos em `i18n/`, valores visuais em `tokens.css`; sem `!important` (única exceção: bloco `prefers-reduced-motion`, na camada `reset`).
- CSS em camadas (`reset, tokens, base, components, utilities`) com BEM leve.
- TypeScript estrito, sem `any`, dados `readonly`.
- Código em inglês; conteúdo em PT-BR/EN.
- A página funciona 100% sem JS.

### 4.6 Metas e medições

| Métrica | Meta | Medido no build |
|---|---|---|
| JS inicial | < 5 KB gzip | **1,6 KB** |
| JS do globo (lazy) | < 150 KB gzip | **132 KB** (só com WebGL) |
| CSS | n/d | 3,2 KB gzip |
| HTML | n/d | 1,9 KB gzip |
| Fonte (subset latin) | n/d | 48 KB |
| Texturas | < 1 MB em telas comuns | 2k: **~0,55 MB**; 4k: ~1,15 MB; GIF original: 15,2 MB |
| Violações de CSP/erros de console | 0 | **0** (Chromium headless, PT, EN, mobile, movimento reduzido) |
| Lighthouse ≥ 95 / axe 0 violações | sim | **não medido ainda** (ver §6) |

## 5. Consequências

**Positivas**
- Visual muito mais forte; Terra interativa em 3D, ~13× mais leve que o GIF em telas comuns.
- Sem terceiros em runtime: menos risco e mais privacidade.
- Novo link ou idioma = editar `data/` e `i18n/`.
- Controles de segurança verificados a cada build, não só documentados.

**Negativas / custos**
- Passa a existir build e dependências npm a manter (Dependabot e lockfile mitigam).
- Sem headers HTTP reais no Pages.
- Origem/licença das texturas ainda a confirmar (ver README).
- Mais código para manter (shaders, matemática do globo), coberto por testes unitários.

**Riscos e mitigação**
- *Overengineering* para uma página simples: sem frameworks de UI nem bibliotecas de animação.
- Sem WebGL, contexto perdido ou rede lenta: o poster estático permanece e a página segue funcional.
- Canvas de fundo roubando cliques: `.page` com `pointer-events:none` e filhos interativos com `auto`; o arrasto escuta a `window` e ignora links/botões.

## 6. Status da implementação

| Item | Status |
|---|---|
| Projeto Astro, TS estrito, Biome, Vitest (19 testes) | Feito |
| Dados, i18n pt-BR/en, validação de links, CSP | Feito |
| Hero com monograma, LinkCard (spotlight/tilt), troca de idioma, globo 3D | Feito |
| Estrelas e foguete ao passar o mouse/tocar no nome (respeita movimento reduzido) | Feito |
| Texturas 2k/4k, poster renderizado do globo | Feito |
| CI, deploy, CodeQL, Dependabot (Actions fixadas por SHA) | Escrito; **ainda não executado** (precisa de push) |
| `verify-dist.mjs` | Feito |
| Verificação visual (desktop, mobile, hover, foco, EN, movimento reduzido) | Feita em Chromium headless |
| Playwright + axe-core e Lighthouse CI | **Pendente** |
| Globo 3D (three.js), arraste com inércia, fallback e movimento reduzido | Feito (verificado em Chromium/SwiftShader) |
| Confirmar licença das texturas | **Pendente** |

**Ações manuais no GitHub (não dá para fazer por código):**
1. **Settings → Pages → Source: GitHub Actions.**
2. Ativar 2FA/passkey na conta.
3. Branch protection na `main` (PR obrigatório, CI verde).
4. Ligar secret scanning, push protection e *private vulnerability reporting*.
5. Confirmar que *Enforce HTTPS* está ligado.

## 7. Decisões da dona e questões em aberto

**Decididas:**
- LinkedIn com **um único link padrão**, sem `?locale` (2026-10: o seletor PT/EN foi removido porque o app ignora o parâmetro). A versão em outro idioma fica a cargo do recurso "perfil em outro idioma" do próprio LinkedIn, que escolhe a versão pelo idioma de quem visita.
- **Foto removida**; monograma no lugar.
- Implementar com Astro.

**Em aberto:**
1. ~~Botões PT/EN do LinkedIn~~ Removidos: o app do LinkedIn ignora `?locale`.
2. ~~Globo 3D?~~ Resolvido: globo 3D implementado.
3. Domínio próprio? Permitiria headers via CDN, `security.txt` e URL mais curta.
4. ~~Resolução da animação~~ Resolvido: texturas 2k/4k. Falta confirmar a licença/origem delas.

## 8. Correções em relação à proposta inicial

- `security.txt` e `robots.txt` foram removidos do plano (não funcionam em project pages).
- Poster em WebP (e JPG para `og:image`), em vez de AVIF.
- `astro check` ainda não suporta TypeScript 7; o projeto fixa `typescript@6` para o type-check.
- Num primeiro build, o minificador reordenou as camadas de CSS e o `reset` passou por cima dos componentes. Corrigido repetindo a declaração de ordem em cada arquivo, e a ordem agora é verificada no `verify-dist.mjs`.

## 9. Referências

- OWASP Top 10, ASVS e Cheat Sheet Series (CSP, HTML5 Security, Third-Party JavaScript Management)
- WCAG 2.2; MDN (`rel=noopener`, CSP, `prefers-reduced-motion`, `@layer`)
- Documentação do GitHub Pages e do GitHub Actions (hardening de workflows)
