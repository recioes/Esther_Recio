---
name: web-security-owasp
description: Use ao criar, revisar ou publicar sites estáticos e front-ends (GitHub Pages, Astro, Vite) para aplicar controles OWASP — CSP, links externos, supply chain, CI/CD com permissões mínimas, privacidade — e declarar riscos residuais com honestidade.
---

# Segurança web (OWASP) para sites estáticos

Objetivo: **reduzir superfície de ataque** e ser honesto sobre o que não dá para garantir. Nunca declare um site "seguro"; declare controles aplicados e riscos residuais.

## Processo

1. **Mapear a superfície:** há auth? formulários? input do usuário? backend? scripts/fontes/imagens de terceiros? Em site estático, os riscos principais são supply chain, configuração e conta do repositório.
2. **Aplicar os controles** abaixo, na ordem.
3. **Verificar** com testes automatizados (CSP sem violações, links validados, `npm audit`).
4. **Registrar** limitações no ADR (ex.: sem headers HTTP no GitHub Pages).

## Mapa OWASP Top 10 (taxonomia 2021) → ação

Conferir se há edição mais recente antes de citar numeração em documentos formais.

| Categoria | Ação mínima |
|---|---|
| A01 Broken Access Control | 2FA/passkey na conta; branch protection na `main`; PR obrigatório; commits assinados |
| A02 Cryptographic Failures | Enforce HTTPS; apenas links `https:`; nenhum segredo no repo (histórico incluso) |
| A03 Injection | Sem `innerHTML`, `eval`, `new Function`, `document.write`; usar `textContent`; sem concatenar HTML |
| A04 Insecure Design | Zero terceiros em runtime; JS opcional; threat model de 5 linhas no ADR |
| A05 Security Misconfiguration | CSP, `referrer`, `robots.txt`, `security.txt`; remover arquivos de debug |
| A06 Vulnerable Components | Dependabot (npm + actions), `npm audit`, lockfile, `npm ci` |
| A07 Auth Failures | Revisar sessões, tokens e chaves SSH; sem tokens longos no CI |
| A08 Integrity Failures | Actions fixadas por SHA; permissões mínimas; SRI para qualquer recurso externo inevitável |
| A09 Logging/Monitoring | Ativar alertas do GitHub (Dependabot, secret scanning, CodeQL); registrar o que o Pages não cobre |
| A10 SSRF | N/A sem backend; registrar como não aplicável |

## Controles concretos

### Links externos
```html
<a href="https://github.com/usuario" target="_blank" rel="noopener noreferrer">GitHub</a>
```
- Sempre `rel="noopener noreferrer"` com `target="_blank"`.
- Validar em build: `href` com protocolo `https:` e host em *allowlist*.

### CSP via `<meta>` (quando não há controle de headers)
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:;
               media-src 'self'; font-src 'self'; connect-src 'none'; base-uri 'none';
               form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
```
- Sem `'unsafe-inline'` e sem `'unsafe-eval'`.
- Frameworks podem inlinar CSS/JS pequenos; configure para gerar arquivos externos e **valide com teste e2e** que o console não registra violações de CSP.
- Limite conhecido: `<meta>` não suporta `frame-ancestors`, `report-uri` nem `sandbox`.

### Recursos de terceiros
- Preferir **self-host** (fontes, ícones, vídeos).
- Se for inevitável: versão fixa + `integrity="sha384-…"` + `crossorigin="anonymous"`.
- Nunca carregar fonte/script de CDN sem SRI e sem justificar no ADR.

### CI/CD (GitHub Actions)
```yaml
permissions:
  contents: read      # elevar por job, apenas onde necessário
  pages: write
  id-token: write

steps:
  - uses: actions/checkout@<SHA-COMPLETO>   # SHA, não tag
  - run: npm ci
  - run: npm audit --audit-level=high
```
- Fixar cada action por SHA completo (comentário com a versão ao lado).
- Nunca usar `pull_request_target` com checkout de código de fork.
- Nunca imprimir segredos; preferir OIDC a tokens estáticos.
- Avaliar `npm ci --ignore-scripts` (pode quebrar pacotes com *postinstall*; testar).

### `dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly" }
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule: { interval: "weekly" }
```

### Privacidade
- Sem analytics/rastreadores de terceiros por padrão.
- Sem cookies. Sem fontes de CDN (vazam IP do visitante).
- Não publicar e-mail/telefone em texto puro se não for necessário.

### Repositório
- 2FA/passkey; branch protection; secret scanning e push protection ligados.
- `.gitignore` cobrindo `.env`, chaves, `node_modules`.
- `SECURITY.md` ou `security.txt` com canal de contato.

## Limitações do GitHub Pages (declarar sempre)

- Não permite headers HTTP customizados: sem `frame-ancestors`, `Permissions-Policy`, CSP real.
- Clickjacking fica com mitigação fraca. Se for requisito, usar Cloudflare Pages/Netlify ou colocar um CDN com regras de header na frente.
- Sem logs de acesso; monitoramento depende de alertas do GitHub.

## Checklist de revisão

- [ ] Nenhum `target="_blank"` sem `rel="noopener noreferrer"`
- [ ] Nenhum script/fonte/estilo de terceiros sem SRI (ideal: nenhum)
- [ ] Sem `innerHTML`, `eval`, `document.write`
- [ ] CSP presente e testada (0 violações)
- [ ] `npm audit` sem vulnerabilidades altas/críticas
- [ ] Dependabot e CodeQL ativos
- [ ] Actions por SHA, `permissions` mínimas
- [ ] HTTPS forçado; links `https:` apenas
- [ ] Sem segredos no código nem no histórico
- [ ] Riscos residuais registrados no ADR

## Como reportar

Liste: controles aplicados, controles **não** aplicáveis (com motivo) e riscos residuais. Se não conseguiu verificar algo (ex.: não rodou o scanner), diga explicitamente em vez de assumir.
