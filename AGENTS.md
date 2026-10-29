# Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente

> **Projeto:** Social Panel PRO — Sistema de Automação de Conteúdo Multi-Conta para Instagram  
> **Diretório Oficial do Repositório:** `/home/eduardorwll/Sandbox/src/insta-auto-panel/`  
> **Perímetro de Execução (Sandbox):** `/home/eduardorwll/Sandbox/`  
> **Documentos Mestres:**  
> - [requisitos-planejamento-automacao-instagram.md](./requisitos-planejamento-automacao-instagram.md)  
> - [plano-fluxo-desenvolvimento-e-testes-vite.md](./plano-fluxo-desenvolvimento-e-testes-vite.md)

Este arquivo define as diretrizes operacionais inegociáveis para o **Lead Architect** e todos os **Subagentes** que atuam neste repositório, complementando as regras globais de `~/Sandbox/.agents/rules/`.

---

## 1. Arquitetura e Stack Obrigatória

1. **Runtime & Gerenciador de Pacotes:** **Bun** (`bun run`, `bun test`, `bun install`, `Bun.serve`). É proibido substituir o Bun por `npm`/`yarn` ou SGBDs externos pesados.
2. **Frontend & Design System:** **Vite + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Lucide React + TanStack Query**.
3. **Persistência Confiável (ACID):** **SQLite nativo (`bun:sqlite`)** em modo **WAL (`PRAGMA journal_mode = WAL;`)** gerenciado via **Drizzle ORM** em `data/social_panel.db`.
4. **Regras de Domínio Essenciais:**
   - **Multi-Tenant (`companies`):** Isolamento estrito de dados, Brand Kit (cores Hex, tipografia, WhatsApp `wa.me`, Canva Template ID) e banco de fotos base (`photo_assets`) por empresa.
   - **Variável Dinâmica de Lâminas (`slide_count`):** Selecionável por post de **3 a 10 slides** (Slide 1 = Hook/Capa, Slides 2..N-1 = Desenvolvimento proporcional, Slide N = CTA).
   - **IA Generativa Agnóstica (`AIProvider`):** Padrão Adapter em TypeScript suportando Google Gemini, OpenAI, Anthropic Claude, Groq, DeepSeek, OpenRouter e Ollama Local, com validação em runtime via **Zod** (Structured Outputs) e chaves configuráveis em escopo global ou por empresa.
   - **Motor Gráfico & Publicação:** Exportação CSV compatível com **Canva Pro (Bulk Create)** / Canva Connect API e integração via filesystem sidecar (`.description` + mídia) na fila `queue/<company_id>/instagram/pending/` do **`Katzca/AutoSocial`**.

---

## 2. Regras Operacionais Mandatórias do Repositório

### 2.1. Regra de Commits Atômicos Obrigatórios
- **1 Ticket = 1 Commit Semântico:** Todo subagente **DEVE** realizar um commit atômico formal utilizando o padrão **Conventional Commits** (`feat(scope): ...`, `test(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`) imediatamente após finalizar e validar sua task com 100% de sucesso nos testes, **antes** de qualquer merge na branch do marco.
- **Critérios Inegociáveis Pré-Commit:**
  1. `bun test` passando com 100% de êxito (código de saída `0`).
  2. `bun x tsc --noEmit` sem nenhum erro de tipagem TypeScript (`strict: true`, zero uso de `any`).
  3. Quando houver interface/E2E aplicável, `bun run test:e2e` (Playwright) passando integralmente com console limpo.
  4. Sincronização de grafos (`graphify update .`) quando arquivos de código forem criados ou modificados.

### 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees)
- **Isolamento via Git Worktrees (`Workspace: 'share'`):** É terminantemente proibido que múltiplos subagentes editem simultaneamente o mesmo diretório de trabalho. Ao invocar subagentes de implementação ou QA concorrentes, utilize `Workspace: 'share'` para isolar cada agente em seu próprio worktree.
- **Topologia Oficial de Branches:**
  - `main`: Código estável de produção, atualizado apenas após aprovação humana (HITL) de cada Marco.
  - `milestone/M<X>-<slug>`: Branch integradora do marco atual (ex: `milestone/M1-foundation`).
  - `feat/M<X>-T<Y>-<slug>`, `test/M<X>-T<Y>-<slug>`, `fix/M<X>-T<Y>-<slug>`: Branches efêmeras de trabalho atômico de cada subagente, integradas na branch do marco via `git merge --no-ff`.

### 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)
- **Validação Autônoma de UI:** O subagente de QA (`playwright-tester`) deve subir o servidor local, conectar o **Playwright** em modo headless e exercitar os fluxos reais da interface usando seletores semânticos acessíveis (`getByRole`, `getByLabel`, `getByText`).
- **Tolerância Zero a Erros de Console:** Todo teste Playwright deve anexar ouvintes para `page.on('console')` (tipo `error`) e `page.on('pageerror')`. Qualquer exceção não tratada do React/JS ou falha de requisição invalida imediatamente a aprovação da task.

### 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop)
- **Pausa Obrigatória entre Etapas/Marcos:** Nenhuma etapa ou marco (Milestone M1 a M5) avança para o próximo sem:
  1. Apresentação do relatório consolidado de evidências (arquivos criados/modificados, resultados de `bun test`, `tsc --noEmit`, testes Playwright e histórico de commits da branch).
  2. Revisão em Dois Eixos (**Spec Match** + **Standards & Quality**).
  3. **Autorização explícita do usuário humano** para prosseguir.

---

## 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`)

Todos os agentes operando neste repositório estão simultaneamente submetidos a:
- **Confinamento Estrito (`boundaries.md`):** Nenhuma leitura de segredos do host (`~/.ssh`, `~/.gnupg`) nem escrita fora de `/home/eduardorwll/Sandbox/` (ou `/tmp/`).
- **Prática TDD (`tdd.md`):** Ciclo obrigatório **Red -> Green -> Refactor**. Testes unitários sempre precedem a implementação de regras de negócio, schemas e serviços.
- **Planejamento Mandatório (`planning.md`) & Explicação Técnica (`explanation.md`):** Nenhuma modificação estrutural sem plano prévio, mapeamento de *blast radius* e justificativa técnica (*Why-First*).
- **Inteligência em Grafos (`graph-intelligence.md`):** Uso prioritário de `graphify` (contexto macro) e `graft` (contexto micro: `graft skeleton`, `graft callers`, `graft ask`) em vez de buscas cegas em código-fonte.
