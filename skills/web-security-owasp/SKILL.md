---
name: web-security-owasp
description: Use for ANY change that touches what the site ships or how it is built — HTML/JS/CSS output, CSP, links, user/URL/storage input, dependencies, npm scripts, GitHub Actions, build scripts, personal data, generated files (PDFs) or repository settings — and before every PR or release. Acts as a senior security engineer for a static site on GitHub Pages: threat model, mandatory controls with how each is verified, dependency-update protocol, severity rubric and honest residual-risk reporting.
---

# Web security for this static site (senior security engineer)

**Stance.** Assume something will go wrong: a dependency gets hijacked, a workflow gets a malicious input, a future change adds an `innerHTML`. Every control must be **layered** (defense in depth) and **verified by a check that fails the build or the QA**, not by good intentions. Never say the site "is secure"; say which controls are in place, how they were verified, and what risk remains.

## 1. Threat model (keep it current)

| Asset | What an attacker wants | Main entry points |
|---|---|---|
| Integrity of the published site | Serve malicious JS to visitors, deface, phish | Compromised npm package or GitHub Action; account takeover; malicious PR merged; XSS via a DOM sink |
| Maintainer account and repository | Push to `main`, steal tokens, tamper with releases | Weak 2FA, leaked token, missing branch protection, `pull_request_target` misuse, script injection in workflows |
| Visitor privacy | Track or fingerprint visitors | Third-party resources (fonts, CDNs, analytics), referrer leaks |
| Esther's personal data | Harvest e-mail/phone, profile her | PII in HTML, PDF metadata, repository history |
| Build machine / CI | Run code on install | npm lifecycle scripts, typosquatted packages |

There is no backend, no auth, no forms: **supply chain, CI/CD and the account are the real attack surface**, followed by client-side injection.

## 2. Mandatory controls and how each is verified

A control without a verification is a wish. Do not merge a change that breaks any row.

| # | Control | Verified by |
|---|---|---|
| C1 | **CSP** (`src/lib/csp.ts`): `default-src 'none'`, `'self'` only for script/style/img/font/media, `connect-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `upgrade-insecure-requests`, **Trusted Types** (`require-trusted-types-for 'script'; trusted-types 'none'`). Never `unsafe-inline`, `unsafe-eval`, `unsafe-hashes`, `data:`/`blob:` for scripts, wildcards or external hosts. | `tests/unit/csp.test.ts`; `scripts/verify-dist.mjs` (meta present, no `unsafe-*`, TT present, no inline `<script>`/`<style>`/`style=`/`on*=`/`javascript:`); `npm run qa` asserts **0 `securitypolicyviolation` events** on every page |
| C2 | **No DOM injection.** Only `textContent`, `createElement`, `setAttribute` with constant names. Never `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string `setTimeout`, `srcdoc`, Astro `set:html`. | Trusted Types makes these throw in the browser; grep in the review procedure; CodeQL |
| C3 | **Untrusted input is parsed against an allowlist.** `location`, `sessionStorage`/`localStorage`, `document.referrer`, `postMessage`, URL params, key events: treat as hostile, accept only known values (e.g., `parseEggList` keeps only `EggId`s). No `postMessage` listener without an exact `event.origin` check. | Unit tests for each parser with junk input |
| C4 | **Links**: `https:` only, host allowlist (`src/lib/links.ts`, project repos checked in `projects.test.ts`), `target="_blank"` always with `rel="noopener noreferrer"`, downloads only same-origin. | `assertValidLinks` fails the build; `verify-dist` checks `rel` |
| C5 | **Zero third parties at runtime** (fonts, icons, scripts, analytics, embeds). If one is ever unavoidable: pinned version + SRI `integrity` + `crossorigin`, a CSP entry for that exact origin, and an ADR. | `verify-dist` "sem recursos de terceiros"; CSP test forbids `https?:` |
| C6 | **Supply chain (npm)**: lockfile committed; every package `resolved` from `https://registry.npmjs.org/` with `sha512` integrity; exact semver ranges (no git/URL/file/`latest`); `.npmrc` with `ignore-scripts=true` and the official registry; no project install hooks; `npm ci` in CI; `npm audit signatures` and `npm audit --audit-level=high` in CI; Dependabot with **cooldown** (7 days, 3 for patches). | `tests/unit/supply-chain.test.ts`; CI steps; `.github/dependabot.yml` |
| C7 | **CI/CD**: every action pinned by full commit SHA (version in a comment); `permissions: contents: read` at the top, elevated per job only where needed (`pages: write`, `id-token: write` only in deploy; `security-events: write` only in CodeQL); `persist-credentials: false`; no `pull_request_target`; **never interpolate `${{ github.event.* }}` or other user-controlled values inside `run:`** (pass via `env:` and quote); no secrets printed; deploy through the `github-pages` environment. | Review procedure step 5 |
| C8 | **Secrets**: none in the repo or history; `.env*` ignored; secret scanning and push protection enabled on GitHub. | Review procedure step 4; GitHub settings |
| C9 | **Privacy and PII**: no e-mail/phone/address in site HTML; PII only in the résumé PDFs, with the owner's consent; PDF metadata scrubbed (`/Creator` user agent removed by `scrubPdfCreator`); `referrer` = `strict-origin-when-cross-origin`; no cookies, no tracking. | `verify-dist` (no third parties); manual check of PDF metadata after `npm run cv` |
| C10 | **Repository and account**: 2FA with passkey/security key; ruleset on `main` **enforced** (PR required, required status checks `verify`/`CodeQL`, no force-push, no deletion); Dependabot alerts and security updates on; secret scanning + push protection on; private vulnerability reporting on; CodeQL on schedule; review collaborators, deploy keys and personal access tokens periodically. | `gh api` checks in review procedure step 6 (read-only). Changing settings requires the maintainer's explicit approval |

## 3. Review procedure (run it, paste evidence)

1. **Scope**: list what changed (`git diff --stat`) and map each file to the controls above.
2. **Static checks**: `npm run verify` (lint, types, unit incl. CSP and supply-chain tests, build, `verify-dist`).
3. **Runtime checks**: `npm run build && npm run qa` — 0 CSP violations, 0 JS errors on every page/locale/device.
4. **Sinks and secrets**:
   ```sh
   grep -rnE "innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function|set:html|srcdoc|javascript:" src scripts
   git log -p --all | grep -nE "ghp_|github_pat_|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY|xox[baprs]-"
   ```
5. **Workflows**: for each `.github/workflows/*.yml` check C7 line by line (SHA pins, permissions, triggers, `run:` interpolation).
6. **Repository posture** (read-only):
   ```sh
   gh api repos/OWNER/REPO --jq .security_and_analysis
   gh api repos/OWNER/REPO/rulesets            # enforcement must be "active"
   gh api repos/OWNER/REPO/pages --jq .https_enforced
   ```
7. **Abuse test** (mutation check for the defenses): in the QA browser, try `insertAdjacentHTML('<img src=x onerror=…>')`, appending an external and an inline `<script>`, and `fetch('https://evil.example')`. All four must be blocked and each must produce a `securitypolicyviolation`. If any succeeds, it is a blocker.
8. **Report** (section 6).

## 4. Dependency update protocol (Dependabot or manual)

Accept an update only after all of these:
- **Why**: security fix, bug that affects us, or routine patch. Major versions need a reason and a read of the migration guide.
- **Age and provenance**: published at least the cooldown period ago (unless it fixes a vulnerability); `npm view <pkg>@<ver> time`; provenance attestation present (`npm view <pkg>@<ver> dist.attestations`).
- **Lockfile diff is explainable**: only the expected packages change; flag any **new transitive dependency**, new maintainer, new `hasInstallScript`, non-registry `resolved`, or a name close to a popular package (typosquatting).
- **Verify locally**: apply, then `npm audit signatures`, `npm audit`, `npm run verify`, and `npm run build && npm run qa`. Compare your lockfile diff with the bot's: it must be identical.
- **Merge path**: prefer merging the bot PR after review; if the update was applied in another branch, close the bot PR with a comment linking where it landed.

## 5. Platform limits (GitHub Pages) and residual risks — always declare

- No custom HTTP headers: CSP is delivered by `<meta>`, so there is no `frame-ancestors` (clickjacking protection), no `report-to`, no `Permissions-Policy`, no HSTS preload control. The site has no state-changing actions, so clickjacking impact is low; accepted and documented.
- No access logs; detection depends on GitHub alerts.
- `security.txt`/`robots.txt` only work at the domain root, which a project site does not control (`SECURITY.md` is the contact channel).
- The résumé PDFs intentionally publish an e-mail address: scraping/spam risk accepted by the owner.
- Moving to a host with header control (Cloudflare Pages, Netlify) would close the header gaps; record in an ADR if requirements change.

## 6. Severity and reporting

| Severity | Examples | Action |
|---|---|---|
| Critical | Executable XSS, secret in the repo, unpinned or compromised action with write permission, push to `main` possible without review | Stop; fix before anything else; rotate secrets |
| High | CSP weakened, third-party script, dependency with high CVE, `pull_request_target` with checkout, settings like secret scanning/branch protection off | Fix in this change or block release |
| Medium | Missing verification for a control, PII/metadata leak, outdated pinned action | Fix soon; track |
| Low | Defense-in-depth gaps with no current exploit path | Document; schedule |

Report format: **verdict** → findings (severity, evidence, fix, status) → controls verified (with the command/test that proved it) → **not verified** (and why) → residual risks. Never write "secure" or "no vulnerabilities"; write "no findings in the scope checked, with these checks".

## 7. Red lines (never, even to "make it work")

- Never add `unsafe-inline`, `unsafe-eval`, wildcard or external origins to the CSP, or remove Trusted Types.
- Never disable or skip `verify-dist`, tests, CodeQL, `npm audit`, signature checks or hooks.
- Never add a runtime third party, analytics or tracking.
- Never commit secrets, tokens, `.env` or private keys; never print them in CI.
- Never change repository or account settings, or close/merge PRs, without the maintainer's explicit approval in that conversation.
