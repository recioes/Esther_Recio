# Esther Recio — links page

Personal page with my professional profiles (LinkedIn, GitHub and Lattes), my career journey, education, languages and academic activities, in Portuguese, English and Spanish, over a spinning Earth. Live at https://recioes.github.io/Esther_Recio/

## Stack

- **Astro** (static HTML, 0 KB of framework JS) + strict **TypeScript**
- **Native CSS** with tokens and `@layer` (no Tailwind, no animation libraries)
- **Inter** variable font, self-hosted
- Vitest (tests), Biome (lint and formatting), GitHub Actions (CI and deploy)

Decisions and reasoning are in [`docs/adr/0001-modernizacao-pagina-links.md`](docs/adr/0001-modernizacao-pagina-links.md) (Portuguese, translated when next touched).

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Installs dependencies from the lockfile |
| `npm run dev` | Local server (no CSP, because Vite injects inline code) |
| `npm run build` | Generates `dist/` and runs `scripts/verify-dist.mjs` |
| `npm run preview` | Serves `dist/` as in production (with CSP) |
| `npm test` | Unit tests |
| `npm run lint` / `npm run format` | Biome |
| `npm run check` | Types (`astro check`) |
| `npm run verify` | All of the above, in sequence |

Requires Node 22 or later.

## Structure

```
src/
├── data/        # links, profile, timeline and academic data (single typed source)
├── i18n/        # pt-BR, en and es dictionaries (site copy)
├── lib/         # pure, tested functions (link validation, CSP, pointer, periods, sequences...)
├── components/  # Hero, LinkCard, LanguageSwitch, EarthBackdrop, About, Languages, Timeline, Academic, Profile
├── layouts/     # Base (head, CSP, meta tags, Open Graph)
├── pages/       # [...locale].astro builds "/" (pt-BR), "/en/" and "/es/"; 404.astro
├── scripts/     # optional interactions (spotlight, tilt, 3D globe, easter eggs)
└── styles/      # tokens.css, base.css and components/*.css
scripts/verify-dist.mjs        # post-build security guard
scripts/generate-og-image.mjs  # builds the 1200x630 share preview
tests/unit/                    # Vitest
CLAUDE.md                      # rules and skill routing for AI agents working in this repo
skills/                        # skills for AI agents (design, security, architecture, ADR, git, QA, mobile QA)
```

## How to edit

- **New link:** add it to `src/data/links.ts` and its copy to `src/i18n/*.ts`. The build fails if the host is not in the allowlist (`AllowedHost` in `src/data/types.ts`) or the protocol is not `https`.
- **New language:** create a dictionary in `src/i18n/` (it must implement the whole `Dictionary` type), register it in `src/i18n/index.ts` and add its code to `Locale`. The unit tests fail if any text, timeline item, activity or key number is missing or inconsistent across languages.
- **Writing content:** do not invent facts. Dates live in `src/data/*.ts` and are formatted per language by `src/lib/period.ts`, so periods cannot drift between versions. Write each language natively, not as a literal translation.
- **Colors and spacing:** only in `src/styles/tokens.css`.
- **Git and docs conventions:** see [`skills/git-workflow/SKILL.md`](skills/git-workflow/SKILL.md). Branches are `type/topic-topic`, commits are `Type: verb object`, and PRs, README and docs are written in English.

## Deploy

The `deploy.yml` workflow publishes to GitHub Pages on every push to `main`. Under **Settings → Pages**, the source must be **GitHub Actions**.

## 3D globe

The Earth is a three.js globe with a custom shader: day and night with a pink twilight, clouds, a purple atmosphere and stars. Drag to spin it (with inertia); it slowly returns to the view over Brazil.

- The lighting is fixed (the same for every visitor, at any time of day).
- Glowing, pulsing markers for **Brasília** and **Santander** (`src/lib/markers.ts`). Hover or tap to see the name.
- three.js (~132 KB gzip) is a **lazy** chunk: it is only downloaded when WebGL is available, after the first paint. Without WebGL, on error, or before it loads, a static poster is shown (`public/media/earth-poster.*`).
- Textures live in `public/textures/` (2k and 4k WebP; 4k only on large or hi-dpi screens without `saveData`).
- `prefers-reduced-motion`: the globe stays still (dragging still works, without inertia).
- **Texture credits:** they come from the examples of the `vasturiano/three-globe` repository (MIT). The original source of the images (probably NASA Blue/Black Marble) was not confirmed: confirm the license before promoting the page, or swap them for the official NASA maps (public domain).

## Content sections

All copy lives in `src/i18n/{pt-BR,en,es}.ts`; structured facts (dates, order, languages, authors) live in `src/data/`.

- **About** and **Languages:** positioning, how the two degrees combine, and the multilingual background (native Portuguese and Spanish, fluent English). Lived international background is kept separate from professional experience.
- **Journey** (`src/data/timeline.ts`): work and education in one timeline (circle = experience, diamond = education), with concrete contributions per item. Items "light up" on scroll; without JavaScript they all show lit.
- **Academic activities** (`src/data/academic.ts`): the conference paper, the teaching assistantship and the organizing committee, so they are not duplicated in the education cards.
- Content source: LinkedIn plus information provided by Esther. Anything not confirmed is left out.

## Résumé (PDF)

The first card on the page downloads a one-page A4 résumé in the language of the page (`public/cv/Esther-Recio-CV-{pt-BR,en,es}.pdf`). The Spanish one also states the dual nationality and the years in Spain.

- Content lives in `src/data/cv.ts` (self-contained, no imports). Layout: single column, real selectable text, standard headings, no icons or images, so both ATS parsers and people read it well.
- After editing it, run `npm run cv` (needs Edge or Chrome; set `CV_BROWSER` to point at another one). The script renders each language and fails if any PDF goes past one page. The PDFs are committed, so the deploy needs no browser.
- Contact line: add e-mail, phone or city to `CV_CONTACT.extra` if you want them printed.

## Projects, sitemap and printing

- **Projects** (`src/data/projects.ts`): one featured public repository, iHairCare Backend API. Copy follows its README; private repositories are never linked. To feature more, add an entry there and its text under `projects.items` in each dictionary.
- **Sitemap:** `src/pages/sitemap.xml.ts` emits `/sitemap.xml` with the three languages tied together by `hreflang`; each page also links its language's PDF with `rel="alternate"`. There is no `robots.txt` because GitHub Pages only honors it at the domain root, which a project site does not control. Submit the sitemap URL in Google Search Console if you want faster indexing.
- **Printing:** `src/styles/components/print.css` makes "Save as PDF" on the site itself readable (white background, no globe or effects, links spelled out).
- **No analytics on purpose:** counting visits or PDF downloads needs a third-party service, which the CSP (`script-src 'self'`, `img-src 'self'`, `connect-src 'none'`) and the post-build checks forbid. GitHub Pages has no built-in visit counter (the repository's Insights → Traffic only counts views of the repository on github.com, not of the site). If you ever want one, a cookieless service such as GoatCounter would need a CSP exception and an account.

### Résumé variants per job

`npm run cv -- --variant=messaging` (or `platform`) writes tailored one-page PDFs to `cv-variants/<id>/` (git-ignored, never deployed). A variant only changes the headline, summary and the order of skills and of the current role's bullets (`src/data/cv-variants.ts`); no new facts. `npm run cv -- --list` lists them.

## Share preview and 404

- `public/media/og-image.jpg` (1200x630) is generated by `node scripts/generate-og-image.mjs` and committed. Re-run it only when the visual changes.
- `src/layouts/Base.astro` emits the Open Graph and Twitter card tags (large image, size, alt text, locale alternates). The build checks them.
- `src/pages/404.astro` is the themed 404 page ("Houston, we lost the signal"). GitHub Pages serves it for any unknown address.

## Easter eggs

Everything is decorative, costs nothing to visitors who do not look for it, and respects `prefers-reduced-motion` (only text messages appear). Code in `src/scripts/easter-eggs.ts`, copy under `easter` in the dictionaries.

| How to trigger | What happens |
|---|---|
| Konami code (↑↑↓↓←→←→ B A), or press and hold the name (mobile) | Turbo globe and a giant rocket |
| Tap the globe repeatedly | Each tap spins it faster; on the 5th the planet gets "dizzy" |
| Type `foguete` / `rocket` / `cohete` | Rocket rain |
| Type `lua` / `moon` / `luna` | The moon appears for 12 s (typing again restarts the timer) |
| Type `esther` | The name glows |
| Type `estrela` / `estrella` / `star` / `shootingstar` / `wish` / `desejo` / `deseo` | A clickable shooting star (make a wish); it also shows up on its own in 1 of 20 visits |
| Click the "ER" monogram 5 times | Theme change: aurora → sunset → terminal |
| Hidden constellation (top-left corner) | Connect the 5 stars in the right order to draw a five-pointed star |
| Move the mouse | Stardust trail; the `S` key (after 1 s without typing) toggles it |
| Open the browser console | A note with the LinkedIn link |
| Finding an egg for the first time | The bottom-right board ("✦ n/9") opens by itself with a new riddle-style clue for another, still-hidden egg, then folds away. Clues pile up there, one per first discovery, and click on the counter reopens them; found eggs get a check, including eggs found out of order before their clue showed up. Finding an egg again adds nothing. State lasts for the tab session; touch devices only get clues for eggs they can reach |
| Finding every egg | Grand finale: the page dims, fireworks (canvas, lighter on touch screens) burst around a centered congratulations card in the page's language. Closes with ×, Escape, a tap on the dimmed area (which never activates links underneath) or on its own after ~10 s. With reduced motion, only the card appears |
| Greeting | A message based on the visitor's local time, once per part of the day (dawn, morning, afternoon, evening) in each tab session: not on reload, but again when the part of the day changes. It waits until the tab is visible |

## Testing

- `npm test`: unit tests (pure logic, content consistency across the three languages).
- `npm run build && npm run qa`: end-to-end QA in a real browser (Edge or Chrome, no extra dependencies) against `dist/`. It performs every easter egg exactly as its clue describes and checks the clue board, then repeats on emulated phones (390x844 and 320x568, touch, 4x slower CPU): touch-only eggs, tap target sizes, overflow, overlays, long tasks. Screenshots go to the temp folder it prints. Warnings do not fail the run; failures do.
- QA guidance for agents: [`skills/qa-senior/SKILL.md`](skills/qa-senior/SKILL.md) and [`skills/mobile-qa/SKILL.md`](skills/mobile-qa/SKILL.md).

## Accessibility and security

- Respects `prefers-reduced-motion` (still globe, no tilt or animations) and uses hover only with a mouse.
- Visible keyboard focus; the page works without JavaScript.
- Details in [`SECURITY.md`](SECURITY.md).
