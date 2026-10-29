# Graph Report - insta-auto-panel  (2026-10-29)

## Corpus Check
- 99 files · ~190,075 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .toml 3, .lock 1)

## Summary
- 761 nodes · 1626 edges · 51 communities (33 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a935f0be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- schema.ts
- factory.ts
- Covered Files & Symbols
- Covered Files & Symbols
- package.json
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- scripts
- dependencies
- compilerOptions
- graft.ts
- Social Panel PRO (insta-auto-panel)
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente
- main.tsx
- Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente
- @playwright/test
- 2. Regras Operacionais Mandatórias do Repositório
- Issue resolution
- Issue resolution
- Prowl pull request review
- Prowl pull request review
- 6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)
- Prowl change safety
- Prowl change safety
- 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação
- design.ts
- 5. Módulos Funcionais e Modelo de Dados
- Code search
- Prowl durable knowledge
- Code search
- Prowl durable knowledge
- prowl
- prowl
- 1. Arquitetura e Stack Obrigatória
- 2.1. Regra de Commits Atômicos Obrigatórios
- 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees)
- 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo)
- 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop)
- 2. Regras Operacionais Mandatórias do Repositório
- 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`)
- Prowl project context
- Prowl project map
- Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `drizzle-orm` - 28 edges
3. `Covered Files & Symbols` - 28 edges
4. `Covered Files & Symbols` - 24 edges
5. `react` - 22 edges
6. `db` - 22 edges
7. `companies` - 22 edges
8. `scripts` - 21 edges
9. `WeekPlanner()` - 21 edges
10. `Button` - 21 edges

## Surprising Connections (you probably didn't know these)
- ``src/client/App.tsx` (lines 1-301)` --references--> `DashboardContent()`  [INFERRED]
  graft/client-ui.md → src/client/App.tsx
- ``src/client/components/CompanySwitcher.tsx` (lines 1-134)` --references--> `CompanySwitcher()`  [INFERRED]
  graft/client-ui.md → src/client/components/CompanySwitcher.tsx
- ``src/client/components/PhotoBank.tsx` (lines 1-295)` --references--> `PhotoBank()`  [INFERRED]
  graft/client-ui.md → src/client/components/PhotoBank.tsx
- ``src/client/components/PublicationQueue.tsx` (lines 1-456)` --references--> `PublicationQueue()`  [INFERRED]
  graft/client-ui.md → src/client/components/PublicationQueue.tsx
- ``src/client/components/WeekPlanner.tsx` (lines 1-826)` --references--> `WeekPlanner()`  [INFERRED]
  graft/client-ui.md → src/client/components/WeekPlanner.tsx

## Import Cycles
- None detected.

## Communities (51 total, 18 thin omitted)

### Community 0 - "cn"
Cohesion: 0.07
Nodes (89): `src/client/components/CompanyModal.tsx` (lines 1-348), `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/components/SettingsHub.tsx` (lines 1-843), `src/client/components/ui/dialog.tsx` (lines 1-96), `src/client/context/CompanyContext.tsx` (lines 1-141), `src/client/types/ai.ts` (lines 1-27), `src/client/types/company.ts` (lines 1-19), 4.3. Modos de Superfície e Polimento Sistêmico (`pbakaus/impeccable` v4.8.0) (+81 more)

### Community 1 - "schema.ts"
Cohesion: 0.06
Nodes (70): Covered Files & Symbols, `src/server/db/client.ts` (lines 1-104), `src/server/db/migrate.ts` (lines 1-22), `src/server/db/sanitize.ts` (lines 1-78), `src/server/db/seed.ts` (lines 1-59), `src/server/routes/settings.ts` (lines 1-460), `src/server/services/export/autosocial.ts` (lines 1-164), `src/server/services/export/canva.ts` (lines 1-122) (+62 more)

### Community 2 - "factory.ts"
Cohesion: 0.10
Nodes (23): Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-105), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-85), `src/server/services/ai/mlstudio.ts` (lines 1-99), `src/server/services/ai/openai.ts` (lines 1-102), `src/server/services/ai/provider.ts` (lines 1-131), AIProviderName (+15 more)

### Community 3 - "Covered Files & Symbols"
Cohesion: 0.05
Nodes (38): Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, Database Layer (SQLite WAL + Drizzle Schema & Migrations), Covered Files & Symbols, HTTP REST API Routes (Bun.serve Endpoints), `src/server/index.ts` (lines 1-118), `src/server/routes/ai.ts` (lines 1-195), `src/server/routes/companies.ts` (lines 1-90) (+30 more)

### Community 4 - "Covered Files & Symbols"
Cohesion: 0.06
Nodes (36): Covered Files & Symbols, React 19 + Tailwind v4 + shadcn/ui Frontend Portal, `src/client/App.tsx` (lines 1-301), `src/client/components/AISettingsModal.tsx` (lines 1-468), `src/client/components/CompanySwitcher.tsx` (lines 1-134), `src/client/components/PhotoBank.tsx` (lines 1-295), `src/client/components/PublicationQueue.tsx` (lines 1-456), `src/client/components/SlidePreview.tsx` (lines 1-156) (+28 more)

### Community 5 - "package.json"
Cohesion: 0.10
Nodes (27): devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, postcss@^8.5.32, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/bun@^1.4.4, @types/react@^19.3.0 (+19 more)

### Community 6 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.07
Nodes (28): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+20 more)

### Community 7 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.07
Nodes (27): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação, 4.1. Stack Tecnológica (+19 more)

### Community 8 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.08
Nodes (25): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+17 more)

### Community 9 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, archify, build, caveman, db:generate, db:migrate, db:sanitize, db:seed (+13 more)

### Community 10 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1, @radix-ui/react-label@^2.1.17 (+12 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "Social Panel PRO (insta-auto-panel)"
Cohesion: 0.14
Nodes (13): 1. Clonar o Repositório e Instalar Dependências, 1. Testes Unitários e de Integração (Bun Test), 2. Checagem Estática de Tipos (TypeScript), 2. Executar o Servidor de Desenvolvimento, 3. Build de Produção, 3. Testes Ponta a Ponta E2E (Playwright), 🚀 Arquitetura & Stack Tecnológica, 📁 Estrutura de Diretórios (+5 more)

### Community 14 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.18
Nodes (11): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 4.1. Stack Tecnológica, 4.2. Banco de Dados Confiável: SQLite Nativo com Drizzle ORM, 4. O Novo Painel de Gestão: Arquitetura Técnica, 7. Schema Relacional do Banco de Dados Confiável (SQLite / Drizzle), 8. Arquitetura de Pastas Proposta para o Novo Projeto, 9. Próximos Passos de Decisão para Fechamento do Planejamento (+3 more)

### Community 15 - "Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente"
Cohesion: 0.20
Nodes (10): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Prowl project context (+2 more)

### Community 16 - "main.tsx"
Cohesion: 0.40
Nodes (3): react-dom@^19.3.1, react-dom, rootElement

### Community 17 - "Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente"
Cohesion: 0.20
Nodes (10): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Prowl project context (+2 more)

### Community 19 - "2. Regras Operacionais Mandatórias do Repositório"
Cohesion: 0.22
Nodes (8): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente

### Community 20 - "Issue resolution"
Cohesion: 0.29
Nodes (6): 1. Read the tracker, 2. Investigate with Prowl, not a grep sweep, 3. Fix at the source, 4. Prove it, then commit, 5. Close it like a human, Issue resolution

### Community 21 - "Issue resolution"
Cohesion: 0.29
Nodes (6): 1. Read the tracker, 2. Investigate with Prowl, not a grep sweep, 3. Fix at the source, 4. Prove it, then commit, 5. Close it like a human, Issue resolution

### Community 22 - "Prowl pull request review"
Cohesion: 0.33
Nodes (5): Canonical report requirements, Prowl pull request review, Recommendation and check gate, Route and capture, Structured incremental protocol

### Community 23 - "Prowl pull request review"
Cohesion: 0.33
Nodes (5): Canonical report requirements, Prowl pull request review, Recommendation and check gate, Route and capture, Structured incremental protocol

### Community 24 - "6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)"
Cohesion: 0.33
Nodes (6): 6.1. Gestão de Provedores na Interface do Painel, 6.2. Padrão Arquitetural: Adapter Pattern em TypeScript, 6.3. Garantia de Formato: Saídas Estruturadas (Structured Outputs) e Validação Zod, 6.4. Escopo de Chaves: Global vs. Específica por Empresa, 6.5. O Papel do Canva Pro (Criação Visual de Alto Padrão), 6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)

### Community 25 - "Prowl change safety"
Cohesion: 0.40
Nodes (4): After editing, Before editing a file, Prowl change safety, Resuming a task

### Community 26 - "Prowl change safety"
Cohesion: 0.40
Nodes (4): After editing, Before editing a file, Prowl change safety, Resuming a task

### Community 27 - "3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação"
Cohesion: 0.40
Nodes (5): 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação

### Community 28 - "design.ts"
Cohesion: 0.09
Nodes (32): `src/server/services/design/image-provider.ts` (lines 1-317), `src/server/services/design/template-engine.ts` (lines 1-322), DESIGN_TEMPLATES, DesignTemplateId, designTemplateSchema, IMAGE_PROVIDERS, ImageProviderName, imageProviderSchema (+24 more)

### Community 29 - "5. Módulos Funcionais e Modelo de Dados"
Cohesion: 0.40
Nodes (5): 5.1. Módulo 1: Gestão de Múltiplas Contas / Empresas (Multi-Tenant), 5.2. Módulo 2: Banco de Fotos Base Isolado por Empresa, 5.3.1. Regra de Negócio: Número de Slides como Variável Dinâmica (3 a 10), 5.3. Módulo 3: Selecionador Semanal de Assuntos (Segunda a Domingo), 5. Módulos Funcionais e Modelo de Dados

### Community 31 - "Code search"
Cohesion: 0.50
Nodes (3): Code search, Read only what you need, Routing table

### Community 32 - "Prowl durable knowledge"
Cohesion: 0.50
Nodes (3): Prowl durable knowledge, When to capture, Workflow

### Community 33 - "Code search"
Cohesion: 0.50
Nodes (3): Code search, Read only what you need, Routing table

### Community 34 - "Prowl durable knowledge"
Cohesion: 0.50
Nodes (3): Prowl durable knowledge, When to capture, Workflow

## Knowledge Gaps
- **14 isolated node(s):** `prowl`, `prowl`, `RFC-4180`, `RFC-4180`, `Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 327 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Badge()` connect `cn` to `Covered Files & Symbols`, `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram`, `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **What connects `prowl`, `prowl`, `RFC-4180` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.06742944317315026 - nodes in this community are weakly interconnected._
- **Why does `drizzle-orm` connect `schema.ts` to `dependencies`, `factory.ts`, `design.ts`, `package.json`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06436254628813261 - nodes in this community are weakly interconnected._
- **Why does `Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite` connect `Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite` to `AGENTS.md`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `factory.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0996078431372549 - nodes in this community are weakly interconnected._