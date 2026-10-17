# Política de segurança

Este repositório é um site estático (sem backend, formulários ou autenticação). Os riscos mais prováveis estão na cadeia de suprimentos (dependências npm e GitHub Actions) e na conta do GitHub.

## Como reportar uma vulnerabilidade

Use **Security → Report a vulnerability** neste repositório (relato privado do GitHub). Evite abrir issue pública com detalhes de exploração.

## Controles aplicados

- CSP restritiva via `<meta>` (sem `unsafe-inline`/`unsafe-eval`, sem origens externas) com **Trusted Types** (`require-trusted-types-for 'script'; trusted-types 'none'`), validada a cada build por `scripts/verify-dist.mjs` e, no navegador, pelo QA (`npm run qa`), que exige zero violações de CSP.
- Nenhum recurso de terceiros em runtime (fontes, vídeo e ícones são locais); sem analytics nem cookies.
- Links externos com `rel="noopener noreferrer"` e *allowlist* de hosts (`src/lib/links.ts`).
- Cadeia de suprimentos: lockfile só do registro oficial com hash `sha512` (testado), `.npmrc` com `ignore-scripts=true`, `npm ci`, `npm audit` e `npm audit signatures` (assinaturas e proveniência) no CI, Dependabot com quarentena para versões recém-publicadas.
- Workflows com `permissions` mínimas por job, Actions fixadas por SHA e `persist-credentials: false`; CodeQL semanal.
- Dados pessoais só nos PDFs do currículo, com metadados limpos (sem o user agent de quem gerou).
- Padrões e procedimento de revisão: [`skills/web-security-owasp/SKILL.md`](skills/web-security-owasp/SKILL.md).

## Limitações conhecidas

- O GitHub Pages não permite headers HTTP próprios: não há `frame-ancestors` nem `Permissions-Policy`, e a CSP via `<meta>` não cobre `report-uri` nem `sandbox`. Para esses controles, seria preciso hospedar atrás de um CDN com regras de header.
- Arquivos como `security.txt` e `robots.txt` só valem na raiz do domínio (`recioes.github.io`), por isso este arquivo existe no lugar do `security.txt`.
