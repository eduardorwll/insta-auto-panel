# Paradigma Why-First & Rotina de Refatoração Contínua

> **Contexto:** Social Panel (`insta-auto-panel`)  
> **Contrato Vinculado:** [AGENTS.md](../../AGENTS.md) (Seção de Padrões)

## 1. Paradigma Why-First Mandatório
Nenhuma modificação de código, ajuste de esquema ou refatoração pode ser executada sem prévia justificativa técnica:
1. **Justificativa Técnica Explícita:** Fundamentar a razão técnica da escolha (Clean Architecture, SOLID, acoplamento, coesão, performance).
2. **Análise Formal de Trade-offs:** Documentar os ganhos reais e custos/compromissos técnicos conscientemente assumidos.
3. **Alternativas Descartadas:** Registrar expressamente quais abordagens alternativas foram cogitadas e por que foram rejeitadas.
4. **Preservação Documental:** Preservar rigorosamente comentários existentes, docstrings e ADRs sem remoção silenciosa.
5. **Links Clicáveis:** Citar sempre arquivos e símbolos através de links Markdown clicáveis com esquema `file://` e números de linhas (`file:///path#Lxx-Lyy` ou `Symbol`).

## 2. Rotina Mandatória de Refatoração (`safe-refactor` + `refactoring` + `refactoring-guru`)
1. **Preservação Comportamental Estrita:** Isolar estruturalmente refatoração de qualquer adição de feature ou correção de bug. O comportamento observável deve permanecer 100% inalterado durante refatorações.
2. **Diagnóstico Prévio de Smells (`refactoring-guru`):** Classificar e nomear formalmente o code smell antes de escolher o tratamento (Bloaters, OO Abusers, Change Preventers, Dispensables, Couplers).
3. **Menor Tratamento Suficiente & Regra de Três (`refactoring`):** Aplicar o menor movimento atômico capaz de eliminar o smell (`Extract Function`, `Inline Temp`, `Extract Class`, `Parameter Object`, `Guard Clauses`). Tolerar duplicação até a 2ª ocorrência; na 3ª, unificar a responsabilidade.
4. **Rede de Proteção com Testes de Caracterização (`working-effectively-with-legacy-code`):** Executar os testes antes e garantir 100% de êxito; caso faltem testes, travar o comportamento atual com testes de caracterização antes da intervenção. Proibido enfraquecer testes para concluir refatorações.
5. **Condição de Parada Rígida:** Interromper a limpeza assim que o smell for sanado, evitando qualquer engenharia especulativa ou redesign prematuro.

## 3. Ciclo Completo Unificado de Engenharia
`Plan-First` ➔ `Why-First` ➔ `TDD (Red -> Green)` ➔ `Safe-Refactor` ➔ `UI Craft Triad` ➔ `Review-Before-Done (2 Eixos)` ➔ `Tokens Report`.
