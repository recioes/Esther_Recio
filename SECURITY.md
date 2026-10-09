# Política de segurança

Este repositório é um site estático (sem backend, formulários ou autenticação). Os riscos mais prováveis estão na cadeia de suprimentos (dependências npm e GitHub Actions) e na conta do GitHub.

## Como reportar uma vulnerabilidade

Use **Security → Report a vulnerability** neste repositório (relato privado do GitHub). Evite abrir issue pública com detalhes de exploração.

## Controles aplicados

- CSP restritiva via `<meta>` (sem `unsafe-inline`), validada a cada build por `scripts/verify-dist.mjs`.
- Nenhum recurso de terceiros em runtime (fontes, vídeo e ícones são locais).
- Links externos com `rel="noopener noreferrer"` e *allowlist* de hosts (`src/lib/links.ts`).
- Dependabot (npm e Actions), `npm audit` e CodeQL no CI.
- Workflows com `permissions` mínimas e Actions fixadas por SHA.

## Limitações conhecidas

- O GitHub Pages não permite headers HTTP próprios: não há `frame-ancestors` nem `Permissions-Policy`, e a CSP via `<meta>` não cobre `report-uri` nem `sandbox`. Para esses controles, seria preciso hospedar atrás de um CDN com regras de header.
- Arquivos como `security.txt` e `robots.txt` só valem na raiz do domínio (`recioes.github.io`), por isso este arquivo existe no lugar do `security.txt`.
