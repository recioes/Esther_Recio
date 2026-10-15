---
name: git-workflow
description: Use whenever you create a branch, write a commit message, open or update a pull request, or write project documentation. Defines the golden standards for this repo: branch naming (type/topic-topic), semantic commits in English ("Feat: adds easter eggs"), pull requests with an English description, and English-only docs and README.
---

# Git workflow and documentation standards

**Everything is written in English**: branch names, commit messages, pull request titles and descriptions, the README and any new documentation. (The site's own copy lives in `src/i18n/` and keeps being written in each locale.)

Commit types follow [iuricode/padroes-de-commits](https://github.com/iuricode/padroes-de-commits).

## Agent rules

1. **Never commit, push or open a PR unless the user asked.** Approval for one action does not carry over to the next.
2. **Never work on `main`.** Branch first. Never force-push `main`; avoid force-push everywhere, and when needed use `--force-with-lease` on your own branch only.
3. **Never skip hooks** (`--no-verify`) or signing unless the user explicitly asks.
4. **Look before you stage.** Run `git status` and `git diff`; stage files by name, never `git add -A` blindly (secrets, `.env`, build output, scratch files).
5. **Verify before committing:** `npm run verify` (lint, types, tests, build). Report honestly if something could not run.
6. **Atomic commits:** one logical change per commit. Do not mix a feature, a refactor and docs in one commit unless they are inseparable.
7. End commits and PR bodies with the attribution lines given by the harness, when present.

## Branches

Format: `<type>/<topic-topic>`, all lowercase, kebab-case, short and descriptive.

```
feat/easter-eggs
fix/linkedin-redirect-mobile
docs/readme-english
refactor/globe-markers
ci/codeql-schedule
```

- `<type>` is one of the commit types below.
- Branch from an up-to-date `main`: `git fetch origin && git switch -c feat/topic origin/main`.
- One branch per topic; delete it after the merge.

## Commits

### Format

```
Type: verb-in-third-person-singular object

Optional body: what changed and WHY (not how), impact, instructions for the future.

Optional footer: Refs #133
```

- `Type` is capitalized, followed by a colon and a space: `Feat:`, `Fix:`, `Docs:`.
- The description starts with a third-person verb (adds, fixes, removes, updates, refactors) and has no trailing period.
- Keep the subject line short (aim for 50 characters, hard limit 72).
- The body is wrapped at about 72 columns and explains the reason for the change.
- Optional emoji prefix from the table below is allowed, but the text type is what counts. This repo does not use emojis by default.
- Links must be written in full, with no URL shorteners or affiliate links.
- No secrets, tokens or personal data in messages.

Examples:

```
Feat: adds easter eggs
Fix: fixes LinkedIn redirect on mobile
Docs: translates README to English
Test: adds sequence matcher tests
Build: adds sharp as a dev dependency
Refactor: extracts sparkle DOM helpers
Chore: updates dependabot schedule
```

### Types

| Type | Use for | Emoji |
|---|---|---|
| `Feat` | A new feature (MINOR in semver) | ✨ |
| `Fix` | A bug fix (PATCH in semver) | 🐛 |
| `Docs` | Documentation only, such as the README | 📚 |
| `Test` | Creating, changing or deleting tests | ✅ |
| `Build` | Build files and dependencies | 📦 |
| `Perf` | Performance improvements | ⚡ |
| `Style` | Formatting, whitespace, lint, with no code change | 💄 |
| `Refactor` | Restructuring with no behavior change | ♻️ |
| `Chore` | Maintenance tasks, admin configuration, packages | 🔧 |
| `CI` | Continuous integration and workflows | 🧱 |
| `Raw` | Configuration files, data and parameters | 🗃️ |
| `Cleanup` | Removing dead code or comments for readability | 🧹 |
| `Remove` | Deleting obsolete files, directories or features | 🗑️ |

Other useful emojis: ♿ accessibility, 💫 animations, 🔒️ security, 🔍️ SEO, 📱 responsiveness, 🚧 work in progress, 🚚 move or rename, 💥 revert.

## Pull requests

- **Title:** same format as a commit subject: `Feat: adds easter eggs`.
- **Always include a description, in English.** Never open a PR with an empty body.
- **Base:** `main`. Keep the PR focused; split unrelated work into separate PRs.
- Link issues with `Closes #12` / `Refs #12` when they exist.
- Before opening: the branch is rebased or merged with the latest `main`, and `npm run verify` passes (or the description says what could not run).

Description template:

```markdown
## Summary
One to three sentences: what this PR does and why.

## Changes
- Bullet list of the notable changes, grouped by area.

## How to test
1. Steps a reviewer can follow (commands, URLs, expected result).

## Notes
Trade-offs, follow-ups, risks, anything the reviewer should know (screenshots for UI changes).
```

Footer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)` when the harness asks for it.

## Documentation

- The README and all new documentation (ADRs, guides, comments in new docs) are in **English**.
- Keep the README current in the same PR that changes behavior: commands, structure, how to edit, features.
- Prefer short sentences, tables for reference data, and runnable commands in code blocks.
- Existing Portuguese documents are translated when they are next touched.

## Checklist before `git push`

- [ ] Branch name follows `type/topic-topic` and is not `main`
- [ ] Commits follow `Type: verb object`, in English, atomic
- [ ] `git status` shows no stray files; nothing sensitive is staged
- [ ] `npm run verify` passes (or the gap is stated)
- [ ] README updated if behavior or structure changed
- [ ] PR title and English description are ready
