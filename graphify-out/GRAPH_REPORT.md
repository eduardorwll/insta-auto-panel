# Graph Report - insta-auto-panel  (2026-10-29)

## Corpus Check
- 107 files · ~200,360 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .toml 3, .lock 1)

## Summary
- 672 nodes · 1688 edges · 26 communities (22 shown, 4 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 125 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed1f88aa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DesignStudioTab.tsx
- schema.ts
- factory.ts
- Covered Files & Symbols
- Covered Files & Symbols
- Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite
- scripts
- dependencies
- compilerOptions
- devDependencies
- Covered Files & Symbols
- Social Panel PRO (insta-auto-panel)
- graft.ts
- package.json
- Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram
- Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente
- Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente
- @playwright/test
- vite.config.ts
- 6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)
- 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação
- 5. Módulos Funcionais e Modelo de Dados
- prowl
- image-providers.test.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `Covered Files & Symbols` - 31 edges
3. `drizzle-orm` - 31 edges
4. `Covered Files & Symbols` - 29 edges
5. `react` - 25 edges
6. `Button` - 25 edges
7. `db` - 25 edges
8. `companies` - 25 edges
9. `useCompany()` - 22 edges
10. `scripts` - 21 edges

## Surprising Connections (you probably didn't know these)
- ``src/client/App.tsx` (lines 1-347)` --references--> `DashboardContent()`  [INFERRED]
  graft/client-ui.md → src/client/App.tsx
- ``src/client/components/CompanySwitcher.tsx` (lines 1-134)` --references--> `CompanySwitcher()`  [INFERRED]
  graft/client-ui.md → src/client/components/CompanySwitcher.tsx
- ``src/client/components/PhotoBank.tsx` (lines 1-295)` --references--> `PhotoBank()`  [INFERRED]
  graft/client-ui.md → src/client/components/PhotoBank.tsx
- ``src/client/components/PublicationQueue.tsx` (lines 1-460)` --references--> `PublicationQueue()`  [INFERRED]
  graft/client-ui.md → src/client/components/PublicationQueue.tsx
- ``src/client/lib/utils.ts` (lines 1-7)` --references--> `cn()`  [INFERRED]
  graft/client-ui.md → src/client/lib/utils.ts

## Import Cycles
- None detected.

## Communities (26 total, 4 thin omitted)

### Community 0 - "DesignStudioTab.tsx"
Cohesion: 0.05
Nodes (111): `src/client/components/CompanyModal.tsx` (lines 1-348), `src/client/components/DesignStudioModal.tsx` (lines 1-657), `src/client/components/SlidePreview.tsx` (lines 1-157), `src/client/components/ui/dialog.tsx` (lines 1-96), `src/client/components/WeekPlanner.tsx` (lines 1-773), `src/client/context/CompanyContext.tsx` (lines 1-141), `src/client/types/ai.ts` (lines 1-27), `src/client/types/company.ts` (lines 1-19) (+103 more)

### Community 1 - "schema.ts"
Cohesion: 0.07
Nodes (65): `src/server/db/client.ts` (lines 1-105), `src/server/services/export/autosocial.ts` (lines 1-166), `src/server/services/export/canva.ts` (lines 1-122), drizzle-orm, zod, createDatabaseConnection(), createTestDb(), DatabaseConnection (+57 more)

### Community 2 - "factory.ts"
Cohesion: 0.10
Nodes (24): Covered Files & Symbols, `src/server/services/ai/claude.ts` (lines 1-105), `src/server/services/ai/factory.ts` (lines 1-76), `src/server/services/ai/gemini.ts` (lines 1-85), `src/server/services/ai/mlstudio.ts` (lines 1-99), `src/server/services/ai/openai.ts` (lines 1-102), `src/server/services/ai/provider.ts` (lines 1-169), AIProviderName (+16 more)

### Community 3 - "Covered Files & Symbols"
Cohesion: 0.05
Nodes (35): React 19 + Tailwind v4 + shadcn/ui Frontend Portal, Graft Knowledge Graph Index (`insta-auto-panel`), Subsystem Nodes, Database Layer (SQLite WAL + Drizzle Schema & Migrations), Domain Services & AI Provider Adapters, Automated Test Suite (Bun Unit/Integration + Playwright E2E), Covered Files & Symbols, `tests/e2e/ai-generation.spec.ts` (lines 1-191) (+27 more)

### Community 4 - "Covered Files & Symbols"
Cohesion: 0.06
Nodes (37): Covered Files & Symbols, `src/client/App.tsx` (lines 1-347), `src/client/components/AISettingsModal.tsx` (lines 1-468), `src/client/components/CanvaExportTab.tsx` (lines 1-321), `src/client/components/CompanySwitcher.tsx` (lines 1-134), `src/client/components/DesignStudioTab.tsx` (lines 1-1503), `src/client/components/PhotoBank.tsx` (lines 1-295), `src/client/components/PublicationQueue.tsx` (lines 1-460) (+29 more)

### Community 5 - "Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite"
Cohesion: 0.07
Nodes (28): 1. Visão Geral do Protocolo de Desenvolvimento, 2. Inventário e Aplicação das Skills Disponíveis em `~/Sandbox`, 3.1. Por Que Usar Git Worktrees / Workspace 'share' no AGY?, 3.2. Topologia de Branches do Projeto, 3.3. Regra de Ouro: Commits Atômicos Obrigatórios por Task Concluída, 3. Governança Multi-Branch com Git Worktrees e Commits Obrigatórios via AGY, 4.1. Direção de Arte & Inspeção Anti-Slop (`Leonxlnx/taste-skill` — `design-taste-frontend`), 4.2. Design Engineering, Micro-Interações e Stress-Testing (`emilkowalski/skills`) (+20 more)

### Community 6 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, archify, build, caveman, db:generate, db:migrate, db:sanitize, db:seed (+13 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, drizzle-orm@^0.45.4, lucide-react@^1.64.0, @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dropdown-menu@^2.2.1, @radix-ui/react-label@^2.1.17 (+10 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, jsx, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer@^10.6.2, drizzle-kit@^0.31.11, @playwright/test@^1.64.1, postcss@^8.5.32, tailwindcss@^4.3.3, @types/bun@^1.4.4, @types/react@^19.3.0 (+8 more)

### Community 10 - "Covered Files & Symbols"
Cohesion: 0.14
Nodes (15): Covered Files & Symbols, HTTP REST API Routes (Bun.serve Endpoints), `src/server/index.ts` (lines 1-134), `src/server/routes/ai.ts` (lines 1-268), `src/server/routes/companies.ts` (lines 1-90), `src/server/routes/design.ts` (lines 1-218), `src/server/routes/export.ts` (lines 1-92), `src/server/routes/photos.ts` (lines 1-131) (+7 more)

### Community 11 - "Social Panel PRO (insta-auto-panel)"
Cohesion: 0.13
Nodes (14): 1. Clonar o Repositório e Instalar Dependências, 1. Testes Unitários e de Integração (Bun Test), 2. Checagem Estática de Tipos (TypeScript), 2. Executar o Servidor de Desenvolvimento, 3. Build de Produção, 3. Testes Ponta a Ponta E2E (Playwright), 🚀 Arquitetura & Stack Tecnológica, 📁 Estrutura de Diretórios (+6 more)

### Community 12 - "graft.ts"
Cohesion: 0.10
Nodes (16): cavemanCompressMarkdown(), compressProseLine(), loadTelemetry(), recordTelemetry(), REPO_ROOT, TELEMETRY_PATH, TelemetryEntry, TelemetryStore (+8 more)

### Community 13 - "package.json"
Cohesion: 0.18
Nodes (10): @radix-ui/react-tabs@^1.2.1, tailwind-merge@^3.7.0, typescript@^7.0.2, name, private, type, version, @radix-ui/react-tabs (+2 more)

### Community 14 - "Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram"
Cohesion: 0.18
Nodes (11): 1. Visão Geral e Filosofia do Sistema, 2. O Que Está Explicitamente DESCARTADO, 4.1. Stack Tecnológica, 4.2. Banco de Dados Confiável: SQLite Nativo com Drizzle ORM, 4. O Novo Painel de Gestão: Arquitetura Técnica, 7. Schema Relacional do Banco de Dados Confiável (SQLite / Drizzle), 8. Arquitetura de Pastas Proposta para o Novo Projeto, 9. Próximos Passos de Decisão para Fechamento do Planejamento (+3 more)

### Community 15 - "Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente"
Cohesion: 0.20
Nodes (10): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Prowl project context (+2 more)

### Community 16 - "Social Panel PRO (`insta-auto-panel`) — Contrato Local de Engenharia Multiagente"
Cohesion: 0.20
Nodes (10): 1. Arquitetura e Stack Obrigatória, 2.1. Regra de Commits Atômicos Obrigatórios, 2.2. Regra de Multi-Branches com Subagentes (Git Worktrees), 2.3. Regra de Auto-Teste Web (Playwright Headless & Console Limpo), 2.4. Regra de Checkpoints Humanos Obrigatórios (HITL — Human-in-the-Loop), 2. Regras Operacionais Mandatórias do Repositório, 3. Herança das Regras do Sandbox (`~/Sandbox/.agents/rules/`), Prowl project context (+2 more)

### Community 18 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.5, @vitejs/plugin-react@^6.1.2, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 19 - "6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)"
Cohesion: 0.33
Nodes (6): 6.1. Gestão de Provedores na Interface do Painel, 6.2. Padrão Arquitetural: Adapter Pattern em TypeScript, 6.3. Garantia de Formato: Saídas Estruturadas (Structured Outputs) e Validação Zod, 6.4. Escopo de Chaves: Global vs. Específica por Empresa, 6.5. O Papel do Canva Pro (Criação Visual de Alto Padrão), 6. Camada de Inteligência Artificial Generativa Agnóstica (Multi-Provedor)

### Community 20 - "3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação"
Cohesion: 0.40
Nodes (5): 3.1. Arquitetura de Sessões Persistentes (`.profiles/`), 3.2. Máquina de Filas em Filesystem (`queue/`), 3.3. O Padrão Sidecar (`.description`), 3.4. Mecanismos de Disparo e Agendamento, 3. Pesquisa Profunda: `Katzca/AutoSocial` como Backbone de Automação

### Community 21 - "5. Módulos Funcionais e Modelo de Dados"
Cohesion: 0.40
Nodes (5): 5.1. Módulo 1: Gestão de Múltiplas Contas / Empresas (Multi-Tenant), 5.2. Módulo 2: Banco de Fotos Base Isolado por Empresa, 5.3.1. Regra de Negócio: Número de Slides como Variável Dinâmica (3 a 10), 5.3. Módulo 3: Selecionador Semanal de Assuntos (Segunda a Domingo), 5. Módulos Funcionais e Modelo de Dados

### Community 28 - "image-providers.test.ts"
Cohesion: 0.08
Nodes (34): Covered Files & Symbols, `src/server/db/migrate.ts` (lines 1-22), `src/server/db/sanitize.ts` (lines 1-78), `src/server/db/schema.ts` (lines 1-330), `src/server/db/seed.ts` (lines 1-59), `src/server/services/design/image-provider.ts` (lines 1-317), `src/server/services/design/template-engine.ts` (lines 1-322), DESIGN_TEMPLATES (+26 more)

## Knowledge Gaps
- **3 isolated node(s):** `prowl`, `RFC-4180`, `RFC-4180`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 237 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `drizzle-orm` connect `schema.ts` to `factory.ts`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **What connects `prowl`, `RFC-4180`, `RFC-4180` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DesignStudioTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05419580419580419 - nodes in this community are weakly interconnected._
- **Why does `Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite` connect `Plano de Engenharia e Fluxo de Desenvolvimento Autônomo com Vite` to `CLAUDE.md`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0749084249084249 - nodes in this community are weakly interconnected._
- **Why does `Badge()` connect `DesignStudioTab.tsx` to `Covered Files & Symbols`, `Documento de Requisitos e Planejamento: Sistema de Automação de Conteúdo no Instagram`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `factory.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09728506787330317 - nodes in this community are weakly interconnected._