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
- **Inteligência em Grafos & Os 4 Token Savers Mandatórios (`graph-intelligence.md`):**
  1. **`graphify` (Macro AST):** `bun run graphify query "<pergunta>"`, `bun run graphify path "<A>" "<B>"`, `bun run graphify update .` (e hooks Git automáticos).
  2. **`graft` + `prowl` (Micro Context):** `bun run graft skeleton <arquivo>`, `bun run graft callers <símbolo> --depth all`, `bun run graft ask "<pergunta>" --source`.
  3. **`caveman` (Compressão de Entrada & `cavecrew`):** `bun run caveman compress <arquivo>` e `bun run caveman shrink-log` estritamente para **entrada** (*briefs*, logs, JSONs extensos e retornos de subagentes em formato `cavecrew`), mantendo a **saída para o usuário no Relatório Padrão completo**.
  4. **`delegate-skills` (`delegate-fleet.v1` em `.delegate/config.json` — Fallback & Lanes em `gemini-3.8-flash-high`):** Orquestração multi-lane via `agy-delegate` onde todas as lanes (`default`, `fallback`, `fast`, `tests`, `feature`, `ui`, `review`) operam com o modelo **`gemini-3.8-flash-high`** em esforço máximo (`"effort": "high"`).
  5. **Telemetria Obrigatória de Fim de Tarefa (`bun run tokens:report`):** Todo relatório final de tarefa ou milestone deve reportar os tokens economizados por todos os motores (`🌱 graft`, `🕸️ graphify`, `🪨 caveman (input)`, `🤝 delegate-skills`).
- **Tríade Mandatória de UI, Design Engineering & Craft Visual (`ui-craft.md`):**
  1. **`taste-skill` (`design-taste-frontend` — `Leonxlnx/taste-skill`):** Direção de arte anti-slop, hierarquia de luminância (`surface-0..2`) e pipeline de inspeção visual (`draw.mjs --app` -> `lint.mjs` -> `inspect.mjs --app` em `1440px`, `768px`, `390px`).
  2. **`emilkowalski/skills` (`emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `animation-performance`, `break-ui`, `mobile-native`):** Feedback tátil em botões (`transform: scale(0.97)` em `:active`), proibido `scale(0)` (usar `scale(0.95)` + `opacity: 0`), curvas `ease-out` customizadas (`cubic-bezier(0.23, 1, 0.32, 1)`) `< 300ms`, zero animação em ações frequentes de teclado, animações restritas à GPU (`transform`/`opacity`), `tabular-nums` em dimensões/contadores e stress-testing de estados extremos (`break-ui`).
  3. **`impeccable` (`pbakaus/impeccable` v4.8.0):** Separação explícita de superfície (**Operate** para o painel/Studio Visual do Social Panel PRO e **Persuade** para os templates de slides 4:5 exportados) e roteamento estruturado (`shape` -> `layout`/`typeset`/`colorize` -> `critique`/`audit` -> `polish`/`harden`).
- **Diagrama Único de Arquitetura (`Archify`):** Mantido em `docs/architecture.html` (especificação em `.archify/architecture/candidate.json`), atualizado a cada milestone via `bun run archify` e servido em `/architecture`.
