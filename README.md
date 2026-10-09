# Esther Recio — página de links

Página pessoal com meus perfis profissionais (LinkedIn, GitHub e Lattes), sobre a Terra girando em dia e noite. Online em https://recioes.github.io/Esther_Recio/

## Stack

- **Astro** (HTML estático, 0 KB de JS de framework) + **TypeScript** estrito
- **CSS nativo** com tokens e `@layer` (sem Tailwind e sem bibliotecas de animação)
- **Inter** variável, hospedada localmente
- Vitest (testes), Biome (lint e formatação), GitHub Actions (CI e deploy)

As decisões e o raciocínio estão em [`docs/adr/0001-modernizacao-pagina-links.md`](docs/adr/0001-modernizacao-pagina-links.md).

## Comandos

| Comando | O que faz |
|---|---|
| `npm ci` | Instala as dependências do lockfile |
| `npm run dev` | Servidor local (sem CSP, pois o Vite injeta código inline) |
| `npm run build` | Gera `dist/` e roda `scripts/verify-dist.mjs` |
| `npm run preview` | Serve o `dist/` como em produção (com CSP) |
| `npm test` | Testes unitários |
| `npm run lint` / `npm run format` | Biome |
| `npm run check` | Tipos (`astro check`) |
| `npm run verify` | Tudo acima, em sequência |

Requer Node 22 ou superior.

## Estrutura

```
src/
├── data/        # links e perfil (fonte única, tipada)
├── i18n/        # dicionários pt-BR e en
├── lib/         # funções puras e testadas (validação de links, CSP, ponteiro)
├── components/  # Hero, LinkCard, LanguageSwitch, EarthBackdrop, Profile
├── layouts/     # Base (head, CSP, meta tags)
├── pages/       # [...locale].astro gera "/" (pt-BR) e "/en/"
├── scripts/     # interações opcionais (spotlight, tilt, globo 3D)
└── styles/      # tokens.css, base.css e components/*.css
scripts/verify-dist.mjs   # guarda de segurança pós-build
tests/unit/               # Vitest
skills/                   # skills para agentes de IA (design, segurança, arquitetura, ADR)
```

## Como editar

- **Novo link:** adicione em `src/data/links.ts` e o texto em `src/i18n/*.ts`. O build falha se o host não estiver na allowlist (`AllowedHost` em `src/data/types.ts`) ou se o protocolo não for `https`.
- **Novo idioma:** crie um dicionário em `src/i18n/`, registre-o em `src/i18n/index.ts` e inclua o código em `Locale`.
- **Cores e espaçamentos:** somente em `src/styles/tokens.css`.

## Deploy

O workflow `deploy.yml` publica no GitHub Pages a cada push na `main`. Em **Settings → Pages**, a fonte precisa estar em **GitHub Actions**.

## Globo 3D

A Terra é um globo three.js (shader próprio: dia/noite com crepúsculo rosa, nuvens, atmosfera roxa, estrelas). Arraste para girar (com inércia); ele volta devagar para a vista do Brasil.

- O three.js (~132 KB gzip) é um chunk **lazy**: só baixa se houver WebGL, depois da primeira pintura. Sem WebGL, com erro ou antes de carregar, aparece o poster estático (`public/media/earth-poster.*`).
- Texturas em `public/textures/` (2k e 4k em WebP; 4k só em telas grandes/hidpi e sem `saveData`).
- `prefers-reduced-motion`: globo parado (ainda dá para arrastar, sem inércia).
- **Créditos das texturas:** vieram dos exemplos do repositório `vasturiano/three-globe` (MIT). A origem original das imagens (provavelmente NASA Blue/Black Marble) não foi confirmada: confirme a licença antes de divulgar, ou troque pelos mapas oficiais da NASA (domínio público).

## Acessibilidade e segurança

- Respeita `prefers-reduced-motion` (globo parado, sem tilt nem animações) e usa hover só com mouse.
- Foco por teclado visível; a página funciona sem JavaScript.
- Detalhes em [`SECURITY.md`](SECURITY.md).
