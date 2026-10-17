# CLAUDE.md

Personal links page of Esther Recio (Backend Developer): Astro static site, TypeScript, plain CSS in layers, three.js globe, published on GitHub Pages in pt-BR (`/`), en (`/en/`) and es (`/es/`). Details live in `README.md`; this file only holds what an agent must follow.

## Language

- Talk to the maintainer in **Brazilian Portuguese**.
- Code, comments, commits, PRs, README and docs are written in **English** (see `skills/git-workflow`). The only exception is site copy, which lives in `src/i18n/*.ts` and is written natively in each locale.

## Commands

| Command | Use |
|---|---|
| `npm run verify` | lint, types, unit tests, build and post-build security checks. **Required before saying "done".** |
| `npm run build && npm run qa` | end-to-end QA in a real browser (desktop, 3 locales, out-of-order play, emulated phones). Required when touching interaction, layout, easter eggs, the clue board or anything mobile. `-- --only=desktop,clues,wish,order,mobile` runs some sections. |
| `npm run cv` | regenerates the résumé PDFs in `public/cv/` (needs Edge/Chrome). Run it after any edit to `src/data/cv.ts`; PDFs are committed. |
| `npm run cv -- --variant=<id>` | per-job résumé into `cv-variants/` (git-ignored, never deployed) |
| `npm run format` | Biome auto-fix (run it, then re-read files it changed before editing them again) |
| `npm run dev` / `npm run preview` | dev server / production-like server (the real CSP applies only in `preview`) |

## Skills: read the matching one before you start

The skills in `skills/` are the project's standards. Open the `SKILL.md` that matches the task **before** acting, and follow it.

| When you are about to... | Read first |
|---|---|
| test a feature, review behavior, or **fix any bug** | `skills/qa-senior/SKILL.md` |
| check anything on phones/tablets, touch, small screens, overlays, performance | `skills/mobile-qa/SKILL.md` (together with qa-senior) |
| create a branch, commit, open or update a PR, write docs or the README | `skills/git-workflow/SKILL.md` |
| add or change UI, styles, animations, themes | `skills/premium-dark-ui/SKILL.md` |
| add a component, restructure code, move data/copy/styles, refactor | `skills/frontend-clean-architecture/SKILL.md` |
| change anything the site ships or how it is built (HTML/JS/CSS output, CSP, links, input handling, dependencies, npm scripts, workflows, build scripts, PDFs, personal data, repo settings), review a dependency PR, or prepare a PR/release | `skills/web-security-owasp/SKILL.md` — **mandatory**; run its review procedure |
| record a technical or architectural decision | `skills/adr-writer/SKILL.md` (ADRs live in `docs/adr/`) |

If a task spans several rows (e.g. a new easter egg: UI + QA + mobile + git), read all of them.

## Hard rules

1. **Never commit, push, or open a PR unless the maintainer asked in that message.** Approval does not carry over. Never work on `main`; branch first.
2. **Do not invent facts about Esther** (jobs, dates, numbers, skills, contacts, nationality). Source of truth: `src/data/*.ts`, `src/i18n/*.ts`, `src/data/cv.ts`, and what the maintainer says. If something is missing, ask or leave it out.
3. **Three locales stay in sync.** Any user-facing text change goes into `pt-BR`, `en` and `es` in the same change; `Dictionary` in `src/i18n/types.ts` enforces the shape and `tests/unit/content.test.ts` the consistency. Write each language natively, not as a literal translation.
4. **Security is a release gate, not a feature.** Follow `skills/web-security-owasp` (controls C1–C10 and its red lines). The CSP (with Trusted Types) forbids inline code, string-to-DOM injection and third parties; `scripts/verify-dist.mjs`, the CSP and supply-chain unit tests and the QA's CSP-violation check fail on regressions. Never weaken them to make something work. Never add analytics, trackers, CDNs or remote fonts. Never put personal data (e-mail, phone) in the site HTML; it belongs only in the résumé PDFs. Never change repository settings or close/merge PRs without explicit approval.
5. **Single sources.** Colors/spacing only in `src/styles/tokens.css`; links only in `src/data/links.ts` (host allowlist); résumé only in `src/data/cv.ts`; hints, words and clue text per egg id in `src/lib/hints.ts` + `src/i18n/*.ts`.
6. **Generated files are committed, not hand-edited:** `public/cv/*.pdf` (from `npm run cv`), `public/media/og-image.jpg` (from `scripts/generate-og-image.mjs`).
7. **No new dependencies without a reason stated to the maintainer.** Prefer the platform and the existing stack. QA tooling in `scripts/qa/` is dependency-free on purpose.

## Workflows

**Bug fix** (follow `qa-senior`): reproduce with a failing automated test first, state the root cause in one sentence, fix the cause (and misleading copy), make it green, search for sibling bugs of the same class, keep the regression test.

**Change to an easter egg or clue** (a checklist, because this area has regressed before):
1. The egg's id is in `EGG_IDS` (`src/lib/hints.ts`); it has a clue in all three dictionaries; the README table row is updated.
2. Every accepted word/input the clue could reasonably lead to is accepted (clue text is the spec: if it says "desejo" or "shooting star", typing that must work).
3. `discover(id)` is called at the moment the user does what the clue describes, not on a secondary path, and a toggle's first press counts whichever direction it goes.
4. Add or extend an action in `scripts/qa/easter-e2e.mjs` (`ACTIONS`), then run `npm run build && npm run qa`.
5. Check touch devices: is the egg reachable without keyboard/hover? If not, it must stay out of `reachableEggs` for touch.
6. The board must mirror progress in **any** order: every found egg has a struck entry, every entry is struck only if found (`boardEntries` in `src/lib/hints.ts`; `boardMatchesProgress` in the QA runs after every step). Test out-of-order play, not just the happy path.

**Résumé or content change:** edit data, then `npm run cv` (must stay one page per PDF; it fails otherwise), view the PDF output, then `npm run verify`.

**UI change:** look at it. Take screenshots with the QA harness or the browser and check desktop and a 390x844 phone. State assertions cannot see overlapping elements.

## Definition of done

- Security: the `web-security-owasp` review procedure was run for the change, with findings and residual risks reported.

Say "done" only when all of these are true, and say plainly which you could not do:
- `npm run verify` passes (paste the result line, not "it passes").
- For interaction/layout/mobile work, `npm run build && npm run qa` passes and screenshots were viewed.
- New behavior has a test that fails without the change.
- Docs/README updated when behavior, commands or conventions changed.
- Nothing committed unless asked; working tree changes are listed in the summary.

## Reporting

- Lead with the verdict, then evidence. Never write "tested" for something only reasoned about; separate **verified**, **warnings**, and **not tested** (e.g., real iOS Safari, real GPU performance).
- If you are unsure of a cause, say so and list hypotheses with how you ruled each in or out.
- When the maintainer reports a bug you cannot reproduce, say that, show what you tried, fix any real gap you found along the way, and ask for the exact steps and language.
- Be concise; do not restate the diff.

## Gotchas

- **Node:** the repo targets Node >= 22; local scripts (`build-cv`, `qa`) import `.ts` data directly and need type stripping (Node >= 22.18 or 24). Keep `scripts/verify-dist.mjs` free of TypeScript imports because the deploy runs it.
- **Files imported by Node scripts must have no imports of their own** (`src/data/cv.ts`, `src/data/cv-variants.ts`, `src/lib/constellation.ts`).
- Biome reformats on `npm run format`: re-read a file before doing exact-string edits after formatting.
- Windows shell: use `file:///` URLs for ESM imports in ad-hoc scripts; scratch files go to the session scratchpad, not the repo.
- The headless browser renders WebGL in software: absolute performance numbers are pessimistic; use them only to compare. Tap detection in the globe requires press and release within 350 ms, so the QA harness sends explicit input timestamps.
- Session state for the egg hunt lives in `sessionStorage` (`found-eggs`, `egg-clues`); clear it when retesting by hand.
