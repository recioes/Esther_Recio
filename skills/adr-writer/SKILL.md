---
name: adr-writer
description: Use ao registrar uma decisão técnica ou de arquitetura como ADR (Architecture Decision Record) — contexto verificado, opções com trade-offs honestos, decisão, consequências, impacto de segurança e questões em aberto. Serve para criar, revisar ou substituir ADRs.
---

# Escrevendo ADRs

Um ADR registra **uma decisão**, o **porquê** e o **que muda por causa dela**. É lido meses depois por alguém sem contexto (inclusive você).

## Quando escrever

- Escolha de stack, framework, hospedagem, modelo de dados, estratégia de segurança.
- Decisão cara de reverter ou que afeta vários arquivos/pessoas.
- Quando alguém perguntaria "por que fizemos assim?".

Não escreva ADR para detalhes de implementação óbvios.

## Processo para o agente

1. **Ler o código/repo antes de escrever.** Contexto vem de evidência (arquivo, linha, URL), não de suposição.
2. **Separar fato de inferência.** Se não verificou, diga.
3. **Não inventar** URLs, versões, métricas ou números. Se faltar dado, vira *questão em aberto*.
4. **Listar ≥ 2 alternativas reais**, com prós e contras honestos (inclusive da opção escolhida).
5. **Registrar impacto de segurança e acessibilidade** quando existir.
6. **Terminar com questões em aberto** que dependem do dono do projeto.
7. Manter em **1–3 páginas**; detalhes longos vão para anexos.

## Regras de ouro

- **Uma decisão por ADR.**
- **Numeração sequencial** (`0001`, `0002`…), nome em kebab-case: `0001-modernizacao-pagina-links.md`, em `docs/adr/`.
- **ADR aceito não se edita.** Mudou de ideia? Crie outro e marque o antigo como `Substituído por ADR-000X`.
- **Status:** `Proposto → Aceito → (Obsoleto | Substituído)`.
- Linguagem direta; verbos no presente; sem marketing.
- Cada afirmação importante deve ser verificável (link, arquivo, teste).

## Template

```markdown
# ADR-000X — <decisão em uma frase>

- **Status:** Proposto | Aceito | Obsoleto | Substituído por ADR-000Y
- **Data:** AAAA-MM-DD
- **Decisores:** <nomes>
- **Escopo:** <repo/sistema>

## 1. Contexto
<situação atual, restrições, evidências (arquivo/linha/URL)>

## 2. Drivers de decisão
<critérios, em ordem de prioridade>

## 3. Opções consideradas
| Opção | Prós | Contras |
|---|---|---|

## 4. Decisão
<o que foi escolhido e por quê; detalhes técnicos essenciais>

## 5. Consequências
**Positivas** · **Negativas/custos** · **Riscos e mitigação**

## 6. Segurança, privacidade e acessibilidade
<controles, riscos residuais>

## 7. Plano de implementação
<passos pequenos e verificáveis>

## 8. Questões em aberto
<perguntas ao dono; o que bloqueia aceitar o ADR>

## 9. Referências
```

## Checklist de revisão

- [ ] Contexto baseado em evidências do repo
- [ ] Pelo menos 2 alternativas com contras reais
- [ ] Decisão clara e consistente com os drivers
- [ ] Consequências negativas declaradas
- [ ] Segurança/privacidade/a11y tratadas
- [ ] Nenhum dado inventado; lacunas marcadas
- [ ] Questões em aberto listadas
- [ ] Status, data e numeração corretos

## Anti-padrões

- ADR que só justifica uma decisão já tomada, sem alternativas.
- Texto longo sem tabela de opções.
- Misturar várias decisões em um documento.
- Editar ADR aceito para "corrigir a história".
- Afirmar métricas (peso, performance) sem medir.
