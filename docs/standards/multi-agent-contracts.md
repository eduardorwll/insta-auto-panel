# Regras Operacionais Mandatórias de Engenharia Multiagente

> **Contexto:** Social Panel (`insta-auto-panel`)  
> **Contrato Vinculado:** [AGENTS.md](../../AGENTS.md) (Seção de Padrões)

## 1. Regra de Commits Atômicos Obrigatórios
- **1 Ticket = 1 Commit Semântico:** Todo agente DEVE realizar um commit atômico formal utilizando o padrão Conventional Commits (`feat(scope): ...`, `test(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`) imediatamente após finalizar e validar sua task com 100% de sucesso nos testes, antes de qualquer merge na branch do marco.
- **Critérios Inegociáveis Pré-Commit:**
  1. `bun test` passando com 100% de êxito (código de saída `0`).
  2. `bun x tsc --noEmit` sem nenhum erro de tipagem TypeScript (`strict: true`, zero uso de `any`).
  3. Quando houver interface/E2E aplicável, `bun run test:e2e` (Playwright) passando integralmente com console limpo.
  4. Sincronização de grafos (`graphify update .`) quando arquivos de código forem criados ou modificados.

## 2. Regra de Multi-Branches com Subagentes (Git Worktrees)
- **Isolamento via Git Worktrees (`Workspace: 'share'`):** É terminantemente proibido que múltiplos subagentes editem simultaneamente o mesmo diretório de trabalho. Ao invocar subagentes de implementação ou QA concorrentes, utilize `Workspace: 'share'` para isolar cada agente em seu próprio worktree.
- **Topologia Oficial de Branches:**
  - `main`: Código estável de produção, atualizado apenas após aprovação humana (HITL) de cada Marco.
  - `milestone/M<X>-<slug>`: Branch integradora do marco atual.
  - `feat/M<X>-T<Y>-<slug>`, `test/M<X>-T<Y>-<slug>`, `fix/M<X>-T<Y>-<slug>`: Branches efêmeras integradas via `git merge --no-ff`.

## 3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)
- **Validação Autônoma de UI:** O agente de QA deve subir o servidor local, conectar o Playwright em modo headless e exercitar os fluxos reais da interface usando seletores semânticos acessíveis (`getByRole`, `getByLabel`, `getByText`).
- **Tolerância Zero a Erros de Console:** Todo teste Playwright deve anexar ouvintes para `page.on('console')` (tipo `error`) e `page.on('pageerror')`. Qualquer exceção não tratada do React/JS ou falha de requisição invalida imediatamente a aprovação da task.

## 4. Cláusula Pétrea de Execução Etapa por Etapa (HITL Obrigatório)
- **CLÁUSULA PÉTREA INEGOCIÁVEL (Perguntar SEMPRE antes de avançar de etapa):** O agente NUNCA deve executar múltiplas etapas/marcos seguidos de forma autônoma. Ao concluir cada etapa (ou sub-etapa acordada), o agente DEVE OBRIGATORIAMENTE:
  1. Atualizar imediatamente o artefato de checklist e a documentação registrando exatamente as modificações feitas naquela parte.
  2. Apresentar a Revisão em Dois Eixos (Spec Match + Standards & Quality: `bun test`, `tsc --noEmit` e Playwright).
  3. **PARAR IMEDIATAMENTE e perguntar explícita e formalmente ao usuário humano** se pode prosseguir para a próxima etapa.
